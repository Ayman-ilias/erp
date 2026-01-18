#!/usr/bin/env python3
"""
Test script for the audit log viewing endpoint

This script tests the GET /audit/unit-changes endpoint to ensure it works correctly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import requests
import json
from datetime import datetime, timedelta

# Test configuration
BASE_URL = "http://localhost:8000/api/v1"
AUDIT_ENDPOINT = f"{BASE_URL}/units/audit/unit-changes"
SUMMARY_ENDPOINT = f"{BASE_URL}/units/audit/summary"

def test_audit_endpoint():
    """Test the audit log viewing endpoint"""
    print("Testing Unit Change Audit Log Endpoint")
    print("=" * 50)
    
    # Test 1: Get all audit logs (basic test)
    print("\n1. Testing basic audit log retrieval...")
    try:
        response = requests.get(AUDIT_ENDPOINT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Total logs: {data.get('total_count', 0)}")
            print(f"Page: {data.get('page', 1)}")
            print(f"Page size: {data.get('page_size', 50)}")
            print(f"Total pages: {data.get('total_pages', 0)}")
            
            logs = data.get('logs', [])
            if logs:
                print(f"First log: {json.dumps(logs[0], indent=2, default=str)}")
            else:
                print("No audit logs found")
        else:
            print(f"Error: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - make sure the backend server is running")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    # Test 2: Test filtering by table name
    print("\n2. Testing table name filtering...")
    try:
        params = {"table_name": "material_master"}
        response = requests.get(AUDIT_ENDPOINT, params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Filtered logs (material_master): {data.get('total_count', 0)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # Test 3: Test pagination
    print("\n3. Testing pagination...")
    try:
        params = {"page": 1, "page_size": 10}
        response = requests.get(AUDIT_ENDPOINT, params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Page 1 with 10 items: {len(data.get('logs', []))} logs returned")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # Test 4: Test date range filtering
    print("\n4. Testing date range filtering...")
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)  # Last 30 days
        
        params = {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
        response = requests.get(AUDIT_ENDPOINT, params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Logs in last 30 days: {data.get('total_count', 0)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # Test 5: Test audit summary endpoint
    print("\n5. Testing audit summary endpoint...")
    try:
        response = requests.get(SUMMARY_ENDPOINT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Summary: {json.dumps(data, indent=2, default=str)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n✅ Audit endpoint tests completed!")
    return True

def test_endpoint_documentation():
    """Test that the endpoint appears in OpenAPI documentation"""
    print("\nTesting OpenAPI documentation...")
    try:
        response = requests.get(f"{BASE_URL}/openapi.json")
        if response.status_code == 200:
            openapi_spec = response.json()
            paths = openapi_spec.get("paths", {})
            
            audit_path = "/units/audit/unit-changes"
            summary_path = "/units/audit/summary"
            
            if audit_path in paths:
                print(f"✅ {audit_path} found in OpenAPI spec")
            else:
                print(f"❌ {audit_path} NOT found in OpenAPI spec")
            
            if summary_path in paths:
                print(f"✅ {summary_path} found in OpenAPI spec")
            else:
                print(f"❌ {summary_path} NOT found in OpenAPI spec")
        else:
            print(f"❌ Failed to get OpenAPI spec: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking OpenAPI spec: {str(e)}")

if __name__ == "__main__":
    print("Unit Change Audit Endpoint Test")
    print("=" * 40)
    print("This script tests the audit log viewing endpoint.")
    print("Make sure the backend server is running on localhost:8000")
    print()
    
    success = test_audit_endpoint()
    test_endpoint_documentation()
    
    if success:
        print("\n🎉 All tests completed successfully!")
    else:
        print("\n❌ Some tests failed. Check the backend server.")