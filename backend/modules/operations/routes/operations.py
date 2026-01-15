from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db_samples
from modules.operations.models.operation import OperationMaster, SMVSettings, StyleSMV

router = APIRouter()


@router.get("/")
def get_operations(db: Session = Depends(get_db_samples)):
    """Get all operations"""
    operations = db.query(OperationMaster).order_by(OperationMaster.operation_id.desc()).all()
    return operations


@router.get("/smv-settings")
def get_smv_settings(db: Session = Depends(get_db_samples)):
    """Get SMV settings"""
    settings = db.query(SMVSettings).order_by(SMVSettings.setting_id.desc()).all()
    return settings
