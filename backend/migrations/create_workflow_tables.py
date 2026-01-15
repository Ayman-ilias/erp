"""
Migration to create workflow-related tables for ClickUp-style sample workflow management
"""

from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)


def create_workflow_tables():
    """Create workflow-related database tables"""
    engine = engines[DatabaseType.SAMPLES]
    
    with engine.begin() as conn:
        try:
            logger.info("Creating workflow-related tables...")
            
            # Create sample_workflows table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS sample_workflows (
                    id SERIAL PRIMARY KEY,
                    sample_request_id INTEGER NOT NULL,
                    workflow_name VARCHAR(255) NOT NULL,
                    workflow_status VARCHAR(50) DEFAULT 'active',
                    created_by VARCHAR(100),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    completed_at TIMESTAMP WITH TIME ZONE NULL,
                    priority VARCHAR(20) DEFAULT 'medium',
                    due_date TIMESTAMP WITH TIME ZONE NULL
                );
            """))
            
            # Create workflow_cards table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workflow_cards (
                    id SERIAL PRIMARY KEY,
                    workflow_id INTEGER NOT NULL REFERENCES sample_workflows(id) ON DELETE CASCADE,
                    stage_name VARCHAR(100) NOT NULL,
                    stage_order INTEGER NOT NULL,
                    card_title VARCHAR(255) NOT NULL,
                    card_description TEXT,
                    assigned_to VARCHAR(100),
                    card_status VARCHAR(50) DEFAULT 'pending',
                    due_date TIMESTAMP WITH TIME ZONE NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    completed_at TIMESTAMP WITH TIME ZONE NULL,
                    blocked_reason TEXT NULL
                );
            """))
            
            # Create card_status_history table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS card_status_history (
                    id SERIAL PRIMARY KEY,
                    card_id INTEGER NOT NULL REFERENCES workflow_cards(id) ON DELETE CASCADE,
                    previous_status VARCHAR(50),
                    new_status VARCHAR(50) NOT NULL,
                    updated_by VARCHAR(100) NOT NULL,
                    update_reason TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            
            # Create workflow_templates table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workflow_templates (
                    id SERIAL PRIMARY KEY,
                    template_name VARCHAR(100) NOT NULL,
                    stage_name VARCHAR(100) NOT NULL,
                    stage_order INTEGER NOT NULL,
                    stage_description TEXT,
                    default_assignee_role VARCHAR(50),
                    estimated_duration_hours INTEGER,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            
            # Create card_comments table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS card_comments (
                    id SERIAL PRIMARY KEY,
                    card_id INTEGER NOT NULL REFERENCES workflow_cards(id) ON DELETE CASCADE,
                    comment_text TEXT NOT NULL,
                    commented_by VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            
            # Create card_attachments table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS card_attachments (
                    id SERIAL PRIMARY KEY,
                    card_id INTEGER NOT NULL REFERENCES workflow_cards(id) ON DELETE CASCADE,
                    file_name VARCHAR(255) NOT NULL,
                    file_url VARCHAR(500) NOT NULL,
                    file_size INTEGER,
                    uploaded_by VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            
            # Add performance indexes
            logger.info("Creating indexes for performance optimization...")
            
            # Indexes for sample_workflows
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_sample_workflows_sample_request_id 
                ON sample_workflows(sample_request_id);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_sample_workflows_status 
                ON sample_workflows(workflow_status);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_sample_workflows_created_by 
                ON sample_workflows(created_by);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_sample_workflows_due_date 
                ON sample_workflows(due_date);
            """))
            
            # Indexes for workflow_cards
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_cards_workflow_id 
                ON workflow_cards(workflow_id);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_cards_status 
                ON workflow_cards(card_status);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_cards_assigned_to 
                ON workflow_cards(assigned_to);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_cards_stage_order 
                ON workflow_cards(workflow_id, stage_order);
            """))
            
            # Indexes for card_status_history
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_card_status_history_card_id 
                ON card_status_history(card_id);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_card_status_history_created_at 
                ON card_status_history(created_at);
            """))
            
            # Indexes for workflow_templates
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_templates_template_name 
                ON workflow_templates(template_name);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_templates_stage_order 
                ON workflow_templates(template_name, stage_order);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_workflow_templates_active 
                ON workflow_templates(is_active);
            """))
            
            # Indexes for card_comments
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_card_comments_card_id 
                ON card_comments(card_id);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_card_comments_created_at 
                ON card_comments(created_at);
            """))
            
            # Indexes for card_attachments
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_card_attachments_card_id 
                ON card_attachments(card_id);
            """))
            
            logger.info("✅ Workflow tables and indexes created successfully")
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            raise


if __name__ == "__main__":
    create_workflow_tables()