"""
Seed script for standard UoM units with conversion factors
Creates comprehensive unit of measurement data for:
- Length, Weight, Volume, Area, Time, Quantity
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from core.database import SessionLocalSettings, engines, DatabaseType
from modules.settings.models.master_data import UoMCategory, UoM
from decimal import Decimal


def seed_uom_categories(db: Session):
    """Create UoM categories"""
    categories = [
        {
            "uom_category": "Length",
            "uom_id": "LENGTH",
            "uom_name": "Length",
            "uom_description": "Linear measurement units",
            "icon": "ruler",
            "industry_use": "Fabric measurement, trim length",
            "sort_order": 1
        },
        {
            "uom_category": "Weight",
            "uom_id": "WEIGHT",
            "uom_name": "Weight",
            "uom_description": "Mass measurement units",
            "icon": "weight",
            "industry_use": "Yarn weight, fabric GSM",
            "sort_order": 2
        },
        {
            "uom_category": "Volume",
            "uom_id": "VOLUME",
            "uom_name": "Volume",
            "uom_description": "Volumetric measurement units",
            "icon": "box",
            "industry_use": "Liquid chemicals, dyes",
            "sort_order": 3
        },
        {
            "uom_category": "Area",
            "uom_id": "AREA",
            "uom_name": "Area",
            "uom_description": "Surface area measurement units",
            "icon": "square",
            "industry_use": "Fabric area, cutting room",
            "sort_order": 4
        },
        {
            "uom_category": "Time",
            "uom_id": "TIME",
            "uom_name": "Time",
            "uom_description": "Time duration units",
            "icon": "clock",
            "industry_use": "Production time, lead time",
            "sort_order": 5
        },
        {
            "uom_category": "Quantity",
            "uom_id": "QUANTITY",
            "uom_name": "Quantity",
            "uom_description": "Counting units",
            "icon": "hash",
            "industry_use": "Garment pieces, accessories",
            "sort_order": 6
        }
    ]
    
    for cat_data in categories:
        existing = db.query(UoMCategory).filter(
            UoMCategory.uom_category == cat_data["uom_category"]
        ).first()
        if not existing:
            category = UoMCategory(**cat_data)
            db.add(category)
    
    db.commit()
    print("✓ UoM categories seeded")


def seed_length_units(db: Session):
    """Seed length units - base unit: meter (m)"""
    category = db.query(UoMCategory).filter(UoMCategory.uom_id == "LENGTH").first()
    if not category:
        return
    
    units = [
        # Metric
        {"name": "Millimeter", "symbol": "mm", "factor": Decimal("0.001"), "is_base": False, "is_si_unit": True, "display_name": "Millimeter (mm)", "common_usage": "Small measurements", "decimal_places": 2, "sort_order": 1},
        {"name": "Centimeter", "symbol": "cm", "factor": Decimal("0.01"), "is_base": False, "is_si_unit": True, "display_name": "Centimeter (cm)", "common_usage": "Fabric width, trim", "decimal_places": 2, "sort_order": 2},
        {"name": "Meter", "symbol": "m", "factor": Decimal("1.0"), "is_base": True, "is_si_unit": True, "display_name": "Meter (m)", "common_usage": "Fabric length, rolls", "decimal_places": 2, "sort_order": 3},
        {"name": "Kilometer", "symbol": "km", "factor": Decimal("1000.0"), "is_base": False, "is_si_unit": True, "display_name": "Kilometer (km)", "common_usage": "Long distances", "decimal_places": 2, "sort_order": 4},
        # Imperial
        {"name": "Inch", "symbol": "in", "factor": Decimal("0.0254"), "is_base": False, "is_si_unit": False, "display_name": "Inch (in)", "common_usage": "US measurements", "decimal_places": 2, "sort_order": 5},
        {"name": "Foot", "symbol": "ft", "factor": Decimal("0.3048"), "is_base": False, "is_si_unit": False, "display_name": "Foot (ft)", "common_usage": "US measurements", "decimal_places": 2, "sort_order": 6},
        {"name": "Yard", "symbol": "yd", "factor": Decimal("0.9144"), "is_base": False, "is_si_unit": False, "display_name": "Yard (yd)", "common_usage": "Fabric rolls (US)", "decimal_places": 2, "sort_order": 7},
        {"name": "Mile", "symbol": "mi", "factor": Decimal("1609.344"), "is_base": False, "is_si_unit": False, "display_name": "Mile (mi)", "common_usage": "Long distances", "decimal_places": 2, "sort_order": 8},
    ]
    
    for unit_data in units:
        existing = db.query(UoM).filter(
            UoM.category_id == category.id,
            UoM.symbol == unit_data["symbol"]
        ).first()
        if not existing:
            unit = UoM(category_id=category.id, **unit_data)
            db.add(unit)
    
    db.commit()
    print("✓ Length units seeded")


def seed_weight_units(db: Session):
    """Seed weight units - base unit: gram (g)"""
    category = db.query(UoMCategory).filter(UoMCategory.uom_id == "WEIGHT").first()
    if not category:
        return
    
    units = [
        # Metric
        {"name": "Milligram", "symbol": "mg", "factor": Decimal("0.001"), "is_base": False, "is_si_unit": True, "display_name": "Milligram (mg)", "common_usage": "Chemical additives", "decimal_places": 3, "sort_order": 1},
        {"name": "Gram", "symbol": "g", "factor": Decimal("1.0"), "is_base": True, "is_si_unit": True, "display_name": "Gram (g)", "common_usage": "Fabric GSM, yarn", "decimal_places": 2, "sort_order": 2},
        {"name": "Kilogram", "symbol": "kg", "factor": Decimal("1000.0"), "is_base": False, "is_si_unit": True, "display_name": "Kilogram (kg)", "common_usage": "Fabric rolls, yarn cones", "decimal_places": 2, "sort_order": 3},
        {"name": "Metric Ton", "symbol": "ton", "factor": Decimal("1000000.0"), "is_base": False, "is_si_unit": True, "display_name": "Metric Ton (ton)", "common_usage": "Bulk orders", "decimal_places": 2, "sort_order": 4},
        # Imperial
        {"name": "Ounce", "symbol": "oz", "factor": Decimal("28.349523125"), "is_base": False, "is_si_unit": False, "display_name": "Ounce (oz)", "common_usage": "US fabric weight", "decimal_places": 2, "sort_order": 5},
        {"name": "Pound", "symbol": "lb", "factor": Decimal("453.59237"), "is_base": False, "is_si_unit": False, "display_name": "Pound (lb)", "common_usage": "US measurements", "decimal_places": 2, "sort_order": 6},
    ]
    
    for unit_data in units:
        existing = db.query(UoM).filter(
            UoM.category_id == category.id,
            UoM.symbol == unit_data["symbol"]
        ).first()
        if not existing:
            unit = UoM(category_id=category.id, **unit_data)
            db.add(unit)
    
    db.commit()
    print("✓ Weight units seeded")


def seed_volume_units(db: Session):
    """Seed volume units - base unit: liter (l)"""
    category = db.query(UoMCategory).filter(UoMCategory.uom_id == "VOLUME").first()
    if not category:
        return
    
    units = [
        # Metric
        {"name": "Milliliter", "symbol": "ml", "factor": Decimal("0.001"), "is_base": False, "is_si_unit": True, "display_name": "Milliliter (ml)", "common_usage": "Dyes, chemicals", "decimal_places": 2, "sort_order": 1},
        {"name": "Liter", "symbol": "l", "factor": Decimal("1.0"), "is_base": True, "is_si_unit": True, "display_name": "Liter (l)", "common_usage": "Liquid chemicals", "decimal_places": 2, "sort_order": 2},
        # Imperial
        {"name": "Gallon", "symbol": "gal", "factor": Decimal("3.785411784"), "is_base": False, "is_si_unit": False, "display_name": "Gallon (gal)", "common_usage": "US liquid measure", "decimal_places": 2, "sort_order": 3},
        {"name": "Quart", "symbol": "qt", "factor": Decimal("0.946352946"), "is_base": False, "is_si_unit": False, "display_name": "Quart (qt)", "common_usage": "US liquid measure", "decimal_places": 2, "sort_order": 4},
        {"name": "Pint", "symbol": "pt", "factor": Decimal("0.473176473"), "is_base": False, "is_si_unit": False, "display_name": "Pint (pt)", "common_usage": "US liquid measure", "decimal_places": 2, "sort_order": 5},
        {"name": "Cup", "symbol": "cup", "factor": Decimal("0.2365882365"), "is_base": False, "is_si_unit": False, "display_name": "Cup (cup)", "common_usage": "Small liquid measure", "decimal_places": 2, "sort_order": 6},
    ]
    
    for unit_data in units:
        existing = db.query(UoM).filter(
            UoM.category_id == category.id,
            UoM.symbol == unit_data["symbol"]
        ).first()
        if not existing:
            unit = UoM(category_id=category.id, **unit_data)
            db.add(unit)
    
    db.commit()
    print("✓ Volume units seeded")


def seed_area_units(db: Session):
    """Seed area units - base unit: square meter (sq_m)"""
    category = db.query(UoMCategory).filter(UoMCategory.uom_id == "AREA").first()
    if not category:
        return
    
    units = [
        # Metric
        {"name": "Square Millimeter", "symbol": "sq_mm", "factor": Decimal("0.000001"), "is_base": False, "is_si_unit": True, "display_name": "Square Millimeter (sq_mm)", "common_usage": "Small areas", "decimal_places": 6, "sort_order": 1},
        {"name": "Square Centimeter", "symbol": "sq_cm", "factor": Decimal("0.0001"), "is_base": False, "is_si_unit": True, "display_name": "Square Centimeter (sq_cm)", "common_usage": "Small fabric pieces", "decimal_places": 4, "sort_order": 2},
        {"name": "Square Meter", "symbol": "sq_m", "factor": Decimal("1.0"), "is_base": True, "is_si_unit": True, "display_name": "Square Meter (sq_m)", "common_usage": "Fabric area", "decimal_places": 2, "sort_order": 3},
        {"name": "Square Kilometer", "symbol": "sq_km", "factor": Decimal("1000000.0"), "is_base": False, "is_si_unit": True, "display_name": "Square Kilometer (sq_km)", "common_usage": "Large areas", "decimal_places": 2, "sort_order": 4},
        # Imperial
        {"name": "Square Inch", "symbol": "sq_in", "factor": Decimal("0.00064516"), "is_base": False, "is_si_unit": False, "display_name": "Square Inch (sq_in)", "common_usage": "US measurements", "decimal_places": 4, "sort_order": 5},
        {"name": "Square Foot", "symbol": "sq_ft", "factor": Decimal("0.09290304"), "is_base": False, "is_si_unit": False, "display_name": "Square Foot (sq_ft)", "common_usage": "US measurements", "decimal_places": 2, "sort_order": 6},
        {"name": "Square Yard", "symbol": "sq_yd", "factor": Decimal("0.83612736"), "is_base": False, "is_si_unit": False, "display_name": "Square Yard (sq_yd)", "common_usage": "US fabric area", "decimal_places": 2, "sort_order": 7},
        {"name": "Acre", "symbol": "acre", "factor": Decimal("4046.8564224"), "is_base": False, "is_si_unit": False, "display_name": "Acre (acre)", "common_usage": "Large land areas", "decimal_places": 2, "sort_order": 8},
    ]
    
    for unit_data in units:
        existing = db.query(UoM).filter(
            UoM.category_id == category.id,
            UoM.symbol == unit_data["symbol"]
        ).first()
        if not existing:
            unit = UoM(category_id=category.id, **unit_data)
            db.add(unit)
    
    db.commit()
    print("✓ Area units seeded")


def seed_time_units(db: Session):
    """Seed time units - base unit: second (s)"""
    category = db.query(UoMCategory).filter(UoMCategory.uom_id == "TIME").first()
    if not category:
        return
    
    units = [
        {"name": "Second", "symbol": "s", "factor": Decimal("1.0"), "is_base": True, "is_si_unit": True, "display_name": "Second (s)", "common_usage": "SMV calculations", "decimal_places": 2, "sort_order": 1},
        {"name": "Minute", "symbol": "min", "factor": Decimal("60.0"), "is_base": False, "is_si_unit": False, "display_name": "Minute (min)", "common_usage": "SMV, operation time", "decimal_places": 2, "sort_order": 2},
        {"name": "Hour", "symbol": "hr", "factor": Decimal("3600.0"), "is_base": False, "is_si_unit": False, "display_name": "Hour (hr)", "common_usage": "Production time", "decimal_places": 2, "sort_order": 3},
        {"name": "Day", "symbol": "day", "factor": Decimal("86400.0"), "is_base": False, "is_si_unit": False, "display_name": "Day (day)", "common_usage": "Lead time", "decimal_places": 2, "sort_order": 4},
        {"name": "Week", "symbol": "wk", "factor": Decimal("604800.0"), "is_base": False, "is_si_unit": False, "display_name": "Week (wk)", "common_usage": "Production planning", "decimal_places": 2, "sort_order": 5},
        {"name": "Month", "symbol": "mo", "factor": Decimal("2592000.0"), "is_base": False, "is_si_unit": False, "display_name": "Month (mo)", "common_usage": "Long-term planning", "decimal_places": 2, "sort_order": 6},
        {"name": "Year", "symbol": "yr", "factor": Decimal("31536000.0"), "is_base": False, "is_si_unit": False, "display_name": "Year (yr)", "common_usage": "Annual planning", "decimal_places": 2, "sort_order": 7},
    ]
    
    for unit_data in units:
        existing = db.query(UoM).filter(
            UoM.category_id == category.id,
            UoM.symbol == unit_data["symbol"]
        ).first()
        if not existing:
            unit = UoM(category_id=category.id, **unit_data)
            db.add(unit)
    
    db.commit()
    print("✓ Time units seeded")


def seed_quantity_units(db: Session):
    """Seed quantity units - base unit: piece (pcs)"""
    category = db.query(UoMCategory).filter(UoMCategory.uom_id == "QUANTITY").first()
    if not category:
        return
    
    units = [
        {"name": "Piece", "symbol": "pcs", "factor": Decimal("1.0"), "is_base": True, "is_si_unit": False, "display_name": "Piece (pcs)", "common_usage": "Garments, accessories", "decimal_places": 0, "sort_order": 1},
        {"name": "Dozen", "symbol": "doz", "factor": Decimal("12.0"), "is_base": False, "is_si_unit": False, "display_name": "Dozen (doz)", "common_usage": "Bulk counting", "decimal_places": 0, "sort_order": 2},
        {"name": "Gross", "symbol": "grs", "factor": Decimal("144.0"), "is_base": False, "is_si_unit": False, "display_name": "Gross (grs)", "common_usage": "Large bulk orders", "decimal_places": 0, "sort_order": 3},
        {"name": "Pair", "symbol": "pr", "factor": Decimal("2.0"), "is_base": False, "is_si_unit": False, "display_name": "Pair (pr)", "common_usage": "Shoes, gloves", "decimal_places": 0, "sort_order": 4},
        {"name": "Set", "symbol": "set", "factor": Decimal("1.0"), "is_base": False, "is_si_unit": False, "display_name": "Set (set)", "common_usage": "Matched items", "decimal_places": 0, "sort_order": 5},
    ]
    
    for unit_data in units:
        existing = db.query(UoM).filter(
            UoM.category_id == category.id,
            UoM.symbol == unit_data["symbol"]
        ).first()
        if not existing:
            unit = UoM(category_id=category.id, **unit_data)
            db.add(unit)
    
    db.commit()
    print("✓ Quantity units seeded")


def run_seed():
    """Run all UoM seed functions"""
    print("\n=== Seeding Standard UoM Units ===\n")
    
    with SessionLocalSettings() as db:
        try:
            seed_uom_categories(db)
            seed_length_units(db)
            seed_weight_units(db)
            seed_volume_units(db)
            seed_area_units(db)
            seed_time_units(db)
            seed_quantity_units(db)
            
            print("\n✓ All UoM units seeded successfully!\n")
        except Exception as e:
            print(f"\n✗ Error seeding UoM units: {e}\n")
            db.rollback()
            raise


if __name__ == "__main__":
    run_seed()
