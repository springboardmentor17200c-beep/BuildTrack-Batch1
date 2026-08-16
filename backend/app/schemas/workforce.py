from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


# ── Categories ──────────────────────────────────────
class WorkforceCategoryResponse(BaseModel):
    workforce_category_id: int
    category_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ── Employees ────────────────────────────────────────
class EmployeeCreate(BaseModel):
    user_id: Optional[int] = None
    full_name: Optional[str] = None
    workforce_category_id: Optional[int] = None
    category_name: Optional[str] = None
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    employee_code: str
    joining_date: date
    experience_years: Optional[float] = None
    pay_rate: float
    payment_type: str                  # Hourly | Daily | Monthly
    employment_status: str = "Active"


class EmployeeUpdate(BaseModel):
    employment_status: Optional[str] = None
    pay_rate: Optional[float] = None
    project_id: Optional[int] = None
    workforce_category_id: Optional[int] = None


class EmployeeResponse(BaseModel):
    employee_id: int
    employee_code: str
    full_name: str          # joined from users.full_name
    contact: Optional[str] = None       # joined from users.contact_number
    category_name: str      # joined from workforce_categories.category_name
    project_name: str       # joined from projects.project_name
    project_id: int
    joining_date: date
    experience_years: Optional[float] = None
    pay_rate: float
    payment_type: str
    employment_status: str

    class Config:
        from_attributes = True


# ── Attendance ───────────────────────────────────────
class AttendanceCreate(BaseModel):
    employee_id: int
    project_id: int
    attendance_date: date
    attendance_status: str             # Present | Absent | Half Day | On Leave
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    remarks: Optional[str] = None


class AttendanceResponse(BaseModel):
    attendance_id: int
    employee_id: int
    employee_name: str      # joined from employee -> user
    project_id: int
    attendance_date: date
    attendance_status: str
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    remarks: Optional[str] = None

    class Config:
        from_attributes = True


# ── Shifts ───────────────────────────────────────────
class ShiftCreate(BaseModel):
    employee_id: int
    project_id: int
    shift_type: str                    # Morning | Evening | Night
    shift_date: date
    start_time: str                    # e.g. "08:00 AM"
    end_time: str


class ShiftResponse(BaseModel):
    shift_id: int
    employee_id: int
    employee_name: str
    project_id: int
    project_name: str
    shift_type: str
    shift_date: date
    start_time: str
    end_time: str

    class Config:
        from_attributes = True
