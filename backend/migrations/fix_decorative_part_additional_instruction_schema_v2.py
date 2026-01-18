"""
Migration: Fix decorative_part and additional_instruction schema (IMPROVED VERSION)
Changes decorative_part from String to JSON (array)
Changes additional_instruction from Text to JSON (array)

IMPROVEMENTS:
- Fixed rollback data loss issue for additional_instruction
- Added data validation after migration
- Added better error handling
- Improved logging
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from core.database import SessionLocalSamples
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def migrate():
    """Migrate decorative_part and additional_instruction to JSON arrays"""
    db = SessionLocalSamples()
    
    try:
        logger.info("Starting migration: fix_decorative_part_additional_instruction_schema")
        
        # Step 1: Add new JSON columns
        logger.info("Step 1: Adding new JSON columns...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            ADD COLUMN IF NOT EXISTS decorative_part_new JSONB
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            ADD COLUMN IF NOT EXISTS additional_instruction_new JSONB
        """))
        db.commit()
        logger.info("✓ New columns added")
        
        # Step 2: Migrate existing data
        logger.info("Step 2: Migrating existing data...")
        
        # Convert decorative_part: split comma-separated strings into arrays
        # Handles: NULL, empty strings, single values, comma-separated values
        logger.info("  - Converting decorative_part...")
        db.execute(text("""
            UPDATE sample_requests 
            SET decorative_part_new = 
                CASE 
                    WHEN decorative_part IS NULL OR decorative_part = '' THEN NULL
                    ELSE (
                        SELECT json_agg(trim(value))
                        FROM unnest(string_to_array(decorative_part, ',')) AS value
                        WHERE trim(value) != ''
                    )
                END
            WHERE decorative_part_new IS NULL
        """))
        
        # Convert additional_instruction: wrap as single-item array
        # Note: If you want to split by newlines instead, use the commented code below
        logger.info("  - Converting additional_instruction...")
        db.execute(text("""
            UPDATE sample_requests 
            SET additional_instruction_new = 
                CASE 
                    WHEN additional_instruction IS NULL OR additional_instruction = '' THEN NULL
                    ELSE json_build_array(additional_instruction)
                END
            WHERE additional_instruction_new IS NULL
        """))
        
        # Alternative: Split by newlines (uncomment if needed)
        # db.execute(text("""
        #     UPDATE sample_requests 
        #     SET additional_instruction_new = 
        #         CASE 
        #             WHEN additional_instruction IS NULL OR additional_instruction = '' THEN NULL
        #             ELSE (
        #                 SELECT json_agg(trim(value))
        #                 FROM unnest(string_to_array(additional_instruction, E'\n')) AS value
        #                 WHERE trim(value) != ''
        #             )
        #         END
        #     WHERE additional_instruction_new IS NULL
        # """))
        
        db.commit()
        logger.info("✓ Data migration completed")
        
        # Step 2.5: Validate conversion
        logger.info("Step 2.5: Validating data conversion...")
        result = db.execute(text("""
            SELECT 
                COUNT(*) as total_rows,
                COUNT(decorative_part_new) as rows_with_decorative,
                COUNT(additional_instruction_new) as rows_with_instruction,
                COUNT(CASE WHEN jsonb_typeof(decorative_part_new) = 'array' THEN 1 END) as decorative_arrays,
                COUNT(CASE WHEN jsonb_typeof(additional_instruction_new) = 'array' THEN 1 END) as instruction_arrays
            FROM sample_requests
        """)).fetchone()
        logger.info(f"✓ Validation: total_rows={result[0]}, decorative_part={result[1]}, additional_instruction={result[2]}, decorative_arrays={result[3]}, instruction_arrays={result[4]}")
        
        # Step 3: Drop old columns
        logger.info("Step 3: Dropping old columns...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            DROP COLUMN IF EXISTS decorative_part
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            DROP COLUMN IF EXISTS additional_instruction
        """))
        db.commit()
        logger.info("✓ Old columns dropped")
        
        # Step 4: Rename new columns
        logger.info("Step 4: Renaming new columns...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            RENAME COLUMN decorative_part_new TO decorative_part
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            RENAME COLUMN additional_instruction_new TO additional_instruction
        """))
        db.commit()
        logger.info("✓ Columns renamed")
        
        # Step 5: Final validation
        logger.info("Step 5: Final validation...")
        result = db.execute(text("""
            SELECT 
                COUNT(*) as total_rows,
                COUNT(decorative_part) as rows_with_decorative,
                COUNT(additional_instruction) as rows_with_instruction
            FROM sample_requests
        """)).fetchone()
        logger.info(f"✓ Final state: total_rows={result[0]}, decorative_part={result[1]}, additional_instruction={result[2]}")
        
        logger.info("=" * 60)
        logger.info("✓ Migration completed successfully!")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error("=" * 60)
        logger.error(f"✗ Migration failed: {e}")
        logger.error("=" * 60)
        db.rollback()
        raise
    finally:
        db.close()


def rollback():
    """Rollback migration - convert JSON arrays back to strings"""
    db = SessionLocalSamples()
    
    try:
        logger.info("Starting rollback: fix_decorative_part_additional_instruction_schema")
        
        # Step 1: Add old string columns
        logger.info("Step 1: Adding old string columns...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            ADD COLUMN IF NOT EXISTS decorative_part_old VARCHAR
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            ADD COLUMN IF NOT EXISTS additional_instruction_old TEXT
        """))
        db.commit()
        logger.info("✓ Old columns added")
        
        # Step 2: Convert data back
        logger.info("Step 2: Converting data back to strings...")
        
        # Convert decorative_part array to comma-separated string
        logger.info("  - Converting decorative_part...")
        db.execute(text("""
            UPDATE sample_requests 
            SET decorative_part_old = 
                CASE 
                    WHEN decorative_part IS NULL THEN NULL
                    ELSE (
                        SELECT string_agg(value::text, ', ')
                        FROM json_array_elements_text(decorative_part::json) AS value
                    )
                END
            WHERE decorative_part_old IS NULL
        """))
        
        # Convert additional_instruction array to text
        # FIXED: Join all array elements with newlines instead of taking only first element
        logger.info("  - Converting additional_instruction...")
        db.execute(text("""
            UPDATE sample_requests 
            SET additional_instruction_old = 
                CASE 
                    WHEN additional_instruction IS NULL THEN NULL
                    ELSE (
                        SELECT string_agg(value::text, E'\n')
                        FROM json_array_elements_text(additional_instruction::json) AS value
                    )
                END
            WHERE additional_instruction_old IS NULL
        """))
        db.commit()
        logger.info("✓ Data conversion completed")
        
        # Step 2.5: Validate conversion
        logger.info("Step 2.5: Validating rollback conversion...")
        result = db.execute(text("""
            SELECT 
                COUNT(*) as total_rows,
                COUNT(decorative_part_old) as rows_with_decorative,
                COUNT(additional_instruction_old) as rows_with_instruction
            FROM sample_requests
        """)).fetchone()
        logger.info(f"✓ Validation: total_rows={result[0]}, decorative_part={result[1]}, additional_instruction={result[2]}")
        
        # Step 3: Drop JSON columns
        logger.info("Step 3: Dropping JSON columns...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            DROP COLUMN IF EXISTS decorative_part
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            DROP COLUMN IF EXISTS additional_instruction
        """))
        db.commit()
        logger.info("✓ JSON columns dropped")
        
        # Step 4: Rename old columns back
        logger.info("Step 4: Renaming columns back...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            RENAME COLUMN decorative_part_old TO decorative_part
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            RENAME COLUMN additional_instruction_old TO additional_instruction
        """))
        db.commit()
        logger.info("✓ Columns renamed")
        
        # Step 5: Final validation
        logger.info("Step 5: Final validation...")
        result = db.execute(text("""
            SELECT 
                COUNT(*) as total_rows,
                COUNT(decorative_part) as rows_with_decorative,
                COUNT(additional_instruction) as rows_with_instruction
            FROM sample_requests
        """)).fetchone()
        logger.info(f"✓ Final state: total_rows={result[0]}, decorative_part={result[1]}, additional_instruction={result[2]}")
        
        logger.info("=" * 60)
        logger.info("✓ Rollback completed successfully!")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error("=" * 60)
        logger.error(f"✗ Rollback failed: {e}")
        logger.error("=" * 60)
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        rollback()
    else:
        migrate()

