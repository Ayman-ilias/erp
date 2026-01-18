"""
Integration test for SampleRequestCreate schema validators.
This test verifies that the Pydantic validators work correctly in the actual schema.
"""
import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from modules.samples.schemas.sample import SampleRequestCreate


def test_additional_instruction_validator():
    """Test the additional_instruction validator in the actual schema"""
    print("Testing additional_instruction validator in SampleRequestCreate schema...\n")
    
    # Test 1: String to list conversion
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": "○ a"
    }
    sample = SampleRequestCreate(**data)
    assert sample.additional_instruction == ["○ a"], f"Expected ['○ a'], got {sample.additional_instruction}"
    print("✓ String '○ a' converted to list")
    
    # Test 2: Multiline string
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": "Line 1\nLine 2\nLine 3"
    }
    sample = SampleRequestCreate(**data)
    assert sample.additional_instruction == ["Line 1", "Line 2", "Line 3"], f"Expected multiline list, got {sample.additional_instruction}"
    print("✓ Multiline string split into list")
    
    # Test 3: Empty string to None
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": ""
    }
    sample = SampleRequestCreate(**data)
    assert sample.additional_instruction is None, f"Expected None, got {sample.additional_instruction}"
    print("✓ Empty string converted to None")
    
    # Test 4: None remains None
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": None
    }
    sample = SampleRequestCreate(**data)
    assert sample.additional_instruction is None, f"Expected None, got {sample.additional_instruction}"
    print("✓ None remains None")
    
    # Test 5: List passed through
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": ["Instruction 1", "Instruction 2"]
    }
    sample = SampleRequestCreate(**data)
    assert sample.additional_instruction == ["Instruction 1", "Instruction 2"], f"Expected list unchanged, got {sample.additional_instruction}"
    print("✓ List passed through unchanged")
    
    print("\n✅ All integration tests passed!")
    print("The additional_instruction validator is working correctly in the schema.")


def test_ply_validator():
    """Test the ply validator in the actual schema"""
    print("\nTesting ply validator in SampleRequestCreate schema...\n")
    
    # Test 1: Number to string conversion
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": 3
    }
    sample = SampleRequestCreate(**data)
    assert sample.ply == "3", f"Expected '3', got {sample.ply}"
    print("✓ Number 3 converted to string '3'")
    
    # Test 2: String remains string
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": "2"
    }
    sample = SampleRequestCreate(**data)
    assert sample.ply == "2", f"Expected '2', got {sample.ply}"
    print("✓ String '2' remains string")
    
    print("\n✅ Ply validator tests passed!")


def test_decorative_part_validator():
    """Test the decorative_part validator in the actual schema"""
    print("\nTesting decorative_part validator in SampleRequestCreate schema...\n")
    
    # Test 1: String to list conversion
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "decorative_part": "a"
    }
    sample = SampleRequestCreate(**data)
    assert sample.decorative_part == ["a"], f"Expected ['a'], got {sample.decorative_part}"
    print("✓ String 'a' converted to list")
    
    # Test 2: Comma-separated string
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "decorative_part": "Embroidery, Print"
    }
    sample = SampleRequestCreate(**data)
    assert sample.decorative_part == ["Embroidery", "Print"], f"Expected ['Embroidery', 'Print'], got {sample.decorative_part}"
    print("✓ Comma-separated string split into list")
    
    print("\n✅ Decorative_part validator tests passed!")


if __name__ == "__main__":
    try:
        test_additional_instruction_validator()
        test_ply_validator()
        test_decorative_part_validator()
        
        print("\n" + "="*60)
        print("✅ ALL INTEGRATION TESTS PASSED!")
        print("="*60)
        print("\nAll three validators are working correctly:")
        print("  • ply: number → string")
        print("  • decorative_part: string → list (comma-separated)")
        print("  • additional_instruction: string → list (newline-separated)")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
