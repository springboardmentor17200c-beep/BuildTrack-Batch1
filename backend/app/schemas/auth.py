from pydantic import BaseModel, EmailStr, Field, ConfigDict


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    full_name: str | None = Field(default=None, alias="fullName")
    first_name: str | None = Field(default=None, alias="firstName")
    last_name: str | None = Field(default=None, alias="lastName")
    username: str | None = None
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone_number: str = Field(alias="phoneNumber")
    company_id: int | None = Field(default=None, alias="companyId")
    company_name: str | None = Field(default=None, alias="companyName")
    role_id: int | None = Field(default=None, alias="roleId")
    role: str | None = None
    tax_id: str | None = Field(default=None, alias="taxId")
    employee_id: str | None = Field(default=None, alias="employeeId")
    skills_or_trade: str | None = Field(default=None, alias="skillsOrTrade")

    model_config = ConfigDict(populate_by_name=True)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None