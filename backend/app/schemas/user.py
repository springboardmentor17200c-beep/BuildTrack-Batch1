from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone_number: str = Field(..., min_length=7, max_length=20)
    company_id: int | None = None
    role_id: int


class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    phone_number: str

    company_id: int | None

    role_id: int

    is_active: bool

    registration_status: str

    approved_by: int | None = None

    approved_at: datetime | None = None

    profile_image: str | None = None

    role_name: str | None = None

    company_name: str | None = None

    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class UserUpdate(BaseModel):
    full_name: str | None = None

    phone_number: str | None = None

    profile_image: str | None = None