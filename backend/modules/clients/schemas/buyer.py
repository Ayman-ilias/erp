from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class BuyerTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: Optional[bool] = True


class BuyerTypeCreate(BuyerTypeBase):
    pass


class BuyerTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class BuyerTypeResponse(BuyerTypeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BuyerBase(BaseModel):
    buyer_name: str
    brand_name: Optional[str] = None
    company_name: str
    head_office_country: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    status: Optional[str] = "active"  # active, inactive, on_hold
    buyer_type_id: Optional[int] = None


class BuyerCreate(BuyerBase):
    pass


class BuyerUpdate(BaseModel):
    buyer_name: Optional[str] = None
    brand_name: Optional[str] = None
    company_name: Optional[str] = None
    head_office_country: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    status: Optional[str] = None  # active, inactive, on_hold
    buyer_type_id: Optional[int] = None


class BuyerResponse(BuyerBase):
    id: int
    buyer_type: Optional[BuyerTypeResponse] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContactPersonBase(BaseModel):
    contact_person_name: str
    company: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    phone_number: Optional[str] = None
    corporate_mail: Optional[EmailStr] = None
    country: Optional[str] = None
    buyer_id: Optional[int] = None
    supplier_id: Optional[int] = None


class ContactPersonCreate(ContactPersonBase):
    pass


class ContactPersonResponse(ContactPersonBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ShippingInfoBase(BaseModel):
    buyer_id: int
    brand_name: Optional[str] = None
    company_name: Optional[str] = None
    destination_country: Optional[str] = None
    destination_country_code: Optional[str] = None
    destination_port: Optional[str] = None
    place_of_delivery: Optional[str] = None
    destination_code: Optional[str] = None
    warehouse_no: Optional[str] = None
    address: Optional[str] = None
    incoterm: Optional[str] = None


class ShippingInfoCreate(ShippingInfoBase):
    pass


class ShippingInfoResponse(ShippingInfoBase):
    id: int
    buyer_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BankingInfoBase(BaseModel):
    client_name: str
    country: Optional[str] = None
    bank_name: str
    sort_code: Optional[str] = None
    swift_code: Optional[str] = None
    account_number: str
    currency: Optional[str] = None
    account_type: Optional[str] = None


class BankingInfoCreate(BankingInfoBase):
    pass


class BankingInfoResponse(BankingInfoBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
