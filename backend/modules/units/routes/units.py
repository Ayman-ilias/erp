"""
Unit Conversion System API Routes

Comprehensive API for managing units, categories, and performing conversions.
Supports SI, International, Desi, English, and CGS units.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
import logging

from core.database import get_db_units
from ..models.unit import UnitCategory, Unit, UnitAlias, ConversionHistory, UnitTypeEnum
from ..schemas.unit import (
    # Category schemas
    UnitCategoryCreate,
    UnitCategoryUpdate,
    UnitCategoryResponse,
    UnitCategoryWithCount,
    UnitCategoryWithUnits,
    # Unit schemas
    UnitCreate,
    UnitUpdate,
    UnitResponse,
    UnitWithCategory,
    UnitForSelector,
    # Conversion schemas
    ConversionRequest,
    ConversionResponse,
    BatchConversionRequest,
    BatchConversionResponse,
    # Validation schemas
    SymbolValidationRequest,
    SymbolValidationResponse,
    # Alias schemas
    UnitAliasCreate,
    UnitAliasResponse,
    # Audit schemas
    UnitChangeAuditResponse,
    UnitChangeAuditWithDetails,
    AuditLogResponse,
    AuditSummaryResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/units", tags=["Unit Conversion System"])


# =============================================================================
# UNIT CATEGORY ENDPOINTS
# =============================================================================

@router.post("/categories", response_model=UnitCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: UnitCategoryCreate,
    db: Session = Depends(get_db_units)
):
    """Create a new unit category"""
    # Check for duplicate name
    existing = db.query(UnitCategory).filter(
        func.lower(UnitCategory.name) == func.lower(data.name)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{data.name}' already exists"
        )

    category = UnitCategory(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/categories", response_model=List[UnitCategoryResponse])
def get_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db_units)
):
    """Get all unit categories"""
    query = db.query(UnitCategory)

    if is_active is not None:
        query = query.filter(UnitCategory.is_active == is_active)

    return query.order_by(UnitCategory.sort_order, UnitCategory.name).offset(skip).limit(limit).all()


@router.get("/categories/with-counts", response_model=List[UnitCategoryWithCount])
def get_categories_with_counts(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db_units)
):
    """Get all unit categories with unit counts"""
    query = db.query(
        UnitCategory,
        func.count(Unit.id).label('unit_count')
    ).outerjoin(Unit, Unit.category_id == UnitCategory.id)

    if is_active is not None:
        query = query.filter(UnitCategory.is_active == is_active)

    results = query.group_by(UnitCategory.id).order_by(
        UnitCategory.sort_order, UnitCategory.name
    ).all()

    categories = []
    for cat, count in results:
        cat_dict = {
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "base_unit_name": cat.base_unit_name,
            "base_unit_symbol": cat.base_unit_symbol,
            "icon": cat.icon,
            "industry_use": cat.industry_use,
            "sort_order": cat.sort_order,
            "is_active": cat.is_active,
            "created_at": cat.created_at,
            "updated_at": cat.updated_at,
            "unit_count": count,
            "base_unit": cat.base_unit_symbol
        }
        categories.append(cat_dict)

    return categories


@router.get("/categories/{category_id}", response_model=UnitCategoryWithUnits)
def get_category(
    category_id: int,
    include_units: bool = Query(True),
    db: Session = Depends(get_db_units)
):
    """Get a specific unit category by ID"""
    category = db.query(UnitCategory).filter(UnitCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    response = {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "base_unit_name": category.base_unit_name,
        "base_unit_symbol": category.base_unit_symbol,
        "icon": category.icon,
        "industry_use": category.industry_use,
        "sort_order": category.sort_order,
        "is_active": category.is_active,
        "created_at": category.created_at,
        "updated_at": category.updated_at,
        "units": []
    }

    if include_units:
        units = db.query(Unit).filter(
            Unit.category_id == category_id
        ).order_by(Unit.sort_order, Unit.name).all()
        response["units"] = units

    return response


@router.put("/categories/{category_id}", response_model=UnitCategoryResponse)
def update_category(
    category_id: int,
    data: UnitCategoryUpdate,
    db: Session = Depends(get_db_units)
):
    """Update a unit category"""
    category = db.query(UnitCategory).filter(UnitCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Check for duplicate name if name is being changed
    if data.name and data.name != category.name:
        existing = db.query(UnitCategory).filter(
            func.lower(UnitCategory.name) == func.lower(data.name),
            UnitCategory.id != category_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{data.name}' already exists"
            )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db_units)
):
    """Delete a unit category (and all its units due to CASCADE)"""
    category = db.query(UnitCategory).filter(UnitCategory.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    db.delete(category)
    db.commit()
    return None


# =============================================================================
# UNIT ENDPOINTS
# =============================================================================

@router.post("/", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
def create_unit(
    data: UnitCreate,
    db: Session = Depends(get_db_units)
):
    """Create a new unit"""
    # Check category exists
    category = db.query(UnitCategory).filter(UnitCategory.id == data.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found"
        )

    # Check for duplicate symbol in category
    existing = db.query(Unit).filter(
        Unit.category_id == data.category_id,
        func.lower(Unit.symbol) == func.lower(data.symbol)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unit symbol '{data.symbol}' already exists in this category"
        )

    # If this is marked as base unit, unset other base units in category
    if data.is_base:
        db.query(Unit).filter(
            Unit.category_id == data.category_id,
            Unit.is_base == True
        ).update({"is_base": False})

    unit = Unit(**data.model_dump())
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return unit


@router.get("/", response_model=List[UnitResponse])
def get_units(
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=1000),
    category_id: Optional[int] = None,
    unit_type: Optional[UnitTypeEnum] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db_units)
):
    """Get all units with optional filters"""
    query = db.query(Unit)

    if category_id:
        query = query.filter(Unit.category_id == category_id)

    if unit_type:
        query = query.filter(Unit.unit_type == unit_type)

    if is_active is not None:
        query = query.filter(Unit.is_active == is_active)

    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Unit.name).like(search_term),
                func.lower(Unit.symbol).like(search_term),
                func.lower(Unit.alternate_names).like(search_term)
            )
        )

    return query.order_by(Unit.category_id, Unit.sort_order, Unit.name).offset(skip).limit(limit).all()


@router.get("/for-selector", response_model=List[UnitForSelector])
def get_units_for_selector(
    category_id: Optional[int] = None,
    category_name: Optional[str] = None,
    is_active: bool = True,
    db: Session = Depends(get_db_units)
):
    """Get units optimized for dropdown selectors"""
    query = db.query(
        Unit.id,
        Unit.name,
        Unit.symbol,
        Unit.category_id,
        Unit.is_base,
        Unit.unit_type,
        UnitCategory.name.label('category_name')
    ).join(UnitCategory, Unit.category_id == UnitCategory.id)

    if category_id:
        query = query.filter(Unit.category_id == category_id)

    if category_name:
        query = query.filter(func.lower(UnitCategory.name) == func.lower(category_name))

    if is_active:
        query = query.filter(Unit.is_active == True)

    results = query.order_by(Unit.category_id, Unit.sort_order, Unit.name).all()

    return [
        {
            "id": r.id,
            "name": r.name,
            "symbol": r.symbol,
            "display_name": f"{r.name} ({r.symbol})",
            "category_id": r.category_id,
            "category_name": r.category_name,
            "is_base": r.is_base,
            "unit_type": r.unit_type
        }
        for r in results
    ]


@router.get("/search", response_model=List[UnitWithCategory])
def search_units(
    q: str = Query(..., min_length=1),
    category_id: Optional[int] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db_units)
):
    """Search units by name, symbol, or alternate names"""
    search_term = f"%{q.lower()}%"

    query = db.query(
        Unit,
        UnitCategory.name.label('category_name'),
        UnitCategory.base_unit_symbol.label('base_unit_symbol')
    ).join(UnitCategory, Unit.category_id == UnitCategory.id)

    query = query.filter(
        or_(
            func.lower(Unit.name).like(search_term),
            func.lower(Unit.symbol).like(search_term),
            func.lower(Unit.alternate_names).like(search_term)
        )
    )

    if category_id:
        query = query.filter(Unit.category_id == category_id)

    results = query.order_by(Unit.name).limit(limit).all()

    return [
        {
            **{c.key: getattr(unit, c.key) for c in Unit.__table__.columns},
            "category_name": category_name,
            "base_unit_symbol": base_unit_symbol
        }
        for unit, category_name, base_unit_symbol in results
    ]


@router.get("/{unit_id}", response_model=UnitResponse)
def get_unit(
    unit_id: int,
    db: Session = Depends(get_db_units)
):
    """Get a specific unit by ID"""
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    return unit


@router.put("/{unit_id}", response_model=UnitResponse)
def update_unit(
    unit_id: int,
    data: UnitUpdate,
    db: Session = Depends(get_db_units)
):
    """Update a unit"""
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )

    # Check for duplicate symbol if symbol is being changed
    if data.symbol and data.symbol != unit.symbol:
        category_id = data.category_id or unit.category_id
        existing = db.query(Unit).filter(
            Unit.category_id == category_id,
            func.lower(Unit.symbol) == func.lower(data.symbol),
            Unit.id != unit_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unit symbol '{data.symbol}' already exists in this category"
            )

    # If this is marked as base unit, unset other base units in category
    if data.is_base:
        category_id = data.category_id or unit.category_id
        db.query(Unit).filter(
            Unit.category_id == category_id,
            Unit.is_base == True,
            Unit.id != unit_id
        ).update({"is_base": False})

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(unit, key, value)

    db.commit()
    db.refresh(unit)
    return unit


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unit(
    unit_id: int,
    db: Session = Depends(get_db_units)
):
    """Delete a unit"""
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )

    db.delete(unit)
    db.commit()
    return None


# =============================================================================
# CONVERSION ENDPOINTS
# =============================================================================

@router.post("/convert", response_model=ConversionResponse)
def convert_units(
    data: ConversionRequest,
    log_conversion: bool = Query(False, description="Log this conversion to history"),
    db: Session = Depends(get_db_units)
):
    """
    Convert a value from one unit to another.

    Both units must be in the same category (e.g., both are Length units).
    Temperature conversions use special formulas.
    """
    # Find source unit
    from_unit = db.query(Unit).join(UnitCategory).filter(
        or_(
            func.lower(Unit.symbol) == func.lower(data.from_unit_symbol),
            func.lower(Unit.name) == func.lower(data.from_unit_symbol)
        )
    ).first()

    if not from_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source unit '{data.from_unit_symbol}' not found"
        )

    # Find target unit in the same category
    to_unit = db.query(Unit).filter(
        Unit.category_id == from_unit.category_id,
        or_(
            func.lower(Unit.symbol) == func.lower(data.to_unit_symbol),
            func.lower(Unit.name) == func.lower(data.to_unit_symbol)
        )
    ).first()

    if not to_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target unit '{data.to_unit_symbol}' not found in category"
        )

    # Get category info
    category = db.query(UnitCategory).filter(UnitCategory.id == from_unit.category_id).first()

    # Special handling for temperature
    if category.name.lower() == "temperature":
        result = _convert_temperature(data.value, from_unit.symbol, to_unit.symbol)
        conversion_factor = Decimal("1")  # Not applicable for temperature
    else:
        # Standard conversion: value * from_factor / to_factor
        base_value = data.value * from_unit.to_base_factor
        result = base_value / to_unit.to_base_factor
        conversion_factor = from_unit.to_base_factor / to_unit.to_base_factor

    # Round to appropriate decimal places
    result = round(result, to_unit.decimal_places)

    # Log conversion if requested
    if log_conversion:
        history = ConversionHistory(
            from_unit_id=from_unit.id,
            to_unit_id=to_unit.id,
            input_value=data.value,
            output_value=result,
            conversion_factor=conversion_factor
        )
        db.add(history)
        db.commit()

    return {
        "value": data.value,
        "from_unit": from_unit.symbol,
        "to_unit": to_unit.symbol,
        "result": result,
        "formula": f"{data.value} {from_unit.symbol} = {result} {to_unit.symbol}",
        "category": category.name,
        "base_unit": category.base_unit_symbol,
        "conversion_factor": conversion_factor
    }


@router.post("/convert/batch", response_model=BatchConversionResponse)
def batch_convert(
    data: BatchConversionRequest,
    db: Session = Depends(get_db_units)
):
    """Perform multiple conversions in a single request"""
    results = []

    for item in data.conversions:
        try:
            # Find units
            from_unit = db.query(Unit).filter(
                func.lower(Unit.symbol) == func.lower(item.from_unit)
            ).first()

            if not from_unit:
                results.append({
                    "error": f"Source unit '{item.from_unit}' not found",
                    "from": item.from_unit,
                    "to": item.to_unit
                })
                continue

            to_unit = db.query(Unit).filter(
                Unit.category_id == from_unit.category_id,
                func.lower(Unit.symbol) == func.lower(item.to_unit)
            ).first()

            if not to_unit:
                results.append({
                    "error": f"Target unit '{item.to_unit}' not found in category",
                    "from": item.from_unit,
                    "to": item.to_unit
                })
                continue

            # Get category for temperature check
            category = db.query(UnitCategory).filter(UnitCategory.id == from_unit.category_id).first()

            # Convert
            if category.name.lower() == "temperature":
                output = _convert_temperature(item.value, from_unit.symbol, to_unit.symbol)
            else:
                base_value = item.value * from_unit.to_base_factor
                output = base_value / to_unit.to_base_factor

            output = round(output, to_unit.decimal_places)

            results.append({
                "from": item.from_unit,
                "to": item.to_unit,
                "input": float(item.value),
                "output": float(output)
            })

        except Exception as e:
            results.append({
                "error": str(e),
                "from": item.from_unit,
                "to": item.to_unit
            })

    return {"results": results}


@router.get("/compatible/{unit_id}", response_model=List[UnitResponse])
def get_compatible_units(
    unit_id: int,
    db: Session = Depends(get_db_units)
):
    """Get all units compatible with a given unit (same category)"""
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )

    # Get all units in the same category (excluding the input unit)
    compatible = db.query(Unit).filter(
        Unit.category_id == unit.category_id,
        Unit.id != unit_id,
        Unit.is_active == True
    ).order_by(Unit.sort_order, Unit.name).all()

    return compatible


# =============================================================================
# VALIDATION ENDPOINTS
# =============================================================================

@router.post("/validate-symbol", response_model=SymbolValidationResponse)
def validate_symbol(
    data: SymbolValidationRequest,
    db: Session = Depends(get_db_units)
):
    """Validate if a unit symbol is unique within a category"""
    query = db.query(Unit).filter(
        Unit.category_id == data.category_id,
        func.lower(Unit.symbol) == func.lower(data.symbol)
    )

    if data.exclude_id:
        query = query.filter(Unit.id != data.exclude_id)

    existing = query.first()

    if existing:
        return {
            "is_valid": False,
            "message": f"Symbol '{data.symbol}' already exists in this category"
        }

    return {
        "is_valid": True,
        "message": None
    }


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _convert_temperature(value: Decimal, from_symbol: str, to_symbol: str) -> Decimal:
    """
    Convert temperature between Celsius, Fahrenheit, Kelvin, and Rankine.
    """
    value = float(value)
    from_sym = from_symbol.upper().replace("°", "")
    to_sym = to_symbol.upper().replace("°", "")

    # Convert to Celsius first (base)
    if from_sym in ("C", "CELSIUS"):
        celsius = value
    elif from_sym in ("F", "FAHRENHEIT"):
        celsius = (value - 32) * 5 / 9
    elif from_sym in ("K", "KELVIN"):
        celsius = value - 273.15
    elif from_sym in ("R", "RANKINE"):
        celsius = (value * 5 / 9) - 273.15
    else:
        raise ValueError(f"Unknown temperature unit: {from_symbol}")

    # Convert from Celsius to target
    if to_sym in ("C", "CELSIUS"):
        result = celsius
    elif to_sym in ("F", "FAHRENHEIT"):
        result = (celsius * 9 / 5) + 32
    elif to_sym in ("K", "KELVIN"):
        result = celsius + 273.15
    elif to_sym in ("R", "RANKINE"):
        result = (celsius + 273.15) * 9 / 5
    else:
        raise ValueError(f"Unknown temperature unit: {to_symbol}")

    return Decimal(str(result))


# =============================================================================
# AUDIT ENDPOINTS
# =============================================================================

@router.get("/audit/unit-changes", response_model=AuditLogResponse)
def get_unit_change_audit_logs(
    table_name: Optional[str] = Query(None, description="Filter by table name (e.g., 'material_master', 'sample_required_materials')"),
    record_id: Optional[int] = Query(None, description="Filter by record ID"),
    field_name: Optional[str] = Query(None, description="Filter by field name (e.g., 'unit_id', 'weight_unit_id')"),
    changed_by: Optional[str] = Query(None, description="Filter by who made the change"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date (ISO format)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Number of records per page"),
    db: Session = Depends(get_db_units)
):
    """
    Get unit change audit logs with filtering and pagination.
    
    This endpoint retrieves audit logs for unit field changes across material-related models.
    Supports filtering by table, record, date range, and pagination.
    
    **Requirements: 15.4**
    
    **Example usage:**
    - Get all audit logs: `/audit/unit-changes`
    - Filter by table: `/audit/unit-changes?table_name=material_master`
    - Filter by record: `/audit/unit-changes?table_name=material_master&record_id=123`
    - Filter by date range: `/audit/unit-changes?start_date=2024-01-01T00:00:00&end_date=2024-01-31T23:59:59`
    """
    from ..services.audit_service import UnitChangeAuditService, AuditServiceError
    
    try:
        # Calculate offset for pagination
        offset = (page - 1) * page_size
        
        # Get audit logs with filtering
        logs = UnitChangeAuditService.get_audit_logs(
            table_name=table_name,
            record_id=record_id,
            field_name=field_name,
            changed_by=changed_by,
            start_date=start_date,
            end_date=end_date,
            limit=page_size,
            offset=offset
        )
        
        # Get total count for pagination (run same query without limit/offset)
        total_logs = UnitChangeAuditService.get_audit_logs(
            table_name=table_name,
            record_id=record_id,
            field_name=field_name,
            changed_by=changed_by,
            start_date=start_date,
            end_date=end_date,
            limit=10000,  # Large number to get all
            offset=0
        )
        total_count = len(total_logs)
        
        # Calculate pagination info
        total_pages = (total_count + page_size - 1) // page_size
        
        # Enrich logs with unit details
        enriched_logs = []
        for log in logs:
            enriched_log = {
                **log,
                "old_unit": None,
                "new_unit": None
            }
            
            # Get unit details for old_unit_id and new_unit_id
            if log.get("old_unit_id"):
                old_unit = db.query(Unit).filter(Unit.id == log["old_unit_id"]).first()
                if old_unit:
                    enriched_log["old_unit"] = {
                        "id": old_unit.id,
                        "name": old_unit.name,
                        "symbol": old_unit.symbol,
                        "category_id": old_unit.category_id
                    }
            
            if log.get("new_unit_id"):
                new_unit = db.query(Unit).filter(Unit.id == log["new_unit_id"]).first()
                if new_unit:
                    enriched_log["new_unit"] = {
                        "id": new_unit.id,
                        "name": new_unit.name,
                        "symbol": new_unit.symbol,
                        "category_id": new_unit.category_id
                    }
            
            enriched_logs.append(enriched_log)
        
        return {
            "logs": enriched_logs,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
        
    except AuditServiceError as e:
        logger.error(f"Audit service error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Audit service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving audit logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit logs"
        )


@router.get("/audit/summary", response_model=AuditSummaryResponse)
def get_audit_summary(
    table_name: Optional[str] = Query(None, description="Filter by table name"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date (ISO format)"),
    db: Session = Depends(get_db_units)
):
    """
    Get audit summary statistics.
    
    This endpoint provides summary statistics for unit change audit logs,
    including total changes, counts by table, and counts by change reason.
    
    **Requirements: 15.4**
    """
    from ..services.audit_service import UnitChangeAuditService, AuditServiceError
    
    try:
        summary = UnitChangeAuditService.get_audit_summary(
            table_name=table_name,
            start_date=start_date,
            end_date=end_date
        )
        
        return summary
        
    except AuditServiceError as e:
        logger.error(f"Audit service error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Audit service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving audit summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit summary"
        )
