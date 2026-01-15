from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime


# =============================================================================
# STYLE SUMMARY SCHEMAS
# =============================================================================

class StyleSummaryBase(BaseModel):
    buyer_id: int
    style_name: str
    style_id: str
    product_category: Optional[str] = None
    product_type: Optional[str] = None
    customs_customer_group: Optional[str] = None
    type_of_construction: Optional[str] = None
    gauge: Optional[str] = None
    style_description: Optional[str] = None
    is_set: bool = False
    set_piece_count: Optional[int] = None


class StyleSummaryCreate(StyleSummaryBase):
    pass


class StyleSummaryUpdate(BaseModel):
    buyer_id: Optional[int] = None
    style_name: Optional[str] = None
    style_id: Optional[str] = None
    product_category: Optional[str] = None
    product_type: Optional[str] = None
    customs_customer_group: Optional[str] = None
    type_of_construction: Optional[str] = None
    gauge: Optional[str] = None
    style_description: Optional[str] = None
    is_set: Optional[bool] = None
    set_piece_count: Optional[int] = None


class StyleSummaryResponse(StyleSummaryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# VARIANT COLOR PART SCHEMAS (Multi-Color Support)
# =============================================================================

class VariantColorPartBase(BaseModel):
    part_name: str
    colour_name: str
    colour_code: Optional[str] = None
    colour_ref: Optional[str] = None
    sort_order: int = 0


class VariantColorPartCreate(VariantColorPartBase):
    style_variant_id: int


class VariantColorPartResponse(VariantColorPartBase):
    id: int
    style_variant_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# =============================================================================
# STYLE VARIANT SCHEMAS
# =============================================================================

class StyleVariantBase(BaseModel):
    style_summary_id: int
    style_name: str
    style_id: str
    colour_name: str
    colour_code: Optional[str] = None
    colour_ref: Optional[str] = None
    is_multicolor: bool = False
    display_name: Optional[str] = None
    piece_name: Optional[str] = None
    sizes: Optional[List[str]] = None


class StyleVariantCreate(StyleVariantBase):
    color_parts: Optional[List[VariantColorPartBase]] = None


class StyleVariantUpdate(BaseModel):
    style_summary_id: Optional[int] = None
    style_name: Optional[str] = None
    style_id: Optional[str] = None
    colour_name: Optional[str] = None
    colour_code: Optional[str] = None
    colour_ref: Optional[str] = None
    is_multicolor: Optional[bool] = None
    display_name: Optional[str] = None
    piece_name: Optional[str] = None
    sizes: Optional[List[str]] = None
    color_parts: Optional[List[VariantColorPartBase]] = None


class StyleVariantResponse(StyleVariantBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    style_category: Optional[str] = None
    gauge: Optional[str] = None
    color_parts: Optional[List[VariantColorPartResponse]] = []
    full_color_description: Optional[str] = None

    class Config:
        from_attributes = True


# =============================================================================
# SAMPLE MACHINE SCHEMAS (Master Data)
# =============================================================================

class SampleMachineBase(BaseModel):
    machine_code: str
    machine_name: str
    machine_type: Optional[str] = None
    gauge_capability: Optional[str] = None
    brand: Optional[str] = None
    location: Optional[str] = None
    is_active: bool = True


class SampleMachineCreate(SampleMachineBase):
    pass


class SampleMachineUpdate(BaseModel):
    machine_code: Optional[str] = None
    machine_name: Optional[str] = None
    machine_type: Optional[str] = None
    gauge_capability: Optional[str] = None
    brand: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None


class SampleMachineResponse(SampleMachineBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# MANUFACTURING OPERATION SCHEMAS (Master Data)
# =============================================================================

class ManufacturingOperationBase(BaseModel):
    operation_id: str
    operation_type: Optional[str] = None  # Made optional per user request
    operation_name: str
    standard_duration: Optional[float] = None
    is_active: bool = True


class ManufacturingOperationCreate(ManufacturingOperationBase):
    pass


class ManufacturingOperationUpdate(BaseModel):
    operation_id: Optional[str] = None
    operation_type: Optional[str] = None
    operation_name: Optional[str] = None
    standard_duration: Optional[float] = None
    is_active: Optional[bool] = None


class ManufacturingOperationResponse(ManufacturingOperationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# SAMPLE REQUIRED MATERIAL SCHEMAS
# =============================================================================

class SampleRequiredMaterialBase(BaseModel):
    product_category: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    required_quantity: float
    uom: str
    remarks: Optional[str] = None


class SampleRequiredMaterialCreate(SampleRequiredMaterialBase):
    sample_request_id: int


class SampleRequiredMaterialUpdate(BaseModel):
    product_category: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    required_quantity: Optional[float] = None
    uom: Optional[str] = None
    remarks: Optional[str] = None


class SampleRequiredMaterialResponse(SampleRequiredMaterialBase):
    id: int
    sample_request_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# SAMPLE OPERATION SCHEMAS (Link operations to samples)
# =============================================================================

class SampleOperationBase(BaseModel):
    operation_master_id: int
    operation_type: Optional[str] = None
    operation_name: Optional[str] = None
    sequence_order: int = 1


class SampleOperationCreate(SampleOperationBase):
    sample_request_id: int


class SampleOperationUpdate(BaseModel):
    operation_master_id: Optional[int] = None
    operation_type: Optional[str] = None
    operation_name: Optional[str] = None
    sequence_order: Optional[int] = None


class SampleOperationResponse(SampleOperationBase):
    id: int
    sample_request_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# SAMPLE TNA SCHEMAS (Operation-based Time & Action)
# =============================================================================

class SampleTNABase(BaseModel):
    operation_sequence: int
    operation_name: str
    responsible_person: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    actual_start_datetime: Optional[datetime] = None
    actual_end_datetime: Optional[datetime] = None
    status: str = "Pending"
    remark: Optional[str] = None


class SampleTNACreate(SampleTNABase):
    sample_request_id: int


class SampleTNAUpdate(BaseModel):
    operation_sequence: Optional[int] = None
    operation_name: Optional[str] = None
    responsible_person: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    actual_start_datetime: Optional[datetime] = None
    actual_end_datetime: Optional[datetime] = None
    status: Optional[str] = None
    remark: Optional[str] = None


class SampleTNAResponse(SampleTNABase):
    id: int
    sample_request_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# SAMPLE STATUS SCHEMAS
# =============================================================================

class SampleStatusBase(BaseModel):
    status_by_sample: Optional[str] = None
    status_from_merchandiser: Optional[str] = None
    notes: Optional[str] = None
    updated_by: Optional[str] = None
    expecting_end_date: Optional[datetime] = None


class SampleStatusCreate(SampleStatusBase):
    sample_request_id: int


class SampleStatusUpdate(BaseModel):
    status_by_sample: Optional[str] = None
    status_from_merchandiser: Optional[str] = None
    notes: Optional[str] = None
    updated_by: Optional[str] = None
    expecting_end_date: Optional[datetime] = None


class SampleStatusResponse(SampleStatusBase):
    id: int
    sample_request_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# SAMPLE PLAN SCHEMAS
# =============================================================================

class SamplePlanBase(BaseModel):
    assigned_designer: Optional[str] = None
    assigned_programmer: Optional[str] = None
    assigned_supervisor_knitting: Optional[str] = None
    assigned_supervisor_finishing: Optional[str] = None
    required_knitting_machine_id: Optional[int] = None
    delivery_plan_date: Optional[datetime] = None


class SamplePlanCreate(SamplePlanBase):
    sample_request_id: int


class SamplePlanUpdate(BaseModel):
    assigned_designer: Optional[str] = None
    assigned_programmer: Optional[str] = None
    assigned_supervisor_knitting: Optional[str] = None
    assigned_supervisor_finishing: Optional[str] = None
    required_knitting_machine_id: Optional[int] = None
    delivery_plan_date: Optional[datetime] = None


class SamplePlanResponse(SamplePlanBase):
    id: int
    sample_request_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    machine: Optional[SampleMachineResponse] = None

    class Config:
        from_attributes = True


# =============================================================================
# SAMPLE REQUEST SCHEMAS (Primary Info)
# =============================================================================

class SampleRequestBase(BaseModel):
    buyer_id: int
    buyer_name: Optional[str] = None
    sample_name: str
    style_id: Optional[int] = None

    # Technical specs
    gauge: Optional[str] = None
    ply: Optional[int] = None
    item: Optional[str] = None

    # Material references
    yarn_id: Optional[str] = None
    yarn_details: Optional[Any] = None  # JSON
    trims_ids: Optional[List[str]] = None  # JSON array
    trims_details: Optional[Any] = None  # JSON
    decorative_part: Optional[str] = None
    decorative_details: Optional[str] = None

    # Dates
    yarn_handover_date: Optional[datetime] = None
    trims_handover_date: Optional[datetime] = None
    required_date: Optional[datetime] = None

    # Sample details
    request_pcs: Optional[int] = None
    sample_category: Optional[str] = None
    color_name: Optional[str] = None
    size_name: Optional[str] = None
    additional_instruction: Optional[str] = None

    # Attachments
    techpack_url: Optional[str] = None
    techpack_filename: Optional[str] = None

    # Status
    round: int = 1
    current_status: str = "Pending"


class SampleRequestCreate(SampleRequestBase):
    sample_id: Optional[str] = None  # Can be auto-generated


class SampleRequestUpdate(BaseModel):
    buyer_id: Optional[int] = None
    buyer_name: Optional[str] = None
    sample_name: Optional[str] = None
    style_id: Optional[int] = None
    gauge: Optional[str] = None
    ply: Optional[int] = None
    item: Optional[str] = None
    yarn_id: Optional[str] = None
    yarn_details: Optional[Any] = None
    trims_ids: Optional[List[str]] = None
    trims_details: Optional[Any] = None
    decorative_part: Optional[str] = None
    decorative_details: Optional[str] = None
    yarn_handover_date: Optional[datetime] = None
    trims_handover_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    request_pcs: Optional[int] = None
    sample_category: Optional[str] = None
    color_name: Optional[str] = None
    size_name: Optional[str] = None
    additional_instruction: Optional[str] = None
    techpack_url: Optional[str] = None
    techpack_filename: Optional[str] = None
    round: Optional[int] = None
    current_status: Optional[str] = None


class SampleRequestResponse(SampleRequestBase):
    id: int
    sample_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    style_name: Optional[str] = None

    # Nested relationships
    plan: Optional[SamplePlanResponse] = None
    required_materials: Optional[List[SampleRequiredMaterialResponse]] = []
    operations: Optional[List[SampleOperationResponse]] = []
    tna_items: Optional[List[SampleTNAResponse]] = []
    status_history: Optional[List[SampleStatusResponse]] = []
    
    # Workflow information (Requirements 10.2, 10.3)
    workflow_status: Optional[dict] = None

    class Config:
        from_attributes = True


# =============================================================================
# STYLE VARIANT MATERIAL SCHEMAS
# =============================================================================

class StyleVariantMaterialBase(BaseModel):
    style_material_id: Optional[str] = None
    product_category: Optional[str] = None
    sub_category: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    required_quantity: Optional[float] = None
    uom: Optional[str] = None
    weight: Optional[float] = None
    weight_uom: str = "kg"
    condition: Optional[str] = None


class StyleVariantMaterialCreate(StyleVariantMaterialBase):
    style_variant_id: int


class StyleVariantMaterialUpdate(BaseModel):
    style_material_id: Optional[str] = None
    product_category: Optional[str] = None
    sub_category: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    required_quantity: Optional[float] = None
    uom: Optional[str] = None
    weight: Optional[float] = None
    weight_uom: Optional[str] = None
    condition: Optional[str] = None


class StyleVariantMaterialResponse(StyleVariantMaterialBase):
    id: int
    style_variant_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# SMV CALCULATION SCHEMAS (Per Style Variant)
# =============================================================================

class SMVCalculationBase(BaseModel):
    operation_id: Optional[int] = None
    operation_type: Optional[str] = None
    operation_name: Optional[str] = None
    number_of_operations: int = 1
    duration_hms: Optional[str] = None  # "HH:MM:SS" format
    total_duration_minutes: Optional[float] = None

    @field_validator('duration_hms')
    @classmethod
    def validate_duration_format(cls, v):
        if v is None:
            return v
        parts = v.split(':')
        if len(parts) != 3:
            raise ValueError('Duration must be in HH:MM:SS format')
        try:
            hours, minutes, seconds = map(int, parts)
            if minutes >= 60 or seconds >= 60:
                raise ValueError('Invalid time values')
        except ValueError as e:
            raise ValueError('Duration must be in HH:MM:SS format with valid numbers')
        return v


class SMVCalculationCreate(SMVCalculationBase):
    style_variant_id: int


class SMVCalculationUpdate(BaseModel):
    operation_id: Optional[int] = None
    operation_type: Optional[str] = None
    operation_name: Optional[str] = None
    number_of_operations: Optional[int] = None
    duration_hms: Optional[str] = None
    total_duration_minutes: Optional[float] = None


class SMVCalculationResponse(SMVCalculationBase):
    id: int
    style_variant_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    operation: Optional[ManufacturingOperationResponse] = None

    class Config:
        from_attributes = True


# =============================================================================
# GARMENT COLOR SCHEMAS
# =============================================================================

class GarmentColorBase(BaseModel):
    color_name: str
    color_code: str
    color_ref: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True


class GarmentColorCreate(GarmentColorBase):
    pass


class GarmentColorUpdate(BaseModel):
    color_name: Optional[str] = None
    color_code: Optional[str] = None
    color_ref: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None


class GarmentColorResponse(GarmentColorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# GARMENT SIZE SCHEMAS
# =============================================================================

class GarmentSizeBase(BaseModel):
    size_value: str
    size_label: Optional[str] = None
    size_category: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class GarmentSizeCreate(GarmentSizeBase):
    pass


class GarmentSizeUpdate(BaseModel):
    size_value: Optional[str] = None
    size_label: Optional[str] = None
    size_category: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class GarmentSizeResponse(GarmentSizeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =============================================================================
# LEGACY SCHEMAS (Deprecated - kept for backward compatibility)
# =============================================================================

class SampleBase(BaseModel):
    """DEPRECATED: Use SampleRequestBase instead"""
    sample_id: str
    buyer_id: int
    style_id: int
    sample_type: str
    sample_description: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    worksheet_rcv_date: Optional[datetime] = None
    yarn_rcv_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    color: Optional[str] = None
    assigned_designer: Optional[str] = None
    required_sample_quantity: Optional[int] = None
    round: int = 1
    notes: Optional[str] = None
    submit_status: Optional[str] = None


class SampleCreate(SampleBase):
    pass


class SampleUpdate(BaseModel):
    sample_type: Optional[str] = None
    sample_description: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    yarn_rcv_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    color: Optional[str] = None
    assigned_designer: Optional[str] = None
    required_sample_quantity: Optional[int] = None
    notes: Optional[str] = None
    submit_status: Optional[str] = None


class SampleResponse(SampleBase):
    id: int
    created_at: datetime
    buyer_name: Optional[str] = None
    style_name: Optional[str] = None

    class Config:
        from_attributes = True


class OperationTypeBase(BaseModel):
    """DEPRECATED: Use ManufacturingOperationBase instead"""
    operation_type: str
    operation_name: str


class OperationTypeCreate(OperationTypeBase):
    pass


class OperationTypeResponse(OperationTypeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RequiredMaterialBase(BaseModel):
    """DEPRECATED: Use StyleVariantMaterialBase or SampleRequiredMaterialBase instead"""
    style_variant_id: int
    style_name: str
    style_id: str
    material: str
    uom: str
    consumption_per_piece: float
    converted_uom: Optional[str] = None
    converted_consumption: Optional[float] = None
    remarks: Optional[str] = None


class RequiredMaterialCreate(RequiredMaterialBase):
    pass


class RequiredMaterialUpdate(BaseModel):
    style_variant_id: Optional[int] = None
    style_name: Optional[str] = None
    style_id: Optional[str] = None
    material: Optional[str] = None
    uom: Optional[str] = None
    consumption_per_piece: Optional[float] = None
    converted_uom: Optional[str] = None
    converted_consumption: Optional[float] = None
    remarks: Optional[str] = None


class RequiredMaterialResponse(RequiredMaterialBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Legacy TNA schemas (deprecated)
class LegacySampleTNABase(BaseModel):
    """DEPRECATED: Use SampleTNABase instead"""
    sample_id: str
    buyer_name: str
    style_name: str
    sample_type: str
    sample_description: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    worksheet_rcv_date: Optional[str] = None
    yarn_rcv_date: Optional[str] = None
    required_date: Optional[str] = None
    color: Optional[str] = None
    piece_name: Optional[str] = None
    notes: Optional[str] = None


class LegacySampleTNACreate(LegacySampleTNABase):
    pass


class LegacySampleTNAResponse(LegacySampleTNABase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Legacy Plan schemas (deprecated)
class LegacySamplePlanBase(BaseModel):
    """DEPRECATED: Use SamplePlanBase instead"""
    sample_id: str
    buyer_name: str
    style_name: str
    sample_type: str
    sample_description: Optional[str] = None
    item: Optional[str] = None
    gauge: Optional[str] = None
    worksheet_rcv_date: Optional[str] = None
    yarn_rcv_date: Optional[str] = None
    required_date: Optional[str] = None
    color: Optional[str] = None
    piece_name: Optional[str] = None
    assigned_designer: Optional[str] = None
    required_sample_quantity: Optional[int] = None
    round: int = 1
    notes: Optional[str] = None
    submit_status: Optional[str] = None


class LegacySamplePlanCreate(LegacySamplePlanBase):
    pass


class LegacySamplePlanResponse(LegacySamplePlanBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Legacy SMV schemas (deprecated)
class LegacySMVCalculationBase(BaseModel):
    """DEPRECATED: Use SMVCalculationBase instead"""
    sample_id: str
    buyer_name: str
    style_name: str
    category: Optional[str] = None
    gauge: Optional[str] = None
    total_smv: float
    operations: Optional[str] = None


class LegacySMVCalculationCreate(LegacySMVCalculationBase):
    pass


class LegacySMVCalculationResponse(LegacySMVCalculationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Legacy Operation schemas (deprecated)
class SampleOperationLegacyBase(BaseModel):
    """DEPRECATED: Use SampleOperationBase instead"""
    sample_id: int
    operation_type: str
    name_of_operation: str
    number_of_operation: int = 1
    size: Optional[str] = None
    duration: Optional[float] = None
    total_duration: Optional[float] = None


class SampleOperationLegacyCreate(SampleOperationLegacyBase):
    pass


class SampleOperationLegacyResponse(SampleOperationLegacyBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
