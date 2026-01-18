# Migration Guide: Legacy UoM Tables to Unit Conversion System

## Overview

This guide helps developers migrate from the legacy UoM tables (`uom_category` and `uom` in the settings database) to the new Unit Conversion System in the `db-units` database.

## ⚠️ Deprecation Notice

The legacy UoM tables are **DEPRECATED** and will be removed in a future version:

- `UoMCategory` model and `uom_category` table
- `UoM` model and `uom` table
- All related API endpoints in `/api/v1/settings/uom*`

## Why Migrate?

The new Unit Conversion System provides:

- **35 categories** with **288 units** (vs limited legacy units)
- **Desi units**: Tola, Seer, Maund, Bigha variants, Lakh, Crore
- **Textile units**: GSM, Denier, Tex, Momme, Ounce per square yard
- **International units**: kg, meter, piece, liter, and all SI units
- **Better performance**: Optimized database structure and caching
- **Standardized conversion factors**: Mathematically accurate conversions
- **Type safety**: Proper unit type classification (SI, Desi, Textile)

## Migration Steps

### 1. Update Database References

**Before (Legacy):**
```python
# Legacy model with text-based units
class MaterialMaster(Base):
    uom = Column(String(50))  # Plain text like "kg", "meter"
```

**After (New System):**
```python
# New model with unit_id reference
class MaterialMaster(Base):
    unit_id = Column(Integer)  # References db-units.uom_units.id
```

### 2. Update API Calls

**Before (Legacy):**
```python
# Legacy API endpoints
GET /api/v1/settings/uom-categories
GET /api/v1/settings/uom
POST /api/v1/settings/uom/convert
```

**After (New System):**
```python
# New Unit Conversion System endpoints
GET /api/v1/settings/uom-categories  # New system in db-units
GET /api/v1/settings/uom-units       # New system in db-units
POST /api/v1/settings/uom/convert    # Enhanced conversion system
```

### 3. Update Frontend Components

**Before (Legacy):**
```tsx
// Legacy text input
<input 
  type="text" 
  value={material.uom}
  onChange={(e) => setMaterial({...material, uom: e.target.value})}
/>
```

**After (New System):**
```tsx
// New UnitSelector component
import { UnitSelector } from '@/components/uom/UnitSelector';

<UnitSelector
  value={material.unit_id}
  onChange={(unitId) => setMaterial({...material, unit_id: unitId})}
  categoryFilter="Weight"  // Optional category filtering
/>
```

### 4. Update Data Queries

**Before (Legacy):**
```python
# Legacy query with text matching
materials = db.query(MaterialMaster).filter(
    MaterialMaster.uom.ilike("%kg%")
).all()
```

**After (New System):**
```python
# New query with proper joins
from core.database import get_db_units

materials = db.query(MaterialMaster).all()
# Resolve units using material service
materials_with_units = material_service.get_materials_with_units(materials)
```

### 5. Update Form Validation

**Before (Legacy):**
```python
# Legacy validation - text-based
def validate_uom(uom_text: str):
    if not uom_text or len(uom_text.strip()) == 0:
        raise ValueError("UoM is required")
```

**After (New System):**
```python
# New validation - ID-based with proper unit checking
from modules.units.services.validation_service import validate_unit_id

def validate_unit(unit_id: int):
    if not validate_unit_id(unit_id):
        raise ValueError("Invalid unit selected")
```

## Code Examples

### Backend Service Migration

**Before (Legacy):**
```python
class MaterialService:
    def create_material(self, data: MaterialCreate, db: Session):
        # Legacy: Store plain text
        material = MaterialMaster(
            name=data.name,
            uom=data.uom  # Plain text like "kg"
        )
        db.add(material)
        db.commit()
        return material
```

**After (New System):**
```python
class MaterialService:
    def create_material(self, data: MaterialCreate, db: Session):
        # New: Validate unit_id and store reference
        if not validate_unit_id(data.unit_id):
            raise HTTPException(400, "Invalid unit selected")
        
        material = MaterialMaster(
            name=data.name,
            unit_id=data.unit_id  # Integer reference to db-units
        )
        db.add(material)
        db.commit()
        return material
    
    def get_material_with_unit(self, material_id: int, db: Session):
        # New: Resolve unit details from db-units
        material = db.query(MaterialMaster).filter(
            MaterialMaster.id == material_id
        ).first()
        
        if material and material.unit_id:
            unit_details = get_unit_details(material.unit_id)
            return MaterialWithUnit(
                **material.__dict__,
                unit=unit_details
            )
        return material
```

### Frontend Hook Migration

**Before (Legacy):**
```tsx
// Legacy: Manual unit management
const [units, setUnits] = useState<string[]>([]);

useEffect(() => {
  // Fetch legacy units
  fetch('/api/v1/settings/uom')
    .then(res => res.json())
    .then(data => setUnits(data.map(u => u.symbol)));
}, []);
```

**After (New System):**
```tsx
// New: Use optimized hooks
import { useUnits } from '@/hooks/useUnits';

const { data: units, isLoading, error } = useUnits({
  categoryFilter: 'Weight'  // Optional filtering
});

// Units are cached and automatically refreshed
```

## Database Schema Changes

### Legacy Schema (DEPRECATED)
```sql
-- Legacy tables in db-settings
CREATE TABLE uom_category (
    id SERIAL PRIMARY KEY,
    uom_category VARCHAR(100) UNIQUE NOT NULL,
    -- ... other fields
);

CREATE TABLE uom (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES uom_category(id),
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    -- ... other fields
);
```

### New Schema (RECOMMENDED)
```sql
-- New tables in db-units
CREATE TABLE uom_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit_type VARCHAR(20) NOT NULL,  -- 'SI', 'Desi', 'Textile'
    -- ... enhanced fields
);

CREATE TABLE uom_units (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES uom_categories(id),
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    conversion_factor DECIMAL(18,8) NOT NULL,
    unit_type VARCHAR(20) NOT NULL,
    -- ... enhanced fields with better precision
);
```

## Migration Checklist

### Backend Migration
- [ ] Update model definitions to use `unit_id` instead of `uom` text fields
- [ ] Replace legacy UoM API calls with Unit Conversion System calls
- [ ] Update validation logic to use `validate_unit_id()`
- [ ] Implement cross-database unit resolution in services
- [ ] Add proper error handling for db-units connection failures

### Frontend Migration
- [ ] Replace text inputs with `UnitSelector` components
- [ ] Update forms to submit `unit_id` instead of text
- [ ] Use `useUnits()` hook for unit data fetching
- [ ] Implement `InlineConverter` for unit conversions
- [ ] Update display components to use `UnitDisplay`

### Testing Migration
- [ ] Update unit tests to use new unit system
- [ ] Add property-based tests for unit conversions
- [ ] Test cross-database functionality
- [ ] Verify performance with large datasets

### Data Migration
- [ ] Run migration script to map existing text units to unit_id
- [ ] Verify all records have valid unit_id values
- [ ] Review unmapped units log and handle manually
- [ ] Test rollback procedures

## Common Pitfalls

### 1. Cross-Database References
**Problem**: Trying to use foreign key constraints across databases
```python
# DON'T DO THIS - Won't work across databases
unit_id = Column(Integer, ForeignKey("db_units.uom_units.id"))
```

**Solution**: Use integer references with application-level validation
```python
# DO THIS - Integer reference with validation
unit_id = Column(Integer, nullable=False)

# Validate in application layer
if not validate_unit_id(unit_id):
    raise ValueError("Invalid unit")
```

### 2. N+1 Query Problems
**Problem**: Loading units individually for each material
```python
# DON'T DO THIS - Causes N+1 queries
for material in materials:
    unit = get_unit_details(material.unit_id)  # Separate query each time
```

**Solution**: Use batch resolution
```python
# DO THIS - Batch load units
materials_with_units = material_service.get_materials_with_units(materials)
```

### 3. Caching Issues
**Problem**: Not leveraging the caching system
```python
# DON'T DO THIS - Bypasses cache
units = fetch('/api/v1/settings/uom-units').then(res => res.json())
```

**Solution**: Use React Query hooks
```tsx
// DO THIS - Automatic caching
const { data: units } = useUnits();
```

## Support and Resources

### Documentation
- [Unit Conversion System API Reference](./unit-conversion-api.md)
- [Frontend Components Guide](./frontend-components.md)
- [Property-Based Testing Guide](./property-testing.md)

### Code Examples
- [Material Master Integration Example](../examples/material-master-integration.md)
- [Sample Materials Integration Example](../examples/sample-materials-integration.md)
- [Style Variant Materials Integration Example](../examples/style-variant-materials-integration.md)

### Getting Help
- Check deprecation logs for specific migration issues
- Review property-based test failures for conversion problems
- Use the Unit Conversion System's validation endpoints for debugging

## Timeline

### Phase 1: Preparation (Current)
- ✅ Unit Conversion System implemented
- ✅ Migration scripts created
- ✅ Deprecation warnings added
- ✅ Documentation completed

### Phase 2: Migration Period (Next 3 months)
- Gradual migration of components
- Parallel operation of both systems
- Monitoring and performance optimization
- Developer training and support

### Phase 3: Legacy Removal (After 6 months)
- Remove legacy UoM endpoints
- Drop legacy UoM tables
- Clean up deprecated code
- Final performance optimization

## Conclusion

The Unit Conversion System provides a robust, scalable solution for unit management in the Southern Apparels ERP. While migration requires effort, the benefits in terms of functionality, performance, and maintainability make it worthwhile.

For questions or support during migration, please refer to the deprecation logs and contact the development team.