from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.company import Company
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate, VendorResponse, VendorUpdate

router = APIRouter(
    prefix="/vendors",
    tags=["Vendors"],
)


@router.get(
    "",
    response_model=list[VendorResponse],
)
def get_vendors(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
            "Vendor",
        )
    ),
):
    """Retrieve all vendors."""
    return db.query(Vendor).all()


@router.get(
    "/{vendor_id}",
    response_model=VendorResponse,
)
def get_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
            "Vendor",
        )
    ),
):
    """Retrieve a single vendor by ID."""
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found.",
        )

    return vendor


@router.post(
    "",
    response_model=VendorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_vendor(
    payload: VendorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
        )
    ),
):
    """Create a new vendor/supplier."""
    company = db.query(Company).filter(
        Company.company_id == payload.company_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found.",
        )

    duplicate = db.query(Vendor).filter(
        Vendor.company_id == payload.company_id,
        Vendor.vendor_name == payload.vendor_name,
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vendor with this name already exists for this company.",
        )

    vendor = Vendor(**payload.model_dump())
    db.add(vendor)
    db.commit()
    db.refresh(vendor)

    return vendor


@router.put(
    "/{vendor_id}",
    response_model=VendorResponse,
)
def update_vendor(
    vendor_id: int,
    payload: VendorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
        )
    ),
):
    """Update an existing vendor."""
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(vendor, key, value)

    db.commit()
    db.refresh(vendor)

    return vendor


@router.delete(
    "/{vendor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    """Delete a vendor. Admin only."""
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found.",
        )

    db.delete(vendor)
    db.commit()
