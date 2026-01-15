from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from core.database import get_db_samples
from core.logging import setup_logging
from modules.workflows.models.workflow import SampleWorkflow
from modules.samples.models.sample import (
    # Style models
    StyleSummary, StyleVariant, VariantColorPart,
    # Master data
    SampleMachine, ManufacturingOperation,
    GarmentColor, GarmentSize,
    # Sample core (NEW)
    SampleRequest, SamplePlan, SampleRequiredMaterial,
    SampleOperation, SampleTNA, SampleStatus,
    # Style variant materials & SMV
    StyleVariantMaterial, SMVCalculation,
    # Legacy (deprecated)
    Sample, OperationType, RequiredMaterial
)
from modules.samples.schemas.sample import (
    # Style schemas
    StyleSummaryCreate, StyleSummaryUpdate, StyleSummaryResponse,
    StyleVariantCreate, StyleVariantUpdate, StyleVariantResponse,
    VariantColorPartCreate, VariantColorPartResponse,
    # Master data schemas
    SampleMachineCreate, SampleMachineUpdate, SampleMachineResponse,
    ManufacturingOperationCreate, ManufacturingOperationUpdate, ManufacturingOperationResponse,
    GarmentColorCreate, GarmentColorUpdate, GarmentColorResponse,
    GarmentSizeCreate, GarmentSizeUpdate, GarmentSizeResponse,
    # Sample core schemas (NEW)
    SampleRequestCreate, SampleRequestUpdate, SampleRequestResponse,
    SamplePlanCreate, SamplePlanUpdate, SamplePlanResponse,
    SampleRequiredMaterialCreate, SampleRequiredMaterialUpdate, SampleRequiredMaterialResponse,
    SampleOperationCreate, SampleOperationUpdate, SampleOperationResponse,
    SampleTNACreate, SampleTNAUpdate, SampleTNAResponse,
    SampleStatusCreate, SampleStatusUpdate, SampleStatusResponse,
    # Style variant materials & SMV schemas
    StyleVariantMaterialCreate, StyleVariantMaterialUpdate, StyleVariantMaterialResponse,
    SMVCalculationCreate, SMVCalculationUpdate, SMVCalculationResponse,
    # Legacy schemas
    SampleCreate, SampleUpdate, SampleResponse,
    OperationTypeCreate, OperationTypeResponse,
    RequiredMaterialCreate, RequiredMaterialUpdate, RequiredMaterialResponse
)
import uuid
from datetime import datetime

logger = setup_logging()

router = APIRouter()


# =============================================================================
# SAMPLE MACHINE MASTER (NEW)
# =============================================================================

@router.post("/machines", response_model=SampleMachineResponse, status_code=status.HTTP_201_CREATED)
def create_machine(machine_data: SampleMachineCreate, db: Session = Depends(get_db_samples)):
    """Create a new knitting machine"""
    try:
        new_machine = SampleMachine(**machine_data.model_dump())
        db.add(new_machine)
        db.commit()
        db.refresh(new_machine)
        return new_machine
    except Exception as e:
        db.rollback()
        logger.error(f"Machine creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create machine: {str(e)}")


@router.get("/machines", response_model=List[SampleMachineResponse])
def get_machines(
    is_active: Optional[bool] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_samples)
):
    """Get all knitting machines"""
    query = db.query(SampleMachine)
    if is_active is not None:
        query = query.filter(SampleMachine.is_active == is_active)
    return query.order_by(SampleMachine.machine_code).offset(skip).limit(limit).all()


@router.get("/machines/{machine_id}", response_model=SampleMachineResponse)
def get_machine(machine_id: int, db: Session = Depends(get_db_samples)):
    """Get a specific machine"""
    machine = db.query(SampleMachine).filter(SampleMachine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine


@router.put("/machines/{machine_id}", response_model=SampleMachineResponse)
def update_machine(machine_id: int, machine_data: SampleMachineUpdate, db: Session = Depends(get_db_samples)):
    """Update a machine"""
    machine = db.query(SampleMachine).filter(SampleMachine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    for key, value in machine_data.model_dump(exclude_unset=True).items():
        setattr(machine, key, value)

    db.commit()
    db.refresh(machine)
    return machine


@router.delete("/machines/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_machine(machine_id: int, db: Session = Depends(get_db_samples)):
    """Delete a machine"""
    machine = db.query(SampleMachine).filter(SampleMachine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    db.delete(machine)
    db.commit()
    return None


# =============================================================================
# MANUFACTURING OPERATIONS MASTER (NEW)
# =============================================================================

@router.post("/manufacturing-operations", response_model=ManufacturingOperationResponse, status_code=status.HTTP_201_CREATED)
def create_manufacturing_operation(op_data: ManufacturingOperationCreate, db: Session = Depends(get_db_samples)):
    """Create a new manufacturing operation"""
    try:
        new_op = ManufacturingOperation(**op_data.model_dump())
        db.add(new_op)
        db.commit()
        db.refresh(new_op)
        return new_op
    except Exception as e:
        db.rollback()
        logger.error(f"Manufacturing operation creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create operation: {str(e)}")


@router.get("/manufacturing-operations", response_model=List[ManufacturingOperationResponse])
def get_manufacturing_operations(
    operation_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_samples)
):
    """Get all manufacturing operations"""
    query = db.query(ManufacturingOperation)
    if operation_type:
        query = query.filter(ManufacturingOperation.operation_type == operation_type)
    if is_active is not None:
        query = query.filter(ManufacturingOperation.is_active == is_active)
    return query.order_by(ManufacturingOperation.operation_id).offset(skip).limit(limit).all()


@router.get("/manufacturing-operations/{op_id}", response_model=ManufacturingOperationResponse)
def get_manufacturing_operation(op_id: int, db: Session = Depends(get_db_samples)):
    """Get a specific manufacturing operation"""
    op = db.query(ManufacturingOperation).filter(ManufacturingOperation.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Manufacturing operation not found")
    return op


@router.put("/manufacturing-operations/{op_id}", response_model=ManufacturingOperationResponse)
def update_manufacturing_operation(op_id: int, op_data: ManufacturingOperationUpdate, db: Session = Depends(get_db_samples)):
    """Update a manufacturing operation"""
    op = db.query(ManufacturingOperation).filter(ManufacturingOperation.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Manufacturing operation not found")

    for key, value in op_data.model_dump(exclude_unset=True).items():
        setattr(op, key, value)

    db.commit()
    db.refresh(op)
    return op


@router.delete("/manufacturing-operations/{op_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_manufacturing_operation(op_id: int, db: Session = Depends(get_db_samples)):
    """Delete a manufacturing operation"""
    op = db.query(ManufacturingOperation).filter(ManufacturingOperation.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Manufacturing operation not found")

    db.delete(op)
    db.commit()
    return None


# =============================================================================
# SAMPLE REQUEST ENDPOINTS (NEW - Primary Sample Info)
# =============================================================================

def generate_sample_id(db: Session) -> str:
    """Generate a unique sample ID like SMP-YYYYMMDD-XXXX"""
    today = datetime.now().strftime("%Y%m%d")
    prefix = f"SMP-{today}-"

    # Find the highest number for today
    last_sample = db.query(SampleRequest).filter(
        SampleRequest.sample_id.like(f"{prefix}%")
    ).order_by(SampleRequest.sample_id.desc()).first()

    if last_sample:
        try:
            last_num = int(last_sample.sample_id.split("-")[-1])
            new_num = last_num + 1
        except (ValueError, IndexError, AttributeError):
            new_num = 1
    else:
        new_num = 1

    return f"{prefix}{new_num:04d}"


@router.post("/requests", response_model=SampleRequestResponse, status_code=status.HTTP_201_CREATED)
def create_sample_request(request_data: SampleRequestCreate, db: Session = Depends(get_db_samples)):
    """Create a new sample request"""
    try:
        data = request_data.model_dump()

        # Auto-generate sample_id if not provided
        if not data.get('sample_id'):
            data['sample_id'] = generate_sample_id(db)

        new_request = SampleRequest(**data)
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
        return new_request
    except Exception as e:
        db.rollback()
        logger.error(f"Sample request creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create sample request: {str(e)}")


@router.get("/requests", response_model=List[SampleRequestResponse])
def get_sample_requests(
    buyer_id: Optional[int] = None,
    sample_category: Optional[str] = None,
    current_status: Optional[str] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_samples)
):
    """Get all sample requests with optional filters"""
    query = db.query(SampleRequest).options(
        joinedload(SampleRequest.style),
        joinedload(SampleRequest.plan).joinedload(SamplePlan.machine),
        joinedload(SampleRequest.required_materials),
        joinedload(SampleRequest.operations),
        joinedload(SampleRequest.tna_items),
        joinedload(SampleRequest.status_history),
        joinedload(SampleRequest.workflows).joinedload(SampleWorkflow.cards)  # Load workflow data (Requirements 10.2, 10.3)
    )

    if buyer_id:
        query = query.filter(SampleRequest.buyer_id == buyer_id)
    if sample_category:
        query = query.filter(SampleRequest.sample_category == sample_category)
    if current_status:
        query = query.filter(SampleRequest.current_status == current_status)

    results = query.order_by(SampleRequest.id.desc()).offset(skip).limit(limit).all()
    
    # Add workflow status to each result (Requirements 10.2, 10.3)
    for request in results:
        request.workflow_status = request.current_workflow_status
    
    return results


@router.get("/requests/by-sample-id/{sample_id}", response_model=SampleRequestResponse)
def get_sample_request_by_sample_id(sample_id: str, db: Session = Depends(get_db_samples)):
    """Get a sample request by its sample_id string"""
    request = db.query(SampleRequest).options(
        joinedload(SampleRequest.style),
        joinedload(SampleRequest.plan).joinedload(SamplePlan.machine),
        joinedload(SampleRequest.required_materials),
        joinedload(SampleRequest.operations),
        joinedload(SampleRequest.tna_items),
        joinedload(SampleRequest.status_history),
        joinedload(SampleRequest.workflows).joinedload(SampleWorkflow.cards)  # Load workflow data (Requirements 10.2, 10.3)
    ).filter(SampleRequest.sample_id == sample_id).first()

    if not request:
        raise HTTPException(status_code=404, detail="Sample request not found")
    
    # Add workflow status (Requirements 10.2, 10.3)
    request.workflow_status = request.current_workflow_status
    return request


@router.get("/requests/{request_id}", response_model=SampleRequestResponse)
def get_sample_request(request_id: int, db: Session = Depends(get_db_samples)):
    """Get a specific sample request by ID"""
    request = db.query(SampleRequest).options(
        joinedload(SampleRequest.style),
        joinedload(SampleRequest.plan).joinedload(SamplePlan.machine),
        joinedload(SampleRequest.required_materials),
        joinedload(SampleRequest.operations),
        joinedload(SampleRequest.tna_items),
        joinedload(SampleRequest.status_history),
        joinedload(SampleRequest.workflows).joinedload(SampleWorkflow.cards)  # Load workflow data (Requirements 10.2, 10.3)
    ).filter(SampleRequest.id == request_id).first()

    if not request:
        raise HTTPException(status_code=404, detail="Sample request not found")
    
    # Add workflow status (Requirements 10.2, 10.3)
    request.workflow_status = request.current_workflow_status
    return request


@router.put("/requests/{request_id}", response_model=SampleRequestResponse)
def update_sample_request(request_id: int, request_data: SampleRequestUpdate, db: Session = Depends(get_db_samples)):
    """Update a sample request, sync to merchandiser, and notify merchandiser department"""
    request = db.query(SampleRequest).filter(SampleRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Sample request not found")

    update_data = request_data.model_dump(exclude_unset=True)
    try:
        for key, value in update_data.items():
            setattr(request, key, value)

        db.commit()
        db.refresh(request)
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating sample request {request_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update sample request: {str(e)}"
        )
    
    # Sync update to SamplePrimaryInfo in merchandiser database (BIDIRECTIONAL SYNC)
    try:
        from core.database import SessionLocalMerchandiser
        from modules.merchandiser.models.merchandiser import SamplePrimaryInfo
        from core.services.buyer_service import BuyerService
        
        merchandiser_db = SessionLocalMerchandiser()
        try:
            sample_primary = merchandiser_db.query(SamplePrimaryInfo).filter(
                SamplePrimaryInfo.sample_id == request.sample_id
            ).first()
            
            if sample_primary:
                # Get buyer name if buyer_id changed
                if 'buyer_id' in update_data:
                    buyer_service = BuyerService()
                    buyer_name = None
                    try:
                        buyer_info = buyer_service.get_by_id(update_data['buyer_id'])
                        if buyer_info:
                            buyer_name = buyer_info.get("buyer_name")
                    except (KeyError, ValueError, AttributeError) as buyer_error:
                        logger.warning(f"Could not fetch buyer name for buyer_id {update_data['buyer_id']}: {buyer_error}")
                        pass
                    if buyer_name:
                        sample_primary.buyer_name = buyer_name
                    sample_primary.buyer_id = update_data['buyer_id']
                
                # Update all matching fields (map SampleRequest to SamplePrimaryInfo)
                if 'sample_name' in update_data:
                    sample_primary.sample_name = update_data['sample_name']
                if 'item' in update_data:
                    sample_primary.item = update_data['item']
                if 'gauge' in update_data:
                    sample_primary.gauge = update_data['gauge']
                if 'ply' in update_data:
                    # SampleRequest has ply as int, SamplePrimaryInfo has it as string
                    sample_primary.ply = str(update_data['ply']) if update_data['ply'] is not None else None
                if 'sample_category' in update_data:
                    sample_primary.sample_category = update_data['sample_category']
                if 'color_ids' in update_data:
                    # SampleRequest has color_ids as List[int], SamplePrimaryInfo has it as JSON
                    sample_primary.color_ids = update_data['color_ids']
                    # Also set color_id (first one) for backward compatibility
                    if update_data['color_ids'] and len(update_data['color_ids']) > 0:
                        sample_primary.color_id = str(update_data['color_ids'][0])
                if 'color_name' in update_data:
                    sample_primary.color_name = update_data['color_name']
                if 'size_ids' in update_data:
                    # SampleRequest has size_ids as List[str], SamplePrimaryInfo has it as JSON
                    sample_primary.size_ids = update_data['size_ids']
                    # Also set size_id (first one) for backward compatibility
                    if update_data['size_ids'] and len(update_data['size_ids']) > 0:
                        sample_primary.size_id = update_data['size_ids'][0]
                if 'size_name' in update_data:
                    sample_primary.size_name = update_data['size_name']
                if 'yarn_ids' in update_data:
                    # SampleRequest has yarn_ids as List[str], SamplePrimaryInfo has it as JSON
                    sample_primary.yarn_ids = update_data['yarn_ids']
                    # Also set yarn_id (first one) for backward compatibility
                    if update_data['yarn_ids'] and len(update_data['yarn_ids']) > 0:
                        sample_primary.yarn_id = update_data['yarn_ids'][0]
                if 'yarn_id' in update_data:
                    sample_primary.yarn_id = update_data['yarn_id']
                    # Also update yarn_ids array if yarn_id is set (but yarn_ids takes precedence)
                    if 'yarn_ids' not in update_data and update_data['yarn_id']:
                        sample_primary.yarn_ids = [update_data['yarn_id']]
                if 'yarn_details' in update_data:
                    sample_primary.yarn_details = update_data['yarn_details']
                if 'trims_ids' in update_data:
                    # SampleRequest has trims_ids as List[str], SamplePrimaryInfo also has it as JSON
                    sample_primary.trims_ids = update_data['trims_ids']
                if 'trims_details' in update_data:
                    sample_primary.trims_details = update_data['trims_details']
                if 'decorative_part' in update_data:
                    # SampleRequest has decorative_part as string (comma-separated), SamplePrimaryInfo has it as JSON array
                    decorative_part = update_data['decorative_part']
                    if isinstance(decorative_part, str):
                        # Convert comma-separated string to array
                        sample_primary.decorative_part = [p.strip() for p in decorative_part.split(',') if p.strip()] if decorative_part else None
                    elif isinstance(decorative_part, list):
                        sample_primary.decorative_part = decorative_part
                    else:
                        sample_primary.decorative_part = None
                if 'yarn_handover_date' in update_data:
                    sample_primary.yarn_handover_date = update_data['yarn_handover_date']
                if 'trims_handover_date' in update_data:
                    sample_primary.trims_handover_date = update_data['trims_handover_date']
                if 'required_date' in update_data:
                    sample_primary.required_date = update_data['required_date']
                if 'request_pcs' in update_data:
                    sample_primary.request_pcs = update_data['request_pcs']
                if 'additional_instruction' in update_data:
                    # SampleRequest has additional_instruction as string (newline-separated with ✓ markers),
                    # SamplePrimaryInfo has it as JSON array of objects
                    additional_instruction = update_data['additional_instruction']
                    if isinstance(additional_instruction, str):
                        # Parse newline-separated string with optional ✓ markers
                        lines = additional_instruction.split('\n')
                        instructions = []
                        for line in lines:
                            trimmed = line.strip()
                            if not trimmed:
                                continue
                            done = trimmed.startswith('✓')
                            instruction_text = trimmed[1:].strip() if done else trimmed
                            instructions.append({'instruction': instruction_text, 'done': done})
                        sample_primary.additional_instruction = instructions if instructions else None
                    elif isinstance(additional_instruction, list):
                        sample_primary.additional_instruction = additional_instruction
                    else:
                        sample_primary.additional_instruction = None
                if 'techpack_url' in update_data or 'techpack_filename' in update_data:
                    # SampleRequest has techpack_url/filename as separate fields,
                    # SamplePrimaryInfo has techpack_files as JSON array
                    techpack_url = update_data.get('techpack_url') or request.techpack_url
                    techpack_filename = update_data.get('techpack_filename') or request.techpack_filename
                    if techpack_url or techpack_filename:
                        sample_primary.techpack_files = [{
                            'url': techpack_url or '',
                            'filename': techpack_filename or '',
                            'type': 'file'
                        }]
                    else:
                        sample_primary.techpack_files = None
                
                try:
                    merchandiser_db.commit()
                    logger.info(f"✅ Successfully synced sample request update for sample_id {request.sample_id} to merchandiser database")
                except Exception as commit_error:
                    merchandiser_db.rollback()
                    logger.error(f"Failed to commit sync to merchandiser database for sample_id {request.sample_id}: {str(commit_error)}", exc_info=True)
                    raise
        finally:
            merchandiser_db.close()
    except (HTTPException, ValueError, AttributeError, KeyError) as sync_error:
        # Log error but don't fail the samples update for sync issues
        logger.warning(f"Failed to sync sample request update to merchandiser database for sample_id {request.sample_id}: {str(sync_error)}", exc_info=True)
    except Exception as sync_error:
        # Log unexpected errors but don't fail the samples update
        logger.error(f"Unexpected error syncing to merchandiser database for sample_id {request.sample_id}: {str(sync_error)}", exc_info=True)
    
    # Create notifications for all merchandiser department users
    try:
        from core.database import SessionLocalUsers
        from modules.notifications.models.notification import Notification
        from modules.users.models.user import User
        
        users_db = SessionLocalUsers()
        try:
            # Get all users in the merchandiser department
            merchandiser_users = users_db.query(User).filter(
                User.department.ilike("%merchandis%")
            ).all()
            
            # Create a notification for each merchandiser department user
            for user in merchandiser_users:
                notification = Notification(
                    user_id=user.id,
                    title="Sample Request Updated",
                    message=f"Sample request has been updated by Sample Department - Sample ID: {request.sample_id}",
                    type="info",
                    related_entity_type="sample_request",
                    related_entity_id=request.sample_id,
                    target_department="Merchandiser"  # Only visible to Merchandiser department
                )
                users_db.add(notification)
            
            users_db.commit()
        finally:
            users_db.close()
    except Exception as notify_error:
        # Log error but don't fail the update
        logger.warning(f"Failed to create notifications for sample update: {str(notify_error)}")
    
    return request


@router.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample_request(request_id: int, db: Session = Depends(get_db_samples)):
    """Delete a sample request (cascades to related records)"""
    request = db.query(SampleRequest).filter(SampleRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Sample request not found")

    db.delete(request)
    db.commit()
    return None


# =============================================================================
# SAMPLE PLAN ENDPOINTS (NEW)
# =============================================================================

@router.post("/sample-plans", response_model=SamplePlanResponse, status_code=status.HTTP_201_CREATED)
def create_sample_plan(plan_data: SamplePlanCreate, db: Session = Depends(get_db_samples)):
    """Create or update a sample plan (one-to-one with sample request)"""
    try:
        # Check if plan already exists for this sample request
        existing = db.query(SamplePlan).filter(SamplePlan.sample_request_id == plan_data.sample_request_id).first()

        if existing:
            # Update existing plan
            for key, value in plan_data.model_dump().items():
                setattr(existing, key, value)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # Create new plan
            new_plan = SamplePlan(**plan_data.model_dump())
            db.add(new_plan)
            db.commit()
            db.refresh(new_plan)
            return new_plan
    except Exception as e:
        db.rollback()
        logger.error(f"Sample plan creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create sample plan: {str(e)}")


@router.get("/sample-plans", response_model=List[SamplePlanResponse])
def get_sample_plans(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_samples)
):
    """Get all sample plans"""
    return db.query(SamplePlan).options(
        joinedload(SamplePlan.machine)
    ).order_by(SamplePlan.id.desc()).offset(skip).limit(limit).all()


@router.get("/sample-plans/by-request/{request_id}", response_model=SamplePlanResponse)
def get_sample_plan_by_request(request_id: int, db: Session = Depends(get_db_samples)):
    """Get sample plan by sample request ID"""
    plan = db.query(SamplePlan).options(
        joinedload(SamplePlan.machine)
    ).filter(SamplePlan.sample_request_id == request_id).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Sample plan not found")
    return plan


@router.put("/sample-plans/{plan_id}", response_model=SamplePlanResponse)
def update_sample_plan(plan_id: int, plan_data: SamplePlanUpdate, db: Session = Depends(get_db_samples)):
    """Update a sample plan"""
    plan = db.query(SamplePlan).filter(SamplePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Sample plan not found")

    for key, value in plan_data.model_dump(exclude_unset=True).items():
        setattr(plan, key, value)

    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/sample-plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample_plan(plan_id: int, db: Session = Depends(get_db_samples)):
    """Delete a sample plan"""
    plan = db.query(SamplePlan).filter(SamplePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Sample plan not found")

    db.delete(plan)
    db.commit()
    return None


# =============================================================================
# SAMPLE REQUIRED MATERIAL ENDPOINTS (NEW)
# =============================================================================

@router.post("/sample-materials", response_model=SampleRequiredMaterialResponse, status_code=status.HTTP_201_CREATED)
def create_sample_material(material_data: SampleRequiredMaterialCreate, db: Session = Depends(get_db_samples)):
    """Create a new sample required material"""
    try:
        new_material = SampleRequiredMaterial(**material_data.model_dump())
        db.add(new_material)
        db.commit()
        db.refresh(new_material)
        return new_material
    except Exception as e:
        db.rollback()
        logger.error(f"Sample material creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create material: {str(e)}")


@router.get("/sample-materials", response_model=List[SampleRequiredMaterialResponse])
def get_sample_materials(
    sample_request_id: Optional[int] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_samples)
):
    """Get all sample materials"""
    query = db.query(SampleRequiredMaterial)
    if sample_request_id:
        query = query.filter(SampleRequiredMaterial.sample_request_id == sample_request_id)
    return query.order_by(SampleRequiredMaterial.id).offset(skip).limit(limit).all()


@router.put("/sample-materials/{material_id}", response_model=SampleRequiredMaterialResponse)
def update_sample_material(material_id: int, material_data: SampleRequiredMaterialUpdate, db: Session = Depends(get_db_samples)):
    """Update a sample material"""
    material = db.query(SampleRequiredMaterial).filter(SampleRequiredMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Sample material not found")

    for key, value in material_data.model_dump(exclude_unset=True).items():
        setattr(material, key, value)

    db.commit()
    db.refresh(material)
    return material


@router.delete("/sample-materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample_material(material_id: int, db: Session = Depends(get_db_samples)):
    """Delete a sample material"""
    material = db.query(SampleRequiredMaterial).filter(SampleRequiredMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Sample material not found")

    db.delete(material)
    db.commit()
    return None


# =============================================================================
# SAMPLE OPERATION ENDPOINTS (NEW - Link operations to samples)
# =============================================================================

@router.post("/sample-operations", response_model=SampleOperationResponse, status_code=status.HTTP_201_CREATED)
def create_sample_operation_link(op_data: SampleOperationCreate, db: Session = Depends(get_db_samples)):
    """Link an operation to a sample"""
    try:
        # Auto-fill operation details from master
        master_op = db.query(ManufacturingOperation).filter(
            ManufacturingOperation.id == op_data.operation_master_id
        ).first()

        data = op_data.model_dump()
        if master_op:
            data['operation_type'] = master_op.operation_type
            data['operation_name'] = master_op.operation_name

        new_op = SampleOperation(**data)
        db.add(new_op)
        db.commit()
        db.refresh(new_op)
        return new_op
    except Exception as e:
        db.rollback()
        logger.error(f"Sample operation link error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to link operation: {str(e)}")


@router.get("/sample-operations", response_model=List[SampleOperationResponse])
def get_sample_operations_list(
    sample_request_id: Optional[int] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_samples)
):
    """Get all sample operations"""
    query = db.query(SampleOperation)
    if sample_request_id:
        query = query.filter(SampleOperation.sample_request_id == sample_request_id)
    return query.order_by(SampleOperation.sequence_order).offset(skip).limit(limit).all()


@router.put("/sample-operations/{op_id}", response_model=SampleOperationResponse)
def update_sample_operation_link(op_id: int, op_data: SampleOperationUpdate, db: Session = Depends(get_db_samples)):
    """Update a sample operation"""
    op = db.query(SampleOperation).filter(SampleOperation.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Sample operation not found")

    for key, value in op_data.model_dump(exclude_unset=True).items():
        setattr(op, key, value)

    db.commit()
    db.refresh(op)
    return op


@router.delete("/sample-operations/{op_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample_operation_link(op_id: int, db: Session = Depends(get_db_samples)):
    """Remove an operation from a sample"""
    op = db.query(SampleOperation).filter(SampleOperation.id == op_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Sample operation not found")

    db.delete(op)
    db.commit()
    return None


# =============================================================================
# SAMPLE TNA ENDPOINTS (NEW - Operation-based Time & Action)
# =============================================================================

@router.post("/sample-tna", response_model=SampleTNAResponse, status_code=status.HTTP_201_CREATED)
def create_sample_tna(tna_data: SampleTNACreate, db: Session = Depends(get_db_samples)):
    """Create a new TNA entry"""
    try:
        new_tna = SampleTNA(**tna_data.model_dump())
        db.add(new_tna)
        db.commit()
        db.refresh(new_tna)
        return new_tna
    except Exception as e:
        db.rollback()
        logger.error(f"Sample TNA creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create TNA: {str(e)}")


@router.get("/sample-tna", response_model=List[SampleTNAResponse])
def get_sample_tna_list(
    sample_request_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_samples)
):
    """Get all TNA entries"""
    query = db.query(SampleTNA)
    if sample_request_id:
        query = query.filter(SampleTNA.sample_request_id == sample_request_id)
    if status_filter:
        query = query.filter(SampleTNA.status == status_filter)
    return query.order_by(SampleTNA.operation_sequence).offset(skip).limit(limit).all()


@router.put("/sample-tna/{tna_id}", response_model=SampleTNAResponse)
def update_sample_tna(tna_id: int, tna_data: SampleTNAUpdate, db: Session = Depends(get_db_samples)):
    """Update a TNA entry"""
    tna = db.query(SampleTNA).filter(SampleTNA.id == tna_id).first()
    if not tna:
        raise HTTPException(status_code=404, detail="TNA entry not found")

    for key, value in tna_data.model_dump(exclude_unset=True).items():
        setattr(tna, key, value)

    db.commit()
    db.refresh(tna)
    return tna


@router.delete("/sample-tna/{tna_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample_tna(tna_id: int, db: Session = Depends(get_db_samples)):
    """Delete a TNA entry"""
    tna = db.query(SampleTNA).filter(SampleTNA.id == tna_id).first()
    if not tna:
        raise HTTPException(status_code=404, detail="TNA entry not found")

    db.delete(tna)
    db.commit()
    return None


# =============================================================================
# SAMPLE STATUS ENDPOINTS (NEW)
# =============================================================================

@router.post("/sample-status", response_model=SampleStatusResponse, status_code=status.HTTP_201_CREATED)
def create_sample_status(status_data: SampleStatusCreate, db: Session = Depends(get_db_samples)):
    """Create a new status entry (adds to history)"""
    try:
        new_status = SampleStatus(**status_data.model_dump())
        db.add(new_status)
        db.commit()
        db.refresh(new_status)

        # Get the sample request for syncing
        request = db.query(SampleRequest).filter(
            SampleRequest.id == status_data.sample_request_id
        ).first()
        
        if request:
            # Update current_status on the sample request
            if status_data.status_by_sample or status_data.status_from_merchandiser:
                request.current_status = status_data.status_by_sample or status_data.status_from_merchandiser
                db.commit()
            
            # Auto-sync to merchandiser module
            try:
                from core.database import SessionLocalMerchandiser
                from modules.merchandiser.models.merchandiser import SampleStatus as MerchandiserSampleStatus
                
                logger.info(f"Starting sync to merchandiser database for sample_id: {request.sample_id}, sample_request_id: {status_data.sample_request_id}")
                
                merchandiser_db = SessionLocalMerchandiser()
                try:
                    # Check if status record already exists in merchandiser database
                    existing_status = merchandiser_db.query(MerchandiserSampleStatus).filter(
                        MerchandiserSampleStatus.sample_id == request.sample_id
                    ).order_by(MerchandiserSampleStatus.created_at.desc()).first()
                    
                    if existing_status:
                        # Update existing status record
                        existing_status.status_by_sample = status_data.status_by_sample
                        existing_status.notes = status_data.notes
                        if status_data.updated_by:
                            existing_status.updated_by = status_data.updated_by
                        if hasattr(status_data, 'expecting_end_date') and status_data.expecting_end_date:
                            existing_status.expecting_end_date = status_data.expecting_end_date
                        merchandiser_db.commit()
                        logger.info(f"✅ Updated existing sample status in merchandiser database for sample_id {request.sample_id}")
                    else:
                        # Create new status record in merchandiser database
                        new_merchandiser_status = MerchandiserSampleStatus(
                            sample_id=request.sample_id,
                            status_by_sample=status_data.status_by_sample,
                            status_from_merchandiser=status_data.status_from_merchandiser,
                            notes=status_data.notes,
                            updated_by=status_data.updated_by,
                            expecting_end_date=getattr(status_data, 'expecting_end_date', None)
                        )
                        merchandiser_db.add(new_merchandiser_status)
                        merchandiser_db.commit()
                        logger.info(f"✅ Created new sample status in merchandiser database for sample_id {request.sample_id}")
                finally:
                    merchandiser_db.close()
            except Exception as sync_error:
                logger.error(f"❌ Failed to sync sample status to merchandiser database for sample_id {request.sample_id}: {str(sync_error)}", exc_info=True)
                # Don't fail the request if sync fails
            
            # Send notification to merchandising department
            try:
                from core.notification_service import send_notification_to_department
                send_notification_to_department(
                    title="Sample Status Created",
                    message=f"Sample status for {request.sample_id} has been created by Sample Department",
                    target_department="merchandising",
                    notification_type="info",
                    related_entity_type="sample_status",
                    related_entity_id=request.sample_id
                )
            except Exception as notif_error:
                logger.error(f"Failed to send notification: {str(notif_error)}", exc_info=True)

        return new_status
    except Exception as e:
        db.rollback()
        logger.error(f"Sample status creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create status: {str(e)}")


@router.get("/sample-status", response_model=List[SampleStatusResponse])
def get_sample_status_list(
    sample_request_id: Optional[int] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_samples)
):
    """Get all status entries"""
    query = db.query(SampleStatus)
    if sample_request_id:
        query = query.filter(SampleStatus.sample_request_id == sample_request_id)
    return query.order_by(SampleStatus.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/sample-status/{status_id}", response_model=SampleStatusResponse)
def update_sample_status(status_id: int, status_data: SampleStatusUpdate, db: Session = Depends(get_db_samples)):
    """Update a status entry and auto-sync to merchandiser module"""
    status_record = db.query(SampleStatus).filter(SampleStatus.id == status_id).first()
    if not status_record:
        raise HTTPException(status_code=404, detail="Status entry not found")

    # Store sample_request_id before update
    sample_request_id = status_record.sample_request_id
    
    # Update the status record
    update_data = status_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(status_record, key, value)

    try:
        db.commit()
        db.refresh(status_record)
    except Exception as commit_error:
        db.rollback()
        logger.error(f"Failed to commit sample status update: {str(commit_error)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update sample status: {str(commit_error)}"
        )
    
    # Auto-sync to merchandiser module
    try:
        from core.database import SessionLocalMerchandiser
        from modules.samples.models.sample import SampleRequest
        from modules.merchandiser.models.merchandiser import SampleStatus as MerchandiserSampleStatus
        
        # Get the SampleRequest to get sample_id
        request = db.query(SampleRequest).filter(SampleRequest.id == sample_request_id).first()
        
        if request:
            logger.info(f"Starting sync to merchandiser database for sample_id: {request.sample_id}, status_id: {status_id}")
            
            merchandiser_db = SessionLocalMerchandiser()
            try:
                # Find existing status record in merchandiser database
                existing_status = merchandiser_db.query(MerchandiserSampleStatus).filter(
                    MerchandiserSampleStatus.sample_id == request.sample_id
                ).order_by(MerchandiserSampleStatus.created_at.desc()).first()
                
                if existing_status:
                    # Update existing status record - update fields that come from samples
                    has_changes = False
                    if 'status_by_sample' in update_data:
                        existing_status.status_by_sample = update_data['status_by_sample']
                        has_changes = True
                    if 'notes' in update_data:
                        existing_status.notes = update_data['notes']
                        has_changes = True
                    if 'updated_by' in update_data:
                        existing_status.updated_by = update_data['updated_by']
                        has_changes = True
                    if 'expecting_end_date' in update_data:
                        existing_status.expecting_end_date = update_data['expecting_end_date']
                        has_changes = True
                    
                    if has_changes:
                        try:
                            merchandiser_db.commit()
                            merchandiser_db.refresh(existing_status)
                            logger.info(f"✅ Updated existing sample status in merchandiser database for sample_id {request.sample_id}")
                        except Exception as sync_error:
                            merchandiser_db.rollback()
                            logger.error(f"Failed to sync status update to merchandiser: {str(sync_error)}", exc_info=True)
                            # Don't fail the request - samples update succeeded
                    else:
                        logger.info(f"No changes to sync for sample_id {request.sample_id}")
                else:
                    # Create new status record in merchandiser database if it doesn't exist
                    new_merchandiser_status = MerchandiserSampleStatus(
                        sample_id=request.sample_id,
                        status_by_sample=status_record.status_by_sample,
                        status_from_merchandiser=status_record.status_from_merchandiser,
                        notes=status_record.notes,
                        updated_by=status_record.updated_by,
                        expecting_end_date=status_record.expecting_end_date
                    )
                    merchandiser_db.add(new_merchandiser_status)
                    try:
                        merchandiser_db.commit()
                        merchandiser_db.refresh(new_merchandiser_status)
                        logger.info(f"✅ Created new sample status in merchandiser database for sample_id {request.sample_id}")
                    except Exception as sync_error:
                        merchandiser_db.rollback()
                        logger.error(f"Failed to create status in merchandiser: {str(sync_error)}", exc_info=True)
                        # Don't fail the request - samples update succeeded
            finally:
                merchandiser_db.close()
        else:
            logger.warning(f"SampleRequest not found for sample_request_id {sample_request_id} - sync skipped")
    except Exception as sync_error:
        logger.error(f"Failed to sync sample status update to merchandiser: {str(sync_error)}", exc_info=True)
        # Don't fail the request if sync fails - samples update succeeded
    
    # Send notification to merchandising department
    try:
        from core.notification_service import send_notification_to_department
        send_notification_to_department(
            title="Sample Status Updated",
            message=f"Sample status for {request.sample_id if request else 'Unknown'} has been updated by Sample Department",
            target_department="merchandising",
            notification_type="info",
            related_entity_type="sample_status",
            related_entity_id=request.sample_id if request else None
        )
    except Exception as notif_error:
        logger.warning(f"Failed to send notification: {str(notif_error)}", exc_info=True)
        # Don't fail the request if notification fails
    
    return status_record


@router.delete("/sample-status/{status_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample_status(status_id: int, db: Session = Depends(get_db_samples)):
    """Delete a status entry"""
    status_record = db.query(SampleStatus).filter(SampleStatus.id == status_id).first()
    if not status_record:
        raise HTTPException(status_code=404, detail="Status entry not found")

    db.delete(status_record)
    db.commit()
    return None


# =============================================================================
# STYLE VARIANT MATERIAL ENDPOINTS (NEW)
# =============================================================================

@router.post("/variant-materials", response_model=StyleVariantMaterialResponse, status_code=status.HTTP_201_CREATED)
def create_variant_material(material_data: StyleVariantMaterialCreate, db: Session = Depends(get_db_samples)):
    """Create a new style variant material"""
    try:
        new_material = StyleVariantMaterial(**material_data.model_dump())
        db.add(new_material)
        db.commit()
        db.refresh(new_material)
        return new_material
    except Exception as e:
        db.rollback()
        logger.error(f"Variant material creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create material: {str(e)}")


@router.get("/variant-materials", response_model=List[StyleVariantMaterialResponse])
def get_variant_materials(
    style_variant_id: Optional[int] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_samples)
):
    """Get all style variant materials"""
    query = db.query(StyleVariantMaterial)
    if style_variant_id:
        query = query.filter(StyleVariantMaterial.style_variant_id == style_variant_id)
    return query.order_by(StyleVariantMaterial.id).offset(skip).limit(limit).all()


@router.put("/variant-materials/{material_id}", response_model=StyleVariantMaterialResponse)
def update_variant_material(material_id: int, material_data: StyleVariantMaterialUpdate, db: Session = Depends(get_db_samples)):
    """Update a style variant material"""
    material = db.query(StyleVariantMaterial).filter(StyleVariantMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Variant material not found")

    for key, value in material_data.model_dump(exclude_unset=True).items():
        setattr(material, key, value)

    db.commit()
    db.refresh(material)
    return material


@router.delete("/variant-materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variant_material(material_id: int, db: Session = Depends(get_db_samples)):
    """Delete a style variant material"""
    material = db.query(StyleVariantMaterial).filter(StyleVariantMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Variant material not found")

    db.delete(material)
    db.commit()
    return None


# =============================================================================
# SMV CALCULATION ENDPOINTS (NEW - Per Style Variant)
# =============================================================================

def parse_hms_to_minutes(hms: str) -> float:
    """Convert HH:MM:SS to total minutes"""
    if not hms:
        return 0.0
    try:
        parts = hms.split(':')
        hours = int(parts[0])
        minutes = int(parts[1])
        seconds = int(parts[2])
        return hours * 60 + minutes + seconds / 60
    except (ValueError, IndexError, AttributeError):
        return 0.0


@router.post("/smv-calculations", response_model=SMVCalculationResponse, status_code=status.HTTP_201_CREATED)
def create_smv_calculation(smv_data: SMVCalculationCreate, db: Session = Depends(get_db_samples)):
    """Create a new SMV calculation"""
    try:
        data = smv_data.model_dump()

        # Auto-fill operation details from master
        if data.get('operation_id'):
            master_op = db.query(ManufacturingOperation).filter(
                ManufacturingOperation.id == data['operation_id']
            ).first()
            if master_op:
                data['operation_type'] = master_op.operation_type
                data['operation_name'] = master_op.operation_name

        # Calculate total duration in minutes
        if data.get('duration_hms'):
            base_duration = parse_hms_to_minutes(data['duration_hms'])
            num_ops = data.get('number_of_operations', 1)
            data['total_duration_minutes'] = base_duration * num_ops

        new_smv = SMVCalculation(**data)
        db.add(new_smv)
        db.commit()
        db.refresh(new_smv)
        return new_smv
    except Exception as e:
        db.rollback()
        logger.error(f"SMV calculation creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create SMV: {str(e)}")


@router.get("/smv-calculations", response_model=List[SMVCalculationResponse])
def get_smv_calculations(
    style_variant_id: Optional[int] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db_samples)
):
    """Get all SMV calculations"""
    query = db.query(SMVCalculation).options(joinedload(SMVCalculation.operation))
    if style_variant_id:
        query = query.filter(SMVCalculation.style_variant_id == style_variant_id)
    return query.order_by(SMVCalculation.id).offset(skip).limit(limit).all()


@router.get("/smv-calculations/totals/{style_variant_id}")
def get_smv_totals(style_variant_id: int, db: Session = Depends(get_db_samples)):
    """Get total SMV for a style variant"""
    smv_records = db.query(SMVCalculation).filter(
        SMVCalculation.style_variant_id == style_variant_id
    ).all()

    total_minutes = sum(r.total_duration_minutes or 0 for r in smv_records)
    total_hours = total_minutes / 60

    return {
        "style_variant_id": style_variant_id,
        "total_minutes": round(total_minutes, 2),
        "total_hours": round(total_hours, 2),
        "operations_count": len(smv_records)
    }


@router.put("/smv-calculations/{smv_id}", response_model=SMVCalculationResponse)
def update_smv_calculation(smv_id: int, smv_data: SMVCalculationUpdate, db: Session = Depends(get_db_samples)):
    """Update an SMV calculation"""
    smv = db.query(SMVCalculation).filter(SMVCalculation.id == smv_id).first()
    if not smv:
        raise HTTPException(status_code=404, detail="SMV calculation not found")

    data = smv_data.model_dump(exclude_unset=True)

    # Recalculate total duration if duration changes
    if 'duration_hms' in data or 'number_of_operations' in data:
        duration_hms = data.get('duration_hms', smv.duration_hms)
        num_ops = data.get('number_of_operations', smv.number_of_operations)
        if duration_hms:
            data['total_duration_minutes'] = parse_hms_to_minutes(duration_hms) * num_ops

    for key, value in data.items():
        setattr(smv, key, value)

    db.commit()
    db.refresh(smv)
    return smv


@router.delete("/smv-calculations/{smv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_smv_calculation(smv_id: int, db: Session = Depends(get_db_samples)):
    """Delete an SMV calculation"""
    smv = db.query(SMVCalculation).filter(SMVCalculation.id == smv_id).first()
    if not smv:
        raise HTTPException(status_code=404, detail="SMV calculation not found")

    db.delete(smv)
    db.commit()
    return None


# =============================================================================
# STYLE SUMMARY ENDPOINTS
# =============================================================================

@router.post("/styles", response_model=StyleSummaryResponse, status_code=status.HTTP_201_CREATED)
def create_style(style_data: StyleSummaryCreate, db: Session = Depends(get_db_samples)):
    """Create a new style summary"""
    new_style = StyleSummary(**style_data.model_dump())
    db.add(new_style)
    db.commit()
    db.refresh(new_style)
    return new_style


@router.get("/styles", response_model=List[StyleSummaryResponse])
def get_styles(
    buyer_id: Optional[int] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=1000, ge=1, le=10000),
    db: Session = Depends(get_db_samples)
):
    """Get all style summaries"""
    query = db.query(StyleSummary)
    if buyer_id:
        query = query.filter(StyleSummary.buyer_id == buyer_id)
    return query.order_by(StyleSummary.id.desc()).offset(skip).limit(limit).all()


@router.get("/styles/{style_id}", response_model=StyleSummaryResponse)
def get_style(style_id: int, db: Session = Depends(get_db_samples)):
    """Get a specific style summary"""
    style = db.query(StyleSummary).filter(StyleSummary.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")
    return style


@router.put("/styles/{style_id}", response_model=StyleSummaryResponse)
def update_style(style_id: int, style_data: StyleSummaryUpdate, db: Session = Depends(get_db_samples)):
    """Update a style summary"""
    style = db.query(StyleSummary).filter(StyleSummary.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")

    for key, value in style_data.model_dump(exclude_unset=True).items():
        setattr(style, key, value)

    db.commit()
    db.refresh(style)
    return style


@router.delete("/styles/{style_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_style(style_id: int, db: Session = Depends(get_db_samples)):
    """Delete a style summary"""
    style = db.query(StyleSummary).filter(StyleSummary.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")

    # Check for related samples
    samples_count = db.query(SampleRequest).filter(SampleRequest.style_id == style_id).count()
    if samples_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete style. {samples_count} sample(s) are using this style.")

    db.delete(style)
    db.commit()
    return None


# =============================================================================
# STYLE VARIANT ENDPOINTS
# =============================================================================

@router.post("/style-variants", response_model=StyleVariantResponse, status_code=status.HTTP_201_CREATED)
def create_style_variant(variant_data: StyleVariantCreate, db: Session = Depends(get_db_samples)):
    """Create a new style variant"""
    try:
        variant_dict = variant_data.model_dump(exclude={'color_parts'})
        new_variant = StyleVariant(**variant_dict)
        db.add(new_variant)
        db.commit()
        db.refresh(new_variant)

        # Add color parts if provided
        if variant_data.color_parts:
            for part_data in variant_data.color_parts:
                part = VariantColorPart(style_variant_id=new_variant.id, **part_data.model_dump())
                db.add(part)
            db.commit()
            db.refresh(new_variant)

        return new_variant
    except Exception as e:
        db.rollback()
        logger.error(f"Style variant creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create style variant")


@router.get("/style-variants", response_model=List[StyleVariantResponse])
def get_style_variants(
    style_summary_id: Optional[int] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=1000, ge=1, le=10000),
    db: Session = Depends(get_db_samples)
):
    """Get all style variants"""
    query = db.query(StyleVariant).options(
        joinedload(StyleVariant.style),
        joinedload(StyleVariant.color_parts)
    )
    if style_summary_id:
        query = query.filter(StyleVariant.style_summary_id == style_summary_id)
    return query.order_by(StyleVariant.id.desc()).offset(skip).limit(limit).all()


@router.get("/style-variants/{variant_id}", response_model=StyleVariantResponse)
def get_style_variant(variant_id: int, db: Session = Depends(get_db_samples)):
    """Get a specific style variant"""
    variant = db.query(StyleVariant).options(
        joinedload(StyleVariant.style),
        joinedload(StyleVariant.color_parts)
    ).filter(StyleVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Style variant not found")
    return variant


@router.put("/style-variants/{variant_id}", response_model=StyleVariantResponse)
def update_style_variant(variant_id: int, variant_data: StyleVariantUpdate, db: Session = Depends(get_db_samples)):
    """Update a style variant"""
    variant = db.query(StyleVariant).filter(StyleVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Style variant not found")

    data = variant_data.model_dump(exclude_unset=True, exclude={'color_parts'})
    for key, value in data.items():
        setattr(variant, key, value)

    # Update color parts if provided
    if variant_data.color_parts is not None:
        # Delete existing parts
        db.query(VariantColorPart).filter(VariantColorPart.style_variant_id == variant_id).delete()
        # Add new parts
        for part_data in variant_data.color_parts:
            part = VariantColorPart(style_variant_id=variant_id, **part_data.model_dump())
            db.add(part)

    db.commit()
    db.refresh(variant)
    return variant


@router.delete("/style-variants/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_style_variant(variant_id: int, db: Session = Depends(get_db_samples)):
    """Delete a style variant"""
    variant = db.query(StyleVariant).filter(StyleVariant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Style variant not found")

    db.delete(variant)
    db.commit()
    return None


# =============================================================================
# GARMENT COLOR & SIZE ENDPOINTS
# =============================================================================

@router.get("/colors", response_model=List[GarmentColorResponse])
def get_garment_colors(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db_samples)
):
    """Get all garment colors"""
    query = db.query(GarmentColor)
    if is_active is not None:
        query = query.filter(GarmentColor.is_active == is_active)
    return query.order_by(GarmentColor.color_name).all()


@router.post("/colors", response_model=GarmentColorResponse, status_code=status.HTTP_201_CREATED)
def create_garment_color(color_data: GarmentColorCreate, db: Session = Depends(get_db_samples)):
    """Create a new garment color"""
    new_color = GarmentColor(**color_data.model_dump())
    db.add(new_color)
    db.commit()
    db.refresh(new_color)
    return new_color


@router.put("/colors/{color_id}", response_model=GarmentColorResponse)
def update_garment_color(color_id: int, color_data: GarmentColorUpdate, db: Session = Depends(get_db_samples)):
    """Update a garment color"""
    color = db.query(GarmentColor).filter(GarmentColor.id == color_id).first()
    if not color:
        raise HTTPException(status_code=404, detail="Color not found")

    for key, value in color_data.model_dump(exclude_unset=True).items():
        setattr(color, key, value)

    db.commit()
    db.refresh(color)
    return color


@router.delete("/colors/{color_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_garment_color(color_id: int, db: Session = Depends(get_db_samples)):
    """Delete a garment color"""
    color = db.query(GarmentColor).filter(GarmentColor.id == color_id).first()
    if not color:
        raise HTTPException(status_code=404, detail="Color not found")

    db.delete(color)
    db.commit()
    return None


@router.get("/sizes", response_model=List[GarmentSizeResponse])
def get_garment_sizes(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db_samples)
):
    """Get all garment sizes"""
    query = db.query(GarmentSize)
    if is_active is not None:
        query = query.filter(GarmentSize.is_active == is_active)
    return query.order_by(GarmentSize.sort_order).all()


@router.post("/sizes", response_model=GarmentSizeResponse, status_code=status.HTTP_201_CREATED)
def create_garment_size(size_data: GarmentSizeCreate, db: Session = Depends(get_db_samples)):
    """Create a new garment size"""
    new_size = GarmentSize(**size_data.model_dump())
    db.add(new_size)
    db.commit()
    db.refresh(new_size)
    return new_size


@router.put("/sizes/{size_id}", response_model=GarmentSizeResponse)
def update_garment_size(size_id: int, size_data: GarmentSizeUpdate, db: Session = Depends(get_db_samples)):
    """Update a garment size"""
    size = db.query(GarmentSize).filter(GarmentSize.id == size_id).first()
    if not size:
        raise HTTPException(status_code=404, detail="Size not found")

    for key, value in size_data.model_dump(exclude_unset=True).items():
        setattr(size, key, value)

    db.commit()
    db.refresh(size)
    return size


@router.delete("/sizes/{size_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_garment_size(size_id: int, db: Session = Depends(get_db_samples)):
    """Delete a garment size"""
    size = db.query(GarmentSize).filter(GarmentSize.id == size_id).first()
    if not size:
        raise HTTPException(status_code=404, detail="Size not found")

    db.delete(size)
    db.commit()
    return None


# =============================================================================
# LEGACY ENDPOINTS (Deprecated - kept for backward compatibility)
# =============================================================================

# Legacy Required Material endpoints
@router.post("/required-materials", response_model=RequiredMaterialResponse, status_code=status.HTTP_201_CREATED)
def create_required_material(material_data: RequiredMaterialCreate, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Create a new required material - use /variant-materials instead"""
    new_material = RequiredMaterial(**material_data.model_dump())
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return new_material


@router.get("/required-materials", response_model=List[RequiredMaterialResponse])
def get_required_materials(style_variant_id: Optional[int] = None, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Get all required materials - use /variant-materials instead"""
    query = db.query(RequiredMaterial)
    if style_variant_id:
        query = query.filter(RequiredMaterial.style_variant_id == style_variant_id)
    return query.order_by(RequiredMaterial.id.desc()).all()


@router.put("/required-materials/{material_id}", response_model=RequiredMaterialResponse)
def update_required_material(material_id: int, material_data: RequiredMaterialUpdate, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Update a required material"""
    material = db.query(RequiredMaterial).filter(RequiredMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Required material not found")

    for key, value in material_data.model_dump(exclude_unset=True).items():
        setattr(material, key, value)

    db.commit()
    db.refresh(material)
    return material


@router.delete("/required-materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_required_material(material_id: int, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Delete a required material"""
    material = db.query(RequiredMaterial).filter(RequiredMaterial.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Required material not found")

    db.delete(material)
    db.commit()
    return None


# Legacy TNA endpoints
@router.post("/tna", response_model=SampleTNAResponse, status_code=status.HTTP_201_CREATED)
def create_tna(tna_data: SampleTNACreate, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Create a new TNA record - use /sample-tna instead"""
    new_tna = SampleTNA(**tna_data.model_dump())
    db.add(new_tna)
    db.commit()
    db.refresh(new_tna)
    return new_tna


@router.get("/tna", response_model=List[SampleTNAResponse])
def get_tna_records(skip: int = 0, limit: Optional[int] = None, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Get all TNA records - use /sample-tna instead"""
    return db.query(SampleTNA).order_by(SampleTNA.id.desc()).offset(skip).limit(limit).all()


# Legacy Plan endpoints
@router.post("/plan", response_model=SamplePlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(plan_data: SamplePlanCreate, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Create a new Plan record - use /sample-plans instead"""
    existing = db.query(SamplePlan).filter(SamplePlan.sample_request_id == plan_data.sample_request_id).first()
    if existing:
        for key, value in plan_data.model_dump().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_plan = SamplePlan(**plan_data.model_dump())
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)
        return new_plan


@router.get("/plan", response_model=List[SamplePlanResponse])
def get_plan_records(skip: int = 0, limit: Optional[int] = None, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Get all Plan records - use /sample-plans instead"""
    return db.query(SamplePlan).order_by(SamplePlan.id.desc()).offset(skip).limit(limit).all()


# Legacy Operation Type endpoints
@router.post("/operations-master", response_model=OperationTypeResponse, status_code=status.HTTP_201_CREATED)
def create_operation_type(op_data: OperationTypeCreate, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Create operation type - use /manufacturing-operations instead"""
    new_op = OperationType(**op_data.model_dump())
    db.add(new_op)
    db.commit()
    db.refresh(new_op)
    return new_op


@router.get("/operations-master", response_model=List[OperationTypeResponse])
def get_operation_types(skip: int = 0, limit: Optional[int] = None, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Get all operation types - use /manufacturing-operations instead"""
    return db.query(OperationType).order_by(OperationType.id.desc()).offset(skip).limit(limit).all()


# Legacy SMV endpoints
@router.get("/smv", response_model=List[SMVCalculationResponse])
def get_smv_list(skip: int = 0, limit: Optional[int] = None, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Get all SMV calculations - use /smv-calculations instead"""
    return db.query(SMVCalculation).order_by(SMVCalculation.id.desc()).offset(skip).limit(limit).all()


# Legacy Sample endpoints (using old Sample model)
@router.post("/", response_model=SampleResponse, status_code=status.HTTP_201_CREATED)
def create_sample(sample_data: SampleCreate, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Create a new sample - use /requests instead"""
    try:
        new_sample = Sample(**sample_data.model_dump())
        db.add(new_sample)
        db.commit()
        db.refresh(new_sample)
        return new_sample
    except Exception as e:
        db.rollback()
        logger.error(f"Sample creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create sample")


@router.get("/", response_model=List[SampleResponse])
def get_samples(
    buyer_id: Optional[int] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10000, ge=1, le=10000),
    db: Session = Depends(get_db_samples)
):
    """[DEPRECATED] Get all samples - use /requests instead"""
    query = db.query(Sample)
    if buyer_id:
        query = query.filter(Sample.buyer_id == buyer_id)
    return query.order_by(Sample.id.desc()).offset(skip).limit(limit).all()


@router.get("/by-sample-id/{sample_id_str}", response_model=SampleResponse)
def get_sample_by_sample_id(sample_id_str: str, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Get a sample by its sample_id - use /requests/by-sample-id instead"""
    sample = db.query(Sample).filter(Sample.sample_id == sample_id_str).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    return sample


@router.put("/{sample_id}", response_model=SampleResponse)
def update_sample(sample_id: int, sample_data: SampleUpdate, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Update a sample - use /requests instead"""
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    if sample_data.submit_status == "Reject and Request for remake":
        sample.round += 1

    for key, value in sample_data.model_dump(exclude_unset=True).items():
        setattr(sample, key, value)

    db.commit()
    db.refresh(sample)
    return sample


@router.delete("/{sample_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample(sample_id: int, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Delete a sample - use /requests instead"""
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    db.delete(sample)
    db.commit()
    return None


@router.get("/{sample_id}", response_model=SampleResponse)
def get_sample(sample_id: int, db: Session = Depends(get_db_samples)):
    """[DEPRECATED] Get a specific sample by ID - use /requests instead"""
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    return sample
