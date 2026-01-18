"""
Validation Service for Unit Conversion Integration

This service validates unit_id references across databases (db-samples ↔ db-units).
Handles cross-database validation with proper error handling for connection failures.

Validates Requirements: 9.5, 13.3
"""

from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, DatabaseError
from core.database import SessionLocalUnits
from modules.units.models.unit import Unit, UnitCategory
import logging

logger = logging.getLogger(__name__)


class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


class DatabaseConnectionError(Exception):
    """Custom exception for database connection failures"""
    pass


class ValidationService:
    """
    Service for validating unit references across databases.
    
    This service handles cross-database validation between db-samples and db-units,
    with comprehensive error handling for connection failures and invalid references.
    """
    
    @staticmethod
    def validate_unit_id(unit_id: int) -> bool:
        """
        Validate that unit_id exists and is active in the Unit Conversion System.
        
        Args:
            unit_id: The unit ID to validate
            
        Returns:
            bool: True if unit exists and is active, False otherwise
            
        Raises:
            DatabaseConnectionError: If connection to db-units fails
            ValidationError: If validation cannot be performed
            
        Example:
            >>> ValidationService.validate_unit_id(1)
            True
            >>> ValidationService.validate_unit_id(99999)
            False
        """
        if not unit_id or unit_id <= 0:
            logger.warning(f"Invalid unit_id provided: {unit_id}")
            return False
        
        db: Optional[Session] = None
        try:
            db = SessionLocalUnits()
            
            # Query for active unit
            unit = db.query(Unit).filter(
                Unit.id == unit_id,
                Unit.is_active == True
            ).first()
            
            result = unit is not None
            
            if not result:
                logger.warning(f"Unit validation failed: unit_id={unit_id} not found or inactive")
            else:
                logger.debug(f"Unit validation successful: unit_id={unit_id}, name={unit.name}")
            
            return result
            
        except OperationalError as e:
            logger.error(f"Database connection error while validating unit_id={unit_id}: {str(e)}")
            raise DatabaseConnectionError(
                f"Failed to connect to Unit Conversion System database: {str(e)}"
            )
        except DatabaseError as e:
            logger.error(f"Database error while validating unit_id={unit_id}: {str(e)}")
            raise ValidationError(
                f"Database error during unit validation: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error while validating unit_id={unit_id}: {str(e)}")
            raise ValidationError(
                f"Unexpected error during unit validation: {str(e)}"
            )
        finally:
            if db:
                try:
                    db.close()
                except Exception as e:
                    logger.error(f"Error closing database connection: {str(e)}")
    
    @staticmethod
    def validate_unit_category(unit_id: int, expected_category: str) -> bool:
        """
        Validate that unit belongs to the expected category.
        
        This is useful for ensuring that users select appropriate units for specific fields.
        For example, ensuring weight fields only accept units from the "Weight" category.
        
        Args:
            unit_id: The unit ID to validate
            expected_category: The expected category name (e.g., "Weight", "Length")
            
        Returns:
            bool: True if unit belongs to expected category, False otherwise
            
        Raises:
            DatabaseConnectionError: If connection to db-units fails
            ValidationError: If validation cannot be performed
            
        Example:
            >>> ValidationService.validate_unit_category(1, "Weight")
            True
            >>> ValidationService.validate_unit_category(1, "Length")
            False
        """
        if not unit_id or unit_id <= 0:
            logger.warning(f"Invalid unit_id provided: {unit_id}")
            return False
        
        if not expected_category or not expected_category.strip():
            logger.warning(f"Invalid expected_category provided: {expected_category}")
            return False
        
        db: Optional[Session] = None
        try:
            db = SessionLocalUnits()
            
            # Query for unit with category join
            unit = db.query(Unit).join(
                UnitCategory, Unit.category_id == UnitCategory.id
            ).filter(
                Unit.id == unit_id,
                UnitCategory.name == expected_category,
                Unit.is_active == True
            ).first()
            
            result = unit is not None
            
            if not result:
                # Get actual category for better error logging
                actual_unit = db.query(Unit).filter(Unit.id == unit_id).first()
                if actual_unit:
                    actual_category = db.query(UnitCategory).filter(
                        UnitCategory.id == actual_unit.category_id
                    ).first()
                    actual_category_name = actual_category.name if actual_category else "Unknown"
                    logger.warning(
                        f"Unit category validation failed: unit_id={unit_id} "
                        f"belongs to '{actual_category_name}', expected '{expected_category}'"
                    )
                else:
                    logger.warning(
                        f"Unit category validation failed: unit_id={unit_id} not found"
                    )
            else:
                logger.debug(
                    f"Unit category validation successful: unit_id={unit_id}, "
                    f"category={expected_category}"
                )
            
            return result
            
        except OperationalError as e:
            logger.error(
                f"Database connection error while validating unit_id={unit_id} "
                f"for category={expected_category}: {str(e)}"
            )
            raise DatabaseConnectionError(
                f"Failed to connect to Unit Conversion System database: {str(e)}"
            )
        except DatabaseError as e:
            logger.error(
                f"Database error while validating unit_id={unit_id} "
                f"for category={expected_category}: {str(e)}"
            )
            raise ValidationError(
                f"Database error during unit category validation: {str(e)}"
            )
        except Exception as e:
            logger.error(
                f"Unexpected error while validating unit_id={unit_id} "
                f"for category={expected_category}: {str(e)}"
            )
            raise ValidationError(
                f"Unexpected error during unit category validation: {str(e)}"
            )
        finally:
            if db:
                try:
                    db.close()
                except Exception as e:
                    logger.error(f"Error closing database connection: {str(e)}")
    
    @staticmethod
    def validate_unit_id_with_details(unit_id: int) -> Tuple[bool, Optional[dict]]:
        """
        Validate unit_id and return unit details if valid.
        
        This is a convenience method that combines validation with data retrieval,
        useful when you need both validation and unit information.
        
        Args:
            unit_id: The unit ID to validate
            
        Returns:
            Tuple[bool, Optional[dict]]: (is_valid, unit_details)
                - is_valid: True if unit exists and is active
                - unit_details: Dict with unit info if valid, None otherwise
                
        Raises:
            DatabaseConnectionError: If connection to db-units fails
            ValidationError: If validation cannot be performed
            
        Example:
            >>> is_valid, details = ValidationService.validate_unit_id_with_details(1)
            >>> if is_valid:
            ...     print(f"Unit: {details['name']} ({details['symbol']})")
        """
        if not unit_id or unit_id <= 0:
            logger.warning(f"Invalid unit_id provided: {unit_id}")
            return False, None
        
        db: Optional[Session] = None
        try:
            db = SessionLocalUnits()
            
            # Query for active unit with category
            unit = db.query(Unit).join(
                UnitCategory, Unit.category_id == UnitCategory.id
            ).filter(
                Unit.id == unit_id,
                Unit.is_active == True
            ).first()
            
            if not unit:
                logger.warning(f"Unit validation failed: unit_id={unit_id} not found or inactive")
                return False, None
            
            # Build unit details dictionary
            unit_details = {
                "id": unit.id,
                "name": unit.name,
                "symbol": unit.symbol,
                "category_id": unit.category_id,
                "category_name": unit.category.name,
                "unit_type": unit.unit_type.value if unit.unit_type else None,
                "is_base": unit.is_base,
                "decimal_places": unit.decimal_places,
                "to_base_factor": float(unit.to_base_factor) if unit.to_base_factor else None
            }
            
            logger.debug(
                f"Unit validation successful: unit_id={unit_id}, "
                f"name={unit.name}, category={unit.category.name}"
            )
            
            return True, unit_details
            
        except OperationalError as e:
            logger.error(f"Database connection error while validating unit_id={unit_id}: {str(e)}")
            raise DatabaseConnectionError(
                f"Failed to connect to Unit Conversion System database: {str(e)}"
            )
        except DatabaseError as e:
            logger.error(f"Database error while validating unit_id={unit_id}: {str(e)}")
            raise ValidationError(
                f"Database error during unit validation: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error while validating unit_id={unit_id}: {str(e)}")
            raise ValidationError(
                f"Unexpected error during unit validation: {str(e)}"
            )
        finally:
            if db:
                try:
                    db.close()
                except Exception as e:
                    logger.error(f"Error closing database connection: {str(e)}")
    
    @staticmethod
    def validate_multiple_unit_ids(unit_ids: list[int]) -> dict[int, bool]:
        """
        Validate multiple unit_ids in a single database query for efficiency.
        
        This is useful when validating multiple materials at once, reducing
        the number of database connections needed.
        
        Args:
            unit_ids: List of unit IDs to validate
            
        Returns:
            dict[int, bool]: Dictionary mapping unit_id to validation result
            
        Raises:
            DatabaseConnectionError: If connection to db-units fails
            ValidationError: If validation cannot be performed
            
        Example:
            >>> results = ValidationService.validate_multiple_unit_ids([1, 2, 99999])
            >>> print(results)
            {1: True, 2: True, 99999: False}
        """
        if not unit_ids:
            return {}
        
        # Filter out invalid IDs
        valid_ids = [uid for uid in unit_ids if uid and uid > 0]
        if not valid_ids:
            logger.warning("No valid unit_ids provided for batch validation")
            return {uid: False for uid in unit_ids}
        
        db: Optional[Session] = None
        try:
            db = SessionLocalUnits()
            
            # Query for all active units in the list
            active_units = db.query(Unit.id).filter(
                Unit.id.in_(valid_ids),
                Unit.is_active == True
            ).all()
            
            active_unit_ids = {unit.id for unit in active_units}
            
            # Build results dictionary
            results = {
                uid: uid in active_unit_ids
                for uid in unit_ids
            }
            
            invalid_count = sum(1 for v in results.values() if not v)
            logger.debug(
                f"Batch validation completed: {len(valid_ids)} units checked, "
                f"{invalid_count} invalid"
            )
            
            return results
            
        except OperationalError as e:
            logger.error(f"Database connection error during batch validation: {str(e)}")
            raise DatabaseConnectionError(
                f"Failed to connect to Unit Conversion System database: {str(e)}"
            )
        except DatabaseError as e:
            logger.error(f"Database error during batch validation: {str(e)}")
            raise ValidationError(
                f"Database error during batch unit validation: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error during batch validation: {str(e)}")
            raise ValidationError(
                f"Unexpected error during batch unit validation: {str(e)}"
            )
        finally:
            if db:
                try:
                    db.close()
                except Exception as e:
                    logger.error(f"Error closing database connection: {str(e)}")
