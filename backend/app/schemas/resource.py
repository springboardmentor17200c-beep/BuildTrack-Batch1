from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ResourceBase(BaseModel):
    company_id: int
    resource_category_id: int
    resource_name: str = Field(..., min_length=2, max_length=100)
    manufacturer: str | None = None
    model_number: str | None = None
    serial_number: str | None = None
    purchase_date: date | None = None
    current_status: str = "Available"


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    resource_category_id: int | None = None
    resource_name: str | None = Field(default=None, min_length=2, max_length=100)
    manufacturer: str | None = None
    model_number: str | None = None
    serial_number: str | None = None
    purchase_date: date | None = None
    current_status: str | None = None


class ResourceResponse(ResourceBase):
    model_config = ConfigDict(from_attributes=True)

    resource_id: int
    created_at: datetime
    updated_at: datetime


class ResourceAllocationBase(BaseModel):
    resource_id: int
    project_id: int
    allocated_by: int
    allocation_date: date
    expected_return_date: date | None = None
    actual_return_date: date | None = None
    allocation_status: str = "Allocated"
    remarks: str | None = None


class ResourceAllocationCreate(ResourceAllocationBase):
    pass


class ResourceAllocationUpdate(BaseModel):
    expected_return_date: date | None = None
    actual_return_date: date | None = None
    allocation_status: str | None = None
    remarks: str | None = None


class ResourceAllocationResponse(ResourceAllocationBase):
    model_config = ConfigDict(from_attributes=True)

    allocation_id: int
    created_at: datetime


class MaintenanceRecordBase(BaseModel):
    resource_id: int
    maintenance_type: str = Field(..., min_length=2, max_length=100)
    maintenance_date: date
    next_maintenance_date: date | None = None
    maintenance_cost: Decimal | None = None
    serviced_by: str | None = None
    remarks: str | None = None


class MaintenanceRecordCreate(MaintenanceRecordBase):
    pass


class MaintenanceRecordUpdate(BaseModel):
    maintenance_type: str | None = Field(default=None, min_length=2, max_length=100)
    maintenance_date: date | None = None
    next_maintenance_date: date | None = None
    maintenance_cost: Decimal | None = None
    serviced_by: str | None = None
    remarks: str | None = None


class MaintenanceRecordResponse(MaintenanceRecordBase):
    model_config = ConfigDict(from_attributes=True)

    maintenance_id: int
    created_at: datetime
