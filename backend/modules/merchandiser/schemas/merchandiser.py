"""
Merchandiser Department Schemas
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============================================================================
# MATERIAL DETAILS SCHEMAS
# ============================================================================

# --- YARN SCHEMAS ---
class YarnDetailBase(BaseModel):
    yarn_id: str = Field(..., description="Unique Yarn ID")
    yarn_name: str = Field(..., description="Yarn Name")
    yarn_composition: Optional[str] = None
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


class YarnDetailCreate(YarnDetailBase):
    pass


class YarnDetailUpdate(BaseModel):
    yarn_name: Optional[str] = None
    yarn_composition: Optional[str] = None
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


class YarnDetailResponse(YarnDetailBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- FABRIC SCHEMAS ---
class FabricDetailBase(BaseModel):
    fabric_id: str = Field(..., description="Unique Fabric ID")
    fabric_name: str = Field(..., description="Fabric Name")
    category: Optional[str] = None
    type: Optional[str] = None
    construction: Optional[str] = None
    weave_knit: Optional[str] = None
    gsm: Optional[int] = None
    gauge_epi: Optional[str] = None
    width: Optional[str] = None
    stretch: Optional[str] = None
    shrink: Optional[str] = None
    finish: Optional[str] = None
    composition: Optional[str] = None
    handfeel: Optional[str] = None
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
    stretch: Optional[str] = None
    shrink: Optional[str] = None
    finish: Optional[str] = None
    composition: Optional[str] = None
    handfeel: Optional[str] = None
    uom: Optional[str] = None
    remarks: Optional[str] = None


class FabricDetailResponse(FabricDetailBase):
    id: int
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
    uom: str = Field(default="piece", description="Unit of Measure")
    consumable_flag: bool = Field(default=True, description="Is Consumable")
    remarks: Optional[str] = None


class TrimsDetailCreate(TrimsDetailBase):
    pass


class TrimsDetailUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
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
    uom: str = Field(default="piece", description="Unit of Measure")
    consumable_flag: bool = Field(default=True, description="Is Consumable")
    remarks: Optional[str] = None


class AccessoriesDetailCreate(AccessoriesDetailBase):
    pass


class AccessoriesDetailUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    uom: Optional[str] = None
    consumable_flag: Optional[bool] = None
    remarks: Optional[str] = None


class AccessoriesDetailResponse(AccessoriesDetailBase):
    id: int
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
    uom: str = Field(default="piece", description="Unit of Measure")
    consumable_flag: bool = Field(default=True, description="Is Consumable")
    remarks: Optional[str] = None


class FinishedGoodDetailCreate(FinishedGoodDetailBase):
    pass


class FinishedGoodDetailUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
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
    uom: str = Field(default="piece", description="Unit of Measure")
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
    # Multiple additional instructions with done status: [{instruction: str, done: bool}, ...]
    additional_instruction: Optional[List[Dict[str, Any]]] = Field(default=None, description="Multiple Additional Instructions with status")
    # Multiple techpack files: [{url: str, filename: str, type: str}, ...]
    techpack_files: Optional[List[Dict[str, Any]]] = Field(default=None, description="Multiple Techpack Files with type")


class SamplePrimaryInfoResponse(SamplePrimaryInfoBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

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

