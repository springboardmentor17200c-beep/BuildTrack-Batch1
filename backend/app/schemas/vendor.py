from typing import Optional, List

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer


class VendorCreate(BaseModel):
    company_id: int = Field(default=1, alias="companyId")
    vendor_name: str = Field(alias="vendorName")
    contact_person: Optional[str] = Field(default=None, alias="contactPerson")
    email: Optional[str] = None
    phone_number: Optional[str] = Field(default=None, alias="phone")
    address: Optional[str] = None
    is_active: Optional[bool] = Field(default=True, alias="isActive")
    materials: List[str] = Field(default=[])
    rating: float = Field(default=0.0)

    model_config = ConfigDict(populate_by_name=True)


class VendorUpdate(BaseModel):
    vendor_name: Optional[str] = Field(default=None, alias="vendorName")
    contact_person: Optional[str] = Field(default=None, alias="contactPerson")
    email: Optional[str] = None
    phone_number: Optional[str] = Field(default=None, alias="phone")
    address: Optional[str] = None
    is_active: Optional[bool] = Field(default=None, alias="isActive")

    model_config = ConfigDict(populate_by_name=True)


class VendorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    vendor_id: int = Field(alias="id")
    company_id: int = Field(alias="companyId")
    vendor_name: str = Field(alias="vendorName")
    contact_person: Optional[str] = Field(alias="contactPerson")
    email: Optional[str]
    phone_number: Optional[str] = Field(alias="phone")
    address: Optional[str]
    is_active: bool = Field(alias="isActive")
    materials: List[str] = Field(default=[])
    rating: float = Field(default=0.0)
    
    @field_serializer("vendor_id")
    def serialize_id(self, vendor_id: int) -> str:
        return str(vendor_id)
