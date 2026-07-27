from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db

from app.models.project import Project
from app.models.project_milestone import ProjectMilestone
from datetime import date
from app.schemas.project_milestone import (
    ProjectMilestoneCreate,
    ProjectMilestoneUpdate,
    ProjectMilestoneResponse,
)

router = APIRouter(
    prefix="/milestones",
    tags=["Project Milestones"],
)

VALID_STATUSES = {
    "Pending",
    "In Progress",
    "Completed",
}

@router.post(
    "",
    response_model=ProjectMilestoneResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_milestone(
    payload: ProjectMilestoneCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    project = db.query(Project).filter(
        Project.project_id == payload.project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    duplicate = db.query(ProjectMilestone).filter(
        ProjectMilestone.project_id == payload.project_id,
        ProjectMilestone.milestone_name == payload.milestone_name,
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Milestone already exists for this project.",
        )

    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of: {', '.join(VALID_STATUSES)}",
        )

    milestone = ProjectMilestone(**payload.model_dump())

    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    return milestone

@router.get(
    "",
    response_model=list[ProjectMilestoneResponse],
)
def get_milestones(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    return db.query(ProjectMilestone).all()

@router.get(
    "/{milestone_id}",
    response_model=ProjectMilestoneResponse,
)
def get_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    milestone = db.query(ProjectMilestone).filter(
        ProjectMilestone.milestone_id == milestone_id
    ).first()

    if not milestone:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found.",
        )

    return milestone

@router.put(
    "/{milestone_id}",
    response_model=ProjectMilestoneResponse,
)
def update_milestone(
    milestone_id: int,
    payload: ProjectMilestoneUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    milestone = db.query(ProjectMilestone).filter(
        ProjectMilestone.milestone_id == milestone_id
    ).first()

    if not milestone:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    status = update_data.get("status")

    if status == "Completed":
        if update_data.get("completion_date") is None:
            update_data["completion_date"] = date.today()

    elif status in {"Pending", "In Progress"}:
        update_data["completion_date"] = None

    for key, value in update_data.items():
        setattr(milestone, key, value)

    db.commit()
    db.refresh(milestone)

    return milestone

@router.delete(
    "/{milestone_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Administrator")
    ),
):
    milestone = db.query(ProjectMilestone).filter(
        ProjectMilestone.milestone_id == milestone_id
    ).first()

    if not milestone:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found.",
        )

    db.delete(milestone)
    db.commit()