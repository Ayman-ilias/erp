"""
Migration: Add expecting_end_date column to sample_status table in both samples and merchandiser databases
"""
from sqlalchemy import text
from sqlalchemy.engine import Engine
import logging

logger = logging.getLogger(__name__)

def add_expecting_end_date_to_sample_status(engine: Engine):
    """Add expecting_end_date column to sample_status table"""
    
    try:
        logger.info("Running expecting_end_date column migration for sample_status table...")
        with engine.begin() as conn:
            # Check if table exists
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name='sample_status'
            """))
            
            if not result.fetchone():
                logger.info("sample_status table does not exist, will be created on next init_db()")
                return
            
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='sample_status' 
                AND column_name='expecting_end_date'
            """))
            
            if result.fetchone():
                logger.info("Column 'expecting_end_date' already exists in sample_status table")
                return
            
            # Add the column
            conn.execute(text("""
                ALTER TABLE sample_status 
                ADD COLUMN expecting_end_date TIMESTAMP WITH TIME ZONE
            """))
            
            logger.info("✅ Successfully added expecting_end_date column to sample_status table")
            
    except Exception as e:
        logger.error(f"Error adding expecting_end_date column: {str(e)}", exc_info=True)
        raise

