"""
Notification Model
Stores user notifications in the users database
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import BaseUsers as Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)  # User who should receive the notification
    title = Column(String, nullable=False)  # Notification title
    message = Column(Text, nullable=False)  # Notification message
    type = Column(String, nullable=False, default="info")  # info, warning, success, error
    related_entity_type = Column(String, nullable=True)  # e.g., "sample_request", "order", etc.
    related_entity_id = Column(String, nullable=True)  # e.g., sample_id, order_id, etc.
    target_department = Column(String, nullable=True)  # Department that should receive this notification (e.g., "Sample", "Merchandiser")
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

