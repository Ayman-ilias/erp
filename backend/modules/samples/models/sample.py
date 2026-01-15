from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import BaseSamples as Base


# =============================================================================
# STYLE MODELS (Keep existing structure - fundamental to system)
# =============================================================================

class StyleSummary(Base):
    """Style master - defines the base style information"""
    __tablename__ = "style_summaries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    buyer_id = Column(Integer, nullable=False, index=True)  # No FK - clients DB
    style_name = Column(String, nullable=False, index=True)
    style_id = Column(String, unique=True, nullable=False, index=True)
    product_category = Column(String, nullable=True)
    product_type = Column(String, nullable=True)
    customs_customer_group = Column(String, nullable=True)
    type_of_construction = Column(String, nullable=True)
    gauge = Column(String, nullable=True)
    style_description = Column(Text, nullable=True)
    is_set = Column(Boolean, default=False)
    set_piece_count = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    variants = relationship("StyleVariant", back_populates="style", cascade="all, delete-orphan")
    samples = relationship("SampleRequest", back_populates="style")


class StyleVariant(Base):
    """Style variant - color and size combinations for a style"""
    __tablename__ = "style_variants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_summary_id = Column(Integer, ForeignKey("style_summaries.id"), nullable=False)
    style_name = Column(String, nullable=False)
    style_id = Column(String, nullable=False, index=True)
    colour_name = Column(String, nullable=False)
    colour_code = Column(String, nullable=True)
    colour_ref = Column(String, nullable=True)
    is_multicolor = Column(Boolean, default=False)
    display_name = Column(String, nullable=True)
    piece_name = Column(String, nullable=True)
    sizes = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    style = relationship("StyleSummary", back_populates="variants")
    color_parts = relationship("VariantColorPart", back_populates="variant", cascade="all, delete-orphan")
    variant_materials = relationship("StyleVariantMaterial", back_populates="variant", cascade="all, delete-orphan")
    smv_calculations = relationship("SMVCalculation", back_populates="variant", cascade="all, delete-orphan")

    @property
    def style_category(self):
        return self.style.product_category if self.style else None

    @property
    def gauge(self):
        return self.style.gauge if self.style else None


class VariantColorPart(Base):
    """Multi-color support for style variants"""
    __tablename__ = "style_variant_colors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_variant_id = Column(Integer, ForeignKey("style_variants.id", ondelete="CASCADE"), nullable=False)
    part_name = Column(String, nullable=False)
    colour_name = Column(String, nullable=False)
    colour_code = Column(String, nullable=True)
    colour_ref = Column(String, nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    variant = relationship("StyleVariant", back_populates="color_parts")


# =============================================================================
# SAMPLE MACHINE MASTER
# =============================================================================

class SampleMachine(Base):
    """Master data for knitting machines available for samples"""
    __tablename__ = "sample_machines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_code = Column(String, unique=True, nullable=False, index=True)
    machine_name = Column(String, nullable=False)
    machine_type = Column(String, nullable=True)  # Flat, Circular, etc.
    gauge_capability = Column(String, nullable=True)  # e.g., "7GG, 12GG, 14GG"
    brand = Column(String, nullable=True)
    location = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sample_plans = relationship("SamplePlan", back_populates="machine")


# =============================================================================
# MANUFACTURING OPERATIONS MASTER
# =============================================================================

class ManufacturingOperation(Base):
    """Master data for manufacturing operations"""
    __tablename__ = "manufacturing_operations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    operation_id = Column(String, unique=True, nullable=False, index=True)  # e.g., "OP001"
    operation_type = Column(String, nullable=True, index=True)  # Knitting, Linking, Trimming, etc. (Optional)
    operation_name = Column(String, nullable=False)  # Front Part, Back Part, etc.
    standard_duration = Column(Float, nullable=True)  # Standard duration in minutes
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sample_operations = relationship("SampleOperation", back_populates="operation")
    smv_calculations = relationship("SMVCalculation", back_populates="operation")


# =============================================================================
# SAMPLE REQUEST (Primary Info)
# =============================================================================

class SampleRequest(Base):
    """Main sample request table - contains all primary sample information"""
    __tablename__ = "sample_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_id = Column(String, unique=True, nullable=False, index=True)  # Auto-generated
    buyer_id = Column(Integer, nullable=False, index=True)  # Reference to clients DB
    buyer_name = Column(String, nullable=True)  # Denormalized for display
    sample_name = Column(String, nullable=False, index=True)
    style_id = Column(Integer, ForeignKey("style_summaries.id"), nullable=True)

    # Technical specs
    gauge = Column(String, nullable=True)
    ply = Column(Integer, nullable=True)  # NEW: Number of plies
    item = Column(String, nullable=True)

    # Material references (IDs reference Settings/Materials DB)
    yarn_id = Column(String, nullable=True)  # Reference to yarn in Settings DB
    yarn_details = Column(JSON, nullable=True)  # Cached yarn details
    trims_ids = Column(JSON, nullable=True)  # Array of trim IDs (buttons, zippers, labels)
    trims_details = Column(JSON, nullable=True)  # Cached trim details
    decorative_part = Column(String, nullable=True)  # Embroidery, Print, etc.
    decorative_details = Column(Text, nullable=True)

    # Dates
    yarn_handover_date = Column(DateTime(timezone=True), nullable=True)  # Expected yarn receive date
    trims_handover_date = Column(DateTime(timezone=True), nullable=True)  # Expected trims receive date
    required_date = Column(DateTime(timezone=True), nullable=True)

    # Sample details
    request_pcs = Column(Integer, nullable=True)  # Number of pieces requested
    sample_category = Column(String, nullable=True)  # Proto, Fit, PP, SMS, Size Set, etc.
    color_ids = Column(JSON, nullable=True)  # Array of color IDs
    color_name = Column(String, nullable=True)
    size_ids = Column(JSON, nullable=True)  # Array of size IDs
    size_name = Column(String, nullable=True)
    yarn_ids = Column(JSON, nullable=True)  # Array of yarn IDs (multiple yarns)
    additional_instruction = Column(Text, nullable=True)

    # Attachments
    techpack_url = Column(String, nullable=True)  # File URL for techpack
    techpack_filename = Column(String, nullable=True)

    # Status tracking
    round = Column(Integer, default=1)  # Increments on remake request
    current_status = Column(String, default="Pending")  # Pending, In Progress, Completed, etc.

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    style = relationship("StyleSummary", back_populates="samples")
    plan = relationship("SamplePlan", back_populates="sample", uselist=False, cascade="all, delete-orphan")
    required_materials = relationship("SampleRequiredMaterial", back_populates="sample", cascade="all, delete-orphan")
    operations = relationship("SampleOperation", back_populates="sample", cascade="all, delete-orphan")
    tna_items = relationship("SampleTNA", back_populates="sample", cascade="all, delete-orphan")
    status_history = relationship("SampleStatus", back_populates="sample", cascade="all, delete-orphan")
    
    # Workflow relationship (Requirements 10.1, 10.2)
    # Using string reference to avoid circular imports
    workflows = relationship(
        "SampleWorkflow", 
        foreign_keys="[SampleWorkflow.sample_request_id]",
        primaryjoin="SampleRequest.id == SampleWorkflow.sample_request_id",
        viewonly=True
    )

    @property
    def style_name(self):
        return self.style.style_name if self.style else None

    @property
    def current_workflow_status(self):
        """Get the current workflow status for this sample (Requirements 10.2, 10.3)"""
        if self.workflows:
            # Get the most recent workflow
            latest_workflow = max(self.workflows, key=lambda w: w.created_at)
            return {
                'workflow_id': latest_workflow.id,
                'workflow_name': latest_workflow.workflow_name,
                'status': latest_workflow.workflow_status,
                'progress': self._calculate_workflow_progress(latest_workflow),
                'current_stage': self._get_current_stage(latest_workflow)
            }
        return None

    def _calculate_workflow_progress(self, workflow):
        """Calculate workflow progress percentage"""
        if not workflow.cards:
            return 0
        completed_cards = sum(1 for card in workflow.cards if card.card_status == 'completed')
        return int((completed_cards / len(workflow.cards)) * 100)

    def _get_current_stage(self, workflow):
        """Get the current active stage"""
        if not workflow.cards:
            return None
        
        # Find the first non-completed card
        for card in sorted(workflow.cards, key=lambda c: c.stage_order):
            if card.card_status != 'completed':
                return {
                    'stage_name': card.stage_name,
                    'status': card.card_status,
                    'assigned_to': card.assigned_to
                }
        
        # All cards completed
        return {
            'stage_name': 'Completed',
            'status': 'completed',
            'assigned_to': None
        }


# =============================================================================
# SAMPLE PLAN
# =============================================================================

class SamplePlan(Base):
    """Sample planning - assignments and scheduling"""
    __tablename__ = "sample_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_request_id = Column(Integer, ForeignKey("sample_requests.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Assignments
    assigned_designer = Column(String, nullable=True)
    assigned_programmer = Column(String, nullable=True)  # NEW
    assigned_supervisor_knitting = Column(String, nullable=True)  # NEW
    assigned_supervisor_finishing = Column(String, nullable=True)  # NEW

    # Machine assignment
    required_knitting_machine_id = Column(Integer, ForeignKey("sample_machines.id"), nullable=True)  # NEW

    # Dates
    delivery_plan_date = Column(DateTime(timezone=True), nullable=True)  # NEW

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sample = relationship("SampleRequest", back_populates="plan")
    machine = relationship("SampleMachine", back_populates="sample_plans")


# =============================================================================
# SAMPLE REQUIRED MATERIAL
# =============================================================================

class SampleRequiredMaterial(Base):
    """Materials required for a specific sample"""
    __tablename__ = "sample_required_materials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_request_id = Column(Integer, ForeignKey("sample_requests.id", ondelete="CASCADE"), nullable=False)

    # Product reference (from Settings/Materials DB)
    product_category = Column(String, nullable=True)
    product_id = Column(String, nullable=True)  # Reference to product in Settings DB
    product_name = Column(String, nullable=True)
    category = Column(String, nullable=True)
    sub_category = Column(String, nullable=True)

    # Quantity
    required_quantity = Column(Float, nullable=False)
    uom = Column(String, nullable=False)  # kg, meter, piece, etc.

    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sample = relationship("SampleRequest", back_populates="required_materials")


# =============================================================================
# SAMPLE OPERATION (Link operations to samples)
# =============================================================================

class SampleOperation(Base):
    """Operations assigned to a sample"""
    __tablename__ = "sample_operations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_request_id = Column(Integer, ForeignKey("sample_requests.id", ondelete="CASCADE"), nullable=False)
    operation_master_id = Column(Integer, ForeignKey("manufacturing_operations.id"), nullable=False)

    # Denormalized for display (auto-filled from operation master)
    operation_type = Column(String, nullable=True)
    operation_name = Column(String, nullable=True)

    # Sequence
    sequence_order = Column(Integer, default=1)  # Order of operation

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sample = relationship("SampleRequest", back_populates="operations")
    operation = relationship("ManufacturingOperation", back_populates="sample_operations")


# =============================================================================
# SAMPLE TNA (Time & Action - Operation-based)
# =============================================================================

class SampleTNA(Base):
    """Sample TNA - tracks operations progress with responsible persons and dates"""
    __tablename__ = "sample_tna"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_request_id = Column(Integer, ForeignKey("sample_requests.id", ondelete="CASCADE"), nullable=False)

    # Operation info
    operation_sequence = Column(Integer, nullable=False)  # Operation 1, 2, 3...
    operation_name = Column(String, nullable=False)  # Display name like "Operation 1" or actual name

    # Assignment
    responsible_person = Column(String, nullable=True)

    # Schedule
    start_datetime = Column(DateTime(timezone=True), nullable=True)
    end_datetime = Column(DateTime(timezone=True), nullable=True)
    actual_start_datetime = Column(DateTime(timezone=True), nullable=True)
    actual_end_datetime = Column(DateTime(timezone=True), nullable=True)

    # Status
    status = Column(String, default="Pending")  # Pending, In Progress, Completed, Delayed
    remark = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sample = relationship("SampleRequest", back_populates="tna_items")


# =============================================================================
# SAMPLE STATUS TRACKING
# =============================================================================

class SampleStatus(Base):
    """Sample status tracking - maintains history of status changes"""
    __tablename__ = "sample_status"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_request_id = Column(Integer, ForeignKey("sample_requests.id", ondelete="CASCADE"), nullable=False)

    # Status
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

    # Relationships
    sample = relationship("SampleRequest", back_populates="status_history")


# =============================================================================
# STYLE VARIANT MATERIAL (Required Material per Style Variant)
# =============================================================================

class StyleVariantMaterial(Base):
    """Materials required for a style variant (used for costing/planning)"""
    __tablename__ = "style_variant_materials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_variant_id = Column(Integer, ForeignKey("style_variants.id", ondelete="CASCADE"), nullable=False)

    # Material reference
    style_material_id = Column(String, nullable=True)  # Internal material ID
    product_category = Column(String, nullable=True)
    sub_category = Column(String, nullable=True)
    product_id = Column(String, nullable=True)  # Reference to product in Settings DB
    product_name = Column(String, nullable=True)

    # Quantity and weight
    required_quantity = Column(Float, nullable=True)
    uom = Column(String, nullable=True)
    weight = Column(Float, nullable=True)  # Auto-calculated based on product
    weight_uom = Column(String, default="kg")

    # Condition/Notes
    condition = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    variant = relationship("StyleVariant", back_populates="variant_materials")


# =============================================================================
# SMV CALCULATION (Per Style Variant)
# =============================================================================

class SMVCalculation(Base):
    """SMV (Standard Minute Value) calculation per style variant and operation"""
    __tablename__ = "smv_calculations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_variant_id = Column(Integer, ForeignKey("style_variants.id", ondelete="CASCADE"), nullable=False)
    operation_id = Column(Integer, ForeignKey("manufacturing_operations.id"), nullable=True)

    # Operation details (denormalized)
    operation_type = Column(String, nullable=True)
    operation_name = Column(String, nullable=True)

    # Duration
    number_of_operations = Column(Integer, default=1)
    duration_hms = Column(String, nullable=True)  # Stored as "HH:MM:SS"
    total_duration_minutes = Column(Float, nullable=True)  # Calculated total in minutes

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    variant = relationship("StyleVariant", back_populates="smv_calculations")
    operation = relationship("ManufacturingOperation", back_populates="smv_calculations")


# =============================================================================
# LEGACY SUPPORT (Deprecated - kept for migration)
# =============================================================================

class Sample(Base):
    """DEPRECATED: Legacy sample table - use SampleRequest instead"""
    __tablename__ = "samples"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sample_id = Column(String, unique=True, nullable=False, index=True)
    buyer_id = Column(Integer, nullable=False, index=True)
    style_id = Column(Integer, ForeignKey("style_summaries.id"), nullable=True)
    sample_type = Column(String, nullable=True)
    sample_description = Column(Text, nullable=True)
    item = Column(String, nullable=True)
    gauge = Column(String, nullable=True)
    worksheet_rcv_date = Column(DateTime(timezone=True), nullable=True)
    yarn_rcv_date = Column(DateTime(timezone=True), nullable=True)
    required_date = Column(DateTime(timezone=True), nullable=True)
    color = Column(String, nullable=True)
    assigned_designer = Column(String, nullable=True)
    required_sample_quantity = Column(Integer, nullable=True)
    round = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    submit_status = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class OperationType(Base):
    """DEPRECATED: Legacy operation types - use ManufacturingOperation instead"""
    __tablename__ = "operation_types"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    operation_type = Column(String, nullable=False, index=True)
    operation_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class RequiredMaterial(Base):
    """DEPRECATED: Legacy required materials - use StyleVariantMaterial or SampleRequiredMaterial"""
    __tablename__ = "required_materials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    style_variant_id = Column(Integer, ForeignKey("style_variants.id"), nullable=True)
    style_name = Column(String, nullable=True)
    style_id = Column(String, nullable=True)
    material = Column(String, nullable=True)
    uom = Column(String, nullable=True)
    consumption_per_piece = Column(Float, nullable=True)
    converted_uom = Column(String, nullable=True)
    converted_consumption = Column(Float, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class GarmentColor(Base):
    """Master table for garment colors"""
    __tablename__ = "garment_colors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    color_name = Column(String, nullable=False, unique=True, index=True)
    color_code = Column(String, nullable=False)
    color_ref = Column(String, nullable=True)
    category = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class GarmentSize(Base):
    """Master table for garment sizes"""
    __tablename__ = "garment_sizes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    size_value = Column(String, nullable=False, unique=True, index=True)
    size_label = Column(String, nullable=True)
    size_category = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
