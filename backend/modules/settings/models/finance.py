from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric, Date
from sqlalchemy.sql import func
from core.database import BaseSettings


class Currency(BaseSettings):
    """Currencies - ISO 4217 currency codes"""
    __tablename__ = "currencies"

    id = Column(Integer, primary_key=True, index=True)
    currency_code = Column(String(3), unique=True, nullable=False, index=True)  # ISO 4217 code
    currency_name = Column(String(100), nullable=False)
    symbol = Column(String(10), nullable=True)
    decimal_places = Column(Integer, default=2)
    is_base_currency = Column(Boolean, default=False)
    exchange_rate = Column(Numeric(18, 6), default=1.0)  # Rate to base currency
    rate_updated_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ChartOfAccounts(BaseSettings):
    """Chart of Accounts - Accounting structure"""
    __tablename__ = "chart_of_accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_code = Column(String(50), unique=True, nullable=False, index=True)
    account_name = Column(String(255), nullable=False)
    account_type = Column(String(50), nullable=False)  # Asset, Liability, Equity, Revenue, Expense
    account_category = Column(String(100), nullable=True)  # Current Asset, Fixed Asset, etc.
    parent_account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True)
    level = Column(Integer, default=1)  # Hierarchy level
    is_header = Column(Boolean, default=False)  # Is a group header
    is_active = Column(Boolean, default=True)
    is_system_account = Column(Boolean, default=False)  # Cannot be deleted
    opening_balance = Column(Numeric(18, 2), default=0)
    current_balance = Column(Numeric(18, 2), default=0)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Tax(BaseSettings):
    """Taxes - Tax rates and configurations"""
    __tablename__ = "taxes"

    id = Column(Integer, primary_key=True, index=True)
    tax_code = Column(String(50), unique=True, nullable=False, index=True)
    tax_name = Column(String(100), nullable=False)
    tax_type = Column(String(50), nullable=True)  # VAT, Sales Tax, Service Tax, Customs
    rate = Column(Numeric(8, 4), nullable=False)  # Percentage (e.g., 15.0000 for 15%)
    is_compound = Column(Boolean, default=False)  # Applied on top of other taxes
    is_recoverable = Column(Boolean, default=True)  # Input tax credit available
    account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    effective_from = Column(Date, nullable=True)
    effective_to = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
