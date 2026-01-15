"""
Migration to create comprehensive UOM conversion system
Supports Weight, Length, Area, Volume, Temperature, and Count conversions
"""

from sqlalchemy import text
from core.database import engines, DatabaseType
import logging

logger = logging.getLogger(__name__)


def create_uom_conversion_system():
    """Create UOM conversion tables and populate with standard units"""
    engine = engines[DatabaseType.SETTINGS]
    
    with engine.begin() as conn:
        try:
            logger.info("Creating UOM conversion system...")
            
            # Add conversion fields to existing uom_category table
            conn.execute(text("""
                ALTER TABLE uom_category 
                ADD COLUMN IF NOT EXISTS base_unit VARCHAR(20),
                ADD COLUMN IF NOT EXISTS conversion_formula TEXT;
            """))
            
            # Add conversion fields to existing uom table
            conn.execute(text("""
                ALTER TABLE uom 
                ADD COLUMN IF NOT EXISTS conversion_to_base DECIMAL(20, 10) DEFAULT 1.0,
                ADD COLUMN IF NOT EXISTS is_base_unit BOOLEAN DEFAULT FALSE;
            """))
            
            logger.info("✅ UOM conversion fields added")
            
            # Update/Insert UOM categories with base units
            categories = [
                ('Weight', 'g', 'grams'),
                ('Length', 'm', 'meters'),
                ('Area', 'm²', 'square meters'),
                ('Volume', 'L', 'liters'),
                ('Temperature', '°C', 'celsius'),
                ('Count', 'pcs', 'pieces'),
            ]
            
            category_ids = {}
            for cat_name, base_unit, formula_desc in categories:
                result = conn.execute(text("""
                    INSERT INTO uom_category (name, base_unit, conversion_formula, is_active)
                    VALUES (:name, :base_unit, :formula, TRUE)
                    ON CONFLICT (name) DO UPDATE 
                    SET base_unit = :base_unit, conversion_formula = :formula
                    RETURNING id
                """), {
                    'name': cat_name,
                    'base_unit': base_unit,
                    'formula': f'value * from_unit_factor / to_unit_factor (base: {formula_desc})'
                })
                category_ids[cat_name] = result.fetchone()[0]
            
            logger.info(f"✅ Updated {len(categories)} UOM categories")
            
            # Define all units with conversion factors to base unit
            units = [
                # Weight (base: grams)
                ('Weight', 'Gram', 'g', 1.0, True),
                ('Weight', 'Kilogram', 'kg', 1000.0, False),
                ('Weight', 'Milligram', 'mg', 0.001, False),
                ('Weight', 'Metric Ton', 't', 1000000.0, False),
                ('Weight', 'Pound', 'lb', 453.592, False),
                ('Weight', 'Ounce', 'oz', 28.3495, False),
                ('Weight', 'Stone', 'st', 6350.29, False),
                
                # Length (base: meters)
                ('Length', 'Meter', 'm', 1.0, True),
                ('Length', 'Centimeter', 'cm', 0.01, False),
                ('Length', 'Millimeter', 'mm', 0.001, False),
                ('Length', 'Kilometer', 'km', 1000.0, False),
                ('Length', 'Inch', 'in', 0.0254, False),
                ('Length', 'Foot', 'ft', 0.3048, False),
                ('Length', 'Yard', 'yd', 0.9144, False),
                ('Length', 'Mile', 'mi', 1609.34, False),
                
                # Area (base: square meters)
                ('Area', 'Square Meter', 'm²', 1.0, True),
                ('Area', 'Square Centimeter', 'cm²', 0.0001, False),
                ('Area', 'Square Kilometer', 'km²', 1000000.0, False),
                ('Area', 'Square Inch', 'in²', 0.00064516, False),
                ('Area', 'Square Foot', 'ft²', 0.092903, False),
                ('Area', 'Square Yard', 'yd²', 0.836127, False),
                ('Area', 'Acre', 'ac', 4046.86, False),
                ('Area', 'Hectare', 'ha', 10000.0, False),
                
                # Volume (base: liters)
                ('Volume', 'Liter', 'L', 1.0, True),
                ('Volume', 'Milliliter', 'mL', 0.001, False),
                ('Volume', 'Cubic Meter', 'm³', 1000.0, False),
                ('Volume', 'Cubic Centimeter', 'cm³', 0.001, False),
                ('Volume', 'Gallon (US)', 'gal', 3.78541, False),
                ('Volume', 'Quart', 'qt', 0.946353, False),
                ('Volume', 'Pint', 'pt', 0.473176, False),
                ('Volume', 'Fluid Ounce', 'fl oz', 0.0295735, False),
                ('Volume', 'Cubic Foot', 'ft³', 28.3168, False),
                ('Volume', 'Cubic Inch', 'in³', 0.0163871, False),
                
                # Count (base: pieces)
                ('Count', 'Piece', 'pcs', 1.0, True),
                ('Count', 'Dozen', 'doz', 12.0, False),
                ('Count', 'Gross', 'grs', 144.0, False),
                ('Count', 'Pair', 'pr', 2.0, False),
                ('Count', 'Set', 'set', 1.0, False),
                ('Count', 'Hundred', 'hnd', 100.0, False),
                ('Count', 'Thousand', 'k', 1000.0, False),
                ('Count', 'Carton', 'ctn', 1.0, False),
                ('Count', 'Box', 'box', 1.0, False),
                ('Count', 'Bag', 'bag', 1.0, False),
            ]
            
            for category_name, unit_name, symbol, conversion, is_base in units:
                conn.execute(text("""
                    INSERT INTO uom (
                        category_id, name, symbol, conversion_to_base, is_base_unit, is_active
                    )
                    VALUES (
                        :category_id, :name, :symbol, :conversion, :is_base, TRUE
                    )
                    ON CONFLICT (name) DO UPDATE 
                    SET conversion_to_base = :conversion, is_base_unit = :is_base
                """), {
                    'category_id': category_ids[category_name],
                    'name': unit_name,
                    'symbol': symbol,
                    'conversion': conversion,
                    'is_base': is_base
                })
            
            logger.info(f"✅ Added/Updated {len(units)} UOM units with conversion factors")
            
            # Create conversion function
            conn.execute(text("""
                CREATE OR REPLACE FUNCTION convert_uom(
                    p_from_uom_id INTEGER,
                    p_to_uom_id INTEGER,
                    p_value DECIMAL
                ) RETURNS DECIMAL AS $$
                DECLARE
                    v_from_conversion DECIMAL;
                    v_to_conversion DECIMAL;
                    v_from_category INTEGER;
                    v_to_category INTEGER;
                    v_result DECIMAL;
                BEGIN
                    -- Get conversion factors and categories
                    SELECT conversion_to_base, category_id INTO v_from_conversion, v_from_category
                    FROM uom WHERE id = p_from_uom_id;
                    
                    SELECT conversion_to_base, category_id INTO v_to_conversion, v_to_category
                    FROM uom WHERE id = p_to_uom_id;
                    
                    -- Check if same category
                    IF v_from_category != v_to_category THEN
                        RAISE EXCEPTION 'Cannot convert between different unit categories';
                    END IF;
                    
                    -- Convert: value * from_factor / to_factor
                    v_result := (p_value * v_from_conversion) / v_to_conversion;
                    
                    RETURN ROUND(v_result, 10);
                END;
                $$ LANGUAGE plpgsql;
            """))
            
            logger.info("✅ Created UOM conversion function")
            
            logger.info("✅ UOM conversion system created successfully!")
            
        except Exception as e:
            logger.error(f"❌ UOM conversion system creation failed: {e}")
            raise


if __name__ == "__main__":
    create_uom_conversion_system()
