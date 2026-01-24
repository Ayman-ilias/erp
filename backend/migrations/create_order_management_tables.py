"""
Migration: Create Order Management Tables
Creates tables for Sales Contracts, Orders, Delivery Schedules, Packing Details, and Order Breakdowns
"""
from sqlalchemy import text
from core.database import engine_merchandiser
from core.logging import setup_logging

logger = setup_logging()


def run_migration():
    """Create order management tables in merchandiser database"""
    logger.info("🚀 Starting Order Management tables migration...")

    with engine_merchandiser.connect() as conn:
        # Create sales_contracts table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS sales_contracts (
                id SERIAL PRIMARY KEY,
                sales_contract_id VARCHAR UNIQUE NOT NULL,
                buyer_id INTEGER NOT NULL,
                buyer_name VARCHAR,
                sales_contract_no VARCHAR,
                sales_contract_date TIMESTAMP WITH TIME ZONE,
                total_order_quantity INTEGER DEFAULT 0,
                total_order_value FLOAT DEFAULT 0.0,
                no_of_po INTEGER DEFAULT 0,
                earliest_delivery_date TIMESTAMP WITH TIME ZONE,
                final_delivery_date TIMESTAMP WITH TIME ZONE,
                final_amendment_date TIMESTAMP WITH TIME ZONE,
                amendment_no INTEGER DEFAULT 0,
                status VARCHAR DEFAULT 'active',
                remarks TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            )
        """))
        logger.info("✅ Created sales_contracts table")

        # Create order_primary_info table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS order_primary_info (
                id SERIAL PRIMARY KEY,
                order_id VARCHAR UNIQUE NOT NULL,
                sales_contract_id VARCHAR,
                buyer_id INTEGER NOT NULL,
                buyer_name VARCHAR,
                order_number VARCHAR NOT NULL,
                order_date TIMESTAMP WITH TIME ZONE,
                scl_po VARCHAR,
                season VARCHAR,
                order_category VARCHAR,
                allow_tolerance BOOLEAN DEFAULT FALSE,
                tolerance_percent FLOAT DEFAULT -3.0,
                total_quantity INTEGER DEFAULT 0,
                total_value FLOAT DEFAULT 0.0,
                status VARCHAR DEFAULT 'pending',
                remarks TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            )
        """))
        logger.info("✅ Created order_primary_info table")

        # Create order_styles junction table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS order_styles (
                id SERIAL PRIMARY KEY,
                order_id VARCHAR NOT NULL,
                style_id VARCHAR NOT NULL,
                style_name VARCHAR,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        logger.info("✅ Created order_styles table")

        # Create delivery_schedules table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS delivery_schedules (
                id SERIAL PRIMARY KEY,
                shipment_id VARCHAR UNIQUE NOT NULL,
                order_id VARCHAR NOT NULL,
                order_number VARCHAR,
                shipment_date TIMESTAMP WITH TIME ZONE,
                destination_country VARCHAR,
                destination_country_code VARCHAR,
                destination_number VARCHAR,
                destination_code VARCHAR,
                incoterms VARCHAR,
                freight_method VARCHAR,
                status VARCHAR DEFAULT 'scheduled',
                total_units INTEGER,
                packs INTEGER,
                price_ticket VARCHAR,
                total_quantity INTEGER DEFAULT 0,
                total_cartons INTEGER DEFAULT 0,
                total_cbm FLOAT DEFAULT 0.0,
                remarks TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            )
        """))
        logger.info("✅ Created delivery_schedules table")

        # Create packing_details table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS packing_details (
                id SERIAL PRIMARY KEY,
                pack_id VARCHAR UNIQUE NOT NULL,
                shipment_id VARCHAR NOT NULL,
                order_id VARCHAR NOT NULL,
                color_ids JSONB,
                color_names JSONB,
                size_ids JSONB,
                size_names JSONB,
                quantity_by_size JSONB,
                total_pcs INTEGER DEFAULT 0,
                net_weight_kg FLOAT,
                gross_weight_kg FLOAT,
                length_cm FLOAT,
                width_cm FLOAT,
                height_cm FLOAT,
                cbm FLOAT,
                max_weight_per_carton FLOAT,
                carton_quantity INTEGER DEFAULT 1,
                remarks TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            )
        """))
        logger.info("✅ Created packing_details table")

        # Create packing_size_quantities table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS packing_size_quantities (
                id SERIAL PRIMARY KEY,
                packing_detail_id INTEGER NOT NULL,
                size_id VARCHAR NOT NULL,
                size_name VARCHAR,
                quantity INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        logger.info("✅ Created packing_size_quantities table")

        # Create order_breakdowns table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS order_breakdowns (
                id SERIAL PRIMARY KEY,
                breakdown_id VARCHAR UNIQUE NOT NULL,
                shipment_id VARCHAR NOT NULL,
                order_id VARCHAR NOT NULL,
                order_number VARCHAR,
                style_variant_id VARCHAR NOT NULL,
                style_id VARCHAR,
                color_name VARCHAR,
                size_name VARCHAR,
                order_quantity INTEGER DEFAULT 0,
                tolerance_quantity INTEGER DEFAULT 0,
                shipped_quantity INTEGER DEFAULT 0,
                unit_price FLOAT,
                total_value FLOAT,
                status VARCHAR DEFAULT 'pending',
                remarks TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            )
        """))
        logger.info("✅ Created order_breakdowns table")

        # Create indexes for better performance
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_sales_contracts_buyer_id ON sales_contracts(buyer_id);
            CREATE INDEX IF NOT EXISTS idx_sales_contracts_status ON sales_contracts(status);
            CREATE INDEX IF NOT EXISTS idx_order_primary_info_buyer_id ON order_primary_info(buyer_id);
            CREATE INDEX IF NOT EXISTS idx_order_primary_info_sales_contract_id ON order_primary_info(sales_contract_id);
            CREATE INDEX IF NOT EXISTS idx_order_primary_info_order_number ON order_primary_info(order_number);
            CREATE INDEX IF NOT EXISTS idx_order_styles_order_id ON order_styles(order_id);
            CREATE INDEX IF NOT EXISTS idx_order_styles_style_id ON order_styles(style_id);
            CREATE INDEX IF NOT EXISTS idx_delivery_schedules_order_id ON delivery_schedules(order_id);
            CREATE INDEX IF NOT EXISTS idx_delivery_schedules_status ON delivery_schedules(status);
            CREATE INDEX IF NOT EXISTS idx_packing_details_shipment_id ON packing_details(shipment_id);
            CREATE INDEX IF NOT EXISTS idx_packing_details_order_id ON packing_details(order_id);
            CREATE INDEX IF NOT EXISTS idx_packing_size_quantities_packing_detail_id ON packing_size_quantities(packing_detail_id);
            CREATE INDEX IF NOT EXISTS idx_order_breakdowns_shipment_id ON order_breakdowns(shipment_id);
            CREATE INDEX IF NOT EXISTS idx_order_breakdowns_order_id ON order_breakdowns(order_id);
            CREATE INDEX IF NOT EXISTS idx_order_breakdowns_style_variant_id ON order_breakdowns(style_variant_id);
        """))
        logger.info("✅ Created performance indexes")

        conn.commit()
        logger.info("✅ Order Management tables migration completed successfully!")


if __name__ == "__main__":
    run_migration()
