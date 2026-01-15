from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db_samples
from core.logging import setup_logging
from modules.materials.models.material import MaterialMaster
from modules.materials.schemas.material import MaterialMasterCreate, MaterialMasterUpdate, MaterialMasterResponse

logger = setup_logging()

router = APIRouter(prefix="/materials", tags=["materials"])


@router.get("/", response_model=List[MaterialMasterResponse])
def get_materials(db: Session = Depends(get_db_samples)):
    """Get all materials"""
    materials = db.query(MaterialMaster).order_by(MaterialMaster.material_name).all()
    return materials


@router.get("/{material_id}", response_model=MaterialMasterResponse)
def get_material(material_id: int, db: Session = Depends(get_db_samples)):
    """Get a specific material by ID"""
    material = db.query(MaterialMaster).filter(MaterialMaster.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material


@router.post("/", response_model=MaterialMasterResponse, status_code=201)
def create_material(material: MaterialMasterCreate, db: Session = Depends(get_db_samples)):
    """Create a new material"""
    # Check if material already exists
    existing = db.query(MaterialMaster).filter(
        MaterialMaster.material_name == material.material_name
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Material with this name already exists"
        )

    db_material = MaterialMaster(**material.model_dump())
    try:
        db.add(db_material)
        db.commit()
        db.refresh(db_material)
        return db_material
    except Exception as e:
        db.rollback()
        logger.error(f"Material creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create material")


@router.put("/{material_id}", response_model=MaterialMasterResponse)
def update_material(
    material_id: int,
    material: MaterialMasterUpdate,
    db: Session = Depends(get_db_samples)
):
    """Update an existing material"""
    db_material = db.query(MaterialMaster).filter(MaterialMaster.id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Check if new name already exists (if name is being updated)
    if material.material_name and material.material_name != db_material.material_name:
        existing = db.query(MaterialMaster).filter(
            MaterialMaster.material_name == material.material_name
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Material with this name already exists"
            )

    # Update fields
    update_data = material.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_material, field, value)

    try:
        db.commit()
        db.refresh(db_material)
        return db_material
    except Exception as e:
        db.rollback()
        logger.error(f"Material update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update material")


@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db_samples)):
    """Delete a material"""
    db_material = db.query(MaterialMaster).filter(MaterialMaster.id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")

    try:
        db.delete(db_material)
        db.commit()
        return {"message": "Material deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Material deletion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete material")
