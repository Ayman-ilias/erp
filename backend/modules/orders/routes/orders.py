from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db_orders
from core.logging import setup_logging
from modules.orders.models.order import OrderManagement
from modules.orders.schemas.order import OrderCreate, OrderUpdate, OrderResponse

logger = setup_logging()

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db_orders)):
    """Create a new order"""
    try:
        # Check if order_no already exists
        existing_order = db.query(OrderManagement).filter(OrderManagement.order_no == order_data.order_no).first()
        if existing_order:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order with order_no '{order_data.order_no}' already exists"
            )
        
        new_order = OrderManagement(**order_data.model_dump())
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Order creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order. Please try again."
        )


@router.get("/", response_model=List[OrderResponse])
def get_orders(
    buyer_id: int = None,
    order_status: str = None,
    skip: int = 0,
    limit: int = 10000,
    db: Session = Depends(get_db_orders)
):
    """Get all orders with optional filters"""
    query = db.query(OrderManagement)
    
    if buyer_id:
        query = query.filter(OrderManagement.buyer_id == buyer_id)
    if order_status:
        query = query.filter(OrderManagement.order_status == order_status)
    
    orders = query.order_by(OrderManagement.id.desc()).offset(skip).limit(limit).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db_orders)):
    """Get a specific order by ID"""
    order = db.query(OrderManagement).filter(OrderManagement.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order_data: OrderUpdate, db: Session = Depends(get_db_orders)):
    """Update an order"""
    order = db.query(OrderManagement).filter(OrderManagement.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if updating order_no to a value that already exists
    if order_data.order_no and order_data.order_no != order.order_no:
        existing = db.query(OrderManagement).filter(OrderManagement.order_no == order_data.order_no).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order with order_no '{order_data.order_no}' already exists"
            )
    
    for key, value in order_data.model_dump(exclude_unset=True).items():
        setattr(order, key, value)
    
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db_orders)):
    """Delete an order"""
    order = db.query(OrderManagement).filter(OrderManagement.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(order)
    db.commit()
    return None

