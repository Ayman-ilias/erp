from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from core.database import BaseSettings


class CompanyProfile(BaseSettings):
    """Company Profile - Single record for company-wide settings"""
    __tablename__ = "company_profile"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    legal_name = Column(String(255), nullable=True)
    registration_number = Column(String(100), nullable=True)
    tax_id = Column(String(100), nullable=True)
    logo_url = Column(String(500), nullable=True)
    website = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    fax = Column(String(50), nullable=True)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    default_currency_id = Column(Integer, nullable=True)
    fiscal_year_start_month = Column(Integer, default=1)  # 1-12
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Branch(BaseSettings):
    """Branches - Company locations/offices"""
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    branch_code = Column(String(50), unique=True, nullable=False, index=True)
    branch_name = Column(String(255), nullable=False)
    branch_type = Column(String(50), nullable=True)  # Head Office, Factory, Warehouse, Sales Office
    is_head_office = Column(Boolean, default=False)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    manager_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
