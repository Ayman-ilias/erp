#!/usr/bin/env python3

from core.database import SessionLocalSizeColor
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def complete_migration():
    """Complete the remaining parts of the migration"""
    db = SessionLocalSizeColor()
    
    try:
        logger.info("🔄 Completing size measurement specifications migration...")
        
        # Step 1: Update existing data with default values (if not already done)
        logger.info("Updating existing measurement data...")
        
        # Set default unit information for existing measurements that don't have it
        result = db.execute(text("""
            UPDATE size_measurements 
            SET 
                unit_symbol = COALESCE(unit_symbol, 'cm'),
                unit_name = COALESCE(unit_name, 'Centimeter'),
                is_custom = COALESCE(is_custom, FALSE),
                original_value = COALESCE(original_value, value_cm),
                original_unit = COALESCE(original_unit, 'cm')
            WHERE unit_symbol IS NULL OR unit_name IS NULL OR is_custom IS NULL 
               OR original_value IS NULL OR original_unit IS NULL
        """))
        
        updated_rows = result.rowcount
        logger.info(f"✅ Updated {updated_rows} measurement records with default values")
        
        # Step 2: Try to link existing measurements to measurement specs where possible
        logger.info("Linking measurements to specs...")
        
        result = db.execute(text("""
            UPDATE size_measurements 
            SET measurement_spec_id = gms.id
            FROM garment_measurement_specs gms, size_master szm
            WHERE szm.id = size_measurements.size_master_id
            AND gms.garment_type_id = szm.garment_type_id
            AND UPPER(gms.measurement_code) = UPPER(size_measurements.measurement_code)
            AND size_measurements.measurement_spec_id IS NULL
        """))
        
        linked_rows = result.rowcount
        logger.info(f"✅ Linked {linked_rows} measurements to specs")
        
        db.commit()
        
        # Step 3: Add improved indexes for better performance (if not exists)
        logger.info("Adding performance indexes...")
        
        indexes_to_create = [
            ("ix_size_measurements_unit_symbol", "CREATE INDEX IF NOT EXISTS ix_size_measurements_unit_symbol ON size_measurements(unit_symbol)"),
            ("ix_size_measurements_is_custom", "CREATE INDEX IF NOT EXISTS ix_size_measurements_is_custom ON size_measurements(is_custom)"),
            ("ix_size_measurements_spec_id", "CREATE INDEX IF NOT EXISTS ix_size_measurements_spec_id ON size_measurements(measurement_spec_id)"),
            ("ix_size_measurements_size_measurement", "CREATE INDEX IF NOT EXISTS ix_size_measurements_size_measurement ON size_measurements(size_master_id, measurement_code, is_custom)")
        ]
        
        for index_name, sql in indexes_to_create:
            try:
                db.execute(text(sql))
                logger.info(f"✅ Created index: {index_name}")
            except Exception as e:
                logger.warning(f"Index {index_name} might already exist: {e}")
        
        db.commit()
        
        # Step 4: Add constraints for data integrity (if not exists)
        logger.info("Adding data integrity constraints...")
        
        constraints_to_add = [
            ("chk_size_measurements_positive_value", "ALTER TABLE size_measurements ADD CONSTRAINT IF NOT EXISTS chk_size_measurements_positive_value CHECK (value_cm > 0)"),
            ("chk_size_measurements_positive_tolerance", "ALTER TABLE size_measurements ADD CONSTRAINT IF NOT EXISTS chk_size_measurements_positive_tolerance CHECK (tolerance_plus >= 0 AND tolerance_minus >= 0)")
        ]
        
        for constraint_name, sql in constraints_to_add:
            try:
                db.execute(text(sql))
                logger.info(f"✅ Added constraint: {constraint_name}")
            except Exception as e:
                logger.warning(f"Constraint {constraint_name} might already exist: {e}")
        
        db.commit()
        
        # Step 5: Create enhanced measurement view
        logger.info("Creating enhanced measurement view...")
        
        db.execute(text("""
            CREATE OR REPLACE VIEW v_size_measurements_enhanced AS
            SELECT 
                sm.id,
                sm.size_master_id,
                sm.measurement_code,
                sm.measurement_name,
                sm.value_cm,
                sm.value_inch,
                sm.unit_symbol,
                sm.unit_name,
                sm.tolerance_plus,
                sm.tolerance_minus,
                sm.notes,
                sm.display_order,
                sm.is_custom,
                sm.original_value,
                sm.original_unit,
                sm.measurement_spec_id,
                sm.created_at,
                sm.updated_at,
                -- Size master info
                szm.size_code,
                szm.size_name,
                szm.gender,
                szm.age_group,
                szm.fit_type,
                -- Garment type info
                gt.name as garment_type_name,
                gt.code as garment_type_code,
                gt.category as garment_category,
                -- Measurement spec info (if linked)
                gms.description as spec_description,
                gms.is_required as spec_required,
                gms.default_tolerance_plus as spec_default_tolerance_plus,
                gms.default_tolerance_minus as spec_default_tolerance_minus
            FROM size_measurements sm
            JOIN size_master szm ON szm.id = sm.size_master_id
            JOIN garment_types gt ON gt.id = szm.garment_type_id
            LEFT JOIN garment_measurement_specs gms ON gms.id = sm.measurement_spec_id
        """))
        
        db.commit()
        logger.info("✅ Enhanced measurement view created successfully")
        
        # Step 6: Update the unique constraint to allow custom measurements
        logger.info("Updating unique constraints...")
        
        try:
            # Drop the old unique constraint
            db.execute(text("ALTER TABLE size_measurements DROP CONSTRAINT IF EXISTS uq_size_measurement"))
            
            # Add new unique constraint that allows multiple custom measurements with same code
            db.execute(text("""
                ALTER TABLE size_measurements 
                ADD CONSTRAINT uq_size_measurement_predefined 
                UNIQUE (size_master_id, measurement_code) 
                WHERE is_custom = FALSE
            """))
            
            logger.info("✅ Unique constraints updated successfully")
        except Exception as e:
            logger.warning(f"Constraint update might have failed: {e}")
        
        db.commit()
        
        logger.info("🎉 Migration completion successful!")
        
        # Print final summary
        result = db.execute(text("""
            SELECT 
                COUNT(*) as total_measurements,
                COUNT(*) FILTER (WHERE is_custom = TRUE) as custom_measurements,
                COUNT(*) FILTER (WHERE measurement_spec_id IS NOT NULL) as linked_measurements,
                COUNT(DISTINCT unit_symbol) as unique_units
            FROM size_measurements
        """))
        
        stats = result.fetchone()
        if stats:
            logger.info(f"📊 Final Statistics:")
            logger.info(f"   Total measurements: {stats[0]}")
            logger.info(f"   Custom measurements: {stats[1]}")
            logger.info(f"   Linked to specs: {stats[2]}")
            logger.info(f"   Unique units: {stats[3]}")
        
    except Exception as e:
        logger.error(f"❌ Migration completion failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    complete_migration()