"""
Migration: Add performance indexes to frequently queried columns
Improves query performance for common search and filter operations
"""
from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)


def add_performance_indexes():
    """Add indexes to frequently queried columns for better performance"""
    
    # Indexes for SAMPLES database
    samples_indexes = [
        # SampleRequest indexes
        ("sample_requests", "buyer_id", "idx_sample_requests_buyer_id"),
        ("sample_requests", "sample_name", "idx_sample_requests_sample_name"),
        ("sample_requests", "current_status", "idx_sample_requests_status"),
        ("sample_requests", "created_at", "idx_sample_requests_created_at"),
        ("sample_requests", "style_id", "idx_sample_requests_style_id"),
        
        # StyleSummary indexes
        ("style_summaries", "buyer_id", "idx_style_summaries_buyer_id"),
        ("style_summaries", "style_name", "idx_style_summaries_style_name"),
        
        # StyleVariant indexes
        ("style_variants", "style_id", "idx_style_variants_style_id"),
        
        # SampleStatus indexes
        ("sample_status", "sample_request_id", "idx_sample_status_request_id"),
        ("sample_status", "status_by_sample", "idx_sample_status_by_sample"),
        
        # SampleTNA indexes
        ("sample_tna", "sample_request_id", "idx_sample_tna_request_id"),
    ]
    
    # Indexes for MERCHANDISER database
    merchandiser_indexes = [
        # SamplePrimaryInfo indexes
        ("sample_primary_info", "buyer_id", "idx_sample_primary_buyer_id"),
        ("sample_primary_info", "sample_name", "idx_sample_primary_sample_name"),
        ("sample_primary_info", "sample_id", "idx_sample_primary_sample_id"),
        ("sample_primary_info", "created_at", "idx_sample_primary_created_at"),
        
        # YarnDetail indexes
        ("yarn_details", "yarn_id", "idx_yarn_details_yarn_id"),
        
        # FabricDetail indexes
        ("fabric_details", "fabric_id", "idx_fabric_details_fabric_id"),
        
        # TrimsDetail indexes
        ("trims_details", "trims_id", "idx_trims_details_trims_id"),
    ]
    
    # Indexes for CLIENTS database
    clients_indexes = [
        ("buyers", "buyer_name", "idx_buyers_name"),
        ("buyers", "status", "idx_buyers_status"),
        ("suppliers", "supplier_name", "idx_suppliers_name"),
    ]
    
    # Indexes for USERS database
    users_indexes = [
        ("users", "department", "idx_users_department"),
        ("users", "is_active", "idx_users_is_active"),
        ("notifications", "user_id", "idx_notifications_user_id"),
        ("notifications", "read", "idx_notifications_read"),
    ]
    
    # Indexes for ORDERS database
    orders_indexes = [
        ("order_management", "buyer_id", "idx_orders_buyer_id"),
        ("order_management", "order_status", "idx_orders_status"),
        ("order_management", "order_date", "idx_orders_order_date"),
    ]
    
    # Indexes for SETTINGS database
    settings_indexes = [
        ("color_master", "color_code", "idx_color_master_code"),
        ("color_master", "color_code_type", "idx_color_master_code_type"),
    ]
    
    all_indexes = {
        DatabaseType.SAMPLES: samples_indexes,
        DatabaseType.MERCHANDISER: merchandiser_indexes,
        DatabaseType.CLIENTS: clients_indexes,
        DatabaseType.USERS: users_indexes,
        DatabaseType.ORDERS: orders_indexes,
        DatabaseType.SETTINGS: settings_indexes,
    }
    
    for db_type, indexes in all_indexes.items():
        engine = engines[db_type]
        db_name = db_type.value
        
        with engine.begin() as conn:
            for table_name, column_name, index_name in indexes:
                try:
                    # Check if index already exists
                    check_index = text(f"""
                        SELECT indexname 
                        FROM pg_indexes 
                        WHERE tablename = :table_name 
                        AND indexname = :index_name
                    """)
                    result = conn.execute(check_index, {
                        "table_name": table_name,
                        "index_name": index_name
                    }).fetchone()
                    
                    if result:
                        logger.info(f"ℹ️  Index {index_name} already exists on {db_name}.{table_name}.{column_name}")
                        continue
                    
                    # Create index
                    create_index = text(f"""
                        CREATE INDEX IF NOT EXISTS {index_name} 
                        ON {table_name} ({column_name})
                    """)
                    conn.execute(create_index)
                    logger.info(f"✅ Created index {index_name} on {db_name}.{table_name}.{column_name}")
                    
                except Exception as e:
                    logger.warning(f"⚠️  Could not create index {index_name} on {db_name}.{table_name}.{column_name}: {e}")
    
    logger.info("✅ Performance indexes migration completed!")


if __name__ == "__main__":
    add_performance_indexes()
