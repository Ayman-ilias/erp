from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


# ==================== Warehouse ====================

class WarehouseBase(BaseModel):
    warehouse_code: str
    warehouse_name: str
    warehouse_type: Optional[str] = None
    branch_id: Optional[int] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    manager_name: Optional[str] = None
    capacity_sqft: Optional[Decimal] = None
    is_default: Optional[bool] = False
    is_active: Optional[bool] = True
    remarks: Optional[str] = None


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseUpdate(BaseModel):
    warehouse_code: Optional[str] = None
    warehouse_name: Optional[str] = None
    warehouse_type: Optional[str] = None
    branch_id: Optional[int] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    manager_name: Optional[str] = None
    capacity_sqft: Optional[Decimal] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    remarks: Optional[str] = None


class WarehouseResponse(WarehouseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Document Numbering ====================

class DocumentNumberingBase(BaseModel):
    document_type: str
    document_name: str
    prefix: Optional[str] = None
    suffix: Optional[str] = None
    current_number: Optional[int] = 0
    number_length: Optional[int] = 6
    fiscal_year_reset: Optional[bool] = True
    branch_wise: Optional[bool] = False
    sample_format: Optional[str] = None
    is_active: Optional[bool] = True
    remarks: Optional[str] = None


class DocumentNumberingCreate(DocumentNumberingBase):
    pass


class DocumentNumberingUpdate(BaseModel):
    document_type: Optional[str] = None
    document_name: Optional[str] = None
    prefix: Optional[str] = None
    suffix: Optional[str] = None
    current_number: Optional[int] = None
    number_length: Optional[int] = None
    fiscal_year_reset: Optional[bool] = None
    branch_wise: Optional[bool] = None
    sample_format: Optional[str] = None
    is_active: Optional[bool] = None
    remarks: Optional[str] = None


class DocumentNumberingResponse(DocumentNumberingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Fiscal Year ====================

class FiscalYearBase(BaseModel):
    fiscal_year_code: str
    fiscal_year_name: str
    start_date: date
    end_date: date
    is_current: Optional[bool] = False
    is_closed: Optional[bool] = False
    remarks: Optional[str] = None


class FiscalYearCreate(FiscalYearBase):
    pass


class FiscalYearUpdate(BaseModel):
    fiscal_year_code: Optional[str] = None
    fiscal_year_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    is_closed: Optional[bool] = None
    remarks: Optional[str] = None


class FiscalYearResponse(FiscalYearBase):
    id: int
    closed_date: Optional[datetime] = None
    closed_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Per Minute Value ====================

class PerMinuteValueBase(BaseModel):
    date_of_value_set: date
    value: Decimal
    currency_id: Optional[int] = None
    amendment_no: Optional[str] = None
    effective_from: date
    effective_to: Optional[date] = None
    is_current: Optional[bool] = False
    approved_by_user_id: Optional[int] = None
    remarks: Optional[str] = None


class PerMinuteValueCreate(PerMinuteValueBase):
    pass


class PerMinuteValueUpdate(BaseModel):
    date_of_value_set: Optional[date] = None
    value: Optional[Decimal] = None
    currency_id: Optional[int] = None
    amendment_no: Optional[str] = None
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None
    is_current: Optional[bool] = None
    approved_by_user_id: Optional[int] = None
    remarks: Optional[str] = None


class PerMinuteValueResponse(PerMinuteValueBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
