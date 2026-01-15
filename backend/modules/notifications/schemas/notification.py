"""
Notification Schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
    target_department: Optional[str] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    target_department: Optional[str] = None

    class Config:
        from_attributes = True

