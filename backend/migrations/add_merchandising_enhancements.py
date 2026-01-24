"""
Add Merchandising Enhancements
- Merge trims & accessories into single table
- Add cuttable_width to fabric_details
- Add yarn_composition_details to yarn_details
- Create migration for existing data
"""

import asyncio
import logging
import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import text
from core.database import SessionLocalMerchandiser, engines, DatabaseType

logger = logging.getLogger(__name__)

async def run_migration():
    """Run the merchandising enhancements migration"""
    
    db = SessionLocalMerchandiser()
    try:
        logger.info("Starting merchandising enhancements migration...")
        
        # 1. Add cuttable_width to fabric_details
        logger.info("Adding cuttable_width column to fabric_details...")
        db.execute(text("""
            ALTER TABLE fabric_details 
            ADD COLUMN IF NOT EXISTS cuttable_width VARCHAR;
        """))
        
        # 2. Add yarn_composition_details to yarn_details
        logger.info("Adding yarn_composition_details column to yarn_details...")
        db.execute(text("""
            ALTER TABLE yarn_details 
            ADD COLUMN IF NOT EXISTS yarn_composition_details JSON;
        """))
        
        # 3. Create merged trims_accessories_details table
        logger.info("Creating trims_accessories_details table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS trims_accessories_details (
                id SERIAL PRIMARY KEY,
                product_id VARCHAR UNIQUE NOT NULL,
                product_name VARCHAR NOT NULL,
                category VARCHAR,
                sub_category VARCHAR,
                product_type VARCHAR NOT NULL DEFAULT 'trims',
                unit_id INTEGER NOT NULL DEFAULT 1,
                uom VARCHAR NOT NULL DEFAULT 'pcs',
                consumable_flag BOOLEAN DEFAULT TRUE,
                remarks TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            );
        """))
        
        # 4. Create indexes for the new table
        logger.info("Creating indexes for trims_accessories_details...")
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_trims_accessories_product_id 
            ON trims_accessories_details(product_id);
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_trims_accessories_product_type 
            ON trims_accessories_details(product_type);
        """))
        
        # 5. Migrate existing trims data
        logger.info("Migrating existing trims data...")
        db.execute(text("""
            INSERT INTO trims_accessories_details 
            (product_id, product_name, category, sub_category, product_type, unit_id, uom, consumable_flag, remarks, created_at, updated_at)
            SELECT 
                product_id, 
                product_name, 
                category, 
                sub_category, 
                'trims' as product_type,
                unit_id, 
                uom, 
                consumable_flag, 
                remarks, 
                created_at, 
                updated_at
            FROM trims_details
            WHERE product_id NOT IN (SELECT product_id FROM trims_accessories_details);
        """))
        
        # 6. Migrate existing accessories data
        logger.info("Migrating existing accessories data...")
        db.execute(text("""
            INSERT INTO trims_accessories_details 
            (product_id, product_name, category, sub_category, product_type, unit_id, uom, consumable_flag, remarks, created_at, updated_at)
            SELECT 
                product_id, 
                product_name, 
                category, 
                sub_category, 
                'accessories' as product_type,
                unit_id, 
                uom, 
                consumable_flag, 
                remarks, 
                created_at, 
                updated_at
            FROM accessories_details
            WHERE product_id NOT IN (SELECT product_id FROM trims_accessories_details);
        """))
        
        # 7. Add constraints
        logger.info("Adding constraints...")
        db.execute(text("""
            ALTER TABLE trims_accessories_details 
            ADD CONSTRAINT chk_product_type 
            CHECK (product_type IN ('trims', 'accessories'));
        """))
        
        db.commit()
        logger.info("✅ Merchandising enhancements migration completed successfully!")
        
        # Verification
        logger.info("Verifying migration...")
        
        # Check fabric_details has cuttable_width
        result = db.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'fabric_details' AND column_name = 'cuttable_width';
        """)).fetchone()
        
        if result:
            logger.info("✅ cuttable_width column added to fabric_details")
        else:
            logger.error("❌ cuttable_width column not found in fabric_details")
        
        # Check yarn_details has yarn_composition_details
        result = db.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'yarn_details' AND column_name = 'yarn_composition_details';
        """)).fetchone()
        
        if result:
            logger.info("✅ yarn_composition_details column added to yarn_details")
        else:
            logger.error("❌ yarn_composition_details column not found in yarn_details")
        
        # Check trims_accessories_details table exists
        result = db.execute(text("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_name = 'trims_accessories_details';
        """)).fetchone()
        
        if result:
            logger.info("✅ trims_accessories_details table created")
            
            # Check data migration
            trims_count = db.execute(text("""
                SELECT COUNT(*) FROM trims_accessories_details WHERE product_type = 'trims';
            """)).scalar()
            
            accessories_count = db.execute(text("""
                SELECT COUNT(*) FROM trims_accessories_details WHERE product_type = 'accessories';
            """)).scalar()
            
            logger.info(f"✅ Migrated {trims_count} trims and {accessories_count} accessories")
        else:
            logger.error("❌ trims_accessories_details table not found")
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_migration())