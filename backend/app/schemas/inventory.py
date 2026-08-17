from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class InventoryCreate(BaseModel):
    company_id: int
    material_id: int
    available_quantity: Decimal
    minimum_stock_level: Optional[Decimal] = Decimal("0")
    storage_location: Optional[str] = None


class InventoryUpdate(BaseModel):
    available_quantity: Optional[Decimal] = None
    minimum_stock_level: Optional[Decimal] = None
    storage_location: Optional[str] = None


class InventoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    inventory_id: int
    company_id: int
    material_id: int
    available_quantity: Decimal
    minimum_stock_level: Optional[Decimal]
    storage_location: Optional[str]
    last_updated: datetime
