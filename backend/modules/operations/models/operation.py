from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import BaseSamples as Base


class OperationMaster(Base):
    __tablename__ = "operation_master"

    operation_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    operation_name = Column(String, nullable=False, index=True)
    machine_type = Column(String, nullable=True)  # Lockstitch, Overlock, Flatlock, etc.
    skill_level = Column(String, nullable=True)  # Beginner / Semi-skilled / Skilled
    standard_time = Column(Float, nullable=True)  # Base time in minutes for operation
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    style_operations = relationship("StyleOperationBreakdown", back_populates="operation")


class StyleOperationBreakdown(Base):
    __tablename__ = "style_operation_breakdown"

    style_op_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_variant_id = Column(Integer, ForeignKey("style_variants.id"), nullable=False)
    operation_id = Column(Integer, ForeignKey("operation_master.operation_id"), nullable=False)
    machine_time = Column(Float, nullable=True)  # Machine time in minutes
    manual_time = Column(Float, nullable=True)  # Manual handling/trimming time
    finishing_time = Column(Float, nullable=True)  # Checking/pressing time
    total_basic_time = Column(Float, nullable=True)  # Auto-calculated: machine+manual+finish
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    style_variant = relationship("StyleVariant")
    operation = relationship("OperationMaster", back_populates="style_operations")


class SMVSettings(Base):
    __tablename__ = "smv_settings"

    setting_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_type = Column(String, nullable=False, index=True)  # Basic / Polo / Hoodie / Jacket
    approval_factor = Column(Float, nullable=False)  # e.g., 1.10, 1.20, 1.30
    allowance_percent = Column(Float, nullable=False)  # e.g., 10%, 12%, 15%
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class StyleSMV(Base):
    __tablename__ = "style_smv"

    smv_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_variant_id = Column(Integer, ForeignKey("style_variants.id"), nullable=False)
    total_basic_time = Column(Float, nullable=False)  # Sum of all operations
    total_smart_smv = Column(Float, nullable=False)  # Final SMV = basic × factor
    approval_factor = Column(Float, nullable=False)  # Factor used (1.10–1.40)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    style_variant = relationship("StyleVariant")
