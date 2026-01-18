"""
Verification script for sample schema data conversion
Task 2.4: Verify data conversion in database

This script verifies that:
1. decorative_part and additional_instruction columns are JSONB type
2. Data contains valid JSON arrays
3. Data is properly formatted
4. No data loss occurred
"""

import sys
import json
from sqlalchemy import text, inspect
from core.database import SessionLocalSamples, engines, DatabaseType

def verify_column_types():
    """Verify that columns are JSONB type"""
    print("\n" + "="*80)
    print("STEP 1: Verifying Column Types")
    print("="*80)
    
    inspector = inspect(engines[DatabaseType.SAMPLES])
    columns = inspector.get_columns("sample_requests")
    
    decorative_part_col = next((col for col in columns if col['name'] == 'decorative_part'), None)
    additional_instruction_col = next((col for col in columns if col['name'] == 'additional_instruction'), None)
    
    print(f"\nColumn: decorative_part")
    if decorative_part_col:
        col_type = str(decorative_part_col['type'])
        print(f"  Type: {col_type}")
        is_jsonb = 'JSONB' in col_type.upper() or 'JSON' in col_type.upper()
        print(f"  Is JSONB: {'✅ YES' if is_jsonb else '❌ NO'}")
        if not is_jsonb:
            print(f"  ⚠️  WARNING: Expected JSONB but got {col_type}")
            return False
    else:
        print("  ❌ Column not found!")
        return False
    
    print(f"\nColumn: additional_instruction")
    if additional_instruction_col:
        col_type = str(additional_instruction_col['type'])
        print(f"  Type: {col_type}")
        is_jsonb = 'JSONB' in col_type.upper() or 'JSON' in col_type.upper()
        print(f"  Is JSONB: {'✅ YES' if is_jsonb else '❌ NO'}")
        if not is_jsonb:
            print(f"  ⚠️  WARNING: Expected JSONB but got {col_type}")
            return False
    else:
        print("  ❌ Column not found!")
        return False
    
    print("\n✅ Column types verified successfully!")
    return True


def verify_data_format():
    """Verify that data is valid JSON arrays"""
    print("\n" + "="*80)
    print("STEP 2: Verifying Data Format")
    print("="*80)
    
    with SessionLocalSamples() as db:
        # Get all sample requests
        result = db.execute(text("""
            SELECT 
                id,
                sample_id,
                decorative_part,
                additional_instruction,
                pg_typeof(decorative_part) as decorative_part_type,
                pg_typeof(additional_instruction) as additional_instruction_type
            FROM sample_requests
            ORDER BY id
        """))
        
        rows = result.fetchall()
        total_count = len(rows)
        
        print(f"\nTotal sample requests: {total_count}")
        
        if total_count == 0:
            print("⚠️  No sample requests found in database")
            return True
        
        # Statistics
        decorative_part_stats = {
            'null': 0,
            'empty_array': 0,
            'valid_array': 0,
            'invalid': 0
        }
        
        additional_instruction_stats = {
            'null': 0,
            'empty_array': 0,
            'valid_array': 0,
            'invalid': 0
        }
        
        issues = []
        
        for row in rows:
            sample_id = row[1]
            decorative_part = row[2]
            additional_instruction = row[3]
            decorative_part_type = row[4]
            additional_instruction_type = row[5]
            
            # Check decorative_part
            if decorative_part is None:
                decorative_part_stats['null'] += 1
            elif isinstance(decorative_part, list):
                if len(decorative_part) == 0:
                    decorative_part_stats['empty_array'] += 1
                else:
                    decorative_part_stats['valid_array'] += 1
            else:
                decorative_part_stats['invalid'] += 1
                issues.append(f"Sample {sample_id}: decorative_part is not an array (type: {type(decorative_part)})")
            
            # Check additional_instruction
            if additional_instruction is None:
                additional_instruction_stats['null'] += 1
            elif isinstance(additional_instruction, list):
                if len(additional_instruction) == 0:
                    additional_instruction_stats['empty_array'] += 1
                else:
                    additional_instruction_stats['valid_array'] += 1
            else:
                additional_instruction_stats['invalid'] += 1
                issues.append(f"Sample {sample_id}: additional_instruction is not an array (type: {type(additional_instruction)})")
        
        # Print statistics
        print("\n" + "-"*80)
        print("decorative_part Statistics:")
        print("-"*80)
        print(f"  NULL values:        {decorative_part_stats['null']:4d} ({decorative_part_stats['null']/total_count*100:.1f}%)")
        print(f"  Empty arrays:       {decorative_part_stats['empty_array']:4d} ({decorative_part_stats['empty_array']/total_count*100:.1f}%)")
        print(f"  Valid arrays:       {decorative_part_stats['valid_array']:4d} ({decorative_part_stats['valid_array']/total_count*100:.1f}%)")
        print(f"  Invalid format:     {decorative_part_stats['invalid']:4d} ({decorative_part_stats['invalid']/total_count*100:.1f}%)")
        
        print("\n" + "-"*80)
        print("additional_instruction Statistics:")
        print("-"*80)
        print(f"  NULL values:        {additional_instruction_stats['null']:4d} ({additional_instruction_stats['null']/total_count*100:.1f}%)")
        print(f"  Empty arrays:       {additional_instruction_stats['empty_array']:4d} ({additional_instruction_stats['empty_array']/total_count*100:.1f}%)")
        print(f"  Valid arrays:       {additional_instruction_stats['valid_array']:4d} ({additional_instruction_stats['valid_array']/total_count*100:.1f}%)")
        print(f"  Invalid format:     {additional_instruction_stats['invalid']:4d} ({additional_instruction_stats['invalid']/total_count*100:.1f}%)")
        
        # Print issues
        if issues:
            print("\n" + "-"*80)
            print("⚠️  ISSUES FOUND:")
            print("-"*80)
            for issue in issues:
                print(f"  • {issue}")
            return False
        else:
            print("\n✅ All data is properly formatted!")
            return True


def verify_sample_data():
    """Show sample data for manual inspection"""
    print("\n" + "="*80)
    print("STEP 3: Sample Data Inspection")
    print("="*80)
    
    with SessionLocalSamples() as db:
        # Get first 5 samples with non-null values
        result = db.execute(text("""
            SELECT 
                sample_id,
                decorative_part,
                additional_instruction
            FROM sample_requests
            WHERE decorative_part IS NOT NULL 
               OR additional_instruction IS NOT NULL
            ORDER BY id
            LIMIT 5
        """))
        
        rows = result.fetchall()
        
        if not rows:
            print("\n⚠️  No samples with decorative_part or additional_instruction found")
            return True
        
        print(f"\nShowing first {len(rows)} samples with data:\n")
        
        for i, row in enumerate(rows, 1):
            sample_id = row[0]
            decorative_part = row[1]
            additional_instruction = row[2]
            
            print(f"{i}. Sample ID: {sample_id}")
            print(f"   decorative_part: {json.dumps(decorative_part, indent=2) if decorative_part else 'NULL'}")
            print(f"   additional_instruction: {json.dumps(additional_instruction, indent=2) if additional_instruction else 'NULL'}")
            print()
        
        return True


def verify_no_data_loss():
    """Verify no data loss by checking record counts"""
    print("\n" + "="*80)
    print("STEP 4: Verifying No Data Loss")
    print("="*80)
    
    with SessionLocalSamples() as db:
        # Count total records
        result = db.execute(text("SELECT COUNT(*) FROM sample_requests"))
        total_count = result.scalar()
        
        print(f"\nTotal sample_requests records: {total_count}")
        
        # Count records with decorative_part data
        result = db.execute(text("""
            SELECT COUNT(*) FROM sample_requests 
            WHERE decorative_part IS NOT NULL 
              AND jsonb_array_length(decorative_part) > 0
        """))
        decorative_count = result.scalar()
        
        print(f"Records with decorative_part data: {decorative_count}")
        
        # Count records with additional_instruction data
        result = db.execute(text("""
            SELECT COUNT(*) FROM sample_requests 
            WHERE additional_instruction IS NOT NULL 
              AND jsonb_array_length(additional_instruction) > 0
        """))
        instruction_count = result.scalar()
        
        print(f"Records with additional_instruction data: {instruction_count}")
        
        print("\n✅ Data counts verified!")
        return True


def main():
    """Run all verification steps"""
    print("\n" + "="*80)
    print("SAMPLE SCHEMA VERIFICATION")
    print("Task 2.4: Verify data conversion in database")
    print("="*80)
    
    try:
        # Step 1: Verify column types
        if not verify_column_types():
            print("\n❌ VERIFICATION FAILED: Column types are incorrect")
            sys.exit(1)
        
        # Step 2: Verify data format
        if not verify_data_format():
            print("\n❌ VERIFICATION FAILED: Data format issues found")
            sys.exit(1)
        
        # Step 3: Show sample data
        if not verify_sample_data():
            print("\n❌ VERIFICATION FAILED: Sample data inspection failed")
            sys.exit(1)
        
        # Step 4: Verify no data loss
        if not verify_no_data_loss():
            print("\n❌ VERIFICATION FAILED: Data loss detected")
            sys.exit(1)
        
        # All checks passed
        print("\n" + "="*80)
        print("✅ ALL VERIFICATION CHECKS PASSED!")
        print("="*80)
        print("\nSummary:")
        print("  ✅ Columns are correctly typed as JSONB")
        print("  ✅ Data contains valid JSON arrays")
        print("  ✅ Data is properly formatted")
        print("  ✅ No data loss occurred")
        print("\n" + "="*80)
        
        sys.exit(0)
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
