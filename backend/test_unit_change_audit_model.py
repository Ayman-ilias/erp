#!/usr/bin/env python3
"""
Test script to verify UnitChangeAudit model definition
This script tests the model without requiring database connection
"""

import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_unit_change_audit_model():
    """Test that the UnitChangeAudit model is properly defined"""
    
    try:
        # Import the model
        from modules.units.models.unit import UnitChangeAudit
        
        print("✅ UnitChangeAudit model imported successfully")
        
        # Check table name
        assert UnitChangeAudit.__tablename__ == "unit_change_audit"
        print("✅ Table name is correct: unit_change_audit")
        
        # Check that required columns exist
        required_columns = [
            'id', 'table_name', 'record_id', 'field_name',
            'old_unit_id', 'new_unit_id', 'changed_by', 'changed_at', 'change_reason'
        ]
        
        model_columns = [column.name for column in UnitChangeAudit.__table__.columns]
        
        for col in required_columns:
            assert col in model_columns, f"Column {col} is missing"
        
        print(f"✅ All required columns present: {', '.join(required_columns)}")
        
        # Check indexes
        indexes = UnitChangeAudit.__table__.indexes
        index_names = [idx.name for idx in indexes if idx.name]
        
        expected_indexes = [
            'idx_unit_audit_table_record',
            'idx_unit_audit_changed_at', 
            'idx_unit_audit_changed_by'
        ]
        
        for idx_name in expected_indexes:
            assert idx_name in index_names, f"Index {idx_name} is missing"
        
        print(f"✅ All expected indexes present: {', '.join(expected_indexes)}")
        
        # Test model instantiation (without database)
        audit_record = UnitChangeAudit(
            table_name="material_master",
            record_id=123,
            field_name="unit_id",
            old_unit_id=1,
            new_unit_id=2,
            changed_by="test_user",
            change_reason="test_migration"
        )
        
        assert audit_record.table_name == "material_master"
        assert audit_record.record_id == 123
        assert audit_record.field_name == "unit_id"
        assert audit_record.old_unit_id == 1
        assert audit_record.new_unit_id == 2
        assert audit_record.changed_by == "test_user"
        assert audit_record.change_reason == "test_migration"
        
        print("✅ Model instantiation works correctly")
        
        # Test __repr__ method
        repr_str = repr(audit_record)
        assert "UnitChangeAudit" in repr_str
        assert "material_master" in repr_str
        assert "123" in repr_str
        
        print("✅ __repr__ method works correctly")
        
        print("\n🎉 All tests passed! UnitChangeAudit model is properly defined.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_migration_script():
    """Test that the migration script is properly structured"""
    
    try:
        # Import migration functions
        from migrations.create_unit_change_audit_table import run_migration, rollback_migration, verify_migration
        
        print("✅ Migration script functions imported successfully")
        
        # Check that functions are callable
        assert callable(run_migration), "run_migration is not callable"
        assert callable(rollback_migration), "rollback_migration is not callable" 
        assert callable(verify_migration), "verify_migration is not callable"
        
        print("✅ All migration functions are callable")
        
        print("\n🎉 Migration script structure is correct!")
        return True
        
    except Exception as e:
        print(f"❌ Migration script test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing UnitChangeAudit Model and Migration...")
    print("=" * 50)
    
    model_test_passed = test_unit_change_audit_model()
    print()
    migration_test_passed = test_migration_script()
    
    print("\n" + "=" * 50)
    if model_test_passed and migration_test_passed:
        print("🎉 All tests passed! Task 13.1 implementation is ready.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please check the implementation.")
        sys.exit(1)