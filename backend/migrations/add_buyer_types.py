"""
Migration to add buyer_types table and buyer_type_id to buyers table
"""

from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)


def add_buyer_types():
    """Add buyer_types table and buyer_type_id column to buyers table"""
    engine = engines[DatabaseType.CLIENTS]
    
    with engine.begin() as conn:
        try:
            # Create buyer_types table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS buyer_types (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR NOT NULL UNIQUE,
                    description TEXT,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE
                );
            """))
            
            # Add index on name for faster lookups
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_buyer_types_name ON buyer_types(name);
            """))
            
            # Check if buyer_type_id column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='buyers' 
                AND column_name='buyer_type_id'
            """))
            
            if not result.fetchone():
                # Add buyer_type_id column to buyers table
                conn.execute(text("""
                    ALTER TABLE buyers 
                    ADD COLUMN buyer_type_id INTEGER 
                    REFERENCES buyer_types(id) ON DELETE SET NULL;
                """))
                
                # Add index on buyer_type_id for faster joins
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_buyers_buyer_type_id ON buyers(buyer_type_id);
                """))
                logger.info("✅ Added buyer_type_id column to buyers table")
            else:
                logger.info("Column 'buyer_type_id' already exists in buyers table")
            
            # Insert some default buyer types
            conn.execute(text("""
                INSERT INTO buyer_types (name, description, is_active) 
                VALUES 
                    ('Retail', 'Retail buyers and chains', TRUE),
                    ('Wholesale', 'Wholesale distributors', TRUE),
                    ('Brand', 'Brand owners and manufacturers', TRUE),
                    ('Export', 'Export customers', TRUE)
                ON CONFLICT (name) DO NOTHING;
            """))
            
            logger.info("✅ Buyer types migration completed successfully")
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            raise


if __name__ == "__main__":
    add_buyer_types()