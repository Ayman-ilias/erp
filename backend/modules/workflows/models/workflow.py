"""
Workflow models for ClickUp-style sample workflow management
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import BaseSamples


class SampleWorkflow(BaseSamples):
    __tablename__ = "sample_workflows"

    id = Column(Integer, primary_key=True, index=True)
    sample_request_id = Column(Integer, nullable=False, index=True)
    workflow_name = Column(String(255), nullable=False)
    workflow_status = Column(String(50), default='active', index=True)
    created_by = Column(String(100), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    priority = Column(String(20), default='medium')
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)

    # Relationships
    cards = relationship("WorkflowCard", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowCard(BaseSamples):
    __tablename__ = "workflow_cards"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("sample_workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    stage_name = Column(String(100), nullable=False)
    stage_order = Column(Integer, nullable=False, index=True)
    card_title = Column(String(255), nullable=False)
    card_description = Column(Text, nullable=True)
    assigned_to = Column(String(100), nullable=True, index=True)
    card_status = Column(String(50), default='pending', index=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    blocked_reason = Column(Text, nullable=True)

    # Relationships
    workflow = relationship("SampleWorkflow", back_populates="cards")
    status_history = relationship("CardStatusHistory", back_populates="card", cascade="all, delete-orphan")
    comments = relationship("CardComment", back_populates="card", cascade="all, delete-orphan")
    attachments = relationship("CardAttachment", back_populates="card", cascade="all, delete-orphan")


class CardStatusHistory(BaseSamples):
    __tablename__ = "card_status_history"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("workflow_cards.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    updated_by = Column(String(100), nullable=False)
    update_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    card = relationship("WorkflowCard", back_populates="status_history")


class WorkflowTemplate(BaseSamples):
    __tablename__ = "workflow_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_name = Column(String(100), nullable=False, index=True)
    stage_name = Column(String(100), nullable=False)
    stage_order = Column(Integer, nullable=False, index=True)
    stage_description = Column(Text, nullable=True)
    default_assignee_role = Column(String(50), nullable=True)
    estimated_duration_hours = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CardComment(BaseSamples):
    __tablename__ = "card_comments"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("workflow_cards.id", ondelete="CASCADE"), nullable=False, index=True)
    comment_text = Column(Text, nullable=False)
    commented_by = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    card = relationship("WorkflowCard", back_populates="comments")


class CardAttachment(BaseSamples):
    __tablename__ = "card_attachments"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("workflow_cards.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)
    uploaded_by = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    card = relationship("WorkflowCard", back_populates="attachments")