from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from core.database import BaseSettings


class Department(BaseSettings):
    """Departments - Organizational units"""
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    department_code = Column(String(50), unique=True, nullable=False, index=True)
    department_name = Column(String(100), nullable=False)
    parent_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    branch_id = Column(Integer, nullable=True)  # Cross-DB reference to branches
    manager_user_id = Column(Integer, nullable=True)  # Cross-DB reference to users
    cost_center_code = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
