from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db_clients
from modules.clients.models.client import ContactPerson
from modules.clients.schemas.buyer import ContactPersonCreate, ContactPersonResponse
from core.logging import setup_logging

logger = setup_logging()

router = APIRouter()


@router.post("/", response_model=ContactPersonResponse, status_code=status.HTTP_201_CREATED)
def create_contact(contact_data: ContactPersonCreate, db: Session = Depends(get_db_clients)):
    """Create a new contact person"""
    try:
        new_contact = ContactPerson(**contact_data.model_dump())
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
        return new_contact
    except Exception as e:
        db.rollback()
        logger.error(f"Contact creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create contact")


@router.get("/", response_model=List[ContactPersonResponse])
def get_contacts(skip: int = 0, limit: Optional[int] = None, db: Session = Depends(get_db_clients)):
    """Get all contact persons"""
    contacts = db.query(ContactPerson).order_by(ContactPerson.id.desc()).offset(skip).limit(limit).all()
    return contacts


@router.get("/{contact_id}", response_model=ContactPersonResponse)
def get_contact(contact_id: int, db: Session = Depends(get_db_clients)):
    """Get a specific contact person"""
    contact = db.query(ContactPerson).filter(ContactPerson.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact person not found")
    return contact


@router.put("/{contact_id}", response_model=ContactPersonResponse)
def update_contact(contact_id: int, contact_data: ContactPersonCreate, db: Session = Depends(get_db_clients)):
    """Update a contact person"""
    try:
        contact = db.query(ContactPerson).filter(ContactPerson.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact person not found")

        for key, value in contact_data.model_dump(exclude_unset=True).items():
            setattr(contact, key, value)

        db.commit()
        db.refresh(contact)
        return contact
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Contact update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update contact")


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, db: Session = Depends(get_db_clients)):
    """Delete a contact person"""
    try:
        contact = db.query(ContactPerson).filter(ContactPerson.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact person not found")

        db.delete(contact)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Contact deletion error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete contact")
