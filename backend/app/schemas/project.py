from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):
    company_id: int
    manager_id: int
    client_id: int
    category_id: int
    status_id: int
    project_name: str
    description: Optional[str] = None
    location: str
    start_date: date
    expected_end_date: date


class ProjectUpdate(BaseModel):
    manager_id: Optional[int] = None
    client_id: Optional[int] = None
    category_id: Optional[int] = None
    status_id: Optional[int] = None
    project_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    expected_end_date: Optional[date] = None
    actual_end_date: Optional[date] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: int
    company_id: int
    manager_id: int
    client_id: int
    category_id: int
    status_id: int
    project_name: str
    description: Optional[str]
    location: str
    start_date: date
    expected_end_date: date
    actual_end_date: Optional[date]
    created_at: datetime
    updated_at: Optional[datetime]