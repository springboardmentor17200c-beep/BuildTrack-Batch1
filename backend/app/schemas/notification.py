from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
