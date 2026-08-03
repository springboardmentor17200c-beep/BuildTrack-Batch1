from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.roles import (
    PROJECT_MANAGER,
    SITE_ENGINEER,
    CONTRACTOR,
    WORKER,
)
from app.core.security import hash_password
from app.models.company import Company
from app.models.role import Role
from app.models.user import User
from app.schemas.auth import EmployeeRegisterRequest


ALLOWED_EMPLOYEE_ROLES = {
    PROJECT_MANAGER,
    SITE_ENGINEER,
    CONTRACTOR,
    WORKER,
}


def _get_company(
    db: Session,
    company_code: str,
) -> Company:

    company = (
        db.query(Company)
        .filter(
            Company.company_code == company_code,
            Company.is_active.is_(True),
        )
        .first()
    )

    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid company code.",
        )

    return company


def _get_role(
    db: Session,
    role_id: int,
) -> Role:

    role = (
        db.query(Role)
        .filter(Role.role_id == role_id)
        .first()
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found.",
        )

    if role.role_name not in ALLOWED_EMPLOYEE_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot register using this role.",
        )

    return role


def _validate_email(
    db: Session,
    email: str,
) -> None:

    exists = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )


def register_employee(
    payload: EmployeeRegisterRequest,
    db: Session,
):

    company = _get_company(
        db,
        payload.company_code,
    )

    role = _get_role(
        db,
        payload.role_id,
    )

    _validate_email(
        db,
        payload.email,
    )

    employee = User(
        company_id=company.company_id,
        role_id=role.role_id,
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone_number=payload.phone_number,
        is_active=False,
        registration_status="Pending",
        approved_by=None,
        approved_at=None,
        rejected_reason=None,
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return {
        "success": True,
        "message": "Registration submitted successfully. Please wait for company administrator approval.",
        "data": {
            "user_id": employee.user_id,
            "registration_status": employee.registration_status,
        },
    }