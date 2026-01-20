#!/usr/bin/env python3

from core.database import SessionLocalSizeColor
from sqlalchemy import text

def show_enhanced_data():
    """Show sample data from the enhanced measurement system"""
    db = SessionLocalSizeColor()
    
    try:
        print("=== ENHANCED SIZE MEASUREMENTS DATA ===")
        
        # Show sample measurements with enhanced data
        result = db.execute(text("""
            SELECT 
                garment_type_name,
                size_name,
                measurement_name,
                value_cm,
                unit_symbol,
                unit_name,
                is_custom,
                CASE WHEN measurement_spec_id IS NOT NULL THEN 'Linked' ELSE 'Not Linked' END as spec_status
            FROM v_size_measurements_enhanced 
            ORDER BY garment_type_name, size_name, measurement_name
            LIMIT 20
        """))
        
        print(f"{'Garment':<15} {'Size':<8} {'Measurement':<15} {'Value':<8} {'Unit':<6} {'Custom':<8} {'Spec':<10}")
        print("-" * 80)
        
        for row in result:
            print(f"{row[0]:<15} {row[1]:<8} {row[2]:<15} {row[3]:<8} {row[4]:<6} {str(row[6]):<8} {row[7]:<10}")
        
        print("\n=== MEASUREMENT STATISTICS BY GARMENT TYPE ===")
        
        result = db.execute(text("""
            SELECT 
                garment_type_name,
                COUNT(*) as total_measurements,
                COUNT(DISTINCT measurement_name) as unique_measurements,
                COUNT(*) FILTER (WHERE is_custom = TRUE) as custom_measurements,
                COUNT(*) FILTER (WHERE measurement_spec_id IS NOT NULL) as linked_measurements
            FROM v_size_measurements_enhanced 
            GROUP BY garment_type_name
            ORDER BY garment_type_name
        """))
        
        print(f"{'Garment Type':<20} {'Total':<8} {'Unique':<8} {'Custom':<8} {'Linked':<8}")
        print("-" * 60)
        
        for row in result:
            print(f"{row[0]:<20} {row[1]:<8} {row[2]:<8} {row[3]:<8} {row[4]:<8}")
        
        print("\n=== UNIT DISTRIBUTION ===")
        
        result = db.execute(text("""
            SELECT 
                unit_symbol,
                unit_name,
                COUNT(*) as usage_count
            FROM size_measurements 
            GROUP BY unit_symbol, unit_name
            ORDER BY usage_count DESC
        """))
        
        print(f"{'Unit Symbol':<12} {'Unit Name':<20} {'Count':<8}")
        print("-" * 45)
        
        for row in result:
            print(f"{row[0]:<12} {row[1]:<20} {row[2]:<8}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    show_enhanced_data()