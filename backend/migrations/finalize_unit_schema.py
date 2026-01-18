"""
Migration: Finalize Unit Schema

This script finalizes the unit schema migration by:
1. Verifying all records have valid unit_id values
2. Making unit_id columns non-nullable
3. Dropping old uom and weight_uom columns
4. Creating indexes on unit_id columns for performance

Requirements: 1.1, 1.2, 1.3

Prerequisites:
- add_unit_id_columns.py must have been run
- migrate_unit_data.py must have been run successfully
- All records must have valid unit_id values

Usage:
    python backend/migrations/finalize_unit_schema.py
"""

import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from core.database import SessionLocalSamples, SessionLocalUnits
import logging
from datetime import datetime
from typing import Dict, List, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class UnitSchemaFinalization:
    """
    Handles finalization of unit schema migration.
    """
    
    def __init__(self):
        self.db_samples = SessionLocalSamples()
        self.db_units = SessionLocalUnits()
        
        # Statistics
        self.stats = {
            'material_master': {'total': 0, 'with_unit_id': 0, 'null_unit_id': 0},
            'sample_required_materials': {'total': 0, 'with_unit_id': 0, 'null_unit_id': 0},
            'style_variant_materials': {
                'total': 0,
                'with_unit_id': 0,
                'null_unit_id': 0,
                'with_weight_unit_id': 0,
                'null_weight_unit_id': 0
            }
        }
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Close database sessions on exit."""
        self.db_samples.close()
        self.db_units.close()
    
    def verify_data_integrity(self) -> bool:
        """
        Verify that all records have valid unit_id values before making columns non-nullable.
        
        Returns:
            True if all records have valid unit_id, False otherwise
        """
        logger.info("=" * 80)
        logger.info("STEP 1: Verifying Data Integrity")
        logger.info("=" * 80)
        
        all_valid = True
        
        # Check material_master
        logger.info("\nChecking material_master table...")
        
        # Total records
        total_query = text("SELECT COUNT(*) FROM material_master")
        total_count = self.db_samples.execute(total_query).scalar()
        self.stats['material_master']['total'] = total_count
        
        # Records with unit_id
        with_unit_id_query = text("SELECT COUNT(*) FROM material_master WHERE unit_id IS NOT NULL")
        with_unit_id_count = self.db_samples.execute(with_unit_id_query).scalar()
        self.stats['material_master']['with_unit_id'] = with_unit_id_count
        
        # Records with NULL unit_id
        null_unit_id_query = text("SELECT COUNT(*) FROM material_master WHERE unit_id IS NULL")
        null_unit_id_count = self.db_samples.execute(null_unit_id_query).scalar()
        self.stats['material_master']['null_unit_id'] = null_unit_id_count
        
        logger.info(f"  Total records: {total_count}")
        logger.info(f"  With unit_id: {with_unit_id_count}")
        logger.info(f"  NULL unit_id: {null_unit_id_count}")
        
        if null_unit_id_count > 0:
            logger.error(f"  ✗ {null_unit_id_count} records have NULL unit_id")
            
            # Show sample records with NULL unit_id
            sample_query = text("""
                SELECT id, material_name, uom
                FROM material_master
                WHERE unit_id IS NULL
                LIMIT 10
            """)
            sample_records = self.db_samples.execute(sample_query).fetchall()
            
            logger.error("  Sample records with NULL unit_id:")
            for record in sample_records:
                logger.error(f"    - ID {record[0]}: {record[1]} (uom: {record[2]})")
            
            all_valid = False
        else:
            logger.info("  ✓ All records have valid unit_id")
        
        # Check sample_required_materials
        logger.info("\nChecking sample_required_materials table...")
        
        total_query = text("SELECT COUNT(*) FROM sample_required_materials")
        total_count = self.db_samples.execute(total_query).scalar()
        self.stats['sample_required_materials']['total'] = total_count
        
        with_unit_id_query = text("SELECT COUNT(*) FROM sample_required_materials WHERE unit_id IS NOT NULL")
        with_unit_id_count = self.db_samples.execute(with_unit_id_query).scalar()
        self.stats['sample_required_materials']['with_unit_id'] = with_unit_id_count
        
        null_unit_id_query = text("SELECT COUNT(*) FROM sample_required_materials WHERE unit_id IS NULL")
        null_unit_id_count = self.db_samples.execute(null_unit_id_query).scalar()
        self.stats['sample_required_materials']['null_unit_id'] = null_unit_id_count
        
        logger.info(f"  Total records: {total_count}")
        logger.info(f"  With unit_id: {with_unit_id_count}")
        logger.info(f"  NULL unit_id: {null_unit_id_count}")
        
        if null_unit_id_count > 0:
            logger.error(f"  ✗ {null_unit_id_count} records have NULL unit_id")
            
            sample_query = text("""
                SELECT id, sample_request_id, product_name, required_quantity, uom
                FROM sample_required_materials
                WHERE unit_id IS NULL
                LIMIT 10
            """)
            sample_records = self.db_samples.execute(sample_query).fetchall()
            
            logger.error("  Sample records with NULL unit_id:")
            for record in sample_records:
                logger.error(f"    - ID {record[0]}, Sample {record[1]}: {record[2]} - {record[3]} {record[4]}")
            
            all_valid = False
        else:
            logger.info("  ✓ All records have valid unit_id")
        
        # Check style_variant_materials
        logger.info("\nChecking style_variant_materials table...")
        
        total_query = text("SELECT COUNT(*) FROM style_variant_materials")
        total_count = self.db_samples.execute(total_query).scalar()
        self.stats['style_variant_materials']['total'] = total_count
        
        # Check unit_id
        with_unit_id_query = text("SELECT COUNT(*) FROM style_variant_materials WHERE unit_id IS NOT NULL")
        with_unit_id_count = self.db_samples.execute(with_unit_id_query).scalar()
        self.stats['style_variant_materials']['with_unit_id'] = with_unit_id_count
        
        null_unit_id_query = text("SELECT COUNT(*) FROM style_variant_materials WHERE unit_id IS NULL")
        null_unit_id_count = self.db_samples.execute(null_unit_id_query).scalar()
        self.stats['style_variant_materials']['null_unit_id'] = null_unit_id_count
        
        # Check weight_unit_id
        with_weight_unit_id_query = text("SELECT COUNT(*) FROM style_variant_materials WHERE weight_unit_id IS NOT NULL")
        with_weight_unit_id_count = self.db_samples.execute(with_weight_unit_id_query).scalar()
        self.stats['style_variant_materials']['with_weight_unit_id'] = with_weight_unit_id_count
        
        null_weight_unit_id_query = text("SELECT COUNT(*) FROM style_variant_materials WHERE weight_unit_id IS NULL")
        null_weight_unit_id_count = self.db_samples.execute(null_weight_unit_id_query).scalar()
        self.stats['style_variant_materials']['null_weight_unit_id'] = null_weight_unit_id_count
        
        logger.info(f"  Total records: {total_count}")
        logger.info(f"  With unit_id: {with_unit_id_count}")
        logger.info(f"  NULL unit_id: {null_unit_id_count}")
        logger.info(f"  With weight_unit_id: {with_weight_unit_id_count}")
        logger.info(f"  NULL weight_unit_id: {null_weight_unit_id_count}")
        
        if null_unit_id_count > 0:
            logger.error(f"  ✗ {null_unit_id_count} records have NULL unit_id")
            
            sample_query = text("""
                SELECT id, style_variant_id, product_name, required_quantity, uom
                FROM style_variant_materials
                WHERE unit_id IS NULL
                LIMIT 10
            """)
            sample_records = self.db_samples.execute(sample_query).fetchall()
            
            logger.error("  Sample records with NULL unit_id:")
            for record in sample_records:
                logger.error(f"    - ID {record[0]}, Variant {record[1]}: {record[2]} - {record[3]} {record[4]}")
            
            all_valid = False
        
        if null_weight_unit_id_count > 0:
            logger.error(f"  ✗ {null_weight_unit_id_count} records have NULL weight_unit_id")
            
            sample_query = text("""
                SELECT id, style_variant_id, product_name, weight, weight_uom
                FROM style_variant_materials
                WHERE weight_unit_id IS NULL
                LIMIT 10
            """)
            sample_records = self.db_samples.execute(sample_query).fetchall()
            
            logger.error("  Sample records with NULL weight_unit_id:")
            for record in sample_records:
                logger.error(f"    - ID {record[0]}, Variant {record[1]}: {record[2]} - {record[3]} {record[4]}")
            
            all_valid = False
        
        if null_unit_id_count == 0 and null_weight_unit_id_count == 0:
            logger.info("  ✓ All records have valid unit_id and weight_unit_id")
        
        logger.info("\n" + "=" * 80)
        if all_valid:
            logger.info("✓ Data integrity verification PASSED")
        else:
            logger.error("✗ Data integrity verification FAILED")
            logger.error("Please run migrate_unit_data.py to populate unit_id values")
        logger.info("=" * 80)
        
        return all_valid
    
    def make_columns_non_nullable(self) -> None:
        """
        Make unit_id columns non-nullable.
        """
        logger.info("\n" + "=" * 80)
        logger.info("STEP 2: Making unit_id Columns Non-Nullable")
        logger.info("=" * 80)
        
        try:
            # material_master.unit_id
            logger.info("\nUpdating material_master.unit_id to NOT NULL...")
            self.db_samples.execute(text("""
                ALTER TABLE material_master
                ALTER COLUMN unit_id SET NOT NULL
            """))
            logger.info("  ✓ material_master.unit_id is now NOT NULL")
            
            # sample_required_materials.unit_id
            logger.info("\nUpdating sample_required_materials.unit_id to NOT NULL...")
            self.db_samples.execute(text("""
                ALTER TABLE sample_required_materials
                ALTER COLUMN unit_id SET NOT NULL
            """))
            logger.info("  ✓ sample_required_materials.unit_id is now NOT NULL")
            
            # style_variant_materials.unit_id (nullable - some records may not have quantity)
            logger.info("\nUpdating style_variant_materials.unit_id to NOT NULL...")
            logger.info("  Note: Keeping unit_id nullable as required_quantity is nullable")
            
            # style_variant_materials.weight_unit_id (nullable - some records may not have weight)
            logger.info("\nUpdating style_variant_materials.weight_unit_id to NOT NULL...")
            logger.info("  Note: Keeping weight_unit_id nullable as weight is nullable")
            
            self.db_samples.commit()
            logger.info("\n✓ All applicable columns are now non-nullable")
            
        except Exception as e:
            logger.error(f"✗ Error making columns non-nullable: {e}")
            self.db_samples.rollback()
            raise
    
    def drop_old_columns(self) -> None:
        """
        Drop old uom and weight_uom columns.
        """
        logger.info("\n" + "=" * 80)
        logger.info("STEP 3: Dropping Old UoM Columns")
        logger.info("=" * 80)
        
        try:
            # Drop material_master.uom
            logger.info("\nDropping material_master.uom column...")
            self.db_samples.execute(text("""
                ALTER TABLE material_master
                DROP COLUMN IF EXISTS uom
            """))
            logger.info("  ✓ material_master.uom column dropped")
            
            # Drop sample_required_materials.uom
            logger.info("\nDropping sample_required_materials.uom column...")
            self.db_samples.execute(text("""
                ALTER TABLE sample_required_materials
                DROP COLUMN IF EXISTS uom
            """))
            logger.info("  ✓ sample_required_materials.uom column dropped")
            
            # Drop style_variant_materials.uom
            logger.info("\nDropping style_variant_materials.uom column...")
            self.db_samples.execute(text("""
                ALTER TABLE style_variant_materials
                DROP COLUMN IF EXISTS uom
            """))
            logger.info("  ✓ style_variant_materials.uom column dropped")
            
            # Drop style_variant_materials.weight_uom
            logger.info("\nDropping style_variant_materials.weight_uom column...")
            self.db_samples.execute(text("""
                ALTER TABLE style_variant_materials
                DROP COLUMN IF EXISTS weight_uom
            """))
            logger.info("  ✓ style_variant_materials.weight_uom column dropped")
            
            self.db_samples.commit()
            logger.info("\n✓ All old UoM columns dropped successfully")
            
        except Exception as e:
            logger.error(f"✗ Error dropping old columns: {e}")
            self.db_samples.rollback()
            raise
    
    def create_indexes(self) -> None:
        """
        Create indexes on unit_id columns for performance.
        """
        logger.info("\n" + "=" * 80)
        logger.info("STEP 4: Creating Indexes on unit_id Columns")
        logger.info("=" * 80)
        
        try:
            # Index on material_master.unit_id
            logger.info("\nCreating index on material_master.unit_id...")
            self.db_samples.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_material_master_unit_id
                ON material_master(unit_id)
            """))
            logger.info("  ✓ Index idx_material_master_unit_id created")
            
            # Index on sample_required_materials.unit_id
            logger.info("\nCreating index on sample_required_materials.unit_id...")
            self.db_samples.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_sample_required_materials_unit_id
                ON sample_required_materials(unit_id)
            """))
            logger.info("  ✓ Index idx_sample_required_materials_unit_id created")
            
            # Index on style_variant_materials.unit_id
            logger.info("\nCreating index on style_variant_materials.unit_id...")
            self.db_samples.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_style_variant_materials_unit_id
                ON style_variant_materials(unit_id)
            """))
            logger.info("  ✓ Index idx_style_variant_materials_unit_id created")
            
            # Index on style_variant_materials.weight_unit_id
            logger.info("\nCreating index on style_variant_materials.weight_unit_id...")
            self.db_samples.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_style_variant_materials_weight_unit_id
                ON style_variant_materials(weight_unit_id)
            """))
            logger.info("  ✓ Index idx_style_variant_materials_weight_unit_id created")
            
            self.db_samples.commit()
            logger.info("\n✓ All indexes created successfully")
            
        except Exception as e:
            logger.error(f"✗ Error creating indexes: {e}")
            self.db_samples.rollback()
            raise
    
    def update_model_definitions(self) -> None:
        """
        Print instructions for updating model definitions.
        """
        logger.info("\n" + "=" * 80)
        logger.info("STEP 5: Update Model Definitions")
        logger.info("=" * 80)
        
        logger.info("\nPlease update the following model files:")
        logger.info("\n1. backend/modules/materials/models/material.py")
        logger.info("   - Remove: uom = Column(String, nullable=False)")
        logger.info("   - Update: unit_id = Column(Integer, nullable=False)")
        
        logger.info("\n2. backend/modules/samples/models/sample.py")
        logger.info("   - SampleRequiredMaterial:")
        logger.info("     - Remove: uom = Column(String, nullable=False)")
        logger.info("     - Update: unit_id = Column(Integer, nullable=False)")
        logger.info("   - StyleVariantMaterial:")
        logger.info("     - Remove: uom = Column(String, nullable=True)")
        logger.info("     - Remove: weight_uom = Column(String, default='kg')")
        logger.info("     - Keep: unit_id = Column(Integer, nullable=True)")
        logger.info("     - Keep: weight_unit_id = Column(Integer, nullable=True)")
        
        logger.info("\n" + "=" * 80)
    
    def print_summary(self) -> None:
        """
        Print finalization summary.
        """
        logger.info("\n" + "=" * 80)
        logger.info("FINALIZATION SUMMARY")
        logger.info("=" * 80)
        
        logger.info("\nData Integrity:")
        logger.info(f"  material_master: {self.stats['material_master']['with_unit_id']}/{self.stats['material_master']['total']} records with unit_id")
        logger.info(f"  sample_required_materials: {self.stats['sample_required_materials']['with_unit_id']}/{self.stats['sample_required_materials']['total']} records with unit_id")
        logger.info(f"  style_variant_materials: {self.stats['style_variant_materials']['with_unit_id']}/{self.stats['style_variant_materials']['total']} records with unit_id")
        logger.info(f"  style_variant_materials: {self.stats['style_variant_materials']['with_weight_unit_id']}/{self.stats['style_variant_materials']['total']} records with weight_unit_id")
        
        logger.info("\nSchema Changes:")
        logger.info("  ✓ unit_id columns made non-nullable (where applicable)")
        logger.info("  ✓ Old uom and weight_uom columns dropped")
        logger.info("  ✓ Indexes created on unit_id columns")
        
        logger.info("\nNext Steps:")
        logger.info("  1. Update model definitions (see instructions above)")
        logger.info("  2. Update Pydantic schemas to remove uom fields")
        logger.info("  3. Update API routes to use unit_id")
        logger.info("  4. Update frontend forms to use UnitSelector component")
        
        logger.info("\n" + "=" * 80)
    
    def run(self) -> bool:
        """
        Run the complete finalization process.
        
        Returns:
            True if finalization successful, False otherwise
        """
        try:
            logger.info("=" * 80)
            logger.info("UNIT SCHEMA FINALIZATION")
            logger.info("=" * 80)
            logger.info(f"Timestamp: {datetime.now().isoformat()}")
            logger.info("=" * 80)
            
            # Step 1: Verify data integrity
            if not self.verify_data_integrity():
                logger.error("\n✗ Finalization aborted due to data integrity issues")
                logger.error("Please fix the issues and run this script again")
                return False
            
            # Step 2: Make columns non-nullable
            self.make_columns_non_nullable()
            
            # Step 3: Drop old columns
            self.drop_old_columns()
            
            # Step 4: Create indexes
            self.create_indexes()
            
            # Step 5: Update model definitions (instructions only)
            self.update_model_definitions()
            
            # Print summary
            self.print_summary()
            
            logger.info("\n✓ Schema finalization completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"\n✗ Finalization failed with error: {e}", exc_info=True)
            self.db_samples.rollback()
            return False


def rollback_finalization():
    """
    Rollback finalization by restoring old columns and making unit_id nullable.
    
    WARNING: This will restore the old schema but data in old columns will be lost!
    """
    logger.info("=" * 80)
    logger.info("ROLLING BACK SCHEMA FINALIZATION")
    logger.info("=" * 80)
    logger.warning("WARNING: Old uom data will be lost if columns were already dropped!")
    
    db = SessionLocalSamples()
    try:
        # Make unit_id columns nullable
        logger.info("\nMaking unit_id columns nullable...")
        
        db.execute(text("""
            ALTER TABLE material_master
            ALTER COLUMN unit_id DROP NOT NULL
        """))
        
        db.execute(text("""
            ALTER TABLE sample_required_materials
            ALTER COLUMN unit_id DROP NOT NULL
        """))
        
        logger.info("  ✓ unit_id columns are now nullable")
        
        # Restore old columns (empty)
        logger.info("\nRestoring old uom columns (empty)...")
        
        db.execute(text("""
            ALTER TABLE material_master
            ADD COLUMN IF NOT EXISTS uom VARCHAR
        """))
        
        db.execute(text("""
            ALTER TABLE sample_required_materials
            ADD COLUMN IF NOT EXISTS uom VARCHAR
        """))
        
        db.execute(text("""
            ALTER TABLE style_variant_materials
            ADD COLUMN IF NOT EXISTS uom VARCHAR,
            ADD COLUMN IF NOT EXISTS weight_uom VARCHAR DEFAULT 'kg'
        """))
        
        logger.info("  ✓ Old uom columns restored (empty)")
        
        # Drop indexes
        logger.info("\nDropping indexes...")
        
        db.execute(text("DROP INDEX IF EXISTS idx_material_master_unit_id"))
        db.execute(text("DROP INDEX IF EXISTS idx_sample_required_materials_unit_id"))
        db.execute(text("DROP INDEX IF EXISTS idx_style_variant_materials_unit_id"))
        db.execute(text("DROP INDEX IF EXISTS idx_style_variant_materials_weight_unit_id"))
        
        logger.info("  ✓ Indexes dropped")
        
        db.commit()
        logger.info("\n✓ Rollback completed successfully!")
        logger.warning("Note: Old uom data was not restored - you'll need to re-populate it manually")
        
    except Exception as e:
        logger.error(f"✗ Error during rollback: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    """
    Main entry point for the finalization script.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Finalize unit schema migration')
    parser.add_argument('--rollback', action='store_true', help='Rollback finalization')
    args = parser.parse_args()
    
    if args.rollback:
        rollback_finalization()
        sys.exit(0)
    
    # Run finalization
    with UnitSchemaFinalization() as finalization:
        success = finalization.run()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
