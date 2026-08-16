from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProjectMilestoneCreate(BaseModel):
    project_id: int
    milestone_name: str
    description: Optional[str] = None
    due_date: date
    status: str = "Pending"


class ProjectMilestoneUpdate(BaseModel):
    milestone_name: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    completion_date: Optional[date] = None
    status: Optional[str] = None


class ProjectMilestoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    milestone_id: int
    project_id: int
    milestone_name: str
    description: Optional[str]
    due_date: date
    completion_date: Optional[date]
    status: str
    created_at: datetime
    updated_at: datetime


class ProjectMilestoneEnrichedResponse(BaseModel):
    """Flat response with denormalized project_name — used by the frontend."""
    milestone_id: int
    project_id: int
    project_name: str
    milestone_name: str
    description: Optional[str]
    due_date: date
    completion_date: Optional[date]
    status: str