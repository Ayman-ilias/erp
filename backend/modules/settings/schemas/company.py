from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ==================== Company Profile ====================

class CompanyProfileBase(BaseModel):
    company_name: str
    legal_name: Optional[str] = None
    registration_number: Optional[str] = None
    tax_id: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    default_currency_id: Optional[int] = None
    fiscal_year_start_month: Optional[int] = 1
    remarks: Optional[str] = None


class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    legal_name: Optional[str] = None
    registration_number: Optional[str] = None
    tax_id: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    fax: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    default_currency_id: Optional[int] = None
    fiscal_year_start_month: Optional[int] = None
    remarks: Optional[str] = None


class CompanyProfileResponse(CompanyProfileBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Branch ====================

class BranchBase(BaseModel):
    branch_code: str
    branch_name: str
    branch_type: Optional[str] = None
    is_head_office: Optional[bool] = False
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    manager_name: Optional[str] = None
    is_active: Optional[bool] = True
    remarks: Optional[str] = None


class BranchCreate(BranchBase):
    pass


class BranchUpdate(BaseModel):
    branch_code: Optional[str] = None
    branch_name: Optional[str] = None
    branch_type: Optional[str] = None
    is_head_office: Optional[bool] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    manager_name: Optional[str] = None
    is_active: Optional[bool] = None
    remarks: Optional[str] = None


class BranchResponse(BranchBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
