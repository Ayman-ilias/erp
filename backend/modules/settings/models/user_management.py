from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from core.database import BaseSettings


class Role(BaseSettings):
    """Roles - User roles for permission management"""
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    role_code = Column(String(50), unique=True, nullable=False, index=True)
    role_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_system_role = Column(Boolean, default=False)  # Cannot be deleted
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Permission(BaseSettings):
    """Permissions - Fine-grained access control"""
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    permission_code = Column(String(100), unique=True, nullable=False, index=True)
    permission_name = Column(String(255), nullable=False)
    module = Column(String(100), nullable=False)  # settings, clients, samples, orders, etc.
    action = Column(String(50), nullable=False)   # create, read, update, delete, export
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RolePermission(BaseSettings):
    """Role-Permission mapping"""
    __tablename__ = "role_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('role_id', 'permission_id', name='uq_role_permission'),
    )
