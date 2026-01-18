"""
Unit Conversion System Models

Comprehensive unit system supporting:
- SI (International System of Units)
- International units
- Desi (South Asian traditional units)
- English (Imperial) units
- CGS (Centimeter-Gram-Second) units

Based on BSTI (Bangladesh Standards and Testing Institution) and ISO standards.
"""

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text,
    ForeignKey, Numeric, UniqueConstraint, Enum as SQLEnum, Index
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import BaseUnits
import enum


class UnitTypeEnum(str, enum.Enum):
    """Unit type classification"""
    SI = "SI"
    INTERNATIONAL = "International"
    DESI = "Desi"
    ENGLISH = "English"
    CGS = "CGS"
    OTHER = "Other"


class UnitCategory(BaseUnits):
    """
    Unit Categories - Groups of related units

    Examples: Length, Weight, Volume, Temperature, Area, Count, Pressure,
    Flow Rate, Force, Torque, Rotational Speed, Energy, Power, etc.
    """
    __tablename__ = "unit_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    base_unit_name = Column(String(100), nullable=False)  # e.g., "Meter" for Length
    base_unit_symbol = Column(String(20), nullable=False)  # e.g., "m" for Meter
    icon = Column(String(50), nullable=True)  # lucide-react icon name
    industry_use = Column(String(500), nullable=True)  # e.g., "Fabric rolls, ribbons, trims"
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    units = relationship("Unit", back_populates="category", lazy="dynamic")

    def __repr__(self):
        return f"<UnitCategory(id={self.id}, name='{self.name}', base='{self.base_unit_symbol}')>"


class Unit(BaseUnits):
    """
    Individual Units of Measure

    Stores conversion factors relative to the base unit of the category.
    Example: For Length category (base: Meter), Centimeter has factor 0.01
    """
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(
        Integer,
        ForeignKey("unit_categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(String(100), nullable=False)  # e.g., "Centimeter"
    symbol = Column(String(30), nullable=False)  # e.g., "cm"
    description = Column(Text, nullable=True)
    unit_type = Column(
        SQLEnum(UnitTypeEnum, name="unit_type_enum", create_type=True),
        nullable=False,
        default=UnitTypeEnum.SI
    )
    region = Column(String(100), nullable=True)  # e.g., "South Asia", "Bangladesh", "Dhaka"
    to_base_factor = Column(Numeric(30, 15), nullable=False, default=1)  # Conversion to base unit
    alternate_names = Column(String(500), nullable=True)  # Comma-separated aliases
    is_base = Column(Boolean, default=False)  # Is this the base unit for the category
    is_active = Column(Boolean, default=True)
    decimal_places = Column(Integer, default=6)  # Precision for display
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    category = relationship("UnitCategory", back_populates="units")
    aliases = relationship("UnitAlias", back_populates="unit", lazy="dynamic", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('category_id', 'symbol', name='uq_unit_category_symbol'),
        Index('idx_unit_name', 'name'),
        Index('idx_unit_type', 'unit_type'),
    )

    def __repr__(self):
        return f"<Unit(id={self.id}, name='{self.name}', symbol='{self.symbol}', factor={self.to_base_factor})>"


class UnitAlias(BaseUnits):
    """
    Unit Aliases - Alternative names/symbols for units

    Useful for regional variations or common abbreviations
    Example: "kilogram" can have aliases "kilo", "kilos", "KG"
    """
    __tablename__ = "unit_aliases"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(
        Integer,
        ForeignKey("units.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    alias_name = Column(String(100), nullable=False)
    alias_symbol = Column(String(30), nullable=True)
    region = Column(String(100), nullable=True)  # Regional alternative
    is_preferred = Column(Boolean, default=False)  # Preferred display name
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    unit = relationship("Unit", back_populates="aliases")

    __table_args__ = (
        UniqueConstraint('alias_name', name='uq_alias_name'),
    )

    def __repr__(self):
        return f"<UnitAlias(id={self.id}, alias='{self.alias_name}', unit_id={self.unit_id})>"


class ConversionHistory(BaseUnits):
    """
    Conversion History - Audit log for unit conversions

    Tracks all conversions performed for audit and analytics purposes.
    """
    __tablename__ = "conversion_history"

    id = Column(Integer, primary_key=True, index=True)
    from_unit_id = Column(
        Integer,
        ForeignKey("units.id", ondelete="SET NULL"),
        nullable=True
    )
    to_unit_id = Column(
        Integer,
        ForeignKey("units.id", ondelete="SET NULL"),
        nullable=True
    )
    input_value = Column(Numeric(20, 10), nullable=False)
    output_value = Column(Numeric(20, 10), nullable=False)
    conversion_factor = Column(Numeric(30, 15), nullable=False)
    user_id = Column(Integer, nullable=True)  # Optional: track which user performed conversion
    converted_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    def __repr__(self):
        return f"<ConversionHistory(id={self.id}, from={self.from_unit_id}, to={self.to_unit_id}, value={self.input_value})>"


class UnitChangeAudit(BaseUnits):
    """
    Unit Change Audit - Tracks changes to unit fields in material-related models

    Provides audit trail for unit field updates across different tables:
    - MaterialMaster (unit_id changes)
    - SampleRequiredMaterial (unit_id changes)
    - StyleVariantMaterial (unit_id and weight_unit_id changes)
    
    Note: This model uses BaseUnits but can be created in either units or settings database
    depending on the deployment configuration. The foreign key references will be adjusted
    accordingly during migration.
    
    Requirements: 15.1, 15.4
    """
    __tablename__ = "unit_change_audit"

    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String(100), nullable=False, index=True)  # e.g., "material_master", "sample_required_materials"
    record_id = Column(Integer, nullable=False, index=True)  # ID of the record that was changed
    field_name = Column(String(50), nullable=False)  # e.g., "unit_id", "weight_unit_id"
    old_unit_id = Column(Integer, nullable=True, index=True)  # Previous unit ID (null for new records)
    new_unit_id = Column(Integer, nullable=True, index=True)  # New unit ID (null for deletions)
    changed_by = Column(String(100), nullable=True)  # User ID or system identifier
    changed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    change_reason = Column(String(200), nullable=True)  # Optional: migration, user_update, system_correction
    
    # Note: Foreign key relationships are not defined here because they depend on which database
    # the table is created in (units vs settings). The migration script handles the appropriate
    # foreign key constraints based on the target database.

    __table_args__ = (
        Index('idx_unit_audit_table_record', 'table_name', 'record_id'),
        Index('idx_unit_audit_changed_at', 'changed_at'),
        Index('idx_unit_audit_changed_by', 'changed_by'),
    )

    def __repr__(self):
        return f"<UnitChangeAudit(id={self.id}, table='{self.table_name}', record_id={self.record_id}, field='{self.field_name}', old={self.old_unit_id}, new={self.new_unit_id})>"
