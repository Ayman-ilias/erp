"""Samples module - Samples, Styles, Style Variants, Operations management"""
from .routes.samples import router as samples_router
from .routes.colors import router as colors_router
from .routes.size_charts import router as size_charts_router
from .models.sample import (
    # Style models
    StyleSummary, StyleVariant, VariantColorPart,
    # Master data
    SampleMachine, ManufacturingOperation,
    GarmentColor, GarmentSize,
    # Sample core
    SampleRequest, SamplePlan, SampleRequiredMaterial,
    SampleOperation, SampleTNA, SampleStatus,
    # Style variant materials & SMV
    StyleVariantMaterial, SMVCalculation,
    # Legacy (deprecated)
    Sample, OperationType, RequiredMaterial
)

__all__ = [
    "samples_router", "colors_router", "size_charts_router",
    # Style models
    "StyleSummary", "StyleVariant", "VariantColorPart",
    # Master data
    "SampleMachine", "ManufacturingOperation",
    "GarmentColor", "GarmentSize",
    # Sample core
    "SampleRequest", "SamplePlan", "SampleRequiredMaterial",
    "SampleOperation", "SampleTNA", "SampleStatus",
    # Style variant materials & SMV
    "StyleVariantMaterial", "SMVCalculation",
    # Legacy (deprecated)
    "Sample", "OperationType", "RequiredMaterial"
]
