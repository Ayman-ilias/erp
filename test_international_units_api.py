#!/usr/bin/env python3
"""
Test script to verify International units are available in the actual backend API.
This tests the real API endpoints to ensure kg, meter, piece, liter are available.

**Validates: Requirements 11.3**
"""

import requests
import json
import sys
from typing import List, Dict, Any

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_api_connection():
    """Test if the API is accessible."""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ API connection successful")
            return True
        else:
            print(f"✗ API connection failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ API connection failed: {e}")
        return False

def get_all_units():
    """Get all units from the API."""
    try:
        response = requests.get(f"{BASE_URL}/settings/uom", timeout=10)
        if response.status_code == 200:
            units = response.json()
            print(f"✓ Retrieved {len(units)} units from API")
            return units
        else:
            print(f"✗ Failed to get units: {response.status_code}")
            return []
    except requests.exceptions.RequestException as e:
        print(f"✗ Failed to get units: {e}")
        return []

def find_unit_by_symbol(units: List[Dict[Any, Any]], symbol: str):
    """Find a unit by its symbol."""
    for unit in units:
        if unit.get('symbol', '').lower() == symbol.lower():
            return unit
    return None

def test_international_units():
    """Test that required International units are available."""
    print("\n" + "="*60)
    print("TESTING INTERNATIONAL UNITS AVAILABILITY")
    print("="*60)
    
    # Test API connection first
    if not test_api_connection():
        return False
    
    # Get all units
    units = get_all_units()
    if not units:
        return False
    
    # Required International units
    required_units = [
        {'symbol': 'kg', 'name': 'Kilogram', 'category': 'Weight'},
        {'symbol': 'm', 'name': 'Meter', 'category': 'Length'},
        {'symbol': 'pc', 'name': 'Piece', 'category': 'Count'},
        {'symbol': 'L', 'name': 'Liter', 'category': 'Volume'},
    ]
    
    all_found = True
    
    print(f"\nTesting {len(required_units)} required International units:")
    print("-" * 60)
    
    for required in required_units:
        unit = find_unit_by_symbol(units, required['symbol'])
        
        if unit:
            print(f"✓ {required['symbol']:3} | {unit['name']:15} | Type: {unit.get('unit_type', 'N/A'):12} | Category: {unit.get('category_name', 'N/A')}")
            
            # Verify unit type is SI or International
            unit_type = unit.get('unit_type', '')
            if unit_type not in ['SI', 'International']:
                print(f"  ⚠️  Warning: Expected SI/International, got '{unit_type}'")
            
            # Verify it's active
            if not unit.get('is_active', False):
                print(f"  ⚠️  Warning: Unit is inactive")
                
        else:
            print(f"✗ {required['symbol']:3} | NOT FOUND")
            all_found = False
    
    return all_found

def test_unit_conversions():
    """Test conversions between International units."""
    print(f"\n" + "="*60)
    print("TESTING INTERNATIONAL UNIT CONVERSIONS")
    print("="*60)
    
    # Test conversions within same category
    test_conversions = [
        {'from_symbol': 'kg', 'to_symbol': 'g', 'value': 1, 'expected_range': (900, 1100)},
        {'from_symbol': 'm', 'to_symbol': 'cm', 'value': 1, 'expected_range': (90, 110)},
    ]
    
    all_passed = True
    
    for test in test_conversions:
        try:
            # Get units to find IDs
            units = get_all_units()
            from_unit = find_unit_by_symbol(units, test['from_symbol'])
            to_unit = find_unit_by_symbol(units, test['to_symbol'])
            
            if not from_unit or not to_unit:
                print(f"✗ Conversion {test['from_symbol']} → {test['to_symbol']}: Units not found")
                all_passed = False
                continue
            
            # Test conversion API
            conversion_data = {
                'source_unit_id': from_unit['id'],
                'target_unit_id': to_unit['id'],
                'value': test['value']
            }
            
            response = requests.post(
                f"{BASE_URL}/settings/uom/convert",
                json=conversion_data,
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                converted_value = result.get('converted_value', 0)
                
                if test['expected_range'][0] <= converted_value <= test['expected_range'][1]:
                    print(f"✓ {test['from_symbol']} → {test['to_symbol']}: {test['value']} = {converted_value}")
                else:
                    print(f"✗ {test['from_symbol']} → {test['to_symbol']}: Expected {test['expected_range']}, got {converted_value}")
                    all_passed = False
            else:
                print(f"✗ Conversion {test['from_symbol']} → {test['to_symbol']}: API error {response.status_code}")
                all_passed = False
                
        except requests.exceptions.RequestException as e:
            print(f"✗ Conversion {test['from_symbol']} → {test['to_symbol']}: {e}")
            all_passed = False
    
    return all_passed

def test_unit_categories():
    """Test that International units are in correct categories."""
    print(f"\n" + "="*60)
    print("TESTING INTERNATIONAL UNIT CATEGORIES")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/settings/uom-categories", timeout=5)
        if response.status_code != 200:
            print(f"✗ Failed to get categories: {response.status_code}")
            return False
            
        categories = response.json()
        print(f"✓ Retrieved {len(categories)} categories")
        
        # Check required categories exist
        required_categories = ['Weight', 'Length', 'Volume', 'Count']
        category_names = [cat.get('name', '') for cat in categories]
        
        all_found = True
        for req_cat in required_categories:
            if req_cat in category_names:
                print(f"✓ Category '{req_cat}' found")
            else:
                print(f"✗ Category '{req_cat}' not found")
                all_found = False
        
        return all_found
        
    except requests.exceptions.RequestException as e:
        print(f"✗ Failed to get categories: {e}")
        return False

def main():
    """Main test function."""
    print("INTERNATIONAL UNITS VERIFICATION")
    print("Testing actual backend API for International units availability")
    print("Requirements: 11.3")
    
    # Run all tests
    tests_passed = 0
    total_tests = 3
    
    if test_international_units():
        tests_passed += 1
    
    if test_unit_categories():
        tests_passed += 1
        
    if test_unit_conversions():
        tests_passed += 1
    
    # Summary
    print(f"\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Tests passed: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("✓ ALL TESTS PASSED - International units are properly available")
        return 0
    else:
        print("✗ SOME TESTS FAILED - International units may not be properly configured")
        return 1

if __name__ == "__main__":
    sys.exit(main())