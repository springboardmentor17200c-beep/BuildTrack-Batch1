from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.project import Project
from app.models.user import User
from app.models.workforce import EmployeeProfile, WorkforceCategory
from app.schemas.workforce import (
    EmployeeProfileCreate,
    EmployeeProfileResponse,
    EmployeeProfileUpdate,
)

router = APIRouter(
    prefix="/workforce",
    tags=["Workforce"],
)

EMPLOYMENT_STATUSES = {"Active", "Inactive", "On Leave"}


def _profile_or_404(employee_id: int, db: Session) -> EmployeeProfile:
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Employee profile not found.")

    return profile


def _validate_profile_refs(payload: EmployeeProfileCreate | EmployeeProfileUpdate, db: Session) -> None:
    if getattr(payload, "user_id", None) is not None:
        user = db.query(User).filter(User.user_id == payload.user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

    if getattr(payload, "workforce_category_id", None) is not None:
        category = (
            db.query(WorkforceCategory)
            .filter(WorkforceCategory.workforce_category_id == payload.workforce_category_id)
            .first()
        )

        if not category:
            raise HTTPException(status_code=404, detail="Workforce category not found.")

    if getattr(payload, "project_id", None) is not None:
        project = db.query(Project).filter(Project.project_id == payload.project_id).first()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")

    employment_status = getattr(payload, "employment_status", None)

    if employment_status is not None and employment_status not in EMPLOYMENT_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Employment status must be one of: {', '.join(sorted(EMPLOYMENT_STATUSES))}.",
        )


@router.get("/profiles", response_model=list[EmployeeProfileResponse])
def get_employee_profiles(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer", "Contractor")),
):
    query = db.query(EmployeeProfile)

    if current_user.role.role_name != "Administrator":
        query = query.join(Project).filter(Project.company_id == current_user.company_id)

    return query.order_by(EmployeeProfile.employee_code).all()


@router.post("/profiles", response_model=EmployeeProfileResponse, status_code=status.HTTP_201_CREATED)
def create_employee_profile(
    payload: EmployeeProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    _validate_profile_refs(payload, db)

    duplicate_user = (
        db.query(EmployeeProfile)
        .filter(EmployeeProfile.user_id == payload.user_id)
        .first()
    )

    if duplicate_user:
        raise HTTPException(status_code=409, detail="User already has an employee profile.")

    duplicate_code = (
        db.query(EmployeeProfile)
        .filter(EmployeeProfile.employee_code == payload.employee_code)
        .first()
    )

    if duplicate_code:
        raise HTTPException(status_code=409, detail="Employee code already exists.")

    profile = EmployeeProfile(**payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.put("/profiles/{employee_id}", response_model=EmployeeProfileResponse)
def update_employee_profile(
    employee_id: int,
    payload: EmployeeProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator", "Project Manager", "Site Engineer")),
):
    profile = _profile_or_404(employee_id, db)
    _validate_profile_refs(payload, db)

    if payload.employee_code is not None:
        duplicate_code = (
            db.query(EmployeeProfile)
            .filter(
                EmployeeProfile.employee_code == payload.employee_code,
                EmployeeProfile.employee_id != employee_id,
            )
            .first()
        )

        if duplicate_code:
            raise HTTPException(status_code=409, detail="Employee code already exists.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.delete("/profiles/{employee_id}")
def deactivate_employee_profile(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    profile = _profile_or_404(employee_id, db)
    profile.employment_status = "Inactive"
    db.commit()

    return {"message": "Employee profile deactivated successfully."}
