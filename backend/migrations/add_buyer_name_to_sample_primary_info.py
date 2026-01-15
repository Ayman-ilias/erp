"""
Migration: Add buyer_name column to sample_primary_info table
"""
from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)

def add_buyer_name_column():
    """Add buyer_name column to sample_primary_info table if it doesn't exist"""
    engine = engines[DatabaseType.MERCHANDISER]
    
    with engine.begin() as conn:
        try:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='sample_primary_info' 
                AND column_name='buyer_name'
            """))
            
            if result.fetchone():
                logger.info("Column 'buyer_name' already exists in sample_primary_info table")
                return
            
            # Add the column
            conn.execute(text("""
                ALTER TABLE sample_primary_info 
                ADD COLUMN buyer_name VARCHAR
            """))
            logger.info("✅ Successfully added 'buyer_name' column to sample_primary_info table")
            
        except Exception as e:
            logger.error(f"Error adding buyer_name column: {str(e)}")
            raise

if __name__ == "__main__":
    add_buyer_name_column()

