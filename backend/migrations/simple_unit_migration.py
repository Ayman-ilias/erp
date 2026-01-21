"""
Simple migration to add unit_id columns to merchandiser tables
"""

from sqlalchemy import text
from core.database import get_db_merchandiser
from core.logging import setup_logging

logger = setup_logging()

def run_migration():
    """Add unit_id columns to merchandiser tables"""
    try:
        # Get database session
        db = next(get_db_merchandiser())
        
        logger.info("Starting merchandiser unit integration migration...")
        
        # Migration queries
        migrations = [
            # Add unit_id column to trims_details
            "ALTER TABLE trims_details ADD COLUMN IF NOT EXISTS unit_id INTEGER DEFAULT 1;",
            
            # Add unit_id column to accessories_details
            "ALTER TABLE accessories_details ADD COLUMN IF NOT EXISTS unit_id INTEGER DEFAULT 1;",
            
            # Add unit_id column to finished_good_details
            "ALTER TABLE finished_good_details ADD COLUMN IF NOT EXISTS unit_id INTEGER DEFAULT 1;",
            
            # Add unit_id column to packing_good_details
            "ALTER TABLE packing_good_details ADD COLUMN IF NOT EXISTS unit_id INTEGER DEFAULT 1;",
            
            # Update unit_id based on existing uom values (mapping common units)
            """UPDATE trims_details 
            SET unit_id = CASE 
                WHEN uom = 'piece' OR uom = 'pcs' THEN 1
                WHEN uom = 'meter' OR uom = 'm' THEN 2
                WHEN uom = 'yard' OR uom = 'yd' THEN 3
                WHEN uom = 'kg' OR uom = 'kilogram' THEN 4
                WHEN uom = 'gram' OR uom = 'g' THEN 5
                WHEN uom = 'dozen' OR uom = 'doz' THEN 6
                ELSE 1
            END
            WHERE unit_id = 1;""",
            
            """UPDATE accessories_details 
            SET unit_id = CASE 
                WHEN uom = 'piece' OR uom = 'pcs' THEN 1
                WHEN uom = 'meter' OR uom = 'm' THEN 2
                WHEN uom = 'yard' OR uom = 'yd' THEN 3
                WHEN uom = 'kg' OR uom = 'kilogram' THEN 4
                WHEN uom = 'gram' OR uom = 'g' THEN 5
                WHEN uom = 'dozen' OR uom = 'doz' THEN 6
                ELSE 1
            END
            WHERE unit_id = 1;""",
            
            """UPDATE finished_good_details 
            SET unit_id = CASE 
                WHEN uom = 'piece' OR uom = 'pcs' THEN 1
                WHEN uom = 'meter' OR uom = 'm' THEN 2
                WHEN uom = 'yard' OR uom = 'yd' THEN 3
                WHEN uom = 'kg' OR uom = 'kilogram' THEN 4
                WHEN uom = 'gram' OR uom = 'g' THEN 5
                WHEN uom = 'dozen' OR uom = 'doz' THEN 6
                ELSE 1
            END
            WHERE unit_id = 1;""",
            
            """UPDATE packing_good_details 
            SET unit_id = CASE 
                WHEN uom = 'piece' OR uom = 'pcs' THEN 1
                WHEN uom = 'meter' OR uom = 'm' THEN 2
                WHEN uom = 'yard' OR uom = 'yd' THEN 3
                WHEN uom = 'kg' OR uom = 'kilogram' THEN 4
                WHEN uom = 'gram' OR uom = 'g' THEN 5
                WHEN uom = 'dozen' OR uom = 'doz' THEN 6
                ELSE 1
            END
            WHERE unit_id = 1;""",
            
            # Make unit_id NOT NULL after setting values
            "ALTER TABLE trims_details ALTER COLUMN unit_id SET NOT NULL;",
            "ALTER TABLE accessories_details ALTER COLUMN unit_id SET NOT NULL;",
            "ALTER TABLE finished_good_details ALTER COLUMN unit_id SET NOT NULL;",
            "ALTER TABLE packing_good_details ALTER COLUMN unit_id SET NOT NULL;",
        ]
        
        # Execute migrations
        for i, query in enumerate(migrations, 1):
            logger.info(f"Executing migration step {i}/{len(migrations)}")
            db.execute(text(query))
            db.commit()
            logger.info(f"Migration step {i} completed successfully")
        
        logger.info("Merchandiser unit integration migration completed successfully!")
        
        # Note: We keep the uom columns for backward compatibility
        logger.info("Note: uom columns are kept for backward compatibility")
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()