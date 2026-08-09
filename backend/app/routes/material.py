from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.company import Company
from app.models.material import Material
from app.schemas.material import MaterialCreate, MaterialResponse, MaterialUpdate

router = APIRouter(
    prefix="/materials",
    tags=["Materials"],
)


@router.get(
    "",
    response_model=list[MaterialResponse],
)
def get_materials(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    """Retrieve all materials."""
    return db.query(Material).all()


@router.get(
    "/{material_id}",
    response_model=MaterialResponse,
)
def get_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    """Retrieve a single material by ID."""
    material = db.query(Material).filter(Material.material_id == material_id).first()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found.",
        )

    return material


@router.post(
    "",
    response_model=MaterialResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_material(
    payload: MaterialCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
        )
    ),
):
    """Create a new material."""
    company = db.query(Company).filter(
        Company.company_id == payload.company_id
    ).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found.",
        )

    duplicate = db.query(Material).filter(
        Material.company_id == payload.company_id,
        Material.material_name == payload.material_name,
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A material with this name already exists for this company.",
        )

    material = Material(**payload.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)

    return material


@router.put(
    "/{material_id}",
    response_model=MaterialResponse,
)
def update_material(
    material_id: int,
    payload: MaterialUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
        )
    ),
):
    """Update an existing material."""
    material = db.query(Material).filter(Material.material_id == material_id).first()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(material, key, value)

    db.commit()
    db.refresh(material)

    return material


@router.delete(
    "/{material_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    """Delete a material. Admin only."""
    material = db.query(Material).filter(Material.material_id == material_id).first()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found.",
        )

    db.delete(material)
    db.commit()
