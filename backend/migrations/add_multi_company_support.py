"""
Migration: Add Multi-Company Support
- Add is_active column to company_profile table
- Add index on company_name for sorting
- Remove single-record constraint logic (handled in application layer)
"""

from sqlalchemy import text
from core.database import SessionLocalSettings
from core.logging import setup_logging

logger = setup_logging()


def run_migration():
    """Add multi-company support to company_profile table"""
    with SessionLocalSettings() as db:
        try:
            logger.info("Starting multi-company support migration...")
            
            # Check if is_active column exists
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='company_profile' AND column_name='is_active'
            """))
            
            if not result.fetchone():
                logger.info("Adding is_active column to company_profile...")
                db.execute(text("""
                    ALTER TABLE company_profile 
                    ADD COLUMN is_active BOOLEAN DEFAULT TRUE
                """))
                db.commit()
                logger.info("✓ Added is_active column")
            else:
                logger.info("✓ is_active column already exists")
            
            # Check if index on company_name exists
            result = db.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename='company_profile' AND indexname='ix_company_profile_company_name'
            """))
            
            if not result.fetchone():
                logger.info("Adding index on company_name...")
                db.execute(text("""
                    CREATE INDEX ix_company_profile_company_name 
                    ON company_profile(company_name)
                """))
                db.commit()
                logger.info("✓ Added index on company_name")
            else:
                logger.info("✓ Index on company_name already exists")
            
            logger.info("✓ Multi-company support migration completed successfully")
            
        except Exception as e:
            db.rollback()
            logger.error(f"✗ Migration failed: {e}")
            raise


if __name__ == "__main__":
    run_migration()
