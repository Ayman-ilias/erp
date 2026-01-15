from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DepartmentBase(BaseModel):
    department_code: str
    department_name: str
    parent_department_id: Optional[int] = None
    branch_id: Optional[int] = None
    manager_user_id: Optional[int] = None
    cost_center_code: Optional[str] = None
    is_active: Optional[bool] = True
    remarks: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    parent_department_id: Optional[int] = None
    branch_id: Optional[int] = None
    manager_user_id: Optional[int] = None
    cost_center_code: Optional[str] = None
    is_active: Optional[bool] = None
    remarks: Optional[str] = None


class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
