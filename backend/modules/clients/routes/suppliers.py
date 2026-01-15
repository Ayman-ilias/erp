from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db_clients
from modules.clients.models.client import Supplier
from modules.clients.schemas.supplier import SupplierCreate, SupplierResponse, SupplierUpdate
from core.logging import setup_logging

logger = setup_logging()

router = APIRouter()


@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(supplier_data: SupplierCreate, db: Session = Depends(get_db_clients)):
    """Create a new supplier"""
    try:
        new_supplier = Supplier(**supplier_data.model_dump())
        db.add(new_supplier)
        db.commit()
        db.refresh(new_supplier)
        return new_supplier
    except Exception as e:
        db.rollback()
        logger.error(f"Supplier creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create supplier")


@router.get("/", response_model=List[SupplierResponse])
def get_suppliers(skip: int = 0, limit: int = 10000, db: Session = Depends(get_db_clients)):
    """Get all suppliers"""
    suppliers = db.query(Supplier).order_by(Supplier.id.desc()).offset(skip).limit(limit).all()
    return suppliers


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: int, db: Session = Depends(get_db_clients)):
    """Get a specific supplier"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(supplier_id: int, supplier_data: SupplierUpdate, db: Session = Depends(get_db_clients)):
    """Update a supplier"""
    try:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")

        for key, value in supplier_data.model_dump(exclude_unset=True).items():
            setattr(supplier, key, value)

        db.commit()
        db.refresh(supplier)
        return supplier
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Supplier update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update supplier")


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db_clients)):
    """Delete a supplier"""
    try:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")

        db.delete(supplier)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Supplier deletion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete supplier")
