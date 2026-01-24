from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from core.database import BaseUsers as Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    department = Column(String, nullable=True)  # Sample, IE, Planning, Merchandising, etc.
    designation = Column(String, nullable=True)
    # Department access permissions - JSON array of allowed departments
    # e.g., ["client_info", "sample_department"] or ["client_info"] or ["sample_department"]
    department_access = Column(JSON, nullable=True, default=list)  # List of accessible departments

    # Page-level permissions with read/write access
    # Structure: {
    #   "department_id": {
    #     "page_key": {"read": true, "write": false},
    #     ...
    #   }
    # }
    # Example: {
    #   "merchandising": {
    #     "material_details": {"read": true, "write": true},
    #     "sample_development": {"read": true, "write": false}
    #   }
    # }
    page_permissions = Column(JSON, nullable=True, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
