from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class InventoryCreate(BaseModel):
    company_id: int
    material_id: int
    quantity_available: Decimal
    minimum_quantity: Optional[Decimal] = Decimal("0")
    location_note: Optional[str] = None


class InventoryUpdate(BaseModel):
    quantity_available: Optional[Decimal] = None
    minimum_quantity: Optional[Decimal] = None
    location_note: Optional[str] = None


class InventoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    inventory_id: int
    project_id: int
    material_id: int
    quantity_available: Decimal
    minimum_quantity: Decimal
    location_note: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]


class InventoryEnrichedResponse(BaseModel):
    """Flat response with denormalized names for the frontend dashboard."""
    inventory_id: int
    material_id: int
    material_name: str
    category: str               # material_categories.category_name
    unit_of_measure: str        # materials.unit
    available_quantity: float
    minimum_stock_level: float
    storage_location: Optional[str]
    last_updated: Optional[str]  # ISO date string


class MaterialResponse(BaseModel):
    """Flat material catalog response for the frontend."""
    material_id: int
    material_name: str
    category: str
    unit_of_measure: str
    description: Optional[str]
    is_active: bool
