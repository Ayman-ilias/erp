from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.sql import func
from core.database import BaseSettings


# ==================== UoM (Units of Measure) ====================

class UoMCategory(BaseSettings):
    """UoM Categories - Length, Weight, Volume, Quantity, etc."""
    __tablename__ = "uom_category"

    id = Column(Integer, primary_key=True, index=True)
    uom_category = Column(String(100), unique=True, nullable=False, index=True)
    uom_id = Column(String(50), nullable=True)  # Category identifier
    uom_name = Column(String(100), nullable=False)
    uom_description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # lucide-react icon name for visual display
    industry_use = Column(String(255), nullable=True)  # e.g., "Fabric rolls, trims measurement"
    sort_order = Column(Integer, default=0)  # Display ordering
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class UoM(BaseSettings):
    """Units of Measure - Actual units (Kg, Meter, Piece, etc.)"""
    __tablename__ = "uom"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("uom_category.id", ondelete="RESTRICT"), nullable=False)
    name = Column(String(100), nullable=False)
    symbol = Column(String(20), nullable=False)
    factor = Column(Numeric(18, 8), default=1.0)  # Conversion factor to base unit
    is_base = Column(Boolean, default=False)  # Is this the base unit for category
    is_active = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)
    display_name = Column(String(100), nullable=True)  # e.g., "Kilogram (kg)" for dropdown display
    is_si_unit = Column(Boolean, default=False)  # Flag for SI base units
    common_usage = Column(String(255), nullable=True)  # e.g., "Yarn weight, thread"
    decimal_places = Column(Integer, default=2)  # Precision for calculations
    sort_order = Column(Integer, default=0)  # Display ordering
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('category_id', 'symbol', name='uq_uom_category_symbol'),
    )


# ==================== Color Master ====================

class ColorFamily(BaseSettings):
    """Color Family - BLACK, WHITE, GREY, BLUE, etc."""
    __tablename__ = "color_family"

    id = Column(Integer, primary_key=True, index=True)
    color_family = Column(String(50), unique=True, nullable=False, index=True)
    color_family_code = Column(String(20), nullable=True)
    color_family_code_type = Column(String(50), nullable=True)  # HEX, PANTONE, etc.
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Color(BaseSettings):
    """Color - Specific colors within a family"""
    __tablename__ = "color"

    id = Column(Integer, primary_key=True, index=True)
    color = Column(String(100), nullable=False)
    color_family_id = Column(Integer, ForeignKey("color_family.id", ondelete="RESTRICT"), nullable=False)
    color_code = Column(String(50), nullable=True)
    color_code_type = Column(String(50), nullable=True)  # HEX, PANTONE, RAL, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('color', 'color_family_id', name='uq_color_family'),
    )


class ColorValue(BaseSettings):
    """Color Value - Shade/Intensity (VERY LIGHT, LIGHT, MEDIUM, etc.)"""
    __tablename__ = "color_value"

    id = Column(Integer, primary_key=True, index=True)
    color_value_code = Column(String(50), unique=True, nullable=False, index=True)
    color_value_code_type = Column(String(100), nullable=False)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ColorMaster(BaseSettings):
    """Color Master - Combined color with family and value"""
    __tablename__ = "color_master"

    id = Column(Integer, primary_key=True, index=True)
    color_id = Column(Integer, ForeignKey("color.id", ondelete="RESTRICT"), nullable=False)
    color_family_id = Column(Integer, ForeignKey("color_family.id", ondelete="RESTRICT"), nullable=False)
    color_value_id = Column(Integer, ForeignKey("color_value.id"), nullable=True)
    color_name = Column(String(255), nullable=False)  # Full descriptive name
    color_code_type = Column(String(50), nullable=True)
    color_code = Column(String(100), nullable=True)  # Final color code
    hex_value = Column(String(7), nullable=True)  # Always store HEX for UI display
    is_active = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        # Changed constraint: Allow multiple codes per color+value combination
        # But each color_code must be unique within its code_type
        UniqueConstraint('color_code', 'color_code_type', name='uq_color_code_type'),
    )


# ==================== Country Master ====================

class Country(BaseSettings):
    """Country - ISO 3166 countries"""
    __tablename__ = "country"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(String(10), unique=True, nullable=False, index=True)  # ISO 3166-1 alpha-2/3
    country_name = Column(String(100), nullable=False)
    international_country_code = Column(String(3), nullable=True)  # ISO 3166-1 alpha-3
    international_dialing_number = Column(String(10), nullable=True)  # +880, +1, etc.
    currency_code = Column(String(3), nullable=True)  # ISO 4217
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class City(BaseSettings):
    """City - Cities within countries"""
    __tablename__ = "city"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(String(50), unique=True, nullable=False, index=True)
    city_name = Column(String(100), nullable=False)
    country_id = Column(Integer, ForeignKey("country.id", ondelete="RESTRICT"), nullable=False)
    state_province = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Port(BaseSettings):
    """Port - UN/LOCODE compatible ports"""
    __tablename__ = "port"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("country.id", ondelete="RESTRICT"), nullable=False)
    city_id = Column(Integer, ForeignKey("city.id"), nullable=True)
    locode = Column(String(5), unique=True, nullable=False, index=True)  # UN/LOCODE
    port_name = Column(String(255), nullable=False)
    name_wo_diacritics = Column(String(255), nullable=True)  # Name without special characters
    subdivision = Column(String(10), nullable=True)  # Sub-division code
    function = Column(String(20), nullable=True)  # 1=Port, 2=Rail, 3=Road, 4=Airport
    status = Column(String(10), nullable=True)  # AI, AA, AC, etc.
    date = Column(String(10), nullable=True)  # Entry date
    iata = Column(String(3), nullable=True)  # IATA code for airports
    coordinates = Column(String(50), nullable=True)  # Lat/Long
    remarks = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
