from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MaterialMasterBase(BaseModel):
    material_name: str
    uom: str
    material_category: Optional[str] = None
    description: Optional[str] = None


class MaterialMasterCreate(MaterialMasterBase):
    pass


class MaterialMasterUpdate(BaseModel):
    material_name: Optional[str] = None
    uom: Optional[str] = None
    material_category: Optional[str] = None
    description: Optional[str] = None


class MaterialMasterResponse(MaterialMasterBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
