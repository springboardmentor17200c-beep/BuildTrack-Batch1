from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class CompanyCreate(BaseModel):
    company_name: str
    company_code: str
    company_email: EmailStr
    company_phone: str
    address: str


class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    company_email: Optional[EmailStr] = None
    company_phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_id: int
    company_name: str
    company_code: str
    company_email: EmailStr
    company_phone: str
    address: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None