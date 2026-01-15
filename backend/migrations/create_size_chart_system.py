"""
Migration to create size chart system with support for multiple product types
Supports different size charts for different buyers (H&M, Zara, Primark, etc.)
"""

from sqlalchemy import text
from core.database import engines, DatabaseType
import logging
import json

logger = logging.getLogger(__name__)


def create_size_chart_system():
    """Create size chart tables and populate with standard data"""
    engine = engines[DatabaseType.SAMPLES]
    
    with engine.begin() as conn:
        try:
            logger.info("Creating size chart system...")
            
            # Create product_types table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS product_types (
                    id SERIAL PRIMARY KEY,
                    type_name VARCHAR(50) NOT NULL UNIQUE,
                    type_code VARCHAR(10) NOT NULL UNIQUE,
                    measurement_fields JSONB NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            
            # Create size_chart_profiles table (buyer_id is a reference to buyers.id in clients DB - no FK constraint)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS size_chart_profiles (
                    id SERIAL PRIMARY KEY,
                    profile_name VARCHAR(100) NOT NULL UNIQUE,
                    buyer_id INTEGER,
                    is_general BOOLEAN DEFAULT FALSE,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            
            # Create size_chart_master table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS size_chart_master (
                    id SERIAL PRIMARY KEY,
                    profile_id INTEGER REFERENCES size_chart_profiles(id) ON DELETE CASCADE,
                    product_type_id INTEGER REFERENCES product_types(id) ON DELETE CASCADE,
                    size_name VARCHAR(20) NOT NULL,
                    size_order INTEGER NOT NULL,
                    measurements JSONB NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(profile_id, product_type_id, size_name)
                );
            """))
            
            # Create indexes
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_size_chart_profile 
                ON size_chart_master(profile_id) WHERE is_active = TRUE;
                
                CREATE INDEX IF NOT EXISTS idx_size_chart_product_type 
                ON size_chart_master(product_type_id) WHERE is_active = TRUE;
            """))
            
            logger.info("✅ Size chart tables created")
            
            # Populate product types
            product_types = [
                ('Sweater', 'SWT', ['chest', 'length', 'shoulder', 'sleeve_length', 'bottom_width']),
                ('Hat', 'HAT', ['circumference', 'height', 'brim_width']),
                ('Muffler', 'MUF', ['length', 'width']),
                ('Gloves', 'GLV', ['length', 'palm_width', 'wrist_circumference']),
                ('Leg Gloves', 'LEG', ['length', 'circumference_top', 'circumference_bottom']),
            ]
            
            product_type_ids = {}
            for type_name, type_code, fields in product_types:
                result = conn.execute(text("""
                    INSERT INTO product_types (type_name, type_code, measurement_fields, is_active)
                    VALUES (:name, :code, :fields, TRUE)
                    ON CONFLICT (type_name) DO UPDATE SET measurement_fields = :fields
                    RETURNING id
                """), {
                    'name': type_name,
                    'code': type_code,
                    'fields': json.dumps(fields)
                })
                product_type_ids[type_code] = result.fetchone()[0]
            
            logger.info(f"✅ Created {len(product_types)} product types")
            
            # Create size chart profiles
            profiles = [
                ('General', None, True),
                ('H&M', None, False),  # Will link to buyer if exists
                ('Zara', None, False),
                ('Primark', None, False),
                ('Uniqlo', None, False),
                ('Gap', None, False),
            ]
            
            profile_ids = {}
            clients_engine = engines[DatabaseType.CLIENTS]
            
            for profile_name, buyer_id, is_general in profiles:
                # Try to find matching buyer from clients database
                if not is_general:
                    with clients_engine.begin() as clients_conn:
                        result = clients_conn.execute(text("""
                            SELECT id FROM buyers WHERE buyer_name ILIKE :name LIMIT 1
                        """), {'name': f'%{profile_name}%'})
                        buyer_row = result.fetchone()
                        if buyer_row:
                            buyer_id = buyer_row[0]
                
                result = conn.execute(text("""
                    INSERT INTO size_chart_profiles (profile_name, buyer_id, is_general, is_active)
                    VALUES (:name, :buyer_id, :is_general, TRUE)
                    ON CONFLICT (profile_name) DO UPDATE SET buyer_id = :buyer_id
                    RETURNING id
                """), {
                    'name': profile_name,
                    'buyer_id': buyer_id,
                    'is_general': is_general
                })
                profile_ids[profile_name] = result.fetchone()[0]
            
            logger.info(f"✅ Created {len(profiles)} size chart profiles")
            
            # Populate General Sweater sizes
            general_sweater_sizes = [
                ('XS', 1, {'chest': 86, 'length': 63, 'shoulder': 40, 'sleeve_length': 58, 'bottom_width': 40}),
                ('S', 2, {'chest': 91, 'length': 66, 'shoulder': 42, 'sleeve_length': 60, 'bottom_width': 42}),
                ('M', 3, {'chest': 96, 'length': 69, 'shoulder': 44, 'sleeve_length': 62, 'bottom_width': 44}),
                ('L', 4, {'chest': 101, 'length': 72, 'shoulder': 46, 'sleeve_length': 64, 'bottom_width': 46}),
                ('XL', 5, {'chest': 106, 'length': 75, 'shoulder': 48, 'sleeve_length': 66, 'bottom_width': 48}),
                ('XXL', 6, {'chest': 111, 'length': 78, 'shoulder': 50, 'sleeve_length': 68, 'bottom_width': 50}),
            ]
            
            for size_name, order, measurements in general_sweater_sizes:
                conn.execute(text("""
                    INSERT INTO size_chart_master 
                    (profile_id, product_type_id, size_name, size_order, measurements, is_active)
                    VALUES (:profile_id, :product_type_id, :size_name, :size_order, :measurements, TRUE)
                    ON CONFLICT (profile_id, product_type_id, size_name) 
                    DO UPDATE SET measurements = :measurements
                """), {
                    'profile_id': profile_ids['General'],
                    'product_type_id': product_type_ids['SWT'],
                    'size_name': size_name,
                    'size_order': order,
                    'measurements': json.dumps(measurements)
                })
            
            logger.info(f"✅ Added {len(general_sweater_sizes)} general sweater sizes")
            
            # Add General Hat sizes
            general_hat_sizes = [
                ('S', 1, {'circumference': 54, 'height': 20, 'brim_width': 6}),
                ('M', 2, {'circumference': 56, 'height': 21, 'brim_width': 6.5}),
                ('L', 3, {'circumference': 58, 'height': 22, 'brim_width': 7}),
                ('XL', 4, {'circumference': 60, 'height': 23, 'brim_width': 7.5}),
            ]
            
            for size_name, order, measurements in general_hat_sizes:
                conn.execute(text("""
                    INSERT INTO size_chart_master 
                    (profile_id, product_type_id, size_name, size_order, measurements, is_active)
                    VALUES (:profile_id, :product_type_id, :size_name, :size_order, :measurements, TRUE)
                    ON CONFLICT (profile_id, product_type_id, size_name) 
                    DO UPDATE SET measurements = :measurements
                """), {
                    'profile_id': profile_ids['General'],
                    'product_type_id': product_type_ids['HAT'],
                    'size_name': size_name,
                    'size_order': order,
                    'measurements': json.dumps(measurements)
                })
            
            logger.info(f"✅ Added {len(general_hat_sizes)} general hat sizes")
            
            # Add General Muffler sizes
            general_muffler_sizes = [
                ('Standard', 1, {'length': 180, 'width': 25}),
                ('Large', 2, {'length': 200, 'width': 30}),
            ]
            
            for size_name, order, measurements in general_muffler_sizes:
                conn.execute(text("""
                    INSERT INTO size_chart_master 
                    (profile_id, product_type_id, size_name, size_order, measurements, is_active)
                    VALUES (:profile_id, :product_type_id, :size_name, :size_order, :measurements, TRUE)
                    ON CONFLICT (profile_id, product_type_id, size_name) 
                    DO UPDATE SET measurements = :measurements
                """), {
                    'profile_id': profile_ids['General'],
                    'product_type_id': product_type_ids['MUF'],
                    'size_name': size_name,
                    'size_order': order,
                    'measurements': json.dumps(measurements)
                })
            
            logger.info(f"✅ Added {len(general_muffler_sizes)} general muffler sizes")
            
            # Add General Gloves sizes
            general_glove_sizes = [
                ('S', 1, {'length': 22, 'palm_width': 8, 'wrist_circumference': 16}),
                ('M', 2, {'length': 24, 'palm_width': 9, 'wrist_circumference': 17}),
                ('L', 3, {'length': 26, 'palm_width': 10, 'wrist_circumference': 18}),
                ('XL', 4, {'length': 28, 'palm_width': 11, 'wrist_circumference': 19}),
            ]
            
            for size_name, order, measurements in general_glove_sizes:
                conn.execute(text("""
                    INSERT INTO size_chart_master 
                    (profile_id, product_type_id, size_name, size_order, measurements, is_active)
                    VALUES (:profile_id, :product_type_id, :size_name, :size_order, :measurements, TRUE)
                    ON CONFLICT (profile_id, product_type_id, size_name) 
                    DO UPDATE SET measurements = :measurements
                """), {
                    'profile_id': profile_ids['General'],
                    'product_type_id': product_type_ids['GLV'],
                    'size_name': size_name,
                    'size_order': order,
                    'measurements': json.dumps(measurements)
                })
            
            logger.info(f"✅ Added {len(general_glove_sizes)} general glove sizes")
            
            # Add General Leg Gloves sizes
            general_leg_glove_sizes = [
                ('S', 1, {'length': 45, 'circumference_top': 35, 'circumference_bottom': 20}),
                ('M', 2, {'length': 50, 'circumference_top': 38, 'circumference_bottom': 22}),
                ('L', 3, {'length': 55, 'circumference_top': 41, 'circumference_bottom': 24}),
            ]
            
            for size_name, order, measurements in general_leg_glove_sizes:
                conn.execute(text("""
                    INSERT INTO size_chart_master 
                    (profile_id, product_type_id, size_name, size_order, measurements, is_active)
                    VALUES (:profile_id, :product_type_id, :size_name, :size_order, :measurements, TRUE)
                    ON CONFLICT (profile_id, product_type_id, size_name) 
                    DO UPDATE SET measurements = :measurements
                """), {
                    'profile_id': profile_ids['General'],
                    'product_type_id': product_type_ids['LEG'],
                    'size_name': size_name,
                    'size_order': order,
                    'measurements': json.dumps(measurements)
                })
            
            logger.info(f"✅ Added {len(general_leg_glove_sizes)} general leg glove sizes")
            
            logger.info("✅ Size chart system created successfully!")
            
        except Exception as e:
            logger.error(f"❌ Size chart system creation failed: {e}")
            raise


if __name__ == "__main__":
    create_size_chart_system()
