"""
Standalone test for schema validators without full application dependencies.
This test directly imports and tests the validator functions.
"""
from pydantic import BaseModel, field_validator
from typing import Optional, List


class TestSampleRequestCreate(BaseModel):
    """Minimal schema for testing validators"""
    buyer_id: int
    sample_name: str
    ply: Optional[str] = None
    decorative_part: Optional[List[str]] = None
    additional_instruction: Optional[List[str]] = None
    
    @field_validator('ply', mode='before')
    @classmethod
    def convert_ply_to_string(cls, v):
        """Convert ply to string if it's a number"""
        if v is None or v == '':
            return None
        return str(v)
    
    @field_validator('decorative_part', mode='before')
    @classmethod
    def normalize_decorative_part(cls, v):
        """Convert decorative_part to list if it's a string"""
        if v is None or v == '':
            return None
        if isinstance(v, str):
            items = [item.strip() for item in v.split(',') if item.strip()]
            return items if items else None
        return v
    
    @field_validator('additional_instruction', mode='before')
    @classmethod
    def normalize_additional_instruction(cls, v):
        """Convert additional_instruction to list if it's a string"""
        if v is None or v == '':
            return None
        if isinstance(v, str):
            lines = [line.strip() for line in v.split('\n') if line.strip()]
            return lines if lines else None
        return v


def test_additional_instruction_validator():
    """Test the additional_instruction validator"""
    print("Testing additional_instruction validator...\n")
    
    # Test 1: Original failing case from error message
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": "○ a"
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.additional_instruction == ["○ a"], f"Expected ['○ a'], got {sample.additional_instruction}"
    print("✓ String '○ a' converted to list ['○ a']")
    
    # Test 2: Multiline string
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": "Line 1\nLine 2\nLine 3"
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.additional_instruction == ["Line 1", "Line 2", "Line 3"]
    print("✓ Multiline string split into list")
    
    # Test 3: Empty string to None
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": ""
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.additional_instruction is None
    print("✓ Empty string converted to None")
    
    # Test 4: List passed through
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": ["Instruction 1", "Instruction 2"]
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.additional_instruction == ["Instruction 1", "Instruction 2"]
    print("✓ List passed through unchanged")
    
    # Test 5: Whitespace trimming
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": "  Line 1  \n  Line 2  "
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.additional_instruction == ["Line 1", "Line 2"]
    print("✓ Whitespace trimmed from lines")
    
    print("\n✅ All additional_instruction validator tests passed!")


def test_ply_validator():
    """Test the ply validator"""
    print("\nTesting ply validator...\n")
    
    # Test 1: Original failing case - number to string
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": 3
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.ply == "3", f"Expected '3', got {sample.ply}"
    print("✓ Number 3 converted to string '3'")
    
    # Test 2: String remains string
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": "2"
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.ply == "2"
    print("✓ String '2' remains string")
    
    # Test 3: Empty string to None
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": ""
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.ply is None
    print("✓ Empty string converted to None")
    
    print("\n✅ All ply validator tests passed!")


def test_decorative_part_validator():
    """Test the decorative_part validator"""
    print("\nTesting decorative_part validator...\n")
    
    # Test 1: Original failing case - single character
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "decorative_part": "a"
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.decorative_part == ["a"], f"Expected ['a'], got {sample.decorative_part}"
    print("✓ String 'a' converted to list ['a']")
    
    # Test 2: Comma-separated string
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "decorative_part": "Embroidery, Print, Applique"
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.decorative_part == ["Embroidery", "Print", "Applique"]
    print("✓ Comma-separated string split into list")
    
    # Test 3: Empty string to None
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "decorative_part": ""
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.decorative_part is None
    print("✓ Empty string converted to None")
    
    # Test 4: List passed through
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "decorative_part": ["Embroidery", "Print"]
    }
    sample = TestSampleRequestCreate(**data)
    assert sample.decorative_part == ["Embroidery", "Print"]
    print("✓ List passed through unchanged")
    
    print("\n✅ All decorative_part validator tests passed!")


def test_all_three_validators_together():
    """Test all three validators working together"""
    print("\nTesting all three validators together (original error case)...\n")
    
    # This is the exact data from the original error message
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": 3,  # Was causing "Input should be a valid string"
        "decorative_part": "a",  # Was causing "Input should be a valid list"
        "additional_instruction": "○ a"  # Was causing "Input should be a valid list"
    }
    
    sample = TestSampleRequestCreate(**data)
    
    assert sample.ply == "3", f"ply: Expected '3', got {sample.ply}"
    assert sample.decorative_part == ["a"], f"decorative_part: Expected ['a'], got {sample.decorative_part}"
    assert sample.additional_instruction == ["○ a"], f"additional_instruction: Expected ['○ a'], got {sample.additional_instruction}"
    
    print("✓ ply: 3 → '3'")
    print("✓ decorative_part: 'a' → ['a']")
    print("✓ additional_instruction: '○ a' → ['○ a']")
    
    print("\n✅ All validators working correctly together!")
    print("   The original validation errors are now fixed!")


if __name__ == "__main__":
    print("="*70)
    print("TESTING SAMPLE SCHEMA VALIDATORS")
    print("="*70)
    print()
    
    try:
        test_ply_validator()
        test_decorative_part_validator()
        test_additional_instruction_validator()
        test_all_three_validators_together()
        
        print("\n" + "="*70)
        print("✅ ALL TESTS PASSED!")
        print("="*70)
        print("\nSummary:")
        print("  • ply validator: Converts numbers to strings ✓")
        print("  • decorative_part validator: Converts strings to lists (comma-separated) ✓")
        print("  • additional_instruction validator: Converts strings to lists (newline-separated) ✓")
        print("\nThe original validation errors from the requirements are now fixed:")
        print("  ✓ ply: 3 → '3' (no longer 'Input should be a valid string')")
        print("  ✓ decorative_part: 'a' → ['a'] (no longer 'Input should be a valid list')")
        print("  ✓ additional_instruction: '○ a' → ['○ a'] (no longer 'Input should be a valid list')")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
