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


class CompanyProfileCreate(CompanyProfileBase):
    """Schema for creating a new company"""
    pass


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
    is_active: Optional[bool] = None
    remarks: Optional[str] = None


class CompanyProfileResponse(CompanyProfileBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Branch ====================

class BranchBase(BaseModel):
    company_id: Optional[int] = None  # Link to company
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
    company_id: Optional[int] = None
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
    company_name: Optional[str] = None  # Populated from join
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Country ====================

class CountryBase(BaseModel):
    country_name: str
    country_code: str  # ISO 3166-1 alpha-3
    country_code_2: Optional[str] = None  # ISO 3166-1 alpha-2
    region: Optional[str] = None
    currency_code: Optional[str] = None
    phone_code: Optional[str] = None


class CountryCreate(CountryBase):
    pass


class CountryUpdate(BaseModel):
    country_name: Optional[str] = None
    country_code: Optional[str] = None
    country_code_2: Optional[str] = None
    region: Optional[str] = None
    currency_code: Optional[str] = None
    phone_code: Optional[str] = None
    is_active: Optional[bool] = None


class CountryResponse(CountryBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Port ====================

class PortBase(BaseModel):
    country_id: int
    port_name: str
    port_code: str  # UN/LOCODE
    port_type: Optional[str] = None  # Seaport, Airport, Inland Port
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PortCreate(PortBase):
    pass


class PortUpdate(BaseModel):
    country_id: Optional[int] = None
    port_name: Optional[str] = None
    port_code: Optional[str] = None
    port_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None


class PortResponse(PortBase):
    id: int
    country_name: Optional[str] = None  # Populated from join
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
