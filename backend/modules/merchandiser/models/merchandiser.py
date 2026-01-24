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
    yarn_composition_details = Column(JSON, nullable=True)  # Detailed composition breakdown (popup data)
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
            Handfeel, Unit ID, UoM, Remarks
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
    cuttable_width = Column(String, nullable=True)  # Cuttable Width (usable width after shrinkage)
    stretch = Column(String, nullable=True)  # Stretch percentage
    shrink = Column(String, nullable=True)  # Shrinkage percentage
    finish = Column(String, nullable=True)  # Finish type
    composition = Column(String, nullable=True)  # Composition (100% Cotton, etc.)
    handfeel = Column(String, nullable=True)  # Handfeel description
    unit_id = Column(Integer, nullable=False, default=1)  # Unit ID (reference to units system)
    uom = Column(String, nullable=False, default="meter")  # Unit of Measure
    remarks = Column(Text, nullable=True)  # Remarks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class TrimsAccessoriesDetail(Base):
    """
    Trims & Accessories Details (Merged) - 9 fields
    Fields: Product ID, Product Name, Category, Sub-Category, Product Type,
            Unit ID, UoM, Consumable Flag, Remarks
    """
    __tablename__ = "trims_accessories_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, unique=True, nullable=False, index=True)  # Product ID
    product_name = Column(String, nullable=False)  # Product Name
    category = Column(String, nullable=True)  # Category (Button, Thread, Label, etc.)
    sub_category = Column(String, nullable=True)  # Sub-Category
    product_type = Column(String, nullable=False, default="trims")  # Product Type: 'trims' or 'accessories'
    unit_id = Column(Integer, nullable=False, default=1)  # Unit ID (reference to units system)
    uom = Column(String, nullable=False, default="pcs")  # Unit of Measure
    consumable_flag = Column(Boolean, default=True)  # Consumable Flag
    remarks = Column(Text, nullable=True)  # Remarks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# Legacy models for backward compatibility (deprecated)
class TrimsDetail(Base):
    """
    DEPRECATED: Use TrimsAccessoriesDetail instead
    Trims Details - 8 fields
    """
    __tablename__ = "trims_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, unique=True, nullable=False, index=True)
    product_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    sub_category = Column(String, nullable=True)
    unit_id = Column(Integer, nullable=False, default=1)
    uom = Column(String, nullable=False, default="pcs")
    consumable_flag = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AccessoriesDetail(Base):
    """
    DEPRECATED: Use TrimsAccessoriesDetail instead
    Accessories Details - 8 fields
    """
    __tablename__ = "accessories_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, unique=True, nullable=False, index=True)
    product_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    sub_category = Column(String, nullable=True)
    unit_id = Column(Integer, nullable=False, default=1)
    uom = Column(String, nullable=False, default="pcs")
    consumable_flag = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)  # Remarks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FinishedGoodDetail(Base):
    """
    Finished Good Details - 8 fields
    Fields: Product ID, Product Name, Category, Sub-Category, Unit ID,
            UoM, Consumable Flag, Remarks
    """
    __tablename__ = "finished_good_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, unique=True, nullable=False, index=True)  # Product ID
    product_name = Column(String, nullable=False)  # Product Name
    category = Column(String, nullable=True)  # Category
    sub_category = Column(String, nullable=True)  # Sub-Category
    unit_id = Column(Integer, nullable=False, default=1)  # Unit ID (reference to units system)
    uom = Column(String, nullable=False, default="pcs")  # Unit of Measure
    consumable_flag = Column(Boolean, default=True)  # Consumable Flag
    remarks = Column(Text, nullable=True)  # Remarks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PackingGoodDetail(Base):
    """
    Packing Good Details - 13 fields
    Fields: Product ID, Product Name, Category, Sub-Category, Unit ID,
            UoM, Consumable Flag, Carton Dimensions (L/W/H), Carton Weight, Remarks
    """
    __tablename__ = "packing_good_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String, unique=True, nullable=False, index=True)  # Product ID
    product_name = Column(String, nullable=False)  # Product Name
    category = Column(String, nullable=True)  # Category (Poly Bag, Carton, etc.)
    sub_category = Column(String, nullable=True)  # Sub-Category
    unit_id = Column(Integer, nullable=False, default=1)  # Unit ID (reference to units system)
    uom = Column(String, nullable=False, default="pcs")  # Unit of Measure
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
    priority = Column(String(20), default='normal')  # Priority: urgent, high, normal, low
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


# ============================================================================
# ORDER MANAGEMENT MODELS
# ============================================================================

class SalesContract(Base):
    """
    Sales Contract Summary - Top level grouping for orders
    Fields: Sales Contract ID (Auto), Buyer Name, Sales Contract/Master LC No,
            Sales Contract/Master LC Date, Total Order Quantity (Auto),
            Total Order Value (Auto), No of PO (Auto), Earliest/Final Delivery Dates (Auto),
            Final Amendment Date, Amendment No (Auto)
    """
    __tablename__ = "sales_contracts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sales_contract_id = Column(String, unique=True, nullable=False, index=True)  # Auto-generated: SC-YYYYMMDD-XXX
    buyer_id = Column(Integer, nullable=False, index=True)  # BUYER NAME (cross-DB reference)
    buyer_name = Column(String, nullable=True)  # Denormalized for display
    sales_contract_no = Column(String, nullable=True)  # SALES CONTRACT / MASTER LC NO
    sales_contract_date = Column(DateTime(timezone=True), nullable=True)  # SALES CONTRACT / MASTER LC DATE

    # Auto-calculated fields (from child orders)
    total_order_quantity = Column(Integer, default=0)  # TOTAL ORDER QUANTITY (Auto)
    total_order_value = Column(Float, default=0.0)  # TOTAL ORDER VALUE (Auto)
    no_of_po = Column(Integer, default=0)  # NO OF PO (Auto)
    earliest_delivery_date = Column(DateTime(timezone=True), nullable=True)  # EARLIEST DATE OF DELIVERY (Auto)
    final_delivery_date = Column(DateTime(timezone=True), nullable=True)  # FINAL DATE OF DELIVERY (Auto)

    # Amendment tracking
    final_amendment_date = Column(DateTime(timezone=True), nullable=True)  # Final Date of Amendment
    amendment_no = Column(Integer, default=0)  # Amendment No (Auto-increment per contract)

    # Status
    status = Column(String, default='active')  # active, completed, cancelled
    remarks = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class OrderPrimaryInfo(Base):
    """
    Order Primary Info - Individual orders within a Sales Contract
    Fields: Buyer Name, Order Number, Order Date, Season (H&M), SCL PO,
            Order Category (H&M), Sales Contract/Master LC No, Style Name (Multiple),
            Allow Tolerance, Tolerance%
    """
    __tablename__ = "order_primary_info"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(String, unique=True, nullable=False, index=True)  # Auto-generated: ORD-YYYYMMDD-XXX
    sales_contract_id = Column(String, nullable=True, index=True)  # FK to sales_contracts
    buyer_id = Column(Integer, nullable=False, index=True)  # BUYER NAME (cross-DB reference)
    buyer_name = Column(String, nullable=True)  # Denormalized for display

    # Order details
    order_number = Column(String, nullable=False, index=True)  # ORDER NUMBER (from buyer)
    order_date = Column(DateTime(timezone=True), nullable=True)  # ORDER DATE
    scl_po = Column(String, nullable=True)  # SCL PO

    # Buyer-specific fields (H&M)
    season = Column(String, nullable=True)  # SEASON (Automatic when H&M)
    order_category = Column(String, nullable=True)  # ORDER CATEGORY (when H&M)

    # Style information (can add multiple styles via OrderStyle junction)
    # styles are linked via OrderStyle table

    # Tolerance settings
    allow_tolerance = Column(Boolean, default=False)  # Allow Tolerance (Yes/No)
    tolerance_percent = Column(Float, default=-3.0)  # Tolerance% (default -3)

    # Calculated fields
    total_quantity = Column(Integer, default=0)
    total_value = Column(Float, default=0.0)

    # Status
    status = Column(String, default='pending')  # pending, confirmed, in_production, shipped, completed
    remarks = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class OrderStyle(Base):
    """
    Order Style - Junction table linking orders to styles (many-to-many)
    Allows adding multiple styles to a single order
    """
    __tablename__ = "order_styles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(String, nullable=False, index=True)  # FK to order_primary_info.order_id
    style_id = Column(String, nullable=False, index=True)  # FK to style_creation.style_id
    style_name = Column(String, nullable=True)  # Denormalized for display

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DeliverySchedule(Base):
    """
    Delivery Schedule - Shipments per order
    Fields: Shipment ID (Auto), Shipment Date, Order Number, Destination Country,
            Destination Country Code, Destination Number, Destination Code,
            Incoterms, Freight Method, Status
    Extended for PRIMARK: Total Units, Packs, Price Ticket
    """
    __tablename__ = "delivery_schedules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    shipment_id = Column(String, unique=True, nullable=False, index=True)  # Auto-generated: SHP-YYYYMMDD-XXX
    order_id = Column(String, nullable=False, index=True)  # FK to order_primary_info.order_id
    order_number = Column(String, nullable=True)  # Denormalized from order

    # Shipment details
    shipment_date = Column(DateTime(timezone=True), nullable=True)  # SHIPMENT DATE

    # Destination details
    destination_country = Column(String, nullable=True)  # DESTINATION COUNTRY
    destination_country_code = Column(String, nullable=True)  # DESTINATION COUNTRY CODE
    destination_number = Column(String, nullable=True)  # DESTINATION NUMBER
    destination_code = Column(String, nullable=True)  # DESTINATION CODE

    # Shipping terms
    incoterms = Column(String, nullable=True)  # INCOTERMS (FOB, FOC, CIF, EXW, DDP, etc.)
    freight_method = Column(String, nullable=True)  # FREIGHT METHOD (SEA, AIR, ROAD, TRAIN)

    # Status
    status = Column(String, default='scheduled')  # scheduled, in_transit, delivered, cancelled

    # PRIMARK-specific fields (extended delivery info)
    total_units = Column(Integer, nullable=True)  # TOTAL UNITS (PRIMARK only)
    packs = Column(Integer, nullable=True)  # PACKS (PRIMARK only)
    price_ticket = Column(String, nullable=True)  # PRICE TICKET (PRIMARK only)

    # Calculated fields
    total_quantity = Column(Integer, default=0)
    total_cartons = Column(Integer, default=0)
    total_cbm = Column(Float, default=0.0)

    remarks = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PackingDetail(Base):
    """
    Packing Details - Per shipment carton/packing info
    Fields: Pack ID (Auto), Order No, Color ID (Multiple via Add Button),
            Total PCS (Auto), Size List (Multiple from Dropdown),
            Quantity by Size (Auto boxes per size), Net WT, Gross WT,
            Length, Width, Height, CBM, Max Weight per Carton
    """
    __tablename__ = "packing_details"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pack_id = Column(String, unique=True, nullable=False, index=True)  # Auto-generated: PCK-YYYYMMDD-XXX
    shipment_id = Column(String, nullable=False, index=True)  # FK to delivery_schedules.shipment_id
    order_id = Column(String, nullable=False, index=True)  # FK to order_primary_info.order_id

    # Color (can be multiple - use Add button, stored as JSON array)
    color_ids = Column(JSON, nullable=True)  # Array of color IDs
    color_names = Column(JSON, nullable=True)  # Array of color names (denormalized)

    # Size list (multiple from dropdown - stored as JSON array)
    size_ids = Column(JSON, nullable=True)  # Array of size IDs
    size_names = Column(JSON, nullable=True)  # Array of size names (denormalized)

    # Quantity by size (JSON object: {size_id: quantity})
    quantity_by_size = Column(JSON, nullable=True)  # {"S": 100, "M": 150, "L": 120, ...}

    # Calculated fields
    total_pcs = Column(Integer, default=0)  # TOTAL PCS (Auto sum of quantity_by_size)

    # Carton specifications
    net_weight_kg = Column(Float, nullable=True)  # NET WT (KG) - Auto calculated
    gross_weight_kg = Column(Float, nullable=True)  # GROSS WT (KG) - Auto calculated
    length_cm = Column(Float, nullable=True)  # LENGTH (cm)
    width_cm = Column(Float, nullable=True)  # WIDTH (cm)
    height_cm = Column(Float, nullable=True)  # HEIGHT (cm)
    cbm = Column(Float, nullable=True)  # CBM (Auto: L*W*H/1000000)
    max_weight_per_carton = Column(Float, nullable=True)  # Maximum weight per Carton (kg)

    # Carton count
    carton_quantity = Column(Integer, default=1)  # Number of cartons with this spec

    remarks = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PackingSizeQuantity(Base):
    """
    Packing Size Quantity - Detailed size breakdown for packing
    Separate table for normalized size-quantity data
    """
    __tablename__ = "packing_size_quantities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    packing_detail_id = Column(Integer, nullable=False, index=True)  # FK to packing_details.id
    size_id = Column(String, nullable=False)  # Size ID
    size_name = Column(String, nullable=True)  # Size name (denormalized)
    quantity = Column(Integer, default=0)  # Quantity for this size

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OrderBreakdown(Base):
    """
    Order Breakdown (Common) - Per shipment per style variant
    After Order Operation will be segregated by buyers
    Fields: Breakdown ID (Auto), Shipment ID, Order Number (Auto from Shipment),
            Style Variant (Auto list all variants), Order Quantity,
            Tolerance Quantity, Unit Price, Status
    """
    __tablename__ = "order_breakdowns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    breakdown_id = Column(String, unique=True, nullable=False, index=True)  # Auto-generated: BRK-YYYYMMDD-XXX
    shipment_id = Column(String, nullable=False, index=True)  # FK to delivery_schedules.shipment_id
    order_id = Column(String, nullable=False, index=True)  # Auto from shipment → order
    order_number = Column(String, nullable=True)  # Denormalized from order

    # Style variant (auto-listed from order's styles)
    style_variant_id = Column(String, nullable=False, index=True)  # FK to style_variant.style_variant_id
    style_id = Column(String, nullable=True)  # Parent style ID
    color_name = Column(String, nullable=True)  # Denormalized
    size_name = Column(String, nullable=True)  # Denormalized

    # Quantities
    order_quantity = Column(Integer, default=0)  # ORDER QUANTITY
    tolerance_quantity = Column(Integer, default=0)  # Tolerance Quantity (based on order tolerance %)
    shipped_quantity = Column(Integer, default=0)  # Actually shipped

    # Pricing
    unit_price = Column(Float, nullable=True)  # Unit Price (FOB/CM)
    total_value = Column(Float, nullable=True)  # Auto: order_quantity * unit_price

    # Status
    status = Column(String, default='pending')  # pending, cutting, sewing, finishing, packed, shipped

    remarks = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

