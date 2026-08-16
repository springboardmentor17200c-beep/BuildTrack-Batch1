from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class InventoryCreate(BaseModel):
    project_id: int
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
