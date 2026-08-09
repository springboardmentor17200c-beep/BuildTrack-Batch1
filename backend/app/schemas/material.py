from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MaterialCreate(BaseModel):
    company_id: int
    material_name: str
    description: Optional[str] = None
    unit: str
    is_active: Optional[bool] = True


class MaterialUpdate(BaseModel):
    material_name: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    is_active: Optional[bool] = None


class MaterialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    material_id: int
    company_id: int
    material_name: str
    description: Optional[str]
    unit: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
