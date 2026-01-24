"""
Migration: Add page_permissions column to users table
This migration adds the page_permissions JSON column for page-level read/write permissions
"""
import logging
from sqlalchemy import text
from core.database import engines, DatabaseType

logger = logging.getLogger(__name__)

def run_migration():
    """Add page_permissions column to users table"""
    logger.info("=" * 60)
    logger.info("Running migration: add_page_permissions_to_users")
    logger.info("=" * 60)

    engine = engines[DatabaseType.USERS]
    with engine.connect() as conn:
        try:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = 'page_permissions'
            """))
            if result.fetchone() is None:
                logger.info("Adding page_permissions column to users table...")
                conn.execute(text("""
                    ALTER TABLE users
                    ADD COLUMN page_permissions JSONB DEFAULT '{}'::jsonb
                """))
                conn.commit()
                logger.info("✓ Added page_permissions column to users table")
            else:
                logger.info("✓ page_permissions column already exists")
        except Exception as e:
            logger.error(f"Error adding page_permissions column: {e}")
            conn.rollback()

    logger.info("=" * 60)
    logger.info("Migration add_page_permissions_to_users completed")
    logger.info("=" * 60)
