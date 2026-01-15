"""
Workflow service layer for business logic
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

# Helper function to get current UTC time (replaces deprecated utc_now())
def utc_now() -> datetime:
    """Get current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)

from ..models.workflow import (
    SampleWorkflow, WorkflowCard, CardStatusHistory,
    WorkflowTemplate, CardComment, CardAttachment
)
from ..schemas.workflow import (
    CreateWorkflowRequest, UpdateWorkflowRequest, WorkflowFilters,
    UpdateCardStatusRequest, UpdateCardAssigneeRequest, CardCommentCreate
)
from migrations.seed_workflow_templates import get_workflow_templates
from core.notification_service import send_notification_to_user, send_notification_to_department
from core.logging import setup_logging

logger = setup_logging()


class WorkflowService:
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_workflow(self, workflow_data: CreateWorkflowRequest, created_by: str) -> SampleWorkflow:
        """Create a new workflow with cards based on templates"""
        
        # Get workflow templates
        templates = get_workflow_templates('sample_development')
        if not templates:
            raise ValueError("No workflow templates found for sample_development")
        
        # Create workflow
        workflow = SampleWorkflow(
            sample_request_id=workflow_data.sample_request_id,
            workflow_name=workflow_data.workflow_name,
            workflow_status='active',
            created_by=created_by,
            priority=workflow_data.priority.value,
            due_date=workflow_data.delivery_plan_date
        )
        
        self.db.add(workflow)
        self.db.flush()  # Get the workflow ID
        
        # Create cards based on templates
        for template in templates:
            assigned_to = self._get_assignee_for_stage(
                template['stage_name'], 
                workflow_data
            )
            
            # Requirements 1.4, 5.1: First stage is pending, others are waiting
            if template['stage_order'] == 1:
                card_status = 'pending'
            else:
                card_status = 'ready'  # Using 'ready' as waiting status since it's not in enum
            
            card = WorkflowCard(
                workflow_id=workflow.id,
                stage_name=template['stage_name'],
                stage_order=template['stage_order'],
                card_title=template['stage_name'],
                card_description=template['stage_description'],
                assigned_to=assigned_to,
                card_status=card_status,
                due_date=workflow_data.delivery_plan_date
            )
            
            self.db.add(card)
        
        self.db.commit()
        self.db.refresh(workflow)

        # Send notifications to assigned users (Requirements 8.1)
        self._send_workflow_created_notifications(workflow)

        return workflow

    def _send_workflow_created_notifications(self, workflow: SampleWorkflow):
        """Send notifications to users assigned to workflow cards"""
        try:
            for card in workflow.cards:
                if card.assigned_to:
                    send_notification_to_department(
                        title=f"New Task Assignment: {card.stage_name}",
                        message=f"You have been assigned to '{card.card_title}' in workflow '{workflow.workflow_name}'",
                        target_department="sample_department",
                        notification_type="info",
                        related_entity_type="workflow_card",
                        related_entity_id=str(card.id)
                    )
            logger.info(f"Sent workflow creation notifications for workflow {workflow.id}")
        except Exception as e:
            logger.error(f"Error sending workflow notifications: {e}")

    def get_workflow(self, workflow_id: int) -> Optional[SampleWorkflow]:
        """Get a workflow by ID with all related data"""
        return self.db.query(SampleWorkflow).filter(
            SampleWorkflow.id == workflow_id
        ).first()
    
    def get_workflows(self, filters: WorkflowFilters) -> List[SampleWorkflow]:
        """Get workflows with optional filtering"""
        query = self.db.query(SampleWorkflow)
        
        # Apply filters
        if filters.workflow_status:
            query = query.filter(SampleWorkflow.workflow_status == filters.workflow_status.value)
        
        if filters.created_by:
            query = query.filter(SampleWorkflow.created_by == filters.created_by)
        
        if filters.priority:
            query = query.filter(SampleWorkflow.priority == filters.priority.value)
        
        if filters.sample_request_id:
            query = query.filter(SampleWorkflow.sample_request_id == filters.sample_request_id)
        
        if filters.due_date_from:
            query = query.filter(SampleWorkflow.due_date >= filters.due_date_from)
        
        if filters.due_date_to:
            query = query.filter(SampleWorkflow.due_date <= filters.due_date_to)
        
        if filters.assigned_to:
            # Filter by workflows that have cards assigned to the user
            query = query.join(WorkflowCard).filter(
                WorkflowCard.assigned_to == filters.assigned_to
            )
        
        # Order by creation date (newest first)
        query = query.order_by(SampleWorkflow.created_at.desc())
        
        # Apply limit
        if filters.limit:
            query = query.limit(filters.limit)
        
        return query.all()
    
    def update_workflow(self, workflow_id: int, update_data: UpdateWorkflowRequest) -> Optional[SampleWorkflow]:
        """Update a workflow"""
        workflow = self.db.query(SampleWorkflow).filter(
            SampleWorkflow.id == workflow_id
        ).first()
        
        if not workflow:
            return None
        
        # Update fields
        if update_data.workflow_name:
            workflow.workflow_name = update_data.workflow_name
        
        if update_data.workflow_status:
            workflow.workflow_status = update_data.workflow_status.value
            if update_data.workflow_status.value == 'completed':
                workflow.completed_at = utc_now()
        
        if update_data.priority:
            workflow.priority = update_data.priority.value
        
        if update_data.due_date is not None:
            workflow.due_date = update_data.due_date
        
        workflow.updated_at = utc_now()
        
        self.db.commit()
        self.db.refresh(workflow)
        return workflow
    
    def delete_workflow(self, workflow_id: int) -> bool:
        """Delete a workflow"""
        workflow = self.db.query(SampleWorkflow).filter(
            SampleWorkflow.id == workflow_id
        ).first()
        
        if not workflow:
            return False
        
        self.db.delete(workflow)
        self.db.commit()
        return True
    
    def get_workflow_cards(self, workflow_id: int) -> List[WorkflowCard]:
        """Get all cards for a workflow"""
        return self.db.query(WorkflowCard).filter(
            WorkflowCard.workflow_id == workflow_id
        ).order_by(WorkflowCard.stage_order).all()
    
    def update_card_status(self, card_id: int, status_data: UpdateCardStatusRequest, updated_by: str) -> Optional[WorkflowCard]:
        """Update card status and create history record"""
        card = self.db.query(WorkflowCard).filter(
            WorkflowCard.id == card_id
        ).first()
        
        if not card:
            return None
        
        # Validate stage sequence (Requirements 5.3)
        if not self.validate_stage_sequence(card_id, status_data.status.value):
            raise ValueError("Cannot update card status: prerequisite stages not completed")
        
        # Store previous status
        previous_status = card.card_status
        
        # Update card
        card.card_status = status_data.status.value
        if status_data.status.value == 'completed':
            card.completed_at = utc_now()
            # Auto-activate next stage when current stage is completed (Requirements 2.3, 5.2)
            self._activate_next_stage(card.workflow_id, card.stage_order)
        elif status_data.status.value == 'blocked':
            card.blocked_reason = status_data.reason
            # Prevent subsequent stages when blocked (Requirements 5.4)
            self.check_blocking_prevention(card.workflow_id)
        else:
            card.blocked_reason = None
        
        card.updated_at = utc_now()
        
        # Create status history record
        history = CardStatusHistory(
            card_id=card.id,
            previous_status=previous_status,
            new_status=status_data.status.value,
            updated_by=updated_by,
            update_reason=status_data.reason
        )
        
        self.db.add(history)
        
        # Check if workflow should be completed
        self._check_workflow_completion(card.workflow_id)
        
        # Sync workflow status with sample request (Requirements 10.2)
        self._sync_sample_status(card.workflow_id)
        
        self.db.commit()
        self.db.refresh(card)

        # Send status change notifications (Requirements 8.2)
        self._send_status_change_notification(card, previous_status, status_data.status.value)

        return card

    def _send_status_change_notification(self, card: WorkflowCard, previous_status: str, new_status: str):
        """Send notifications for card status changes"""
        try:
            notification_type = "info"
            title = f"Task Status Updated: {card.stage_name}"
            message = f"'{card.card_title}' status changed from {previous_status} to {new_status}"

            if new_status == "blocked":
                notification_type = "warning"
                title = f"Task Blocked: {card.stage_name}"
                message = f"'{card.card_title}' has been blocked. Reason: {card.blocked_reason or 'Not specified'}"
            elif new_status == "completed":
                notification_type = "success"
                title = f"Task Completed: {card.stage_name}"
                message = f"'{card.card_title}' has been completed"

            send_notification_to_department(
                title=title,
                message=message,
                target_department="sample_department",
                notification_type=notification_type,
                related_entity_type="workflow_card",
                related_entity_id=str(card.id)
            )
            logger.info(f"Sent status change notification for card {card.id}")
        except Exception as e:
            logger.error(f"Error sending status change notification: {e}")

    def update_card_assignee(self, card_id: int, assignee_data: UpdateCardAssigneeRequest) -> Optional[WorkflowCard]:
        """Update card assignee"""
        card = self.db.query(WorkflowCard).filter(
            WorkflowCard.id == card_id
        ).first()

        if not card:
            return None

        previous_assignee = card.assigned_to
        card.assigned_to = assignee_data.assignee
        card.updated_at = utc_now()

        self.db.commit()
        self.db.refresh(card)

        # Send assignee change notification (Requirements 8.1)
        if assignee_data.assignee and assignee_data.assignee != previous_assignee:
            self._send_assignee_notification(card)

        return card

    def _send_assignee_notification(self, card: WorkflowCard):
        """Send notification when card assignee changes"""
        try:
            send_notification_to_department(
                title=f"Task Assignment: {card.stage_name}",
                message=f"You have been assigned to '{card.card_title}'",
                target_department="sample_department",
                notification_type="info",
                related_entity_type="workflow_card",
                related_entity_id=str(card.id)
            )
            logger.info(f"Sent assignee notification for card {card.id}")
        except Exception as e:
            logger.error(f"Error sending assignee notification: {e}")
    
    def add_card_comment(self, card_id: int, comment_data: CardCommentCreate, commented_by: str) -> Optional[CardComment]:
        """Add a comment to a card"""
        # Verify card exists
        card = self.db.query(WorkflowCard).filter(
            WorkflowCard.id == card_id
        ).first()
        
        if not card:
            return None
        
        comment = CardComment(
            card_id=card_id,
            comment_text=comment_data.comment_text,
            commented_by=commented_by
        )
        
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return comment
    
    def upload_card_attachment(self, card_id: int, file_name: str, file_url: str, file_size: int, uploaded_by: str) -> Optional[CardAttachment]:
        """Add an attachment to a card"""
        # Verify card exists
        card = self.db.query(WorkflowCard).filter(
            WorkflowCard.id == card_id
        ).first()
        
        if not card:
            return None
        
        attachment = CardAttachment(
            card_id=card_id,
            file_name=file_name,
            file_url=file_url,
            file_size=file_size,
            uploaded_by=uploaded_by
        )
        
        self.db.add(attachment)
        self.db.commit()
        self.db.refresh(attachment)
        return attachment
    
    def _get_assignee_for_stage(self, stage_name: str, workflow_data: CreateWorkflowRequest) -> Optional[str]:
        """Map stage names to assignees from workflow data"""
        stage_assignee_map = {
            'Assign Designer': workflow_data.assigned_designer,
            'Programming': workflow_data.assigned_programmer,
            'Supervisor Knitting': workflow_data.assigned_supervisor_knitting,
            'Supervisor Finishing': workflow_data.assigned_supervisor_finishing
        }
        return stage_assignee_map.get(stage_name)
    
    def _activate_next_stage(self, workflow_id: int, completed_stage_order: int):
        """Activate the next stage when current stage is completed (Requirements 2.3, 5.2)"""
        # Find the next stage card
        next_card = self.db.query(WorkflowCard).filter(
            and_(
                WorkflowCard.workflow_id == workflow_id,
                WorkflowCard.stage_order == completed_stage_order + 1
            )
        ).first()
        
        if next_card and next_card.card_status == 'ready':
            # Check if all previous stages are completed (Requirements 5.3)
            previous_cards = self.db.query(WorkflowCard).filter(
                and_(
                    WorkflowCard.workflow_id == workflow_id,
                    WorkflowCard.stage_order < next_card.stage_order
                )
            ).all()
            
            # Only activate if all previous stages are completed
            if all(card.card_status == 'completed' for card in previous_cards):
                next_card.card_status = 'pending'
                next_card.updated_at = utc_now()
                
                # Create status history for auto-activation
                history = CardStatusHistory(
                    card_id=next_card.id,
                    previous_status='ready',
                    new_status='pending',
                    updated_by='system',
                    update_reason='Auto-activated after previous stage completion'
                )
                self.db.add(history)
    
    def _check_workflow_completion(self, workflow_id: int):
        """Check if all cards are completed and update workflow status (Requirements 5.5, 8.5)"""
        cards = self.db.query(WorkflowCard).filter(
            WorkflowCard.workflow_id == workflow_id
        ).all()
        
        if all(card.card_status == 'completed' for card in cards):
            workflow = self.db.query(SampleWorkflow).filter(
                SampleWorkflow.id == workflow_id
            ).first()
            
            if workflow and workflow.workflow_status != 'completed':
                workflow.workflow_status = 'completed'
                workflow.completed_at = utc_now()
                workflow.updated_at = utc_now()
                
                # Send completion notification (Requirements 8.5)
                try:
                    send_notification_to_department(
                        title=f"Workflow Completed: {workflow.workflow_name}",
                        message=f"All stages of workflow '{workflow.workflow_name}' (ID: {workflow.id}) have been completed successfully.",
                        target_department="sample_department",
                        notification_type="success",
                        related_entity_type="workflow",
                        related_entity_id=str(workflow.id)
                    )
                    logger.info(f"Sent workflow completion notification for workflow {workflow.id}")
                except Exception as e:
                    logger.error(f"Error sending workflow completion notification: {e}")
    
    def validate_stage_sequence(self, card_id: int, target_status: str) -> bool:
        """Validate that stage sequence is maintained (Requirements 5.3)"""
        card = self.db.query(WorkflowCard).filter(
            WorkflowCard.id == card_id
        ).first()
        
        if not card:
            return False
        
        # If trying to start or complete a stage, check prerequisites
        if target_status in ['in_progress', 'completed']:
            # Get all previous stages
            previous_cards = self.db.query(WorkflowCard).filter(
                and_(
                    WorkflowCard.workflow_id == card.workflow_id,
                    WorkflowCard.stage_order < card.stage_order
                )
            ).all()
            
            # All previous stages must be completed
            return all(prev_card.card_status == 'completed' for prev_card in previous_cards)
        
        return True
    
    def check_blocking_prevention(self, workflow_id: int) -> List[WorkflowCard]:
        """Check if any cards are blocked and prevent subsequent stages (Requirements 5.4)"""
        blocked_cards = self.db.query(WorkflowCard).filter(
            and_(
                WorkflowCard.workflow_id == workflow_id,
                WorkflowCard.card_status == 'blocked'
            )
        ).all()
        
        if blocked_cards:
            # Find the earliest blocked stage
            earliest_blocked_order = min(card.stage_order for card in blocked_cards)
            
            # Set all subsequent stages to 'ready' (waiting) status
            subsequent_cards = self.db.query(WorkflowCard).filter(
                and_(
                    WorkflowCard.workflow_id == workflow_id,
                    WorkflowCard.stage_order > earliest_blocked_order,
                    WorkflowCard.card_status.in_(['pending', 'in_progress'])
                )
            ).all()
            
            for card in subsequent_cards:
                card.card_status = 'ready'
                card.updated_at = utc_now()
                
                # Create status history for blocking prevention
                history = CardStatusHistory(
                    card_id=card.id,
                    previous_status=card.card_status,
                    new_status='ready',
                    updated_by='system',
                    update_reason=f'Stage blocked due to earlier stage {earliest_blocked_order} being blocked'
                )
                self.db.add(history)
        
        return blocked_cards
    
    def _sync_sample_status(self, workflow_id: int):
        """Sync workflow status with sample request status (Requirements 10.2)"""
        try:
            # Import here to avoid circular imports
            from modules.samples.models.sample import SampleRequest

            workflow = self.db.query(SampleWorkflow).filter(
                SampleWorkflow.id == workflow_id
            ).first()

            if not workflow:
                return

            # Get the sample request
            sample_request = self.db.query(SampleRequest).filter(
                SampleRequest.id == workflow.sample_request_id
            ).first()

            if not sample_request:
                return

            # Update sample status based on workflow status
            if workflow.workflow_status == 'completed':
                sample_request.current_status = 'Completed'
            elif workflow.workflow_status == 'cancelled':
                sample_request.current_status = 'Cancelled'
            else:
                # Check if any cards are blocked
                blocked_cards = self.db.query(WorkflowCard).filter(
                    and_(
                        WorkflowCard.workflow_id == workflow_id,
                        WorkflowCard.card_status == 'blocked'
                    )
                ).count()

                if blocked_cards > 0:
                    sample_request.current_status = 'Blocked'
                else:
                    # Check if any cards are in progress
                    in_progress_cards = self.db.query(WorkflowCard).filter(
                        and_(
                            WorkflowCard.workflow_id == workflow_id,
                            WorkflowCard.card_status == 'in_progress'
                        )
                    ).count()

                    if in_progress_cards > 0:
                        sample_request.current_status = 'In Progress'
                    else:
                        sample_request.current_status = 'Pending'

            sample_request.updated_at = utc_now()

        except Exception as e:
            # Log error but don't fail the workflow update
            print(f"Error syncing sample status: {e}")
            pass

    def get_statistics(self) -> Dict[str, Any]:
        """Get workflow statistics for dashboard (Requirements 6.2, 6.4, 9.1)"""
        # Total workflows by status
        total_workflows = self.db.query(SampleWorkflow).count()

        active_workflows = self.db.query(SampleWorkflow).filter(
            SampleWorkflow.workflow_status == 'active'
        ).count()

        completed_workflows = self.db.query(SampleWorkflow).filter(
            SampleWorkflow.workflow_status == 'completed'
        ).count()

        cancelled_workflows = self.db.query(SampleWorkflow).filter(
            SampleWorkflow.workflow_status == 'cancelled'
        ).count()

        # Cards statistics
        total_cards = self.db.query(WorkflowCard).count()

        cards_by_status = self.db.query(
            WorkflowCard.card_status,
            func.count(WorkflowCard.id)
        ).group_by(WorkflowCard.card_status).all()

        card_status_counts = {status: count for status, count in cards_by_status}

        # Blocked cards count
        blocked_cards = card_status_counts.get('blocked', 0)

        # Overdue workflows (due_date has passed but not completed)
        overdue_workflows = self.db.query(SampleWorkflow).filter(
            and_(
                SampleWorkflow.workflow_status == 'active',
                SampleWorkflow.due_date < utc_now()
            )
        ).count()

        # Priority distribution
        priority_counts = self.db.query(
            SampleWorkflow.priority,
            func.count(SampleWorkflow.id)
        ).group_by(SampleWorkflow.priority).all()

        priority_distribution = {priority or 'medium': count for priority, count in priority_counts}

        # Average completion time (for completed workflows) - PostgreSQL compatible
        try:
            from sqlalchemy import extract, cast, Float
            completed_with_time = self.db.query(
                func.avg(
                    extract('epoch', SampleWorkflow.completed_at - SampleWorkflow.created_at) / 86400.0
                )
            ).filter(
                and_(
                    SampleWorkflow.workflow_status == 'completed',
                    SampleWorkflow.completed_at.isnot(None)
                )
            ).scalar()
        except Exception as e:
            logger.warning(f"Could not calculate avg completion time: {e}")
            completed_with_time = None

        avg_completion_days = round(completed_with_time or 0, 1)

        # Recent activity (workflows created in last 7 days)
        seven_days_ago = utc_now() - timedelta(days=7)
        recent_workflows = self.db.query(SampleWorkflow).filter(
            SampleWorkflow.created_at >= seven_days_ago
        ).count()

        # Stage bottleneck analysis (cards that have been in same status longest)
        stage_stats = self.db.query(
            WorkflowCard.stage_name,
            WorkflowCard.card_status,
            func.count(WorkflowCard.id)
        ).group_by(
            WorkflowCard.stage_name,
            WorkflowCard.card_status
        ).all()

        stage_breakdown = {}
        for stage_name, status, count in stage_stats:
            if stage_name not in stage_breakdown:
                stage_breakdown[stage_name] = {}
            stage_breakdown[stage_name][status] = count

        # Assignee workload
        assignee_workload = self.db.query(
            WorkflowCard.assigned_to,
            func.count(WorkflowCard.id)
        ).filter(
            and_(
                WorkflowCard.assigned_to.isnot(None),
                WorkflowCard.card_status.in_(['pending', 'in_progress'])
            )
        ).group_by(WorkflowCard.assigned_to).all()

        workload_distribution = {assignee: count for assignee, count in assignee_workload if assignee}

        return {
            "total_workflows": total_workflows,
            "active_workflows": active_workflows,
            "completed_workflows": completed_workflows,
            "cancelled_workflows": cancelled_workflows,
            "total_cards": total_cards,
            "card_status_counts": card_status_counts,
            "blocked_cards": blocked_cards,
            "overdue_workflows": overdue_workflows,
            "priority_distribution": priority_distribution,
            "avg_completion_days": avg_completion_days,
            "recent_workflows": recent_workflows,
            "stage_breakdown": stage_breakdown,
            "workload_distribution": workload_distribution,
            "completion_rate": round((completed_workflows / total_workflows * 100) if total_workflows > 0 else 0, 1)
        }


class WorkflowTemplateService:
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_templates(self, template_name: Optional[str] = None) -> List[WorkflowTemplate]:
        """Get workflow templates"""
        query = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.is_active == True
        )
        
        if template_name:
            query = query.filter(WorkflowTemplate.template_name == template_name)
        
        return query.order_by(
            WorkflowTemplate.template_name, 
            WorkflowTemplate.stage_order
        ).all()
    
    def create_template(self, template_data: dict) -> WorkflowTemplate:
        """Create a new workflow template"""
        template = WorkflowTemplate(**template_data)
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template
    
    def update_template(self, template_id: int, template_data: dict) -> Optional[WorkflowTemplate]:
        """Update a workflow template"""
        template = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.id == template_id
        ).first()
        
        if not template:
            return None
        
        for key, value in template_data.items():
            if hasattr(template, key) and value is not None:
                setattr(template, key, value)
        
        self.db.commit()
        self.db.refresh(template)
        return template
    
    def delete_template(self, template_id: int) -> bool:
        """Soft delete a workflow template"""
        template = self.db.query(WorkflowTemplate).filter(
            WorkflowTemplate.id == template_id
        ).first()
        
        if not template:
            return False
        
        template.is_active = False
        self.db.commit()
        return True