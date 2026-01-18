"""
Size & Color Master Schemas - Redesigned
Pydantic models for API validation

COLOR SYSTEM:
- UniversalColor schemas (Pantone, TCX, RGB, Hex)
- HMColor schemas (H&M proprietary codes)

SIZE SYSTEM:
- GarmentType schemas
- GarmentMeasurementSpec schemas
- SizeMaster schemas
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# =============================================================================
# ENUMS (matching model enums)
# =============================================================================

class ColorFamilyEnum(str, Enum):
    RED = "Red"
    ORANGE = "Orange"
    YELLOW = "Yellow"
    GREEN = "Green"
    BLUE = "Blue"
    PURPLE = "Purple"
    PINK = "Pink"
    BROWN = "Brown"
    GREY = "Grey"
    BLACK = "Black"
    WHITE = "White"
    BEIGE = "Beige"
    NAVY = "Navy"
    CREAM = "Cream"
    BURGUNDY = "Burgundy"
    TEAL = "Teal"
    OLIVE = "Olive"
    CORAL = "Coral"
    GOLD = "Gold"
    SILVER = "Silver"
    MULTI = "Multi"


class ColorTypeEnum(str, Enum):
    SOLID = "Solid"
    MELANGE = "Melange"
    HEATHER = "Heather"
    MARLED = "Marled"
    DOPE_DYED = "Dope Dyed"
    YARN_DYED = "Yarn Dyed"
    GARMENT_DYED = "Garment Dyed"
    REACTIVE_DYED = "Reactive Dyed"
    PIGMENT_DYED = "Pigment Dyed"
    TIE_DYE = "Tie Dye"
    OMBRE = "Ombre"
    PRINT = "Print"
    STRIPE = "Stripe"


class ColorValueEnum(str, Enum):
    LIGHT = "Light"
    MEDIUM = "Medium"
    DARK = "Dark"
    BRIGHT = "Bright"
    DUSTY = "Dusty"
    MEDIUM_DUSTY = "Medium Dusty"
    PASTEL = "Pastel"
    NEON = "Neon"
    MUTED = "Muted"
    VIVID = "Vivid"


class FinishTypeEnum(str, Enum):
    YARN_DYED = "Yarn Dyed"
    DOPE_DYED = "Dope Dyed"
    GARMENT_DYED = "Garment Dyed"
    PIECE_DYED = "Piece Dyed"
    RAW = "Raw"
    WASHED = "Washed"
    ENZYME_WASHED = "Enzyme Washed"
    STONE_WASHED = "Stone Washed"
    BLEACHED = "Bleached"
    OVERDYED = "Overdyed"


class GenderEnum(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    UNISEX = "Unisex"
    KIDS_BOY = "Kids Boy"
    KIDS_GIRL = "Kids Girl"
    KIDS_UNISEX = "Kids Unisex"
    INFANT = "Infant"
    TODDLER = "Toddler"


class FitTypeEnum(str, Enum):
    REGULAR = "Regular"
    SLIM = "Slim"
    RELAXED = "Relaxed"
    OVERSIZED = "Oversized"
    FITTED = "Fitted"
    LOOSE = "Loose"
    ATHLETIC = "Athletic"
    TAPERED = "Tapered"
    SKINNY = "Skinny"
    WIDE = "Wide"


class AgeGroupEnum(str, Enum):
    NEWBORN = "Newborn (0-3 months)"
    INFANT = "Infant (3-12 months)"
    TODDLER = "Toddler (1-3 years)"
    KIDS = "Kids (4-12 years)"
    TEEN = "Teen (13-17 years)"
    ADULT = "Adult (18+)"
    ALL_AGES = "All Ages"


# =============================================================================
# UNIVERSAL COLOR SCHEMAS (Pantone/TCX/RGB/Hex)
# =============================================================================

class UniversalColorBase(BaseModel):
    color_name: str = Field(..., max_length=100)
    display_name: Optional[str] = Field(None, max_length=100)
    color_family: Optional[ColorFamilyEnum] = None
    color_type: ColorTypeEnum = ColorTypeEnum.SOLID
    color_value: Optional[ColorValueEnum] = None
    finish_type: Optional[FinishTypeEnum] = None
    hex_code: Optional[str] = Field(None, max_length=7)
    rgb_r: Optional[int] = Field(None, ge=0, le=255)
    rgb_g: Optional[int] = Field(None, ge=0, le=255)
    rgb_b: Optional[int] = Field(None, ge=0, le=255)
    pantone_code: Optional[str] = Field(None, max_length=30)
    tcx_code: Optional[str] = Field(None, max_length=30)
    tpx_code: Optional[str] = Field(None, max_length=30)
    description: Optional[str] = None
    season: Optional[str] = Field(None, max_length=50)
    year: Optional[int] = None

    @field_validator('hex_code')
    @classmethod
    def validate_hex_code(cls, v: Optional[str]) -> Optional[str]:
        if v:
            if not v.startswith('#'):
                v = '#' + v
            return v.upper()
        return v


class UniversalColorCreate(UniversalColorBase):
    pass


class UniversalColorUpdate(BaseModel):
    color_name: Optional[str] = Field(None, max_length=100)
    display_name: Optional[str] = Field(None, max_length=100)
    color_family: Optional[ColorFamilyEnum] = None
    color_type: Optional[ColorTypeEnum] = None
    color_value: Optional[ColorValueEnum] = None
    finish_type: Optional[FinishTypeEnum] = None
    hex_code: Optional[str] = Field(None, max_length=7)
    rgb_r: Optional[int] = Field(None, ge=0, le=255)
    rgb_g: Optional[int] = Field(None, ge=0, le=255)
    rgb_b: Optional[int] = Field(None, ge=0, le=255)
    pantone_code: Optional[str] = Field(None, max_length=30)
    tcx_code: Optional[str] = Field(None, max_length=30)
    tpx_code: Optional[str] = Field(None, max_length=30)
    description: Optional[str] = None
    season: Optional[str] = Field(None, max_length=50)
    year: Optional[int] = None
    is_active: Optional[bool] = None


class UniversalColorResponse(UniversalColorBase):
    id: int
    color_code: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UniversalColorListResponse(BaseModel):
    id: int
    color_code: str
    color_name: str
    display_name: Optional[str] = None
    color_family: Optional[ColorFamilyEnum] = None
    color_type: ColorTypeEnum
    hex_code: Optional[str] = None
    pantone_code: Optional[str] = None
    tcx_code: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UniversalColorForSelector(BaseModel):
    """Optimized for dropdown selectors"""
    id: int
    color_code: str
    color_name: str
    hex_code: Optional[str] = None
    pantone_code: Optional[str] = None
    tcx_code: Optional[str] = None
    color_family: Optional[str] = None
    label: str

    class Config:
        from_attributes = True


# =============================================================================
# H&M COLOR SCHEMAS
# =============================================================================

class HMColorGroupBase(BaseModel):
    group_code: str = Field(..., max_length=2)
    group_name: str = Field(..., max_length=50)
    group_range_start: Optional[int] = None
    group_range_end: Optional[int] = None
    description: Optional[str] = None
    hex_sample: Optional[str] = Field(None, max_length=7)


class HMColorGroupCreate(HMColorGroupBase):
    pass


class HMColorGroupResponse(HMColorGroupBase):
    id: int
    is_active: bool
    display_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class HMColorBase(BaseModel):
    hm_code: str = Field(..., max_length=10)  # e.g., "09-090"
    hm_name: str = Field(..., max_length=100)
    group_id: Optional[int] = None
    universal_color_id: Optional[int] = None
    hex_code: Optional[str] = Field(None, max_length=7)
    rgb_r: Optional[int] = Field(None, ge=0, le=255)
    rgb_g: Optional[int] = Field(None, ge=0, le=255)
    rgb_b: Optional[int] = Field(None, ge=0, le=255)
    description: Optional[str] = None
    notes: Optional[str] = None


class HMColorCreate(HMColorBase):
    pass


class HMColorUpdate(BaseModel):
    hm_code: Optional[str] = Field(None, max_length=10)
    hm_name: Optional[str] = Field(None, max_length=100)
    group_id: Optional[int] = None
    universal_color_id: Optional[int] = None
    hex_code: Optional[str] = Field(None, max_length=7)
    rgb_r: Optional[int] = Field(None, ge=0, le=255)
    rgb_g: Optional[int] = Field(None, ge=0, le=255)
    rgb_b: Optional[int] = Field(None, ge=0, le=255)
    description: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class HMColorResponse(HMColorBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    color_group: Optional[HMColorGroupResponse] = None

    class Config:
        from_attributes = True


class HMColorListResponse(BaseModel):
    id: int
    hm_code: str
    hm_name: str
    group_id: Optional[int] = None
    group_name: Optional[str] = None
    hex_code: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class HMColorForSelector(BaseModel):
    """Optimized for dropdown selectors"""
    id: int
    hm_code: str
    hm_name: str
    hex_code: Optional[str] = None
    group_name: Optional[str] = None
    label: str

    class Config:
        from_attributes = True


# =============================================================================
# GARMENT TYPE SCHEMAS
# =============================================================================

class GarmentMeasurementSpecBase(BaseModel):
    measurement_name: str = Field(..., max_length=50)
    measurement_code: str = Field(..., max_length=20)
    description: Optional[str] = None
    unit: str = "cm"
    is_required: bool = True
    display_order: int = 0
    default_tolerance_plus: float = 2.0
    default_tolerance_minus: float = 2.0


class GarmentMeasurementSpecCreate(GarmentMeasurementSpecBase):
    pass


class GarmentMeasurementSpecResponse(GarmentMeasurementSpecBase):
    id: int
    garment_type_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class GarmentTypeBase(BaseModel):
    code: str = Field(..., max_length=10)
    name: str = Field(..., max_length=50)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=50)
    display_order: int = 0


class GarmentTypeCreate(GarmentTypeBase):
    measurement_specs: Optional[List[GarmentMeasurementSpecCreate]] = []


class GarmentTypeUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=10)
    name: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=50)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class GarmentTypeResponse(GarmentTypeBase):
    id: int
    is_active: bool
    measurement_specs: List[GarmentMeasurementSpecResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GarmentTypeListResponse(BaseModel):
    id: int
    code: str
    name: str
    category: Optional[str] = None
    is_active: bool
    measurement_count: int = 0
    display_order: int

    class Config:
        from_attributes = True


class GarmentTypeForSelector(BaseModel):
    """Optimized for dropdown selectors"""
    id: int
    code: str
    name: str
    category: Optional[str] = None
    label: str

    class Config:
        from_attributes = True


# =============================================================================
# SIZE MEASUREMENT SCHEMAS
# =============================================================================

class SizeMeasurementBase(BaseModel):
    measurement_name: str = Field(..., max_length=50)
    measurement_code: str = Field(..., max_length=20)
    value_cm: float
    tolerance_plus: float = 2.0
    tolerance_minus: float = 2.0
    notes: Optional[str] = None
    display_order: int = 0


class SizeMeasurementCreate(SizeMeasurementBase):
    pass


class SizeMeasurementUpdate(BaseModel):
    measurement_name: Optional[str] = Field(None, max_length=50)
    measurement_code: Optional[str] = Field(None, max_length=20)
    value_cm: Optional[float] = None
    tolerance_plus: Optional[float] = None
    tolerance_minus: Optional[float] = None
    notes: Optional[str] = None
    display_order: Optional[int] = None


class SizeMeasurementResponse(SizeMeasurementBase):
    id: int
    size_master_id: int
    value_inch: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============================================================================
# SIZE MASTER SCHEMAS
# =============================================================================

class SizeMasterBase(BaseModel):
    garment_type_id: int
    gender: GenderEnum
    age_group: AgeGroupEnum = AgeGroupEnum.ADULT
    fit_type: FitTypeEnum = FitTypeEnum.REGULAR
    size_name: str = Field(..., max_length=20)
    size_label: Optional[str] = Field(None, max_length=50)
    age_min_months: Optional[int] = None
    age_max_months: Optional[int] = None
    description: Optional[str] = None


class SizeMasterCreate(SizeMasterBase):
    measurements: Optional[List[SizeMeasurementCreate]] = []


class SizeMasterUpdate(BaseModel):
    garment_type_id: Optional[int] = None
    gender: Optional[GenderEnum] = None
    age_group: Optional[AgeGroupEnum] = None
    fit_type: Optional[FitTypeEnum] = None
    size_name: Optional[str] = Field(None, max_length=20)
    size_label: Optional[str] = Field(None, max_length=50)
    age_min_months: Optional[int] = None
    age_max_months: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class SizeMasterResponse(SizeMasterBase):
    id: int
    size_code: str
    is_active: bool
    measurements: List[SizeMeasurementResponse] = []
    garment_type_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SizeMasterListResponse(BaseModel):
    id: int
    size_code: str
    garment_type_id: int
    garment_type_name: Optional[str] = None
    gender: GenderEnum
    age_group: AgeGroupEnum
    fit_type: FitTypeEnum
    size_name: str
    size_label: Optional[str] = None
    is_active: bool
    measurement_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class SizeMasterForSelector(BaseModel):
    """Optimized for dropdown/popup selectors"""
    id: int
    size_code: str
    size_name: str
    size_label: Optional[str] = None
    garment_type_id: int
    garment_type_name: str
    gender: str
    age_group: str
    fit_type: str
    label: str  # Combined display label
    measurements_summary: Optional[str] = None  # e.g., "Chest: 96cm, Waist: 80cm"

    class Config:
        from_attributes = True


# =============================================================================
# SAMPLE COLOR SELECTION SCHEMAS
# =============================================================================

class SampleColorSelectionBase(BaseModel):
    sample_id: int
    color_source: str  # "universal", "hm", "manual"
    universal_color_id: Optional[int] = None
    hm_color_id: Optional[int] = None
    manual_color_type: Optional[str] = Field(None, max_length=20)
    manual_color_code: Optional[str] = Field(None, max_length=50)
    manual_color_name: Optional[str] = Field(None, max_length=100)
    manual_hex_code: Optional[str] = Field(None, max_length=7)
    display_order: int = 0
    notes: Optional[str] = None


class SampleColorSelectionCreate(SampleColorSelectionBase):
    pass


class SampleColorSelectionResponse(SampleColorSelectionBase):
    id: int
    is_active: bool
    created_at: datetime
    # Include resolved color info
    color_code: Optional[str] = None
    color_name: Optional[str] = None
    hex_code: Optional[str] = None

    class Config:
        from_attributes = True


# =============================================================================
# SAMPLE SIZE SELECTION SCHEMAS
# =============================================================================

class SampleSizeSelectionBase(BaseModel):
    sample_id: int
    size_master_id: int
    quantity: Optional[int] = None
    display_order: int = 0
    notes: Optional[str] = None


class SampleSizeSelectionCreate(SampleSizeSelectionBase):
    pass


class SampleSizeSelectionResponse(SampleSizeSelectionBase):
    id: int
    is_active: bool
    created_at: datetime
    # Include resolved size info
    size_code: Optional[str] = None
    size_name: Optional[str] = None
    garment_type_name: Optional[str] = None
    gender: Optional[str] = None
    measurements: Optional[List[SizeMeasurementResponse]] = None

    class Config:
        from_attributes = True


# =============================================================================
# BUYER USAGE TRACKING SCHEMAS
# =============================================================================

class BuyerColorUsageResponse(BaseModel):
    id: int
    buyer_id: int
    color_source: str  # "universal" or "hm"
    color_code: str
    color_name: str
    hex_code: Optional[str] = None
    usage_count: int
    last_used_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BuyerSizeUsageResponse(BaseModel):
    id: int
    buyer_id: int
    size_master_id: int
    size_code: str
    size_name: str
    garment_type_name: str
    usage_count: int
    last_used_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BuyerSuggestionResponse(BaseModel):
    """Combined suggestions for a buyer"""
    buyer_id: int
    top_universal_colors: List[BuyerColorUsageResponse] = []
    top_hm_colors: List[BuyerColorUsageResponse] = []
    top_sizes: List[BuyerSizeUsageResponse] = []

    class Config:
        from_attributes = True


# =============================================================================
# SEARCH/FILTER SCHEMAS
# =============================================================================

class ColorSearchRequest(BaseModel):
    """Search colors by various criteria"""
    search_type: str  # "pantone", "tcx", "hex", "hm", "name"
    query: str
    limit: int = 20


class SizeFilterRequest(BaseModel):
    """Filter sizes for selection popup"""
    garment_type_id: Optional[int] = None
    gender: Optional[GenderEnum] = None
    age_group: Optional[AgeGroupEnum] = None
    fit_type: Optional[FitTypeEnum] = None
    search: Optional[str] = None  # Search by size name
    limit: int = 100
