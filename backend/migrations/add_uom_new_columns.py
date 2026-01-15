"""
Migration: Add new columns to UoM tables for enhanced functionality
"""
import logging
from sqlalchemy import text
from core.database import get_db_settings

logger = logging.getLogger(__name__)


def run_migration():
    """Add new columns to UoM tables"""
    db = next(get_db_settings())
    
    try:
        logger.info("Starting UoM tables migration...")
        
        # Add new columns to uom_category table
        uom_category_columns = [
            "ALTER TABLE uom_category ADD COLUMN IF NOT EXISTS icon VARCHAR(50)",
            "ALTER TABLE uom_category ADD COLUMN IF NOT EXISTS industry_use VARCHAR(255)",
            "ALTER TABLE uom_category ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0"
        ]
        
        for sql in uom_category_columns:
            try:
                db.execute(text(sql))
                logger.info(f"Executed: {sql}")
            except Exception as e:
                logger.warning(f"Column may already exist: {e}")
        
        # Add new columns to uom table
        uom_columns = [
            "ALTER TABLE uom ADD COLUMN IF NOT EXISTS display_name VARCHAR(100)",
            "ALTER TABLE uom ADD COLUMN IF NOT EXISTS is_si_unit BOOLEAN DEFAULT FALSE",
            "ALTER TABLE uom ADD COLUMN IF NOT EXISTS common_usage VARCHAR(255)",
            "ALTER TABLE uom ADD COLUMN IF NOT EXISTS decimal_places INTEGER DEFAULT 2",
            "ALTER TABLE uom ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0"
        ]
        
        for sql in uom_columns:
            try:
                db.execute(text(sql))
                logger.info(f"Executed: {sql}")
            except Exception as e:
                logger.warning(f"Column may already exist: {e}")
        
        db.commit()
        logger.info("UoM tables migration completed successfully!")
        
    except Exception as e:
        logger.error(f"Error during UoM migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_migration()