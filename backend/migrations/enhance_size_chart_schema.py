"""
Enhance Size Chart Schema for Multi-Type Garment Support
Adds fields for Sweater, Pants, Jacket, Hat, Gloves, Scarf measurements
"""

from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)


def enhance_size_chart_schema():
    """Enhance size chart master table with all garment type measurements"""
    engine = engines[DatabaseType.SAMPLES]
    
    with engine.begin() as conn:
        try:
            logger.info("Enhancing size chart schema...")
            
            # Add gender and auto-ID columns
            conn.execute(text("""
                ALTER TABLE size_chart_master 
                ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'Unisex',
                ADD COLUMN IF NOT EXISTS auto_generated_id VARCHAR(50);
            """))
            
            # Create indexes
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_size_chart_gender 
                ON size_chart_master(gender);
                
                CREATE INDEX IF NOT EXISTS idx_size_chart_profile 
                ON size_chart_master(size_chart_profile_id);
                
                CREATE INDEX IF NOT EXISTS idx_size_chart_product_type 
                ON size_chart_master(product_type_id);
                
                CREATE INDEX IF NOT EXISTS idx_size_chart_auto_id
                ON size_chart_master(auto_generated_id);
            """))
            
            logger.info("✅ Base columns and indexes created")
            
            # Add comprehensive measurement fields
            measurement_columns = [
                # Sweater/Pullover/Hoodie (existing + new)
                ('chest_bust', 'Chest/Bust measurement'),
                ('body_length', 'Body length from shoulder to hem'),
                ('sleeve_length', 'Sleeve length from shoulder to cuff'),
                ('shoulder_width', 'Shoulder width across back'),
                ('waist', 'Waist circumference'),
                ('hem_width', 'Hem width/circumference'),
                ('neck_collar_width', 'Neck/collar width'),
                ('cuff_width', 'Cuff width/circumference'),
                
                # Pants/Trousers/Shorts specific
                ('thigh', 'Thigh circumference'),
                ('knee', 'Knee circumference'),
                ('leg_opening', 'Leg opening/hem width'),
                ('front_rise', 'Front rise measurement'),
                ('back_rise', 'Back rise measurement'),
                
                # Jacket/Coat specific (shares many with sweater)
                ('hip', 'Hip circumference'),
                ('cuff_opening', 'Cuff/sleeve opening'),
                ('collar_neck', 'Collar/neck measurement'),
                
                # Hat/Beanie/Cap specific
                ('head_circumference', 'Head circumference'),
                ('height_crown', 'Height/crown measurement'),
                ('brim_width', 'Brim/visor width'),
                
                # Gloves/Mittens specific
                ('hand_circumference', 'Hand circumference'),
                ('hand_length', 'Hand length wrist to fingertip'),
                ('wrist_opening', 'Wrist opening/cuff'),
                
                # Scarf/Wrap specific  
                ('length', 'Total length'),
                ('width', 'Width measurement'),
            ]
            
            for column_name, description in measurement_columns:
                try:
                    conn.execute(text(f"""
                        ALTER TABLE size_chart_master 
                        ADD COLUMN IF NOT EXISTS {column_name} DECIMAL(10, 2);
                    """))
                    
                    conn.execute(text(f"""
                        COMMENT ON COLUMN size_chart_master.{column_name} 
                        IS '{description}';
                    """))
                except Exception as e:
                    logger.warning(f"Column {column_name} might already exist: {e}")
                    continue
            
            logger.info(f"✅ Added {len(measurement_columns)} measurement columns")
            
            # Update existing records to have default gender if needed
            conn.execute(text("""
                UPDATE size_chart_master 
                SET gender = 'Unisex' 
                WHERE gender IS NULL
            """))
            
            logger.info("✅ Size chart schema enhancement completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ Schema enhancement failed: {e}")
            raise


if __name__ == "__main__":
    import sys
    sys.path.insert(0, "/app")
    enhance_size_chart_schema()
