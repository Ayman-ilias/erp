"""
Unit Conversion System Schemas

Pydantic schemas for API request/response validation.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum


class UnitTypeEnum(str, Enum):
    """Unit type classification"""
    SI = "SI"
    INTERNATIONAL = "International"
    DESI = "Desi"
    ENGLISH = "English"
    CGS = "CGS"
    OTHER = "Other"


# =============================================================================
# UNIT CATEGORY SCHEMAS
# =============================================================================

class UnitCategoryBase(BaseModel):
    """Base schema for unit category"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    base_unit_name: str = Field(..., min_length=1, max_length=100)
    base_unit_symbol: str = Field(..., min_length=1, max_length=20)
    icon: Optional[str] = Field(None, max_length=50)
    industry_use: Optional[str] = Field(None, max_length=500)
    sort_order: int = Field(default=0)
    is_active: bool = Field(default=True)


class UnitCategoryCreate(UnitCategoryBase):
    """Schema for creating a unit category"""
    pass


class UnitCategoryUpdate(BaseModel):
    """Schema for updating a unit category"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    base_unit_name: Optional[str] = Field(None, min_length=1, max_length=100)
    base_unit_symbol: Optional[str] = Field(None, min_length=1, max_length=20)
    icon: Optional[str] = Field(None, max_length=50)
    industry_use: Optional[str] = Field(None, max_length=500)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class UnitCategoryResponse(UnitCategoryBase):
    """Schema for unit category response"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UnitCategoryWithCount(UnitCategoryResponse):
    """Schema for unit category with unit count"""
    unit_count: int = 0
    base_unit: Optional[str] = None  # Base unit symbol from the category


class UnitCategoryWithUnits(UnitCategoryResponse):
    """Schema for unit category with all units"""
    units: List["UnitResponse"] = []


# =============================================================================
# UNIT SCHEMAS
# =============================================================================

class UnitBase(BaseModel):
    """Base schema for unit"""
    category_id: int
    name: str = Field(..., min_length=1, max_length=100)
    symbol: str = Field(..., min_length=1, max_length=30)
    description: Optional[str] = None
    unit_type: UnitTypeEnum = Field(default=UnitTypeEnum.SI)
    region: Optional[str] = Field(None, max_length=100)
    to_base_factor: Decimal = Field(default=Decimal("1"))
    alternate_names: Optional[str] = Field(None, max_length=500)
    is_base: bool = Field(default=False)
    is_active: bool = Field(default=True)
    decimal_places: int = Field(default=6, ge=0, le=15)
    sort_order: int = Field(default=0)


class UnitCreate(UnitBase):
    """Schema for creating a unit"""
    pass


class UnitUpdate(BaseModel):
    """Schema for updating a unit"""
    category_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    symbol: Optional[str] = Field(None, min_length=1, max_length=30)
    description: Optional[str] = None
    unit_type: Optional[UnitTypeEnum] = None
    region: Optional[str] = Field(None, max_length=100)
    to_base_factor: Optional[Decimal] = None
    alternate_names: Optional[str] = Field(None, max_length=500)
    is_base: Optional[bool] = None
    is_active: Optional[bool] = None
    decimal_places: Optional[int] = Field(None, ge=0, le=15)
    sort_order: Optional[int] = None


class UnitResponse(BaseModel):
    """Schema for unit response"""
    id: int
    category_id: int
    name: str
    symbol: str
    description: Optional[str] = None
    unit_type: UnitTypeEnum
    region: Optional[str] = None
    to_base_factor: Decimal
    alternate_names: Optional[str] = None
    is_base: bool
    is_active: bool
    decimal_places: int
    sort_order: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UnitWithCategory(UnitResponse):
    """Schema for unit with category info"""
    category_name: str
    base_unit_symbol: str


class UnitForSelector(BaseModel):
    """Optimized schema for dropdown selectors"""
    id: int
    name: str
    symbol: str
    display_name: str  # "Kilogram (kg)"
    category_id: int
    category_name: str
    is_base: bool
    unit_type: UnitTypeEnum

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# CONVERSION SCHEMAS
# =============================================================================

class ConversionRequest(BaseModel):
    """Schema for conversion request"""
    value: Decimal = Field(..., description="Value to convert")
    from_unit_symbol: str = Field(..., description="Source unit symbol")
    to_unit_symbol: str = Field(..., description="Target unit symbol")


class ConversionResponse(BaseModel):
    """Schema for conversion response"""
    value: Decimal
    from_unit: str
    to_unit: str
    result: Decimal
    formula: str
    category: str
    base_unit: str
    conversion_factor: Decimal


class BatchConversionItem(BaseModel):
    """Single item in batch conversion"""
    value: Decimal
    from_unit: str  # symbol
    to_unit: str  # symbol


class BatchConversionRequest(BaseModel):
    """Schema for batch conversion request"""
    conversions: List[BatchConversionItem]


class BatchConversionResponse(BaseModel):
    """Schema for batch conversion response"""
    results: List[dict]


# =============================================================================
# VALIDATION SCHEMAS
# =============================================================================

class SymbolValidationRequest(BaseModel):
    """Schema for symbol validation request"""
    symbol: str
    category_id: int
    exclude_id: Optional[int] = None  # Exclude this unit ID (for updates)


class SymbolValidationResponse(BaseModel):
    """Schema for symbol validation response"""
    is_valid: bool
    message: Optional[str] = None


# =============================================================================
# ALIAS SCHEMAS
# =============================================================================

class UnitAliasBase(BaseModel):
    """Base schema for unit alias"""
    unit_id: int
    alias_name: str = Field(..., min_length=1, max_length=100)
    alias_symbol: Optional[str] = Field(None, max_length=30)
    region: Optional[str] = Field(None, max_length=100)
    is_preferred: bool = Field(default=False)


class UnitAliasCreate(UnitAliasBase):
    """Schema for creating a unit alias"""
    pass


class UnitAliasResponse(UnitAliasBase):
    """Schema for unit alias response"""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# AUDIT SCHEMAS
# =============================================================================

class UnitChangeAuditResponse(BaseModel):
    """Schema for unit change audit response"""
    id: int
    table_name: str
    record_id: int
    field_name: str
    old_unit_id: Optional[int] = None
    new_unit_id: Optional[int] = None
    changed_by: Optional[str] = None
    changed_at: datetime
    change_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UnitChangeAuditWithDetails(UnitChangeAuditResponse):
    """Schema for unit change audit with unit details"""
    old_unit: Optional[dict] = None  # Unit details for old_unit_id
    new_unit: Optional[dict] = None  # Unit details for new_unit_id


class AuditLogFilters(BaseModel):
    """Schema for audit log filtering parameters"""
    table_name: Optional[str] = Field(None, description="Filter by table name")
    record_id: Optional[int] = Field(None, description="Filter by record ID")
    field_name: Optional[str] = Field(None, description="Filter by field name")
    changed_by: Optional[str] = Field(None, description="Filter by who made the change")
    start_date: Optional[datetime] = Field(None, description="Filter by start date")
    end_date: Optional[datetime] = Field(None, description="Filter by end date")


class AuditLogResponse(BaseModel):
    """Schema for paginated audit log response"""
    logs: List[UnitChangeAuditWithDetails]
    total_count: int
    page: int
    page_size: int
    total_pages: int


class AuditSummaryResponse(BaseModel):
    """Schema for audit summary statistics"""
    total_changes: int
    table_counts: dict
    reason_counts: dict
    filters: dict


# Update forward references
UnitCategoryWithUnits.model_rebuild()
