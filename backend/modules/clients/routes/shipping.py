from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List
from core.database import get_db_clients
from core.logging import setup_logging
from modules.clients.models.client import ShippingInfo
from modules.clients.schemas.buyer import ShippingInfoCreate, ShippingInfoResponse

logger = setup_logging()

router = APIRouter()


@router.post("/", response_model=ShippingInfoResponse, status_code=status.HTTP_201_CREATED)
def create_shipping_info(shipping_data: ShippingInfoCreate, db: Session = Depends(get_db_clients)):
    """Create shipping information"""
    try:
        new_shipping = ShippingInfo(**shipping_data.model_dump())
        db.add(new_shipping)
        db.commit()
        db.refresh(new_shipping)
        return new_shipping
    except Exception as e:
        db.rollback()
        logger.error(f"Shipping info creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create shipping info")


@router.get("/", response_model=List[ShippingInfoResponse])
def get_shipping_info(
    buyer_id: int = Query(None, description="Filter by buyer ID"),
    skip: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=10000, ge=1, le=10000, description="Max records per request"),
    db: Session = Depends(get_db_clients)
):
    """Get all shipping information"""
    try:
        query = db.query(ShippingInfo)
        if buyer_id:
            query = query.filter(ShippingInfo.buyer_id == buyer_id)
        
        # Try with joinedload first, fallback to simple query if relationship fails
        try:
            shipping_info = query.options(joinedload(ShippingInfo.buyer)).order_by(ShippingInfo.id.desc()).offset(skip).limit(limit).all()
        except Exception as rel_error:
            logger.warning(f"Failed to load buyer relationship: {rel_error}. Loading shipping info without relationship.")
            shipping_info = query.order_by(ShippingInfo.id.desc()).offset(skip).limit(limit).all()
        return shipping_info
    except Exception as e:
        logger.error(f"Shipping info retrieval error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve shipping info: {str(e)}")


@router.get("/{shipping_id}", response_model=ShippingInfoResponse)
def get_shipping_info_by_id(shipping_id: int, db: Session = Depends(get_db_clients)):
    """Get specific shipping information"""
    try:
        # Try with joinedload first, fallback to simple query if relationship fails
        try:
            shipping = db.query(ShippingInfo).options(joinedload(ShippingInfo.buyer)).filter(ShippingInfo.id == shipping_id).first()
        except Exception as rel_error:
            logger.warning(f"Failed to load buyer relationship: {rel_error}. Loading shipping info without relationship.")
            shipping = db.query(ShippingInfo).filter(ShippingInfo.id == shipping_id).first()
        
        if not shipping:
            raise HTTPException(status_code=404, detail="Shipping info not found")
        return shipping
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching shipping info {shipping_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch shipping info: {str(e)}")


@router.put("/{shipping_id}", response_model=ShippingInfoResponse)
def update_shipping_info(shipping_id: int, shipping_data: ShippingInfoCreate, db: Session = Depends(get_db_clients)):
    """Update shipping information"""
    try:
        shipping = db.query(ShippingInfo).filter(ShippingInfo.id == shipping_id).first()
        if not shipping:
            raise HTTPException(status_code=404, detail="Shipping info not found")

        for key, value in shipping_data.model_dump(exclude_unset=True).items():
            setattr(shipping, key, value)

        db.commit()
        db.refresh(shipping)
        return shipping
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Shipping info update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update shipping info")


@router.delete("/{shipping_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shipping_info(shipping_id: int, db: Session = Depends(get_db_clients)):
    """Delete shipping information"""
    try:
        shipping = db.query(ShippingInfo).filter(ShippingInfo.id == shipping_id).first()
        if not shipping:
            raise HTTPException(status_code=404, detail="Shipping info not found")

        db.delete(shipping)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Shipping info deletion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete shipping info")