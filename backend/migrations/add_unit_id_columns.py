"""
Migration: Add unit_id columns to material models
Date: 2026-01-16
Purpose: Replace plain text unit fields with references to Unit Conversion System

This migration adds:
- unit_id to material_master table (nullable initially)
- unit_id to sample_required_materials table (nullable initially)
- unit_id and weight_unit_id to style_variant_materials table (nullable initially)

These columns will reference the units table in db-units database.
Note: Cross-database references use integer IDs without foreign key constraints.
"""
from sqlalchemy import text
from core.database import SessionLocalSamples
import logging

logger = logging.getLogger(__name__)

def run_migration():
    """Add unit_id columns to material models"""
    
    db = SessionLocalSamples()
    try:
        logger.info("Starting unit_id columns migration...")
        
        # 1. Add unit_id to material_master
        logger.info("Checking material_master table...")
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='material_master' AND column_name='unit_id'
        """))
        
        if not result.fetchone():
            logger.info("Adding unit_id column to material_master...")
            db.execute(text("""
                ALTER TABLE material_master 
                ADD COLUMN unit_id INTEGER NULL
            """))
            logger.info("✓ unit_id column added to material_master")
        else:
            logger.info("✓ unit_id column already exists in material_master")
        
        # 2. Add unit_id to sample_required_materials
        logger.info("Checking sample_required_materials table...")
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='sample_required_materials' AND column_name='unit_id'
        """))
        
        if not result.fetchone():
            logger.info("Adding unit_id column to sample_required_materials...")
            db.execute(text("""
                ALTER TABLE sample_required_materials 
                ADD COLUMN unit_id INTEGER NULL
            """))
            logger.info("✓ unit_id column added to sample_required_materials")
        else:
            logger.info("✓ unit_id column already exists in sample_required_materials")
        
        # 3. Add unit_id to style_variant_materials
        logger.info("Checking style_variant_materials table for unit_id...")
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='style_variant_materials' AND column_name='unit_id'
        """))
        
        if not result.fetchone():
            logger.info("Adding unit_id column to style_variant_materials...")
            db.execute(text("""
                ALTER TABLE style_variant_materials 
                ADD COLUMN unit_id INTEGER NULL
            """))
            logger.info("✓ unit_id column added to style_variant_materials")
        else:
            logger.info("✓ unit_id column already exists in style_variant_materials")
        
        # 4. Add weight_unit_id to style_variant_materials
        logger.info("Checking style_variant_materials table for weight_unit_id...")
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='style_variant_materials' AND column_name='weight_unit_id'
        """))
        
        if not result.fetchone():
            logger.info("Adding weight_unit_id column to style_variant_materials...")
            db.execute(text("""
                ALTER TABLE style_variant_materials 
                ADD COLUMN weight_unit_id INTEGER NULL
            """))
            logger.info("✓ weight_unit_id column added to style_variant_materials")
        else:
            logger.info("✓ weight_unit_id column already exists in style_variant_materials")
        
        # Commit all changes
        db.commit()
        logger.info("✅ Migration completed successfully!")
        logger.info("Note: unit_id columns are nullable initially for data migration")
        logger.info("Note: Old uom columns will be dropped after data migration")
        
    except Exception as e:
        logger.error(f"❌ Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def rollback_migration():
    """Rollback migration by dropping unit_id columns"""
    
    db = SessionLocalSamples()
    try:
        logger.info("Rolling back unit_id columns migration...")
        
        # Drop columns if they exist
        db.execute(text("""
            ALTER TABLE material_master 
            DROP COLUMN IF EXISTS unit_id
        """))
        
        db.execute(text("""
            ALTER TABLE sample_required_materials 
            DROP COLUMN IF EXISTS unit_id
        """))
        
        db.execute(text("""
            ALTER TABLE style_variant_materials 
            DROP COLUMN IF EXISTS unit_id,
            DROP COLUMN IF EXISTS weight_unit_id
        """))
        
        db.commit()
        logger.info("✅ Rollback completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error during rollback: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_migration()
