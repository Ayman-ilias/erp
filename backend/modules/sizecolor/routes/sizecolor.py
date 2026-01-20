"""
Size & Color Master API Routes - Redesigned
============================================

COLOR SYSTEM:
- Universal Colors (Pantone/TCX/RGB/Hex)
- H&M Colors (separate table with H&M proprietary codes)

SIZE SYSTEM:
- Garment Types with Measurement Specs
- Size Master with Measurements
- Sample Color/Size Selections
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, or_
from typing import List, Optional
from datetime import datetime

from core.database import get_db_sizecolor
from modules.sizecolor.models.sizecolor import (
    # Models
    UniversalColor, HMColor,
    GarmentType, GarmentMeasurementSpec,
    SizeMaster, SizeMeasurement,
    SampleColorSelection, SampleSizeSelection,
    BuyerColorUsage, BuyerSizeUsage,
    # Enums
    ColorFamilyEnum, ColorTypeEnum, ColorValueEnum, FinishTypeEnum,
    GenderEnum, FitTypeEnum, AgeGroupEnum,
)
from modules.sizecolor.schemas.sizecolor import (
    # Universal Color
    UniversalColorCreate, UniversalColorUpdate, UniversalColorResponse,
    UniversalColorListResponse, UniversalColorForSelector,
    # H&M Color
    HMColorCreate, HMColorUpdate, HMColorResponse, HMColorListResponse, HMColorForSelector,
    # Garment Type
    GarmentTypeCreate, GarmentTypeUpdate, GarmentTypeResponse,
    GarmentTypeListResponse, GarmentTypeForSelector,
    GarmentMeasurementSpecCreate, GarmentMeasurementSpecResponse,
    # Size Master
    SizeMasterCreate, SizeMasterUpdate, SizeMasterResponse,
    SizeMasterListResponse, SizeMasterForSelector,
    SizeMeasurementCreate, SizeMeasurementUpdate, SizeMeasurementResponse,
    # Sample Selections
    SampleColorSelectionCreate, SampleColorSelectionResponse,
    SampleSizeSelectionCreate, SampleSizeSelectionResponse,
    # Buyer Usage
    BuyerColorUsageResponse, BuyerSizeUsageResponse, BuyerSuggestionResponse,
    # Search/Filter
    ColorSearchRequest, SizeFilterRequest,
    # Enums
    ColorFamilyEnum as SchemaColorFamilyEnum,
    ColorTypeEnum as SchemaColorTypeEnum,
    GenderEnum as SchemaGenderEnum,
    FitTypeEnum as SchemaFitTypeEnum,
    AgeGroupEnum as SchemaAgeGroupEnum,
)

router = APIRouter()


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def generate_universal_color_code(db: Session) -> str:
    """Generate unique universal color code like UC-0001"""
    max_id = db.query(func.max(UniversalColor.id)).scalar() or 0
    return f"UC-{max_id + 1:04d}"


def generate_size_code(db: Session, garment_code: str, size_name: str) -> str:
    """Generate unique size code like SZ-SWT-M-00001"""
    max_id = db.query(func.max(SizeMaster.id)).scalar() or 0
    return f"SZ-{garment_code}-{size_name[:3].upper()}-{max_id + 1:05d}"


# =============================================================================
# UNIVERSAL COLOR ROUTES
# =============================================================================

@router.get("/colors/universal", response_model=List[UniversalColorListResponse], tags=["universal-colors"])
def list_universal_colors(
    color_family: Optional[str] = Query(None),
    color_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db_sizecolor)
):
    """List all universal colors with filtering"""
    query = db.query(UniversalColor)

    if color_family:
        query = query.filter(UniversalColor.color_family == color_family)
    if color_type:
        query = query.filter(UniversalColor.color_type == color_type)
    if is_active is not None:
        query = query.filter(UniversalColor.is_active == is_active)
    if search:
        query = query.filter(
            or_(
                UniversalColor.color_code.ilike(f"%{search}%"),
                UniversalColor.color_name.ilike(f"%{search}%"),
                UniversalColor.hex_code.ilike(f"%{search}%"),
                UniversalColor.pantone_code.ilike(f"%{search}%"),
                UniversalColor.tcx_code.ilike(f"%{search}%"),
            )
        )

    colors = query.order_by(UniversalColor.color_family, UniversalColor.color_name).offset(skip).limit(limit).all()
    return colors


@router.get("/colors/universal/for-selector", response_model=List[UniversalColorForSelector], tags=["universal-colors"])
def get_universal_colors_for_selector(
    color_family: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db_sizecolor)
):
    """Get universal colors optimized for dropdown selectors"""
    query = db.query(UniversalColor).filter(UniversalColor.is_active == True)

    if color_family:
        query = query.filter(UniversalColor.color_family == color_family)
    if search:
        query = query.filter(
            or_(
                UniversalColor.color_name.ilike(f"%{search}%"),
                UniversalColor.pantone_code.ilike(f"%{search}%"),
                UniversalColor.tcx_code.ilike(f"%{search}%"),
                UniversalColor.hex_code.ilike(f"%{search}%"),
            )
        )

    colors = query.order_by(UniversalColor.color_name).limit(limit).all()

    return [
        UniversalColorForSelector(
            id=c.id,
            color_code=c.color_code,
            color_name=c.color_name,
            hex_code=c.hex_code,
            pantone_code=c.pantone_code,
            tcx_code=c.tcx_code,
            color_family=c.color_family.value if c.color_family else None,
            label=f"{c.color_name} ({c.pantone_code or c.tcx_code or c.hex_code or c.color_code})"
        )
        for c in colors
    ]


@router.get("/colors/universal/{color_id}", response_model=UniversalColorResponse, tags=["universal-colors"])
def get_universal_color(color_id: int, db: Session = Depends(get_db_sizecolor)):
    """Get a single universal color"""
    color = db.query(UniversalColor).filter(UniversalColor.id == color_id).first()
    if not color:
        raise HTTPException(status_code=404, detail="Universal color not found")
    return color


@router.get("/colors/universal/by-code/{code}", response_model=UniversalColorResponse, tags=["universal-colors"])
def get_universal_color_by_code(code: str, db: Session = Depends(get_db_sizecolor)):
    """Get universal color by Pantone, TCX, or Hex code"""
    code_upper = code.upper()
    color = db.query(UniversalColor).filter(
        or_(
            UniversalColor.pantone_code.ilike(f"%{code}%"),
            UniversalColor.tcx_code.ilike(f"%{code}%"),
            UniversalColor.hex_code == code_upper,
            UniversalColor.color_code == code_upper,
        )
    ).first()
    if not color:
        raise HTTPException(status_code=404, detail="Color not found for this code")
    return color


@router.post("/colors/universal", response_model=UniversalColorResponse, tags=["universal-colors"])
def create_universal_color(color_data: UniversalColorCreate, db: Session = Depends(get_db_sizecolor)):
    """Create a new universal color"""
    color_code = generate_universal_color_code(db)

    # Parse RGB from hex if not provided
    rgb_r = color_data.rgb_r
    rgb_g = color_data.rgb_g
    rgb_b = color_data.rgb_b
    if color_data.hex_code and (rgb_r is None or rgb_g is None or rgb_b is None):
        hex_clean = color_data.hex_code.lstrip('#')
        rgb_r = int(hex_clean[0:2], 16)
        rgb_g = int(hex_clean[2:4], 16)
        rgb_b = int(hex_clean[4:6], 16)

    color = UniversalColor(
        color_code=color_code,
        color_name=color_data.color_name,
        display_name=color_data.display_name,
        color_family=color_data.color_family,
        color_type=color_data.color_type,
        color_value=color_data.color_value,
        finish_type=color_data.finish_type,
        hex_code=color_data.hex_code.upper() if color_data.hex_code else None,
        rgb_r=rgb_r,
        rgb_g=rgb_g,
        rgb_b=rgb_b,
        pantone_code=color_data.pantone_code,
        tcx_code=color_data.tcx_code,
        tpx_code=color_data.tpx_code,
        description=color_data.description,
        season=color_data.season,
        year=color_data.year,
    )
    db.add(color)
    db.commit()
    db.refresh(color)
    return color


@router.put("/colors/universal/{color_id}", response_model=UniversalColorResponse, tags=["universal-colors"])
def update_universal_color(color_id: int, color_data: UniversalColorUpdate, db: Session = Depends(get_db_sizecolor)):
    """Update a universal color"""
    color = db.query(UniversalColor).filter(UniversalColor.id == color_id).first()
    if not color:
        raise HTTPException(status_code=404, detail="Universal color not found")

    update_data = color_data.model_dump(exclude_unset=True)

    # Update RGB from hex if hex changed
    if "hex_code" in update_data and update_data["hex_code"]:
        hex_clean = update_data["hex_code"].lstrip('#')
        update_data["rgb_r"] = int(hex_clean[0:2], 16)
        update_data["rgb_g"] = int(hex_clean[2:4], 16)
        update_data["rgb_b"] = int(hex_clean[4:6], 16)
        update_data["hex_code"] = update_data["hex_code"].upper()

    for field, value in update_data.items():
        setattr(color, field, value)

    db.commit()
    db.refresh(color)
    return color


@router.delete("/colors/universal/{color_id}", tags=["universal-colors"])
def delete_universal_color(color_id: int, db: Session = Depends(get_db_sizecolor)):
    """Delete a universal color"""
    color = db.query(UniversalColor).filter(UniversalColor.id == color_id).first()
    if not color:
        raise HTTPException(status_code=404, detail="Universal color not found")

    db.delete(color)
    db.commit()
    return {"message": "Universal color deleted successfully"}


# =============================================================================
# H&M COLOR ROUTES (Updated for simplified structure)
# =============================================================================

@router.get("/colors/hm", response_model=List[HMColorListResponse], tags=["hm-colors"])
def list_hm_colors(
    color_master: Optional[str] = Query(None),
    color_value: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    include_undefined: bool = Query(False, description="Include UNDEFINED records"),
    db: Session = Depends(get_db_sizecolor)
):
    """List all H&M colors with filtering - UPDATED VERSION"""
    query = db.query(HMColor)

    # Filter out UNDEFINED and NULL records by default unless explicitly requested
    if not include_undefined:
        query = query.filter(
            HMColor.color_master != "UNDEFINED",
            HMColor.color_master.isnot(None)
        )

    if color_master:
        query = query.filter(HMColor.color_master.ilike(f"%{color_master}%"))
    
    if color_value:
        query = query.filter(HMColor.color_value.ilike(f"%{color_value}%"))

    if is_active is not None:
        query = query.filter(HMColor.is_active == is_active)

    if search:
        query = query.filter(
            or_(
                HMColor.color_code.ilike(f"%{search}%"),
                HMColor.color_master.ilike(f"%{search}%"),
                HMColor.color_value.ilike(f"%{search}%"),
                HMColor.mixed_name.ilike(f"%{search}%"),
            )
        )

    colors = query.order_by(HMColor.color_master, HMColor.color_code).offset(skip).limit(limit).all()
    return colors


@router.get("/colors/hm/for-selector", response_model=List[HMColorForSelector], tags=["hm-colors"])
def get_hm_colors_for_selector(
    color_master: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db_sizecolor)
):
    """Get H&M colors optimized for dropdown selectors"""
    query = db.query(HMColor).filter(HMColor.is_active == True)

    if color_master:
        query = query.filter(HMColor.color_master.ilike(f"%{color_master}%"))

    if search:
        query = query.filter(
            or_(
                HMColor.color_code.ilike(f"%{search}%"),
                HMColor.color_master.ilike(f"%{search}%"),
                HMColor.color_value.ilike(f"%{search}%"),
                HMColor.mixed_name.ilike(f"%{search}%"),
            )
        )

    colors = query.order_by(HMColor.color_code).limit(limit).all()

    return [
        HMColorForSelector(
            id=c.id,
            color_code=c.color_code,
            color_master=c.color_master,
            color_value=c.color_value,
            mixed_name=c.mixed_name,
            label=f"{c.color_code} - {c.mixed_name or c.color_master}"
        )
        for c in colors
    ]


@router.get("/colors/hm/{color_id}", response_model=HMColorResponse, tags=["hm-colors"])
def get_hm_color(color_id: int, db: Session = Depends(get_db_sizecolor)):
    """Get a single H&M color"""
    color = db.query(HMColor).filter(HMColor.id == color_id).first()
    
    if not color:
        raise HTTPException(status_code=404, detail="H&M color not found")
    
    return color


@router.get("/colors/hm/by-code/{color_code}", response_model=HMColorResponse, tags=["hm-colors"])
def get_hm_color_by_code(color_code: str, db: Session = Depends(get_db_sizecolor)):
    """Get H&M color by color code (e.g., 51-138)"""
    color = db.query(HMColor).filter(HMColor.color_code == color_code).first()
    
    if not color:
        raise HTTPException(status_code=404, detail="H&M color not found for this code")
    
    return color


@router.post("/colors/hm", response_model=HMColorResponse, tags=["hm-colors"])
def create_hm_color(color_data: HMColorCreate, db: Session = Depends(get_db_sizecolor)):
    """Create a new H&M color"""
    # Check if color code already exists
    existing = db.query(HMColor).filter(HMColor.color_code == color_data.color_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Color code already exists")

    color = HMColor(**color_data.model_dump())
    db.add(color)
    db.commit()
    db.refresh(color)
    
    return color


@router.put("/colors/hm/{color_id}", response_model=HMColorResponse, tags=["hm-colors"])
def update_hm_color(color_id: int, color_data: HMColorUpdate, db: Session = Depends(get_db_sizecolor)):
    """Update an H&M color"""
    color = db.query(HMColor).filter(HMColor.id == color_id).first()
    if not color:
        raise HTTPException(status_code=404, detail="H&M color not found")

    # Check if color code is being changed and if it already exists
    if color_data.color_code and color_data.color_code != color.color_code:
        existing = db.query(HMColor).filter(HMColor.color_code == color_data.color_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Color code already exists")

    # Update fields
    update_data = color_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(color, field, value)

    db.commit()
    db.refresh(color)
    
    return color


@router.delete("/colors/hm/{color_id}", tags=["hm-colors"])
def delete_hm_color(color_id: int, db: Session = Depends(get_db_sizecolor)):
    """Delete an H&M color"""
    color = db.query(HMColor).filter(HMColor.id == color_id).first()
    if not color:
        raise HTTPException(status_code=404, detail="H&M color not found")

    db.delete(color)
    db.commit()
    
    return {"message": "H&M color deleted successfully"}


# =============================================================================
# H&M COLOR STATISTICS AND UTILITIES
# =============================================================================

@router.get("/colors/hm/stats", tags=["hm-colors"])
def get_hm_color_stats(db: Session = Depends(get_db_sizecolor)):
    """Get H&M color statistics"""
    total_colors = db.query(func.count(HMColor.id)).scalar()
    active_colors = db.query(func.count(HMColor.id)).filter(HMColor.is_active == True).scalar()
    
    # Group by color master
    color_master_stats = db.query(
        HMColor.color_master,
        func.count(HMColor.id).label('count')
    ).group_by(HMColor.color_master).order_by(desc('count')).limit(10).all()
    
    # Group by color value
    color_value_stats = db.query(
        HMColor.color_value,
        func.count(HMColor.id).label('count')
    ).filter(HMColor.color_value.isnot(None)).group_by(HMColor.color_value).order_by(desc('count')).limit(10).all()
    
    return {
        "total_colors": total_colors,
        "active_colors": active_colors,
        "inactive_colors": total_colors - active_colors,
        "top_color_masters": [{"name": stat[0], "count": stat[1]} for stat in color_master_stats],
        "top_color_values": [{"name": stat[0], "count": stat[1]} for stat in color_value_stats]
    }


@router.get("/colors/hm/search", response_model=List[HMColorListResponse], tags=["hm-colors"])
def search_hm_colors(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db_sizecolor)
):
    """Search H&M colors by any field"""
    colors = db.query(HMColor).filter(
        or_(
            HMColor.color_code.ilike(f"%{q}%"),
            HMColor.color_master.ilike(f"%{q}%"),
            HMColor.color_value.ilike(f"%{q}%"),
            HMColor.mixed_name.ilike(f"%{q}%"),
        )
    ).filter(HMColor.is_active == True).order_by(HMColor.color_code).limit(limit).all()
    
    return colors


# =============================================================================
# GARMENT TYPE ROUTES
# =============================================================================

@router.get("/garment-types", response_model=List[GarmentTypeListResponse], tags=["garment-types"])
def list_garment_types(
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db_sizecolor)
):
    """List all garment types"""
    query = db.query(GarmentType).options(joinedload(GarmentType.measurement_specs))

    if category:
        query = query.filter(GarmentType.category == category)
    if is_active is not None:
        query = query.filter(GarmentType.is_active == is_active)

    types = query.order_by(GarmentType.display_order).all()

    return [
        GarmentTypeListResponse(
            id=t.id,
            code=t.code,
            name=t.name,
            category=t.category,
            is_active=t.is_active,
            measurement_count=len(t.measurement_specs),
            display_order=t.display_order,
        )
        for t in types
    ]


@router.get("/garment-types/for-selector", response_model=List[GarmentTypeForSelector], tags=["garment-types"])
def get_garment_types_for_selector(db: Session = Depends(get_db_sizecolor)):
    """Get garment types optimized for dropdown selectors"""
    types = db.query(GarmentType).filter(GarmentType.is_active == True).order_by(GarmentType.display_order).all()

    return [
        GarmentTypeForSelector(
            id=t.id,
            code=t.code,
            name=t.name,
            category=t.category,
            label=f"{t.name} ({t.code})"
        )
        for t in types
    ]


@router.get("/garment-types/{garment_type_id}", response_model=GarmentTypeResponse, tags=["garment-types"])
def get_garment_type(garment_type_id: int, db: Session = Depends(get_db_sizecolor)):
    """Get a garment type with all its measurement specs"""
    gt = db.query(GarmentType).options(joinedload(GarmentType.measurement_specs)).filter(GarmentType.id == garment_type_id).first()
    if not gt:
        raise HTTPException(status_code=404, detail="Garment type not found")
    return gt


@router.get("/garment-types/{garment_type_id}/measurements", response_model=List[GarmentMeasurementSpecResponse], tags=["garment-types"])
def get_garment_measurement_specs(garment_type_id: int, db: Session = Depends(get_db_sizecolor)):
    """Get measurement specifications for a garment type"""
    specs = db.query(GarmentMeasurementSpec).filter(
        GarmentMeasurementSpec.garment_type_id == garment_type_id,
        GarmentMeasurementSpec.is_active == True
    ).order_by(GarmentMeasurementSpec.display_order).all()
    return specs


@router.post("/garment-types", response_model=GarmentTypeResponse, tags=["garment-types"])
def create_garment_type(data: GarmentTypeCreate, db: Session = Depends(get_db_sizecolor)):
    """Create a new garment type with measurement specs"""
    existing = db.query(GarmentType).filter(
        or_(GarmentType.code == data.code, GarmentType.name == data.name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Garment type code or name already exists")

    gt = GarmentType(
        code=data.code,
        name=data.name,
        description=data.description,
        category=data.category,
        display_order=data.display_order,
    )
    db.add(gt)
    db.flush()

    # Add measurement specs
    if data.measurement_specs:
        for spec_data in data.measurement_specs:
            spec = GarmentMeasurementSpec(
                garment_type_id=gt.id,
                **spec_data.model_dump()
            )
            db.add(spec)

    db.commit()
    db.refresh(gt)
    return gt


@router.put("/garment-types/{garment_type_id}", response_model=GarmentTypeResponse, tags=["garment-types"])
def update_garment_type(garment_type_id: int, data: GarmentTypeUpdate, db: Session = Depends(get_db_sizecolor)):
    """Update a garment type"""
    gt = db.query(GarmentType).filter(GarmentType.id == garment_type_id).first()
    if not gt:
        raise HTTPException(status_code=404, detail="Garment type not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(gt, field, value)

    db.commit()
    db.refresh(gt)
    return gt


@router.post("/garment-types/{garment_type_id}/measurements", response_model=GarmentMeasurementSpecResponse, tags=["garment-types"])
def add_garment_measurement_spec(garment_type_id: int, data: GarmentMeasurementSpecCreate, db: Session = Depends(get_db_sizecolor)):
    """Add a measurement spec to a garment type"""
    gt = db.query(GarmentType).filter(GarmentType.id == garment_type_id).first()
    if not gt:
        raise HTTPException(status_code=404, detail="Garment type not found")

    spec = GarmentMeasurementSpec(
        garment_type_id=garment_type_id,
        **data.model_dump()
    )
    db.add(spec)
    db.commit()
    db.refresh(spec)
    return spec


# =============================================================================
# SIZE MASTER ROUTES
# =============================================================================

@router.get("/sizes", response_model=List[SizeMasterListResponse], tags=["size-master"])
def list_sizes(
    garment_type_id: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),
    age_group: Optional[str] = Query(None),
    fit_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db_sizecolor)
):
    """List all sizes with filtering"""
    query = db.query(SizeMaster).options(
        joinedload(SizeMaster.garment_type_ref),
        joinedload(SizeMaster.measurements)
    )

    if garment_type_id:
        query = query.filter(SizeMaster.garment_type_id == garment_type_id)
    if gender:
        query = query.filter(SizeMaster.gender == gender)
    if age_group:
        query = query.filter(SizeMaster.age_group == age_group)
    if fit_type:
        query = query.filter(SizeMaster.fit_type == fit_type)
    if is_active is not None:
        query = query.filter(SizeMaster.is_active == is_active)
    if search:
        query = query.filter(
            or_(
                SizeMaster.size_code.ilike(f"%{search}%"),
                SizeMaster.size_name.ilike(f"%{search}%"),
                SizeMaster.size_label.ilike(f"%{search}%"),
            )
        )

    sizes = query.order_by(SizeMaster.garment_type_id, SizeMaster.size_name).offset(skip).limit(limit).all()

    return [
        SizeMasterListResponse(
            id=s.id,
            size_code=s.size_code,
            garment_type_id=s.garment_type_id,
            garment_type_name=s.garment_type_ref.name if s.garment_type_ref else None,
            gender=s.gender,
            age_group=s.age_group,
            fit_type=s.fit_type,
            size_name=s.size_name,
            size_label=s.size_label,
            is_active=s.is_active,
            measurement_count=len(s.measurements),
            created_at=s.created_at,
        )
        for s in sizes
    ]


@router.get("/sizes/for-selector", response_model=List[SizeMasterForSelector], tags=["size-master"])
def get_sizes_for_selector(
    garment_type_id: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),
    age_group: Optional[str] = Query(None),
    fit_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db_sizecolor)
):
    """Get sizes optimized for popup/dropdown selectors with filters"""
    query = db.query(SizeMaster).options(
        joinedload(SizeMaster.garment_type_ref),
        joinedload(SizeMaster.measurements)
    ).filter(SizeMaster.is_active == True)

    if garment_type_id:
        query = query.filter(SizeMaster.garment_type_id == garment_type_id)
    if gender:
        query = query.filter(SizeMaster.gender == gender)
    if age_group:
        query = query.filter(SizeMaster.age_group == age_group)
    if fit_type:
        query = query.filter(SizeMaster.fit_type == fit_type)
    if search:
        query = query.filter(SizeMaster.size_name.ilike(f"%{search}%"))

    sizes = query.order_by(SizeMaster.garment_type_id, SizeMaster.size_name).limit(limit).all()

    result = []
    for s in sizes:
        # Build measurements summary
        measurements_summary = None
        if s.measurements:
            summary_parts = []
            for m in sorted(s.measurements, key=lambda x: x.display_order)[:3]:
                summary_parts.append(f"{m.measurement_name}: {m.value_cm}cm")
            measurements_summary = ", ".join(summary_parts)

        result.append(SizeMasterForSelector(
            id=s.id,
            size_code=s.size_code,
            size_name=s.size_name,
            size_label=s.size_label,
            garment_type_id=s.garment_type_id,
            garment_type_name=s.garment_type_ref.name if s.garment_type_ref else "",
            gender=s.gender.value if s.gender else "",
            age_group=s.age_group.value if s.age_group else "",
            fit_type=s.fit_type.value if s.fit_type else "",
            label=f"{s.garment_type_ref.name if s.garment_type_ref else ''} - {s.size_name} ({s.fit_type.value if s.fit_type else 'Regular'})",
            measurements_summary=measurements_summary,
        ))

    return result


@router.get("/sizes/{size_id}", response_model=SizeMasterResponse, tags=["size-master"])
def get_size(size_id: int, db: Session = Depends(get_db_sizecolor)):
    """Get a single size with all measurements"""
    size = db.query(SizeMaster).options(
        joinedload(SizeMaster.garment_type_ref),
        joinedload(SizeMaster.measurements)
    ).filter(SizeMaster.id == size_id).first()
    if not size:
        raise HTTPException(status_code=404, detail="Size not found")

    return SizeMasterResponse(
        id=size.id,
        size_code=size.size_code,
        garment_type_id=size.garment_type_id,
        gender=size.gender,
        age_group=size.age_group,
        fit_type=size.fit_type,
        size_name=size.size_name,
        size_label=size.size_label,
        age_min_months=size.age_min_months,
        age_max_months=size.age_max_months,
        description=size.description,
        is_active=size.is_active,
        measurements=[
            SizeMeasurementResponse(
                id=m.id,
                size_master_id=m.size_master_id,
                measurement_name=m.measurement_name,
                measurement_code=m.measurement_code,
                value_cm=float(m.value_cm),
                value_inch=float(m.value_inch) if m.value_inch else None,
                tolerance_plus=float(m.tolerance_plus),
                tolerance_minus=float(m.tolerance_minus),
                notes=m.notes,
                display_order=m.display_order,
                created_at=m.created_at,
                updated_at=m.updated_at,
            )
            for m in sorted(size.measurements, key=lambda x: x.display_order)
        ],
        garment_type_name=size.garment_type_ref.name if size.garment_type_ref else None,
        created_at=size.created_at,
        updated_at=size.updated_at,
    )


@router.post("/sizes", response_model=SizeMasterResponse, tags=["size-master"])
def create_size(size_data: SizeMasterCreate, db: Session = Depends(get_db_sizecolor)):
    """Create a new size with measurements"""
    # Get garment type
    gt = db.query(GarmentType).filter(GarmentType.id == size_data.garment_type_id).first()
    if not gt:
        raise HTTPException(status_code=404, detail="Garment type not found")

    # Generate size code
    size_code = generate_size_code(db, gt.code, size_data.size_name)

    size = SizeMaster(
        size_code=size_code,
        garment_type_id=size_data.garment_type_id,
        gender=size_data.gender,
        age_group=size_data.age_group,
        fit_type=size_data.fit_type,
        size_name=size_data.size_name,
        size_label=size_data.size_label,
        age_min_months=size_data.age_min_months,
        age_max_months=size_data.age_max_months,
        description=size_data.description,
    )
    db.add(size)
    db.flush()

    # Add measurements
    if size_data.measurements:
        for m_data in size_data.measurements:
            measurement = SizeMeasurement(
                size_master_id=size.id,
                measurement_name=m_data.measurement_name,
                measurement_code=m_data.measurement_code,
                value_cm=m_data.value_cm,
                value_inch=round(m_data.value_cm / 2.54, 2),
                unit_symbol=m_data.unit_symbol,
                unit_name=m_data.unit_name,
                tolerance_plus=m_data.tolerance_plus,
                tolerance_minus=m_data.tolerance_minus,
                notes=m_data.notes,
                display_order=m_data.display_order,
                is_custom=m_data.is_custom,
                measurement_spec_id=m_data.measurement_spec_id,
                original_value=m_data.original_value,
                original_unit=m_data.original_unit,
            )
            db.add(measurement)

    db.commit()
    db.refresh(size)
    return get_size(size.id, db)


@router.put("/sizes/{size_id}", response_model=SizeMasterResponse, tags=["size-master"])
def update_size(size_id: int, size_data: SizeMasterUpdate, db: Session = Depends(get_db_sizecolor)):
    """Update a size"""
    size = db.query(SizeMaster).filter(SizeMaster.id == size_id).first()
    if not size:
        raise HTTPException(status_code=404, detail="Size not found")

    update_data = size_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(size, field, value)

    db.commit()
    db.refresh(size)
    return get_size(size.id, db)


@router.delete("/sizes/{size_id}", tags=["size-master"])
def delete_size(size_id: int, db: Session = Depends(get_db_sizecolor)):
    """Delete a size"""
    size = db.query(SizeMaster).filter(SizeMaster.id == size_id).first()
    if not size:
        raise HTTPException(status_code=404, detail="Size not found")

    db.delete(size)
    db.commit()
    return {"message": "Size deleted successfully"}


# =============================================================================
# SIZE MEASUREMENT ROUTES
# =============================================================================

@router.post("/sizes/{size_id}/measurements", response_model=SizeMeasurementResponse, tags=["size-master"])
def add_size_measurement(size_id: int, data: SizeMeasurementCreate, db: Session = Depends(get_db_sizecolor)):
    """Add a measurement to a size"""
    size = db.query(SizeMaster).filter(SizeMaster.id == size_id).first()
    if not size:
        raise HTTPException(status_code=404, detail="Size not found")

    measurement = SizeMeasurement(
        size_master_id=size_id,
        measurement_name=data.measurement_name,
        measurement_code=data.measurement_code,
        value_cm=data.value_cm,
        value_inch=round(data.value_cm / 2.54, 2),
        unit_symbol=data.unit_symbol,
        unit_name=data.unit_name,
        tolerance_plus=data.tolerance_plus,
        tolerance_minus=data.tolerance_minus,
        notes=data.notes,
        display_order=data.display_order,
        is_custom=data.is_custom,
        measurement_spec_id=data.measurement_spec_id,
        original_value=data.original_value,
        original_unit=data.original_unit,
    )
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return measurement


@router.put("/measurements/{measurement_id}", response_model=SizeMeasurementResponse, tags=["size-master"])
def update_size_measurement(measurement_id: int, data: SizeMeasurementUpdate, db: Session = Depends(get_db_sizecolor)):
    """Update a measurement"""
    measurement = db.query(SizeMeasurement).filter(SizeMeasurement.id == measurement_id).first()
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(measurement, field, value)

    # Recalculate inch value if cm changed
    if "value_cm" in update_data:
        measurement.value_inch = round(measurement.value_cm / 2.54, 2)

    db.commit()
    db.refresh(measurement)
    return measurement


@router.delete("/measurements/{measurement_id}", tags=["size-master"])
def delete_size_measurement(measurement_id: int, db: Session = Depends(get_db_sizecolor)):
    """Delete a measurement"""
    measurement = db.query(SizeMeasurement).filter(SizeMeasurement.id == measurement_id).first()
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")

    db.delete(measurement)
    db.commit()
    return {"message": "Measurement deleted successfully"}


# =============================================================================
# SAMPLE COLOR/SIZE SELECTION ROUTES
# =============================================================================

@router.get("/sample/{sample_id}/colors", response_model=List[SampleColorSelectionResponse], tags=["sample-selections"])
def get_sample_colors(sample_id: int, db: Session = Depends(get_db_sizecolor)):
    """Get all colors selected for a sample"""
    selections = db.query(SampleColorSelection).options(
        joinedload(SampleColorSelection.universal_color),
        joinedload(SampleColorSelection.hm_color)
    ).filter(
        SampleColorSelection.sample_id == sample_id,
        SampleColorSelection.is_active == True
    ).order_by(SampleColorSelection.display_order).all()

    result = []
    for sel in selections:
        # Resolve color info based on source
        color_code = None
        color_name = None
        hex_code = None

        if sel.color_source == "universal" and sel.universal_color:
            color_code = sel.universal_color.color_code
            color_name = sel.universal_color.color_name
            hex_code = sel.universal_color.hex_code
        elif sel.color_source == "hm" and sel.hm_color:
            color_code = sel.hm_color.hm_code
            color_name = sel.hm_color.hm_name
            hex_code = sel.hm_color.hex_code
        elif sel.color_source == "manual":
            color_code = sel.manual_color_code
            color_name = sel.manual_color_name
            hex_code = sel.manual_hex_code

        result.append(SampleColorSelectionResponse(
            id=sel.id,
            sample_id=sel.sample_id,
            color_source=sel.color_source,
            universal_color_id=sel.universal_color_id,
            hm_color_id=sel.hm_color_id,
            manual_color_type=sel.manual_color_type,
            manual_color_code=sel.manual_color_code,
            manual_color_name=sel.manual_color_name,
            manual_hex_code=sel.manual_hex_code,
            display_order=sel.display_order,
            notes=sel.notes,
            is_active=sel.is_active,
            created_at=sel.created_at,
            color_code=color_code,
            color_name=color_name,
            hex_code=hex_code,
        ))

    return result


@router.post("/sample/{sample_id}/colors", response_model=SampleColorSelectionResponse, tags=["sample-selections"])
def add_sample_color(sample_id: int, data: SampleColorSelectionCreate, db: Session = Depends(get_db_sizecolor)):
    """Add a color selection to a sample"""
    selection = SampleColorSelection(
        sample_id=sample_id,
        color_source=data.color_source,
        universal_color_id=data.universal_color_id,
        hm_color_id=data.hm_color_id,
        manual_color_type=data.manual_color_type,
        manual_color_code=data.manual_color_code,
        manual_color_name=data.manual_color_name,
        manual_hex_code=data.manual_hex_code,
        display_order=data.display_order,
        notes=data.notes,
    )
    db.add(selection)
    db.commit()
    db.refresh(selection)

    # Return with resolved color info
    return get_sample_colors(sample_id, db)[-1]


@router.delete("/sample/colors/{selection_id}", tags=["sample-selections"])
def remove_sample_color(selection_id: int, db: Session = Depends(get_db_sizecolor)):
    """Remove a color selection from a sample"""
    selection = db.query(SampleColorSelection).filter(SampleColorSelection.id == selection_id).first()
    if not selection:
        raise HTTPException(status_code=404, detail="Color selection not found")

    db.delete(selection)
    db.commit()
    return {"message": "Color removed from sample"}


@router.get("/sample/{sample_id}/sizes", response_model=List[SampleSizeSelectionResponse], tags=["sample-selections"])
def get_sample_sizes(sample_id: int, db: Session = Depends(get_db_sizecolor)):
    """Get all sizes selected for a sample"""
    selections = db.query(SampleSizeSelection).options(
        joinedload(SampleSizeSelection.size_master).joinedload(SizeMaster.garment_type_ref),
        joinedload(SampleSizeSelection.size_master).joinedload(SizeMaster.measurements)
    ).filter(
        SampleSizeSelection.sample_id == sample_id,
        SampleSizeSelection.is_active == True
    ).order_by(SampleSizeSelection.display_order).all()

    result = []
    for sel in selections:
        size = sel.size_master
        result.append(SampleSizeSelectionResponse(
            id=sel.id,
            sample_id=sel.sample_id,
            size_master_id=sel.size_master_id,
            quantity=sel.quantity,
            display_order=sel.display_order,
            notes=sel.notes,
            is_active=sel.is_active,
            created_at=sel.created_at,
            size_code=size.size_code if size else None,
            size_name=size.size_name if size else None,
            garment_type_name=size.garment_type_ref.name if size and size.garment_type_ref else None,
            gender=size.gender.value if size and size.gender else None,
            measurements=[
                SizeMeasurementResponse(
                    id=m.id,
                    size_master_id=m.size_master_id,
                    measurement_name=m.measurement_name,
                    measurement_code=m.measurement_code,
                    value_cm=float(m.value_cm),
                    value_inch=float(m.value_inch) if m.value_inch else None,
                    tolerance_plus=float(m.tolerance_plus),
                    tolerance_minus=float(m.tolerance_minus),
                    notes=m.notes,
                    display_order=m.display_order,
                    created_at=m.created_at,
                    updated_at=m.updated_at,
                )
                for m in sorted(size.measurements, key=lambda x: x.display_order)
            ] if size and size.measurements else None,
        ))

    return result


@router.post("/sample/{sample_id}/sizes", response_model=SampleSizeSelectionResponse, tags=["sample-selections"])
def add_sample_size(sample_id: int, data: SampleSizeSelectionCreate, db: Session = Depends(get_db_sizecolor)):
    """Add a size selection to a sample"""
    # Check if already exists
    existing = db.query(SampleSizeSelection).filter(
        SampleSizeSelection.sample_id == sample_id,
        SampleSizeSelection.size_master_id == data.size_master_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Size already added to this sample")

    selection = SampleSizeSelection(
        sample_id=sample_id,
        size_master_id=data.size_master_id,
        quantity=data.quantity,
        display_order=data.display_order,
        notes=data.notes,
    )
    db.add(selection)
    db.commit()
    db.refresh(selection)

    # Return with resolved size info
    return get_sample_sizes(sample_id, db)[-1]


@router.delete("/sample/sizes/{selection_id}", tags=["sample-selections"])
def remove_sample_size(selection_id: int, db: Session = Depends(get_db_sizecolor)):
    """Remove a size selection from a sample"""
    selection = db.query(SampleSizeSelection).filter(SampleSizeSelection.id == selection_id).first()
    if not selection:
        raise HTTPException(status_code=404, detail="Size selection not found")

    db.delete(selection)
    db.commit()
    return {"message": "Size removed from sample"}


# =============================================================================
# BUYER SUGGESTIONS
# =============================================================================

@router.get("/suggestions/{buyer_id}", response_model=BuyerSuggestionResponse, tags=["suggestions"])
def get_buyer_suggestions(
    buyer_id: int,
    garment_type_id: Optional[int] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db_sizecolor)
):
    """Get top sizes and colors for a buyer based on usage history"""
    # Top universal colors
    universal_color_query = db.query(
        BuyerColorUsage, UniversalColor
    ).join(
        UniversalColor, BuyerColorUsage.universal_color_id == UniversalColor.id
    ).filter(
        BuyerColorUsage.buyer_id == buyer_id,
        BuyerColorUsage.universal_color_id.isnot(None)
    ).order_by(desc(BuyerColorUsage.usage_count)).limit(limit).all()

    # Top H&M colors
    hm_color_query = db.query(
        BuyerColorUsage, HMColor
    ).join(
        HMColor, BuyerColorUsage.hm_color_id == HMColor.id
    ).filter(
        BuyerColorUsage.buyer_id == buyer_id,
        BuyerColorUsage.hm_color_id.isnot(None)
    ).order_by(desc(BuyerColorUsage.usage_count)).limit(limit).all()

    # Top sizes
    size_query = db.query(
        BuyerSizeUsage, SizeMaster
    ).join(
        SizeMaster, BuyerSizeUsage.size_master_id == SizeMaster.id
    ).options(
        joinedload(SizeMaster.garment_type_ref)
    ).filter(
        BuyerSizeUsage.buyer_id == buyer_id
    )

    if garment_type_id:
        size_query = size_query.filter(SizeMaster.garment_type_id == garment_type_id)

    top_sizes = size_query.order_by(desc(BuyerSizeUsage.usage_count)).limit(limit).all()

    return BuyerSuggestionResponse(
        buyer_id=buyer_id,
        top_universal_colors=[
            BuyerColorUsageResponse(
                id=u.id,
                buyer_id=u.buyer_id,
                color_source="universal",
                color_code=c.color_code,
                color_name=c.color_name,
                hex_code=c.hex_code,
                usage_count=u.usage_count,
                last_used_at=u.last_used_at,
            )
            for u, c in universal_color_query
        ],
        top_hm_colors=[
            BuyerColorUsageResponse(
                id=u.id,
                buyer_id=u.buyer_id,
                color_source="hm",
                color_code=c.hm_code,
                color_name=c.hm_name,
                hex_code=c.hex_code,
                usage_count=u.usage_count,
                last_used_at=u.last_used_at,
            )
            for u, c in hm_color_query
        ],
        top_sizes=[
            BuyerSizeUsageResponse(
                id=u.id,
                buyer_id=u.buyer_id,
                size_master_id=u.size_master_id,
                size_code=s.size_code,
                size_name=s.size_name,
                garment_type_name=s.garment_type_ref.name if s.garment_type_ref else "",
                usage_count=u.usage_count,
                last_used_at=u.last_used_at,
            )
            for u, s in top_sizes
        ],
    )


@router.post("/usage/color", tags=["usage-tracking"])
def track_color_usage(
    buyer_id: int,
    color_source: str,  # "universal" or "hm"
    color_id: int,
    db: Session = Depends(get_db_sizecolor)
):
    """Track color usage for a buyer"""
    if color_source == "universal":
        usage = db.query(BuyerColorUsage).filter(
            BuyerColorUsage.buyer_id == buyer_id,
            BuyerColorUsage.universal_color_id == color_id
        ).first()

        if usage:
            usage.usage_count += 1
            usage.last_used_at = datetime.utcnow()
        else:
            usage = BuyerColorUsage(
                buyer_id=buyer_id,
                universal_color_id=color_id,
                usage_count=1,
                last_used_at=datetime.utcnow()
            )
            db.add(usage)
    elif color_source == "hm":
        usage = db.query(BuyerColorUsage).filter(
            BuyerColorUsage.buyer_id == buyer_id,
            BuyerColorUsage.hm_color_id == color_id
        ).first()

        if usage:
            usage.usage_count += 1
            usage.last_used_at = datetime.utcnow()
        else:
            usage = BuyerColorUsage(
                buyer_id=buyer_id,
                hm_color_id=color_id,
                usage_count=1,
                last_used_at=datetime.utcnow()
            )
            db.add(usage)
    else:
        raise HTTPException(status_code=400, detail="Invalid color source")

    db.commit()
    return {"message": "Color usage tracked"}


@router.post("/usage/size", tags=["usage-tracking"])
def track_size_usage(buyer_id: int, size_id: int, db: Session = Depends(get_db_sizecolor)):
    """Track size usage for a buyer"""
    usage = db.query(BuyerSizeUsage).filter(
        BuyerSizeUsage.buyer_id == buyer_id,
        BuyerSizeUsage.size_master_id == size_id
    ).first()

    if usage:
        usage.usage_count += 1
        usage.last_used_at = datetime.utcnow()
    else:
        usage = BuyerSizeUsage(
            buyer_id=buyer_id,
            size_master_id=size_id,
            usage_count=1,
            last_used_at=datetime.utcnow()
        )
        db.add(usage)

    db.commit()
    return {"message": "Size usage tracked"}


# =============================================================================
# ENUM/OPTION ROUTES
# =============================================================================

@router.get("/options/color-families", tags=["options"])
def get_color_families():
    """Get all color families"""
    return [{"value": e.value, "label": e.value} for e in ColorFamilyEnum]


@router.get("/options/color-types", tags=["options"])
def get_color_types():
    """Get all color types"""
    return [{"value": e.value, "label": e.value} for e in ColorTypeEnum]


@router.get("/options/color-values", tags=["options"])
def get_color_values():
    """Get all color values/intensities"""
    return [{"value": e.value, "label": e.value} for e in ColorValueEnum]


@router.get("/options/finish-types", tags=["options"])
def get_finish_types():
    """Get all finish types"""
    return [{"value": e.value, "label": e.value} for e in FinishTypeEnum]


@router.get("/options/genders", tags=["options"])
def get_genders():
    """Get all genders"""
    return [{"value": e.value, "label": e.value} for e in GenderEnum]


@router.get("/options/fit-types", tags=["options"])
def get_fit_types():
    """Get all fit types"""
    return [{"value": e.value, "label": e.value} for e in FitTypeEnum]


@router.get("/options/age-groups", tags=["options"])
def get_age_groups():
    """Get all age groups"""
    return [{"value": e.value, "label": e.value} for e in AgeGroupEnum]
