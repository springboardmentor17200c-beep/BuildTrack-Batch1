from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class MaterialBase(BaseModel):
    material_category_id: int
    material_name: str = Field(..., min_length=2, max_length=150)
    unit_of_measure: str = Field(..., min_length=1, max_length=20)
    description: str | None = None


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
    material_category_id: int | None = None
    material_name: str | None = Field(default=None, min_length=2, max_length=150)
    unit_of_measure: str | None = Field(default=None, min_length=1, max_length=20)
    description: str | None = None


class MaterialResponse(MaterialBase):
    model_config = ConfigDict(from_attributes=True)

    material_id: int


class InventoryBase(BaseModel):
    company_id: int
    material_id: int
    available_quantity: Decimal = Decimal("0")
    minimum_stock_level: Decimal | None = None
    storage_location: str | None = None


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    available_quantity: Decimal | None = None
    minimum_stock_level: Decimal | None = None
    storage_location: str | None = None


class InventoryResponse(InventoryBase):
    model_config = ConfigDict(from_attributes=True)

    inventory_id: int
    last_updated: datetime


class InventoryTransactionBase(BaseModel):
    inventory_id: int
    project_id: int | None = None
    transaction_type: str
    quantity: Decimal
    remarks: str | None = None
    created_by: int


class InventoryTransactionCreate(InventoryTransactionBase):
    pass


class InventoryTransactionResponse(InventoryTransactionBase):
    model_config = ConfigDict(from_attributes=True)

    transaction_id: int
    transaction_date: datetime


class MaterialRequestBase(BaseModel):
    project_id: int
    requested_by: int
    material_id: int
    requested_quantity: Decimal
    request_status: str = "Pending"
    remarks: str | None = None


class MaterialRequestCreate(MaterialRequestBase):
    pass


class MaterialRequestUpdate(BaseModel):
    requested_quantity: Decimal | None = None
    request_status: str | None = None
    remarks: str | None = None


class MaterialRequestResponse(MaterialRequestBase):
    model_config = ConfigDict(from_attributes=True)

    request_id: int
    request_date: datetime
