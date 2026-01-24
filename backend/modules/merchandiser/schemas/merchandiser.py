"""
Merchandiser Department Schemas
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============================================================================
# MATERIAL DETAILS SCHEMAS
# ============================================================================

# --- YARN SCHEMAS ---
class YarnCompositionDetail(BaseModel):
    """Yarn composition detail for popup UI"""
    material: str = Field(..., description="Material name (e.g., BCI COTTON, RECYCLED, POLYAMIDE)")
    percentage: float = Field(..., ge=0, le=100, description="Percentage (0-100)")

class YarnDetailBase(BaseModel):
    yarn_id: Optional[str] = Field(None, description="Unique Yarn ID (auto-generated if not provided)")
    yarn_name: str = Field(..., description="Yarn Name")
    yarn_composition: Optional[str] = None
    yarn_composition_details: Optional[List[YarnCompositionDetail]] = Field(None, description="Detailed composition breakdown")
    blend_ratio: Optional[str] = None
    yarn_count: Optional[str] = None
    count_system: Optional[str] = None
    yarn_type: Optional[str] = None
    yarn_form: Optional[str] = None
    tpi: Optional[str] = None
    yarn_finish: Optional[str] = None
    color: Optional[str] = None
    dye_type: Optional[str] = None
    uom: str = Field(default="kg", description="Unit of Measure")
    remarks: Optional[str] = None

    @field_validator('yarn_composition_details')
    @classmethod
    def validate_composition_total(cls, v):
        if v is not None:
            total = sum(item.percentage for item in v)
            if abs(total - 100.0) > 0.01:  # Allow small floating point errors
                raise ValueError(f"Composition percentages must total 100%, got {total}%")
        return v


class YarnDetailCreate(YarnDetailBase):
    pass


class YarnDetailUpdate(BaseModel):
    yarn_name: Optional[str] = None
    yarn_composition: Optional[str] = None
    yarn_composition_details: Optional[List[YarnCompositionDetail]] = None
    blend_ratio: Optional[str] = None
    yarn_count: Optional[str] = None
    count_system: Optional[str] = None
    yarn_type: Optional[str] = None
    yarn_form: Optional[str] = None
    tpi: Optional[str] = None
    yarn_finish: Optional[str] = None
    color: Optional[str] = None
    dye_type: Optional[str] = None
    uom: Optional[str] = None
    remarks: Optional[str] = None

    @field_validator('yarn_composition_details')
    @classmethod
    def validate_composition_total(cls, v):
        if v is not None:
            total = sum(item.percentage for item in v)
            if abs(total - 100.0) > 0.01:
                raise ValueError(f"Composition percentages must total 100%, got {total}%")
        return v


class YarnDetailResponse(YarnDetailBase):
    id: int
    yarn_id: str = Field(..., description="Unique Yarn ID")  # Required in response
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- FABRIC SCHEMAS ---
class FabricDetailBase(BaseModel):
    fabric_id: Optional[str] = Field(None, description="Unique Fabric ID (auto-generated if not provided)")
    fabric_name: str = Field(..., description="Fabric Name")
    category: Optional[str] = None
    type: Optional[str] = None
    construction: Optional[str] = None
    weave_knit: Optional[str] = None
    gsm: Optional[int] = None
    gauge_epi: Optional[str] = None
    width: Optional[str] = None
    cuttable_width: Optional[str] = None
    stretch: Optional[str] = None
    shrink: Optional[str] = None
    finish: Optional[str] = None
    composition: Optional[str] = None
    handfeel: Optional[str] = None
    unit_id: int = Field(default=1, description="Unit ID from units system")
    uom: str = Field(default="meter", description="Unit of Measure")
    remarks: Optional[str] = None


class FabricDetailCreate(FabricDetailBase):
    pass


class FabricDetailUpdate(BaseModel):
    fabric_name: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None
    construction: Optional[str] = None
    weave_knit: Optional[str] = None
    gsm: Optional[int] = None
    gauge_epi: Optional[str] = None
    width: Optional[str] = None
    cuttable_width: Optional[str] = None
    stretch: Optional[str] = None
    shrink: Optional[str] = None
    finish: Optional[str] = None
    composition: Optional[str] = None
    handfeel: Optional[str] = None
    unit_id: Optional[int] = None
    uom: Optional[str] = None
    remarks: Optional[str] = None


class FabricDetailResponse(FabricDetailBase):
    id: int
    fabric_id: str = Field(..., description="Unique Fabric ID")  # Required in response
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- TRIMS SCHEMAS ---
class TrimsDetailBase(BaseModel):
    product_id: str = Field(..., description="Unique Product ID")
    product_name: str = Field(..., description="Product Name")
    category: Optional[str] = None
    sub_category: Optional[str] = None
    unit_id: int = Field(default=1, description="Unit ID (reference to units system)")
    uom: str = Field(default="pcs", description="Unit of Measure")
    consumable_flag: bool = Field(default=True, description="Is Consumable")
    remarks: Optional[str] = None


class TrimsDetailCreate(TrimsDetailBase):
    pass


class TrimsDetailUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    unit_id: Optional[int] = None
    uom: Optional[str] = None
    consumable_flag: Optional[bool] = None
    remarks: Optional[str] = None


class TrimsDetailResponse(TrimsDetailBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- ACCESSORIES SCHEMAS ---
class AccessoriesDetailBase(BaseModel):
    product_id: str = Field(..., description="Unique Product ID")
    product_name: str = Field(..., description="Product Name")
    category: Optional[str] = None
    sub_category: Optional[str] = None
    unit_id: int = Field(default=1, description="Unit ID (reference to units system)")
    uom: str = Field(default="pcs", description="Unit of Measure")
    consumable_flag: bool = Field(default=True, description="Is Consumable")
    remarks: Optional[str] = None


class AccessoriesDetailCreate(AccessoriesDetailBase):
    pass


class AccessoriesDetailUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    unit_id: Optional[int] = None
    uom: Optional[str] = None
    consumable_flag: Optional[bool] = None
    remarks: Optional[str] = None


class AccessoriesDetailResponse(AccessoriesDetailBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- MERGED TRIMS & ACCESSORIES SCHEMAS ---
class TrimsAccessoriesDetailBase(BaseModel):
    product_id: Optional[str] = Field(None, description="Unique Product ID (auto-generated if not provided)")
    product_name: str = Field(..., description="Product Name")
    category: Optional[str] = None
    sub_category: Optional[str] = None
    product_type: str = Field(..., description="Product Type: 'trims' or 'accessories'")
    unit_id: int = Field(default=1, description="Unit ID (reference to units system)")
    uom: str = Field(default="pcs", description="Unit of Measure")
    consumable_flag: bool = Field(default=True, description="Is Consumable")
    remarks: Optional[str] = None

    @field_validator('product_type')
    @classmethod
    def validate_product_type(cls, v):
        if v not in ['trims', 'accessories']:
            raise ValueError("Product type must be either 'trims' or 'accessories'")
        return v


class TrimsAccessoriesDetailCreate(TrimsAccessoriesDetailBase):
    pass


class TrimsAccessoriesDetailUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    product_type: Optional[str] = None
    unit_id: Optional[int] = None
    uom: Optional[str] = None
    consumable_flag: Optional[bool] = None
    remarks: Optional[str] = None

    @field_validator('product_type')
    @classmethod
    def validate_product_type(cls, v):
        if v is not None and v not in ['trims', 'accessories']:
            raise ValueError("Product type must be either 'trims' or 'accessories'")
        return v


class TrimsAccessoriesDetailResponse(TrimsAccessoriesDetailBase):
    id: int
    product_id: str = Field(..., description="Unique Product ID")  # Required in response
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- FINISHED GOOD SCHEMAS ---
class FinishedGoodDetailBase(BaseModel):
    product_id: str = Field(..., description="Unique Product ID")
    product_name: str = Field(..., description="Product Name")
    category: Optional[str] = None
    sub_category: Optional[str] = None
    unit_id: int = Field(default=1, description="Unit ID (reference to units system)")
    uom: str = Field(default="pcs", description="Unit of Measure")
    consumable_flag: bool = Field(default=True, description="Is Consumable")
    remarks: Optional[str] = None


class FinishedGoodDetailCreate(FinishedGoodDetailBase):
    pass


class FinishedGoodDetailUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    unit_id: Optional[int] = None
    uom: Optional[str] = None
    consumable_flag: Optional[bool] = None
    remarks: Optional[str] = None


class FinishedGoodDetailResponse(FinishedGoodDetailBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- PACKING GOOD SCHEMAS ---
class PackingGoodDetailBase(BaseModel):
    product_id: str = Field(..., description="Unique Product ID")
    product_name: str = Field(..., description="Product Name")
    category: Optional[str] = None
    sub_category: Optional[str] = None
    unit_id: int = Field(default=1, description="Unit ID (reference to units system)")
    uom: str = Field(default="pcs", description="Unit of Measure")
    consumable_flag: bool = Field(default=True, description="Is Consumable")
    carton_length: Optional[float] = Field(None, description="Carton length in cm")
    carton_width: Optional[float] = Field(None, description="Carton width in cm")
    carton_height: Optional[float] = Field(None, description="Carton height in cm")
    carton_weight: Optional[float] = Field(None, description="Carton weight in kg")
    remarks: Optional[str] = None


class PackingGoodDetailCreate(PackingGoodDetailBase):
    pass


class PackingGoodDetailUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    unit_id: Optional[int] = None
    uom: Optional[str] = None
    consumable_flag: Optional[bool] = None
    carton_length: Optional[float] = None
    carton_width: Optional[float] = None
    carton_height: Optional[float] = None
    carton_weight: Optional[float] = None
    remarks: Optional[str] = None


class PackingGoodDetailResponse(PackingGoodDetailBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# SIZE DETAILS SCHEMAS
# ============================================================================

class SizeChartBase(BaseModel):
    size_id: str = Field(..., description="Unique Size ID")
    size_name: str = Field(..., description="Size Name")
    garment_type: Optional[str] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    hip: Optional[float] = None
    sleeve_length: Optional[float] = None
    body_length: Optional[float] = None
    shoulder_width: Optional[float] = None
    inseam: Optional[float] = None
    uom: str = Field(default="inch", description="Unit of Measure")
    remarks: Optional[str] = None


class SizeChartCreate(SizeChartBase):
    pass


class SizeChartUpdate(BaseModel):
    size_name: Optional[str] = None
    garment_type: Optional[str] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    hip: Optional[float] = None
    sleeve_length: Optional[float] = None
    body_length: Optional[float] = None
    shoulder_width: Optional[float] = None
    inseam: Optional[float] = None
    uom: Optional[str] = None
    remarks: Optional[str] = None


class SizeChartResponse(SizeChartBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# SAMPLE DEVELOPMENT SCHEMAS
# ============================================================================

class SamplePrimaryInfoBase(BaseModel):
    sample_id: Optional[str] = Field(None, description="Unique Sample ID (auto-generated if empty)")
    sample_name: str = Field(..., description="Sample Name")
    buyer_id: int = Field(..., description="Buyer ID")
    buyer_name: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    ply: Optional[str] = None
    sample_category: Optional[str] = None
    yarn_ids: Optional[List[str]] = Field(default=None, description="Multiple Yarn IDs")
    yarn_id: Optional[str] = None
    yarn_details: Optional[str] = None
    component_yarn: Optional[str] = None
    count: Optional[str] = None
    trims_ids: Optional[List[str]] = Field(default=None, description="Multiple Trims IDs")
    trims_details: Optional[str] = None
    decorative_part: Optional[List[str]] = Field(default=None, description="Multiple Decorative Parts (Array of strings)")
    color_ids: Optional[List[int]] = Field(default=None, description="Multiple Color IDs")
    color_id: Optional[str] = None
    color_name: Optional[str] = None
    size_ids: Optional[List[str]] = Field(default=None, description="Multiple Size IDs")
    size_id: Optional[str] = None
    size_name: Optional[str] = None
    yarn_handover_date: Optional[datetime] = None
    trims_handover_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    request_pcs: Optional[int] = None
    priority: Optional[str] = Field(default='normal', description="Priority: urgent, high, normal, low")
    # Multiple additional instructions with done status: [{instruction: str, done: bool}, ...]
    additional_instruction: Optional[List[Dict[str, Any]]] = Field(default=None, description="Multiple Additional Instructions with status")
    # Multiple techpack files: [{url: str, filename: str, type: str}, ...]
    techpack_files: Optional[List[Dict[str, Any]]] = Field(default=None, description="Multiple Techpack Files with type")


class SamplePrimaryInfoCreate(SamplePrimaryInfoBase):
    pass


class SamplePrimaryInfoUpdate(BaseModel):
    sample_name: Optional[str] = None
    buyer_id: Optional[int] = None
    buyer_name: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    ply: Optional[str] = None
    sample_category: Optional[str] = None
    yarn_ids: Optional[List[str]] = None
    yarn_id: Optional[str] = None
    yarn_details: Optional[str] = None
    component_yarn: Optional[str] = None
    count: Optional[str] = None
    trims_ids: Optional[List[str]] = None
    trims_details: Optional[str] = None
    decorative_part: Optional[List[str]] = Field(default=None, description="Multiple Decorative Parts (Array of strings)")
    color_id: Optional[str] = None
    color_name: Optional[str] = None
    size_id: Optional[str] = None
    size_name: Optional[str] = None
    yarn_handover_date: Optional[datetime] = None
    trims_handover_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    request_pcs: Optional[int] = None
    priority: Optional[str] = Field(default=None, description="Priority: urgent, high, normal, low")
    # Multiple additional instructions with done status: [{instruction: str, done: bool}, ...]
    additional_instruction: Optional[List[Dict[str, Any]]] = Field(default=None, description="Multiple Additional Instructions with status")
    # Multiple techpack files: [{url: str, filename: str, type: str}, ...]
    techpack_files: Optional[List[Dict[str, Any]]] = Field(default=None, description="Multiple Techpack Files with type")


class SamplePrimaryInfoResponse(SamplePrimaryInfoBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator('decorative_part', mode='before')
    @classmethod
    def normalize_decorative_part(cls, v):
        """Convert decorative_part to list if it's a string"""
        if v is None or v == '':
            return None
        if isinstance(v, str):
            items = [item.strip() for item in v.split(',') if item.strip()]
            return items if items else None
        return v
    
    @field_validator('additional_instruction', mode='before')
    @classmethod
    def normalize_additional_instruction(cls, v):
        """Convert additional_instruction to list if it's a string"""
        if v is None or v == '':
            return None
        if isinstance(v, str):
            # For merchandiser, additional_instruction should be a list of dicts
            # If it's a string, convert to list of instruction objects
            lines = [line.strip() for line in v.split('\n') if line.strip()]
            return [{"instruction": line, "done": False} for line in lines] if lines else None
        return v

    class Config:
        from_attributes = True


class SampleTNAColorWiseBase(BaseModel):
    sample_id: str = Field(..., description="Sample ID")
    sample_name: str = Field(..., description="Sample Name")
    worksheet_received_date: Optional[datetime] = None
    worksheet_handover_date: Optional[datetime] = None
    yarn_handover_date: Optional[datetime] = None
    trims_handover_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    item: Optional[str] = None
    request_pcs: Optional[int] = None
    sample_category: Optional[str] = None
    size: Optional[str] = None
    additional_instruction: Optional[str] = None
    techpack_attachment: Optional[str] = None


class SampleTNAColorWiseCreate(SampleTNAColorWiseBase):
    pass


class SampleTNAColorWiseUpdate(BaseModel):
    sample_name: Optional[str] = None
    worksheet_received_date: Optional[datetime] = None
    worksheet_handover_date: Optional[datetime] = None
    yarn_handover_date: Optional[datetime] = None
    trims_handover_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    item: Optional[str] = None
    request_pcs: Optional[int] = None
    sample_category: Optional[str] = None
    size: Optional[str] = None
    additional_instruction: Optional[str] = None
    techpack_attachment: Optional[str] = None


class SampleTNAColorWiseResponse(SampleTNAColorWiseBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SampleStatusBase(BaseModel):
    status_by_sample: Optional[str] = None
    status_from_merchandiser: Optional[str] = None
    notes: Optional[str] = None
    updated_by: Optional[str] = None
    expecting_end_date: Optional[datetime] = None


class SampleStatusCreate(SampleStatusBase):
    sample_id: str = Field(..., description="Sample ID")


class SampleStatusUpdate(BaseModel):
    status_by_sample: Optional[str] = None
    status_from_merchandiser: Optional[str] = None
    notes: Optional[str] = None
    updated_by: Optional[str] = None
    expecting_end_date: Optional[datetime] = None


class SampleStatusResponse(SampleStatusBase):
    id: int
    sample_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# STYLE MANAGEMENT SCHEMAS
# ============================================================================

class StyleCreationBase(BaseModel):
    style_id: str = Field(..., description="Unique Style ID")
    style_name: str = Field(..., description="Style Name")
    sample_id: str = Field(..., description="Source Sample ID")
    buyer_id: int = Field(..., description="Buyer ID")


class StyleCreationCreate(StyleCreationBase):
    pass


class StyleCreationUpdate(BaseModel):
    style_name: Optional[str] = None
    sample_id: Optional[str] = None
    buyer_id: Optional[int] = None


class StyleCreationResponse(StyleCreationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StyleBasicInfoBase(BaseModel):
    style_id: str = Field(..., description="Style ID")
    gauge: Optional[str] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None
    product_type: Optional[str] = None
    product_category: Optional[str] = None
    specific_name: Optional[str] = None


class StyleBasicInfoCreate(StyleBasicInfoBase):
    pass


class StyleBasicInfoUpdate(BaseModel):
    gauge: Optional[str] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None
    product_type: Optional[str] = None
    product_category: Optional[str] = None
    specific_name: Optional[str] = None


class StyleBasicInfoResponse(StyleBasicInfoBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StyleMaterialLinkBase(BaseModel):
    style_material_id: str = Field(..., description="Unique Style Material ID")
    style_id: str = Field(..., description="Style ID")
    material_type: str = Field(..., description="Material Type (YARN, FABRIC, etc.)")
    material_id: str = Field(..., description="Material ID")
    required_quantity: Optional[float] = None
    uom: Optional[str] = None
    price_per_unit: Optional[float] = None
    amount: Optional[float] = None
    amendment_no: Optional[str] = None


class StyleMaterialLinkCreate(StyleMaterialLinkBase):
    pass


class StyleMaterialLinkUpdate(BaseModel):
    material_type: Optional[str] = None
    material_id: Optional[str] = None
    required_quantity: Optional[float] = None
    uom: Optional[str] = None
    price_per_unit: Optional[float] = None
    amount: Optional[float] = None
    amendment_no: Optional[str] = None


class StyleMaterialLinkResponse(StyleMaterialLinkBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StyleColorBase(BaseModel):
    style_id: str = Field(..., description="Style ID")
    color_id: str = Field(..., description="Color ID")
    color_code_type: Optional[str] = None
    color_code: Optional[str] = None
    color_name: str = Field(..., description="Color Name")


class StyleColorCreate(StyleColorBase):
    pass


class StyleColorUpdate(BaseModel):
    color_code_type: Optional[str] = None
    color_code: Optional[str] = None
    color_name: Optional[str] = None


class StyleColorResponse(StyleColorBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StyleSizeBase(BaseModel):
    style_id: str = Field(..., description="Style ID")
    size_id: str = Field(..., description="Size ID")
    size_name: str = Field(..., description="Size Name")


class StyleSizeCreate(StyleSizeBase):
    pass


class StyleSizeUpdate(BaseModel):
    size_name: Optional[str] = None


class StyleSizeResponse(StyleSizeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StyleVariantBase(BaseModel):
    style_variant_id: str = Field(..., description="Unique Style Variant ID")
    style_id: str = Field(..., description="Style ID")
    color_id: str = Field(..., description="Color ID")
    size_id: str = Field(..., description="Size ID")
    color_name: Optional[str] = None
    size_name: Optional[str] = None
    variant_name: Optional[str] = None
    is_active: bool = Field(default=True, description="Is Active")


class StyleVariantCreate(StyleVariantBase):
    pass


class StyleVariantUpdate(BaseModel):
    variant_name: Optional[str] = None
    is_active: Optional[bool] = None


class StyleVariantResponse(StyleVariantBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Special schema for auto-generating variants
class StyleVariantAutoGenerate(BaseModel):
    style_id: str = Field(..., description="Style ID to generate variants for")


# ============================================================================
# CM CALCULATION SCHEMAS
# ============================================================================

class CMCalculationBase(BaseModel):
    cm_id: str = Field(..., description="Unique CM ID")
    style_id: str = Field(..., description="Style ID")
    style_material_id: Optional[str] = None
    total_material_cost: Optional[float] = None
    average_knitting_minute: Optional[float] = None
    per_minute_value: Optional[float] = None
    production_cost: Optional[float] = None
    overhead_cost: Optional[float] = None
    testing_cost: Optional[float] = None
    commercial_cost: Optional[float] = None
    total_cm: Optional[float] = None
    amendment_no: Optional[str] = None


class CMCalculationCreate(CMCalculationBase):
    pass


class CMCalculationUpdate(BaseModel):
    style_material_id: Optional[str] = None
    total_material_cost: Optional[float] = None
    average_knitting_minute: Optional[float] = None
    per_minute_value: Optional[float] = None
    production_cost: Optional[float] = None
    overhead_cost: Optional[float] = None
    testing_cost: Optional[float] = None
    commercial_cost: Optional[float] = None
    total_cm: Optional[float] = None
    amendment_no: Optional[str] = None


class CMCalculationResponse(CMCalculationBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# ORDER MANAGEMENT SCHEMAS
# ============================================================================

# --- SALES CONTRACT SCHEMAS ---
class SalesContractBase(BaseModel):
    sales_contract_id: Optional[str] = Field(None, description="Auto-generated Sales Contract ID")
    buyer_id: int = Field(..., description="Buyer ID")
    buyer_name: Optional[str] = None
    sales_contract_no: Optional[str] = Field(None, description="Sales Contract / Master LC No")
    sales_contract_date: Optional[datetime] = None
    final_amendment_date: Optional[datetime] = None
    status: str = Field(default="active", description="Status: active, completed, cancelled")
    remarks: Optional[str] = None


class SalesContractCreate(SalesContractBase):
    pass


class SalesContractUpdate(BaseModel):
    buyer_id: Optional[int] = None
    buyer_name: Optional[str] = None
    sales_contract_no: Optional[str] = None
    sales_contract_date: Optional[datetime] = None
    final_amendment_date: Optional[datetime] = None
    status: Optional[str] = None
    remarks: Optional[str] = None


class SalesContractResponse(SalesContractBase):
    id: int
    sales_contract_id: str
    total_order_quantity: int = 0
    total_order_value: float = 0.0
    no_of_po: int = 0
    earliest_delivery_date: Optional[datetime] = None
    final_delivery_date: Optional[datetime] = None
    amendment_no: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- ORDER PRIMARY INFO SCHEMAS ---
class OrderPrimaryInfoBase(BaseModel):
    order_id: Optional[str] = Field(None, description="Auto-generated Order ID")
    sales_contract_id: Optional[str] = None
    buyer_id: int = Field(..., description="Buyer ID")
    buyer_name: Optional[str] = None
    order_number: str = Field(..., description="Order Number from buyer")
    order_date: Optional[datetime] = None
    scl_po: Optional[str] = None
    season: Optional[str] = Field(None, description="Season (for H&M)")
    order_category: Optional[str] = Field(None, description="Order Category (for H&M)")
    allow_tolerance: bool = Field(default=False)
    tolerance_percent: float = Field(default=-3.0)
    status: str = Field(default="pending")
    remarks: Optional[str] = None


class OrderPrimaryInfoCreate(OrderPrimaryInfoBase):
    style_ids: Optional[List[str]] = Field(None, description="List of Style IDs to link")


class OrderPrimaryInfoUpdate(BaseModel):
    sales_contract_id: Optional[str] = None
    buyer_id: Optional[int] = None
    buyer_name: Optional[str] = None
    order_number: Optional[str] = None
    order_date: Optional[datetime] = None
    scl_po: Optional[str] = None
    season: Optional[str] = None
    order_category: Optional[str] = None
    allow_tolerance: Optional[bool] = None
    tolerance_percent: Optional[float] = None
    status: Optional[str] = None
    remarks: Optional[str] = None
    style_ids: Optional[List[str]] = Field(None, description="List of Style IDs to link")


class OrderPrimaryInfoResponse(OrderPrimaryInfoBase):
    id: int
    order_id: str
    total_quantity: int = 0
    total_value: float = 0.0
    styles: Optional[List[Dict[str, Any]]] = None  # List of linked styles
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- ORDER STYLE SCHEMAS ---
class OrderStyleBase(BaseModel):
    order_id: str = Field(..., description="Order ID")
    style_id: str = Field(..., description="Style ID")
    style_name: Optional[str] = None


class OrderStyleCreate(OrderStyleBase):
    pass


class OrderStyleResponse(OrderStyleBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- DELIVERY SCHEDULE SCHEMAS ---
class DeliveryScheduleBase(BaseModel):
    shipment_id: Optional[str] = Field(None, description="Auto-generated Shipment ID")
    order_id: str = Field(..., description="Order ID")
    order_number: Optional[str] = None
    shipment_date: Optional[datetime] = None
    destination_country: Optional[str] = None
    destination_country_code: Optional[str] = None
    destination_number: Optional[str] = None
    destination_code: Optional[str] = None
    incoterms: Optional[str] = Field(None, description="FOB, FOC, CIF, EXW, DDP, etc.")
    freight_method: Optional[str] = Field(None, description="SEA, AIR, ROAD, TRAIN")
    status: str = Field(default="scheduled")
    # PRIMARK-specific fields
    total_units: Optional[int] = None
    packs: Optional[int] = None
    price_ticket: Optional[str] = None
    remarks: Optional[str] = None


class DeliveryScheduleCreate(DeliveryScheduleBase):
    pass


class DeliveryScheduleUpdate(BaseModel):
    order_id: Optional[str] = None
    order_number: Optional[str] = None
    shipment_date: Optional[datetime] = None
    destination_country: Optional[str] = None
    destination_country_code: Optional[str] = None
    destination_number: Optional[str] = None
    destination_code: Optional[str] = None
    incoterms: Optional[str] = None
    freight_method: Optional[str] = None
    status: Optional[str] = None
    total_units: Optional[int] = None
    packs: Optional[int] = None
    price_ticket: Optional[str] = None
    remarks: Optional[str] = None


class DeliveryScheduleResponse(DeliveryScheduleBase):
    id: int
    shipment_id: str
    total_quantity: int = 0
    total_cartons: int = 0
    total_cbm: float = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- PACKING DETAIL SCHEMAS ---
class PackingDetailBase(BaseModel):
    pack_id: Optional[str] = Field(None, description="Auto-generated Pack ID")
    shipment_id: str = Field(..., description="Shipment ID")
    order_id: str = Field(..., description="Order ID")
    color_ids: Optional[List[str]] = None
    color_names: Optional[List[str]] = None
    size_ids: Optional[List[str]] = None
    size_names: Optional[List[str]] = None
    quantity_by_size: Optional[Dict[str, int]] = Field(None, description="Size-quantity mapping")
    net_weight_kg: Optional[float] = None
    gross_weight_kg: Optional[float] = None
    length_cm: Optional[float] = None
    width_cm: Optional[float] = None
    height_cm: Optional[float] = None
    max_weight_per_carton: Optional[float] = None
    carton_quantity: int = Field(default=1)
    remarks: Optional[str] = None


class PackingDetailCreate(PackingDetailBase):
    pass


class PackingDetailUpdate(BaseModel):
    color_ids: Optional[List[str]] = None
    color_names: Optional[List[str]] = None
    size_ids: Optional[List[str]] = None
    size_names: Optional[List[str]] = None
    quantity_by_size: Optional[Dict[str, int]] = None
    net_weight_kg: Optional[float] = None
    gross_weight_kg: Optional[float] = None
    length_cm: Optional[float] = None
    width_cm: Optional[float] = None
    height_cm: Optional[float] = None
    max_weight_per_carton: Optional[float] = None
    carton_quantity: Optional[int] = None
    remarks: Optional[str] = None


class PackingDetailResponse(PackingDetailBase):
    id: int
    pack_id: str
    total_pcs: int = 0
    cbm: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- ORDER BREAKDOWN SCHEMAS ---
class OrderBreakdownBase(BaseModel):
    breakdown_id: Optional[str] = Field(None, description="Auto-generated Breakdown ID")
    shipment_id: str = Field(..., description="Shipment ID")
    order_id: str = Field(..., description="Order ID")
    order_number: Optional[str] = None
    style_variant_id: str = Field(..., description="Style Variant ID")
    style_id: Optional[str] = None
    color_name: Optional[str] = None
    size_name: Optional[str] = None
    order_quantity: int = Field(default=0)
    tolerance_quantity: int = Field(default=0)
    unit_price: Optional[float] = None
    status: str = Field(default="pending")
    remarks: Optional[str] = None


class OrderBreakdownCreate(OrderBreakdownBase):
    pass


class OrderBreakdownUpdate(BaseModel):
    order_quantity: Optional[int] = None
    tolerance_quantity: Optional[int] = None
    shipped_quantity: Optional[int] = None
    unit_price: Optional[float] = None
    status: Optional[str] = None
    remarks: Optional[str] = None


class OrderBreakdownResponse(OrderBreakdownBase):
    id: int
    breakdown_id: str
    shipped_quantity: int = 0
    total_value: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- BULK OPERATIONS ---
class OrderBreakdownBulkCreate(BaseModel):
    """Auto-generate breakdowns from shipment and order styles"""
    shipment_id: str = Field(..., description="Shipment ID")
    order_id: str = Field(..., description="Order ID")

