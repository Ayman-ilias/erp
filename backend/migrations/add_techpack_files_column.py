"""
Quick Migration: Add techpack_files column to sample_primary_info table
This fixes the error: column sample_primary_info.techpack_files does not exist
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

def add_techpack_files_column():
    """
    Adds techpack_files JSON column to sample_primary_info table if it doesn't exist
    """
    engine = engines[DatabaseType.MERCHANDISER]
    
    try:
        with engine.connect() as connection:
            inspector = inspect(engine)
            
            # Check if table exists
            if "sample_primary_info" not in inspector.get_table_names():
                logger.error("Table 'sample_primary_info' does not exist!")
                return False
            
            # Get existing columns
            columns = {col['name'] for col in inspector.get_columns("sample_primary_info")}
            
            # Check if techpack_files column already exists
            if "techpack_files" in columns:
                logger.info("✅ Column 'techpack_files' already exists. No migration needed.")
                return True
            
            # Add the column
            logger.info("Adding 'techpack_files' JSON column to sample_primary_info table...")
            connection.execute(text("""
                ALTER TABLE sample_primary_info 
                ADD COLUMN techpack_files jsonb
            """))
            connection.commit()
            
            logger.info("✅ Successfully added 'techpack_files' column")
            return True
            
    except ProgrammingError as e:
        logger.error(f"❌ Database error: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = add_techpack_files_column()
    if success:
        print("✅ Migration completed successfully!")
        sys.exit(0)
    else:
        print("❌ Migration failed!")
        sys.exit(1)
