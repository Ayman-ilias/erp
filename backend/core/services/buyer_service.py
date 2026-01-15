from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from core.database import SessionLocalClients
from .base_service import BaseService


class BuyerService(BaseService):
    """Service for fetching buyer data from clients database"""

    def get_session(self) -> Session:
        """Get a new session for clients database"""
        return SessionLocalClients()

    def get_by_id(self, buyer_id: int, db: Session = None) -> Optional[Dict[str, Any]]:
        """
        Get buyer by ID.
        If db is None, creates its own session (for cross-DB calls)
        """
        # Import here to avoid circular imports
        from modules.clients.models.client import Buyer

        close_session = False
        if db is None:
            db = self.get_session()
            close_session = True

        try:
            buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
            return self.to_dict(buyer) if buyer else None
        finally:
            if close_session:
                db.close()

    def get_by_ids(self, buyer_ids: List[int], db: Session = None) -> Dict[int, Dict[str, Any]]:
        """
        Get multiple buyers by IDs (batch lookup for performance).
        Returns dict mapping buyer_id -> buyer_data
        """
        if not buyer_ids:
            return {}

        # Import here to avoid circular imports
        from modules.clients.models.client import Buyer

        close_session = False
        if db is None:
            db = self.get_session()
            close_session = True

        try:
            buyers = db.query(Buyer).filter(Buyer.id.in_(buyer_ids)).all()
            return {buyer.id: self.to_dict(buyer) for buyer in buyers}
        finally:
            if close_session:
                db.close()

    def get_buyer_name(self, buyer_id: int) -> Optional[str]:
        """Convenience method to get just buyer name"""
        buyer = self.get_by_id(buyer_id=buyer_id)
        return buyer.get("buyer_name") if buyer else None

    def get_all(self, skip: int = 0, limit: int = 1000) -> List[Dict[str, Any]]:
        """Get all buyers with pagination"""
        from modules.clients.models.client import Buyer

        db = self.get_session()
        try:
            buyers = db.query(Buyer).offset(skip).limit(limit).all()
            return [self.to_dict(buyer) for buyer in buyers]
        finally:
            db.close()


# Singleton instance
buyer_service = BuyerService()
