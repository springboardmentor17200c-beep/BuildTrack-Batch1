from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.inventory import Inventory
from app.models.material import Material
from app.models.project import Project
from app.schemas.inventory import InventoryCreate, InventoryResponse, InventoryUpdate

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


@router.get(
    "/project/{project_id}",
    response_model=list[InventoryResponse],
)
def get_inventory_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Administrator",
            "Project Manager",
            "Site Engineer",
        )
    ),
):
    """Retrieve all inventory items for a specific project."""
    project = db.query(Project).filter(Project.project_id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    return db.query(Inventory).filter(Inventory.project_id == project_id).all()


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
    """Add a material stock entry to a project."""
    project = db.query(Project).filter(
        Project.project_id == payload.project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    material = db.query(Material).filter(
        Material.material_id == payload.material_id
    ).first()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found.",
        )

    duplicate = db.query(Inventory).filter(
        Inventory.project_id == payload.project_id,
        Inventory.material_id == payload.material_id,
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An inventory record for this material already exists in this project.",
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
