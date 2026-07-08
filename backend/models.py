from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class RoleEnum(str, Enum):
    Administrator = "Administrator"
    Project_Manager = "Project Manager"
    Site_Engineer = "Site Engineer"
    Contractor = "Contractor"
    Worker = "Worker"
    Client_Owner = "Client / Owner"


class RegistrationRequest(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str
    last_name: str
    phone_number: str
    role: RoleEnum

    # Role-specific optional fields
    company_name: Optional[str] = None
    tax_id: Optional[str] = None

    employee_id: Optional[str] = None
    skills_or_trade: Optional[str] = None


class UserProfile(BaseModel):
    user_id: str
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: str
    role: RoleEnum
    company_name: Optional[str] = None
    tax_id: Optional[str] = None
    employee_id: Optional[str] = None
    skills_or_trade: Optional[str] = None
    assigned_projects: List[str] = []
    is_active: bool = True
    created_at: str
