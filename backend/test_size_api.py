#!/usr/bin/env python3

import requests
import json

def test_size_master_api():
    """Test the Size Master API endpoints"""
    base_url = "http://localhost:8000/api/v1/sizecolor"
    
    print("=== TESTING SIZE MASTER API ===")
    
    # Test 1: Get sizes list
    print("\n1. Testing GET /sizes")
    try:
        response = requests.get(f"{base_url}/sizes?limit=3")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: Found {len(data)} sizes")
            if data:
                print(f"   Sample size: {data[0]['size_code']} - {data[0]['size_name']}")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Get specific size with measurements
    print("\n2. Testing GET /sizes/{id} with measurements")
    try:
        response = requests.get(f"{base_url}/sizes/10")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: Size {data['size_code']}")
            print(f"   Measurements: {len(data.get('measurements', []))}")
            if data.get('measurements'):
                measurement = data['measurements'][0]
                print(f"   Sample measurement: {measurement['measurement_name']} = {measurement['value_cm']}{measurement['unit_symbol']}")
                print(f"   Has unit info: unit_symbol={measurement.get('unit_symbol')}, unit_name={measurement.get('unit_name')}")
                print(f"   Is custom: {measurement.get('is_custom')}")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Get garment types
    print("\n3. Testing GET /garment-types")
    try:
        response = requests.get(f"{base_url}/garment-types")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: Found {len(data)} garment types")
            if data:
                print(f"   Sample: {data[0]['name']} ({data[0]['code']})")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Get measurement specs for a garment type
    print("\n4. Testing GET /garment-types/{id}/measurements")
    try:
        response = requests.get(f"{base_url}/garment-types/1/measurements")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: Found {len(data)} measurement specs")
            if data:
                print(f"   Sample spec: {data[0]['measurement_name']} ({data[0]['measurement_code']})")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n=== API TEST COMPLETE ===")

if __name__ == "__main__":
    test_size_master_api()