from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from core.database import SessionLocalSamples
from .base_service import BaseService


class StyleService(BaseService):
    """Service for fetching style data from samples database"""

    def get_session(self) -> Session:
        """Get a new session for samples database"""
        return SessionLocalSamples()

    def get_by_id(self, style_id: int, db: Session = None) -> Optional[Dict[str, Any]]:
        """Get style summary by ID"""
        # Import here to avoid circular imports
        from modules.samples.models.sample import StyleSummary

        close_session = False
        if db is None:
            db = self.get_session()
            close_session = True

        try:
            style = db.query(StyleSummary).filter(StyleSummary.id == style_id).first()
            return self.to_dict(style) if style else None
        finally:
            if close_session:
                db.close()

    def get_by_ids(self, style_ids: List[int], db: Session = None) -> Dict[int, Dict[str, Any]]:
        """Get multiple styles by IDs (batch lookup)"""
        if not style_ids:
            return {}

        # Import here to avoid circular imports
        from modules.samples.models.sample import StyleSummary

        close_session = False
        if db is None:
            db = self.get_session()
            close_session = True

        try:
            styles = db.query(StyleSummary).filter(StyleSummary.id.in_(style_ids)).all()
            return {style.id: self.to_dict(style) for style in styles}
        finally:
            if close_session:
                db.close()

    def get_style_name(self, style_id: int) -> Optional[str]:
        """Convenience method to get just style name"""
        style = self.get_by_id(style_id=style_id)
        return style.get("style_name") if style else None

    def get_variant_by_id(self, variant_id: int) -> Optional[Dict[str, Any]]:
        """Get style variant by ID"""
        from modules.samples.models.sample import StyleVariant

        db = self.get_session()
        try:
            variant = db.query(StyleVariant).filter(StyleVariant.id == variant_id).first()
            return self.to_dict(variant) if variant else None
        finally:
            db.close()

    def get_variants_by_ids(self, variant_ids: List[int]) -> Dict[int, Dict[str, Any]]:
        """Get multiple variants by IDs"""
        if not variant_ids:
            return {}

        from modules.samples.models.sample import StyleVariant

        db = self.get_session()
        try:
            variants = db.query(StyleVariant).filter(StyleVariant.id.in_(variant_ids)).all()
            return {v.id: self.to_dict(v) for v in variants}
        finally:
            db.close()


# Singleton instance
style_service = StyleService()
