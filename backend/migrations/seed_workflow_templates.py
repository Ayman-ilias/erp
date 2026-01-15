"""
Migration to seed default workflow templates for sample development
"""

from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)


def seed_workflow_templates():
    """Seed default workflow templates for sample development process"""
    engine = engines[DatabaseType.SAMPLES]
    
    with engine.begin() as conn:
        try:
            logger.info("Seeding default workflow templates...")
            
            # Default workflow stages as defined in the design document
            default_templates = [
                {
                    'template_name': 'sample_development',
                    'stage_name': 'Design Approval',
                    'stage_order': 1,
                    'stage_description': 'Review and approve the initial design concept',
                    'default_assignee_role': 'design_manager',
                    'estimated_duration_hours': 4
                },
                {
                    'template_name': 'sample_development',
                    'stage_name': 'Assign Designer',
                    'stage_order': 2,
                    'stage_description': 'Assign designer and create detailed specifications',
                    'default_assignee_role': 'designer',
                    'estimated_duration_hours': 8
                },
                {
                    'template_name': 'sample_development',
                    'stage_name': 'Programming',
                    'stage_order': 3,
                    'stage_description': 'Create jacquard program for knitting machine',
                    'default_assignee_role': 'programmer',
                    'estimated_duration_hours': 12
                },
                {
                    'template_name': 'sample_development',
                    'stage_name': 'Supervisor Knitting',
                    'stage_order': 4,
                    'stage_description': 'Supervise knitting process and quality control',
                    'default_assignee_role': 'knitting_supervisor',
                    'estimated_duration_hours': 16
                },
                {
                    'template_name': 'sample_development',
                    'stage_name': 'Supervisor Finishing',
                    'stage_order': 5,
                    'stage_description': 'Supervise finishing process and final quality check',
                    'default_assignee_role': 'finishing_supervisor',
                    'estimated_duration_hours': 8
                }
            ]
            
            # Clear existing templates for sample_development to avoid duplicates
            conn.execute(text("""
                DELETE FROM workflow_templates 
                WHERE template_name = 'sample_development'
            """))
            
            # Insert default templates
            for template in default_templates:
                conn.execute(text("""
                    INSERT INTO workflow_templates (
                        template_name, 
                        stage_name, 
                        stage_order, 
                        stage_description, 
                        default_assignee_role, 
                        estimated_duration_hours,
                        is_active
                    ) VALUES (
                        :template_name,
                        :stage_name,
                        :stage_order,
                        :stage_description,
                        :default_assignee_role,
                        :estimated_duration_hours,
                        true
                    )
                """), template)
            
            logger.info(f"✅ Successfully seeded {len(default_templates)} workflow templates")
            
            # Verify templates were created
            result = conn.execute(text("""
                SELECT COUNT(*) as count 
                FROM workflow_templates 
                WHERE template_name = 'sample_development' AND is_active = true
            """))
            count = result.fetchone()[0]
            logger.info(f"✅ Verified {count} active workflow templates in database")
            
        except Exception as e:
            logger.error(f"Template seeding failed: {e}")
            raise


def get_workflow_templates(template_name: str = None):
    """Get workflow templates from database"""
    engine = engines[DatabaseType.SAMPLES]
    
    with engine.begin() as conn:
        try:
            if template_name:
                result = conn.execute(text("""
                    SELECT * FROM workflow_templates 
                    WHERE template_name = :template_name AND is_active = true
                    ORDER BY stage_order
                """), {"template_name": template_name})
            else:
                result = conn.execute(text("""
                    SELECT * FROM workflow_templates 
                    WHERE is_active = true
                    ORDER BY template_name, stage_order
                """))
            
            templates = []
            for row in result:
                templates.append({
                    'id': row[0],
                    'template_name': row[1],
                    'stage_name': row[2],
                    'stage_order': row[3],
                    'stage_description': row[4],
                    'default_assignee_role': row[5],
                    'estimated_duration_hours': row[6],
                    'is_active': row[7],
                    'created_at': row[8]
                })
            
            return templates
            
        except Exception as e:
            logger.error(f"Failed to get workflow templates: {e}")
            raise


def create_workflow_template(template_data):
    """Create a new workflow template"""
    engine = engines[DatabaseType.SAMPLES]
    
    with engine.begin() as conn:
        try:
            result = conn.execute(text("""
                INSERT INTO workflow_templates (
                    template_name, 
                    stage_name, 
                    stage_order, 
                    stage_description, 
                    default_assignee_role, 
                    estimated_duration_hours,
                    is_active
                ) VALUES (
                    :template_name,
                    :stage_name,
                    :stage_order,
                    :stage_description,
                    :default_assignee_role,
                    :estimated_duration_hours,
                    :is_active
                ) RETURNING id
            """), {
                'template_name': template_data.get('template_name'),
                'stage_name': template_data.get('stage_name'),
                'stage_order': template_data.get('stage_order'),
                'stage_description': template_data.get('stage_description'),
                'default_assignee_role': template_data.get('default_assignee_role'),
                'estimated_duration_hours': template_data.get('estimated_duration_hours'),
                'is_active': template_data.get('is_active', True)
            })
            
            template_id = result.fetchone()[0]
            logger.info(f"✅ Created workflow template with ID: {template_id}")
            return template_id
            
        except Exception as e:
            logger.error(f"Failed to create workflow template: {e}")
            raise


def update_workflow_template(template_id, template_data):
    """Update an existing workflow template"""
    engine = engines[DatabaseType.SAMPLES]
    
    with engine.begin() as conn:
        try:
            conn.execute(text("""
                UPDATE workflow_templates SET
                    template_name = :template_name,
                    stage_name = :stage_name,
                    stage_order = :stage_order,
                    stage_description = :stage_description,
                    default_assignee_role = :default_assignee_role,
                    estimated_duration_hours = :estimated_duration_hours,
                    is_active = :is_active
                WHERE id = :id
            """), {
                'id': template_id,
                'template_name': template_data.get('template_name'),
                'stage_name': template_data.get('stage_name'),
                'stage_order': template_data.get('stage_order'),
                'stage_description': template_data.get('stage_description'),
                'default_assignee_role': template_data.get('default_assignee_role'),
                'estimated_duration_hours': template_data.get('estimated_duration_hours'),
                'is_active': template_data.get('is_active', True)
            })
            
            logger.info(f"✅ Updated workflow template with ID: {template_id}")
            
        except Exception as e:
            logger.error(f"Failed to update workflow template: {e}")
            raise


def delete_workflow_template(template_id):
    """Delete a workflow template (soft delete by setting is_active to false)"""
    engine = engines[DatabaseType.SAMPLES]
    
    with engine.begin() as conn:
        try:
            conn.execute(text("""
                UPDATE workflow_templates SET is_active = false WHERE id = :id
            """), {"id": template_id})
            
            logger.info(f"✅ Deactivated workflow template with ID: {template_id}")
            
        except Exception as e:
            logger.error(f"Failed to delete workflow template: {e}")
            raise


if __name__ == "__main__":
    seed_workflow_templates()