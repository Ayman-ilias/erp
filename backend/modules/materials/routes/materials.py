from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db_samples
from core.logging import setup_logging
from modules.materials.models.material import MaterialMaster
from modules.materials.schemas.material import MaterialMasterCreate, MaterialMasterUpdate, MaterialMasterResponse
from modules.materials.services.validation_service import ValidationService, ValidationError, DatabaseConnectionError
from modules.materials.services.material_service import MaterialService, MaterialServiceError

logger = setup_logging()

router = APIRouter(prefix="/materials", tags=["materials"])


@router.get("/", response_model=List[MaterialMasterResponse])
def get_materials(db: Session = Depends(get_db_samples)):
    """Get all materials with unit details (batch-resolved to avoid N+1 queries)"""
    try:
        service = MaterialService()
        materials = service.get_materials_with_units(skip=0, limit=1000)
        return materials
    except DatabaseConnectionError as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=503, detail="Unit conversion service unavailable")
    except MaterialServiceError as e:
        logger.error(f"Material service error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve materials")
    except Exception as e:
        logger.error(f"Unexpected error retrieving materials: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve materials")


@router.get("/{material_id}", response_model=MaterialMasterResponse)
def get_material(material_id: int, db: Session = Depends(get_db_samples)):
    """Get a specific material by ID with unit details"""
    try:
        service = MaterialService()
        material = service.get_material_with_unit(material_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")
        return material
    except DatabaseConnectionError as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=503, detail="Unit conversion service unavailable")
    except MaterialServiceError as e:
        logger.error(f"Material service error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve material")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error retrieving material {material_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve material")


@router.post("/", response_model=MaterialMasterResponse, status_code=201)
def create_material(material: MaterialMasterCreate, db: Session = Depends(get_db_samples)):
    """Create a new material with unit_id validation"""
    # Validate unit_id exists and is active
    try:
        if not ValidationService.validate_unit_id(material.unit_id):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid unit_id: {material.unit_id} (unit not found or inactive)"
            )
    except DatabaseConnectionError as e:
        logger.error(f"Database connection error during unit validation: {e}")
        raise HTTPException(status_code=503, detail="Unit conversion service unavailable")
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
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
        
        # Return material with unit details
        service = MaterialService()
        return service.get_material_with_unit(db_material.id)
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
    """Update an existing material with unit_id validation"""
    db_material = db.query(MaterialMaster).filter(MaterialMaster.id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Validate unit_id if provided
    if material.unit_id is not None:
        try:
            if not ValidationService.validate_unit_id(material.unit_id):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid unit_id: {material.unit_id} (unit not found or inactive)"
                )
        except DatabaseConnectionError as e:
            logger.error(f"Database connection error during unit validation: {e}")
            raise HTTPException(status_code=503, detail="Unit conversion service unavailable")
        except ValidationError as e:
            logger.error(f"Validation error: {e}")
            raise HTTPException(status_code=400, detail=str(e))

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
        
        # Return material with unit details
        service = MaterialService()
        return service.get_material_with_unit(db_material.id)
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
