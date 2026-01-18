"""
Migration: Add priority column to sample_primary_info and sample_requests tables
Date: 2026-01-16
"""
from sqlalchemy import text
from core.database import SessionLocalMerchandiser, SessionLocalSamples
import logging

logger = logging.getLogger(__name__)

def run_migration():
    """Add priority column to both sample tables"""
    
    # Add to merchandiser database (sample_primary_info)
    merchandiser_db = SessionLocalMerchandiser()
    try:
        # Check if column exists
        result = merchandiser_db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='sample_primary_info' AND column_name='priority'
        """))
        
        if not result.fetchone():
            logger.info("Adding priority column to sample_primary_info...")
            merchandiser_db.execute(text("""
                ALTER TABLE sample_primary_info 
                ADD COLUMN priority VARCHAR(20) DEFAULT 'normal'
            """))
            merchandiser_db.commit()
            logger.info("✓ Priority column added to sample_primary_info")
        else:
            logger.info("✓ Priority column already exists in sample_primary_info")
    except Exception as e:
        logger.error(f"Error adding priority to sample_primary_info: {e}")
        merchandiser_db.rollback()
        raise
    finally:
        merchandiser_db.close()
    
    # Add to samples database (sample_requests)
    samples_db = SessionLocalSamples()
    try:
        # Check if column exists
        result = samples_db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='sample_requests' AND column_name='priority'
        """))
        
        if not result.fetchone():
            logger.info("Adding priority column to sample_requests...")
            samples_db.execute(text("""
                ALTER TABLE sample_requests 
                ADD COLUMN priority VARCHAR(20) DEFAULT 'normal'
            """))
            samples_db.commit()
            logger.info("✓ Priority column added to sample_requests")
        else:
            logger.info("✓ Priority column already exists in sample_requests")
    except Exception as e:
        logger.error(f"Error adding priority to sample_requests: {e}")
        samples_db.rollback()
        raise
    finally:
        samples_db.close()
    
    logger.info("Migration completed successfully!")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_migration()
