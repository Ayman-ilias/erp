from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class SupplierBase(BaseModel):
    supplier_name: str
    company_name: str
    supplier_type: Optional[str] = None  # Fabric, Trims, Accessories, Packaging
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    brand_name: Optional[str] = None
    head_office_country: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    rating: Optional[float] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    supplier_name: Optional[str] = None
    company_name: Optional[str] = None
    supplier_type: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    brand_name: Optional[str] = None
    head_office_country: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    rating: Optional[float] = None


class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
