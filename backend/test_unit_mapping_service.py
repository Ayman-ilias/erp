"""
Test script for Unit Mapping Service

Quick validation of the unit text mapping functionality.
"""

import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

# Set environment variables if not set
if not os.getenv("DATABASE_URL_UNITS"):
    print("⚠️  DATABASE_URL_UNITS not set. Please set environment variables.")
    print("   This test requires a running database with the Unit Conversion System.")
    sys.exit(1)

# Import after path setup
try:
    from modules.materials.services.unit_mapping_service import UnitMappingService
    from core.database import SessionLocalUnits
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("   Make sure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)


def test_unit_mapping_service():
    """Test the unit mapping service with common unit texts."""
    
    print("=" * 80)
    print("Unit Mapping Service Test")
    print("=" * 80)
    
    service = UnitMappingService()
    db = SessionLocalUnits()
    
    try:
        # Test cases: common unit texts that should be found
        test_cases = [
            # Weight units
            "kg", "Kg", "KG", "kilogram", "Kilogram",
            "g", "gram", "gm",
            "tola", "Tola",
            "seer", "Seer",
            "maund", "Maund",
            
            # Length units
            "m", "meter", "Meter",
            "cm", "centimeter",
            "mm", "millimeter",
            "inch", "inches",
            "yard", "yd",
            
            # Textile units
            "gsm", "GSM", "g/m2",
            "denier", "Denier",
            
            # Count units
            "piece", "Piece", "pc", "pcs",
            "dozen", "doz",
            "lakh", "Lakh",
            "crore", "Crore",
            
            # Volume units
            "liter", "l", "L",
            "ml", "milliliter",
            
            # Unknown units (should not be found)
            "unknown", "xyz", "invalid",
        ]
        
        print("\n1. Testing individual unit text lookups:")
        print("-" * 80)
        
        results = []
        for text in test_cases:
            unit = service.search_unit_by_text(text, db)
            if unit:
                results.append((text, unit.id, unit.name, unit.symbol, "✓"))
                print(f"✓ '{text:15}' -> Unit(id={unit.id:3}, name='{unit.name:25}', symbol='{unit.symbol}')")
            else:
                results.append((text, None, None, None, "✗"))
                print(f"✗ '{text:15}' -> NOT FOUND")
        
        # Statistics
        found = sum(1 for r in results if r[1] is not None)
        not_found = len(results) - found
        
        print("\n2. Mapping Statistics:")
        print("-" * 80)
        print(f"Total test cases: {len(test_cases)}")
        print(f"Found: {found}")
        print(f"Not found: {not_found}")
        print(f"Success rate: {found / len(test_cases) * 100:.1f}%")
        
        # Test batch mapping
        print("\n3. Testing batch mapping:")
        print("-" * 80)
        
        batch_texts = ["kg", "piece", "meter", "gsm", "unknown"]
        batch_results = service.batch_map_texts_to_unit_ids(batch_texts, db)
        
        for text, unit_id in batch_results.items():
            if unit_id:
                print(f"✓ '{text}' -> unit_id={unit_id}")
            else:
                print(f"✗ '{text}' -> NOT FOUND")
        
        # Test statistics method
        print("\n4. Testing statistics method:")
        print("-" * 80)
        
        stats = service.get_mapping_statistics(test_cases, db)
        print(f"Total: {stats['total']}")
        print(f"Mapped: {stats['mapped']}")
        print(f"Unmapped: {stats['unmapped']}")
        print(f"Success rate: {stats['success_rate']:.1f}%")
        print(f"Unmapped texts: {stats['unmapped_texts']}")
        
        # Test normalization
        print("\n5. Testing text normalization:")
        print("-" * 80)
        
        normalization_tests = [
            "  Kg  ",
            "GSM",
            "Piece  ",
            "  meter ",
            "KILOGRAM",
        ]
        
        for text in normalization_tests:
            normalized = service.normalize_unit_text(text)
            standardized = service.get_standardized_term(normalized)
            print(f"'{text}' -> normalized: '{normalized}' -> standardized: '{standardized}'")
        
        print("\n" + "=" * 80)
        print("Test completed successfully!")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()
    
    return True


if __name__ == "__main__":
    success = test_unit_mapping_service()
    sys.exit(0 if success else 1)
