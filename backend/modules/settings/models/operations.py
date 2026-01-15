from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric, Date
from sqlalchemy.sql import func
from core.database import BaseSettings


class Warehouse(BaseSettings):
    """Warehouses - Storage locations"""
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_code = Column(String(50), unique=True, nullable=False, index=True)
    warehouse_name = Column(String(255), nullable=False)
    warehouse_type = Column(String(50), nullable=True)  # Raw Material, WIP, Finished Goods, Transit
    branch_id = Column(Integer, nullable=True)  # Cross-DB reference to branches
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    manager_name = Column(String(255), nullable=True)
    capacity_sqft = Column(Numeric(12, 2), nullable=True)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DocumentNumbering(BaseSettings):
    """Document Numbering - Auto-numbering configuration"""
    __tablename__ = "document_numbering"

    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String(100), unique=True, nullable=False, index=True)  # PO, SO, INV, GRN
    document_name = Column(String(255), nullable=False)
    prefix = Column(String(20), nullable=True)  # PO-, SO-, INV-
    suffix = Column(String(20), nullable=True)
    current_number = Column(Integer, default=0)
    number_length = Column(Integer, default=6)  # Padded zeros
    fiscal_year_reset = Column(Boolean, default=True)  # Reset on fiscal year
    branch_wise = Column(Boolean, default=False)  # Separate sequence per branch
    sample_format = Column(String(100), nullable=True)  # Preview: PO-2024-000001
    is_active = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FiscalYear(BaseSettings):
    """Fiscal Year - Financial year configuration"""
    __tablename__ = "fiscal_year"

    id = Column(Integer, primary_key=True, index=True)
    fiscal_year_code = Column(String(20), unique=True, nullable=False, index=True)  # FY2024
    fiscal_year_name = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_current = Column(Boolean, default=False)
    is_closed = Column(Boolean, default=False)
    closed_date = Column(DateTime(timezone=True), nullable=True)
    closed_by_user_id = Column(Integer, nullable=True)  # Cross-DB reference
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PerMinuteValue(BaseSettings):
    """Per Minute Value - Production cost rate"""
    __tablename__ = "per_minute_value"

    id = Column(Integer, primary_key=True, index=True)
    date_of_value_set = Column(Date, nullable=False)
    value = Column(Numeric(10, 4), nullable=False)  # Per minute rate
    currency_id = Column(Integer, nullable=True)  # Cross-DB reference to currencies
    amendment_no = Column(String(20), nullable=True)
    effective_from = Column(Date, nullable=False)
    effective_to = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    approved_by_user_id = Column(Integer, nullable=True)  # Cross-DB reference
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
