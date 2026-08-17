from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.inventory import Inventory, Material
from app.schemas.inventory import InventoryCreate, InventoryResponse, InventoryUpdate

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


@router.get(
    "/company/{company_id}",
    response_model=list[InventoryResponse],
)
def get_inventory_by_company(
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
    """Retrieve all inventory items for a specific company."""
    # Ensure user belongs to the company (assuming current_user has company_id)
    if current_user.company_id != company_id and current_user.role.role_name != "Administrator":
        raise HTTPException(status_code=403, detail="Not authorized to access this company's inventory")
        
    return db.query(Inventory).filter(Inventory.company_id == company_id).all()


@router.get(
    "/{inventory_id}",
    response_model=InventoryResponse,
)
def get_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    """Retrieve a single inventory record by ID."""
    inventory = db.query(Inventory).filter(
        Inventory.inventory_id == inventory_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found.",
        )

    return inventory


@router.post(
    "",
    response_model=InventoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inventory(
    payload: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
        )
    ),
):
    """Add a material stock entry to a company."""
    if current_user.company_id != payload.company_id and current_user.role.role_name != "Administrator":
        raise HTTPException(status_code=403, detail="Not authorized to add inventory for this company")

    material = db.query(Material).filter(
        Material.material_id == payload.material_id
    ).first()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found.",
        )

    duplicate = db.query(Inventory).filter(
        Inventory.company_id == payload.company_id,
        Inventory.material_id == payload.material_id,
        Inventory.storage_location == payload.storage_location
    ).first()

    if duplicate:
        # Instead of failing, we should ideally add to stock, but for now we enforce one record per location
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An inventory record for this material at this location already exists.",
        )

    inventory = Inventory(**payload.model_dump())
    db.add(inventory)
    db.commit()
    db.refresh(inventory)

    return inventory


@router.put(
    "/{inventory_id}",
    response_model=InventoryResponse,
)
def update_inventory(
    inventory_id: int,
    payload: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    """Update stock quantity or details of an inventory record."""
    inventory = db.query(Inventory).filter(
        Inventory.inventory_id == inventory_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(inventory, key, value)

    db.commit()
    db.refresh(inventory)

    return inventory


@router.delete(
    "/{inventory_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    """Delete an inventory record. Admin only."""
    inventory = db.query(Inventory).filter(
        Inventory.inventory_id == inventory_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found.",
        )

    db.delete(inventory)
    db.commit()
