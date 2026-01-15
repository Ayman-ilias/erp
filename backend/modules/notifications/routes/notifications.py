"""
Notification Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from core.database import get_db_users
from core.security import decode_token
from modules.notifications.models.notification import Notification
from modules.notifications.schemas.notification import (
    NotificationResponse,
    NotificationCreate,
    NotificationUpdate
)
from modules.users.models.user import User

router = APIRouter(tags=["Notifications"])


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db_users)
) -> User:
    """Dependency to get current authenticated user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = 0,
    limit: Optional[int] = None,
    unread_only: bool = False,
    db: Session = Depends(get_db_users),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for the current user - filtered by department"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    # Filter by department - only show notifications for user's department
    if current_user.department:
        # Show notifications that match user's department or have no target_department (legacy)
        # Match if: target_department contains user's department (case-insensitive)
        user_dept_lower = current_user.department.lower()
        query = query.filter(
            (Notification.target_department == None) | 
            (func.lower(Notification.target_department).contains(user_dept_lower))
        )
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    db: Session = Depends(get_db_users),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications - filtered by department"""
    query = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    )
    
    # Filter by department - only count notifications for user's department
    if current_user.department:
        user_dept_lower = current_user.department.lower()
        query = query.filter(
            (Notification.target_department == None) | 
            (func.lower(Notification.target_department).contains(user_dept_lower))
        )
    
    count = query.count()
    return {"count": count}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db_users),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    from sqlalchemy.sql import func
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    notification.read_at = func.now()
    db.commit()
    db.refresh(notification)
    
    return notification


@router.put("/mark-all-read", response_model=dict)
async def mark_all_notifications_read(
    db: Session = Depends(get_db_users),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read for the current user"""
    from sqlalchemy.sql import func
    
    updated = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        Notification.is_read: True,
        Notification.read_at: func.now()
    })
    
    db.commit()
    return {"message": f"{updated} notifications marked as read"}


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db_users)
):
    """Create a new notification (internal use - typically called from other services)"""
    db_notification = Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

