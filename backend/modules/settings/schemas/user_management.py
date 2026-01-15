from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ==================== Role ====================

class RoleBase(BaseModel):
    role_code: str
    role_name: str
    description: Optional[str] = None
    is_system_role: Optional[bool] = False
    is_active: Optional[bool] = True


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    role_code: Optional[str] = None
    role_name: Optional[str] = None
    description: Optional[str] = None
    is_system_role: Optional[bool] = None
    is_active: Optional[bool] = None


class RoleResponse(RoleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Permission ====================

class PermissionBase(BaseModel):
    permission_code: str
    permission_name: str
    module: str
    action: str
    description: Optional[str] = None


class PermissionCreate(PermissionBase):
    pass


class PermissionResponse(PermissionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Role Permission ====================

class RolePermissionCreate(BaseModel):
    role_id: int
    permission_id: int


class RolePermissionResponse(BaseModel):
    id: int
    role_id: int
    permission_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RoleWithPermissions(RoleResponse):
    permissions: List[PermissionResponse] = []
