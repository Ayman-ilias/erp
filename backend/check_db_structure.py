#!/usr/bin/env python3

from core.database import SessionLocalSizeColor
from sqlalchemy import text

def check_size_measurements_structure():
    db = SessionLocalSizeColor()
    try:
        # Check columns
        result = db.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'size_measurements' 
            ORDER BY ordinal_position
        """))
        
        print("=== SIZE_MEASUREMENTS TABLE STRUCTURE ===")
        for row in result:
            print(f"{row[0]}: {row[1]} (nullable: {row[2]}, default: {row[3]})")
        
        # Check constraints
        result = db.execute(text("""
            SELECT constraint_name, constraint_type 
            FROM information_schema.table_constraints 
            WHERE table_name = 'size_measurements'
        """))
        
        print("\n=== CONSTRAINTS ===")
        for row in result:
            print(f"{row[0]}: {row[1]}")
        
        # Check indexes
        result = db.execute(text("""
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'size_measurements'
        """))
        
        print("\n=== INDEXES ===")
        for row in result:
            print(f"{row[0]}: {row[1]}")
            
        # Check sample data
        result = db.execute(text("""
            SELECT COUNT(*) as total_measurements,
                   COUNT(*) FILTER (WHERE unit_symbol IS NOT NULL) as with_unit_symbol,
                   COUNT(*) FILTER (WHERE is_custom IS NOT NULL) as with_is_custom
            FROM size_measurements
        """))
        
        print("\n=== DATA SUMMARY ===")
        row = result.fetchone()
        if row:
            print(f"Total measurements: {row[0]}")
            print(f"With unit_symbol: {row[1]}")
            print(f"With is_custom: {row[2]}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_size_measurements_structure()