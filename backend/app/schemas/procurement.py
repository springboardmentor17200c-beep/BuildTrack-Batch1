from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProcurementCreate(BaseModel):
    project_id: int
    requested_by: int
    request_type: str
    description: str
    request_status: Optional[str] = "Pending"
    remarks: Optional[str] = None


class ProcurementUpdate(BaseModel):
    request_type: Optional[str] = None
    description: Optional[str] = None
    request_status: Optional[str] = None
    remarks: Optional[str] = None


class ProcurementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    procurement_request_id: int
    project_id: int
    requested_by: int
    request_type: str
    description: str
    request_status: str
    request_date: Optional[datetime]
    remarks: Optional[str]
