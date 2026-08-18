from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

# Resource Category Schemas
class ResourceCategoryBase(BaseModel):
    category_name: str
    description: Optional[str] = None

class ResourceCategoryCreate(ResourceCategoryBase):
    pass

class ResourceCategoryUpdate(ResourceCategoryBase):
    pass

class ResourceCategoryResponse(ResourceCategoryBase):
    resource_category_id: int

    class Config:
        from_attributes = True

# Resource Schemas
class ResourceBase(BaseModel):
    company_id: int
    resource_category_id: int
    resource_name: str
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    current_status: str = "Available"

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    resource_category_id: Optional[int] = None
    resource_name: Optional[str] = None
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    current_status: Optional[str] = None

class ResourceResponse(ResourceBase):
    resource_id: int
    created_at: datetime
    updated_at: datetime
    category: ResourceCategoryResponse

    class Config:
        from_attributes = True

# Resource Allocation Schemas
class ResourceAllocationBase(BaseModel):
    resource_id: int
    project_id: int
    allocated_by_id: int
    allocation_date: date
    expected_return_date: date
    actual_return_date: Optional[date] = None
    allocation_status: str = "Allocated"
    remarks: Optional[str] = None

class ResourceAllocationCreate(ResourceAllocationBase):
    pass

class ResourceAllocationUpdate(BaseModel):
    expected_return_date: Optional[date] = None
    actual_return_date: Optional[date] = None
    allocation_status: Optional[str] = None
    remarks: Optional[str] = None

class ResourceAllocationResponse(ResourceAllocationBase):
    allocation_id: int
    resource_name: Optional[str] = None
    category_name: Optional[str] = None
    project_name: Optional[str] = None
    allocated_by_name: Optional[str] = None

    class Config:
        from_attributes = True

# Maintenance Record Schemas
class MaintenanceRecordBase(BaseModel):
    resource_id: int
    maintenance_type: str
    maintenance_date: date
    next_maintenance_date: Optional[date] = None
    maintenance_cost: float
    serviced_by: str
    remarks: Optional[str] = None

class MaintenanceRecordCreate(MaintenanceRecordBase):
    pass

class MaintenanceRecordUpdate(BaseModel):
    maintenance_type: Optional[str] = None
    maintenance_date: Optional[date] = None
    next_maintenance_date: Optional[date] = None
    maintenance_cost: Optional[float] = None
    serviced_by: Optional[str] = None
    remarks: Optional[str] = None

class MaintenanceRecordResponse(MaintenanceRecordBase):
    maintenance_id: int
    resource_name: Optional[str] = None
    category_name: Optional[str] = None

    class Config:
        from_attributes = True
