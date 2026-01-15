"""
Migration: Update sample_primary_info table schema
- Change decorative_part from String to JSON
- Change additional_instruction from Text to JSON
- Remove decorative_details column
- Remove techpack_url and techpack_filename columns
- Add techpack_files JSON column
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import ProgrammingError
from core.database import engines, DatabaseType
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def update_sample_primary_info_schema():
    """
    Updates the sample_primary_info table to match the new schema:
    - decorative_part: String -> JSON
    - additional_instruction: Text -> JSON
    - Remove decorative_details
    - Remove techpack_url and techpack_filename
    - Add techpack_files JSON
    """
    engine = engines[DatabaseType.MERCHANDISER]
    
    with engine.connect() as connection:
        inspector = inspect(engine)
        
        # Check if table exists
        if "sample_primary_info" not in inspector.get_table_names():
            logger.error("Table 'sample_primary_info' does not exist!")
            return
        
        # Get existing columns
        columns = {col['name']: col for col in inspector.get_columns("sample_primary_info")}
        
        try:
            connection.execute(text("BEGIN"))
            
            # 1. Migrate decorative_part: String -> JSON (if exists and is String)
            if 'decorative_part' in columns:
                col_type = str(columns['decorative_part']['type'])
                if 'VARCHAR' in col_type or 'TEXT' in col_type:
                    logger.info("Migrating decorative_part from String to JSON...")
                    # Convert existing string values to JSON array
                    connection.execute(text("""
                        UPDATE sample_primary_info 
                        SET decorative_part = CASE 
                            WHEN decorative_part IS NULL OR decorative_part = '' THEN NULL
                            ELSE json_build_array(decorative_part)::jsonb
                        END
                    """))
                    # Alter column type to JSON
                    connection.execute(text("""
                        ALTER TABLE sample_primary_info 
                        ALTER COLUMN decorative_part TYPE jsonb USING decorative_part::jsonb
                    """))
                    logger.info("✅ decorative_part migrated to JSON")
            
            # 2. Migrate additional_instruction: Text -> JSON (if exists and is Text)
            if 'additional_instruction' in columns:
                col_type = str(columns['additional_instruction']['type'])
                if 'TEXT' in col_type or 'VARCHAR' in col_type:
                    logger.info("Migrating additional_instruction from Text to JSON...")
                    # Convert existing text values to JSON array of objects
                    connection.execute(text("""
                        UPDATE sample_primary_info 
                        SET additional_instruction = CASE 
                            WHEN additional_instruction IS NULL OR additional_instruction = '' THEN NULL
                            ELSE json_build_array(json_build_object('instruction', additional_instruction, 'done', false))::jsonb
                        END
                    """))
                    # Alter column type to JSON
                    connection.execute(text("""
                        ALTER TABLE sample_primary_info 
                        ALTER COLUMN additional_instruction TYPE jsonb USING additional_instruction::jsonb
                    """))
                    logger.info("✅ additional_instruction migrated to JSON")
            
            # 3. Remove decorative_details column if exists
            if 'decorative_details' in columns:
                logger.info("Removing decorative_details column...")
                connection.execute(text("ALTER TABLE sample_primary_info DROP COLUMN decorative_details"))
                logger.info("✅ decorative_details column removed")
            
            # 4. Migrate techpack_url and techpack_filename to techpack_files JSON
            if 'techpack_url' in columns or 'techpack_filename' in columns:
                logger.info("Migrating techpack_url/techpack_filename to techpack_files JSON...")
                
                # Add techpack_files column if it doesn't exist
                if 'techpack_files' not in columns:
                    connection.execute(text("""
                        ALTER TABLE sample_primary_info 
                        ADD COLUMN techpack_files jsonb
                    """))
                
                # Migrate existing data
                connection.execute(text("""
                    UPDATE sample_primary_info 
                    SET techpack_files = CASE 
                        WHEN (techpack_url IS NOT NULL AND techpack_url != '') 
                             OR (techpack_filename IS NOT NULL AND techpack_filename != '') 
                        THEN json_build_array(
                            json_build_object(
                                'url', COALESCE(techpack_url, ''),
                                'filename', COALESCE(techpack_filename, ''),
                                'type', CASE 
                                    WHEN techpack_filename LIKE '%.pdf' THEN 'pdf'
                                    WHEN techpack_filename LIKE '%.xls' OR techpack_filename LIKE '%.xlsx' THEN 'excel'
                                    WHEN techpack_filename LIKE '%.png' OR techpack_filename LIKE '%.jpg' OR techpack_filename LIKE '%.jpeg' THEN 'image'
                                    ELSE 'spec-sheet'
                                END
                            )
                        )::jsonb
                        ELSE NULL
                    END
                """))
                
                # Remove old columns
                if 'techpack_url' in columns:
                    connection.execute(text("ALTER TABLE sample_primary_info DROP COLUMN techpack_url"))
                    logger.info("✅ techpack_url column removed")
                if 'techpack_filename' in columns:
                    connection.execute(text("ALTER TABLE sample_primary_info DROP COLUMN techpack_filename"))
                    logger.info("✅ techpack_filename column removed")
                
                logger.info("✅ techpack_files JSON column added and data migrated")
            
            connection.execute(text("COMMIT"))
            logger.info("✅ Successfully updated sample_primary_info schema")
            
        except ProgrammingError as e:
            connection.execute(text("ROLLBACK"))
            logger.error(f"❌ Error updating schema: {e}")
            raise
        except Exception as e:
            connection.execute(text("ROLLBACK"))
            logger.error(f"❌ Unexpected error: {e}")
            raise

if __name__ == "__main__":
    update_sample_primary_info_schema()

