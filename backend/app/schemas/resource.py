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
