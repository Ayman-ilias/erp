"""
Sample Material Service for Unit Conversion Integration

This service handles cross-database resolution between db-samples (sample materials) and db-units (units).
Provides methods for creating, updating, and retrieving sample materials with unit information.

Validates Requirements: 9.4, 14.4
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, DatabaseError
from datetime import datetime, timedelta
import logging

from core.database import SessionLocalSamples, SessionLocalUnits
from modules.samples.models.sample import SampleRequiredMaterial, StyleVariantMaterial
from modules.units.models.unit import Unit, UnitCategory
from modules.materials.services.validation_service import (
    ValidationService,
    ValidationError,
    DatabaseConnectionError
)
from modules.units.services.audit_service import UnitChangeAuditService

logger = logging.getLogger(__name__)


class SampleMaterialServiceError(Exception):
    """Custom exception for sample material service errors"""
    pass


class SampleMaterialService:
    """
    Service for managing sample materials with cross-database unit resolution.
    
    This service handles:
    - Creating sample materials with unit validation
    - Updating sample materials with unit validation
    - Retrieving sample materials with unit details from db-units
    - Batch unit resolution to avoid N+1 queries
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
    
    def get_sample_material_with_unit(self, material_id: int) -> Optional[Dict[str, Any]]:
        """
        Get sample material and resolve unit from db-units.
        
        Args:
            material_id: The sample material ID to retrieve
            
        Returns:
            Dictionary with material data and unit details, or None if not found
        """
        db_samples: Optional[Session] = None
        db_units: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            # Query material from db-samples
            material = db_samples.query(SampleRequiredMaterial).filter(
                SampleRequiredMaterial.id == material_id
            ).first()
            
            if not material:
                logger.warning(f"Sample material not found: material_id={material_id}")
                return None
            
            # Convert to dictionary
            material_dict = {
                "id": material.id,
                "sample_request_id": material.sample_request_id,
                "product_category": material.product_category,
                "product_id": material.product_id,
                "product_name": material.product_name,
                "required_quantity": material.required_quantity,
                "unit_id": material.unit_id,
                "remarks": material.remarks,
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
            
            return material_dict
            
        except Exception as e:
            logger.error(f"Error retrieving sample material {material_id}: {str(e)}")
            raise SampleMaterialServiceError(f"Failed to retrieve sample material: {str(e)}")
        finally:
            if db_samples:
                db_samples.close()
            if db_units:
                db_units.close()
    
    def get_sample_materials_with_units(
        self,
        sample_request_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get multiple sample materials with batch unit resolution (avoids N+1 queries).
        
        Args:
            sample_request_id: Optional filter by sample request ID
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            
        Returns:
            List of dictionaries with material data and unit details
        """
        db_samples: Optional[Session] = None
        db_units: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            # Query materials from db-samples
            query = db_samples.query(SampleRequiredMaterial)
            
            if sample_request_id:
                query = query.filter(SampleRequiredMaterial.sample_request_id == sample_request_id)
            
            materials = query.offset(skip).limit(limit).all()
            
            if not materials:
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
                    "sample_request_id": material.sample_request_id,
                    "product_category": material.product_category,
                    "product_id": material.product_id,
                    "product_name": material.product_name,
                    "required_quantity": material.required_quantity,
                    "unit_id": material.unit_id,
                    "remarks": material.remarks,
                    "created_at": material.created_at,
                    "updated_at": material.updated_at,
                    "unit": units_map.get(material.unit_id)
                }
                result.append(material_dict)
            
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving sample materials: {str(e)}")
            raise SampleMaterialServiceError(f"Failed to retrieve sample materials: {str(e)}")
        finally:
            if db_samples:
                db_samples.close()
            if db_units:
                db_units.close()
    
    def get_variant_material_with_units(self, material_id: int) -> Optional[Dict[str, Any]]:
        """
        Get style variant material and resolve both unit_id and weight_unit_id from db-units.
        
        Args:
            material_id: The variant material ID to retrieve
            
        Returns:
            Dictionary with material data and unit details, or None if not found
        """
        db_samples: Optional[Session] = None
        db_units: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            # Query material from db-samples
            material = db_samples.query(StyleVariantMaterial).filter(
                StyleVariantMaterial.id == material_id
            ).first()
            
            if not material:
                logger.warning(f"Variant material not found: material_id={material_id}")
                return None
            
            # Convert to dictionary
            material_dict = {
                "id": material.id,
                "style_variant_id": material.style_variant_id,
                "style_material_id": material.style_material_id,
                "product_category": material.product_category,
                "product_id": material.product_id,
                "product_name": material.product_name,
                "required_quantity": material.required_quantity,
                "unit_id": material.unit_id,
                "weight": material.weight,
                "weight_unit_id": material.weight_unit_id,
                "condition": material.condition,
                "created_at": material.created_at,
                "updated_at": material.updated_at
            }
            
            # Resolve both unit_id and weight_unit_id
            unit_ids_to_resolve = []
            if material.unit_id:
                unit_ids_to_resolve.append(material.unit_id)
            if material.weight_unit_id:
                unit_ids_to_resolve.append(material.weight_unit_id)
            
            if unit_ids_to_resolve:
                db_units = SessionLocalUnits()
                
                # Check cache first
                units_map = {}
                uncached_ids = []
                
                for uid in unit_ids_to_resolve:
                    cached = self._get_cached_unit(uid)
                    if cached:
                        units_map[uid] = cached
                    else:
                        uncached_ids.append(uid)
                
                # Query uncached units
                if uncached_ids:
                    units = db_units.query(Unit).join(
                        UnitCategory, Unit.category_id == UnitCategory.id
                    ).filter(
                        Unit.id.in_(uncached_ids)
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
                
                # Add unit details to material dict
                if material.unit_id:
                    material_dict["unit"] = units_map.get(material.unit_id)
                if material.weight_unit_id:
                    material_dict["weight_unit"] = units_map.get(material.weight_unit_id)
            
            return material_dict
            
        except Exception as e:
            logger.error(f"Error retrieving variant material {material_id}: {str(e)}")
            raise SampleMaterialServiceError(f"Failed to retrieve variant material: {str(e)}")
        finally:
            if db_samples:
                db_samples.close()
            if db_units:
                db_units.close()
    
    def get_variant_materials_with_units(
        self,
        style_variant_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get multiple variant materials with batch unit resolution (avoids N+1 queries).
        
        Args:
            style_variant_id: Optional filter by style variant ID
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            
        Returns:
            List of dictionaries with material data and unit details
        """
        db_samples: Optional[Session] = None
        db_units: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            # Query materials from db-samples
            query = db_samples.query(StyleVariantMaterial)
            
            if style_variant_id:
                query = query.filter(StyleVariantMaterial.style_variant_id == style_variant_id)
            
            materials = query.offset(skip).limit(limit).all()
            
            if not materials:
                return []
            
            # Extract unique unit_ids (both unit_id and weight_unit_id)
            unit_ids = set()
            for m in materials:
                if m.unit_id:
                    unit_ids.add(m.unit_id)
                if m.weight_unit_id:
                    unit_ids.add(m.weight_unit_id)
            
            unit_ids = list(unit_ids)
            
            # Check cache for units
            cached_units = {}
            uncached_unit_ids = []
            
            for unit_id in unit_ids:
                cached_unit = self._get_cached_unit(unit_id)
                if cached_unit:
                    cached_units[unit_id] = cached_unit
                else:
                    uncached_unit_ids.append(unit_id)
            
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
                    "style_variant_id": material.style_variant_id,
                    "style_material_id": material.style_material_id,
                    "product_category": material.product_category,
                    "product_id": material.product_id,
                    "product_name": material.product_name,
                    "required_quantity": material.required_quantity,
                    "unit_id": material.unit_id,
                    "weight": material.weight,
                    "weight_unit_id": material.weight_unit_id,
                    "condition": material.condition,
                    "created_at": material.created_at,
                    "updated_at": material.updated_at,
                    "unit": units_map.get(material.unit_id) if material.unit_id else None,
                    "weight_unit": units_map.get(material.weight_unit_id) if material.weight_unit_id else None
                }
                result.append(material_dict)
            
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving variant materials: {str(e)}")
            raise SampleMaterialServiceError(f"Failed to retrieve variant materials: {str(e)}")
        finally:
            if db_samples:
                db_samples.close()
            if db_units:
                db_units.close()
    
    def update_sample_material(
        self,
        material_id: int,
        unit_id: Optional[int] = None,
        required_quantity: Optional[float] = None,
        product_name: Optional[str] = None,
        remarks: Optional[str] = None,
        changed_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update sample material with unit validation and audit logging.
        
        Args:
            material_id: ID of the sample material to update
            unit_id: Optional new unit_id (must exist in db-units)
            required_quantity: Optional new quantity
            product_name: Optional new product name
            remarks: Optional new remarks
            changed_by: Optional user identifier for audit logging
            
        Returns:
            Dictionary with updated material data and unit details
            
        Raises:
            ValidationError: If unit_id is invalid
            SampleMaterialServiceError: If update fails or material not found
        """
        # Validate unit_id if provided
        if unit_id is not None:
            try:
                if not ValidationService.validate_unit_id(unit_id):
                    raise ValidationError(f"Invalid unit_id: {unit_id} (not found or inactive)")
            except Exception as e:
                logger.error(f"Error validating unit_id={unit_id}: {str(e)}")
                raise ValidationError(f"Unit validation failed: {str(e)}")
        
        db_samples: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            # Get existing material
            material = db_samples.query(SampleRequiredMaterial).filter(
                SampleRequiredMaterial.id == material_id
            ).first()
            
            if not material:
                raise SampleMaterialServiceError(f"Sample material not found: material_id={material_id}")
            
            # Store old unit_id for audit logging
            old_unit_id = material.unit_id
            
            # Update fields if provided
            if unit_id is not None:
                material.unit_id = unit_id
            if required_quantity is not None:
                material.required_quantity = required_quantity
            if product_name is not None:
                material.product_name = product_name
            if remarks is not None:
                material.remarks = remarks
            
            db_samples.commit()
            db_samples.refresh(material)
            
            # Log unit change if unit_id was updated
            if unit_id is not None and old_unit_id != unit_id:
                UnitChangeAuditService.log_unit_change(
                    table_name="sample_required_materials",
                    record_id=material_id,
                    field_name="unit_id",
                    old_unit_id=old_unit_id,
                    new_unit_id=unit_id,
                    changed_by=changed_by,
                    change_reason="user_update"
                )
                logger.info(
                    f"Logged unit change for sample material_id={material_id}: "
                    f"{old_unit_id} → {unit_id}"
                )
            
            logger.info(f"Updated sample material: material_id={material_id}")
            
            # Return material with unit details
            return self.get_sample_material_with_unit(material.id)
            
        except Exception as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Error updating sample material {material_id}: {str(e)}")
            raise SampleMaterialServiceError(f"Failed to update sample material: {str(e)}")
        finally:
            if db_samples:
                db_samples.close()
    
    def update_variant_material(
        self,
        material_id: int,
        unit_id: Optional[int] = None,
        weight_unit_id: Optional[int] = None,
        required_quantity: Optional[float] = None,
        weight: Optional[float] = None,
        product_name: Optional[str] = None,
        condition: Optional[str] = None,
        changed_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update style variant material with unit validation and audit logging.
        
        This method handles both unit_id and weight_unit_id fields and logs
        changes to both fields separately.
        
        Args:
            material_id: ID of the variant material to update
            unit_id: Optional new unit_id (must exist in db-units)
            weight_unit_id: Optional new weight_unit_id (must exist in db-units)
            required_quantity: Optional new quantity
            weight: Optional new weight
            product_name: Optional new product name
            condition: Optional new condition
            changed_by: Optional user identifier for audit logging
            
        Returns:
            Dictionary with updated material data and unit details
            
        Raises:
            ValidationError: If unit_id or weight_unit_id is invalid
            SampleMaterialServiceError: If update fails or material not found
        """
        # Validate unit_ids if provided
        if unit_id is not None:
            try:
                if not ValidationService.validate_unit_id(unit_id):
                    raise ValidationError(f"Invalid unit_id: {unit_id} (not found or inactive)")
            except Exception as e:
                logger.error(f"Error validating unit_id={unit_id}: {str(e)}")
                raise ValidationError(f"Unit validation failed: {str(e)}")
        
        if weight_unit_id is not None:
            try:
                if not ValidationService.validate_unit_id(weight_unit_id):
                    raise ValidationError(f"Invalid weight_unit_id: {weight_unit_id} (not found or inactive)")
            except Exception as e:
                logger.error(f"Error validating weight_unit_id={weight_unit_id}: {str(e)}")
                raise ValidationError(f"Weight unit validation failed: {str(e)}")
        
        db_samples: Optional[Session] = None
        
        try:
            db_samples = SessionLocalSamples()
            
            # Get existing material
            material = db_samples.query(StyleVariantMaterial).filter(
                StyleVariantMaterial.id == material_id
            ).first()
            
            if not material:
                raise SampleMaterialServiceError(f"Variant material not found: material_id={material_id}")
            
            # Store old unit_ids for audit logging
            old_unit_id = material.unit_id
            old_weight_unit_id = material.weight_unit_id
            
            # Update fields if provided
            if unit_id is not None:
                material.unit_id = unit_id
            if weight_unit_id is not None:
                material.weight_unit_id = weight_unit_id
            if required_quantity is not None:
                material.required_quantity = required_quantity
            if weight is not None:
                material.weight = weight
            if product_name is not None:
                material.product_name = product_name
            if condition is not None:
                material.condition = condition
            
            db_samples.commit()
            db_samples.refresh(material)
            
            # Log unit_id change if updated
            if unit_id is not None and old_unit_id != unit_id:
                UnitChangeAuditService.log_unit_change(
                    table_name="style_variant_materials",
                    record_id=material_id,
                    field_name="unit_id",
                    old_unit_id=old_unit_id,
                    new_unit_id=unit_id,
                    changed_by=changed_by,
                    change_reason="user_update"
                )
                logger.info(
                    f"Logged unit_id change for variant material_id={material_id}: "
                    f"{old_unit_id} → {unit_id}"
                )
            
            # Log weight_unit_id change if updated
            if weight_unit_id is not None and old_weight_unit_id != weight_unit_id:
                UnitChangeAuditService.log_unit_change(
                    table_name="style_variant_materials",
                    record_id=material_id,
                    field_name="weight_unit_id",
                    old_unit_id=old_weight_unit_id,
                    new_unit_id=weight_unit_id,
                    changed_by=changed_by,
                    change_reason="user_update"
                )
                logger.info(
                    f"Logged weight_unit_id change for variant material_id={material_id}: "
                    f"{old_weight_unit_id} → {weight_unit_id}"
                )
            
            logger.info(f"Updated variant material: material_id={material_id}")
            
            # Return material with unit details
            return self.get_variant_material_with_units(material.id)
            
        except Exception as e:
            if db_samples:
                db_samples.rollback()
            logger.error(f"Error updating variant material {material_id}: {str(e)}")
            raise SampleMaterialServiceError(f"Failed to update variant material: {str(e)}")
        finally:
            if db_samples:
                db_samples.close()
