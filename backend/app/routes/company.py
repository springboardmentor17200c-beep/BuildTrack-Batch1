from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role

from app.schemas.company_registration import CompanyRegistrationRequest

from app.utils.company_code import generate_company_code
from app.core.security import hash_password
from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.company import Company
from app.schemas.company import (
    CompanyResponse,
    CompanyUpdate,
)

router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
def register_company(
    payload: CompanyRegistrationRequest,
    db: Session = Depends(get_db),
):
    # Check if company email already exists
    existing_company = (
        db.query(Company)
        .filter(Company.company_email == payload.company_email)
        .first()
    )

    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Company email already exists.",
        )

    # Check if administrator email already exists
    existing_admin = (
        db.query(User)
        .filter(User.email == payload.admin_email)
        .first()
    )

    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Administrator email already exists.",
        )

    # Find Administrator role
    admin_role = (
        db.query(Role)
        .filter(Role.role_name == "Administrator")
        .first()
    )

    if not admin_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Administrator role not found.",
        )

    # Create company
    company = Company(
        company_name=payload.company_name,
        company_code=generate_company_code(db),
        company_email=payload.company_email,
        company_phone=payload.company_phone,
        address=payload.address,
    )

    db.add(company)

    # Flush so company_id is generated without committing
    db.flush()

    # Create administrator user
    admin = User(
        full_name=payload.admin_name,
        email=payload.admin_email,
        phone_number=payload.admin_phone,
        password_hash=hash_password(payload.password),
        company_id=company.company_id,
        role_id=admin_role.role_id,
    )

    db.add(admin)

    # Commit both together
    db.commit()

    db.refresh(company)
    db.refresh(admin)

    return {
        "message": "Company registered successfully.",
        "company_name": company.company_name,
        "company_code": company.company_code,
        "administrator": admin.full_name,
    }

@router.get(
    "",
    response_model=list[CompanyResponse],
)
def get_companies(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    return (
        db.query(Company)
        .filter(Company.is_active == True)
        .all()
    )


@router.get(
    "/{company_id}",
    response_model=CompanyResponse,
)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    company = (
        db.query(Company)
        .filter(
            Company.company_id == company_id,
            Company.is_active == True,
        )
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found.",
        )

    return company


@router.put(
    "/{company_id}",
    response_model=CompanyResponse,
)
def update_company(
    company_id: int,
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    company = (
        db.query(Company)
        .filter(
            Company.company_id == company_id,
            Company.is_active == True,
        )
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found.",
        )

    if payload.company_email is not None:
        existing_email = (
            db.query(Company)
            .filter(
                Company.company_email == payload.company_email,
                Company.company_id != company_id,
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Company email already exists.",
            )

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)

    return company


@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    company = (
        db.query(Company)
        .filter(
            Company.company_id == company_id,
            Company.is_active == True,
        )
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found.",
        )

    company.is_active = False

    db.commit()

    return {
        "message": "Company deactivated successfully."
    }