"""
Migration: Create Country and Port tables
- Create countries table with ISO codes
- Create ports table with UN/LOCODE codes
- Add foreign key index on ports.country_id
"""

from sqlalchemy import text
from core.database import SessionLocalSettings
from core.logging import setup_logging

logger = setup_logging()


def run_migration():
    """Create Country and Port tables"""
    with SessionLocalSettings() as db:
        try:
            logger.info("Starting Country and Port tables migration...")
            
            # Check if countries table exists
            result = db.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name='countries'
            """))
            
            if not result.fetchone():
                logger.info("Creating countries table...")
                db.execute(text("""
                    CREATE TABLE countries (
                        id SERIAL PRIMARY KEY,
                        country_name VARCHAR(255) NOT NULL UNIQUE,
                        country_code VARCHAR(3) NOT NULL UNIQUE,
                        country_code_2 VARCHAR(2),
                        region VARCHAR(100),
                        currency_code VARCHAR(3),
                        phone_code VARCHAR(10),
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE
                    )
                """))
                
                # Add indexes
                db.execute(text("""
                    CREATE INDEX ix_countries_id ON countries(id)
                """))
                db.execute(text("""
                    CREATE INDEX ix_countries_country_name ON countries(country_name)
                """))
                
                db.commit()
                logger.info("✓ Created countries table")
            else:
                logger.info("✓ countries table already exists")
            
            # Check if ports table exists
            result = db.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name='ports'
            """))
            
            if not result.fetchone():
                logger.info("Creating ports table...")
                db.execute(text("""
                    CREATE TABLE ports (
                        id SERIAL PRIMARY KEY,
                        country_id INTEGER NOT NULL,
                        port_name VARCHAR(255) NOT NULL,
                        port_code VARCHAR(10) NOT NULL UNIQUE,
                        port_type VARCHAR(50),
                        latitude NUMERIC(10, 7),
                        longitude NUMERIC(10, 7),
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE
                    )
                """))
                
                # Add indexes
                db.execute(text("""
                    CREATE INDEX ix_ports_id ON ports(id)
                """))
                db.execute(text("""
                    CREATE INDEX ix_ports_country_id ON ports(country_id)
                """))
                db.execute(text("""
                    CREATE INDEX ix_ports_port_name ON ports(port_name)
                """))
                
                db.commit()
                logger.info("✓ Created ports table")
            else:
                logger.info("✓ ports table already exists")
            
            logger.info("✓ Country and Port tables migration completed successfully")
            
        except Exception as e:
            db.rollback()
            logger.error(f"✗ Migration failed: {e}")
            raise


if __name__ == "__main__":
    run_migration()
