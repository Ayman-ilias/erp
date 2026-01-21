"""
Add UoM column to merchandiser material tables
This migration adds the missing uom column to trims, accessories, finished goods, and packing goods tables
"""
import logging
from sqlalchemy import text
from core.database import SessionLocalMerchandiser

logger = logging.getLogger(__name__)

def add_uom_columns():
    """Add uom column to merchandiser material tables"""
    db = SessionLocalMerchandiser()
    try:
        logger.info("Adding uom columns to merchandiser tables...")
        
        # Check if columns already exist and add them if they don't
        tables_to_update = [
            ("trims_details", "pcs"),
            ("accessories_details", "pcs"),
            ("finished_good_details", "pcs"),
            ("packing_good_details", "pcs")
        ]
        
        for table_name, default_value in tables_to_update:
            try:
                # Check if column exists
                result = db.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = '{table_name}' 
                    AND column_name = 'uom'
                """))
                
                if not result.fetchone():
                    # Add the column
                    logger.info(f"Adding uom column to {table_name}")
                    db.execute(text(f"""
                        ALTER TABLE {table_name} 
                        ADD COLUMN uom VARCHAR NOT NULL DEFAULT '{default_value}'
                    """))
                    db.commit()
                    logger.info(f"Successfully added uom column to {table_name}")
                else:
                    logger.info(f"uom column already exists in {table_name}")
                    
            except Exception as e:
                logger.error(f"Error adding uom column to {table_name}: {e}")
                db.rollback()
                
        logger.info("UoM columns migration completed")
        
    except Exception as e:
        logger.error(f"Error in add_uom_columns migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def run_migration():
    """Run the migration"""
    try:
        add_uom_columns()
        logger.info("✅ UoM columns migration completed successfully")
        return True
    except Exception as e:
        logger.error(f"❌ UoM columns migration failed: {e}")
        return False

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_migration()