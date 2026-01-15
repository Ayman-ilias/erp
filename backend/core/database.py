from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError, IntegrityError, ProgrammingError
from .config import settings
from enum import Enum
import time
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseType(Enum):
    """Database type enum for multi-database architecture"""
    CLIENTS = "clients"
    SAMPLES = "samples"
    USERS = "users"
    ORDERS = "orders"
    MERCHANDISER = "merchandiser"
    SETTINGS = "settings"


# Connection pool settings (optimized for multi-database setup)
# With 6 databases, we need to be careful about total connections
# PostgreSQL default max_connections is 100
# pool_size * 6 databases should be < max_connections
POOL_SETTINGS = {
    "pool_pre_ping": True,
    "pool_size": settings.POOL_SIZE,  # 10 * 6 = 60 connections base
    "max_overflow": settings.MAX_OVERFLOW,  # +60 = 120 max
    "pool_recycle": 1800,
    "pool_timeout": 60,
    "echo_pool": False,
    "pool_use_lifo": True,
}

# Create engines for each database
engines = {
    DatabaseType.CLIENTS: create_engine(settings.DATABASE_URL_CLIENTS, **POOL_SETTINGS),
    DatabaseType.SAMPLES: create_engine(settings.DATABASE_URL_SAMPLES, **POOL_SETTINGS),
    DatabaseType.USERS: create_engine(settings.DATABASE_URL_USERS, **POOL_SETTINGS),
    DatabaseType.ORDERS: create_engine(settings.DATABASE_URL_ORDERS, **POOL_SETTINGS),
    DatabaseType.MERCHANDISER: create_engine(settings.DATABASE_URL_MERCHANDISER, **POOL_SETTINGS),
    DatabaseType.SETTINGS: create_engine(settings.DATABASE_URL_SETTINGS, **POOL_SETTINGS),
}

# Create SessionLocal classes for each database
SessionLocalClients = sessionmaker(autocommit=False, autoflush=False, bind=engines[DatabaseType.CLIENTS])
SessionLocalSamples = sessionmaker(autocommit=False, autoflush=False, bind=engines[DatabaseType.SAMPLES])
SessionLocalUsers = sessionmaker(autocommit=False, autoflush=False, bind=engines[DatabaseType.USERS])
SessionLocalOrders = sessionmaker(autocommit=False, autoflush=False, bind=engines[DatabaseType.ORDERS])
SessionLocalMerchandiser = sessionmaker(autocommit=False, autoflush=False, bind=engines[DatabaseType.MERCHANDISER])
SessionLocalSettings = sessionmaker(autocommit=False, autoflush=False, bind=engines[DatabaseType.SETTINGS])

# Create separate Base classes for each database
BaseClients = declarative_base()
BaseSamples = declarative_base()
BaseUsers = declarative_base()
BaseOrders = declarative_base()
BaseMerchandiser = declarative_base()
BaseSettings = declarative_base()

# Legacy aliases for backward compatibility
engine = engines[DatabaseType.SAMPLES]
SessionLocal = SessionLocalSamples
Base = BaseSamples


def get_db_clients():
    """Get database session for clients DB"""
    db = SessionLocalClients()
    try:
        yield db
    finally:
        db.close()


def get_db_samples():
    """Get database session for samples DB"""
    db = SessionLocalSamples()
    try:
        yield db
    finally:
        db.close()


def get_db_users():
    """Get database session for users DB"""
    db = SessionLocalUsers()
    try:
        yield db
    finally:
        db.close()


def get_db_orders():
    """Get database session for orders DB"""
    db = SessionLocalOrders()
    try:
        yield db
    finally:
        db.close()


def get_db_merchandiser():
    """Get database session for merchandiser DB"""
    db = SessionLocalMerchandiser()
    try:
        yield db
    finally:
        db.close()


def get_db_settings():
    """Get database session for settings DB"""
    db = SessionLocalSettings()
    try:
        yield db
    finally:
        db.close()


def get_db():
    """Legacy dependency - defaults to samples DB for backward compatibility"""
    db = SessionLocalSamples()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize all databases - create all tables"""
    max_retries = 5
    retry_interval = 5

    # Import all models to register them with their respective Base metadata
    # This must be done before calling create_all() so SQLAlchemy knows about all tables
    try:
        # Import Clients models
        from modules.clients.models.client import (
            BuyerType, Buyer, Supplier, ContactPerson, ShippingInfo, BankingInfo
        )
        
        # Import Samples models
        from modules.samples.models.sample import (
            StyleSummary, StyleVariant as SampleStyleVariant,
            SampleRequest, SamplePlan, SampleRequiredMaterial,
            SampleOperation, ManufacturingOperation,
            SampleTNA, SampleStatus as SampleStatusModel,
            SMVCalculation
        )
        
        # Import Users models
        from modules.users.models.user import User, Role, Permission
        
        # Import Notifications models
        from modules.notifications.models.notification import Notification
        
        # Import Orders models
        from modules.orders.models.order import OrderManagement
        
        # Import Merchandiser models
        from modules.merchandiser.models.merchandiser import (
            YarnDetail, FabricDetail, TrimsDetail, AccessoriesDetail,
            FinishedGoodDetail, PackingGoodDetail, SizeChart,
            SamplePrimaryInfo, SampleTNAColorWise, SampleStatus,
            StyleCreation, StyleBasicInfo, StyleMaterialLink,
            StyleColor, StyleSize, StyleVariant, CMCalculation
        )
        
        # Import Settings models
        from modules.settings.models.settings import (
            CompanyProfile, Branch, Department, UserRole,
            Color, Country, Currency, UnitOfMeasure, Tax,
            FiscalYear, DocumentNumbering, PerMinuteValue, Warehouse, Account
        )
        
        logger.info("All models imported successfully")
    except ImportError as e:
        logger.warning(f"Some models could not be imported: {e}. Tables may not be created.")

    databases = [
        (DatabaseType.CLIENTS, BaseClients, "Clients"),
        (DatabaseType.SAMPLES, BaseSamples, "Samples"),
        (DatabaseType.USERS, BaseUsers, "Users"),
        (DatabaseType.ORDERS, BaseOrders, "Orders"),
        (DatabaseType.MERCHANDISER, BaseMerchandiser, "Merchandiser"),
        (DatabaseType.SETTINGS, BaseSettings, "Settings"),
    ]

    for db_type, base_class, db_name in databases:
        for attempt in range(max_retries):
            try:
                logger.info(f"Connecting to {db_name} database (attempt {attempt + 1}/{max_retries})...")
                base_class.metadata.create_all(bind=engines[db_type], checkfirst=True)
                logger.info(f"{db_name} database tables created successfully!")
                
                # Run migrations for specific databases
                if db_type == DatabaseType.MERCHANDISER:
                    try:
                        _run_merchandiser_migrations(engines[db_type])
                    except Exception as mig_error:
                        logger.warning(f"Migration warning: {mig_error}")
                
                if db_type == DatabaseType.SAMPLES:
                    try:
                        _run_samples_migrations(engines[db_type])
                    except Exception as mig_error:
                        logger.warning(f"Migration warning: {mig_error}")
                
                break
            except OperationalError as e:
                if attempt < max_retries - 1:
                    logger.warning(f"{db_name} DB connection failed: {e}. Retrying in {retry_interval}s...")
                    time.sleep(retry_interval)
                else:
                    logger.error(f"Failed to connect to {db_name} database after {max_retries} attempts")
                    raise
            except (IntegrityError, ProgrammingError) as e:
                # Tables already exist - this is fine, continue
                logger.info(f"{db_name} database tables already exist, skipping creation.")
                
                # Still run migrations even if tables exist
                if db_type == DatabaseType.MERCHANDISER:
                    try:
                        _run_merchandiser_migrations(engines[db_type])
                    except Exception as mig_error:
                        logger.warning(f"Migration warning: {mig_error}")
                
                if db_type == DatabaseType.SAMPLES:
                    try:
                        _run_samples_migrations(engines[db_type])
                    except Exception as mig_error:
                        logger.warning(f"Migration warning: {mig_error}")
                
                break

    return True


def _run_merchandiser_migrations(engine):
    """Run migrations for merchandiser database"""
    from sqlalchemy import text
    from sqlalchemy import inspect as sql_inspect
    
    try:
        logger.info("Running merchandiser database migrations...")
        
        # First, run the comprehensive schema update migration
        try:
            from migrations.update_sample_primary_info_schema import update_sample_primary_info_schema
            logger.info("Running update_sample_primary_info_schema migration...")
            update_sample_primary_info_schema()
            logger.info("✅ Schema update migration completed")
        except ImportError:
            logger.warning("Could not import update_sample_primary_info_schema migration")
        except Exception as e:
            logger.warning(f"Schema update migration warning: {str(e)}")
        
        # Then, ensure all required columns exist (backward compatibility)
        with engine.begin() as conn:
            inspector = sql_inspect(engine)
            
            # Check if table exists
            if "sample_primary_info" not in inspector.get_table_names():
                logger.warning("Table 'sample_primary_info' does not exist yet. It will be created by SQLAlchemy.")
                return
            
            # Get existing columns
            existing_columns = {col['name'] for col in inspector.get_columns("sample_primary_info")}
            
            # List of required columns (new schema)
            required_columns = [
                ("buyer_name", "VARCHAR"),
                ("item", "VARCHAR"),
                ("sample_category", "VARCHAR"),
                ("yarn_id", "VARCHAR"),
                ("yarn_details", "TEXT"),
                ("trims_details", "TEXT"),
                ("yarn_handover_date", "TIMESTAMP WITH TIME ZONE"),
                ("trims_handover_date", "TIMESTAMP WITH TIME ZONE"),
                ("required_date", "TIMESTAMP WITH TIME ZONE"),
                ("request_pcs", "INTEGER"),
            ]
            
            # Check which columns are missing and add them
            for column_name, column_type in required_columns:
                if column_name not in existing_columns:
                    logger.info(f"Adding '{column_name}' column to sample_primary_info table...")
                    conn.execute(text(f"""
                        ALTER TABLE sample_primary_info 
                        ADD COLUMN {column_name} {column_type}
                    """))
                    logger.info(f"✅ Successfully added '{column_name}' column")
            
            # Ensure techpack_files column exists (new schema uses JSON)
            if "techpack_files" not in existing_columns:
                logger.info("Adding 'techpack_files' JSON column to sample_primary_info table...")
                conn.execute(text("""
                    ALTER TABLE sample_primary_info 
                    ADD COLUMN techpack_files jsonb
                """))
                logger.info("✅ Successfully added 'techpack_files' column")
            
            # Ensure additional_instruction is JSON (if it exists as TEXT, migration should handle it)
            if "additional_instruction" in existing_columns:
                col_info = next((col for col in inspector.get_columns("sample_primary_info") if col['name'] == 'additional_instruction'), None)
                if col_info and 'jsonb' not in str(col_info['type']).lower() and 'json' not in str(col_info['type']).lower():
                    logger.info("additional_instruction exists but is not JSON - migration should handle conversion")
            
            logger.info("Merchandiser database migrations completed")
        
        # Run sample_status schema migration
        try:
            from migrations.update_sample_status_schema import update_sample_status_schema
            update_sample_status_schema(engine)
        except ImportError:
            logger.warning("Could not import update_sample_status_schema migration")
        except Exception as e:
            logger.warning(f"Sample status migration warning: {str(e)}")
        
        # Add expecting_end_date column to sample_status table
        try:
            from migrations.add_expecting_end_date_to_sample_status import add_expecting_end_date_to_sample_status
            add_expecting_end_date_to_sample_status(engine)
        except ImportError:
            logger.warning("Could not import add_expecting_end_date_to_sample_status migration")
        except Exception as e:
            logger.warning(f"Expecting end date migration warning: {str(e)}")
    except Exception as e:
        logger.error(f"Migration error: {str(e)}", exc_info=True)
        raise


def _run_samples_migrations(engine):
    """Run migrations for samples database"""
    try:
        logger.info("Running samples database migrations...")
        # Add expecting_end_date column to sample_status table
        try:
            from migrations.add_expecting_end_date_to_sample_status import add_expecting_end_date_to_sample_status
            add_expecting_end_date_to_sample_status(engine)
        except ImportError:
            logger.warning("Could not import add_expecting_end_date_to_sample_status migration")
        except Exception as e:
            logger.warning(f"Expecting end date migration warning: {str(e)}")
    except Exception as e:
        logger.error(f"Samples migration error: {str(e)}", exc_info=True)
