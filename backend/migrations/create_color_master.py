"""
Migration to create color master system with TCX, HEX, and RGB support
Supports buyer-specific colors and general colors
"""

from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)


def create_color_master():
    """Create color master table and populate with standard colors"""
    engine = engines[DatabaseType.SAMPLES]
    
    with engine.begin() as conn:
        try:
            logger.info("Creating color master system...")
            
            # Create color_master table (buyer_id is a reference to buyers.id in clients DB - no FK constraint)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS color_master (
                    id SERIAL PRIMARY KEY,
                    color_name VARCHAR(100) NOT NULL,
                    tcx_code VARCHAR(20),
                    hex_code VARCHAR(7) NOT NULL,
                    rgb_r INTEGER CHECK (rgb_r >= 0 AND rgb_r <= 255),
                    rgb_g INTEGER CHECK (rgb_g >= 0 AND rgb_g <= 255),
                    rgb_b INTEGER CHECK (rgb_b >= 0 AND rgb_b <= 255),
                    buyer_id INTEGER,
                    is_general BOOLEAN DEFAULT FALSE,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            
            # Create unique constraint after table creation
            conn.execute(text("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_color_master_unique 
                ON color_master(color_name, COALESCE(buyer_id, 0));
            """))
            
            # Create index for faster lookups
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_color_master_buyer 
                ON color_master(buyer_id) WHERE is_active = TRUE;
                
                CREATE INDEX IF NOT EXISTS idx_color_master_general 
                ON color_master(is_general) WHERE is_active = TRUE;
            """))
            
            logger.info("✅ Color master table created")
            
            # Populate with general colors (available to all buyers)
            general_colors = [
                ('White', '11-0601', '#FFFFFF', 255, 255, 255),
                ('Black', '19-0303', '#000000', 0, 0, 0),
                ('Navy Blue', '19-4024', '#001F3F', 0, 31, 63),
                ('Royal Blue', '19-4052', '#0047AB', 0, 71, 171),
                ('Sky Blue', '14-4318', '#87CEEB', 135, 206, 235),
                ('Red', '19-1664', '#FF0000', 255, 0, 0),
                ('Burgundy', '19-1627', '#800020', 128, 0, 32),
                ('Pink', '13-2010', '#FFC0CB', 255, 192, 203),
                ('Hot Pink', '17-2034', '#FF69B4', 255, 105, 180),
                ('Yellow', '13-0647', '#FFFF00', 255, 255, 0),
                ('Mustard', '14-0852', '#FFDB58', 255, 219, 88),
                ('Orange', '16-1364', '#FFA500', 255, 165, 0),
                ('Green', '15-6442', '#008000', 0, 128, 0),
                ('Forest Green', '19-0315', '#228B22', 34, 139, 34),
                ('Olive', '18-0625', '#808000', 128, 128, 0),
                ('Purple', '18-3838', '#800080', 128, 0, 128),
                ('Lavender', '13-3820', '#E6E6FA', 230, 230, 250),
                ('Brown', '19-1220', '#A52A2A', 165, 42, 42),
                ('Tan', '16-1220', '#D2B48C', 210, 180, 140),
                ('Beige', '13-1008', '#F5F5DC', 245, 245, 220),
                ('Gray', '14-4102', '#808080', 128, 128, 128),
                ('Charcoal', '19-0201', '#36454F', 54, 69, 79),
                ('Cream', '11-0609', '#FFFDD0', 255, 253, 208),
                ('Ivory', '11-0602', '#FFFFF0', 255, 255, 240),
                ('Teal', '18-4936', '#008080', 0, 128, 128),
                ('Turquoise', '15-5217', '#40E0D0', 64, 224, 208),
                ('Coral', '16-1546', '#FF7F50', 255, 127, 80),
                ('Peach', '13-1318', '#FFDAB9', 255, 218, 185),
                ('Mint', '13-6110', '#98FF98', 152, 255, 152),
                ('Lime', '14-0452', '#00FF00', 0, 255, 0),
            ]
            
            for color_name, tcx, hex_code, r, g, b in general_colors:
                # Check if color already exists
                result = conn.execute(text("""
                    SELECT id FROM color_master 
                    WHERE color_name = :name AND buyer_id IS NULL
                """), {'name': color_name})
                
                if not result.fetchone():
                    conn.execute(text("""
                        INSERT INTO color_master 
                        (color_name, tcx_code, hex_code, rgb_r, rgb_g, rgb_b, is_general, is_active)
                        VALUES (:name, :tcx, :hex, :r, :g, :b, TRUE, TRUE)
                    """), {
                        'name': color_name,
                        'tcx': tcx,
                        'hex': hex_code,
                        'r': r,
                        'g': g,
                        'b': b
                    })
            
            logger.info(f"✅ Populated {len(general_colors)} general colors")
            
            # Add H&M specific colors (example - you can add more)
            logger.info("Adding buyer-specific colors...")
            
            # Get H&M buyer ID if exists (from clients database)
            clients_engine = engines[DatabaseType.CLIENTS]
            with clients_engine.begin() as clients_conn:
                result = clients_conn.execute(text("""
                    SELECT id FROM buyers WHERE buyer_name ILIKE '%H&M%' OR buyer_name ILIKE '%H & M%' LIMIT 1
                """))
                hm_buyer = result.fetchone()
            
                if hm_buyer:
                    hm_buyer_id = hm_buyer[0]
                    hm_colors = [
                        ('H&M Burgundy Red', '19-1860', '#8B0000', 139, 0, 0),
                        ('H&M Classic Navy', '19-4028', '#000080', 0, 0, 128),
                        ('H&M Bright White', '11-0601', '#FAFAFA', 250, 250, 250),
                    ]
                    
                    for color_name, tcx, hex_code, r, g, b in hm_colors:
                        # Check if color already exists for this buyer
                        result = conn.execute(text("""
                            SELECT id FROM color_master 
                            WHERE color_name = :name AND buyer_id = :buyer_id
                        """), {'name': color_name, 'buyer_id': hm_buyer_id})
                        
                        if not result.fetchone():
                            conn.execute(text("""
                                INSERT INTO color_master 
                                (color_name, tcx_code, hex_code, rgb_r, rgb_g, rgb_b, buyer_id, is_general, is_active)
                                VALUES (:name, :tcx, :hex, :r, :g, :b, :buyer_id, FALSE, TRUE)
                            """), {
                                'name': color_name,
                                'tcx': tcx,
                                'hex': hex_code,
                                'r': r,
                                'g': g,
                                'b': b,
                                'buyer_id': hm_buyer_id
                            })
                    
                    logger.info(f"✅ Added {len(hm_colors)} H&M-specific colors")
            
            logger.info("✅ Color master system created successfully!")
            
        except Exception as e:
            logger.error(f"❌ Color master creation failed: {e}")
            raise


if __name__ == "__main__":
    create_color_master()
