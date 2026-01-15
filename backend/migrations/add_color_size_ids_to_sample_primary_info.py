"""
Migration: Add color_ids and size_ids columns to sample_primary_info table
Adds support for multiple color and size selections
"""
from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)

def add_color_size_ids_columns():
    """Add color_ids and size_ids JSON columns to sample_primary_info table"""
    engine = engines[DatabaseType.MERCHANDISER]
    
    with engine.begin() as conn:
        try:
            # Check if color_ids column exists
            check_color_ids = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'sample_primary_info' 
                AND column_name = 'color_ids'
            """)
            color_ids_exists = conn.execute(check_color_ids).fetchone()
            
            # Check if size_ids column exists
            check_size_ids = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'sample_primary_info' 
                AND column_name = 'size_ids'
            """)
            size_ids_exists = conn.execute(check_size_ids).fetchone()
            
            # Add color_ids column if it doesn't exist
            if not color_ids_exists:
                logger.info("Adding color_ids column to sample_primary_info...")
                add_color_ids = text("""
                    ALTER TABLE sample_primary_info 
                    ADD COLUMN color_ids JSON
                """)
                conn.execute(add_color_ids)
                logger.info("✅ color_ids column added successfully")
            else:
                logger.info("ℹ️  color_ids column already exists")
            
            # Add size_ids column if it doesn't exist
            if not size_ids_exists:
                logger.info("Adding size_ids column to sample_primary_info...")
                add_size_ids = text("""
                    ALTER TABLE sample_primary_info 
                    ADD COLUMN size_ids JSON
                """)
                conn.execute(add_size_ids)
                logger.info("✅ size_ids column added successfully")
            else:
                logger.info("ℹ️  size_ids column already exists")
            
            logger.info("✅ Migration completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error during migration: {e}")
            raise

if __name__ == "__main__":
    add_color_size_ids_columns()
