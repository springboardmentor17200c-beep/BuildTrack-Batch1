from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.procurement_request import ProcurementRequest
from app.models.project import Project
from app.models.user import User
from app.schemas.procurement import (
    ProcurementCreate,
    ProcurementResponse,
    ProcurementUpdate,
)

router = APIRouter(
    prefix="/procurements",
    tags=["Procurement Requests"],
)

ALLOWED_STATUSES = {"Pending", "Approved", "Rejected", "In Progress", "Completed"}


@router.get(
    "",
    response_model=list[ProcurementResponse],
)
def get_procurements(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
            "Contractor",
        )
    ),
):
    """Retrieve all procurement requests."""
    return db.query(ProcurementRequest).all()


@router.get(
    "/{procurement_id}",
    response_model=ProcurementResponse,
)
def get_procurement(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
            "Contractor",
        )
    ),
):
    """Retrieve a single procurement request by ID."""
    record = db.query(ProcurementRequest).filter(
        ProcurementRequest.procurement_request_id == procurement_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procurement request not found.",
        )

    return record


@router.post(
    "",
    response_model=ProcurementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_procurement(
    payload: ProcurementCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
            "Contractor",
        )
    ),
):
    """Create a new procurement request."""
    project = db.query(Project).filter(
        Project.project_id == payload.project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    requester = db.query(User).filter(
        User.user_id == payload.requested_by
    ).first()

    if not requester:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requesting user not found.",
        )

    if payload.request_status and payload.request_status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Allowed values: {', '.join(sorted(ALLOWED_STATUSES))}",
        )

    record = ProcurementRequest(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@router.put(
    "/{procurement_id}",
    response_model=ProcurementResponse,
)
def update_procurement(
    procurement_id: int,
    payload: ProcurementUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
        )
    ),
):
    """Update an existing procurement request."""
    record = db.query(ProcurementRequest).filter(
        ProcurementRequest.procurement_request_id == procurement_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procurement request not found.",
        )

    if payload.request_status and payload.request_status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Allowed values: {', '.join(sorted(ALLOWED_STATUSES))}",
        )

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)

    return record


@router.delete(
    "/{procurement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_procurement(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
        )
    ),
):
    """Delete a procurement request. Admin and Project Manager only."""
    record = db.query(ProcurementRequest).filter(
        ProcurementRequest.procurement_request_id == procurement_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procurement request not found.",
        )

    db.delete(record)
    db.commit()
