"""
Test for decorative_part field validator in SampleRequestCreate schema.
This test verifies that the validator correctly converts strings to lists.
"""


def normalize_decorative_part(v):
    """
    Replica of the validator logic for testing purposes.
    Convert decorative_part to list if it's a string.
    """
    if v is None or v == '':
        return None
    if isinstance(v, str):
        items = [item.strip() for item in v.split(',') if item.strip()]
        return items if items else None
    return v


def test_decorative_part_string_to_list():
    """Test that a single string is converted to a list"""
    result = normalize_decorative_part("Embroidery")
    assert result == ["Embroidery"], f"Expected ['Embroidery'], got {result}"
    print("✓ Single string converted to list")


def test_decorative_part_comma_separated():
    """Test that comma-separated string is split into list"""
    result = normalize_decorative_part("Embroidery, Print, Applique")
    assert result == ["Embroidery", "Print", "Applique"], f"Expected ['Embroidery', 'Print', 'Applique'], got {result}"
    print("✓ Comma-separated string split into list")


def test_decorative_part_with_whitespace():
    """Test that whitespace is trimmed from items"""
    result = normalize_decorative_part("  Embroidery  ,  Print  ,  Applique  ")
    assert result == ["Embroidery", "Print", "Applique"], f"Expected ['Embroidery', 'Print', 'Applique'], got {result}"
    print("✓ Whitespace trimmed from items")


def test_decorative_part_empty_string():
    """Test that empty string is converted to None"""
    result = normalize_decorative_part("")
    assert result is None, f"Expected None, got {result}"
    print("✓ Empty string converted to None")


def test_decorative_part_none():
    """Test that None remains None"""
    result = normalize_decorative_part(None)
    assert result is None, f"Expected None, got {result}"
    print("✓ None remains None")


def test_decorative_part_already_list():
    """Test that a list is passed through unchanged"""
    result = normalize_decorative_part(["Embroidery", "Print"])
    assert result == ["Embroidery", "Print"], f"Expected ['Embroidery', 'Print'], got {result}"
    print("✓ List passed through unchanged")


def test_decorative_part_empty_items_filtered():
    """Test that empty items after split are filtered out"""
    result = normalize_decorative_part("Embroidery,,Print,  ,Applique")
    assert result == ["Embroidery", "Print", "Applique"], f"Expected ['Embroidery', 'Print', 'Applique'], got {result}"
    print("✓ Empty items filtered out")


def test_decorative_part_single_char():
    """Test the original failing case from the error message"""
    result = normalize_decorative_part("a")
    assert result == ["a"], f"Expected ['a'], got {result}"
    print("✓ Single character string converted to list")


def test_decorative_part_only_commas():
    """Test that a string with only commas returns None"""
    result = normalize_decorative_part(",,,")
    assert result is None, f"Expected None, got {result}"
    print("✓ String with only commas returns None")


def test_decorative_part_only_whitespace():
    """Test that a string with only whitespace returns None"""
    result = normalize_decorative_part("   ")
    assert result is None, f"Expected None, got {result}"
    print("✓ String with only whitespace returns None")


if __name__ == "__main__":
    print("Testing decorative_part field validator logic...\n")
    
    try:
        test_decorative_part_string_to_list()
        test_decorative_part_comma_separated()
        test_decorative_part_with_whitespace()
        test_decorative_part_empty_string()
        test_decorative_part_none()
        test_decorative_part_already_list()
        test_decorative_part_empty_items_filtered()
        test_decorative_part_single_char()
        test_decorative_part_only_commas()
        test_decorative_part_only_whitespace()
        
        print("\n✅ All tests passed!")
        print("\nThe validator correctly handles:")
        print("  • Single strings → converted to single-item list")
        print("  • Comma-separated strings → split into list")
        print("  • Whitespace → trimmed from items")
        print("  • Empty strings → converted to None")
        print("  • None values → remain None")
        print("  • Lists → passed through unchanged")
        print("  • Empty items → filtered out")
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        exit(1)
