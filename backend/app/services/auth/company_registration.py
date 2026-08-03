from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.roles import ADMIN
from app.core.security import (
    create_access_token,
    hash_password,
)
from app.models.company import Company
from app.models.role import Role
from app.models.user import User
from app.routes.serializers import serialize_user
from app.schemas.auth import (
    CompanyRegisterRequest,
    Token,
)
from app.utils.company_code import generate_company_code


def _get_admin_role(db: Session) -> Role:
    role = (
        db.query(Role)
        .filter(Role.role_name == ADMIN)
        .first()
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Administrator role not found.",
        )

    return role


def _validate_company_email(
    db: Session,
    email: str,
) -> None:

    exists = (
        db.query(Company)
        .filter(Company.company_email == email)
        .first()
    )

    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Company email already exists.",
        )


def _validate_admin_email(
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


def _generate_token(user: User) -> Token:

    access_token = create_access_token(
        data={
            "user_id": user.user_id,
            "email": user.email,
            "role_id": user.role_id,
        },
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
    )


def register_company(
    payload: CompanyRegisterRequest,
    db: Session,
):
    """
    Register a new company along with its Company Administrator.
    The Company Administrator is automatically approved.
    """

    _validate_company_email(
        db,
        payload.company_email,
    )

    _validate_admin_email(
        db,
        payload.admin_email,
    )

    admin_role = _get_admin_role(db)

    company = Company(
        company_name=payload.company_name,
        company_email=payload.company_email,
        company_phone=payload.company_phone,
        address=payload.address,
        company_code=generate_company_code(db),
    )

    db.add(company)
    db.flush()

    admin = User(
        company_id=company.company_id,
        role_id=admin_role.role_id,
        full_name=payload.admin_name,
        email=payload.admin_email,
        password_hash=hash_password(payload.password),
        phone_number=payload.admin_phone,
        is_active=True,
        registration_status="Approved",
        approved_at=datetime.now(timezone.utc),
        approved_by=None,
        rejected_reason=None,
    )

    db.add(admin)
    db.flush()

    db.commit()

    db.refresh(company)
    db.refresh(admin)

    return {
        "success": True,
        "message": "Company registered successfully.",
        "data": {
            "company_id": company.company_id,
            "company_code": company.company_code,
            "user": serialize_user(admin),
            "token": _generate_token(admin),
        },
    }
