"""
Migration to remove universal_color_id from H&M colors table
This field is no longer needed as H&M colors should be independent
"""

from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)


def run_migration():
    """Remove universal_color_id column from hm_colors table"""
    engine = engines[DatabaseType.SIZECOLOR]
    
    with engine.begin() as conn:
        try:
            logger.info("Removing universal_color_id from hm_colors table...")
            
            # Check if column exists first
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'hm_colors' 
                AND column_name = 'universal_color_id'
            """))
            
            if result.fetchone():
                # Drop the foreign key constraint first
                conn.execute(text("""
                    ALTER TABLE hm_colors 
                    DROP CONSTRAINT IF EXISTS hm_colors_universal_color_id_fkey
                """))
                
                # Drop the column
                conn.execute(text("""
                    ALTER TABLE hm_colors 
                    DROP COLUMN IF EXISTS universal_color_id
                """))
                
                logger.info("✅ Removed universal_color_id column from hm_colors table")
            else:
                logger.info("ℹ️  universal_color_id column doesn't exist in hm_colors table")
            
            logger.info("✅ H&M colors universal link removal completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ H&M colors universal link removal failed: {e}")
            raise


if __name__ == "__main__":
    run_migration()