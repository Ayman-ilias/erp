from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from core.database import BaseSamples as Base


class MaterialMaster(Base):
    __tablename__ = "material_master"

    id = Column(Integer, primary_key=True, index=True)
    material_name = Column(String, nullable=False, index=True, unique=True)
    unit_id = Column(Integer, nullable=False, index=True)  # Reference to units table in db-units (cross-database reference)
    material_category = Column(String, nullable=True)  # Fabric, Trims, Accessories, etc.
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
