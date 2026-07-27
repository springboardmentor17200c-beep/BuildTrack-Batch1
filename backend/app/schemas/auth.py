from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone_number: str
    company_id: int | None = None
    role_id: int


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None


class RegistrationRequest(BaseModel):
    username: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str
    last_name: str
    phone_number: str
    role: str
    company_name: str | None = None
    tax_id: str | None = None
    employee_id: str | None = None
    skills_or_trade: str | None = None


class UserProfileResponse(BaseModel):
    user_id: int
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: str
    role: str
    company_name: str | None = None
    tax_id: str | None = None
    employee_id: str | None = None
    skills_or_trade: str | None = None
    assigned_projects: list[str] = []
    is_active: bool
    created_at: datetime | None = None

    model_config = {
        "from_attributes": True
    }


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp_code: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    verification_token: str
    new_password: str = Field(..., min_length=6)


class SuccessResponse(BaseModel):
    message: str


class OtpVerificationResponse(BaseModel):
    verification_token: str


class ResetPasswordResponse(BaseModel):
    message: str
