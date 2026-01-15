from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import OperationalError, InvalidRequestError, SQLAlchemyError
from sqlalchemy import text
from typing import List
from core.database import get_db_clients, SessionLocalClients
from core.logging import setup_logging
from modules.clients.models.client import Buyer, BuyerType, ContactPerson, ShippingInfo, BankingInfo
from modules.clients.schemas.buyer import (
    BuyerTypeCreate, BuyerTypeResponse, BuyerTypeUpdate,
    BuyerCreate, BuyerResponse, BuyerUpdate,
    ContactPersonCreate, ContactPersonResponse,
    ShippingInfoCreate, ShippingInfoResponse,
    BankingInfoCreate, BankingInfoResponse
)

logger = setup_logging()

router = APIRouter()


# BuyerType endpoints
@router.post("/types", response_model=BuyerTypeResponse, status_code=status.HTTP_201_CREATED)
def create_buyer_type(buyer_type_data: BuyerTypeCreate, db: Session = Depends(get_db_clients)):
    """Create a new buyer type"""
    try:
        # Check if buyer type name already exists
        existing_type = db.query(BuyerType).filter(BuyerType.name == buyer_type_data.name).first()
        if existing_type:
            raise HTTPException(status_code=400, detail="Buyer type name already exists")
        
        new_buyer_type = BuyerType(**buyer_type_data.model_dump())
        db.add(new_buyer_type)
        db.commit()
        db.refresh(new_buyer_type)
        return new_buyer_type
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Buyer type creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create buyer type")


@router.get("/types", response_model=List[BuyerTypeResponse])
def get_buyer_types(
    is_active: bool = Query(default=None, description="Filter by active status"),
    db: Session = Depends(get_db_clients)
):
    """Get all buyer types"""
    query = db.query(BuyerType)
    if is_active is not None:
        query = query.filter(BuyerType.is_active == is_active)
    return query.order_by(BuyerType.name).all()


@router.get("/types/{buyer_type_id}", response_model=BuyerTypeResponse)
def get_buyer_type(buyer_type_id: int, db: Session = Depends(get_db_clients)):
    """Get a specific buyer type"""
    buyer_type = db.query(BuyerType).filter(BuyerType.id == buyer_type_id).first()
    if not buyer_type:
        raise HTTPException(status_code=404, detail="Buyer type not found")
    return buyer_type


@router.put("/types/{buyer_type_id}", response_model=BuyerTypeResponse)
def update_buyer_type(buyer_type_id: int, buyer_type_data: BuyerTypeUpdate, db: Session = Depends(get_db_clients)):
    """Update a buyer type"""
    try:
        buyer_type = db.query(BuyerType).filter(BuyerType.id == buyer_type_id).first()
        if not buyer_type:
            raise HTTPException(status_code=404, detail="Buyer type not found")

        # Check if name is being updated and if it already exists
        if buyer_type_data.name and buyer_type_data.name != buyer_type.name:
            existing_type = db.query(BuyerType).filter(BuyerType.name == buyer_type_data.name).first()
            if existing_type:
                raise HTTPException(status_code=400, detail="Buyer type name already exists")

        for key, value in buyer_type_data.model_dump(exclude_unset=True).items():
            setattr(buyer_type, key, value)

        db.commit()
        db.refresh(buyer_type)
        return buyer_type
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Buyer type update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update buyer type")


@router.delete("/types/{buyer_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_buyer_type(buyer_type_id: int, db: Session = Depends(get_db_clients)):
    """Delete a buyer type"""
    try:
        buyer_type = db.query(BuyerType).filter(BuyerType.id == buyer_type_id).first()
        if not buyer_type:
            raise HTTPException(status_code=404, detail="Buyer type not found")

        # Check if buyer type is being used by any buyers
        buyers_using_type = db.query(Buyer).filter(Buyer.buyer_type_id == buyer_type_id).count()
        if buyers_using_type > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete buyer type. {buyers_using_type} buyer(s) are using this type."
            )

        db.delete(buyer_type)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Buyer type deletion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete buyer type")


# Contact Person endpoints
@router.post("/contacts", response_model=ContactPersonResponse, status_code=status.HTTP_201_CREATED)
def create_contact(contact_data: ContactPersonCreate, db: Session = Depends(get_db_clients)):
    """Create a new contact person"""
    new_contact = ContactPerson(**contact_data.model_dump())
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact


@router.get("/contacts", response_model=List[ContactPersonResponse])
def get_contacts(buyer_id: int = None, db: Session = Depends(get_db_clients)):
    """Get all contact persons, optionally filtered by buyer"""
    try:
        query = db.query(ContactPerson)
        if buyer_id:
            query = query.filter(ContactPerson.buyer_id == buyer_id)
        return query.order_by(ContactPerson.id.desc()).all()
    except Exception as e:
        logger.error(f"Error fetching contacts: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch contacts: {str(e)}"
        )


# Shipping Info endpoints
@router.post("/shipping", response_model=ShippingInfoResponse, status_code=status.HTTP_201_CREATED)
def create_shipping_info(shipping_data: ShippingInfoCreate, db: Session = Depends(get_db_clients)):
    """Create shipping information"""
    new_shipping = ShippingInfo(**shipping_data.model_dump())
    db.add(new_shipping)
    db.commit()
    db.refresh(new_shipping)
    return new_shipping


@router.get("/shipping", response_model=List[ShippingInfoResponse])
def get_shipping_info(buyer_id: int = None, db: Session = Depends(get_db_clients)):
    """Get all shipping information"""
    try:
        query = db.query(ShippingInfo)
        if buyer_id:
            query = query.filter(ShippingInfo.buyer_id == buyer_id)
        
        # Try with joinedload first, fallback to simple query if relationship fails
        try:
            shipping_info = query.options(joinedload(ShippingInfo.buyer)).order_by(ShippingInfo.id.desc()).all()
        except Exception as rel_error:
            logger.warning(f"Failed to load buyer relationship: {rel_error}. Loading shipping info without relationship.")
            shipping_info = query.order_by(ShippingInfo.id.desc()).all()
        return shipping_info
    except Exception as e:
        logger.error(f"Error fetching shipping info: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch shipping info: {str(e)}"
        )


# Banking Info endpoints
@router.post("/banking", response_model=BankingInfoResponse, status_code=status.HTTP_201_CREATED)
def create_banking_info(banking_data: BankingInfoCreate, db: Session = Depends(get_db_clients)):
    """Create banking information"""
    new_banking = BankingInfo(**banking_data.model_dump())
    db.add(new_banking)
    db.commit()
    db.refresh(new_banking)
    return new_banking


@router.get("/banking", response_model=List[BankingInfoResponse])
def get_banking_info(db: Session = Depends(get_db_clients)):
    """Get all banking information"""
    try:
        return db.query(BankingInfo).order_by(BankingInfo.id.desc()).all()
    except Exception as e:
        logger.error(f"Error fetching banking info: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch banking info: {str(e)}"
        )


@router.delete("/banking/{banking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_banking_info(banking_id: int, db: Session = Depends(get_db_clients)):
    """Delete banking information"""
    banking = db.query(BankingInfo).filter(BankingInfo.id == banking_id).first()
    if not banking:
        raise HTTPException(status_code=404, detail="Banking info not found")

    db.delete(banking)
    db.commit()
    return None


# Buyer endpoints
@router.post("/", response_model=BuyerResponse, status_code=status.HTTP_201_CREATED)
def create_buyer(buyer_data: BuyerCreate, db: Session = Depends(get_db_clients)):
    """Create a new buyer"""
    try:
        new_buyer = Buyer(**buyer_data.model_dump())
        db.add(new_buyer)
        db.commit()
        db.refresh(new_buyer)
        return new_buyer
    except Exception as e:
        db.rollback()
        logger.error(f"Buyer creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create buyer")


@router.get("/", response_model=List[BuyerResponse])
def get_buyers(
    skip: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=10000, ge=1, le=10000, description="Max records per request"),
    db: Session = Depends(get_db_clients)
):
    """Get all buyers"""
    # Helper function to check and fix session state
    def ensure_healthy_session(session: Session) -> Session:
        """Check if session is healthy, return fresh session if needed"""
        try:
            # Try a simple query to check session health
            session.execute(text("SELECT 1"))
            return session
        except (OperationalError, InvalidRequestError, SQLAlchemyError) as check_error:
            error_str = str(check_error.orig) if hasattr(check_error, 'orig') else str(check_error)
            if 'InFailedSqlTransaction' in error_str or 'current transaction is aborted' in error_str.lower():
                logger.warning("Session in failed transaction state, creating fresh session")
                try:
                    session.rollback()
                    session.close()
                except Exception:
                    pass
                # Create a completely fresh session
                return SessionLocalClients()
            raise
    
    # Helper function to execute query with retry
    def execute_query(session: Session, use_joinedload: bool = True):
        """Execute buyers query with error handling"""
        try:
            if use_joinedload:
                return session.query(Buyer).options(
                    joinedload(Buyer.buyer_type)
                ).order_by(Buyer.id.desc()).offset(skip).limit(limit).all()
            else:
                return session.query(Buyer).order_by(Buyer.id.desc()).offset(skip).limit(limit).all()
        except (OperationalError, InvalidRequestError, SQLAlchemyError) as query_error:
            error_str = str(query_error.orig) if hasattr(query_error, 'orig') else str(query_error)
            if 'InFailedSqlTransaction' in error_str or 'current transaction is aborted' in error_str.lower():
                # Session is in bad state, need fresh session
                raise query_error  # Will be caught by outer handler
            raise
    
    # Use a local variable to track if we need to close a new session
    local_db = None
    should_close = False
    
    try:
        # Ensure session is healthy before querying
        try:
            db = ensure_healthy_session(db)
        except Exception as health_error:
            logger.warning(f"Session health check failed, using fresh session: {str(health_error)}")
            local_db = SessionLocalClients()
            db = local_db
            should_close = True
        
        # Try with joinedload first for better performance
        try:
            buyers = execute_query(db, use_joinedload=True)
        except (OperationalError, InvalidRequestError, SQLAlchemyError) as load_error:
            error_str = str(load_error.orig) if hasattr(load_error, 'orig') else str(load_error)
            if 'InFailedSqlTransaction' in error_str or 'current transaction is aborted' in error_str.lower():
                # Get fresh session and retry
                logger.warning(f"Transaction error detected, using fresh session: {str(load_error)}")
                if not should_close and local_db is None:
                    try:
                        db.rollback()
                        db.close()
                    except Exception:
                        pass
                local_db = SessionLocalClients()
                db = local_db
                should_close = True
                # Retry with simple query (no joinedload to avoid relationship issues)
                buyers = execute_query(db, use_joinedload=False)
            else:
                # Other relationship loading errors - fallback to simple query
                logger.warning(f"Failed to load buyer_type relationship: {str(load_error)}. Using simple query.")
                buyers = execute_query(db, use_joinedload=False)
        
        # Set buyer_type_id to None for buyers with broken relationships
        for buyer in buyers:
            try:
                _ = buyer.buyer_type  # Try to access relationship
            except Exception:
                buyer.buyer_type_id = None  # Clear broken reference
        
        return buyers
        
    except Exception as e:
        # Always rollback on any error
        try:
            if local_db:
                local_db.rollback()
            else:
                db.rollback()
        except Exception:
            pass
        
        logger.error(f"Error fetching buyers: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch buyers: {str(e)}"
        )
    finally:
        # Close local session if we created one
        if should_close and local_db:
            try:
                local_db.close()
            except Exception:
                pass


@router.get("/{buyer_id}", response_model=BuyerResponse)
def get_buyer(buyer_id: int, db: Session = Depends(get_db_clients)):
    """Get a specific buyer"""
    # Use simple query like suppliers route (no relationships to avoid errors)
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return buyer


@router.put("/{buyer_id}", response_model=BuyerResponse)
def update_buyer(buyer_id: int, buyer_data: BuyerUpdate, db: Session = Depends(get_db_clients)):
    """Update a buyer"""
    try:
        buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
        if not buyer:
            raise HTTPException(status_code=404, detail="Buyer not found")

        for key, value in buyer_data.model_dump(exclude_unset=True).items():
            setattr(buyer, key, value)

        db.commit()
        db.refresh(buyer)
        return buyer
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Buyer update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update buyer")


@router.delete("/{buyer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_buyer(buyer_id: int, db: Session = Depends(get_db_clients)):
    """Delete a buyer"""
    try:
        buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
        if not buyer:
            raise HTTPException(status_code=404, detail="Buyer not found")

        db.delete(buyer)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        error_msg = str(e)
        if "foreign key constraint" in error_msg.lower():
            raise HTTPException(
                status_code=400,
                detail="Cannot delete buyer. This buyer has related records (styles, contacts, shipping info, etc.). Please delete those first or contact administrator."
            )
        raise HTTPException(status_code=500, detail=f"Failed to delete buyer: {error_msg}")
