from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.company import Company
from app.schemas.auth import CompanyRegisterRequest
from app.schemas.company import (
    CompanyResponse,
    CompanyUpdate,
)
from app.schemas.response import ApiResponse
from app.services.auth import register_company as register_company_service

router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)

@router.post(
    "/register",
    response_model=ApiResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_company(
    payload: CompanyRegisterRequest,
    db: Session = Depends(get_db),
):
    return register_company_service(payload, db)

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
