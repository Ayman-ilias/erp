"""
Migration: Add color_ids, size_ids, and yarn_ids columns to sample_requests table
Adds support for multiple color, size, and yarn selections
"""
from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)

def add_color_size_yarn_ids_columns():
    """Add color_ids, size_ids, and yarn_ids JSON columns to sample_requests table"""
    engine = engines[DatabaseType.SAMPLES]
    
    with engine.begin() as conn:
        try:
            # Check if color_ids column exists
            check_color_ids = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'sample_requests' 
                AND column_name = 'color_ids'
            """)
            color_ids_exists = conn.execute(check_color_ids).fetchone()
            
            # Check if size_ids column exists
            check_size_ids = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'sample_requests' 
                AND column_name = 'size_ids'
            """)
            size_ids_exists = conn.execute(check_size_ids).fetchone()
            
            # Check if yarn_ids column exists
            check_yarn_ids = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'sample_requests' 
                AND column_name = 'yarn_ids'
            """)
            yarn_ids_exists = conn.execute(check_yarn_ids).fetchone()
            
            # Add color_ids column if it doesn't exist
            if not color_ids_exists:
                logger.info("Adding color_ids column to sample_requests...")
                add_color_ids = text("""
                    ALTER TABLE sample_requests 
                    ADD COLUMN color_ids JSON
                """)
                conn.execute(add_color_ids)
                logger.info("✅ color_ids column added successfully")
            else:
                logger.info("ℹ️  color_ids column already exists")
            
            # Add size_ids column if it doesn't exist
            if not size_ids_exists:
                logger.info("Adding size_ids column to sample_requests...")
                add_size_ids = text("""
                    ALTER TABLE sample_requests 
                    ADD COLUMN size_ids JSON
                """)
                conn.execute(add_size_ids)
                logger.info("✅ size_ids column added successfully")
            else:
                logger.info("ℹ️  size_ids column already exists")
            
            # Add yarn_ids column if it doesn't exist
            if not yarn_ids_exists:
                logger.info("Adding yarn_ids column to sample_requests...")
                add_yarn_ids = text("""
                    ALTER TABLE sample_requests 
                    ADD COLUMN yarn_ids JSON
                """)
                conn.execute(add_yarn_ids)
                logger.info("✅ yarn_ids column added successfully")
            else:
                logger.info("ℹ️  yarn_ids column already exists")
            
            logger.info("✅ Migration completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error during migration: {e}")
            raise

if __name__ == "__main__":
    add_color_size_yarn_ids_columns()
