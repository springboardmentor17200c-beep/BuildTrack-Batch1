from pydantic import BaseModel, EmailStr, Field


# ------------------------
# Login
# ------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ------------------------
# Company Registration
# ------------------------

class CompanyRegisterRequest(BaseModel):
    company_name: str = Field(..., min_length=3, max_length=150)
    company_email: EmailStr
    company_phone: str = Field(..., min_length=10, max_length=20)
    address: str = Field(..., min_length=5)

    admin_name: str = Field(..., min_length=3, max_length=100)
    admin_email: EmailStr
    admin_phone: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=8)


# ------------------------
# Employee Registration
# ------------------------

class EmployeeRegisterRequest(BaseModel):
    company_code: str

    full_name: str = Field(..., min_length=3, max_length=100)

    email: EmailStr

    phone_number: str = Field(..., min_length=10, max_length=20)

    role_id: int

    password: str = Field(..., min_length=8)


# ------------------------
# Password Change
# ------------------------

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# ------------------------
# Employee Approval
# ------------------------

class ApprovalRequest(BaseModel):
    user_id: int


class RejectionRequest(BaseModel):
    reason: str = Field(..., min_length=3)


# ------------------------
# JWT
# ------------------------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None

# ------------------------
# Password Reset (OTP)
# ------------------------

class RequestOtpRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class VerifyOtpResponse(BaseModel):
    verification_token: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    verification_token: str
    new_password: str = Field(..., min_length=8)