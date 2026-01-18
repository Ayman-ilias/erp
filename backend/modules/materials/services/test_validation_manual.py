"""
Manual Integration Test for Validation Service

This script can be run manually to test the validation service against a real database.
Run this after the database is set up and seeded with unit data.

Usage:
    python test_validation_manual.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..'))

from modules.materials.services.validation_service import (
    ValidationService,
    ValidationError,
    DatabaseConnectionError
)


def test_validate_unit_id():
    """Test validate_unit_id with real database"""
    print("\n=== Testing validate_unit_id ===")
    
    # Test valid unit (assuming unit_id 1 exists)
    try:
        result = ValidationService.validate_unit_id(1)
        print(f"✓ validate_unit_id(1): {result}")
    except Exception as e:
        print(f"✗ validate_unit_id(1) failed: {e}")
    
    # Test invalid unit
    try:
        result = ValidationService.validate_unit_id(99999)
        print(f"✓ validate_unit_id(99999): {result} (should be False)")
    except Exception as e:
        print(f"✗ validate_unit_id(99999) failed: {e}")
    
    # Test invalid inputs
    try:
        result = ValidationService.validate_unit_id(0)
        print(f"✓ validate_unit_id(0): {result} (should be False)")
    except Exception as e:
        print(f"✗ validate_unit_id(0) failed: {e}")
    
    try:
        result = ValidationService.validate_unit_id(None)
        print(f"✓ validate_unit_id(None): {result} (should be False)")
    except Exception as e:
        print(f"✗ validate_unit_id(None) failed: {e}")


def test_validate_unit_category():
    """Test validate_unit_category with real database"""
    print("\n=== Testing validate_unit_category ===")
    
    # Test valid unit in correct category (assuming unit_id 1 is in Weight category)
    try:
        result = ValidationService.validate_unit_category(1, "Weight")
        print(f"✓ validate_unit_category(1, 'Weight'): {result}")
    except Exception as e:
        print(f"✗ validate_unit_category(1, 'Weight') failed: {e}")
    
    # Test valid unit in wrong category
    try:
        result = ValidationService.validate_unit_category(1, "Length")
        print(f"✓ validate_unit_category(1, 'Length'): {result} (should be False)")
    except Exception as e:
        print(f"✗ validate_unit_category(1, 'Length') failed: {e}")
    
    # Test invalid inputs
    try:
        result = ValidationService.validate_unit_category(0, "Weight")
        print(f"✓ validate_unit_category(0, 'Weight'): {result} (should be False)")
    except Exception as e:
        print(f"✗ validate_unit_category(0, 'Weight') failed: {e}")


def test_validate_unit_id_with_details():
    """Test validate_unit_id_with_details with real database"""
    print("\n=== Testing validate_unit_id_with_details ===")
    
    # Test valid unit
    try:
        is_valid, details = ValidationService.validate_unit_id_with_details(1)
        print(f"✓ validate_unit_id_with_details(1):")
        print(f"  Valid: {is_valid}")
        if details:
            print(f"  Name: {details['name']}")
            print(f"  Symbol: {details['symbol']}")
            print(f"  Category: {details['category_name']}")
            print(f"  Type: {details['unit_type']}")
    except Exception as e:
        print(f"✗ validate_unit_id_with_details(1) failed: {e}")
    
    # Test invalid unit
    try:
        is_valid, details = ValidationService.validate_unit_id_with_details(99999)
        print(f"✓ validate_unit_id_with_details(99999): Valid={is_valid}, Details={details}")
    except Exception as e:
        print(f"✗ validate_unit_id_with_details(99999) failed: {e}")


def test_validate_multiple_unit_ids():
    """Test validate_multiple_unit_ids with real database"""
    print("\n=== Testing validate_multiple_unit_ids ===")
    
    # Test batch validation
    try:
        results = ValidationService.validate_multiple_unit_ids([1, 2, 3, 99999])
        print(f"✓ validate_multiple_unit_ids([1, 2, 3, 99999]):")
        for unit_id, is_valid in results.items():
            print(f"  Unit {unit_id}: {is_valid}")
    except Exception as e:
        print(f"✗ validate_multiple_unit_ids failed: {e}")
    
    # Test empty list
    try:
        results = ValidationService.validate_multiple_unit_ids([])
        print(f"✓ validate_multiple_unit_ids([]): {results} (should be empty dict)")
    except Exception as e:
        print(f"✗ validate_multiple_unit_ids([]) failed: {e}")


def test_error_handling():
    """Test error handling scenarios"""
    print("\n=== Testing Error Handling ===")
    
    # These tests would require mocking or a disconnected database
    # For now, just verify the exceptions are defined
    print(f"✓ ValidationError defined: {ValidationError}")
    print(f"✓ DatabaseConnectionError defined: {DatabaseConnectionError}")


def main():
    """Run all tests"""
    print("=" * 60)
    print("Manual Integration Tests for ValidationService")
    print("=" * 60)
    print("\nNOTE: These tests require:")
    print("  1. Database connection configured in .env")
    print("  2. Unit Conversion System seeded with data")
    print("  3. At least one unit in the 'Weight' category")
    
    try:
        test_validate_unit_id()
        test_validate_unit_category()
        test_validate_unit_id_with_details()
        test_validate_multiple_unit_ids()
        test_error_handling()
        
        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Test suite failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
