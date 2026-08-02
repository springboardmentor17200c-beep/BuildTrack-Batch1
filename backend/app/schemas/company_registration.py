from pydantic import BaseModel, EmailStr, Field


class CompanyRegistrationRequest(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=150)

    company_email: EmailStr

    company_phone: str = Field(..., min_length=10, max_length=20)

    address: str = Field(..., min_length=5)

    admin_name: str = Field(..., min_length=2)

    admin_email: EmailStr

    admin_phone: str = Field(..., min_length=10, max_length=20)

    password: str = Field(..., min_length=8)