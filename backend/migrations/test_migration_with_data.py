"""
Test Migration Script with Sample Data

This script creates test data and then runs the migration to verify it works correctly.
"""

import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from core.database import SessionLocalSamples
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_test_data():
    """Create test data with various unit text values."""
    db = SessionLocalSamples()
    
    try:
        logger.info("Creating test data...")
        
        # Insert test materials with various unit formats
        test_materials = [
            ("Cotton Fabric", "meter"),
            ("Polyester Yarn", "kg"),
            ("Buttons", "piece"),
            ("Zipper", "pcs"),
            ("Thread", "Kg"),  # Different case
            ("Elastic", "M"),  # Different case
            ("Label", "PC"),  # Different case
        ]
        
        for material_name, uom in test_materials:
            db.execute(
                text("""
                    INSERT INTO material_master (material_name, uom, material_category)
                    VALUES (:name, :uom, 'Test')
                    ON CONFLICT (material_name) DO NOTHING
                """),
                {'name': material_name, 'uom': uom}
            )
        
        db.commit()
        logger.info(f"Created {len(test_materials)} test materials")
        
        # Verify data was created
        result = db.execute(text("SELECT COUNT(*) FROM material_master WHERE material_category = 'Test'"))
        count = result.scalar()
        logger.info(f"Total test materials in database: {count}")
        
    except Exception as e:
        logger.error(f"Error creating test data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def verify_migration():
    """Verify that migration worked correctly."""
    db = SessionLocalSamples()
    
    try:
        logger.info("Verifying migration results...")
        
        # Check that all test materials have unit_id
        result = db.execute(text("""
            SELECT material_name, uom, unit_id
            FROM material_master
            WHERE material_category = 'Test'
            ORDER BY material_name
        """))
        
        materials = result.fetchall()
        
        logger.info(f"\nMigration Results:")
        logger.info("=" * 60)
        
        all_mapped = True
        for material in materials:
            name, uom, unit_id = material
            status = "✓ MAPPED" if unit_id else "✗ UNMAPPED"
            logger.info(f"{name:20} | {uom:10} | unit_id={unit_id} | {status}")
            if not unit_id:
                all_mapped = False
        
        logger.info("=" * 60)
        
        if all_mapped:
            logger.info("✓ All test materials successfully mapped!")
        else:
            logger.warning("✗ Some materials were not mapped")
        
        return all_mapped
        
    finally:
        db.close()


def cleanup_test_data():
    """Clean up test data."""
    db = SessionLocalSamples()
    
    try:
        logger.info("Cleaning up test data...")
        db.execute(text("DELETE FROM material_master WHERE material_category = 'Test'"))
        db.commit()
        logger.info("Test data cleaned up")
    finally:
        db.close()


def main():
    """Main test flow."""
    logger.info("=" * 80)
    logger.info("MIGRATION TEST WITH SAMPLE DATA")
    logger.info("=" * 80)
    
    try:
        # Step 1: Create test data
        create_test_data()
        
        # Step 2: Run migration
        logger.info("\nRunning migration script...")
        from migrate_unit_data import UnitDataMigration
        
        with UnitDataMigration() as migration:
            success = migration.run()
        
        if not success:
            logger.error("Migration failed!")
            return False
        
        # Step 3: Verify results
        logger.info("\n" + "=" * 80)
        all_mapped = verify_migration()
        
        # Step 4: Cleanup
        logger.info("\n" + "=" * 80)
        cleanup_test_data()
        
        logger.info("\n" + "=" * 80)
        if all_mapped:
            logger.info("✓ TEST PASSED: Migration works correctly!")
        else:
            logger.warning("✗ TEST FAILED: Some units were not mapped")
        logger.info("=" * 80)
        
        return all_mapped
        
    except Exception as e:
        logger.error(f"Test failed with error: {e}", exc_info=True)
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
