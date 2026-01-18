"""
Comprehensive test for all three sample schema validators.
Tests ply, decorative_part, and additional_instruction validators with various input combinations.

This test validates:
1. Each validator individually with edge cases
2. Validators working together in complete schema validation
3. Original failing inputs now work correctly
4. Backward compatibility with existing valid inputs
5. Error handling for invalid inputs
"""
from pydantic import BaseModel, field_validator
from typing import Optional, List, Any
from datetime import datetime


# Standalone schema for testing (mirrors SampleRequestCreate)
class SampleRequestCreate(BaseModel):
    """Standalone schema for testing validators without full app dependencies"""
    buyer_id: int
    buyer_name: Optional[str] = None
    sample_name: str
    style_id: Optional[int] = None
    gauge: Optional[str] = None
    ply: Optional[str] = None
    item: Optional[str] = None
    yarn_id: Optional[str] = None
    yarn_details: Optional[Any] = None
    trims_ids: Optional[List[str]] = None
    trims_details: Optional[Any] = None
    decorative_part: Optional[List[str]] = None
    decorative_details: Optional[str] = None
    yarn_handover_date: Optional[datetime] = None
    trims_handover_date: Optional[datetime] = None
    required_date: Optional[datetime] = None
    request_pcs: Optional[int] = None
    sample_category: Optional[str] = None
    priority: Optional[str] = 'normal'
    color_name: Optional[str] = None
    size_name: Optional[str] = None
    additional_instruction: Optional[List[str]] = None
    techpack_url: Optional[str] = None
    techpack_filename: Optional[str] = None
    round: int = 1
    current_status: str = "Pending"
    sample_id: Optional[str] = None
    
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


# =============================================================================
# TEST 1: PLY VALIDATOR - Individual Tests
# =============================================================================

def test_ply_validator_individual():
    """Test ply validator with various input types"""
    print("\n" + "="*70)
    print("TEST 1: PLY VALIDATOR - Individual Tests")
    print("="*70)
    
    test_cases = [
        # (input_value, expected_output, description)
        (3, "3", "Number to string conversion (original failing case)"),
        (0, "0", "Zero number to string"),
        (100, "100", "Large number to string"),
        ("2", "2", "String remains string"),
        ("", None, "Empty string to None"),
        (None, None, "None remains None"),
    ]
    
    for input_val, expected, description in test_cases:
        data = {
            "buyer_id": 1,
            "sample_name": "Test Sample",
            "ply": input_val
        }
        sample = SampleRequestCreate(**data)
        assert sample.ply == expected, f"Failed: {description}. Expected {expected}, got {sample.ply}"
        print(f"✓ {description}: {input_val} → {expected}")
    
    print("\n✅ All ply validator tests passed!")


# =============================================================================
# TEST 2: DECORATIVE_PART VALIDATOR - Individual Tests
# =============================================================================

def test_decorative_part_validator_individual():
    """Test decorative_part validator with various input types"""
    print("\n" + "="*70)
    print("TEST 2: DECORATIVE_PART VALIDATOR - Individual Tests")
    print("="*70)
    
    test_cases = [
        # (input_value, expected_output, description)
        ("a", ["a"], "Single character string (original failing case)"),
        ("Embroidery", ["Embroidery"], "Single word string"),
        ("Embroidery, Print", ["Embroidery", "Print"], "Comma-separated string"),
        ("Embroidery, Print, Applique", ["Embroidery", "Print", "Applique"], "Multiple comma-separated items"),
        ("  Embroidery  ,  Print  ", ["Embroidery", "Print"], "Comma-separated with whitespace"),
        ("", None, "Empty string to None"),
        (None, None, "None remains None"),
        (["Embroidery"], ["Embroidery"], "Single-item list passed through"),
        (["Embroidery", "Print"], ["Embroidery", "Print"], "Multi-item list passed through"),
        ([], [], "Empty list passed through"),
    ]
    
    for input_val, expected, description in test_cases:
        data = {
            "buyer_id": 1,
            "sample_name": "Test Sample",
            "decorative_part": input_val
        }
        sample = SampleRequestCreate(**data)
        assert sample.decorative_part == expected, f"Failed: {description}. Expected {expected}, got {sample.decorative_part}"
        print(f"✓ {description}: {repr(input_val)} → {expected}")
    
    print("\n✅ All decorative_part validator tests passed!")


# =============================================================================
# TEST 3: ADDITIONAL_INSTRUCTION VALIDATOR - Individual Tests
# =============================================================================

def test_additional_instruction_validator_individual():
    """Test additional_instruction validator with various input types"""
    print("\n" + "="*70)
    print("TEST 3: ADDITIONAL_INSTRUCTION VALIDATOR - Individual Tests")
    print("="*70)
    
    test_cases = [
        # (input_value, expected_output, description)
        ("○ a", ["○ a"], "Bullet point string (original failing case)"),
        ("Single instruction", ["Single instruction"], "Single line string"),
        ("Line 1\nLine 2", ["Line 1", "Line 2"], "Multiline string"),
        ("Line 1\nLine 2\nLine 3", ["Line 1", "Line 2", "Line 3"], "Three-line string"),
        ("  Line 1  \n  Line 2  ", ["Line 1", "Line 2"], "Multiline with whitespace"),
        ("Line 1\n\nLine 2", ["Line 1", "Line 2"], "Multiline with empty lines"),
        ("\n\n\n", None, "Only newlines to None"),
        ("   ", None, "Only whitespace to None"),
        ("", None, "Empty string to None"),
        (None, None, "None remains None"),
        (["Instruction 1"], ["Instruction 1"], "Single-item list passed through"),
        (["Instruction 1", "Instruction 2"], ["Instruction 1", "Instruction 2"], "Multi-item list passed through"),
        ([], [], "Empty list passed through"),
        ("○ Instruction 1\n○ Instruction 2", ["○ Instruction 1", "○ Instruction 2"], "Multiple bullet points"),
    ]
    
    for input_val, expected, description in test_cases:
        data = {
            "buyer_id": 1,
            "sample_name": "Test Sample",
            "additional_instruction": input_val
        }
        sample = SampleRequestCreate(**data)
        assert sample.additional_instruction == expected, f"Failed: {description}. Expected {expected}, got {sample.additional_instruction}"
        print(f"✓ {description}: {repr(input_val)} → {expected}")
    
    print("\n✅ All additional_instruction validator tests passed!")


# =============================================================================
# TEST 4: ALL THREE VALIDATORS TOGETHER - Original Failing Case
# =============================================================================

def test_all_validators_original_failing_case():
    """Test all three validators with the exact data from the original error message"""
    print("\n" + "="*70)
    print("TEST 4: ALL VALIDATORS TOGETHER - Original Failing Case")
    print("="*70)
    
    # This is the exact data that was causing validation errors
    data = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": 3,  # Was: "Input should be a valid string"
        "decorative_part": "a",  # Was: "Input should be a valid list"
        "additional_instruction": "○ a"  # Was: "Input should be a valid list"
    }
    
    sample = SampleRequestCreate(**data)
    
    assert sample.ply == "3", f"ply: Expected '3', got {sample.ply}"
    assert sample.decorative_part == ["a"], f"decorative_part: Expected ['a'], got {sample.decorative_part}"
    assert sample.additional_instruction == ["○ a"], f"additional_instruction: Expected ['○ a'], got {sample.additional_instruction}"
    
    print("✓ ply: 3 → '3' (no longer 'Input should be a valid string')")
    print("✓ decorative_part: 'a' → ['a'] (no longer 'Input should be a valid list')")
    print("✓ additional_instruction: '○ a' → ['○ a'] (no longer 'Input should be a valid list')")
    
    print("\n✅ Original failing case now works correctly!")


# =============================================================================
# TEST 5: BACKWARD COMPATIBILITY - Existing Valid Inputs
# =============================================================================

def test_backward_compatibility():
    """Test that existing valid inputs continue to work"""
    print("\n" + "="*70)
    print("TEST 5: BACKWARD COMPATIBILITY - Existing Valid Inputs")
    print("="*70)
    
    # Test case 1: All fields as strings/lists (old format)
    data1 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": "2",
        "decorative_part": ["Embroidery", "Print"],
        "additional_instruction": ["Use special packaging", "Handle with care"]
    }
    sample1 = SampleRequestCreate(**data1)
    assert sample1.ply == "2"
    assert sample1.decorative_part == ["Embroidery", "Print"]
    assert sample1.additional_instruction == ["Use special packaging", "Handle with care"]
    print("✓ Old format (string ply, list decorative_part, list additional_instruction) works")
    
    # Test case 2: All fields as None
    data2 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": None,
        "decorative_part": None,
        "additional_instruction": None
    }
    sample2 = SampleRequestCreate(**data2)
    assert sample2.ply is None
    assert sample2.decorative_part is None
    assert sample2.additional_instruction is None
    print("✓ All None values work")
    
    # Test case 3: Mixed valid inputs
    data3 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": "3",
        "decorative_part": "Embroidery",
        "additional_instruction": ["Instruction 1", "Instruction 2"]
    }
    sample3 = SampleRequestCreate(**data3)
    assert sample3.ply == "3"
    assert sample3.decorative_part == ["Embroidery"]
    assert sample3.additional_instruction == ["Instruction 1", "Instruction 2"]
    print("✓ Mixed formats work (string ply, string decorative_part, list additional_instruction)")
    
    print("\n✅ All backward compatibility tests passed!")


# =============================================================================
# TEST 6: EDGE CASES AND BOUNDARY CONDITIONS
# =============================================================================

def test_edge_cases():
    """Test edge cases and boundary conditions"""
    print("\n" + "="*70)
    print("TEST 6: EDGE CASES AND BOUNDARY CONDITIONS")
    print("="*70)
    
    # Test case 1: Very large number for ply
    data1 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": 999999
    }
    sample1 = SampleRequestCreate(**data1)
    assert sample1.ply == "999999"
    print("✓ Very large number for ply converts correctly")
    
    # Test case 2: Negative number for ply
    data2 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": -5
    }
    sample2 = SampleRequestCreate(**data2)
    assert sample2.ply == "-5"
    print("✓ Negative number for ply converts correctly")
    
    # Test case 3: Float number for ply
    data3 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "ply": 3.5
    }
    sample3 = SampleRequestCreate(**data3)
    assert sample3.ply == "3.5"
    print("✓ Float number for ply converts correctly")
    
    # Test case 4: String with only commas for decorative_part
    data4 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "decorative_part": ",,,"
    }
    sample4 = SampleRequestCreate(**data4)
    assert sample4.decorative_part is None
    print("✓ String with only commas converts to None")
    
    # Test case 5: Very long string for decorative_part
    data5 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "decorative_part": "Embroidery, Print, Applique, Beading, Sequins, Rhinestones, Patches"
    }
    sample5 = SampleRequestCreate(**data5)
    assert len(sample5.decorative_part) == 7
    print("✓ Very long comma-separated string splits correctly")
    
    # Test case 6: Unicode characters in additional_instruction
    data6 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": "○ Instruction 1\n● Instruction 2\n★ Instruction 3"
    }
    sample6 = SampleRequestCreate(**data6)
    assert sample6.additional_instruction == ["○ Instruction 1", "● Instruction 2", "★ Instruction 3"]
    print("✓ Unicode characters preserved in additional_instruction")
    
    # Test case 7: Empty list for decorative_part
    data7 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "decorative_part": []
    }
    sample7 = SampleRequestCreate(**data7)
    assert sample7.decorative_part == []
    print("✓ Empty list for decorative_part passed through")
    
    # Test case 8: Empty list for additional_instruction
    data8 = {
        "buyer_id": 1,
        "sample_name": "Test Sample",
        "additional_instruction": []
    }
    sample8 = SampleRequestCreate(**data8)
    assert sample8.additional_instruction == []
    print("✓ Empty list for additional_instruction passed through")
    
    print("\n✅ All edge case tests passed!")


# =============================================================================
# TEST 7: COMPLETE SCHEMA VALIDATION
# =============================================================================

def test_complete_schema_validation():
    """Test complete schema with all fields populated"""
    print("\n" + "="*70)
    print("TEST 7: COMPLETE SCHEMA VALIDATION")
    print("="*70)
    
    # Test with a realistic complete sample request
    data = {
        "buyer_id": 1,
        "buyer_name": "ABC Fashion",
        "sample_name": "Summer Collection T-Shirt",
        "style_id": 101,
        "gauge": "28",
        "ply": 2,  # Number input
        "item": "T-Shirt",
        "yarn_id": "YARN-001",
        "decorative_part": "Embroidery, Print",  # String input
        "decorative_details": "Front chest embroidery, back print",
        "request_pcs": 5,
        "sample_category": "Development",
        "priority": "high",
        "color_name": "Navy Blue",
        "size_name": "M",
        "additional_instruction": "Use eco-friendly packaging\nHandle with care\nShip by express",  # Multiline string
        "round": 1,
        "current_status": "Pending"
    }
    
    sample = SampleRequestCreate(**data)
    
    # Verify all fields
    assert sample.buyer_id == 1
    assert sample.buyer_name == "ABC Fashion"
    assert sample.sample_name == "Summer Collection T-Shirt"
    assert sample.style_id == 101
    assert sample.gauge == "28"
    assert sample.ply == "2", f"Expected '2', got {sample.ply}"
    assert sample.item == "T-Shirt"
    assert sample.yarn_id == "YARN-001"
    assert sample.decorative_part == ["Embroidery", "Print"], f"Expected ['Embroidery', 'Print'], got {sample.decorative_part}"
    assert sample.decorative_details == "Front chest embroidery, back print"
    assert sample.request_pcs == 5
    assert sample.sample_category == "Development"
    assert sample.priority == "high"
    assert sample.color_name == "Navy Blue"
    assert sample.size_name == "M"
    assert sample.additional_instruction == ["Use eco-friendly packaging", "Handle with care", "Ship by express"], \
        f"Expected 3-item list, got {sample.additional_instruction}"
    assert sample.round == 1
    assert sample.current_status == "Pending"
    
    print("✓ All fields validated correctly")
    print("✓ ply: 2 (number) → '2' (string)")
    print("✓ decorative_part: 'Embroidery, Print' (string) → ['Embroidery', 'Print'] (list)")
    print("✓ additional_instruction: multiline string → 3-item list")
    
    print("\n✅ Complete schema validation passed!")


# =============================================================================
# TEST 8: MULTIPLE COMBINATIONS
# =============================================================================

def test_multiple_combinations():
    """Test various combinations of all three validators"""
    print("\n" + "="*70)
    print("TEST 8: MULTIPLE COMBINATIONS")
    print("="*70)
    
    combinations = [
        {
            "name": "All numbers/strings",
            "data": {
                "buyer_id": 1,
                "sample_name": "Test",
                "ply": 3,
                "decorative_part": "a",
                "additional_instruction": "b"
            },
            "expected": {
                "ply": "3",
                "decorative_part": ["a"],
                "additional_instruction": ["b"]
            }
        },
        {
            "name": "All lists",
            "data": {
                "buyer_id": 1,
                "sample_name": "Test",
                "ply": "3",
                "decorative_part": ["a", "b"],
                "additional_instruction": ["c", "d"]
            },
            "expected": {
                "ply": "3",
                "decorative_part": ["a", "b"],
                "additional_instruction": ["c", "d"]
            }
        },
        {
            "name": "All None",
            "data": {
                "buyer_id": 1,
                "sample_name": "Test",
                "ply": None,
                "decorative_part": None,
                "additional_instruction": None
            },
            "expected": {
                "ply": None,
                "decorative_part": None,
                "additional_instruction": None
            }
        },
        {
            "name": "All empty strings",
            "data": {
                "buyer_id": 1,
                "sample_name": "Test",
                "ply": "",
                "decorative_part": "",
                "additional_instruction": ""
            },
            "expected": {
                "ply": None,
                "decorative_part": None,
                "additional_instruction": None
            }
        },
        {
            "name": "Mixed types 1",
            "data": {
                "buyer_id": 1,
                "sample_name": "Test",
                "ply": 5,
                "decorative_part": ["Embroidery"],
                "additional_instruction": "Single instruction"
            },
            "expected": {
                "ply": "5",
                "decorative_part": ["Embroidery"],
                "additional_instruction": ["Single instruction"]
            }
        },
        {
            "name": "Mixed types 2",
            "data": {
                "buyer_id": 1,
                "sample_name": "Test",
                "ply": "10",
                "decorative_part": "Print, Applique",
                "additional_instruction": ["Instruction 1", "Instruction 2"]
            },
            "expected": {
                "ply": "10",
                "decorative_part": ["Print", "Applique"],
                "additional_instruction": ["Instruction 1", "Instruction 2"]
            }
        },
    ]
    
    for combo in combinations:
        sample = SampleRequestCreate(**combo["data"])
        assert sample.ply == combo["expected"]["ply"], \
            f"{combo['name']}: ply mismatch. Expected {combo['expected']['ply']}, got {sample.ply}"
        assert sample.decorative_part == combo["expected"]["decorative_part"], \
            f"{combo['name']}: decorative_part mismatch. Expected {combo['expected']['decorative_part']}, got {sample.decorative_part}"
        assert sample.additional_instruction == combo["expected"]["additional_instruction"], \
            f"{combo['name']}: additional_instruction mismatch. Expected {combo['expected']['additional_instruction']}, got {sample.additional_instruction}"
        print(f"✓ {combo['name']}: All validators work correctly")
    
    print("\n✅ All combination tests passed!")


# =============================================================================
# MAIN TEST RUNNER
# =============================================================================

def run_all_tests():
    """Run all comprehensive tests"""
    print("\n" + "="*70)
    print("COMPREHENSIVE VALIDATOR TESTS")
    print("Testing: ply, decorative_part, and additional_instruction validators")
    print("="*70)
    
    try:
        # Run all test suites
        test_ply_validator_individual()
        test_decorative_part_validator_individual()
        test_additional_instruction_validator_individual()
        test_all_validators_original_failing_case()
        test_backward_compatibility()
        test_edge_cases()
        test_complete_schema_validation()
        test_multiple_combinations()
        
        # Summary
        print("\n" + "="*70)
        print("✅ ALL COMPREHENSIVE TESTS PASSED!")
        print("="*70)
        print("\nTest Summary:")
        print("  ✓ Individual validator tests (ply, decorative_part, additional_instruction)")
        print("  ✓ Original failing case now works correctly")
        print("  ✓ Backward compatibility maintained")
        print("  ✓ Edge cases handled properly")
        print("  ✓ Complete schema validation works")
        print("  ✓ Multiple input combinations work")
        print("\nValidator Behavior:")
        print("  • ply: Converts numbers to strings, handles empty strings")
        print("  • decorative_part: Converts strings to lists (comma-separated)")
        print("  • additional_instruction: Converts strings to lists (newline-separated)")
        print("\nOriginal Errors Fixed:")
        print("  ✓ ply: 3 → '3' (no longer 'Input should be a valid string')")
        print("  ✓ decorative_part: 'a' → ['a'] (no longer 'Input should be a valid list')")
        print("  ✓ additional_instruction: '○ a' → ['○ a'] (no longer 'Input should be a valid list')")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
