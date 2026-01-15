"""
Workflow API routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime

from core.database import get_db_samples
from core.dependencies import get_current_username
from ..services.workflow_service import WorkflowService, WorkflowTemplateService
from ..schemas.workflow import (
    CreateWorkflowRequest, UpdateWorkflowRequest, WorkflowResponse,
    WorkflowFilters, UpdateCardStatusRequest, UpdateCardAssigneeRequest,
    CardCommentCreate, CardCommentResponse, CardAttachmentResponse,
    WorkflowTemplateResponse, WorkflowTemplateCreate, WorkflowTemplateUpdate,
    WorkflowCardResponse
)

router = APIRouter()


# Workflow statistics endpoint (must be before /workflows/{workflow_id})
@router.get("/workflows/statistics")
async def get_workflow_statistics(
    db: Session = Depends(get_db_samples)
):
    """Get workflow statistics for dashboard (Requirements 6.2, 6.4, 9.1)"""
    try:
        service = WorkflowService(db)
        stats = service.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )


# Workflow endpoints
@router.post("/workflows", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_data: CreateWorkflowRequest,
    db: Session = Depends(get_db_samples),
    created_by: str = Depends(get_current_username)
):
    """Create a new workflow"""
    try:
        service = WorkflowService(db)
        workflow = service.create_workflow(workflow_data, created_by)
        return workflow
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workflow: {str(e)}"
        )


@router.get("/workflows/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: int,
    db: Session = Depends(get_db_samples)
):
    """Get a workflow by ID"""
    service = WorkflowService(db)
    workflow = service.get_workflow(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    return workflow


@router.get("/workflows", response_model=List[WorkflowResponse])
async def get_workflows(
    workflow_status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    priority: Optional[str] = None,
    created_by: Optional[str] = None,
    sample_request_id: Optional[int] = None,
    due_date_from: Optional[datetime] = None,
    due_date_to: Optional[datetime] = None,
    limit: Optional[int] = 100,
    db: Session = Depends(get_db_samples)
):
    """Get workflows with optional filtering"""
    try:
        filters = WorkflowFilters(
            workflow_status=workflow_status,
            assigned_to=assigned_to,
            priority=priority,
            created_by=created_by,
            sample_request_id=sample_request_id,
            due_date_from=due_date_from,
            due_date_to=due_date_to,
            limit=limit
        )
        
        service = WorkflowService(db)
        workflows = service.get_workflows(filters)
        return workflows
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflows: {str(e)}"
        )


@router.put("/workflows/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: int,
    update_data: UpdateWorkflowRequest,
    db: Session = Depends(get_db_samples)
):
    """Update a workflow"""
    service = WorkflowService(db)
    workflow = service.update_workflow(workflow_id, update_data)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    return workflow


@router.delete("/workflows/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db_samples)
):
    """Delete a workflow"""
    service = WorkflowService(db)
    success = service.delete_workflow(workflow_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )


@router.get("/workflows/{workflow_id}/cards", response_model=List[WorkflowCardResponse])
async def get_workflow_cards(
    workflow_id: int,
    db: Session = Depends(get_db_samples)
):
    """Get all cards for a workflow"""
    service = WorkflowService(db)
    
    # Verify workflow exists
    workflow = service.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    cards = service.get_workflow_cards(workflow_id)
    return cards


# Card management endpoints
@router.put("/workflow-cards/{card_id}/status", response_model=WorkflowCardResponse)
async def update_card_status(
    card_id: int,
    status_data: UpdateCardStatusRequest,
    db: Session = Depends(get_db_samples),
    updated_by: str = Depends(get_current_username)
):
    """Update card status"""
    service = WorkflowService(db)
    card = service.update_card_status(card_id, status_data, updated_by)
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    return card


@router.put("/workflow-cards/{card_id}/assignee", response_model=WorkflowCardResponse)
async def update_card_assignee(
    card_id: int,
    assignee_data: UpdateCardAssigneeRequest,
    db: Session = Depends(get_db_samples)
):
    """Update card assignee"""
    service = WorkflowService(db)
    card = service.update_card_assignee(card_id, assignee_data)
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    return card


@router.post("/workflow-cards/{card_id}/comments", response_model=CardCommentResponse, status_code=status.HTTP_201_CREATED)
async def add_card_comment(
    card_id: int,
    comment_data: CardCommentCreate,
    db: Session = Depends(get_db_samples),
    commented_by: str = Depends(get_current_username)
):
    """Add a comment to a card"""
    service = WorkflowService(db)
    comment = service.add_card_comment(card_id, comment_data, commented_by)
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    return comment


@router.post("/workflow-cards/{card_id}/attachments", response_model=CardAttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_card_attachment(
    card_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db_samples),
    uploaded_by: str = Depends(get_current_username)
):
    """Upload an attachment to a card"""
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads/workflow_attachments"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create attachment record
        service = WorkflowService(db)
        attachment = service.upload_card_attachment(
            card_id=card_id,
            file_name=file.filename,
            file_url=file_path,
            file_size=len(content),
            uploaded_by=uploaded_by
        )
        
        if not attachment:
            # Clean up file if card not found
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Card not found"
            )
        
        return attachment
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload attachment: {str(e)}"
        )


# Workflow template endpoints
@router.get("/workflow-templates", response_model=List[WorkflowTemplateResponse])
async def get_workflow_templates(
    template_name: Optional[str] = None,
    db: Session = Depends(get_db_samples)
):
    """Get workflow templates"""
    service = WorkflowTemplateService(db)
    templates = service.get_templates(template_name)
    return templates


@router.post("/workflow-templates", response_model=WorkflowTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow_template(
    template_data: WorkflowTemplateCreate,
    db: Session = Depends(get_db_samples)
):
    """Create a new workflow template"""
    try:
        service = WorkflowTemplateService(db)
        template = service.create_template(template_data.dict())
        return template
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create template: {str(e)}"
        )


@router.put("/workflow-templates/{template_id}", response_model=WorkflowTemplateResponse)
async def update_workflow_template(
    template_id: int,
    template_data: WorkflowTemplateUpdate,
    db: Session = Depends(get_db_samples)
):
    """Update a workflow template"""
    service = WorkflowTemplateService(db)
    template = service.update_template(template_id, template_data.dict(exclude_unset=True))
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    return template


@router.delete("/workflow-templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow_template(
    template_id: int,
    db: Session = Depends(get_db_samples)
):
    """Delete a workflow template"""
    service = WorkflowTemplateService(db)
    success = service.delete_template(template_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )