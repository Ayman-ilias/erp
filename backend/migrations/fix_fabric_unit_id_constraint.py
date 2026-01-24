#!/usr/bin/env python3
"""
Migration: Fix Fabric Unit ID Constraint
Date: 2026-01-24
Description: Make fabric_details.unit_id NOT NULL with default value of 1
             and update existing NULL values to 1
"""

import sys
import os
import logging
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from core.config import settings

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migration():
    """Fix fabric_details.unit_id constraint and update existing data"""
    
    # Create engine for merchandiser database
    engine = create_engine(settings.DATABASE_URL_MERCHANDISER)
    
    try:
        with engine.connect() as conn:
            # Start transaction
            trans = conn.begin()
            
            try:
                logger.info("Starting fabric unit_id constraint migration...")
                
                # Step 1: Update existing NULL unit_id values to 1
                logger.info("Updating NULL unit_id values to 1...")
                result = conn.execute(text("""
                    UPDATE fabric_details 
                    SET unit_id = 1 
                    WHERE unit_id IS NULL
                """))
                updated_rows = result.rowcount
                logger.info(f"Updated {updated_rows} rows with NULL unit_id to 1")
                
                # Step 2: Update existing 0 unit_id values to 1
                logger.info("Updating 0 unit_id values to 1...")
                result = conn.execute(text("""
                    UPDATE fabric_details 
                    SET unit_id = 1 
                    WHERE unit_id = 0
                """))
                updated_zero_rows = result.rowcount
                logger.info(f"Updated {updated_zero_rows} rows with 0 unit_id to 1")
                
                # Step 3: Add NOT NULL constraint with default value
                logger.info("Adding NOT NULL constraint with default value...")
                conn.execute(text("""
                    ALTER TABLE fabric_details 
                    ALTER COLUMN unit_id SET NOT NULL
                """))
                
                conn.execute(text("""
                    ALTER TABLE fabric_details 
                    ALTER COLUMN unit_id SET DEFAULT 1
                """))
                
                # Step 4: Verify the changes
                logger.info("Verifying changes...")
                result = conn.execute(text("""
                    SELECT COUNT(*) as total_count,
                           COUNT(unit_id) as non_null_count,
                           MIN(unit_id) as min_unit_id,
                           MAX(unit_id) as max_unit_id
                    FROM fabric_details
                """))
                
                row = result.fetchone()
                logger.info(f"Verification - Total rows: {row.total_count}, "
                           f"Non-null unit_id: {row.non_null_count}, "
                           f"Min unit_id: {row.min_unit_id}, "
                           f"Max unit_id: {row.max_unit_id}")
                
                if row.total_count != row.non_null_count:
                    raise Exception("Still have NULL unit_id values after migration!")
                
                # Commit transaction
                trans.commit()
                logger.info("✅ Fabric unit_id constraint migration completed successfully!")
                
                return {
                    "success": True,
                    "updated_null_rows": updated_rows,
                    "updated_zero_rows": updated_zero_rows,
                    "total_rows": row.total_count
                }
                
            except Exception as e:
                # Rollback on error
                trans.rollback()
                logger.error(f"❌ Migration failed: {str(e)}")
                raise
                
    except Exception as e:
        logger.error(f"❌ Database connection failed: {str(e)}")
        raise

def verify_migration():
    """Verify the migration was successful"""
    engine = create_engine(settings.DATABASE_URL_MERCHANDISER)
    
    with engine.connect() as conn:
        # Check constraint exists
        result = conn.execute(text("""
            SELECT column_name, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'fabric_details' 
            AND column_name = 'unit_id'
        """))
        
        row = result.fetchone()
        if row:
            logger.info(f"Column info - Name: {row.column_name}, "
                       f"Nullable: {row.is_nullable}, "
                       f"Default: {row.column_default}")
            
            if row.is_nullable == 'NO':
                logger.info("✅ unit_id is now NOT NULL")
            else:
                logger.warning("⚠️ unit_id is still nullable")
                
            if '1' in str(row.column_default):
                logger.info("✅ unit_id has default value of 1")
            else:
                logger.warning(f"⚠️ unit_id default is: {row.column_default}")
        
        # Check for any remaining NULL or 0 values
        result = conn.execute(text("""
            SELECT COUNT(*) as null_count
            FROM fabric_details 
            WHERE unit_id IS NULL OR unit_id = 0
        """))
        
        null_count = result.fetchone().null_count
        if null_count == 0:
            logger.info("✅ No NULL or 0 unit_id values found")
        else:
            logger.error(f"❌ Found {null_count} NULL or 0 unit_id values")

if __name__ == "__main__":
    try:
        result = run_migration()
        print(f"\n✅ Migration completed successfully!")
        print(f"   - Updated {result['updated_null_rows']} NULL values")
        print(f"   - Updated {result['updated_zero_rows']} zero values")
        print(f"   - Total fabric records: {result['total_rows']}")
        
        print("\n🔍 Verifying migration...")
        verify_migration()
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        sys.exit(1)