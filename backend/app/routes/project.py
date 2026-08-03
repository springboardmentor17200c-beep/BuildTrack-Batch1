from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.company import Company
from app.models.project import Project
from app.models.project_category import ProjectCategory
from app.models.project_status import ProjectStatus
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)

READ_PROJECT_ROLES = (
    "Administrator",
    "Project Manager",
    "Site Engineer",
    "Contractor",
    "Client",
)

@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
        )
    ),
):
    company = db.query(Company).filter(
        Company.company_id == payload.company_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found.",
        )

    manager = db.query(User).filter(
        User.user_id == payload.manager_id
    ).first()

    if not manager:
        raise HTTPException(
            status_code=404,
            detail="Project manager not found.",
        )

    if manager.company_id != payload.company_id:
        raise HTTPException(
            status_code=400,
            detail="Project manager must belong to the selected company.",
        )

    client = db.query(User).filter(
        User.user_id == payload.client_id
    ).first()

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found.",
        )

    if client.company_id != payload.company_id:
        raise HTTPException(
            status_code=400,
            detail="Client must belong to the selected company.",
        )

    category = db.query(ProjectCategory).filter(
        ProjectCategory.category_id == payload.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Project category not found.",
        )

    status_obj = db.query(ProjectStatus).filter(
        ProjectStatus.status_id == payload.status_id
    ).first()

    if not status_obj:
        raise HTTPException(
            status_code=404,
            detail="Project status not found.",
        )

    duplicate = db.query(Project).filter(
        Project.company_id == payload.company_id,
        Project.project_name == payload.project_name,
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Project already exists for this company.",
        )

    if payload.expected_end_date < payload.start_date:
        raise HTTPException(
            status_code=400,
            detail="Expected end date cannot be before start date.",
        )

    project = Project(**payload.model_dump())

    db.add(project)
    db.commit()
    db.refresh(project)

    return project

@router.get(
    "",
    response_model=list[ProjectResponse],
)
def get_projects(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*READ_PROJECT_ROLES)),
):
    query = db.query(Project)

    if current_user.role.role_name != "Administrator":
        query = query.filter(Project.company_id == current_user.company_id)

    return query.order_by(Project.created_at.desc()).all()

@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*READ_PROJECT_ROLES)),
):
    project = db.query(Project).filter(
        Project.project_id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    if current_user.role.role_name != "Administrator" and project.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project.",
        )

    return project

@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager")),
):
    project = db.query(Project).filter(
        Project.project_id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    if payload.manager_id is not None:
        manager = db.query(User).filter(User.user_id == payload.manager_id).first()

        if not manager:
            raise HTTPException(status_code=404, detail="Project manager not found.")

        if manager.company_id != project.company_id:
            raise HTTPException(status_code=400, detail="Project manager must belong to this project company.")

    if payload.client_id is not None:
        client = db.query(User).filter(User.user_id == payload.client_id).first()

        if not client:
            raise HTTPException(status_code=404, detail="Client not found.")

        if client.company_id != project.company_id:
            raise HTTPException(status_code=400, detail="Client must belong to this project company.")

    new_start = payload.start_date or project.start_date
    new_end = payload.expected_end_date or project.expected_end_date

    if new_end < new_start:
        raise HTTPException(
        status_code=400,
        detail="Expected end date cannot be before start date.",
    )

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)

    return project

@router.delete("/{project_id}")
def close_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    project = db.query(Project).filter(
        Project.project_id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    closed_status = (
        db.query(ProjectStatus)
        .filter(ProjectStatus.status_name.in_(["Closed", "Completed"]))
        .order_by(ProjectStatus.status_name.desc())
        .first()
    )

    if not closed_status:
        raise HTTPException(
            status_code=500,
            detail="Closed project status is not configured.",
        )

    project.status_id = closed_status.status_id
    project.actual_end_date = project.actual_end_date or date.today()
    db.commit()

    return {
        "message": "Project closed successfully.",
    }
