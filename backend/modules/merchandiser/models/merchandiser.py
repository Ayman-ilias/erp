"""
Merchandiser Department Models
Complete implementation based on user specification
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import BaseMerchandiser as Base


# ============================================================================
# MATERIAL DETAILS MODELS
# ============================================================================

class YarnDetail(Base):
    """
    Yarn Details - Most comprehensive material type
    Fields: YARN ID, YARN NAME, YARN COMPOSITION, BLEND RATIO, YARN COUNT,
            COUNT SYSTEM, YARN TYPE, YARN FORM, TPI, YARN FINISH, COLOR,
            DYE TYPE, UoM, REMARKS
    """
    __tablename__ = "yarn_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    yarn_id = Column(String, unique=True, nullable=False, index=True)  # YARN ID
    yarn_name = Column(String, nullable=False)  # YARN NAME
    yarn_composition = Column(String, nullable=True)  # YARN COMPOSITION
    blend_ratio = Column(String, nullable=True)  # BLEND RATIO (e.g., "60/40")
    yarn_count = Column(String, nullable=True)  # YARN COUNT
    count_system = Column(String, nullable=True)  # COUNT SYSTEM (Ne, Nm, Tex, etc.)
    yarn_type = Column(String, nullable=True)  # YARN TYPE (Ring Spun, OE, etc.)
    yarn_form = Column(String, nullable=True)  # YARN FORM (Cone, Hank, etc.)
    tpi = Column(String, nullable=True)  # TPI (Twists Per Inch)
    yarn_finish = Column(String, nullable=True)  # YARN FINISH
    color = Column(String, nullable=True)  # COLOR
    dye_type = Column(String, nullable=True)  # DYE TYPE (Reactive, Disperse, etc.)
    uom = Column(String, nullable=False, default="kg")  # Unit of Measure
    remarks = Column(Text, nullable=True)  # REMARKS
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FabricDetail(Base):
    """
    Fabric Details - 16 fields
    Fields: Fabric ID, Fabric Name, Category, Type, Construction, Weave/Knit,
            GSM, Gauge/EPI, Width, Stretch, Shrink, Finish, Composition,
            Handfeel, UoM, Remarks
    """
    __tablename__ = "fabric_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fabric_id = Column(String, unique=True, nullable=False, index=True)  # Fabric ID
    fabric_name = Column(String, nullable=False)  # Fabric Name
    category = Column(String, nullable=True)  # Category (Knit, Woven, etc.)
    type = Column(String, nullable=True)  # Type (Single Jersey, Interlock, etc.)
    construction = Column(String, nullable=True)  # Construction
    weave_knit = Column(String, nullable=True)  # Weave/Knit pattern
    gsm = Column(Integer, nullable=True)  # GSM (Grams per Square Meter)
    gauge_epi = Column(String, nullable=True)  # Gauge/EPI (Ends Per Inch)
    width = Column(String, nullable=True)  # Width (e.g., "60 inches")
    stretch = Column(String, nullable=True)  # Stretch percentage
    shrink = Column(String, nullable=True)  # Shrinkage percentage
    finish = Column(String, nullable=True)  # Finish type
    composition = Column(String, nullable=True)  # Composition (100% Cotton, etc.)
    handfeel = Column(String, nullable=True)  # Handfeel description
    uom = Column(String, nullable=False, default="meter")  # Unit of Measure
    remarks = Column(Text, nullable=True)  # Remarks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class TrimsDetail(Base):
    """
    Trims Details - 7 fields
    Fields: Product ID, Product Name, Category, Sub-Category, UoM,
            Consumable Flag, Remarks
    """
    __tablename__ = "trims_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, unique=True, nullable=False, index=True)  # Product ID
    product_name = Column(String, nullable=False)  # Product Name
    category = Column(String, nullable=True)  # Category (Button, Thread, etc.)
    sub_category = Column(String, nullable=True)  # Sub-Category
    uom = Column(String, nullable=False, default="piece")  # Unit of Measure
    consumable_flag = Column(Boolean, default=True)  # Consumable Flag
    remarks = Column(Text, nullable=True)  # Remarks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AccessoriesDetail(Base):
    """
    Accessories Details - 7 fields
    Fields: Product ID, Product Name, Category, Sub-Category, UoM,
            Consumable Flag, Remarks
    """
    __tablename__ = "accessories_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, unique=True, nullable=False, index=True)  # Product ID
    product_name = Column(String, nullable=False)  # Product Name
    category = Column(String, nullable=True)  # Category
    sub_category = Column(String, nullable=True)  # Sub-Category
    uom = Column(String, nullable=False, default="piece")  # Unit of Measure
    consumable_flag = Column(Boolean, default=True)  # Consumable Flag
    remarks = Column(Text, nullable=True)  # Remarks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FinishedGoodDetail(Base):
    """
    Finished Good Details - 7 fields
    Fields: Product ID, Product Name, Category, Sub-Category, UoM,
            Consumable Flag, Remarks
    """
    __tablename__ = "finished_good_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, unique=True, nullable=False, index=True)  # Product ID
    product_name = Column(String, nullable=False)  # Product Name
    category = Column(String, nullable=True)  # Category
    sub_category = Column(String, nullable=True)  # Sub-Category
    uom = Column(String, nullable=False, default="piece")  # Unit of Measure
    consumable_flag = Column(Boolean, default=True)  # Consumable Flag
    remarks = Column(Text, nullable=True)  # Remarks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PackingGoodDetail(Base):
    """
    Packing Good Details - 12 fields
    Fields: Product ID, Product Name, Category, Sub-Category, UoM,
            Consumable Flag, Carton Dimensions (L/W/H), Carton Weight, Remarks
    """
    __tablename__ = "packing_good_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, unique=True, nullable=False, index=True)  # Product ID
    product_name = Column(String, nullable=False)  # Product Name
    category = Column(String, nullable=True)  # Category (Poly Bag, Carton, etc.)
    sub_category = Column(String, nullable=True)  # Sub-Category
    uom = Column(String, nullable=False, default="piece")  # Unit of Measure
    consumable_flag = Column(Boolean, default=True)  # Consumable Flag
    carton_length = Column(Float, nullable=True)  # Carton length in cm
    carton_width = Column(Float, nullable=True)  # Carton width in cm
    carton_height = Column(Float, nullable=True)  # Carton height in cm
    carton_weight = Column(Float, nullable=True)  # Carton weight in kg
    remarks = Column(Text, nullable=True)  # Remarks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ============================================================================
# SIZE DETAILS MODEL
# ============================================================================

class SizeChart(Base):
    """
    Size Chart - 14 fields
    Fields: SIZE ID, SIZE NAME, GARMENT TYPE, GENDER, AGE GROUP, CHEST, WAIST,
            HIP, SLEEVE LENGTH, BODY LENGTH, SHOULDER WIDTH, INSEAM, UOM, REMARKS
    """
    __tablename__ = "size_chart"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    size_id = Column(String, unique=True, nullable=False, index=True)  # SIZE ID
    size_name = Column(String, nullable=False)  # SIZE NAME (S, M, L, XL, etc.)
    garment_type = Column(String, nullable=True)  # GARMENT TYPE (T-Shirt, Pants, etc.)
    gender = Column(String, nullable=True)  # GENDER (Male, Female, Unisex)
    age_group = Column(String, nullable=True)  # AGE GROUP (Adult, Kids, Infant)
    chest = Column(Float, nullable=True)  # CHEST measurement
    waist = Column(Float, nullable=True)  # WAIST measurement
    hip = Column(Float, nullable=True)  # HIP measurement
    sleeve_length = Column(Float, nullable=True)  # SLEEVE LENGTH
    body_length = Column(Float, nullable=True)  # BODY LENGTH
    shoulder_width = Column(Float, nullable=True)  # SHOULDER WIDTH
    inseam = Column(Float, nullable=True)  # INSEAM
    uom = Column(String, nullable=False, default="inch")  # Unit of Measure (inch, cm)
    remarks = Column(Text, nullable=True)  # REMARKS
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ============================================================================
# SAMPLE DEVELOPMENT MODELS
# ============================================================================

class SamplePrimaryInfo(Base):
    """
    Sample Primary Info - Matches Sample Request fields
    """
    __tablename__ = "sample_primary_info"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_id = Column(String, unique=True, nullable=False, index=True)  # SAMPLE ID (Auto if don't have)
    sample_name = Column(String, nullable=False)  # SAMPLE NAME
    buyer_id = Column(Integer, nullable=False, index=True)  # BUYER (cross-DB reference)
    buyer_name = Column(String, nullable=True)  # Denormalized for display
    
    # Technical specs
    item = Column(String, nullable=True)  # ITEM
    gauge = Column(String, nullable=True)  # GAUGE
    ply = Column(String, nullable=True)  # PLY (String, can be converted to int)
    sample_category = Column(String, nullable=True)  # Category (Proto, Fit, PP, etc.)
    
    # Yarn information (can be multiple)
    yarn_ids = Column(JSON, nullable=True)  # YARN ID (Multiple) - Array of yarn IDs
    yarn_id = Column(String, nullable=True)  # YARN ID (Single - first one from array for sync)
    yarn_details = Column(Text, nullable=True)  # YARN DETAILS
    component_yarn = Column(String, nullable=True)  # COMPONENT(YARN)
    count = Column(String, nullable=True)  # COUNT (Automatic from Yarn ID)
    
    # Trims information (can be multiple: buttons, zippers, labels)
    trims_ids = Column(JSON, nullable=True)  # TRIMS ID (Multiple) - buttons/zipper/label
    trims_details = Column(Text, nullable=True)  # TRIMS DETAILS
    
    # Decorative parts (multiple)
    decorative_part = Column(JSON, nullable=True)  # DECORATIVE PART (Array of strings: Embroidery/Print, etc.)
    
    # Color information (can be multiple)
    color_ids = Column(JSON, nullable=True)  # COLOR IDs (Multiple) - Array of color IDs
    color_id = Column(String, nullable=True)  # COLOR ID (Single - first one from array for sync)
    color_name = Column(String, nullable=True)  # COLOR NAME
    
    # Size information (can be multiple)
    size_ids = Column(JSON, nullable=True)  # SIZE IDs (Multiple) - Array of size IDs
    size_id = Column(String, nullable=True)  # SIZE ID (Single - first one from array for sync)
    size_name = Column(String, nullable=True)  # SIZE NAME
    
    # Dates
    yarn_handover_date = Column(DateTime(timezone=True), nullable=True)
    trims_handover_date = Column(DateTime(timezone=True), nullable=True)
    required_date = Column(DateTime(timezone=True), nullable=True)
    
    # Sample details
    request_pcs = Column(Integer, nullable=True)  # Number of pieces requested
    # Multiple additional instructions with status: [{instruction: string, done: boolean}, ...]
    additional_instruction = Column(JSON, nullable=True)
    
    # Attachments (multiple techpack files: [{url: string, filename: string, type: string}, ...])
    techpack_files = Column(JSON, nullable=True)  # Array of techpack files with type
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SampleTNAColorWise(Base):
    """
    Sample TNA - Color Wise - 14 fields
    Fields: SAMPLE NAME, SAMPLE ID, WORK SHEET RECEIVED DATE, WORK SHEET HANDOVER DATE,
            YARN HANDOVER DATE, TRIMS HANDOVER DATE, REQUIRED DATE, ITEM, REQUEST PCS,
            SAMPLE CATEGORY, SIZE, ADDITIONAL INSTRUCTION, Attach Techpack
    Note: Some fields auto-populate based on Sample ID
    """
    __tablename__ = "sample_tna_color_wise"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_id = Column(String, nullable=False, index=True)  # SAMPLE ID
    sample_name = Column(String, nullable=False)  # SAMPLE NAME (Auto from Sample ID)
    
    # Timeline dates
    worksheet_received_date = Column(DateTime(timezone=True), nullable=True)  # From Buyer
    worksheet_handover_date = Column(DateTime(timezone=True), nullable=True)  # Internal handover
    yarn_handover_date = Column(DateTime(timezone=True), nullable=True)  # Yarn delivery
    trims_handover_date = Column(DateTime(timezone=True), nullable=True)  # Trims delivery
    required_date = Column(DateTime(timezone=True), nullable=True)  # REQUIRED DATE
    
    # Sample details
    item = Column(String, nullable=True)  # ITEM
    request_pcs = Column(Integer, nullable=True)  # REQUEST PCS (quantity)
    sample_category = Column(String, nullable=True)  # SAMPLE CATEGORY (Proto, Fit, PP, etc.)
    size = Column(String, nullable=True)  # SIZE
    
    # Additional info
    additional_instruction = Column(Text, nullable=True)  # ADDITIONAL INSTRUCTION
    techpack_attachment = Column(String, nullable=True)  # Attach Techpack (file path/URL)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SampleStatus(Base):
    """
    Sample Status - Same structure as Samples module SampleStatus
    Fields: Sample ID (cross-DB reference), Status By Sample, Status From Merchandiser, Notes, Updated By, Expecting End Date
    """
    __tablename__ = "sample_status"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_id = Column(String, nullable=False, index=True)  # Sample ID (cross-DB reference, not FK)
    
    # Status fields - same as Samples module
    status_by_sample = Column(String, nullable=True)  # Status set by sample team
    status_from_merchandiser = Column(String, nullable=True)  # Status from merchandiser
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Who made the change
    updated_by = Column(String, nullable=True)

    # Expected end date (set by sample department)
    expecting_end_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ============================================================================
# STYLE MANAGEMENT MODELS
# ============================================================================

class StyleCreation(Base):
    """
    Style Creation From Sample - 4 fields
    Fields: STYLE ID, STYLE NAME, SAMPLE ID, Buyer Name
    """
    __tablename__ = "style_creation"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_id = Column(String, unique=True, nullable=False, index=True)  # STYLE ID
    style_name = Column(String, nullable=False)  # STYLE NAME
    sample_id = Column(String, nullable=False, index=True)  # SAMPLE ID (source)
    buyer_id = Column(Integer, nullable=False, index=True)  # Buyer Name (cross-DB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class StyleBasicInfo(Base):
    """
    Style Basic Info - 7 fields
    Fields: Style ID, Gauge, Gender, Age Group, Product Type,
            Product Category, Specific Name
    """
    __tablename__ = "style_basic_info"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_id = Column(String, unique=True, nullable=False, index=True)  # Style ID
    gauge = Column(String, nullable=True)  # Gauge
    gender = Column(String, nullable=True)  # Gender
    age_group = Column(String, nullable=True)  # Age Group
    product_type = Column(String, nullable=True)  # Product Type
    product_category = Column(String, nullable=True)  # Product Category
    specific_name = Column(String, nullable=True)  # Specific Name
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class StyleMaterialLink(Base):
    """
    Style Material Details - Links style to materials
    One ID for complete list of style materials
    Supports adding multiple products of each type
    """
    __tablename__ = "style_material_link"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_material_id = Column(String, unique=True, nullable=False, index=True)  # Unique ID for material list
    style_id = Column(String, nullable=False, index=True)  # STYLE ID
    
    # Material type and ID (polymorphic reference)
    material_type = Column(String, nullable=False)  # Type: YARN, FABRIC, TRIMS, ACCESSORIES, FINISHED_GOOD, PACKING_GOOD
    material_id = Column(String, nullable=False)  # ID of the material (yarn_id, fabric_id, product_id, etc.)
    
    # Quantity and costing
    required_quantity = Column(Float, nullable=True)  # Required quantity (average)
    uom = Column(String, nullable=True)  # Unit of Measure
    price_per_unit = Column(Float, nullable=True)  # Price Per Unit
    amount = Column(Float, nullable=True)  # Amount (auto-calculated)
    amendment_no = Column(String, nullable=True)  # Amendment No
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class StyleColor(Base):
    """
    Add Style Color
    Fields: Style ID, Color ID, Color Code Type, Color Code, Color Name
    Supports adding more than 1 color
    """
    __tablename__ = "style_color"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_id = Column(String, nullable=False, index=True)  # Style ID
    color_id = Column(String, nullable=False)  # Color ID
    color_code_type = Column(String, nullable=True)  # Color Code Type (Hex, Pantone, etc.)
    color_code = Column(String, nullable=True)  # Color Code
    color_name = Column(String, nullable=False)  # Color Name
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class StyleSize(Base):
    """
    Add Style Size
    Fields: Style ID, SIZE ID, SIZE NAME
    Supports adding more than 1 size
    """
    __tablename__ = "style_size"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_id = Column(String, nullable=False, index=True)  # Style ID
    size_id = Column(String, nullable=False)  # SIZE ID
    size_name = Column(String, nullable=False)  # SIZE NAME
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class StyleVariant(Base):
    """
    Style Variant - Automatically created based on Style Size & Color combinations
    STYLE VARIANT ID is generated automatically but editable
    Each variant represents one Color × Size combination
    """
    __tablename__ = "style_variant"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_variant_id = Column(String, unique=True, nullable=False, index=True)  # STYLE VARIANT ID (auto-generated)
    style_id = Column(String, nullable=False, index=True)  # Style ID
    color_id = Column(String, nullable=False)  # Color ID
    size_id = Column(String, nullable=False)  # SIZE ID
    
    # Auto-populated from StyleColor and StyleSize
    color_name = Column(String, nullable=True)  # Color Name (from StyleColor)
    size_name = Column(String, nullable=True)  # Size Name (from StyleSize)
    
    # Editable fields
    variant_name = Column(String, nullable=True)  # Custom variant name (editable)
    is_active = Column(Boolean, default=True)  # Active flag
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ============================================================================
# CM CALCULATION MODEL
# ============================================================================

class CMCalculation(Base):
    """
    CM Calculation
    Fields: Style ID, CM ID, CM, Style Material ID, Required Quantity,
            UoM, Price Per Unit, Amount, Amendment No
    Formula: Average Knitting Minute * Per Minute Value = Production Cost
    """
    __tablename__ = "cm_calculation"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cm_id = Column(String, unique=True, nullable=False, index=True)  # CM ID
    style_id = Column(String, nullable=False, index=True)  # Style ID
    
    # Material costs (from StyleMaterialLink)
    style_material_id = Column(String, nullable=True)  # Style Material ID (reference)
    total_material_cost = Column(Float, nullable=True)  # Sum of all material amounts
    
    # Production costs
    average_knitting_minute = Column(Float, nullable=True)  # Average Knitting Minute (SMV)
    per_minute_value = Column(Float, nullable=True)  # Per Minute Value (labor rate)
    production_cost = Column(Float, nullable=True)  # Production Cost (calculated)
    
    # Overhead and other costs
    overhead_cost = Column(Float, nullable=True)  # Overhead Cost
    testing_cost = Column(Float, nullable=True)  # Testing & QC Cost
    commercial_cost = Column(Float, nullable=True)  # Commercial Cost (bank, insurance, etc.)
    
    # Final CM
    total_cm = Column(Float, nullable=True)  # Total CM (Cost of Manufacturing)
    
    # Amendment tracking
    amendment_no = Column(String, nullable=True)  # Amendment No
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

