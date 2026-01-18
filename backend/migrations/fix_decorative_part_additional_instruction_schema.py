"""
Migration: Fix decorative_part and additional_instruction schema
Changes decorative_part from String to JSON (array)
Changes additional_instruction from Text to JSON (array)
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
        logger.info("Adding new JSON columns...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            ADD COLUMN IF NOT EXISTS decorative_part_new JSONB
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            ADD COLUMN IF NOT EXISTS additional_instruction_new JSONB
        """))
        db.commit()
        
        # Step 2: Migrate existing data
        logger.info("Migrating existing data...")
        
        # Convert decorative_part: split comma-separated strings into arrays
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
        
        # Convert additional_instruction: split by newlines or keep as single-item array
        db.execute(text("""
            UPDATE sample_requests 
            SET additional_instruction_new = 
                CASE 
                    WHEN additional_instruction IS NULL OR additional_instruction = '' THEN NULL
                    ELSE json_build_array(additional_instruction)
                END
            WHERE additional_instruction_new IS NULL
        """))
        db.commit()
        
        # Step 3: Drop old columns
        logger.info("Dropping old columns...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            DROP COLUMN IF EXISTS decorative_part
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            DROP COLUMN IF EXISTS additional_instruction
        """))
        db.commit()
        
        # Step 4: Rename new columns
        logger.info("Renaming new columns...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            RENAME COLUMN decorative_part_new TO decorative_part
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            RENAME COLUMN additional_instruction_new TO additional_instruction
        """))
        db.commit()
        
        logger.info("Migration completed successfully!")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
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
        logger.info("Adding old string columns...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            ADD COLUMN IF NOT EXISTS decorative_part_old VARCHAR
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            ADD COLUMN IF NOT EXISTS additional_instruction_old TEXT
        """))
        db.commit()
        
        # Step 2: Convert data back
        logger.info("Converting data back to strings...")
        
        # Convert decorative_part array to comma-separated string
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
        
        # Convert additional_instruction array to text (take first element)
        db.execute(text("""
            UPDATE sample_requests 
            SET additional_instruction_old = 
                CASE 
                    WHEN additional_instruction IS NULL THEN NULL
                    ELSE (additional_instruction::json->>0)
                END
            WHERE additional_instruction_old IS NULL
        """))
        db.commit()
        
        # Step 3: Drop JSON columns
        logger.info("Dropping JSON columns...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            DROP COLUMN IF EXISTS decorative_part
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            DROP COLUMN IF EXISTS additional_instruction
        """))
        db.commit()
        
        # Step 4: Rename old columns back
        logger.info("Renaming columns back...")
        db.execute(text("""
            ALTER TABLE sample_requests 
            RENAME COLUMN decorative_part_old TO decorative_part
        """))
        db.execute(text("""
            ALTER TABLE sample_requests 
            RENAME COLUMN additional_instruction_old TO additional_instruction
        """))
        db.commit()
        
        logger.info("Rollback completed successfully!")
        
    except Exception as e:
        logger.error(f"Rollback failed: {e}")
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
