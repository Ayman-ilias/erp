"""
Migration: Add company_id to branches table
- Add company_id column (nullable for backward compatibility)
- Add index on company_id for joins
"""

from sqlalchemy import text
from core.database import SessionLocalSettings
from core.logging import setup_logging

logger = setup_logging()


def run_migration():
    """Add company_id to branches table"""
    with SessionLocalSettings() as db:
        try:
            logger.info("Starting branch-company linking migration...")
            
            # Check if company_id column exists
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='branches' AND column_name='company_id'
            """))
            
            if not result.fetchone():
                logger.info("Adding company_id column to branches...")
                db.execute(text("""
                    ALTER TABLE branches 
                    ADD COLUMN company_id INTEGER NULL
                """))
                db.commit()
                logger.info("✓ Added company_id column")
            else:
                logger.info("✓ company_id column already exists")
            
            # Check if index on company_id exists
            result = db.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename='branches' AND indexname='ix_branches_company_id'
            """))
            
            if not result.fetchone():
                logger.info("Adding index on company_id...")
                db.execute(text("""
                    CREATE INDEX ix_branches_company_id 
                    ON branches(company_id)
                """))
                db.commit()
                logger.info("✓ Added index on company_id")
            else:
                logger.info("✓ Index on company_id already exists")
            
            logger.info("✓ Branch-company linking migration completed successfully")
            
        except Exception as e:
            db.rollback()
            logger.error(f"✗ Migration failed: {e}")
            raise


if __name__ == "__main__":
    run_migration()
