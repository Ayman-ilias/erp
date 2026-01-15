"""
Common dependencies for FastAPI routes
Provides reusable dependency functions for authentication and database access
"""
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db_users
from core.security import decode_token
from modules.users.models.user import User
from core.logging import setup_logging

logger = setup_logging()


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db_users)
) -> User:
    """
    Dependency to get current authenticated user from JWT token
    
    Usage:
        @router.post("/endpoint")
        def my_endpoint(
            current_user: User = Depends(get_current_user),
            db: Session = Depends(get_db_samples)
        ):
            # current_user is the authenticated User object
            pass
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


def get_current_username(
    authorization: Optional[str] = Header(None)
) -> str:
    """
    Dependency to get current username from JWT token (lightweight, no DB query)
    
    Usage:
        @router.post("/endpoint")
        def my_endpoint(
            username: str = Depends(get_current_username),
            db: Session = Depends(get_db_samples)
        ):
            # username is the authenticated username string
            pass
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return username
