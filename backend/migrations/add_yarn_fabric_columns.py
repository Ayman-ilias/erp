"""
Migration: Add yarn_composition_details and cuttable_width columns
This migration adds the new columns needed for:
1. yarn_composition_details (JSON) - for yarn composition popup data
2. cuttable_width - for fabric details
"""
import logging
from sqlalchemy import text
from core.database import engines, DatabaseType

logger = logging.getLogger(__name__)

def run_migration():
    """Add yarn_composition_details and cuttable_width columns"""
    logger.info("=" * 60)
    logger.info("Running migration: add_yarn_fabric_columns")
    logger.info("=" * 60)

    engine = engines[DatabaseType.MERCHANDISER]
    with engine.connect() as conn:
        # Add yarn_composition_details column to yarn_details
        try:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'yarn_details' AND column_name = 'yarn_composition_details'
            """))
            if result.fetchone() is None:
                logger.info("Adding yarn_composition_details column to yarn_details...")
                conn.execute(text("""
                    ALTER TABLE yarn_details
                    ADD COLUMN yarn_composition_details JSONB DEFAULT NULL
                """))
                conn.commit()
                logger.info("✓ Added yarn_composition_details column")
            else:
                logger.info("✓ yarn_composition_details column already exists")
        except Exception as e:
            logger.error(f"Error adding yarn_composition_details: {e}")
            conn.rollback()

        # Add cuttable_width column to fabric_details
        try:
            result = conn.execute(text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'fabric_details' AND column_name = 'cuttable_width'
            """))
            if result.fetchone() is None:
                logger.info("Adding cuttable_width column to fabric_details...")
                conn.execute(text("""
                    ALTER TABLE fabric_details
                    ADD COLUMN cuttable_width VARCHAR DEFAULT NULL
                """))
                conn.commit()
                logger.info("✓ Added cuttable_width column")
            else:
                logger.info("✓ cuttable_width column already exists")
        except Exception as e:
            logger.error(f"Error adding cuttable_width: {e}")
            conn.rollback()

        # Create trims_accessories_details table if it doesn't exist
        try:
            result = conn.execute(text("""
                SELECT table_name FROM information_schema.tables
                WHERE table_name = 'trims_accessories_details'
            """))
            if result.fetchone() is None:
                logger.info("Creating trims_accessories_details table...")
                conn.execute(text("""
                    CREATE TABLE trims_accessories_details (
                        id SERIAL PRIMARY KEY,
                        product_id VARCHAR UNIQUE NOT NULL,
                        product_name VARCHAR NOT NULL,
                        category VARCHAR,
                        sub_category VARCHAR,
                        product_type VARCHAR NOT NULL DEFAULT 'trims',
                        unit_id INTEGER NOT NULL DEFAULT 1,
                        uom VARCHAR NOT NULL DEFAULT 'pcs',
                        consumable_flag BOOLEAN DEFAULT TRUE,
                        remarks TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE
                    )
                """))
                conn.execute(text("""
                    CREATE INDEX idx_trims_accessories_product_id ON trims_accessories_details(product_id)
                """))
                conn.execute(text("""
                    CREATE INDEX idx_trims_accessories_product_type ON trims_accessories_details(product_type)
                """))
                conn.commit()
                logger.info("✓ Created trims_accessories_details table")
            else:
                logger.info("✓ trims_accessories_details table already exists")
        except Exception as e:
            logger.error(f"Error creating trims_accessories_details table: {e}")
            conn.rollback()

    logger.info("=" * 60)
    logger.info("Migration add_yarn_fabric_columns completed")
    logger.info("=" * 60)
