from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class EmployeeProfileBase(BaseModel):
    user_id: int
    workforce_category_id: int
    project_id: int
    employee_code: str = Field(..., min_length=2, max_length=30)
    joining_date: date
    experience_years: Decimal | None = None
    pay_rate: Decimal
    payment_type: str = Field(..., min_length=2, max_length=20)
    employment_status: str = "Active"


class EmployeeProfileCreate(EmployeeProfileBase):
    pass


class EmployeeProfileUpdate(BaseModel):
    workforce_category_id: int | None = None
    project_id: int | None = None
    employee_code: str | None = Field(default=None, min_length=2, max_length=30)
    joining_date: date | None = None
    experience_years: Decimal | None = None
    pay_rate: Decimal | None = None
    payment_type: str | None = Field(default=None, min_length=2, max_length=20)
    employment_status: str | None = None


class EmployeeProfileResponse(EmployeeProfileBase):
    model_config = ConfigDict(from_attributes=True)

    employee_id: int
    created_at: datetime
    updated_at: datetime
