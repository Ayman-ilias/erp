from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


# ==================== Currency ====================

class CurrencyBase(BaseModel):
    currency_code: str
    currency_name: str
    symbol: Optional[str] = None
    decimal_places: Optional[int] = 2
    is_base_currency: Optional[bool] = False
    exchange_rate: Optional[Decimal] = Decimal("1.0")
    is_active: Optional[bool] = True
    remarks: Optional[str] = None


class CurrencyCreate(CurrencyBase):
    pass


class CurrencyUpdate(BaseModel):
    currency_code: Optional[str] = None
    currency_name: Optional[str] = None
    symbol: Optional[str] = None
    decimal_places: Optional[int] = None
    is_base_currency: Optional[bool] = None
    exchange_rate: Optional[Decimal] = None
    is_active: Optional[bool] = None
    remarks: Optional[str] = None


class CurrencyResponse(CurrencyBase):
    id: int
    rate_updated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Chart of Accounts ====================

class ChartOfAccountsBase(BaseModel):
    account_code: str
    account_name: str
    account_type: str
    account_category: Optional[str] = None
    parent_account_id: Optional[int] = None
    level: Optional[int] = 1
    is_header: Optional[bool] = False
    is_active: Optional[bool] = True
    is_system_account: Optional[bool] = False
    opening_balance: Optional[Decimal] = Decimal("0")
    current_balance: Optional[Decimal] = Decimal("0")
    currency_id: Optional[int] = None
    remarks: Optional[str] = None


class ChartOfAccountsCreate(ChartOfAccountsBase):
    pass


class ChartOfAccountsUpdate(BaseModel):
    account_code: Optional[str] = None
    account_name: Optional[str] = None
    account_type: Optional[str] = None
    account_category: Optional[str] = None
    parent_account_id: Optional[int] = None
    level: Optional[int] = None
    is_header: Optional[bool] = None
    is_active: Optional[bool] = None
    opening_balance: Optional[Decimal] = None
    current_balance: Optional[Decimal] = None
    currency_id: Optional[int] = None
    remarks: Optional[str] = None


class ChartOfAccountsResponse(ChartOfAccountsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Tax ====================

class TaxBase(BaseModel):
    tax_code: str
    tax_name: str
    tax_type: Optional[str] = None
    rate: Decimal
    is_compound: Optional[bool] = False
    is_recoverable: Optional[bool] = True
    account_id: Optional[int] = None
    is_active: Optional[bool] = True
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None
    remarks: Optional[str] = None


class TaxCreate(TaxBase):
    pass


class TaxUpdate(BaseModel):
    tax_code: Optional[str] = None
    tax_name: Optional[str] = None
    tax_type: Optional[str] = None
    rate: Optional[Decimal] = None
    is_compound: Optional[bool] = None
    is_recoverable: Optional[bool] = None
    account_id: Optional[int] = None
    is_active: Optional[bool] = None
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None
    remarks: Optional[str] = None


class TaxResponse(TaxBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
