"""
Workflow schemas for API request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class WorkflowStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class CardStatus(str, Enum):
    PENDING = "pending"
    READY = "ready"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# Base schemas
class WorkflowTemplateBase(BaseModel):
    template_name: str = Field(..., max_length=100)
    stage_name: str = Field(..., max_length=100)
    stage_order: int = Field(..., ge=1)
    stage_description: Optional[str] = None
    default_assignee_role: Optional[str] = Field(None, max_length=50)
    estimated_duration_hours: Optional[int] = Field(None, ge=1)
    is_active: bool = True


class WorkflowTemplateCreate(WorkflowTemplateBase):
    pass


class WorkflowTemplateUpdate(BaseModel):
    template_name: Optional[str] = Field(None, max_length=100)
    stage_name: Optional[str] = Field(None, max_length=100)
    stage_order: Optional[int] = Field(None, ge=1)
    stage_description: Optional[str] = None
    default_assignee_role: Optional[str] = Field(None, max_length=50)
    estimated_duration_hours: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None


class WorkflowTemplateResponse(WorkflowTemplateBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Workflow schemas
class CreateWorkflowRequest(BaseModel):
    sample_request_id: int = Field(..., ge=1)
    workflow_name: str = Field(..., min_length=5, max_length=255)
    assigned_designer: Optional[str] = Field(None, max_length=50)
    assigned_programmer: Optional[str] = Field(None, max_length=50)
    assigned_supervisor_knitting: Optional[str] = Field(None, max_length=50)
    assigned_supervisor_finishing: Optional[str] = Field(None, max_length=50)
    required_knitting_machine_id: Optional[int] = Field(None, ge=1)
    delivery_plan_date: Optional[datetime] = None
    priority: Priority = Priority.MEDIUM


class UpdateWorkflowRequest(BaseModel):
    workflow_name: Optional[str] = Field(None, min_length=5, max_length=255)
    workflow_status: Optional[WorkflowStatus] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None


class CardCommentBase(BaseModel):
    comment_text: str = Field(..., min_length=1)


class CardCommentCreate(CardCommentBase):
    pass


class CardCommentResponse(CardCommentBase):
    id: int
    card_id: int
    commented_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CardAttachmentResponse(BaseModel):
    id: int
    card_id: int
    file_name: str
    file_url: str
    file_size: Optional[int]
    uploaded_by: str
    created_at: datetime

    class Config:
        from_attributes = True


class CardStatusHistoryResponse(BaseModel):
    id: int
    card_id: int
    previous_status: Optional[str]
    new_status: str
    updated_by: str
    update_reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class WorkflowCardResponse(BaseModel):
    id: int
    workflow_id: int
    stage_name: str
    stage_order: int
    card_title: str
    card_description: Optional[str]
    assigned_to: Optional[str]
    card_status: CardStatus
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    blocked_reason: Optional[str]
    comments: List[CardCommentResponse] = []
    attachments: List[CardAttachmentResponse] = []

    class Config:
        from_attributes = True


class SampleRequestInfo(BaseModel):
    sample_id: str
    sample_name: str
    buyer_name: str


class WorkflowResponse(BaseModel):
    id: int
    sample_request_id: int
    workflow_name: str
    workflow_status: WorkflowStatus
    created_by: str
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    priority: Priority
    due_date: Optional[datetime]
    cards: List[WorkflowCardResponse] = []
    sample_request: Optional[SampleRequestInfo] = None

    class Config:
        from_attributes = True


class UpdateCardStatusRequest(BaseModel):
    status: CardStatus
    reason: Optional[str] = Field(None, max_length=500)


class UpdateCardAssigneeRequest(BaseModel):
    assignee: str = Field(..., max_length=100)


class WorkflowFilters(BaseModel):
    workflow_status: Optional[WorkflowStatus] = None
    assigned_to: Optional[str] = None
    priority: Optional[Priority] = None
    created_by: Optional[str] = None
    sample_request_id: Optional[int] = None
    due_date_from: Optional[datetime] = None
    due_date_to: Optional[datetime] = None
    limit: Optional[int] = Field(None, ge=1, le=1000)