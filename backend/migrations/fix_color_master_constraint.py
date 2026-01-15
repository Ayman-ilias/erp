"""
Migration: Fix ColorMaster unique constraint
Changes constraint from (color_id, color_value_id) to (color_code, color_code_type)
This allows multiple H&M codes per color+value combination
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fix_color_master_constraint():
    """Fix the unique constraint on color_master table"""
    engine = engines[DatabaseType.SETTINGS]
    
    try:
        with engine.connect() as conn:
            # Start transaction
            trans = conn.begin()
            
            try:
                # Drop the old constraint
                logger.info("Dropping old unique constraint 'uq_color_value'...")
                conn.execute(text("""
                    ALTER TABLE color_master 
                    DROP CONSTRAINT IF EXISTS uq_color_value;
                """))
                
                # Add new constraint on (color_code, color_code_type)
                # This allows multiple codes per color+value, but each code is unique
                logger.info("Adding new unique constraint on (color_code, color_code_type)...")
                conn.execute(text("""
                    ALTER TABLE color_master 
                    ADD CONSTRAINT uq_color_code_type 
                    UNIQUE (color_code, color_code_type);
                """))
                
                # Commit transaction
                trans.commit()
                logger.info("✅ Successfully updated color_master constraint")
                
            except Exception as e:
                trans.rollback()
                logger.error(f"Error updating constraint: {e}")
                raise
                
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise


if __name__ == "__main__":
    fix_color_master_constraint()

