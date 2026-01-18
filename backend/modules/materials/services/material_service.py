"""
Material Service for Unit Conversion Integration

This service handles cross-database resolution between db-samples (materials) and db-units (units).
Provides methods for creating, updating, and retrieving materials with unit information.

Validates Requirements: 9.4, 14.4
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, DatabaseError
from functools import lru_cache
from datetime import datetime, timedelta
import logging

from core.database import SessionLocalSamples, SessionLocalUnits
from modules.materials.models.material import MaterialMaster
from modules.units.models.unit import Unit, UnitCategory
from modules.materials.services.validation_service import (
    ValidationService,
    ValidationError,
    DatabaseConnectionError
)
from modules.units.services.audit_service import UnitChangeAuditService

logger = logging.getLogger(__name__)


class MaterialServiceError(Exception):
    """Custom exception for material service errors"""
    pass


class MaterialService:
    """
    Service for managing materials with cross-database unit resolution.
    
    This service handles:
    - Creating materials with unit validation
    - Updating materials with unit validation
    - Retrieving materials with unit details from db-units
    - Batch unit resolution to avoid N+1 queries
    - Caching frequently accessed units
    """
    
    # Cache for unit details (unit_id -> unit_dict)
    _unit_cache: Dict[int, Dict[str, Any]] = {}
    _cache_timestamp: Optional[datetime] = None
    _cache_ttl = timedelta(minutes=5)  # 5-minute cache
    
    @classmethod
    def _clear_cache_if_expired(cls):
        """Clear cache if TTL has expired"""
        if cls._cache_timestamp is None or datetime.now() - cls._cache_timestamp > cls._cache_ttl:
            cls._unit_cache.clear()
            cls._cache_timestamp = datetime.now()
            logger.debug("Unit cache cleared due to expiration")
    
    @classmethod
    def _get_cached_unit(cls, unit_id: int) -> Optional[Dict[str, Any]]:
        """Get unit from cache if available and not expired"""
        cls._clear_cache_if_expired()
        return cls._unit_cache.get(unit_id)
    
    @classmethod
    def _cache_unit(cls, unit_id: int, unit_data: Dict[str, Any]):
        """Cache unit data"""
        cls._clear_cache_if_expired()
        cls._unit_cache[unit_id] = unit_data
        logger.debug(f"Cached unit: unit_id={unit_id}, name={unit_data.get('name')}")
    
    @staticmethod
    def _resolve_unit_details(unit_id: int, db_units: Session) -> Optional[Dict[str, Any]]:
        """
        Resolve unit details from db-units.
        
        Args:
            unit_id: The unit ID to resolve
            db_units: Database session for db-units
            
        Returns:
            Dictionary with unit details or None if not found
        """
        try:
            unit = db_units.query(Unit).join(
                UnitCategory, Unit.category_id == UnitCategory.id
            ).filter(
                Unit.id == unit_id
            ).first()
            
            if not unit:
                logger.warning(f"Unit not found: unit_id={unit_id}")
                return None
            
            return {
                "id": unit.id,
                "name": unit.name,
                "symbol": unit.symbol,
                "category_id": unit.category_id,
                "category_name": unit.category.name,
                "unit_type": unit.unit_type.value if unit.unit_type else None,
                "is_base": unit.is_base,
                "decimal_places": unit.decimal_places
            }
        except Exception as e:
            logger.error(f"Error resolving unit details for unit_id={unit_id}: {str(e)}")
            return None
    
    def get_material_with_unit(self, material_id: int) -> Optional[Dict[str, Any]]:
        """
        Get material and resolve unit from db-units.
        
        This method retrieves a material from db-samples and enriches it with
        unit details from db-units, using caching to improve performance.
        
        Args:
            material_id: The material ID to retrieve
            
        Returns:
            Dictionary with material data and unit details, or None if not found
            
        Raises:
            DatabaseConnectionError: If connection to either database fails
            MaterialServiceError: If retrieval fails
            
        Example:
            >>> service = MaterialService()
            >>> material = service.get_material_with_unit(1)
            >>> print(f"{material['material_name']}: {material['unit']['symbol']}")
        """
        db_samples: Optional[Session] = None
        db_units: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            # Query material from db-samples
            material = db_samples.query(MaterialMaster).filter(
                MaterialMaster.id == material_id
            ).first()
            
            if not material:
                logger.warning(f"Material not found: material_id={material_id}")
                return None
            
            # Convert to dictionary
            material_dict = {
                "id": material.id,
                "material_name": material.material_name,
                "unit_id": material.unit_id,
                "material_category": material.material_category,
                "description": material.description,
                "created_at": material.created_at,
                "updated_at": material.updated_at
            }
            
            # Check cache first
            unit_data = self._get_cached_unit(material.unit_id)
            
            if unit_data is None:
                # Cache miss - query db-units
                db_units = SessionLocalUnits()
                unit_data = self._resolve_unit_details(material.unit_id, db_units)
                
                if unit_data:
                    self._cache_unit(material.unit_id, unit_data)
            else:
                logger.debug(f"Cache hit for unit_id={material.unit_id}")
            
            material_dict["unit"] = unit_data
            
            logger.debug(
                f"Retrieved material: material_id={material_id}, "
                f"name={material.material_name}, unit={unit_data.get('symbol') if unit_data else 'None'}"
            )
            
            return material_dict
            
        except OperationalError as e:
            logger.error(f"Database connection error while retrieving material_id={material_id}: {str(e)}")
            raise DatabaseConnectionError(
                f"Failed to connect to database: {str(e)}"
            )
        except DatabaseError as e:
            logger.error(f"Database error while retrieving material_id={material_id}: {str(e)}")
            raise MaterialServiceError(
                f"Database error during material retrieval: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error while retrieving material_id={material_id}: {str(e)}")
            raise MaterialServiceError(
                f"Unexpected error during material retrieval: {str(e)}"
            )
        finally:
            if db_samples:
                try:
                    db_samples.close()
                except Exception as e:
                    logger.error(f"Error closing db_samples connection: {str(e)}")
            if db_units:
                try:
                    db_units.close()
                except Exception as e:
                    logger.error(f"Error closing db_units connection: {str(e)}")
    
    def get_materials_with_units(
        self,
        skip: int = 0,
        limit: int = 100,
        category_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get multiple materials with batch unit resolution (avoids N+1 queries).
        
        This method efficiently retrieves multiple materials and resolves all their
        units in a single query to db-units, avoiding the N+1 query problem.
        
        Args:
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            category_filter: Optional material category filter
            
        Returns:
            List of dictionaries with material data and unit details
            
        Raises:
            DatabaseConnectionError: If connection to either database fails
            MaterialServiceError: If retrieval fails
            
        Example:
            >>> service = MaterialService()
            >>> materials = service.get_materials_with_units(skip=0, limit=50)
            >>> print(f"Retrieved {len(materials)} materials")
        """
        db_samples: Optional[Session] = None
        db_units: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            # Query materials from db-samples
            query = db_samples.query(MaterialMaster)
            
            if category_filter:
                query = query.filter(MaterialMaster.material_category == category_filter)
            
            materials = query.offset(skip).limit(limit).all()
            
            if not materials:
                logger.debug("No materials found")
                return []
            
            # Extract unique unit_ids
            unit_ids = list(set(m.unit_id for m in materials))
            
            # Check cache for units
            cached_units = {}
            uncached_unit_ids = []
            
            for unit_id in unit_ids:
                cached_unit = self._get_cached_unit(unit_id)
                if cached_unit:
                    cached_units[unit_id] = cached_unit
                else:
                    uncached_unit_ids.append(unit_id)
            
            logger.debug(
                f"Unit cache stats: {len(cached_units)} hits, "
                f"{len(uncached_unit_ids)} misses out of {len(unit_ids)} total"
            )
            
            # Batch query for uncached units from db-units
            units_map = cached_units.copy()
            
            if uncached_unit_ids:
                db_units = SessionLocalUnits()
                
                units = db_units.query(Unit).join(
                    UnitCategory, Unit.category_id == UnitCategory.id
                ).filter(
                    Unit.id.in_(uncached_unit_ids)
                ).all()
                
                for unit in units:
                    unit_data = {
                        "id": unit.id,
                        "name": unit.name,
                        "symbol": unit.symbol,
                        "category_id": unit.category_id,
                        "category_name": unit.category.name,
                        "unit_type": unit.unit_type.value if unit.unit_type else None,
                        "is_base": unit.is_base,
                        "decimal_places": unit.decimal_places
                    }
                    units_map[unit.id] = unit_data
                    self._cache_unit(unit.id, unit_data)
            
            # Build result list with unit details
            result = []
            for material in materials:
                material_dict = {
                    "id": material.id,
                    "material_name": material.material_name,
                    "unit_id": material.unit_id,
                    "material_category": material.material_category,
                    "description": material.description,
                    "created_at": material.created_at,
                    "updated_at": material.updated_at,
                    "unit": units_map.get(material.unit_id)
                }
                result.append(material_dict)
            
            logger.debug(
                f"Retrieved {len(result)} materials with units "
                f"(skip={skip}, limit={limit}, category={category_filter})"
            )
            
            return result
            
        except OperationalError as e:
            logger.error(f"Database connection error while retrieving materials: {str(e)}")
            raise DatabaseConnectionError(
                f"Failed to connect to database: {str(e)}"
            )
        except DatabaseError as e:
            logger.error(f"Database error while retrieving materials: {str(e)}")
            raise MaterialServiceError(
                f"Database error during materials retrieval: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error while retrieving materials: {str(e)}")
            raise MaterialServiceError(
                f"Unexpected error during materials retrieval: {str(e)}"
            )
        finally:
            if db_samples:
                try:
                    db_samples.close()
                except Exception as e:
                    logger.error(f"Error closing db_samples connection: {str(e)}")
            if db_units:
                try:
                    db_units.close()
                except Exception as e:
                    logger.error(f"Error closing db_units connection: {str(e)}")
    
    def create_material(
        self,
        material_name: str,
        unit_id: int,
        material_category: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create material with unit validation.
        
        This method validates that the unit_id exists and is active before
        creating the material record.
        
        Args:
            material_name: Name of the material
            unit_id: ID of the unit (must exist in db-units)
            material_category: Optional category (Fabric, Trims, etc.)
            description: Optional description
            
        Returns:
            Dictionary with created material data and unit details
            
        Raises:
            ValidationError: If unit_id is invalid
            DatabaseConnectionError: If connection to either database fails
            MaterialServiceError: If creation fails
            
        Example:
            >>> service = MaterialService()
            >>> material = service.create_material(
            ...     material_name="Cotton Fabric",
            ...     unit_id=1,
            ...     material_category="Fabric"
            ... )
        """
        # Validate unit_id first
        try:
            if not ValidationService.validate_unit_id(unit_id):
                raise ValidationError(f"Invalid unit_id: {unit_id} (not found or inactive)")
        except DatabaseConnectionError:
            raise
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error validating unit_id={unit_id}: {str(e)}")
            raise ValidationError(f"Unit validation failed: {str(e)}")
        
        db_samples: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            # Create material
            material = MaterialMaster(
                material_name=material_name,
                unit_id=unit_id,
                material_category=material_category,
                description=description
            )
            
            db_samples.add(material)
            db_samples.commit()
            db_samples.refresh(material)
            
            logger.info(
                f"Created material: material_id={material.id}, "
                f"name={material_name}, unit_id={unit_id}"
            )
            
            # Return material with unit details
            return self.get_material_with_unit(material.id)
            
        except OperationalError as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Database connection error while creating material: {str(e)}")
            raise DatabaseConnectionError(
                f"Failed to connect to database: {str(e)}"
            )
        except DatabaseError as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Database error while creating material: {str(e)}")
            raise MaterialServiceError(
                f"Database error during material creation: {str(e)}"
            )
        except Exception as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Unexpected error while creating material: {str(e)}")
            raise MaterialServiceError(
                f"Unexpected error during material creation: {str(e)}"
            )
        finally:
            if db_samples:
                try:
                    db_samples.close()
                except Exception as e:
                    logger.error(f"Error closing db_samples connection: {str(e)}")
    
    def update_material(
        self,
        material_id: int,
        material_name: Optional[str] = None,
        unit_id: Optional[int] = None,
        material_category: Optional[str] = None,
        description: Optional[str] = None,
        changed_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update material with unit validation and audit logging.
        
        This method validates the unit_id (if provided) before updating the material.
        Only provided fields are updated; None values are ignored.
        Unit changes are logged to the audit trail.
        
        Args:
            material_id: ID of the material to update
            material_name: Optional new name
            unit_id: Optional new unit_id (must exist in db-units)
            material_category: Optional new category
            description: Optional new description
            changed_by: Optional user identifier for audit logging
            
        Returns:
            Dictionary with updated material data and unit details
            
        Raises:
            ValidationError: If unit_id is invalid
            DatabaseConnectionError: If connection to either database fails
            MaterialServiceError: If update fails or material not found
            
        Example:
            >>> service = MaterialService()
            >>> material = service.update_material(
            ...     material_id=1,
            ...     unit_id=2,
            ...     description="Updated description",
            ...     changed_by="user_456"
            ... )
        """
        # Validate unit_id if provided
        if unit_id is not None:
            try:
                if not ValidationService.validate_unit_id(unit_id):
                    raise ValidationError(f"Invalid unit_id: {unit_id} (not found or inactive)")
            except DatabaseConnectionError:
                raise
            except ValidationError:
                raise
            except Exception as e:
                logger.error(f"Error validating unit_id={unit_id}: {str(e)}")
                raise ValidationError(f"Unit validation failed: {str(e)}")
        
        db_samples: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            # Get existing material
            material = db_samples.query(MaterialMaster).filter(
                MaterialMaster.id == material_id
            ).first()
            
            if not material:
                raise MaterialServiceError(f"Material not found: material_id={material_id}")
            
            # Store old unit_id for audit logging
            old_unit_id = material.unit_id
            
            # Update fields if provided
            if material_name is not None:
                material.material_name = material_name
            if unit_id is not None:
                material.unit_id = unit_id
            if material_category is not None:
                material.material_category = material_category
            if description is not None:
                material.description = description
            
            db_samples.commit()
            db_samples.refresh(material)
            
            # Log unit change if unit_id was updated
            if unit_id is not None and old_unit_id != unit_id:
                UnitChangeAuditService.log_unit_change(
                    table_name="material_master",
                    record_id=material_id,
                    field_name="unit_id",
                    old_unit_id=old_unit_id,
                    new_unit_id=unit_id,
                    changed_by=changed_by,
                    change_reason="user_update"
                )
                logger.info(
                    f"Logged unit change for material_id={material_id}: "
                    f"{old_unit_id} → {unit_id}"
                )
            
            logger.info(
                f"Updated material: material_id={material_id}, "
                f"name={material.material_name}, unit_id={material.unit_id}"
            )
            
            # Return material with unit details
            return self.get_material_with_unit(material.id)
            
        except MaterialServiceError:
            if db_samples:
                db_samples.rollback()
            raise
        except OperationalError as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Database connection error while updating material_id={material_id}: {str(e)}")
            raise DatabaseConnectionError(
                f"Failed to connect to database: {str(e)}"
            )
        except DatabaseError as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Database error while updating material_id={material_id}: {str(e)}")
            raise MaterialServiceError(
                f"Database error during material update: {str(e)}"
            )
        except Exception as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Unexpected error while updating material_id={material_id}: {str(e)}")
            raise MaterialServiceError(
                f"Unexpected error during material update: {str(e)}"
            )
        finally:
            if db_samples:
                try:
                    db_samples.close()
                except Exception as e:
                    logger.error(f"Error closing db_samples connection: {str(e)}")
    
    def delete_material(self, material_id: int) -> bool:
        """
        Delete material by ID.
        
        Args:
            material_id: ID of the material to delete
            
        Returns:
            True if deleted successfully, False if not found
            
        Raises:
            DatabaseConnectionError: If connection to database fails
            MaterialServiceError: If deletion fails
        """
        db_samples: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            material = db_samples.query(MaterialMaster).filter(
                MaterialMaster.id == material_id
            ).first()
            
            if not material:
                logger.warning(f"Material not found for deletion: material_id={material_id}")
                return False
            
            db_samples.delete(material)
            db_samples.commit()
            
            logger.info(f"Deleted material: material_id={material_id}, name={material.material_name}")
            
            return True
            
        except OperationalError as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Database connection error while deleting material_id={material_id}: {str(e)}")
            raise DatabaseConnectionError(
                f"Failed to connect to database: {str(e)}"
            )
        except DatabaseError as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Database error while deleting material_id={material_id}: {str(e)}")
            raise MaterialServiceError(
                f"Database error during material deletion: {str(e)}"
            )
        except Exception as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Unexpected error while deleting material_id={material_id}: {str(e)}")
            raise MaterialServiceError(
                f"Unexpected error during material deletion: {str(e)}"
            )
        finally:
            if db_samples:
                try:
                    db_samples.close()
                except Exception as e:
                    logger.error(f"Error closing db_samples connection: {str(e)}")
