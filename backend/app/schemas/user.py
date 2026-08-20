from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    phone_number: str | None = None
    company_id: int | None = None
    role_id: int | None = None
    role: str | None = None
    is_active: bool | None = True
    created_at: datetime | None = None

    model_config = {
        "from_attributes": True
    }


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone_number: str | None = None
    profile_image: str | None = None