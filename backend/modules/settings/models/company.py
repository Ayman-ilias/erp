from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.sql import func
from core.database import BaseSettings


class CompanyProfile(BaseSettings):
    """Company Profile - Supports multiple companies"""
    __tablename__ = "company_profile"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False, index=True)
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
    is_active = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Branch(BaseSettings):
    """Branches - Company locations/offices"""
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=True, index=True)  # Link to company_profile
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


class Country(BaseSettings):
    """Country Master Data"""
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    country_name = Column(String(255), nullable=False, unique=True, index=True)
    country_code = Column(String(3), nullable=False, unique=True)  # ISO 3166-1 alpha-3
    country_code_2 = Column(String(2), nullable=True)  # ISO 3166-1 alpha-2
    region = Column(String(100), nullable=True)  # Asia, Europe, Americas, etc.
    currency_code = Column(String(3), nullable=True)
    phone_code = Column(String(10), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Port(BaseSettings):
    """Port Master Data"""
    __tablename__ = "ports"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, nullable=False, index=True)  # Reference to countries.id
    port_name = Column(String(255), nullable=False, index=True)
    port_code = Column(String(10), nullable=False, unique=True)  # UN/LOCODE
    port_type = Column(String(50), nullable=True)  # Seaport, Airport, Inland Port
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
