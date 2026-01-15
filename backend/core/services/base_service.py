from typing import Optional, List, Dict, Any, TypeVar, Generic
from sqlalchemy.orm import Session
from abc import ABC, abstractmethod

T = TypeVar('T')


class BaseService(ABC, Generic[T]):
    """Base service class for cross-database lookups"""

    @abstractmethod
    def get_session(self) -> Session:
        """Get a new database session"""
        pass

    @abstractmethod
    def get_by_id(self, id: int, db: Session = None) -> Optional[Dict[str, Any]]:
        """Get single record by ID"""
        pass

    @abstractmethod
    def get_by_ids(self, ids: List[int], db: Session = None) -> Dict[int, Dict[str, Any]]:
        """Get multiple records by IDs (batch lookup)"""
        pass

    def to_dict(self, obj: T) -> Optional[Dict[str, Any]]:
        """Convert SQLAlchemy model to dictionary"""
        if obj is None:
            return None
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
