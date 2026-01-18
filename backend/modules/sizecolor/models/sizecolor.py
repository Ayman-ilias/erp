"""
Size & Color Master Models - Redesigned
=========================================

COLOR SYSTEM (Two Separate Tables):
1. UniversalColor - Master table for all standard colors (Pantone, TCX, RGB, Hex)
2. HMColor - Separate table for H&M's proprietary 5-digit color codes

SIZE SYSTEM:
- GarmentType - Types of garments with their required measurements
- GarmentMeasurementSpec - What measurements each garment type needs
- SizeMaster - Size definitions with measurements
- SampleSizeSelection - Links sizes to samples

SAMPLE INTEGRATION:
- SampleColorSelection - Links colors to samples (supports multiple color types)
- SampleSizeSelection - Links sizes to samples (supports multiple sizes)
"""

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Numeric, DateTime,
    ForeignKey, Index, UniqueConstraint, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SQLEnum
from datetime import datetime
from enum import Enum
from core.database import BaseSizeColor


# =============================================================================
# COLOR ENUMS
# =============================================================================

class ColorFamilyEnum(str, Enum):
    """Color families for grouping"""
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
    """Color types"""
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
    """Color value/intensity"""
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
    """Finish types for colors"""
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


# =============================================================================
# SIZE ENUMS
# =============================================================================

class GenderEnum(str, Enum):
    """Gender categories"""
    MALE = "Male"
    FEMALE = "Female"
    UNISEX = "Unisex"
    KIDS_BOY = "Kids Boy"
    KIDS_GIRL = "Kids Girl"
    KIDS_UNISEX = "Kids Unisex"
    INFANT = "Infant"
    TODDLER = "Toddler"


class FitTypeEnum(str, Enum):
    """Fit types"""
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
    """Age groups"""
    NEWBORN = "Newborn (0-3 months)"
    INFANT = "Infant (3-12 months)"
    TODDLER = "Toddler (1-3 years)"
    KIDS = "Kids (4-12 years)"
    TEEN = "Teen (13-17 years)"
    ADULT = "Adult (18+)"
    ALL_AGES = "All Ages"


# =============================================================================
# TABLE 1: UNIVERSAL COLOR (Pantone/TCX/RGB/Hex)
# =============================================================================

class UniversalColor(BaseSizeColor):
    """
    Universal Color Master - All standard colors
    Contains: Pantone, TCX, RGB, Hex codes
    This is the main reference for all non-H&M colors

    Fields: COLOR_ID, COLOR_NAME, COLOR_CODE, COLOR_FAMILY, COLOR_TYPE,
            COLOUR_VALUE, FINISH, RGB, PANTONE_CODE, HEX, TCX
    """
    __tablename__ = "universal_colors"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Info
    color_code = Column(String(30), unique=True, nullable=False, index=True)  # UC-001, UC-002
    color_name = Column(String(100), nullable=False, index=True)
    display_name = Column(String(100))  # Localized name if different

    # Color Classification
    color_family = Column(SQLEnum(ColorFamilyEnum), index=True)
    color_type = Column(SQLEnum(ColorTypeEnum), default=ColorTypeEnum.SOLID)
    color_value = Column(SQLEnum(ColorValueEnum))
    finish_type = Column(SQLEnum(FinishTypeEnum))

    # Color Codes - Multiple Standards
    hex_code = Column(String(7), index=True)  # #RRGGBB
    rgb_r = Column(Integer)
    rgb_g = Column(Integer)
    rgb_b = Column(Integer)
    pantone_code = Column(String(30), index=True)  # e.g., "19-3921"
    tcx_code = Column(String(30), index=True)  # e.g., "19-3921 TCX"
    tpx_code = Column(String(30))  # TPX variant if different

    # Additional Info
    description = Column(Text)
    season = Column(String(50))  # SS25, AW25
    year = Column(Integer)

    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('ix_universal_color_pantone', 'pantone_code'),
        Index('ix_universal_color_tcx', 'tcx_code'),
        Index('ix_universal_color_hex', 'hex_code'),
        Index('ix_universal_color_family', 'color_family'),
    )


# =============================================================================
# TABLE 2: H&M COLOR (Separate table for H&M codes)
# =============================================================================

class HMColorGroup(BaseSizeColor):
    """
    H&M Color Groups (first 2 digits of H&M code)
    H&M uses 8 color groups in their color wheel:
    - 01-09: Achromatic (White, Grey, Black)
    - 10-19: Red
    - 20-29: Yellow
    - 30-39: Green
    - 40-49: Blue
    - 50-59: Violet/Purple
    - 60-69: Brown/Earth
    - 70-79: Pink
    """
    __tablename__ = "hm_color_groups"

    id = Column(Integer, primary_key=True, index=True)
    group_code = Column(String(2), unique=True, nullable=False)  # 01, 09, 20, etc.
    group_name = Column(String(50), nullable=False)  # White, Black, Yellow, etc.
    group_range_start = Column(Integer)  # 01
    group_range_end = Column(Integer)  # 09
    description = Column(Text)
    hex_sample = Column(String(7))  # Sample hex for this group
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    colors = relationship("HMColor", back_populates="color_group", cascade="all, delete-orphan")


class HMColor(BaseSizeColor):
    """
    H&M Proprietary Color Codes
    Format: XX-XXX (5 digits, e.g., 09-090 for Black, 01-100 for White)
    First 2 digits = color group, Last 3 digits = specific shade/variation
    """
    __tablename__ = "hm_colors"

    id = Column(Integer, primary_key=True, index=True)

    # H&M specific code
    hm_code = Column(String(10), unique=True, nullable=False, index=True)  # e.g., "09-090"
    hm_name = Column(String(100), nullable=False)  # H&M's name for this color

    # Link to color group
    group_id = Column(Integer, ForeignKey("hm_color_groups.id"), index=True)

    # Optional mapping to universal color (for cross-reference)
    universal_color_id = Column(Integer, ForeignKey("universal_colors.id"), nullable=True)

    # Approximate visual representation
    hex_code = Column(String(7))  # Approximate hex for display
    rgb_r = Column(Integer)
    rgb_g = Column(Integer)
    rgb_b = Column(Integer)

    # Additional Info
    description = Column(Text)
    notes = Column(Text)  # Special notes for this color

    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    color_group = relationship("HMColorGroup", back_populates="colors")
    universal_color = relationship("UniversalColor")

    __table_args__ = (
        Index('ix_hm_color_code', 'hm_code'),
        Index('ix_hm_color_group', 'group_id'),
    )


# =============================================================================
# GARMENT TYPE & MEASUREMENTS
# =============================================================================

class GarmentType(BaseSizeColor):
    """
    Garment Types with their measurement specifications
    Each garment type has specific measurements required
    When user selects garment type, the relevant measurements auto-load
    """
    __tablename__ = "garment_types"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, nullable=False)  # SWT, TSH, HAT, GLV, etc.
    name = Column(String(50), nullable=False, unique=True)  # Sweater, T-Shirt, Hat
    description = Column(Text)
    category = Column(String(50))  # Tops, Bottoms, Accessories, Headwear
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    measurement_specs = relationship("GarmentMeasurementSpec", back_populates="garment_type", cascade="all, delete-orphan")
    sizes = relationship("SizeMaster", back_populates="garment_type_ref")


class GarmentMeasurementSpec(BaseSizeColor):
    """
    Measurement specifications for each garment type
    Defines what measurements are needed (e.g., Sweater needs Chest, Waist, Sleeve, etc.)
    When user creates a size for Sweater, these measurements auto-populate
    """
    __tablename__ = "garment_measurement_specs"

    id = Column(Integer, primary_key=True, index=True)
    garment_type_id = Column(Integer, ForeignKey("garment_types.id", ondelete="CASCADE"), nullable=False)

    measurement_name = Column(String(50), nullable=False)  # Chest, Waist, Sleeve Length
    measurement_code = Column(String(20), nullable=False)  # CHEST, WAIST, SLEEVE
    description = Column(Text)  # How to measure
    unit = Column(String(10), default="cm")  # cm, inch
    is_required = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

    # Default tolerance values
    default_tolerance_plus = Column(Numeric(5, 2), default=2.0)
    default_tolerance_minus = Column(Numeric(5, 2), default=2.0)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    garment_type = relationship("GarmentType", back_populates="measurement_specs")

    __table_args__ = (
        UniqueConstraint('garment_type_id', 'measurement_code', name='uq_garment_measurement_spec'),
        Index('ix_garment_measurement_spec', 'garment_type_id', 'measurement_code'),
    )


# =============================================================================
# SIZE MASTER
# =============================================================================

class SizeMaster(BaseSizeColor):
    """
    Size Master - Size definitions with measurements
    Each size belongs to a garment type and has specific measurements
    """
    __tablename__ = "size_master"

    id = Column(Integer, primary_key=True, index=True)
    size_code = Column(String(50), unique=True, nullable=False, index=True)  # SZ-SWT-M-001

    # Classification (all are dropdown + search + add)
    garment_type_id = Column(Integer, ForeignKey("garment_types.id"), nullable=False, index=True)
    gender = Column(SQLEnum(GenderEnum), nullable=False)
    age_group = Column(SQLEnum(AgeGroupEnum), default=AgeGroupEnum.ADULT)
    fit_type = Column(SQLEnum(FitTypeEnum), default=FitTypeEnum.REGULAR)

    # Size Info
    size_name = Column(String(20), nullable=False, index=True)  # XS, S, M, L, XL, 32, 34, etc.
    size_label = Column(String(50))  # Display label

    # Age range (for kids/infant)
    age_min_months = Column(Integer)
    age_max_months = Column(Integer)

    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    garment_type_ref = relationship("GarmentType", back_populates="sizes")
    measurements = relationship("SizeMeasurement", back_populates="size_master", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_size_garment_gender', 'garment_type_id', 'gender'),
        Index('ix_size_name', 'size_name'),
    )


class SizeMeasurement(BaseSizeColor):
    """
    Actual measurements for each size
    Values like Chest: 96cm ±2.0
    """
    __tablename__ = "size_measurements"

    id = Column(Integer, primary_key=True, index=True)
    size_master_id = Column(Integer, ForeignKey("size_master.id", ondelete="CASCADE"), nullable=False, index=True)

    measurement_code = Column(String(20), nullable=False)  # CHEST, WAIST, etc.
    measurement_name = Column(String(50), nullable=False)

    value_cm = Column(Numeric(10, 2), nullable=False)
    value_inch = Column(Numeric(10, 2))  # Auto-calculated
    tolerance_plus = Column(Numeric(5, 2), default=2.0)
    tolerance_minus = Column(Numeric(5, 2), default=2.0)

    notes = Column(Text)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    size_master = relationship("SizeMaster", back_populates="measurements")

    __table_args__ = (
        UniqueConstraint('size_master_id', 'measurement_code', name='uq_size_measurement'),
        Index('ix_size_measurement', 'size_master_id', 'measurement_code'),
    )


# =============================================================================
# SAMPLE COLOR & SIZE SELECTIONS (for linking to samples)
# =============================================================================

class SampleColorSelection(BaseSizeColor):
    """
    Colors selected for a sample
    Supports selecting from:
    - Universal colors (Pantone, TCX, RGB, Hex)
    - H&M colors (H&M code)
    - Manual entry (any code type)

    In Sample Development form: User selects color type first, then enters/searches code
    """
    __tablename__ = "sample_color_selections"

    id = Column(Integer, primary_key=True, index=True)
    sample_id = Column(Integer, nullable=False, index=True)  # References merchandiser.sample_primary_info.id

    # Color source type: "universal", "hm", "manual"
    color_source = Column(String(20), nullable=False)

    # For universal colors
    universal_color_id = Column(Integer, ForeignKey("universal_colors.id"), nullable=True)

    # For H&M colors
    hm_color_id = Column(Integer, ForeignKey("hm_colors.id"), nullable=True)

    # For manual entry (when color not in master)
    manual_color_type = Column(String(20))  # "pantone", "tcx", "hex", "rgb", "custom"
    manual_color_code = Column(String(50))
    manual_color_name = Column(String(100))
    manual_hex_code = Column(String(7))

    # Display info
    display_order = Column(Integer, default=0)
    notes = Column(Text)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    universal_color = relationship("UniversalColor")
    hm_color = relationship("HMColor")

    __table_args__ = (
        Index('ix_sample_color_selection', 'sample_id'),
    )


class SampleSizeSelection(BaseSizeColor):
    """
    Sizes selected for a sample
    In Sample Development form: Popup shows sizes filtered by garment type, gender, age, fit
    User can select multiple sizes from different categories
    """
    __tablename__ = "sample_size_selections"

    id = Column(Integer, primary_key=True, index=True)
    sample_id = Column(Integer, nullable=False, index=True)  # References merchandiser.sample_primary_info.id

    size_master_id = Column(Integer, ForeignKey("size_master.id"), nullable=False)

    # Optional quantity for this size
    quantity = Column(Integer)

    display_order = Column(Integer, default=0)
    notes = Column(Text)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    size_master = relationship("SizeMaster")

    __table_args__ = (
        UniqueConstraint('sample_id', 'size_master_id', name='uq_sample_size_selection'),
        Index('ix_sample_size_selection', 'sample_id'),
    )


# =============================================================================
# BUYER USAGE TRACKING (for smart suggestions)
# =============================================================================

class BuyerColorUsage(BaseSizeColor):
    """Track which colors each buyer uses most for suggestions"""
    __tablename__ = "buyer_color_usage"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, nullable=False, index=True)

    # Can track either universal or H&M color
    universal_color_id = Column(Integer, ForeignKey("universal_colors.id"), nullable=True)
    hm_color_id = Column(Integer, ForeignKey("hm_colors.id"), nullable=True)

    usage_count = Column(Integer, default=0)
    last_used_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    universal_color = relationship("UniversalColor")
    hm_color = relationship("HMColor")

    __table_args__ = (
        Index('ix_buyer_color_usage', 'buyer_id', 'usage_count'),
    )


class BuyerSizeUsage(BaseSizeColor):
    """Track which sizes each buyer uses most for suggestions"""
    __tablename__ = "buyer_size_usage"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, nullable=False, index=True)
    size_master_id = Column(Integer, ForeignKey("size_master.id", ondelete="CASCADE"), nullable=False, index=True)
    usage_count = Column(Integer, default=0)
    last_used_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    size_master = relationship("SizeMaster")

    __table_args__ = (
        UniqueConstraint('buyer_id', 'size_master_id', name='uq_buyer_size_usage'),
        Index('ix_buyer_size_usage', 'buyer_id', 'usage_count'),
    )
