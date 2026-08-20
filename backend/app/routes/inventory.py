from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.permissions import require_roles
from app.db.database import get_db
from app.models.inventory import Inventory, Material, MaterialCategory
from app.models.project import Project
from app.schemas.inventory import (
    InventoryCreate, InventoryResponse, InventoryUpdate,
    InventoryEnrichedResponse, MaterialResponse,
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)

ALL_ROLES = ("Administrator", "Project Manager", "Site Engineer", "Contractor")
MANAGE_ROLES = ("Administrator", "Project Manager")


def _enrich_inventory(inv: Inventory) -> InventoryEnrichedResponse:
    mat = inv.material
    cat_name = mat.category.category_name if mat and mat.category else ""
    return InventoryEnrichedResponse(
        inventory_id=inv.inventory_id,
        material_id=inv.material_id,
        material_name=mat.material_name if mat else "",
        category=cat_name,
        unit_of_measure=mat.unit if mat else "",
        available_quantity=float(inv.available_quantity),
        minimum_stock_level=float(inv.minimum_stock_level) if inv.minimum_stock_level else 0.0,
        storage_location=inv.storage_location,
        last_updated=inv.last_updated.date().isoformat() if inv.last_updated else None,
    )


def _enrich_material(mat: Material) -> MaterialResponse:
    cat_name = mat.category.category_name if mat.category else ""
    return MaterialResponse(
        material_id=mat.material_id,
        material_name=mat.material_name,
        category=cat_name,
        unit_of_measure=mat.unit,
        description=mat.description,
        is_active=mat.is_active,
    )


# ── Enriched endpoints (used by frontend) ───────────────────────────────
@router.get("/enriched", response_model=List[InventoryEnrichedResponse])
def get_inventory_enriched(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    """All inventory records with material/category names resolved."""
    records = db.query(Inventory).all()
    return [_enrich_inventory(r) for r in records]


@router.get("/materials/enriched", response_model=List[MaterialResponse])
def get_materials_enriched(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    """Material catalog with category names resolved."""
    materials = db.query(Material).filter(Material.is_active == True).all()
    return [_enrich_material(m) for m in materials]


@router.post("", response_model=InventoryEnrichedResponse, status_code=status.HTTP_201_CREATED)
def create_inventory(
    payload: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*MANAGE_ROLES)),
):
    """Create a new inventory record."""
    data = payload.model_dump()
    
    # Map pydantic field names to model field names
    data['available_quantity'] = data.pop('quantity_available')
    data['minimum_stock_level'] = data.pop('minimum_quantity')
    data['storage_location'] = data.pop('location_note')

    inv = Inventory(**data)
    from datetime import datetime
    inv.last_updated = datetime.utcnow()
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return _enrich_inventory(inv)


# ── Stock update (used for approve-request / adjustments) ────────────────
@router.patch("/enriched/{inventory_id}", response_model=InventoryEnrichedResponse)
def update_inventory_enriched(
    inventory_id: int,
    payload: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*MANAGE_ROLES)),
):
    inv = db.query(Inventory).filter(Inventory.inventory_id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        # schema uses quantity_available/minimum_quantity, model uses available_quantity/minimum_stock_level
        if key == "quantity_available":
            inv.available_quantity = value
        elif key == "minimum_quantity":
            inv.minimum_stock_level = value
        elif key == "location_note":
            inv.storage_location = value
    from datetime import datetime
    inv.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(inv)
    return _enrich_inventory(inv)


# ── Original endpoints (kept intact) ────────────────────────────────────
@router.get("/project/{project_id}", response_model=list[InventoryResponse])
def get_inventory_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return db.query(Inventory).filter(Inventory.company_id == project.company_id).all()


@router.get("/{inventory_id}", response_model=InventoryResponse)
def get_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    inv = db.query(Inventory).filter(Inventory.inventory_id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found.")
    return inv


@router.post("", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_inventory(
    payload: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*MANAGE_ROLES)),
):
    project = db.query(Project).filter(Project.project_id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    material = db.query(Material).filter(Material.material_id == payload.material_id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found.")
    duplicate = db.query(Inventory).filter(
        Inventory.company_id == project.company_id,
        Inventory.material_id == payload.material_id,
    ).first()
    if duplicate:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Inventory record already exists for this material.")
    inv = Inventory(
        company_id=project.company_id,
        material_id=payload.material_id,
        available_quantity=payload.quantity_available,
        minimum_stock_level=payload.minimum_quantity,
        storage_location=payload.location_note,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


@router.put("/{inventory_id}", response_model=InventoryResponse)
def update_inventory(
    inventory_id: int,
    payload: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(*ALL_ROLES)),
):
    inv = db.query(Inventory).filter(Inventory.inventory_id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        if key == "quantity_available":
            inv.available_quantity = value
        elif key == "minimum_quantity":
            inv.minimum_stock_level = value
        elif key == "location_note":
            inv.storage_location = value
    from datetime import datetime
    inv.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(inv)
    return inv


@router.delete("/{inventory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Administrator")),
):
    inv = db.query(Inventory).filter(Inventory.inventory_id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found.")
    db.delete(inv)
    db.commit()
