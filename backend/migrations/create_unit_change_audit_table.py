"""
Migration: Create unit_change_audit table
Date: 2026-01-16
Purpose: Create audit trail table for tracking unit field changes

This migration creates the unit_change_audit table to track changes to unit fields 
across material-related models:
- MaterialMaster (unit_id changes)
- SampleRequiredMaterial (unit_id changes) 
- StyleVariantMaterial (unit_id and weight_unit_id changes)

The table will be created in the units database if available, otherwise in settings database.

Requirements: 15.1, 15.4
"""
from sqlalchemy import text
from core.database import SessionLocalUnits, SessionLocalSettings, engines, DatabaseType
import logging

logger = logging.getLogger(__name__)

def run_migration():
    """Create unit_change_audit table with proper indexes"""
    
    # Try units database first, fall back to settings database
    try:
        db = SessionLocalUnits()
        database_name = "units"
        logger.info("Using units database for audit table...")
    except Exception as e:
        logger.warning(f"Units database not available ({e}), falling back to settings database...")
        db = SessionLocalSettings()
        database_name = "settings"
    
    try:
        logger.info(f"Starting unit_change_audit table creation in {database_name} database...")
        
        # Check if table already exists
        logger.info("Checking if unit_change_audit table exists...")
        result = db.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'unit_change_audit'
        """))
        
        if result.fetchone():
            logger.info("✓ unit_change_audit table already exists")
            return
        
        # Create the audit table
        logger.info("Creating unit_change_audit table...")
        
        # For settings database, reference existing uom table; for units database, reference units table
        if database_name == "settings":
            # Reference existing uom table in settings database
            db.execute(text("""
                CREATE TABLE unit_change_audit (
                    id SERIAL PRIMARY KEY,
                    table_name VARCHAR(100) NOT NULL,
                    record_id INTEGER NOT NULL,
                    field_name VARCHAR(50) NOT NULL,
                    old_unit_id INTEGER REFERENCES uom(id) ON DELETE SET NULL,
                    new_unit_id INTEGER REFERENCES uom(id) ON DELETE SET NULL,
                    changed_by VARCHAR(100),
                    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    change_reason VARCHAR(200)
                )
            """))
        else:
            # Reference units table in units database
            db.execute(text("""
                CREATE TABLE unit_change_audit (
                    id SERIAL PRIMARY KEY,
                    table_name VARCHAR(100) NOT NULL,
                    record_id INTEGER NOT NULL,
                    field_name VARCHAR(50) NOT NULL,
                    old_unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
                    new_unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
                    changed_by VARCHAR(100),
                    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    change_reason VARCHAR(200)
                )
            """))
        
        logger.info("✓ unit_change_audit table created")
        
        # Create indexes for performance
        logger.info("Creating indexes for unit_change_audit table...")
        
        # Index on table_name for filtering by table
        db.execute(text("""
            CREATE INDEX idx_unit_audit_table_name ON unit_change_audit(table_name)
        """))
        logger.info("✓ Created index on table_name")
        
        # Index on record_id for filtering by record
        db.execute(text("""
            CREATE INDEX idx_unit_audit_record_id ON unit_change_audit(record_id)
        """))
        logger.info("✓ Created index on record_id")
        
        # Composite index on table_name and record_id for efficient lookups
        db.execute(text("""
            CREATE INDEX idx_unit_audit_table_record ON unit_change_audit(table_name, record_id)
        """))
        logger.info("✓ Created composite index on table_name, record_id")
        
        # Index on changed_at for date range queries
        db.execute(text("""
            CREATE INDEX idx_unit_audit_changed_at ON unit_change_audit(changed_at)
        """))
        logger.info("✓ Created index on changed_at")
        
        # Index on changed_by for user-based queries
        db.execute(text("""
            CREATE INDEX idx_unit_audit_changed_by ON unit_change_audit(changed_by)
        """))
        logger.info("✓ Created index on changed_by")
        
        # Index on old_unit_id for tracking specific unit changes
        db.execute(text("""
            CREATE INDEX idx_unit_audit_old_unit_id ON unit_change_audit(old_unit_id)
        """))
        logger.info("✓ Created index on old_unit_id")
        
        # Index on new_unit_id for tracking specific unit changes
        db.execute(text("""
            CREATE INDEX idx_unit_audit_new_unit_id ON unit_change_audit(new_unit_id)
        """))
        logger.info("✓ Created index on new_unit_id")
        
        # Commit all changes
        db.commit()
        logger.info(f"✅ Migration completed successfully in {database_name} database!")
        logger.info("unit_change_audit table created with proper indexes for performance")
        
    except Exception as e:
        logger.error(f"❌ Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def rollback_migration():
    """Rollback migration by dropping unit_change_audit table"""
    
    # Try both databases
    for db_session, db_name in [(SessionLocalUnits, "units"), (SessionLocalSettings, "settings")]:
        try:
            db = db_session()
            logger.info(f"Rolling back unit_change_audit table creation from {db_name} database...")
            
            # Drop table if it exists (CASCADE will drop indexes automatically)
            db.execute(text("""
                DROP TABLE IF EXISTS unit_change_audit CASCADE
            """))
            
            db.commit()
            logger.info(f"✅ Rollback completed successfully from {db_name} database!")
            
        except Exception as e:
            logger.warning(f"Could not rollback from {db_name} database: {e}")
            try:
                db.rollback()
            except:
                pass
        finally:
            try:
                db.close()
            except:
                pass

def verify_migration():
    """Verify that the migration was successful"""
    
    # Try both databases to see where the table was created
    for db_session, db_name in [(SessionLocalUnits, "units"), (SessionLocalSettings, "settings")]:
        try:
            db = db_session()
            logger.info(f"Verifying unit_change_audit table creation in {db_name} database...")
            
            # Check table exists
            result = db.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'unit_change_audit'
            """))
            
            if not result.fetchone():
                logger.info(f"unit_change_audit table not found in {db_name} database")
                continue
            
            # Check columns exist
            result = db.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'unit_change_audit'
                ORDER BY ordinal_position
            """))
            
            columns = result.fetchall()
            expected_columns = [
                'id', 'table_name', 'record_id', 'field_name', 
                'old_unit_id', 'new_unit_id', 'changed_by', 'changed_at', 'change_reason'
            ]
            
            actual_columns = [col[0] for col in columns]
            for expected_col in expected_columns:
                if expected_col not in actual_columns:
                    raise Exception(f"Column {expected_col} is missing from unit_change_audit table")
            
            # Check indexes exist
            result = db.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'unit_change_audit'
            """))
            
            indexes = [row[0] for row in result.fetchall()]
            expected_indexes = [
                'unit_change_audit_pkey',  # Primary key
                'idx_unit_audit_table_name',
                'idx_unit_audit_record_id', 
                'idx_unit_audit_table_record',
                'idx_unit_audit_changed_at',
                'idx_unit_audit_changed_by',
                'idx_unit_audit_old_unit_id',
                'idx_unit_audit_new_unit_id'
            ]
            
            for expected_idx in expected_indexes:
                if expected_idx not in indexes:
                    logger.warning(f"Index {expected_idx} is missing")
            
            logger.info(f"✅ Migration verification completed successfully in {db_name} database!")
            logger.info(f"Table has {len(columns)} columns and {len(indexes)} indexes")
            return  # Success, exit verification
            
        except Exception as e:
            logger.warning(f"Could not verify in {db_name} database: {e}")
        finally:
            try:
                db.close()
            except:
                pass
    
    # If we get here, verification failed in both databases
    raise Exception("unit_change_audit table not found in any database")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_migration()
    verify_migration()