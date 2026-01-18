from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# =============================================================================
# UNIT INFO SCHEMA
# =============================================================================

class UnitInfo(BaseModel):
    """Schema for unit details from db-units database"""
    id: int
    name: str
    symbol: str
    category_name: str

    class Config:
        from_attributes = True


# =============================================================================
# MATERIAL MASTER SCHEMAS
# =============================================================================

class MaterialMasterBase(BaseModel):
    material_name: str
    material_category: Optional[str] = None
    description: Optional[str] = None


class MaterialMasterCreate(MaterialMasterBase):
    unit_id: int = Field(..., gt=0, description="Reference to unit in db-units")


class MaterialMasterUpdate(BaseModel):
    material_name: Optional[str] = Field(None, min_length=1)
    unit_id: Optional[int] = Field(None, gt=0, description="Reference to unit in db-units")
    material_category: Optional[str] = None
    description: Optional[str] = None


class MaterialMasterResponse(MaterialMasterBase):
    id: int
    unit_id: int
    unit: Optional[UnitInfo] = Field(None, description="Unit details populated from db-units")
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
