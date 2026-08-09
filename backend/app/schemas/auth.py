from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    full_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone_number: str
    company_id: int | None = None
    company_name: str | None = None
    role_id: int | None = None
    role: str | None = None
    tax_id: str | None = None
    employee_id: str | None = None
    skills_or_trade: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None