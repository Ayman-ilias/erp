from core.database import SessionLocalUnits
from modules.units.models.unit import Unit, UnitCategory

db = SessionLocalUnits()

# Get all categories
categories = db.query(UnitCategory).all()
print(f"\n✅ Total Categories: {len(categories)}")
print("\nCategories:")
for cat in categories:
    unit_count = db.query(Unit).filter(Unit.category_id == cat.id).count()
    print(f"  - {cat.name} ({cat.base_unit_symbol}): {unit_count} units")

# Get all units
units = db.query(Unit).all()
print(f"\n✅ Total Units: {len(units)}")

# Show some Desi units
print("\n🇧🇩 Desi Units:")
desi_units = db.query(Unit).filter(Unit.unit_type == "Desi").all()
for unit in desi_units[:10]:
    print(f"  - {unit.name} ({unit.symbol}): {unit.to_base_factor} {unit.category.base_unit_symbol}")

# Show some textile units
print("\n🧵 Textile Units:")
textile_cats = db.query(UnitCategory).filter(UnitCategory.name.like("%Textile%")).all()
for cat in textile_cats:
    units_in_cat = db.query(Unit).filter(Unit.category_id == cat.id).all()
    print(f"\n  {cat.name}:")
    for unit in units_in_cat:
        print(f"    - {unit.name} ({unit.symbol})")

db.close()
print("\n✅ Unit Conversion System is ready!")
