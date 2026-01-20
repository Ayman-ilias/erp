"""
Restructure H&M Colors - Drop current tables and create simplified structure
Migration: restructure_hm_colors.py
Date: 2025-01-20

Changes:
1. Drop existing hm_color_groups and hm_colors tables
2. Create new simplified hm_colors table with fields:
   - color_code (H&M code like 51-138)
   - color_master (Color name like BEIGE)
   - color_value (like MEDIUM DUSTY)
   - mixed_name (Combined name like BEIGE MEDIUM DUSTY)
"""

import sys
import os
from sqlalchemy import text
from sqlalchemy.orm import Session

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocalSizeColor
from migrations.migration_tracker import MigrationTracker
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MIGRATION_ID = "restructure_hm_colors_20250120"
MIGRATION_NAME = "Restructure H&M Colors - Simplified Excel-based structure"


def run_migration():
    """Run the H&M colors restructure migration"""
    
    db = SessionLocalSizeColor()
    tracker = MigrationTracker()
    
    try:
        # Check if migration already applied
        if tracker.has_run(MIGRATION_ID):
            logger.info(f"Migration {MIGRATION_ID} already applied, skipping...")
            return True
        
        logger.info(f"Starting migration: {MIGRATION_NAME}")
        
        # Start transaction
        db.begin()
        
        # Step 1: Drop existing foreign key constraints and related tables
        logger.info("Step 1: Dropping foreign key constraints...")
        
        # Drop sample color selections that reference hm_colors
        db.execute(text("""
            ALTER TABLE IF EXISTS sample_color_selections 
            DROP CONSTRAINT IF EXISTS sample_color_selections_hm_color_id_fkey CASCADE;
        """))
        
        # Drop buyer color usage that references hm_colors
        db.execute(text("""
            ALTER TABLE IF EXISTS buyer_color_usage 
            DROP CONSTRAINT IF EXISTS buyer_color_usage_hm_color_id_fkey CASCADE;
        """))
        
        # Step 2: Drop existing H&M color tables
        logger.info("Step 2: Dropping existing H&M color tables...")
        
        db.execute(text("DROP TABLE IF EXISTS hm_colors CASCADE;"))
        db.execute(text("DROP TABLE IF EXISTS hm_color_groups CASCADE;"))
        
        # Step 3: Create new simplified hm_colors table
        logger.info("Step 3: Creating new simplified hm_colors table...")
        
        db.execute(text("""
            CREATE TABLE hm_colors (
                id SERIAL PRIMARY KEY,
                color_code VARCHAR(20) UNIQUE NOT NULL,
                color_master VARCHAR(100) NOT NULL,
                color_value VARCHAR(100),
                mixed_name VARCHAR(200),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Step 4: Create indexes for performance
        logger.info("Step 4: Creating indexes...")
        
        db.execute(text("CREATE INDEX ix_hm_color_code ON hm_colors(color_code);"))
        db.execute(text("CREATE INDEX ix_hm_color_master ON hm_colors(color_master);"))
        db.execute(text("CREATE INDEX ix_hm_color_value ON hm_colors(color_value);"))
        db.execute(text("CREATE INDEX ix_hm_mixed_name ON hm_colors(mixed_name);"))
        
        # Step 5: Recreate foreign key constraints for related tables
        logger.info("Step 5: Recreating foreign key constraints...")
        
        # Recreate sample_color_selections foreign key
        db.execute(text("""
            ALTER TABLE sample_color_selections 
            ADD CONSTRAINT sample_color_selections_hm_color_id_fkey 
            FOREIGN KEY (hm_color_id) REFERENCES hm_colors(id);
        """))
        
        # Recreate buyer_color_usage foreign key
        db.execute(text("""
            ALTER TABLE buyer_color_usage 
            ADD CONSTRAINT buyer_color_usage_hm_color_id_fkey 
            FOREIGN KEY (hm_color_id) REFERENCES hm_colors(id);
        """))
        
        # Step 6: Create updated_at trigger
        logger.info("Step 6: Creating updated_at trigger...")
        
        db.execute(text("""
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        """))
        
        db.execute(text("""
            CREATE TRIGGER update_hm_colors_updated_at 
            BEFORE UPDATE ON hm_colors 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """))
        
        # Commit transaction
        db.commit()
        
        # Record migration
        tracker.mark_success(MIGRATION_ID)
        
        logger.info("=" * 60)
        logger.info("H&M COLORS RESTRUCTURE COMPLETED")
        logger.info("=" * 60)
        logger.info("✅ Dropped old hm_color_groups and hm_colors tables")
        logger.info("✅ Created new simplified hm_colors table")
        logger.info("✅ Added indexes for performance")
        logger.info("✅ Recreated foreign key constraints")
        logger.info("✅ Added updated_at trigger")
        logger.info("")
        logger.info("Next steps:")
        logger.info("1. Run the Excel import script to populate data")
        logger.info("2. Update frontend to use new field structure")
        
        return True
        
    except Exception as e:
        db.rollback()
        logger.error(f"Migration failed: {e}")
        return False
    finally:
        db.close()


def rollback_migration():
    """Rollback the H&M colors restructure migration"""
    
    db = SessionLocalSizeColor()
    tracker = MigrationTracker()
    
    try:
        logger.info(f"Rolling back migration: {MIGRATION_NAME}")
        
        # Start transaction
        db.begin()
        
        # Drop the new table
        logger.info("Dropping new hm_colors table...")
        db.execute(text("DROP TABLE IF EXISTS hm_colors CASCADE;"))
        
        # Note: We cannot restore the old data, this is a destructive migration
        logger.warning("⚠️  Old H&M color data cannot be restored automatically")
        logger.warning("⚠️  You will need to restore from backup if needed")
        
        # Commit transaction
        db.commit()
        
        # Remove migration record - Note: MigrationTracker doesn't have remove_migration method
        # tracker.remove_migration(MIGRATION_ID)
        
        logger.info("Migration rollback completed")
        return True
        
    except Exception as e:
        db.rollback()
        logger.error(f"Rollback failed: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--rollback":
        success = rollback_migration()
    else:
        success = run_migration()
    
    if success:
        print("✅ Migration completed successfully!")
        sys.exit(0)
    else:
        print("❌ Migration failed!")
        sys.exit(1)