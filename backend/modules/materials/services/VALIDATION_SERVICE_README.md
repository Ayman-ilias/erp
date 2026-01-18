# Validation Service Documentation

## Overview

The `ValidationService` provides cross-database validation for unit_id references between the materials database (db-samples) and the Unit Conversion System database (db-units). This service is critical for maintaining data integrity when materials reference units across separate PostgreSQL databases.

**Validates Requirements:** 9.5, 13.3

## Architecture

### Multi-Database Context

The Southern Apparels ERP uses a multi-database architecture:
- **db-samples**: Contains MaterialMaster, SampleRequiredMaterial, StyleVariantMaterial
- **db-units**: Contains unit_categories and units tables (Unit Conversion System)

Since these are separate databases, we cannot use foreign key constraints. The ValidationService provides application-layer validation to ensure referential integrity.

### Error Handling

The service implements comprehensive error handling for:
- **Database Connection Failures**: Raises `DatabaseConnectionError`
- **Database Query Errors**: Raises `ValidationError`
- **Invalid Input**: Returns `False` without raising exceptions
- **Session Cleanup**: Ensures database sessions are always closed

## API Reference

### ValidationService.validate_unit_id()

Validates that a unit_id exists and is active in the Unit Conversion System.

**Signature:**
```python
@staticmethod
def validate_unit_id(unit_id: int) -> bool
```

**Parameters:**
- `unit_id` (int): The unit ID to validate

**Returns:**
- `bool`: True if unit exists and is active, False otherwise

**Raises:**
- `DatabaseConnectionError`: If connection to db-units fails
- `ValidationError`: If validation cannot be performed

**Example:**
```python
from modules.materials.services import ValidationService

# Validate a unit_id before saving
if ValidationService.validate_unit_id(material.unit_id):
    # Safe to save
    db.add(material)
    db.commit()
else:
    raise ValueError("Invalid unit_id")
```

**Edge Cases:**
- Returns `False` for unit_id <= 0
- Returns `False` for None
- Returns `False` for inactive units
- Logs warnings for invalid inputs

---

### ValidationService.validate_unit_category()

Validates that a unit belongs to the expected category.

**Signature:**
```python
@staticmethod
def validate_unit_category(unit_id: int, expected_category: str) -> bool
```

**Parameters:**
- `unit_id` (int): The unit ID to validate
- `expected_category` (str): Expected category name (e.g., "Weight", "Length")

**Returns:**
- `bool`: True if unit belongs to expected category, False otherwise

**Raises:**
- `DatabaseConnectionError`: If connection to db-units fails
- `ValidationError`: If validation cannot be performed

**Example:**
```python
# Ensure weight field only accepts weight units
if not ValidationService.validate_unit_category(weight_unit_id, "Weight"):
    raise ValueError("Weight field requires a unit from the Weight category")
```

**Use Cases:**
- Enforce category constraints on specific fields
- Validate weight_unit_id is from "Weight" category
- Validate quantity_unit_id matches material type

**Edge Cases:**
- Returns `False` for invalid unit_id or category name
- Category matching is case-sensitive
- Logs actual category when validation fails

---

### ValidationService.validate_unit_id_with_details()

Validates unit_id and returns unit details if valid.

**Signature:**
```python
@staticmethod
def validate_unit_id_with_details(unit_id: int) -> Tuple[bool, Optional[dict]]
```

**Parameters:**
- `unit_id` (int): The unit ID to validate

**Returns:**
- `Tuple[bool, Optional[dict]]`: (is_valid, unit_details)
  - `is_valid`: True if unit exists and is active
  - `unit_details`: Dict with unit info if valid, None otherwise

**Unit Details Dictionary:**
```python
{
    "id": int,
    "name": str,
    "symbol": str,
    "category_id": int,
    "category_name": str,
    "unit_type": str,  # "SI", "Desi", "International", etc.
    "is_base": bool,
    "decimal_places": int,
    "to_base_factor": float
}
```

**Example:**
```python
is_valid, details = ValidationService.validate_unit_id_with_details(unit_id)

if is_valid:
    print(f"Unit: {details['name']} ({details['symbol']})")
    print(f"Category: {details['category_name']}")
    print(f"Type: {details['unit_type']}")
else:
    print("Invalid unit_id")
```

**Use Cases:**
- Validate and retrieve unit info in one call
- Display unit details in API responses
- Populate unit information for frontend

---

### ValidationService.validate_multiple_unit_ids()

Validates multiple unit_ids in a single database query for efficiency.

**Signature:**
```python
@staticmethod
def validate_multiple_unit_ids(unit_ids: list[int]) -> dict[int, bool]
```

**Parameters:**
- `unit_ids` (list[int]): List of unit IDs to validate

**Returns:**
- `dict[int, bool]`: Dictionary mapping unit_id to validation result

**Example:**
```python
# Validate all materials in a batch
material_unit_ids = [m.unit_id for m in materials]
results = ValidationService.validate_multiple_unit_ids(material_unit_ids)

invalid_materials = [
    m for m in materials 
    if not results.get(m.unit_id, False)
]

if invalid_materials:
    raise ValueError(f"Found {len(invalid_materials)} materials with invalid units")
```

**Performance:**
- Single database query for all unit_ids
- Efficient for batch operations
- Reduces connection overhead

**Use Cases:**
- Validate materials list before bulk operations
- Check all units in a sample request
- Audit existing data for invalid references

---

## Exception Classes

### ValidationError

Raised when validation cannot be performed due to database errors or unexpected issues.

**Example:**
```python
try:
    ValidationService.validate_unit_id(unit_id)
except ValidationError as e:
    logger.error(f"Validation failed: {e}")
    # Handle gracefully
```

### DatabaseConnectionError

Raised when connection to db-units database fails.

**Example:**
```python
try:
    ValidationService.validate_unit_id(unit_id)
except DatabaseConnectionError as e:
    logger.error(f"Database connection failed: {e}")
    # Retry or fail gracefully
```

---

## Usage Patterns

### Pattern 1: API Route Validation

```python
from fastapi import APIRouter, HTTPException, Depends
from modules.materials.services import ValidationService, DatabaseConnectionError

@router.post("/materials")
async def create_material(material: MaterialCreate):
    try:
        # Validate unit_id before creating
        if not ValidationService.validate_unit_id(material.unit_id):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid unit_id: {material.unit_id}"
            )
        
        # Create material
        db_material = MaterialMaster(**material.dict())
        db.add(db_material)
        db.commit()
        
        return db_material
        
    except DatabaseConnectionError as e:
        raise HTTPException(
            status_code=503,
            detail="Unit Conversion System unavailable"
        )
```

### Pattern 2: Service Layer Validation

```python
class MaterialService:
    def create_material(self, material_data: dict) -> MaterialMaster:
        # Validate unit_id
        is_valid, unit_details = ValidationService.validate_unit_id_with_details(
            material_data['unit_id']
        )
        
        if not is_valid:
            raise ValueError(f"Invalid unit_id: {material_data['unit_id']}")
        
        # Create material with unit info
        material = MaterialMaster(**material_data)
        material.unit_name = unit_details['name']  # Cache for display
        material.unit_symbol = unit_details['symbol']
        
        return material
```

### Pattern 3: Batch Validation

```python
def validate_sample_materials(materials: list[SampleRequiredMaterial]) -> list[str]:
    """Validate all materials and return list of errors"""
    errors = []
    
    # Batch validate all unit_ids
    unit_ids = [m.unit_id for m in materials]
    results = ValidationService.validate_multiple_unit_ids(unit_ids)
    
    # Check results
    for material in materials:
        if not results.get(material.unit_id, False):
            errors.append(
                f"Material '{material.product_name}' has invalid unit_id: {material.unit_id}"
            )
    
    return errors
```

### Pattern 4: Category-Specific Validation

```python
def validate_style_variant_material(material: StyleVariantMaterial) -> None:
    """Validate both quantity and weight units"""
    
    # Validate quantity unit exists
    if not ValidationService.validate_unit_id(material.unit_id):
        raise ValueError(f"Invalid quantity unit_id: {material.unit_id}")
    
    # Validate weight unit is from Weight category
    if material.weight_unit_id:
        if not ValidationService.validate_unit_category(
            material.weight_unit_id, 
            "Weight"
        ):
            raise ValueError(
                f"Weight unit_id {material.weight_unit_id} must be from Weight category"
            )
```

---

## Testing

### Unit Tests

Unit tests are provided in `test_validation_service.py` using pytest and mocks:

```bash
# Run unit tests (requires pytest)
pytest backend/modules/materials/services/test_validation_service.py -v
```

### Integration Tests

Manual integration tests are provided in `test_validation_manual.py`:

```bash
# Run integration tests (requires database connection)
cd backend
python modules/materials/services/test_validation_manual.py
```

**Prerequisites for integration tests:**
1. Database connection configured in `.env`
2. Unit Conversion System seeded with data
3. At least one unit in the "Weight" category

---

## Logging

The service uses Python's logging module with the following levels:

- **DEBUG**: Successful validations with details
- **WARNING**: Invalid inputs, inactive units, category mismatches
- **ERROR**: Database errors, connection failures, unexpected errors

**Example log output:**
```
DEBUG: Unit validation successful: unit_id=1, name=Kilogram
WARNING: Unit validation failed: unit_id=99999 not found or inactive
ERROR: Database connection error while validating unit_id=1: Connection refused
```

---

## Performance Considerations

### Connection Management

- Each validation opens and closes a database connection
- Use `validate_multiple_unit_ids()` for batch operations
- Consider caching validation results for frequently accessed units

### Query Optimization

- All queries use indexed columns (id, is_active)
- Category validation uses JOIN for efficiency
- Batch validation uses IN clause for multiple IDs

### Recommendations

1. **Cache validation results** for static data (units rarely change)
2. **Use batch validation** when validating multiple materials
3. **Validate once** at API entry point, not in multiple layers
4. **Handle errors gracefully** to avoid blocking operations

---

## Migration Support

The ValidationService is designed to support the migration from plain text units to unit_id references:

```python
# Migration script example
from modules.materials.services import ValidationService

def migrate_material_units():
    materials = db.query(MaterialMaster).all()
    
    for material in materials:
        # Map plain text to unit_id
        unit_id = map_text_to_unit_id(material.uom)
        
        # Validate before updating
        if ValidationService.validate_unit_id(unit_id):
            material.unit_id = unit_id
        else:
            logger.error(f"Cannot migrate material {material.id}: invalid unit_id {unit_id}")
    
    db.commit()
```

---

## Future Enhancements

Potential improvements for future versions:

1. **Caching Layer**: Add Redis caching for validation results
2. **Bulk Operations**: Add bulk validation with detailed error reporting
3. **Async Support**: Add async versions of validation methods
4. **Validation Rules**: Add configurable validation rules per material type
5. **Audit Logging**: Track all validation failures for compliance

---

## Related Documentation

- [Unit Conversion Integration Design](../../../.kiro/specs/unit-conversion-integration/design.md)
- [Unit Conversion Integration Requirements](../../../.kiro/specs/unit-conversion-integration/requirements.md)
- [Unit Mapping Service](./unit_mapping_service.py)
- [Database Architecture](../../../backend/core/database.py)

---

## Support

For issues or questions:
1. Check logs for detailed error messages
2. Verify database connection to db-units
3. Ensure Unit Conversion System is seeded
4. Review integration tests for usage examples

---

**Last Updated:** 2024
**Validates Requirements:** 9.5, 13.3
