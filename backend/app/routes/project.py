from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_current_user
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
    ProjectEnrichedResponse,
)

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)

ALL_ROLES = ("Administrator", "Project Manager", "Site Engineer")


@router.get("/categories", summary="All project categories")
def get_categories(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return [{"category_id": c.category_id, "category_name": c.category_name}
            for c in db.query(ProjectCategory).all()]


@router.get("/statuses", summary="All project statuses")
def get_statuses(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return [{"status_id": s.status_id, "status_name": s.status_name}
            for s in db.query(ProjectStatus).all()]




def _enrich(project: Project) -> ProjectEnrichedResponse:
    """Convert ORM project row (with joined relationships) to enriched response."""
    return ProjectEnrichedResponse(
        project_id=project.project_id,
        project_name=project.project_name,
        description=project.description,
        location=project.location,
        category=project.category.category_name if project.category else "",
        status=project.status.status_name if project.status else "",
        manager=project.manager.full_name if project.manager else "",
        client=project.client.full_name if project.client else "",
        start_date=project.start_date,
        expected_end_date=project.expected_end_date,
        actual_end_date=project.actual_end_date,
    )


@router.get(
    "/enriched",
    response_model=List[ProjectEnrichedResponse],
    summary="All projects with denormalized names (for frontend)",
)
def get_projects_enriched(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    query = db.query(Project)
    if current_user.role and current_user.role.role_name == "Project Manager":
        query = query.filter(Project.manager_id == current_user.user_id)
    elif current_user.role and current_user.role.role_name in ("Client", "Client / Owner"):
        query = query.filter(Project.client_id == current_user.user_id)
    projects = query.all()
    return [_enrich(p) for p in projects]


@router.get(
    "/enriched/{project_id}",
    response_model=ProjectEnrichedResponse,
    summary="Single project with denormalized names",
)
def get_project_enriched(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return _enrich(project)


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

    client = db.query(User).filter(
        User.user_id == payload.client_id
    ).first()

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found.",
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
    current_user=Depends(require_roles("Administrator", "Project Manager")),
):
    query = db.query(Project)
    if current_user.role and current_user.role.role_name == "Project Manager":
        query = query.filter(Project.manager_id == current_user.user_id)
    return query.all()

@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: int,
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

@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_project(
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

    db.delete(project)
    db.commit()