from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db_clients
from core.logging import setup_logging
from modules.clients.models.client import BankingInfo
from modules.clients.schemas.buyer import BankingInfoCreate, BankingInfoResponse

logger = setup_logging()

router = APIRouter()


@router.post("/", response_model=BankingInfoResponse, status_code=status.HTTP_201_CREATED)
def create_banking_info(banking_data: BankingInfoCreate, db: Session = Depends(get_db_clients)):
    """Create banking information"""
    try:
        new_banking = BankingInfo(**banking_data.model_dump())
        db.add(new_banking)
        db.commit()
        db.refresh(new_banking)
        return new_banking
    except Exception as e:
        db.rollback()
        logger.error(f"Banking info creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create banking info")


@router.get("/", response_model=List[BankingInfoResponse])
def get_banking_info(
    client_name: str = Query(None, description="Filter by client name"),
    skip: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=10000, ge=1, le=10000, description="Max records per request"),
    db: Session = Depends(get_db_clients)
):
    """Get all banking information"""
    try:
        query = db.query(BankingInfo)
        if client_name:
            query = query.filter(BankingInfo.client_name.ilike(f"%{client_name}%"))
        
        banking_info = query.order_by(BankingInfo.id.desc()).offset(skip).limit(limit).all()
        return banking_info
    except Exception as e:
        logger.error(f"Banking info retrieval error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve banking info: {str(e)}")


@router.get("/{banking_id}", response_model=BankingInfoResponse)
def get_banking_info_by_id(banking_id: int, db: Session = Depends(get_db_clients)):
    """Get specific banking information"""
    try:
        banking = db.query(BankingInfo).filter(BankingInfo.id == banking_id).first()
        if not banking:
            raise HTTPException(status_code=404, detail="Banking info not found")
        return banking
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching banking info {banking_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch banking info: {str(e)}")


@router.put("/{banking_id}", response_model=BankingInfoResponse)
def update_banking_info(banking_id: int, banking_data: BankingInfoCreate, db: Session = Depends(get_db_clients)):
    """Update banking information"""
    try:
        banking = db.query(BankingInfo).filter(BankingInfo.id == banking_id).first()
        if not banking:
            raise HTTPException(status_code=404, detail="Banking info not found")

        for key, value in banking_data.model_dump(exclude_unset=True).items():
            setattr(banking, key, value)

        db.commit()
        db.refresh(banking)
        return banking
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Banking info update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update banking info")


@router.delete("/{banking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_banking_info(banking_id: int, db: Session = Depends(get_db_clients)):
    """Delete banking information"""
    try:
        banking = db.query(BankingInfo).filter(BankingInfo.id == banking_id).first()
        if not banking:
            raise HTTPException(status_code=404, detail="Banking info not found")

        db.delete(banking)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Banking info deletion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete banking info")