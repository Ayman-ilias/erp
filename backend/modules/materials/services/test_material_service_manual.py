"""
Manual Test Script for MaterialService

This script tests the MaterialService implementation with real database connections.
Run this after ensuring the databases are running.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from modules.materials.services.material_service import MaterialService, MaterialServiceError
from modules.materials.services.validation_service import ValidationError, DatabaseConnectionError


def test_material_service():
    """Test MaterialService with real database"""
    
    print("=" * 80)
    print("MaterialService Manual Test")
    print("=" * 80)
    
    service = MaterialService()
    
    # Test 1: Create material with valid unit
    print("\n[Test 1] Creating material with valid unit...")
    try:
        material = service.create_material(
            material_name="Test Cotton Fabric",
            unit_id=1,  # Assuming unit_id 1 exists (Kilogram)
            material_category="Fabric",
            description="Test material for service validation"
        )
        print(f"✓ Material created successfully: ID={material['id']}, Name={material['material_name']}")
        print(f"  Unit: {material['unit']['name']} ({material['unit']['symbol']})")
        test_material_id = material['id']
    except Exception as e:
        print(f"✗ Failed to create material: {e}")
        return
    
    # Test 2: Get material with unit (should use cache)
    print("\n[Test 2] Retrieving material with unit details...")
    try:
        material = service.get_material_with_unit(test_material_id)
        print(f"✓ Material retrieved: {material['material_name']}")
        print(f"  Unit: {material['unit']['name']} ({material['unit']['symbol']})")
        print(f"  Category: {material['unit']['category_name']}")
    except Exception as e:
        print(f"✗ Failed to retrieve material: {e}")
    
    # Test 3: Get material again (should hit cache)
    print("\n[Test 3] Retrieving material again (cache test)...")
    try:
        material = service.get_material_with_unit(test_material_id)
        print(f"✓ Material retrieved from cache: {material['material_name']}")
    except Exception as e:
        print(f"✗ Failed to retrieve material: {e}")
    
    # Test 4: Update material with new unit
    print("\n[Test 4] Updating material with new unit...")
    try:
        updated = service.update_material(
            material_id=test_material_id,
            unit_id=2,  # Assuming unit_id 2 exists (Gram)
            description="Updated description"
        )
        print(f"✓ Material updated successfully")
        print(f"  New unit: {updated['unit']['name']} ({updated['unit']['symbol']})")
    except Exception as e:
        print(f"✗ Failed to update material: {e}")
    
    # Test 5: Try to create material with invalid unit
    print("\n[Test 5] Attempting to create material with invalid unit...")
    try:
        service.create_material(
            material_name="Invalid Material",
            unit_id=99999,  # Invalid unit_id
            material_category="Fabric"
        )
        print(f"✗ Should have failed with ValidationError")
    except ValidationError as e:
        print(f"✓ Correctly rejected invalid unit: {e}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
    
    # Test 6: Batch retrieval (test N+1 query prevention)
    print("\n[Test 6] Batch retrieval of materials...")
    try:
        materials = service.get_materials_with_units(skip=0, limit=10)
        print(f"✓ Retrieved {len(materials)} materials")
        for mat in materials[:3]:  # Show first 3
            unit_info = mat['unit']
            if unit_info:
                print(f"  - {mat['material_name']}: {unit_info['symbol']}")
            else:
                print(f"  - {mat['material_name']}: No unit info")
    except Exception as e:
        print(f"✗ Failed to retrieve materials: {e}")
    
    # Test 7: Delete test material
    print("\n[Test 7] Deleting test material...")
    try:
        deleted = service.delete_material(test_material_id)
        if deleted:
            print(f"✓ Material deleted successfully")
        else:
            print(f"✗ Material not found for deletion")
    except Exception as e:
        print(f"✗ Failed to delete material: {e}")
    
    # Test 8: Cache statistics
    print("\n[Test 8] Cache statistics...")
    print(f"  Cache size: {len(MaterialService._unit_cache)} units")
    print(f"  Cache timestamp: {MaterialService._cache_timestamp}")
    
    print("\n" + "=" * 80)
    print("Manual tests completed!")
    print("=" * 80)


if __name__ == "__main__":
    try:
        test_material_service()
    except Exception as e:
        print(f"\nFatal error: {e}")
        import traceback
        traceback.print_exc()
