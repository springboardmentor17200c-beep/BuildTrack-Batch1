from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class VendorCreate(BaseModel):
    company_id: int
    vendor_name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = True


class VendorUpdate(BaseModel):
    vendor_name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class VendorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vendor_id: int
    company_id: int
    vendor_name: str
    contact_person: Optional[str]
    email: Optional[str]
    phone_number: Optional[str]
    address: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
