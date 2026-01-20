"""
Enhance Size Measurement Specifications Migration

This migration enhances the size measurement system to support:
1. Custom measurement specifications with values and units
2. Unit conversion integration
3. Flexible measurement management
4. Better measurement tracking and validation

Changes:
- Add unit_symbol and unit_name columns to size_measurements
- Add measurement_spec_id reference (optional for custom measurements)
- Update indexes for better performance
- Add validation constraints
"""

import logging
from sqlalchemy import text
from core.database import SessionLocalSizeColor

logger = logging.getLogger(__name__)


def enhance_size_measurement_specifications():
    """
    Enhance the size measurement system to support custom measurements with units
    """
    db = SessionLocalSizeColor()
    
    try:
        logger.info("🔄 Enhancing size measurement specifications...")
        
        # Step 1: Add new columns to size_measurements table
        logger.info("Adding new columns to size_measurements table...")
        
        # Add unit_symbol column (for unit conversion integration)
        db.execute(text("""
            ALTER TABLE size_measurements 
            ADD COLUMN IF NOT EXISTS unit_symbol VARCHAR(10) DEFAULT 'cm'
        """))
        
        # Add unit_name column (for display purposes)
        db.execute(text("""
            ALTER TABLE size_measurements 
            ADD COLUMN IF NOT EXISTS unit_name VARCHAR(50) DEFAULT 'Centimeter'
        """))
        
        # Add measurement_spec_id (optional reference to garment_measurement_specs)
        db.execute(text("""
            ALTER TABLE size_measurements 
            ADD COLUMN IF NOT EXISTS measurement_spec_id INTEGER REFERENCES garment_measurement_specs(id) ON DELETE SET NULL
        """))
        
        # Add is_custom flag to distinguish custom vs predefined measurements
        db.execute(text("""
            ALTER TABLE size_measurements 
            ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE
        """))
        
        # Add original_value and original_unit for tracking conversions
        db.execute(text("""
            ALTER TABLE size_measurements 
            ADD COLUMN IF NOT EXISTS original_value NUMERIC(10, 2)
        """))
        
        db.execute(text("""
            ALTER TABLE size_measurements 
            ADD COLUMN IF NOT EXISTS original_unit VARCHAR(10)
        """))
        
        db.commit()
        logger.info("✅ New columns added successfully")
        
        # Step 2: Update existing data with default values
        logger.info("Updating existing measurement data...")
        
        # Set default unit information for existing measurements
        db.execute(text("""
            UPDATE size_measurements 
            SET 
                unit_symbol = 'cm',
                unit_name = 'Centimeter',
                is_custom = FALSE,
                original_value = value_cm,
                original_unit = 'cm'
            WHERE unit_symbol IS NULL
        """))
        
        # Try to link existing measurements to measurement specs where possible
        db.execute(text("""
            UPDATE size_measurements 
            SET measurement_spec_id = gms.id
            FROM garment_measurement_specs gms, size_master szm
            WHERE szm.id = size_measurements.size_master_id
            AND gms.garment_type_id = szm.garment_type_id
            AND UPPER(gms.measurement_code) = UPPER(size_measurements.measurement_code)
            AND size_measurements.measurement_spec_id IS NULL
        """))
        
        db.commit()
        logger.info("✅ Existing data updated successfully")
        
        # Step 3: Add improved indexes for better performance
        logger.info("Adding performance indexes...")
        
        # Index for unit-based queries
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_size_measurements_unit_symbol 
            ON size_measurements(unit_symbol)
        """))
        
        # Index for custom measurements
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_size_measurements_is_custom 
            ON size_measurements(is_custom)
        """))
        
        # Index for measurement spec reference
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_size_measurements_spec_id 
            ON size_measurements(measurement_spec_id)
        """))
        
        # Composite index for size and measurement lookups
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_size_measurements_size_measurement 
            ON size_measurements(size_master_id, measurement_code, is_custom)
        """))
        
        db.commit()
        logger.info("✅ Performance indexes added successfully")
        
        # Step 4: Add constraints for data integrity
        logger.info("Adding data integrity constraints...")
        
        # Ensure unit_symbol is not null for new records
        db.execute(text("""
            ALTER TABLE size_measurements 
            ALTER COLUMN unit_symbol SET NOT NULL
        """))
        
        # Ensure unit_name is not null for new records
        db.execute(text("""
            ALTER TABLE size_measurements 
            ALTER COLUMN unit_name SET NOT NULL
        """))
        
        # Add check constraint for positive values
        db.execute(text("""
            ALTER TABLE size_measurements 
            ADD CONSTRAINT IF NOT EXISTS chk_size_measurements_positive_value 
            CHECK (value_cm > 0)
        """))
        
        # Add check constraint for valid tolerance values
        db.execute(text("""
            ALTER TABLE size_measurements 
            ADD CONSTRAINT IF NOT EXISTS chk_size_measurements_positive_tolerance 
            CHECK (tolerance_plus >= 0 AND tolerance_minus >= 0)
        """))
        
        db.commit()
        logger.info("✅ Data integrity constraints added successfully")
        
        # Step 5: Create a view for enhanced measurement data
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
        
        # Drop the old unique constraint
        db.execute(text("""
            ALTER TABLE size_measurements 
            DROP CONSTRAINT IF EXISTS uq_size_measurement
        """))
        
        # Add new unique constraint that allows multiple custom measurements with same code
        db.execute(text("""
            ALTER TABLE size_measurements 
            ADD CONSTRAINT uq_size_measurement_predefined 
            UNIQUE (size_master_id, measurement_code) 
            WHERE is_custom = FALSE
        """))
        
        db.commit()
        logger.info("✅ Unique constraints updated successfully")
        
        # Step 7: Create helper functions for unit conversion
        logger.info("Creating helper functions...")
        
        # Function to get measurement with preferred unit
        db.execute(text("""
            CREATE OR REPLACE FUNCTION get_measurement_in_unit(
                p_measurement_id INTEGER,
                p_target_unit VARCHAR(10) DEFAULT 'cm'
            ) RETURNS TABLE (
                measurement_id INTEGER,
                measurement_name VARCHAR(50),
                value_in_unit NUMERIC(10, 2),
                unit_symbol VARCHAR(10),
                unit_name VARCHAR(50)
            ) AS $$
            BEGIN
                -- This is a placeholder function
                -- In a real implementation, this would integrate with the unit conversion system
                RETURN QUERY
                SELECT 
                    sm.id,
                    sm.measurement_name,
                    CASE 
                        WHEN p_target_unit = 'cm' THEN sm.value_cm
                        WHEN p_target_unit = 'inch' THEN sm.value_inch
                        ELSE sm.value_cm -- Default to cm
                    END as value_in_unit,
                    p_target_unit as unit_symbol,
                    CASE 
                        WHEN p_target_unit = 'cm' THEN 'Centimeter'
                        WHEN p_target_unit = 'inch' THEN 'Inch'
                        ELSE 'Centimeter'
                    END as unit_name
                FROM size_measurements sm
                WHERE sm.id = p_measurement_id;
            END;
            $$ LANGUAGE plpgsql;
        """))
        
        db.commit()
        logger.info("✅ Helper functions created successfully")
        
        logger.info("🎉 Size measurement specifications enhancement completed successfully!")
        
        # Print summary
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
            logger.info(f"📊 Migration Statistics:")
            logger.info(f"   Total measurements: {stats[0]}")
            logger.info(f"   Custom measurements: {stats[1]}")
            logger.info(f"   Linked to specs: {stats[2]}")
            logger.info(f"   Unique units: {stats[3]}")
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def rollback_size_measurement_specifications():
    """
    Rollback the size measurement specifications enhancement
    """
    db = SessionLocalSizeColor()
    
    try:
        logger.info("🔄 Rolling back size measurement specifications enhancement...")
        
        # Drop the view
        db.execute(text("DROP VIEW IF EXISTS v_size_measurements_enhanced"))
        
        # Drop the helper function
        db.execute(text("DROP FUNCTION IF EXISTS get_measurement_in_unit(INTEGER, VARCHAR)"))
        
        # Drop new constraints
        db.execute(text("ALTER TABLE size_measurements DROP CONSTRAINT IF EXISTS uq_size_measurement_predefined"))
        db.execute(text("ALTER TABLE size_measurements DROP CONSTRAINT IF EXISTS chk_size_measurements_positive_value"))
        db.execute(text("ALTER TABLE size_measurements DROP CONSTRAINT IF EXISTS chk_size_measurements_positive_tolerance"))
        
        # Drop new indexes
        db.execute(text("DROP INDEX IF EXISTS ix_size_measurements_unit_symbol"))
        db.execute(text("DROP INDEX IF EXISTS ix_size_measurements_is_custom"))
        db.execute(text("DROP INDEX IF EXISTS ix_size_measurements_spec_id"))
        db.execute(text("DROP INDEX IF EXISTS ix_size_measurements_size_measurement"))
        
        # Drop new columns
        db.execute(text("ALTER TABLE size_measurements DROP COLUMN IF EXISTS unit_symbol"))
        db.execute(text("ALTER TABLE size_measurements DROP COLUMN IF EXISTS unit_name"))
        db.execute(text("ALTER TABLE size_measurements DROP COLUMN IF EXISTS measurement_spec_id"))
        db.execute(text("ALTER TABLE size_measurements DROP COLUMN IF EXISTS is_custom"))
        db.execute(text("ALTER TABLE size_measurements DROP COLUMN IF EXISTS original_value"))
        db.execute(text("ALTER TABLE size_measurements DROP COLUMN IF EXISTS original_unit"))
        
        # Restore original unique constraint
        db.execute(text("""
            ALTER TABLE size_measurements 
            ADD CONSTRAINT uq_size_measurement 
            UNIQUE (size_master_id, measurement_code)
        """))
        
        db.commit()
        logger.info("✅ Rollback completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Rollback failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    enhance_size_measurement_specifications()