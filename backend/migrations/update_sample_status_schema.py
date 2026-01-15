"""
Migration: Update sample_status table schema to match Samples module structure
Changes old columns to new column names:
- status_from_sample -> status_by_sample
- status_from_buyer -> (removed)
- status_by_merchandiser -> status_from_merchandiser
- note -> notes
- Add updated_by column
"""
from sqlalchemy import text
from sqlalchemy.engine import Engine
import logging

logger = logging.getLogger(__name__)

def update_sample_status_schema(engine: Engine):
    """Update sample_status table schema to match new model structure"""
    
    try:
        logger.info("Running sample_status table schema migration...")
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
            
            # Get current columns
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='sample_status'
                ORDER BY column_name
            """))
            existing_columns = {row[0] for row in result.fetchall()}
            logger.info(f"Existing columns: {existing_columns}")
            
            # Migration steps:
            # 1. Add new columns if they don't exist
            new_columns = [
                ("status_by_sample", "VARCHAR"),
                ("status_from_merchandiser", "VARCHAR"),
                ("notes", "TEXT"),
                ("updated_by", "VARCHAR"),
            ]
            
            for column_name, column_type in new_columns:
                if column_name not in existing_columns:
                    logger.info(f"Adding '{column_name}' column to sample_status table...")
                    conn.execute(text(f"""
                        ALTER TABLE sample_status 
                        ADD COLUMN {column_name} {column_type}
                    """))
                    logger.info(f"✅ Successfully added '{column_name}' column")
                else:
                    logger.info(f"Column '{column_name}' already exists")
            
            # 2. Migrate data from old columns to new columns
            # Check if old columns exist and migrate data
            if "status_from_sample" in existing_columns and "status_by_sample" in existing_columns:
                logger.info("Migrating data from status_from_sample to status_by_sample...")
                conn.execute(text("""
                    UPDATE sample_status 
                    SET status_by_sample = status_from_sample 
                    WHERE status_by_sample IS NULL AND status_from_sample IS NOT NULL
                """))
                logger.info("✅ Data migrated from status_from_sample to status_by_sample")
            
            if "status_by_merchandiser" in existing_columns and "status_from_merchandiser" in existing_columns:
                logger.info("Migrating data from status_by_merchandiser to status_from_merchandiser...")
                conn.execute(text("""
                    UPDATE sample_status 
                    SET status_from_merchandiser = status_by_merchandiser 
                    WHERE status_from_merchandiser IS NULL AND status_by_merchandiser IS NOT NULL
                """))
                logger.info("✅ Data migrated from status_by_merchandiser to status_from_merchandiser")
            
            if "note" in existing_columns and "notes" in existing_columns:
                logger.info("Migrating data from note to notes...")
                conn.execute(text("""
                    UPDATE sample_status 
                    SET notes = note 
                    WHERE notes IS NULL AND note IS NOT NULL
                """))
                logger.info("✅ Data migrated from note to notes")
            
            # 3. Drop old columns (only after confirming data migration)
            old_columns_to_drop = ["status_from_sample", "status_from_buyer", "status_by_merchandiser", "note"]
            
            for column_name in old_columns_to_drop:
                if column_name in existing_columns:
                    logger.info(f"Dropping old column '{column_name}' from sample_status table...")
                    try:
                        conn.execute(text(f"""
                            ALTER TABLE sample_status 
                            DROP COLUMN {column_name}
                        """))
                        logger.info(f"✅ Successfully dropped '{column_name}' column")
                    except Exception as e:
                        logger.warning(f"Could not drop column '{column_name}': {str(e)}")
            
            logger.info("✅ sample_status table schema migration completed successfully")
            
    except Exception as e:
        logger.error(f"Migration error: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    from core.database import engines, DatabaseType
    update_sample_status_schema(engines[DatabaseType.MERCHANDISER])

