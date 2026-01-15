"""
Migration: Add carton dimension columns to packing_good_details table
"""
import logging
from sqlalchemy import text
from core.database import get_db_merchandiser

logger = logging.getLogger(__name__)


def run_migration():
    """Add carton dimension columns to packing_good_details table"""
    db = next(get_db_merchandiser())
    
    try:
        logger.info("Starting packing_good_details migration...")
        
        # Add carton dimension columns
        columns = [
            "ALTER TABLE packing_good_details ADD COLUMN IF NOT EXISTS carton_length FLOAT",
            "ALTER TABLE packing_good_details ADD COLUMN IF NOT EXISTS carton_width FLOAT",
            "ALTER TABLE packing_good_details ADD COLUMN IF NOT EXISTS carton_height FLOAT",
            "ALTER TABLE packing_good_details ADD COLUMN IF NOT EXISTS carton_weight FLOAT"
        ]
        
        for sql in columns:
            try:
                db.execute(text(sql))
                logger.info(f"Executed: {sql}")
            except Exception as e:
                logger.warning(f"Column may already exist: {e}")
        
        db.commit()
        logger.info("packing_good_details migration completed successfully!")
        
    except Exception as e:
        logger.error(f"Error during packing_good_details migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_migration()
