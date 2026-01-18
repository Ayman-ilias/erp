"""
Unit Text Mapping Service

Service for mapping plain text unit strings to unit_id references in the Unit Conversion System.
Handles normalization, variations, and special cases for unit text matching.

This service is used during migration to map existing plain text unit fields
to the new unit_id foreign key references.
"""

from typing import Optional, Dict, List, Tuple
from sqlalchemy.orm import Session
from core.database import SessionLocalUnits
from modules.units.models.unit import Unit, UnitAlias
import logging

logger = logging.getLogger(__name__)


class UnitMappingService:
    """
    Service for mapping plain text units to unit_id references.
    
    Handles:
    - Text normalization (lowercase, trim, whitespace)
    - Common variations (kg/Kg/KG → kilogram)
    - Special cases (gsm/GSM, piece/pcs/pc, meter/m)
    - Symbol and name matching
    - Alias matching
    """
    
    # Common unit text variations mapping
    # Maps common text variations to standardized search terms
    UNIT_VARIATIONS = {
        # Weight units
        "kg": "kilogram",
        "kgs": "kilogram",
        "kilo": "kilogram",
        "kilos": "kilogram",
        "kilogram": "kilogram",
        "kilograms": "kilogram",
        "g": "gram",
        "gm": "gram",
        "gms": "gram",
        "gram": "gram",
        "grams": "gram",
        "tola": "tola",
        "tolas": "tola",
        "seer": "seer",
        "seers": "seer",
        "ser": "seer",
        "maund": "maund",
        "maunds": "maund",
        "mon": "maund",
        "lb": "pound",
        "lbs": "pound",
        "pound": "pound",
        "pounds": "pound",
        "oz": "ounce",
        "ounce": "ounce",
        "ounces": "ounce",
        
        # Length units
        "m": "meter",
        "meter": "meter",
        "meters": "meter",
        "metre": "meter",
        "metres": "meter",
        "cm": "centimeter",
        "centimeter": "centimeter",
        "centimeters": "centimeter",
        "centimetre": "centimeter",
        "centimetres": "centimeter",
        "mm": "millimeter",
        "millimeter": "millimeter",
        "millimeters": "millimeter",
        "millimetre": "millimeter",
        "millimetres": "millimeter",
        "km": "kilometer",
        "kilometer": "kilometer",
        "kilometers": "kilometer",
        "kilometre": "kilometer",
        "kilometres": "kilometer",
        "inch": "inch",
        "inches": "inch",
        "in": "inch",
        "ft": "foot",
        "foot": "foot",
        "feet": "foot",
        "yd": "yard",
        "yard": "yard",
        "yards": "yard",
        
        # Textile units
        "gsm": "gsm",
        "g/m2": "gsm",
        "g/m²": "gsm",
        "grams per square meter": "gsm",
        "denier": "denier",
        "den": "denier",
        "tex": "tex",
        "momme": "momme",
        "mm": "momme",  # Context-dependent, but momme is less common
        "oz/yd2": "ounce per square yard",
        "oz/yd²": "ounce per square yard",
        
        # Count units
        "pc": "piece",
        "pcs": "piece",
        "piece": "piece",
        "pieces": "piece",
        "ea": "piece",
        "each": "piece",
        "dozen": "dozen",
        "doz": "dozen",
        "dzn": "dozen",
        "gross": "gross",
        "lakh": "lakh",
        "lac": "lakh",
        "crore": "crore",
        "cr": "crore",
        
        # Volume units
        "l": "liter",
        "liter": "liter",
        "liters": "liter",
        "litre": "liter",
        "litres": "liter",
        "ml": "milliliter",
        "milliliter": "milliliter",
        "milliliters": "milliliter",
        "millilitre": "milliliter",
        "millilitres": "milliliter",
        "gal": "gallon",
        "gallon": "gallon",
        "gallons": "gallon",
        
        # Area units
        "sqm": "square meter",
        "sq m": "square meter",
        "m2": "square meter",
        "m²": "square meter",
        "sqft": "square foot",
        "sq ft": "square foot",
        "ft2": "square foot",
        "ft²": "square foot",
        "sqyd": "square yard",
        "sq yd": "square yard",
        "yd2": "square yard",
        "yd²": "square yard",
        
        # Time units
        "sec": "second",
        "second": "second",
        "seconds": "second",
        "min": "minute",
        "minute": "minute",
        "minutes": "minute",
        "hr": "hour",
        "hour": "hour",
        "hours": "hour",
        "day": "day",
        "days": "day",
    }
    
    def __init__(self):
        """Initialize the unit mapping service."""
        self._unit_cache: Optional[Dict[str, Unit]] = None
        self._alias_cache: Optional[Dict[str, int]] = None
    
    def normalize_unit_text(self, text: str) -> str:
        """
        Normalize plain text unit string.
        
        Handles:
        - Lowercase conversion
        - Whitespace trimming
        - Multiple spaces to single space
        - Special character handling
        
        Args:
            text: Raw unit text (e.g., "  Kg ", "GSM", "piece  ")
        
        Returns:
            Normalized text (e.g., "kg", "gsm", "piece")
        
        Examples:
            >>> normalize_unit_text("  Kg ")
            'kg'
            >>> normalize_unit_text("GSM")
            'gsm'
            >>> normalize_unit_text("Piece  ")
            'piece'
        """
        if not text:
            return ""
        
        # Convert to lowercase
        normalized = text.lower()
        
        # Trim whitespace
        normalized = normalized.strip()
        
        # Replace multiple spaces with single space
        normalized = " ".join(normalized.split())
        
        # Remove common punctuation that might be present
        normalized = normalized.replace(".", "")
        
        return normalized
    
    def get_standardized_term(self, normalized_text: str) -> str:
        """
        Get standardized search term for a normalized unit text.
        
        Uses the UNIT_VARIATIONS mapping to convert common variations
        to standardized terms for searching.
        
        Args:
            normalized_text: Normalized unit text
        
        Returns:
            Standardized search term, or original text if no mapping exists
        
        Examples:
            >>> get_standardized_term("kg")
            'kilogram'
            >>> get_standardized_term("pcs")
            'piece'
            >>> get_standardized_term("gsm")
            'gsm'
        """
        return self.UNIT_VARIATIONS.get(normalized_text, normalized_text)
    
    def _load_unit_cache(self, db: Session) -> None:
        """
        Load all active units into cache for fast lookup.
        
        Creates two caches:
        1. Symbol cache: symbol -> Unit
        2. Name cache: name -> Unit
        
        Args:
            db: Database session for db-units
        """
        if self._unit_cache is not None:
            return
        
        logger.info("Loading unit cache from db-units...")
        
        # Query all active units
        units = db.query(Unit).filter(Unit.is_active == True).all()
        
        # Build cache dictionaries
        self._unit_cache = {}
        
        for unit in units:
            # Cache by symbol (lowercase)
            symbol_key = unit.symbol.lower()
            self._unit_cache[symbol_key] = unit
            
            # Cache by name (lowercase)
            name_key = unit.name.lower()
            self._unit_cache[name_key] = unit
            
            # Cache by alternate names if present
            if unit.alternate_names:
                alt_names = [name.strip().lower() for name in unit.alternate_names.split(",")]
                for alt_name in alt_names:
                    if alt_name:
                        self._unit_cache[alt_name] = unit
        
        logger.info(f"Loaded {len(units)} units into cache with {len(self._unit_cache)} lookup keys")
    
    def _load_alias_cache(self, db: Session) -> None:
        """
        Load all unit aliases into cache for fast lookup.
        
        Creates cache: alias_name -> unit_id
        
        Args:
            db: Database session for db-units
        """
        if self._alias_cache is not None:
            return
        
        logger.info("Loading unit alias cache from db-units...")
        
        # Query all aliases
        aliases = db.query(UnitAlias).all()
        
        # Build cache dictionary
        self._alias_cache = {}
        
        for alias in aliases:
            # Cache by alias name (lowercase)
            alias_key = alias.alias_name.lower()
            self._alias_cache[alias_key] = alias.unit_id
            
            # Cache by alias symbol if present (lowercase)
            if alias.alias_symbol:
                symbol_key = alias.alias_symbol.lower()
                self._alias_cache[symbol_key] = alias.unit_id
        
        logger.info(f"Loaded {len(aliases)} aliases into cache")
    
    def search_unit_by_text(
        self,
        text: str,
        db: Optional[Session] = None
    ) -> Optional[Unit]:
        """
        Search for a unit by plain text (symbol or name).
        
        Search strategy:
        1. Normalize the input text
        2. Try direct cache lookup by normalized text
        3. Try standardized term lookup
        4. Try alias lookup
        5. Try partial name matching
        
        Args:
            text: Plain text unit string (e.g., "kg", "Piece", "GSM")
            db: Optional database session (creates new one if not provided)
        
        Returns:
            Unit object if found, None otherwise
        
        Examples:
            >>> search_unit_by_text("kg")
            <Unit(id=1, name='Kilogram', symbol='kg')>
            >>> search_unit_by_text("pcs")
            <Unit(id=50, name='Piece', symbol='pc')>
            >>> search_unit_by_text("unknown")
            None
        """
        if not text:
            return None
        
        # Normalize the text
        normalized = self.normalize_unit_text(text)
        if not normalized:
            return None
        
        # Create database session if not provided
        should_close_db = False
        if db is None:
            db = SessionLocalUnits()
            should_close_db = True
        
        try:
            # Load caches if not already loaded
            self._load_unit_cache(db)
            self._load_alias_cache(db)
            
            # Strategy 1: Direct cache lookup by normalized text
            if normalized in self._unit_cache:
                logger.debug(f"Found unit by direct lookup: '{text}' -> '{normalized}'")
                return self._unit_cache[normalized]
            
            # Strategy 2: Try standardized term
            standardized = self.get_standardized_term(normalized)
            if standardized != normalized and standardized in self._unit_cache:
                logger.debug(f"Found unit by standardized term: '{text}' -> '{standardized}'")
                return self._unit_cache[standardized]
            
            # Strategy 3: Try alias lookup
            if normalized in self._alias_cache:
                unit_id = self._alias_cache[normalized]
                unit = db.query(Unit).filter(Unit.id == unit_id).first()
                if unit:
                    logger.debug(f"Found unit by alias: '{text}' -> unit_id={unit_id}")
                    return unit
            
            # Strategy 4: Try partial name matching (last resort)
            # This is slower but catches cases like "kilogram" matching "Kilogram (kg)"
            unit = db.query(Unit).filter(
                Unit.is_active == True,
                Unit.name.ilike(f"%{normalized}%")
            ).first()
            
            if unit:
                logger.debug(f"Found unit by partial name match: '{text}' -> '{unit.name}'")
                return unit
            
            # Not found
            logger.warning(f"No unit found for text: '{text}' (normalized: '{normalized}')")
            return None
            
        finally:
            if should_close_db:
                db.close()
    
    def map_text_to_unit_id(
        self,
        text: str,
        db: Optional[Session] = None
    ) -> Optional[int]:
        """
        Map plain text unit to unit_id.
        
        Convenience method that returns just the unit_id instead of the full Unit object.
        
        Args:
            text: Plain text unit string
            db: Optional database session
        
        Returns:
            unit_id if found, None otherwise
        
        Examples:
            >>> map_text_to_unit_id("kg")
            1
            >>> map_text_to_unit_id("pcs")
            50
            >>> map_text_to_unit_id("unknown")
            None
        """
        unit = self.search_unit_by_text(text, db)
        return unit.id if unit else None
    
    def batch_map_texts_to_unit_ids(
        self,
        texts: List[str],
        db: Optional[Session] = None
    ) -> Dict[str, Optional[int]]:
        """
        Map multiple plain text units to unit_ids in a single operation.
        
        More efficient than calling map_text_to_unit_id multiple times
        because it reuses the database session and caches.
        
        Args:
            texts: List of plain text unit strings
            db: Optional database session
        
        Returns:
            Dictionary mapping original text -> unit_id (or None if not found)
        
        Examples:
            >>> batch_map_texts_to_unit_ids(["kg", "piece", "meter"])
            {'kg': 1, 'piece': 50, 'meter': 10}
        """
        if not texts:
            return {}
        
        # Create database session if not provided
        should_close_db = False
        if db is None:
            db = SessionLocalUnits()
            should_close_db = True
        
        try:
            # Load caches once for all lookups
            self._load_unit_cache(db)
            self._load_alias_cache(db)
            
            # Map each text
            result = {}
            for text in texts:
                unit_id = self.map_text_to_unit_id(text, db)
                result[text] = unit_id
            
            return result
            
        finally:
            if should_close_db:
                db.close()
    
    def get_mapping_statistics(
        self,
        texts: List[str],
        db: Optional[Session] = None
    ) -> Dict[str, any]:
        """
        Get statistics about mapping success for a list of texts.
        
        Useful for migration validation and reporting.
        
        Args:
            texts: List of plain text unit strings
            db: Optional database session
        
        Returns:
            Dictionary with statistics:
            - total: Total number of texts
            - mapped: Number successfully mapped
            - unmapped: Number not mapped
            - success_rate: Percentage successfully mapped
            - unmapped_texts: List of texts that couldn't be mapped
        
        Examples:
            >>> get_mapping_statistics(["kg", "piece", "unknown", "meter"])
            {
                'total': 4,
                'mapped': 3,
                'unmapped': 1,
                'success_rate': 75.0,
                'unmapped_texts': ['unknown']
            }
        """
        if not texts:
            return {
                'total': 0,
                'mapped': 0,
                'unmapped': 0,
                'success_rate': 0.0,
                'unmapped_texts': []
            }
        
        # Get mappings
        mappings = self.batch_map_texts_to_unit_ids(texts, db)
        
        # Calculate statistics
        total = len(texts)
        mapped = sum(1 for unit_id in mappings.values() if unit_id is not None)
        unmapped = total - mapped
        success_rate = (mapped / total * 100) if total > 0 else 0.0
        unmapped_texts = [text for text, unit_id in mappings.items() if unit_id is None]
        
        return {
            'total': total,
            'mapped': mapped,
            'unmapped': unmapped,
            'success_rate': success_rate,
            'unmapped_texts': unmapped_texts
        }
    
    def clear_cache(self) -> None:
        """
        Clear the internal caches.
        
        Useful if units are added/modified during runtime and cache needs refresh.
        """
        self._unit_cache = None
        self._alias_cache = None
        logger.info("Unit mapping cache cleared")


# Singleton instance for convenience
_unit_mapping_service = UnitMappingService()


def get_unit_mapping_service() -> UnitMappingService:
    """
    Get the singleton unit mapping service instance.
    
    Returns:
        UnitMappingService instance
    """
    return _unit_mapping_service
