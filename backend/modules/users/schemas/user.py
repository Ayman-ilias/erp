from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# Page permission structure: {"read": bool, "write": bool}
class PagePermission(BaseModel):
    read: bool = False
    write: bool = False


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    department_access: Optional[List[str]] = None  # List of accessible departments
    # Page-level permissions: {"dept_id": {"page_key": {"read": true, "write": false}}}
    page_permissions: Optional[Dict[str, Dict[str, Dict[str, bool]]]] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    department_access: Optional[List[str]] = None
    page_permissions: Optional[Dict[str, Dict[str, Dict[str, bool]]]] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    page_permissions: Optional[Dict[str, Dict[str, Dict[str, bool]]]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str
