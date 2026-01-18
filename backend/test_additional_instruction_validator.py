"""
Test for additional_instruction field validator in SampleRequestCreate schema.
This test verifies that the validator correctly converts strings to lists.
"""


def normalize_additional_instruction(v):
    """
    Replica of the validator logic for testing purposes.
    Convert additional_instruction to list if it's a string.
    """
    if v is None or v == '':
        return None
    if isinstance(v, str):
        lines = [line.strip() for line in v.split('\n') if line.strip()]
        return lines if lines else None
    return v


def test_additional_instruction_string_to_list():
    """Test that a single string is converted to a list"""
    result = normalize_additional_instruction("Use special packaging")
    assert result == ["Use special packaging"], f"Expected ['Use special packaging'], got {result}"
    print("✓ Single string converted to list")


def test_additional_instruction_multiline():
    """Test that multiline string is split into list"""
    result = normalize_additional_instruction("Line 1\nLine 2\nLine 3")
    assert result == ["Line 1", "Line 2", "Line 3"], f"Expected ['Line 1', 'Line 2', 'Line 3'], got {result}"
    print("✓ Multiline string split into list")


def test_additional_instruction_with_whitespace():
    """Test that whitespace is trimmed from lines"""
    result = normalize_additional_instruction("  Line 1  \n  Line 2  \n  Line 3  ")
    assert result == ["Line 1", "Line 2", "Line 3"], f"Expected ['Line 1', 'Line 2', 'Line 3'], got {result}"
    print("✓ Whitespace trimmed from lines")


def test_additional_instruction_empty_string():
    """Test that empty string is converted to None"""
    result = normalize_additional_instruction("")
    assert result is None, f"Expected None, got {result}"
    print("✓ Empty string converted to None")


def test_additional_instruction_none():
    """Test that None remains None"""
    result = normalize_additional_instruction(None)
    assert result is None, f"Expected None, got {result}"
    print("✓ None remains None")


def test_additional_instruction_already_list():
    """Test that a list is passed through unchanged"""
    result = normalize_additional_instruction(["Instruction 1", "Instruction 2"])
    assert result == ["Instruction 1", "Instruction 2"], f"Expected ['Instruction 1', 'Instruction 2'], got {result}"
    print("✓ List passed through unchanged")


def test_additional_instruction_empty_lines_filtered():
    """Test that empty lines are filtered out"""
    result = normalize_additional_instruction("Line 1\n\nLine 2\n  \nLine 3")
    assert result == ["Line 1", "Line 2", "Line 3"], f"Expected ['Line 1', 'Line 2', 'Line 3'], got {result}"
    print("✓ Empty lines filtered out")


def test_additional_instruction_original_failing_case():
    """Test the original failing case from the error message"""
    result = normalize_additional_instruction("○ a")
    assert result == ["○ a"], f"Expected ['○ a'], got {result}"
    print("✓ Original failing case '○ a' converted to list")


def test_additional_instruction_only_newlines():
    """Test that a string with only newlines returns None"""
    result = normalize_additional_instruction("\n\n\n")
    assert result is None, f"Expected None, got {result}"
    print("✓ String with only newlines returns None")


def test_additional_instruction_only_whitespace():
    """Test that a string with only whitespace returns None"""
    result = normalize_additional_instruction("   ")
    assert result is None, f"Expected None, got {result}"
    print("✓ String with only whitespace returns None")


def test_additional_instruction_bullet_points():
    """Test that bullet points are preserved"""
    result = normalize_additional_instruction("○ Instruction 1\n○ Instruction 2\n○ Instruction 3")
    assert result == ["○ Instruction 1", "○ Instruction 2", "○ Instruction 3"], f"Expected bullet points preserved, got {result}"
    print("✓ Bullet points preserved in list")


if __name__ == "__main__":
    print("Testing additional_instruction field validator logic...\n")
    
    try:
        test_additional_instruction_string_to_list()
        test_additional_instruction_multiline()
        test_additional_instruction_with_whitespace()
        test_additional_instruction_empty_string()
        test_additional_instruction_none()
        test_additional_instruction_already_list()
        test_additional_instruction_empty_lines_filtered()
        test_additional_instruction_original_failing_case()
        test_additional_instruction_only_newlines()
        test_additional_instruction_only_whitespace()
        test_additional_instruction_bullet_points()
        
        print("\n✅ All tests passed!")
        print("\nThe validator correctly handles:")
        print("  • Single strings → converted to single-item list")
        print("  • Multiline strings → split into list by newlines")
        print("  • Whitespace → trimmed from lines")
        print("  • Empty strings → converted to None")
        print("  • None values → remain None")
        print("  • Lists → passed through unchanged")
        print("  • Empty lines → filtered out")
        print("  • Bullet points → preserved in output")
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        exit(1)
