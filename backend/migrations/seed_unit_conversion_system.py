"""
Seed Unit Conversion System Data

Complete unit data for Bangladesh factory use including:
- SI (International System of Units)
- International units
- Desi (South Asian traditional units - Tola, Seer, Maund, etc.)
- English (Imperial) units
- CGS (Centimeter-Gram-Second) units
- Textile industry units (GSM, Denier, Tex, etc.)
- Shipping units (TEU, FEU, CBM)
- Electronics, Robotics, and Industrial units

Based on BSTI (Bangladesh Standards and Testing Institution) and ISO standards.
"""

import logging
from decimal import Decimal
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)


def seed_unit_conversion_system():
    """
    Seed the unit conversion system with comprehensive unit data.
    This function is idempotent - it can be run multiple times safely.
    """
    from core.database import SessionLocalUnits, engines, DatabaseType, BaseUnits
    from modules.units.models.unit import UnitCategory, Unit, UnitTypeEnum

    # Create tables if they don't exist
    try:
        BaseUnits.metadata.create_all(bind=engines[DatabaseType.UNITS], checkfirst=True)
        logger.info("Units database tables created/verified")
    except Exception as e:
        logger.warning(f"Could not create tables: {e}")

    db = SessionLocalUnits()

    try:
        # Check if already seeded
        existing_categories = db.query(UnitCategory).count()
        if existing_categories > 30:
            logger.info(f"Unit system already seeded with {existing_categories} categories. Skipping.")
            return

        logger.info("Seeding Unit Conversion System...")

        # =================================================================
        # UNIT CATEGORIES (21+ categories from Complete-Unit-System.md)
        # =================================================================
        categories_data = [
            # Basic Physical Quantities
            ("Length", "Distance and length measurements", "Meter", "m", "Ruler", "Fabric rolls, ribbons, trims, garment measurements", 1),
            ("Weight", "Mass and weight measurements", "Kilogram", "kg", "Scale", "Yarn weight, fabric weight, trim weights", 2),
            ("Volume", "Capacity and volume measurements", "Cubic Meter", "m3", "Beaker", "Dye chemicals, water, liquid handling", 3),
            ("Temperature", "Temperature measurements (special formula handling)", "Celsius", "C", "Thermometer", "Dyeing, heat setting, steam processing", 4),
            ("Area", "Surface area measurements", "Square Meter", "m2", "Square", "Fabric cutting, factory floor, land area", 5),
            ("Count", "Quantity and count units", "Piece", "pc", "Hash", "Garments, buttons, zippers, accessories", 6),

            # Mechanical & Industrial
            ("Pressure", "Pressure measurements", "Pascal", "Pa", "Gauge", "Steam pressure, hydraulic systems", 7),
            ("Flow Rate", "Volumetric flow measurements", "Cubic Meter per Second", "m3/s", "Flow", "Water flow, dye circulation", 8),
            ("Force", "Force measurements", "Newton", "N", "Zap", "Tensile testing, seam strength", 9),
            ("Torque", "Torque and moment measurements", "Newton-Meter", "Nm", "Wrench", "Motor torque, bolt tightening", 10),
            ("Rotational Speed", "Angular velocity measurements", "Radian per Second", "rad/s", "RotateCw", "Motor speed, spindle RPM", 11),

            # Energy & Power
            ("Energy", "Energy and work measurements", "Joule", "J", "Flame", "Heat energy, work calculations", 12),
            ("Power", "Power measurements", "Watt", "W", "Power", "Motor power, heating elements", 13),

            # Electrical
            ("Electrical Current", "Electric current measurements", "Ampere", "A", "Activity", "Motor current, power consumption", 14),
            ("Electrical Voltage", "Electric potential measurements", "Volt", "V", "Bolt", "Supply voltage, machine voltage", 15),
            ("Electrical Resistance", "Electric resistance measurements", "Ohm", "ohm", "CircleDot", "Heating elements, sensors", 16),
            ("Electrical Power", "Real, Reactive, and Apparent power", "Watt", "W", "Zap", "Power factor, transformer ratings", 17),

            # Textile Specific
            ("Textile - Yarn Count", "Yarn fineness and count measurements", "Tex", "tex", "Waypoints", "Yarn specification, thread count", 18),
            ("Textile - Fabric Weight", "Fabric weight per area (GSM)", "Gram per Square Meter", "GSM", "Layers", "Fabric weight specification", 19),
            ("Textile - Thread", "Thread per inch measurements", "Threads per Inch", "TPI", "Grid3x3", "Weaving, fabric construction", 20),

            # Shipping & Logistics
            ("Shipping Container", "Container and cargo units", "TEU", "TEU", "Package", "Container shipping, cargo planning", 21),
            ("Shipping Weight", "Cargo weight measurements", "Metric Tonne", "MT", "Truck", "Bulk cargo, shipping weight", 22),

            # Industrial & Scientific
            ("Density", "Mass per volume measurements", "Kilogram per Cubic Meter", "kg/m3", "Layers", "Material density", 23),
            ("Viscosity", "Fluid resistance measurements", "Pascal-Second", "Pa.s", "Droplet", "Dye paste, chemical viscosity", 24),
            ("Frequency", "Oscillation frequency measurements", "Hertz", "Hz", "Radio", "Motor frequency, AC power", 25),

            # Electronics
            ("Capacitance", "Capacitor value measurements", "Farad", "F", "Battery", "Electronic components", 26),
            ("Inductance", "Inductor value measurements", "Henry", "H", "Coil", "Electronic components", 27),

            # Light & Sound
            ("Luminous Intensity", "Light measurements", "Lux", "lx", "Sun", "Factory lighting, inspection", 28),
            ("Sound", "Sound and noise measurements", "Decibel", "dB", "Volume2", "Factory noise levels", 29),

            # Time
            ("Time", "Time duration measurements", "Second", "s", "Clock", "Production time, process duration", 30),

            # Data (Bonus)
            ("Data Storage", "Digital data measurements", "Byte", "B", "Database", "System storage, file sizes", 31),

            # Mechanical Engineering (from md)
            ("Mechanical Stress", "Material stress measurements", "Pascal", "Pa", "Gauge", "Materials testing, steel specs", 32),

            # Robotics & Automation
            ("Robotics - Rotation", "Robot angular motion", "Radian per Second", "rad/s", "RotateCw", "Joint speed, servo control", 33),
            ("Robotics - Linear", "Robot linear motion", "Millimeter", "mm", "Move", "Robot arm speed, positioning", 34),

            # Speed
            ("Speed", "Linear velocity measurements", "Meter per Second", "m/s", "Gauge", "Movement speed, machine speed", 35),
        ]

        category_map = {}
        for name, desc, base_name, base_symbol, icon, industry, order in categories_data:
            existing = db.query(UnitCategory).filter(UnitCategory.name == name).first()
            if existing:
                category_map[name] = existing.id
                continue

            cat = UnitCategory(
                name=name,
                description=desc,
                base_unit_name=base_name,
                base_unit_symbol=base_symbol,
                icon=icon,
                industry_use=industry,
                sort_order=order,
                is_active=True
            )
            db.add(cat)
            db.flush()
            category_map[name] = cat.id

        db.commit()
        logger.info(f"Created/verified {len(categories_data)} unit categories")

        # =================================================================
        # UNITS - Comprehensive list
        # =================================================================

        def add_unit(cat_name, name, symbol, desc, unit_type, region, factor, is_base=False, alt_names=None, order=0):
            """Helper to add a unit"""
            cat_id = category_map.get(cat_name)
            if not cat_id:
                logger.warning(f"Category '{cat_name}' not found for unit '{name}'")
                return

            existing = db.query(Unit).filter(
                Unit.category_id == cat_id,
                Unit.symbol == symbol
            ).first()
            if existing:
                return

            try:
                unit = Unit(
                    category_id=cat_id,
                    name=name,
                    symbol=symbol,
                    description=desc,
                    unit_type=unit_type,
                    region=region,
                    to_base_factor=Decimal(str(factor)),
                    is_base=is_base,
                    alternate_names=alt_names,
                    is_active=True,
                    decimal_places=6,
                    sort_order=order
                )
                db.add(unit)
                db.flush()  # Flush to catch errors immediately
            except IntegrityError as e:
                db.rollback()
                logger.warning(f"Failed to add unit '{name}' ({symbol}): {e}")
            except Exception as e:
                db.rollback()
                logger.error(f"Unexpected error adding unit '{name}' ({symbol}): {e}")

        # -----------------------------------------------------------------
        # LENGTH UNITS
        # -----------------------------------------------------------------
        add_unit("Length", "Meter", "m", "Base SI length unit", UnitTypeEnum.SI, None, 1, True, "metre", 1)
        add_unit("Length", "Centimeter", "cm", "0.01 meters", UnitTypeEnum.SI, None, 0.01, False, None, 2)
        add_unit("Length", "Millimeter", "mm", "0.001 meters", UnitTypeEnum.SI, None, 0.001, False, None, 3)
        add_unit("Length", "Micrometer", "um", "1e-6 meters", UnitTypeEnum.SI, None, 0.000001, False, "micron", 4)
        add_unit("Length", "Kilometer", "km", "1000 meters", UnitTypeEnum.SI, None, 1000, False, None, 5)
        add_unit("Length", "Inch", "in", "0.0254 meters", UnitTypeEnum.ENGLISH, "International", 0.0254, False, "inches", 10)
        add_unit("Length", "Foot", "ft", "0.3048 meters", UnitTypeEnum.ENGLISH, "International", 0.3048, False, "feet", 11)
        add_unit("Length", "Yard", "yd", "0.9144 meters", UnitTypeEnum.ENGLISH, "International", 0.9144, False, "yards", 12)
        add_unit("Length", "Mile", "mi", "1609.344 meters", UnitTypeEnum.ENGLISH, "International", 1609.344, False, "miles", 13)
        # Desi units
        add_unit("Length", "Cubit", "cub", "Traditional South Asian cubit (approx 18 inches)", UnitTypeEnum.DESI, "South Asia", 0.4572, False, "hat, haath", 20)
        add_unit("Length", "Gaj", "gaj", "Traditional yard-like unit (same as yard)", UnitTypeEnum.DESI, "South Asia", 0.9144, False, "gaz", 21)
        add_unit("Length", "Kadam", "kad", "Step length (approx 30 inches)", UnitTypeEnum.DESI, "South Asia", 0.762, False, None, 22)
        add_unit("Length", "Hath", "hth", "Arm-span (approx 21.6 inches)", UnitTypeEnum.DESI, "South Asia", 0.5486, False, "haath", 23)

        # -----------------------------------------------------------------
        # WEIGHT UNITS
        # -----------------------------------------------------------------
        add_unit("Weight", "Kilogram", "kg", "Base SI mass unit", UnitTypeEnum.SI, None, 1, True, "kilo", 1)
        add_unit("Weight", "Gram", "g", "0.001 kg", UnitTypeEnum.SI, None, 0.001, False, "grams", 2)
        add_unit("Weight", "Milligram", "mg", "1e-6 kg", UnitTypeEnum.SI, None, 0.000001, False, None, 3)
        add_unit("Weight", "Microgram", "ug", "1e-9 kg", UnitTypeEnum.SI, None, 0.000000001, False, "mcg", 4)
        add_unit("Weight", "Metric Tonne", "t", "1000 kg", UnitTypeEnum.SI, None, 1000, False, "ton, MT", 5)
        add_unit("Weight", "Quintal", "q", "100 kg", UnitTypeEnum.SI, None, 100, False, None, 6)
        add_unit("Weight", "Pound", "lb", "0.453592 kg", UnitTypeEnum.ENGLISH, "International", 0.453592, False, "lbs, pounds", 10)
        add_unit("Weight", "Ounce", "oz", "0.0283495 kg", UnitTypeEnum.ENGLISH, "International", 0.0283495, False, "ounces", 11)
        add_unit("Weight", "Grain", "gr", "0.0000648 kg", UnitTypeEnum.ENGLISH, "International", 0.0000648, False, "grains", 12)
        add_unit("Weight", "Stone", "st", "6.35029 kg", UnitTypeEnum.ENGLISH, "UK", 6.35029, False, None, 13)
        add_unit("Weight", "Short Ton (US)", "ST", "907.185 kg", UnitTypeEnum.ENGLISH, "USA", 907.185, False, "US ton", 14)
        add_unit("Weight", "Long Ton (UK)", "LT", "1016.05 kg", UnitTypeEnum.ENGLISH, "UK", 1016.05, False, "UK ton", 15)
        # Desi units (Bangladesh/South Asia)
        add_unit("Weight", "Tola", "tola", "Traditional South Asian weight (11.664 grams)", UnitTypeEnum.DESI, "South Asia", 0.011664, False, "tol, bhori", 20)
        add_unit("Weight", "Seer", "seer", "80 tola (933 grams)", UnitTypeEnum.DESI, "South Asia", 0.933, False, "ser", 21)
        add_unit("Weight", "Maund", "mun", "40 seer (37.32 kg)", UnitTypeEnum.DESI, "South Asia", 37.32, False, "mon, maund", 22)
        add_unit("Weight", "Chhatak", "chhtak", "1/8 seer (116.6 grams)", UnitTypeEnum.DESI, "South Asia", 0.1166, False, "chatak", 23)
        add_unit("Weight", "Pav", "pav", "1/4 seer (233.3 grams)", UnitTypeEnum.DESI, "South Asia", 0.2333, False, "pow", 24)
        add_unit("Weight", "Ratti", "ratti", "Traditional jewelry weight (0.1215 g)", UnitTypeEnum.DESI, "South Asia", 0.0001215, False, "rati", 25)
        add_unit("Weight", "Masha", "masha", "8 ratti (0.972 g)", UnitTypeEnum.DESI, "South Asia", 0.000972, False, None, 26)
        add_unit("Weight", "Dhurki", "dhurki", "Traditional small weight", UnitTypeEnum.DESI, "South Asia", 0.0058, False, None, 27)

        # -----------------------------------------------------------------
        # VOLUME UNITS
        # -----------------------------------------------------------------
        add_unit("Volume", "Cubic Meter", "m3", "Base SI volume unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Volume", "Liter", "L", "0.001 m3", UnitTypeEnum.SI, None, 0.001, False, "litre, l", 2)
        add_unit("Volume", "Milliliter", "mL", "1e-6 m3", UnitTypeEnum.SI, None, 0.000001, False, "ml", 3)
        add_unit("Volume", "Cubic Centimeter", "cm3", "1e-6 m3 (same as mL)", UnitTypeEnum.SI, None, 0.000001, False, "cc", 4)
        add_unit("Volume", "Cubic Foot", "ft3", "0.0283168 m3", UnitTypeEnum.ENGLISH, "International", 0.0283168, False, "cu ft", 10)
        add_unit("Volume", "Gallon (US)", "gal", "0.003785 m3", UnitTypeEnum.ENGLISH, "USA", 0.003785, False, "US gallon", 11)
        add_unit("Volume", "Gallon (Imperial)", "imp_gal", "0.00454609 m3", UnitTypeEnum.ENGLISH, "UK", 0.00454609, False, "UK gallon", 12)
        add_unit("Volume", "Fluid Ounce (US)", "fl_oz", "0.0000295735 m3", UnitTypeEnum.ENGLISH, "USA", 0.0000295735, False, None, 13)
        # Desi units
        add_unit("Volume", "Ser", "ser", "Traditional South Asian volume (~1.94 liters)", UnitTypeEnum.DESI, "South Asia", 0.001941, False, None, 20)
        add_unit("Volume", "Kali", "kali", "Traditional volume unit (~20.41 liters)", UnitTypeEnum.DESI, "South Asia", 0.02041, False, None, 21)
        add_unit("Volume", "Powa", "powa", "Traditional volume unit (~485 ml)", UnitTypeEnum.DESI, "South Asia", 0.000485, False, None, 22)

        # -----------------------------------------------------------------
        # TEMPERATURE UNITS (Special handling - factors not used for conversion)
        # -----------------------------------------------------------------
        add_unit("Temperature", "Celsius", "C", "Base temperature unit", UnitTypeEnum.SI, None, 1, True, "centigrade, °C", 1)
        add_unit("Temperature", "Fahrenheit", "F_temp", "Requires formula conversion", UnitTypeEnum.ENGLISH, "International", 1, False, "°F", 2)
        add_unit("Temperature", "Kelvin", "K", "Absolute temperature", UnitTypeEnum.SI, None, 1, False, None, 3)
        add_unit("Temperature", "Rankine", "R", "Absolute temperature (Fahrenheit scale)", UnitTypeEnum.ENGLISH, "International", 1, False, "°R", 4)

        # -----------------------------------------------------------------
        # AREA UNITS
        # -----------------------------------------------------------------
        add_unit("Area", "Square Meter", "m2", "Base SI area unit", UnitTypeEnum.SI, None, 1, True, "sq m", 1)
        add_unit("Area", "Square Centimeter", "cm2", "0.0001 m2", UnitTypeEnum.SI, None, 0.0001, False, "sq cm", 2)
        add_unit("Area", "Square Kilometer", "km2", "1,000,000 m2", UnitTypeEnum.SI, None, 1000000, False, "sq km", 3)
        add_unit("Area", "Hectare", "ha", "10,000 m2", UnitTypeEnum.SI, None, 10000, False, None, 4)
        add_unit("Area", "Square Foot", "ft2", "0.092903 m2", UnitTypeEnum.ENGLISH, "International", 0.092903, False, "sq ft", 10)
        add_unit("Area", "Square Yard", "yd2", "0.836127 m2", UnitTypeEnum.ENGLISH, "International", 0.836127, False, "sq yd", 11)
        add_unit("Area", "Acre", "ac", "4046.86 m2", UnitTypeEnum.ENGLISH, "International", 4046.86, False, None, 12)
        # Desi units with regional variations
        add_unit("Area", "Bigha (Standard)", "bigha", "Generic traditional unit (2500 m2)", UnitTypeEnum.DESI, "South Asia", 2500, False, None, 20)
        add_unit("Area", "Bigha (Dhaka)", "bigha_dh", "Traditional land unit - Dhaka region", UnitTypeEnum.DESI, "Dhaka", 2500, False, None, 21)
        add_unit("Area", "Bigha (Chittagong)", "bigha_ct", "Traditional land unit - Chittagong region", UnitTypeEnum.DESI, "Chittagong", 2800, False, None, 22)
        add_unit("Area", "Bigha (Sylhet)", "bigha_sy", "Traditional land unit - Sylhet region", UnitTypeEnum.DESI, "Sylhet", 2300, False, None, 23)
        add_unit("Area", "Bigha (Rajshahi)", "bigha_rj", "Traditional land unit - Rajshahi region", UnitTypeEnum.DESI, "Rajshahi", 2700, False, None, 24)
        add_unit("Area", "Bigha (Khulna)", "bigha_kh", "Traditional land unit - Khulna region", UnitTypeEnum.DESI, "Khulna", 2500, False, None, 25)
        add_unit("Area", "Bigha (Barishal)", "bigha_br", "Traditional land unit - Barishal region", UnitTypeEnum.DESI, "Barishal", 2600, False, None, 26)
        add_unit("Area", "Kattha", "kattha", "Approx 1/25 bigha (120 m2)", UnitTypeEnum.DESI, "South Asia", 120, False, "katha", 27)
        add_unit("Area", "Tala", "tala", "Regional variation (16-40 m2)", UnitTypeEnum.DESI, "South Asia", 28, False, None, 28)
        add_unit("Area", "Decimal", "dec", "1/100 acre (40.47 m2)", UnitTypeEnum.DESI, "South Asia", 40.47, False, "shotangsho", 29)
        add_unit("Area", "Satak", "satak", "Same as decimal (40.47 m2)", UnitTypeEnum.DESI, "Bangladesh", 40.47, False, None, 30)
        add_unit("Area", "Marla", "marla", "272.25 sq ft (25.29 m2)", UnitTypeEnum.DESI, "South Asia", 25.29, False, None, 31)
        add_unit("Area", "Kanal", "kanal", "20 marla (505.86 m2)", UnitTypeEnum.DESI, "South Asia", 505.86, False, None, 32)

        # -----------------------------------------------------------------
        # COUNT UNITS
        # -----------------------------------------------------------------
        add_unit("Count", "Piece", "pc", "Single item", UnitTypeEnum.SI, None, 1, True, "pcs, pieces", 1)
        add_unit("Count", "Pair", "pr", "2 pieces", UnitTypeEnum.INTERNATIONAL, None, 2, False, "pairs", 2)
        add_unit("Count", "Hali", "hali", "4 pieces (Bangladesh local unit)", UnitTypeEnum.DESI, "Bangladesh", 4, False, None, 3)
        add_unit("Count", "Half Dozen", "hdoz", "6 pieces", UnitTypeEnum.INTERNATIONAL, None, 6, False, None, 4)
        add_unit("Count", "Dozen", "doz", "12 pieces", UnitTypeEnum.INTERNATIONAL, None, 12, False, None, 5)
        add_unit("Count", "Baker's Dozen", "bdoz", "13 pieces", UnitTypeEnum.INTERNATIONAL, None, 13, False, None, 6)
        add_unit("Count", "Score", "score", "20 pieces", UnitTypeEnum.INTERNATIONAL, None, 20, False, None, 7)
        add_unit("Count", "Gross", "gross", "144 pieces (12 x 12)", UnitTypeEnum.INTERNATIONAL, None, 144, False, None, 8)
        add_unit("Count", "Great Gross", "ggross", "1,728 pieces (12 x 144)", UnitTypeEnum.INTERNATIONAL, None, 1728, False, None, 9)
        # Indian numbering system
        add_unit("Count", "Lakh", "lakh", "100,000 count (Indian numbering)", UnitTypeEnum.DESI, "South Asia", 100000, False, "lac", 20)
        add_unit("Count", "Crore", "crore", "10,000,000 count (Indian numbering)", UnitTypeEnum.DESI, "South Asia", 10000000, False, None, 21)

        # -----------------------------------------------------------------
        # PRESSURE UNITS
        # -----------------------------------------------------------------
        add_unit("Pressure", "Pascal", "Pa", "Base SI pressure unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Pressure", "Kilopascal", "kPa", "1000 Pa", UnitTypeEnum.SI, None, 1000, False, None, 2)
        add_unit("Pressure", "Megapascal", "MPa", "1,000,000 Pa", UnitTypeEnum.SI, None, 1000000, False, None, 3)
        add_unit("Pressure", "Bar", "bar", "100,000 Pa", UnitTypeEnum.INTERNATIONAL, None, 100000, False, None, 4)
        add_unit("Pressure", "Millibar", "mbar", "100 Pa", UnitTypeEnum.INTERNATIONAL, None, 100, False, None, 5)
        add_unit("Pressure", "Atmosphere", "atm", "101,325 Pa", UnitTypeEnum.INTERNATIONAL, None, 101325, False, None, 6)
        add_unit("Pressure", "PSI", "psi", "6,894.76 Pa", UnitTypeEnum.ENGLISH, "International", 6894.76, False, None, 10)
        add_unit("Pressure", "PSIG", "psig", "Gauge pressure (6894.76 Pa)", UnitTypeEnum.ENGLISH, "International", 6894.76, False, "psi gauge", 11)
        add_unit("Pressure", "Torr", "Torr", "133.322 Pa", UnitTypeEnum.INTERNATIONAL, None, 133.322, False, None, 12)
        add_unit("Pressure", "mmHg", "mmHg", "133.322 Pa (same as Torr)", UnitTypeEnum.INTERNATIONAL, None, 133.322, False, None, 13)
        add_unit("Pressure", "Inches of Water", "inH2O", "249.09 Pa", UnitTypeEnum.ENGLISH, "International", 249.09, False, None, 14)
        add_unit("Pressure", "Kilogram per Square Centimeter", "kg/cm2", "98066.5 Pa", UnitTypeEnum.INTERNATIONAL, None, 98066.5, False, "kgf/cm2", 15)

        # -----------------------------------------------------------------
        # FLOW RATE UNITS
        # -----------------------------------------------------------------
        add_unit("Flow Rate", "Cubic Meter per Second", "m3/s", "Base SI flow unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Flow Rate", "Cubic Meter per Hour", "m3/h", "Industrial unit", UnitTypeEnum.SI, None, 0.000277778, False, "CMH", 2)
        add_unit("Flow Rate", "Liter per Minute", "L/min", "Common industrial unit", UnitTypeEnum.SI, None, 0.000016667, False, "LPM", 3)
        add_unit("Flow Rate", "Liter per Hour", "L/h", "Small flow unit", UnitTypeEnum.SI, None, 0.000000278, False, "LPH", 4)
        add_unit("Flow Rate", "Gallon per Minute (US)", "GPM", "US gallon per minute", UnitTypeEnum.ENGLISH, "USA", 0.0000631, False, None, 10)
        add_unit("Flow Rate", "Gallon per Hour (US)", "GPH", "US gallon per hour", UnitTypeEnum.ENGLISH, "USA", 0.00000105, False, None, 11)
        add_unit("Flow Rate", "Cubic Foot per Minute", "CFM", "HVAC/air flow unit", UnitTypeEnum.ENGLISH, "International", 0.000472, False, None, 12)
        add_unit("Flow Rate", "Barrel per Day", "bbl/d", "Oil industry unit", UnitTypeEnum.ENGLISH, "International", 0.00000183, False, "BPD", 13)

        # -----------------------------------------------------------------
        # FORCE UNITS
        # -----------------------------------------------------------------
        add_unit("Force", "Newton", "N", "Base SI force unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Force", "Kilonewton", "kN", "1000 N", UnitTypeEnum.SI, None, 1000, False, None, 2)
        add_unit("Force", "Dyne", "dyn", "1e-5 N", UnitTypeEnum.CGS, None, 0.00001, False, None, 3)
        add_unit("Force", "Pound-Force", "lbf", "4.44822 N", UnitTypeEnum.ENGLISH, "International", 4.44822, False, None, 10)
        add_unit("Force", "Kilogram-Force", "kgf", "9.80665 N", UnitTypeEnum.INTERNATIONAL, None, 9.80665, False, "kilopond", 11)
        add_unit("Force", "Gram-Force", "gf", "0.00980665 N", UnitTypeEnum.CGS, None, 0.00980665, False, None, 12)
        add_unit("Force", "Ton-Force (Metric)", "tonf", "9806.65 N", UnitTypeEnum.INTERNATIONAL, None, 9806.65, False, None, 13)

        # -----------------------------------------------------------------
        # TORQUE UNITS
        # -----------------------------------------------------------------
        add_unit("Torque", "Newton-Meter", "Nm", "Base SI torque unit", UnitTypeEnum.SI, None, 1, True, "N.m", 1)
        add_unit("Torque", "Kilonewton-Meter", "kNm", "1000 Nm", UnitTypeEnum.SI, None, 1000, False, None, 2)
        add_unit("Torque", "Foot-Pound", "ft.lbf", "1.35582 Nm", UnitTypeEnum.ENGLISH, "International", 1.35582, False, "ft-lb", 10)
        add_unit("Torque", "Pound-Inch", "in.lbf", "0.112985 Nm", UnitTypeEnum.ENGLISH, "International", 0.112985, False, "in-lb", 11)
        add_unit("Torque", "Kilogram-Force-Meter", "kgf.m", "9.80665 Nm", UnitTypeEnum.INTERNATIONAL, None, 9.80665, False, None, 12)
        add_unit("Torque", "Gram-Force-Centimeter", "gf.cm", "0.0000980665 Nm", UnitTypeEnum.CGS, None, 0.0000980665, False, "g-cm", 13)
        add_unit("Torque", "Kilogram-Force-Centimeter", "kgf.cm", "0.0980665 Nm", UnitTypeEnum.INTERNATIONAL, None, 0.0980665, False, "kg-cm", 14)

        # -----------------------------------------------------------------
        # ROTATIONAL SPEED UNITS
        # -----------------------------------------------------------------
        add_unit("Rotational Speed", "Radian per Second", "rad/s", "Base SI angular velocity", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Rotational Speed", "Revolution per Minute", "RPM", "Motor speed unit", UnitTypeEnum.INTERNATIONAL, None, 0.104720, False, "rpm", 2)
        add_unit("Rotational Speed", "Revolution per Second", "RPS", "High-speed rotation unit", UnitTypeEnum.INTERNATIONAL, None, 6.28319, False, "rps", 3)
        add_unit("Rotational Speed", "Degree per Second", "deg/s", "Angular velocity unit", UnitTypeEnum.INTERNATIONAL, None, 0.017453, False, "°/s", 4)
        add_unit("Rotational Speed", "Hertz", "Hz_rot", "Frequency (rotation)", UnitTypeEnum.SI, None, 6.28319, False, None, 5)

        # -----------------------------------------------------------------
        # ENERGY UNITS
        # -----------------------------------------------------------------
        add_unit("Energy", "Joule", "J", "Base SI energy unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Energy", "Kilojoule", "kJ", "1000 J", UnitTypeEnum.SI, None, 1000, False, None, 2)
        add_unit("Energy", "Megajoule", "MJ", "1,000,000 J", UnitTypeEnum.SI, None, 1000000, False, None, 3)
        add_unit("Energy", "Calorie", "cal", "4.184 J", UnitTypeEnum.INTERNATIONAL, None, 4.184, False, None, 4)
        add_unit("Energy", "Kilocalorie", "kcal", "4184 J", UnitTypeEnum.INTERNATIONAL, None, 4184, False, "Cal, food calorie", 5)
        add_unit("Energy", "Watt-Hour", "Wh", "3600 J", UnitTypeEnum.INTERNATIONAL, None, 3600, False, None, 6)
        add_unit("Energy", "Kilowatt-Hour", "kWh", "3,600,000 J", UnitTypeEnum.INTERNATIONAL, None, 3600000, False, "unit (electricity)", 7)
        add_unit("Energy", "BTU", "BTU", "1055.06 J", UnitTypeEnum.ENGLISH, "International", 1055.06, False, None, 10)
        add_unit("Energy", "Erg", "erg", "1e-7 J", UnitTypeEnum.CGS, None, 0.0000001, False, None, 11)

        # -----------------------------------------------------------------
        # POWER UNITS
        # -----------------------------------------------------------------
        add_unit("Power", "Watt", "W", "Base SI power unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Power", "Kilowatt", "kW", "1000 W", UnitTypeEnum.SI, None, 1000, False, None, 2)
        add_unit("Power", "Megawatt", "MW", "1,000,000 W", UnitTypeEnum.SI, None, 1000000, False, None, 3)
        add_unit("Power", "Horsepower (Mechanical)", "hp", "745.7 W", UnitTypeEnum.INTERNATIONAL, None, 745.7, False, "HP", 10)
        add_unit("Power", "Horsepower (Electrical)", "hp_e", "746 W", UnitTypeEnum.INTERNATIONAL, None, 746, False, None, 11)
        add_unit("Power", "BTU per Hour", "BTU/h", "0.293071 W", UnitTypeEnum.ENGLISH, "International", 0.293071, False, None, 12)
        add_unit("Power", "Calorie per Second", "cal/s", "4.184 W", UnitTypeEnum.INTERNATIONAL, None, 4.184, False, None, 13)

        # -----------------------------------------------------------------
        # ELECTRICAL UNITS
        # -----------------------------------------------------------------
        add_unit("Electrical Current", "Ampere", "A", "Base SI current unit", UnitTypeEnum.SI, None, 1, True, "amp", 1)
        add_unit("Electrical Current", "Milliampere", "mA", "0.001 A", UnitTypeEnum.SI, None, 0.001, False, None, 2)
        add_unit("Electrical Current", "Microampere", "uA", "1e-6 A", UnitTypeEnum.SI, None, 0.000001, False, None, 3)

        add_unit("Electrical Voltage", "Volt", "V", "Base SI voltage unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Electrical Voltage", "Millivolt", "mV", "0.001 V", UnitTypeEnum.SI, None, 0.001, False, None, 2)
        add_unit("Electrical Voltage", "Kilovolt", "kV", "1000 V", UnitTypeEnum.SI, None, 1000, False, None, 3)

        add_unit("Electrical Resistance", "Ohm", "ohm", "Base SI resistance unit", UnitTypeEnum.SI, None, 1, True, "Ω", 1)
        add_unit("Electrical Resistance", "Kilohm", "kOhm", "1000 ohm", UnitTypeEnum.SI, None, 1000, False, "kΩ", 2)
        add_unit("Electrical Resistance", "Megohm", "MOhm", "1e6 ohm", UnitTypeEnum.SI, None, 1000000, False, "MΩ", 3)
        add_unit("Electrical Resistance", "Milliohm", "mOhm", "0.001 ohm", UnitTypeEnum.SI, None, 0.001, False, "mΩ", 4)

        # Electrical Power (Real, Reactive, Apparent)
        add_unit("Electrical Power", "Watt", "W_e", "Real power unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Electrical Power", "Kilowatt", "kW_e", "1000 W real", UnitTypeEnum.SI, None, 1000, False, None, 2)
        add_unit("Electrical Power", "Volt-Ampere", "VA", "Apparent power unit", UnitTypeEnum.SI, None, 1, False, None, 3)
        add_unit("Electrical Power", "Kilovolt-Ampere", "kVA", "1000 VA", UnitTypeEnum.SI, None, 1000, False, None, 4)
        add_unit("Electrical Power", "Volt-Ampere Reactive", "var", "Reactive power unit", UnitTypeEnum.SI, None, 1, False, "VAR", 5)
        add_unit("Electrical Power", "Kilovar", "kvar", "1000 var", UnitTypeEnum.SI, None, 1000, False, "kVAR", 6)

        # Electrical Charge
        add_unit("Electrical Current", "Ampere-Hour", "Ah", "Battery capacity unit", UnitTypeEnum.SI, None, 3600, False, None, 4)
        add_unit("Electrical Current", "Milliampere-Hour", "mAh", "Small battery capacity", UnitTypeEnum.SI, None, 3.6, False, None, 5)

        # -----------------------------------------------------------------
        # TEXTILE UNITS
        # -----------------------------------------------------------------
        # Yarn Count
        add_unit("Textile - Yarn Count", "Tex", "tex", "Grams per 1000 meters (base unit)", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Textile - Yarn Count", "Denier", "den", "Grams per 9000 meters", UnitTypeEnum.INTERNATIONAL, None, 0.111111, False, "D", 2)
        add_unit("Textile - Yarn Count", "Decitex", "dtex", "Grams per 10000 meters", UnitTypeEnum.SI, None, 0.1, False, None, 3)
        add_unit("Textile - Yarn Count", "English Count (Ne)", "Ne", "840 yards per pound (cotton)", UnitTypeEnum.INTERNATIONAL, None, 590.54, False, "cotton count", 4)
        add_unit("Textile - Yarn Count", "Metric Count (Nm)", "Nm_yarn", "1000 meters per kg", UnitTypeEnum.SI, None, 1, False, None, 5)

        # Fabric Weight
        add_unit("Textile - Fabric Weight", "GSM", "GSM", "Grams per Square Meter (base)", UnitTypeEnum.SI, None, 1, True, "g/m2", 1)
        add_unit("Textile - Fabric Weight", "Ounce per Square Yard", "oz/yd2", "Ounces per square yard", UnitTypeEnum.ENGLISH, "International", 33.906, False, "osy", 2)

        # Thread Count
        add_unit("Textile - Thread", "Threads per Inch", "TPI", "Threads per inch (base)", UnitTypeEnum.INTERNATIONAL, None, 1, True, None, 1)
        add_unit("Textile - Thread", "Ends per Inch", "EPI", "Warp threads per inch", UnitTypeEnum.INTERNATIONAL, None, 1, False, None, 2)
        add_unit("Textile - Thread", "Picks per Inch", "PPI", "Weft threads per inch", UnitTypeEnum.INTERNATIONAL, None, 1, False, None, 3)
        add_unit("Textile - Thread", "Stitches per Inch", "SPI", "Sewing quality measure", UnitTypeEnum.INTERNATIONAL, None, 1, False, None, 4)
        add_unit("Textile - Thread", "Thread Count", "TC", "Total threads per sq inch (EPI+PPI)", UnitTypeEnum.INTERNATIONAL, None, 1, False, None, 5)

        # -----------------------------------------------------------------
        # SHIPPING UNITS
        # -----------------------------------------------------------------
        add_unit("Shipping Container", "TEU (20ft)", "TEU", "20-foot container: 33 m3", UnitTypeEnum.INTERNATIONAL, None, 1, True, None, 1)
        add_unit("Shipping Container", "FEU (40ft)", "FEU", "40-foot container: 67 m3", UnitTypeEnum.INTERNATIONAL, None, 2, False, None, 2)
        add_unit("Shipping Container", "HC (40ft High-Cube)", "HC", "40-foot HC: 76 m3", UnitTypeEnum.INTERNATIONAL, None, 2.3, False, None, 3)
        add_unit("Shipping Container", "45ft Container", "45ft", "45-foot container: 85 m3", UnitTypeEnum.INTERNATIONAL, None, 2.58, False, None, 4)
        add_unit("Shipping Container", "Cubic Meter (Cargo)", "CBM", "1 m3 cargo space", UnitTypeEnum.SI, None, 0.0303, False, None, 5)

        add_unit("Shipping Weight", "Metric Tonne", "MT", "1000 kg (base)", UnitTypeEnum.SI, None, 1, True, "t", 1)
        add_unit("Shipping Weight", "Short Ton (US)", "ST_ship", "907.185 kg", UnitTypeEnum.ENGLISH, "USA", 0.907185, False, None, 2)
        add_unit("Shipping Weight", "Long Ton (UK)", "LT_ship", "1016.05 kg", UnitTypeEnum.ENGLISH, "UK", 1.01605, False, None, 3)
        add_unit("Shipping Weight", "Kilogram", "kg_ship", "0.001 MT", UnitTypeEnum.SI, None, 0.001, False, None, 4)

        # -----------------------------------------------------------------
        # DENSITY UNITS
        # -----------------------------------------------------------------
        add_unit("Density", "Kilogram per Cubic Meter", "kg/m3", "Base SI density unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Density", "Gram per Cubic Centimeter", "g/cm3", "1000 kg/m3", UnitTypeEnum.SI, None, 1000, False, "g/cc", 2)
        add_unit("Density", "Pound per Cubic Foot", "lb/ft3", "16.0185 kg/m3", UnitTypeEnum.ENGLISH, "International", 16.0185, False, None, 3)

        # -----------------------------------------------------------------
        # VISCOSITY UNITS
        # -----------------------------------------------------------------
        add_unit("Viscosity", "Pascal-Second", "Pa.s", "Base SI viscosity unit", UnitTypeEnum.SI, None, 1, True, "Pa·s", 1)
        add_unit("Viscosity", "Centipoise", "cP", "0.001 Pa.s", UnitTypeEnum.CGS, None, 0.001, False, None, 2)
        add_unit("Viscosity", "Poise", "P", "0.1 Pa.s", UnitTypeEnum.CGS, None, 0.1, False, None, 3)

        # -----------------------------------------------------------------
        # FREQUENCY UNITS
        # -----------------------------------------------------------------
        add_unit("Frequency", "Hertz", "Hz", "Base SI frequency unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Frequency", "Kilohertz", "kHz", "1000 Hz", UnitTypeEnum.SI, None, 1000, False, None, 2)
        add_unit("Frequency", "Megahertz", "MHz", "1e6 Hz", UnitTypeEnum.SI, None, 1000000, False, None, 3)
        add_unit("Frequency", "Gigahertz", "GHz", "1e9 Hz", UnitTypeEnum.SI, None, 1000000000, False, None, 4)

        # -----------------------------------------------------------------
        # CAPACITANCE UNITS
        # -----------------------------------------------------------------
        add_unit("Capacitance", "Farad", "F", "Base SI capacitance unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Capacitance", "Microfarad", "uF", "1e-6 F", UnitTypeEnum.SI, None, 0.000001, False, "µF", 2)
        add_unit("Capacitance", "Nanofarad", "nF", "1e-9 F", UnitTypeEnum.SI, None, 0.000000001, False, None, 3)
        add_unit("Capacitance", "Picofarad", "pF", "1e-12 F", UnitTypeEnum.SI, None, 0.000000000001, False, None, 4)

        # -----------------------------------------------------------------
        # INDUCTANCE UNITS
        # -----------------------------------------------------------------
        add_unit("Inductance", "Henry", "H", "Base SI inductance unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Inductance", "Millihenry", "mH", "0.001 H", UnitTypeEnum.SI, None, 0.001, False, None, 2)
        add_unit("Inductance", "Microhenry", "uH", "1e-6 H", UnitTypeEnum.SI, None, 0.000001, False, "µH", 3)

        # -----------------------------------------------------------------
        # LUMINOUS INTENSITY UNITS
        # -----------------------------------------------------------------
        add_unit("Luminous Intensity", "Lux", "lx", "Base unit: lumens per m2", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Luminous Intensity", "Foot-Candle", "fc", "10.764 lux", UnitTypeEnum.ENGLISH, "International", 10.764, False, None, 2)
        add_unit("Luminous Intensity", "Lumen", "lm", "Luminous flux (relative)", UnitTypeEnum.SI, None, 1, False, None, 3)

        # -----------------------------------------------------------------
        # SOUND UNITS
        # -----------------------------------------------------------------
        add_unit("Sound", "Decibel", "dB", "Relative sound pressure level", UnitTypeEnum.OTHER, None, 1, True, None, 1)
        add_unit("Sound", "Decibel A-weighted", "dB(A)", "Human hearing perception weighted", UnitTypeEnum.OTHER, None, 1, False, "dBA", 2)

        # -----------------------------------------------------------------
        # TIME UNITS
        # -----------------------------------------------------------------
        add_unit("Time", "Second", "s", "Base SI time unit", UnitTypeEnum.SI, None, 1, True, "sec", 1)
        add_unit("Time", "Millisecond", "ms", "0.001 seconds", UnitTypeEnum.SI, None, 0.001, False, None, 2)
        add_unit("Time", "Minute", "min", "60 seconds", UnitTypeEnum.INTERNATIONAL, None, 60, False, None, 3)
        add_unit("Time", "Hour", "h", "3600 seconds", UnitTypeEnum.INTERNATIONAL, None, 3600, False, "hr", 4)
        add_unit("Time", "Day", "d", "86400 seconds", UnitTypeEnum.INTERNATIONAL, None, 86400, False, None, 5)
        add_unit("Time", "Week", "wk", "604800 seconds", UnitTypeEnum.INTERNATIONAL, None, 604800, False, None, 6)

        # -----------------------------------------------------------------
        # DATA STORAGE UNITS
        # -----------------------------------------------------------------
        add_unit("Data Storage", "Byte", "B", "Base data storage unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Data Storage", "Kilobyte", "KB", "1000 bytes (decimal)", UnitTypeEnum.SI, None, 1000, False, None, 2)
        add_unit("Data Storage", "Megabyte", "MB", "1e6 bytes", UnitTypeEnum.SI, None, 1000000, False, None, 3)
        add_unit("Data Storage", "Gigabyte", "GB", "1e9 bytes", UnitTypeEnum.SI, None, 1000000000, False, None, 4)
        add_unit("Data Storage", "Terabyte", "TB", "1e12 bytes", UnitTypeEnum.SI, None, 1000000000000, False, None, 5)
        # Binary units
        add_unit("Data Storage", "Kibibyte", "KiB", "1024 bytes (binary)", UnitTypeEnum.SI, None, 1024, False, None, 6)
        add_unit("Data Storage", "Mebibyte", "MiB", "1024 KiB", UnitTypeEnum.SI, None, 1048576, False, None, 7)
        add_unit("Data Storage", "Gibibyte", "GiB", "1024 MiB", UnitTypeEnum.SI, None, 1073741824, False, None, 8)

        # -----------------------------------------------------------------
        # SPEED / VELOCITY UNITS
        # -----------------------------------------------------------------
        add_unit("Speed", "Meter per Second", "m/s", "Base SI speed unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Speed", "Kilometer per Hour", "km/h", "3.6 km/h = 1 m/s", UnitTypeEnum.SI, None, 0.277778, False, "kph", 2)
        add_unit("Speed", "Millimeter per Second", "mm/s", "0.001 m/s", UnitTypeEnum.SI, None, 0.001, False, None, 3)
        add_unit("Speed", "Centimeter per Second", "cm/s", "0.01 m/s", UnitTypeEnum.SI, None, 0.01, False, None, 4)
        add_unit("Speed", "Meter per Minute", "m/min", "1/60 m/s", UnitTypeEnum.SI, None, 0.01667, False, None, 5)
        add_unit("Speed", "Mile per Hour", "mph", "0.44704 m/s", UnitTypeEnum.ENGLISH, "International", 0.44704, False, None, 10)
        add_unit("Speed", "Foot per Second", "ft/s", "0.3048 m/s", UnitTypeEnum.ENGLISH, "International", 0.3048, False, "fps", 11)
        add_unit("Speed", "Inch per Second", "in/s", "0.0254 m/s", UnitTypeEnum.ENGLISH, "International", 0.0254, False, "ips", 12)
        add_unit("Speed", "Knot", "kn_speed", "0.514444 m/s (nautical)", UnitTypeEnum.INTERNATIONAL, None, 0.514444, False, "kt", 13)

        # -----------------------------------------------------------------
        # MECHANICAL STRESS UNITS
        # -----------------------------------------------------------------
        add_unit("Mechanical Stress", "Pascal", "Pa_s", "Base SI stress unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Mechanical Stress", "Megapascal", "MPa_s", "1e6 Pa (materials testing)", UnitTypeEnum.SI, None, 1000000, False, None, 2)
        add_unit("Mechanical Stress", "Gigapascal", "GPa", "1e9 Pa (steel, composites)", UnitTypeEnum.SI, None, 1000000000, False, None, 3)
        add_unit("Mechanical Stress", "Newton per mm²", "N/mm2", "= 1 MPa", UnitTypeEnum.SI, None, 1000000, False, None, 4)
        add_unit("Mechanical Stress", "Kilogram-Force per cm²", "kgf/cm2", "98066.5 Pa", UnitTypeEnum.INTERNATIONAL, None, 98066.5, False, None, 5)
        add_unit("Mechanical Stress", "PSI (Stress)", "psi_s", "6894.76 Pa", UnitTypeEnum.ENGLISH, "International", 6894.76, False, None, 6)

        # -----------------------------------------------------------------
        # ROBOTICS - ROTATION
        # -----------------------------------------------------------------
        add_unit("Robotics - Rotation", "Radian per Second", "rad/s_r", "Base angular velocity", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Robotics - Rotation", "Degree per Second", "deg/s_r", "Servo control unit", UnitTypeEnum.INTERNATIONAL, None, 0.017453, False, None, 2)
        add_unit("Robotics - Rotation", "RPM (Robot)", "RPM_r", "Motor speed", UnitTypeEnum.INTERNATIONAL, None, 0.104720, False, None, 3)
        add_unit("Robotics - Rotation", "Degree", "deg", "Position angle", UnitTypeEnum.INTERNATIONAL, None, 0.017453, False, "°", 4)
        add_unit("Robotics - Rotation", "Radian", "rad", "SI angle unit", UnitTypeEnum.SI, None, 1, False, None, 5)
        add_unit("Robotics - Rotation", "Revolution", "rev", "Full rotation (2π rad)", UnitTypeEnum.INTERNATIONAL, None, 6.28319, False, None, 6)

        # -----------------------------------------------------------------
        # ROBOTICS - LINEAR MOTION
        # -----------------------------------------------------------------
        add_unit("Robotics - Linear", "Millimeter", "mm_r", "Robot positioning unit", UnitTypeEnum.SI, None, 1, True, None, 1)
        add_unit("Robotics - Linear", "Centimeter", "cm_r", "10 mm", UnitTypeEnum.SI, None, 10, False, None, 2)
        add_unit("Robotics - Linear", "Meter", "m_r", "1000 mm", UnitTypeEnum.SI, None, 1000, False, None, 3)
        add_unit("Robotics - Linear", "Micrometer", "um_r", "0.001 mm", UnitTypeEnum.SI, None, 0.001, False, "micron", 4)
        add_unit("Robotics - Linear", "Inch", "in_r", "25.4 mm (CNC)", UnitTypeEnum.ENGLISH, "International", 25.4, False, None, 5)
        add_unit("Robotics - Linear", "Millimeter per Second", "mm/s_r", "Robot arm speed", UnitTypeEnum.SI, None, 1, False, None, 10)
        add_unit("Robotics - Linear", "Meter per Second", "m/s_r", "1000 mm/s", UnitTypeEnum.SI, None, 1000, False, None, 11)

        # -----------------------------------------------------------------
        # ANGLE UNITS (General)
        # -----------------------------------------------------------------
        add_unit("Rotational Speed", "Revolution per Hour", "RPH", "Slow rotation", UnitTypeEnum.INTERNATIONAL, None, 0.001745, False, None, 6)
        add_unit("Rotational Speed", "Radian per Minute", "rad/min", "1/60 rad/s", UnitTypeEnum.SI, None, 0.01667, False, None, 7)

        # -----------------------------------------------------------------
        # ADDITIONAL TEXTILE UNITS (Fiber Fineness)
        # -----------------------------------------------------------------
        add_unit("Textile - Yarn Count", "Micronaire", "mic", "Cotton fiber fineness (micrograms per inch)", UnitTypeEnum.INTERNATIONAL, None, 1, False, "µ", 6)
        add_unit("Textile - Yarn Count", "Grains per Yard", "gr/yd", "Traditional yarn weight", UnitTypeEnum.INTERNATIONAL, None, 70.86, False, None, 7)
        
        # Momme (silk weight)
        add_unit("Textile - Fabric Weight", "Momme", "momme", "Silk fabric weight (4.340 g/m²)", UnitTypeEnum.INTERNATIONAL, "Asia", 4.340, False, "mm", 3)
        
        # -----------------------------------------------------------------
        # ADDITIONAL ELECTRICAL POWER UNITS
        # -----------------------------------------------------------------
        add_unit("Electrical Power", "Megawatt", "MW_e", "1e6 W real power", UnitTypeEnum.SI, None, 1000000, False, None, 3)
        add_unit("Electrical Power", "Megavolt-Ampere", "MVA", "1e6 VA apparent", UnitTypeEnum.SI, None, 1000000, False, None, 6)
        add_unit("Electrical Power", "Megavar", "Mvar", "1e6 var reactive", UnitTypeEnum.SI, None, 1000000, False, None, 9)
        
        # -----------------------------------------------------------------
        # ADDITIONAL ELECTRICAL UNITS (Charge, Capacitance, Inductance)
        # -----------------------------------------------------------------
        add_unit("Electrical Current", "Kiloampere", "kA", "1000 A", UnitTypeEnum.SI, None, 1000, False, None, 4)
        
        # Electrical Charge
        add_unit("Electrical Current", "Coulomb", "C_charge", "Ampere-second (charge)", UnitTypeEnum.SI, None, 1, False, "A·s", 5)
        add_unit("Electrical Current", "Ampere-Hour", "Ah_charge", "3600 coulombs", UnitTypeEnum.INTERNATIONAL, None, 3600, False, None, 6)
        add_unit("Electrical Current", "Milliampere-Hour", "mAh_charge", "3.6 coulombs", UnitTypeEnum.INTERNATIONAL, None, 3.6, False, None, 7)
        
        # -----------------------------------------------------------------
        # HARDNESS UNITS (Mechanical Engineering)
        # -----------------------------------------------------------------
        add_unit("Mechanical Stress", "Rockwell Hardness C", "HRC", "Hardness scale for steels", UnitTypeEnum.OTHER, None, 1, False, None, 7)
        add_unit("Mechanical Stress", "Brinell Hardness", "HB", "Hardness for cast iron", UnitTypeEnum.OTHER, None, 1, False, None, 8)
        add_unit("Mechanical Stress", "Vickers Hardness", "HV", "Precise hardness measurement", UnitTypeEnum.OTHER, None, 1, False, None, 9)
        add_unit("Mechanical Stress", "Shore Hardness A", "Shore A", "Elastomer hardness", UnitTypeEnum.OTHER, None, 1, False, None, 10)
        add_unit("Mechanical Stress", "Mohs Hardness", "Mohs", "Mineral hardness (1-10)", UnitTypeEnum.OTHER, None, 1, False, None, 11)
        
        # -----------------------------------------------------------------
        # ADDITIONAL ROBOTICS UNITS (Angular Acceleration)
        # -----------------------------------------------------------------
        add_unit("Robotics - Rotation", "Radian per Second Squared", "rad/s2", "Angular acceleration", UnitTypeEnum.SI, None, 1, False, None, 7)
        add_unit("Robotics - Rotation", "Degree per Second Squared", "deg/s2", "Angular acceleration", UnitTypeEnum.INTERNATIONAL, None, 0.000305, False, None, 8)
        
        # -----------------------------------------------------------------
        # ADDITIONAL VOLUME UNITS
        # -----------------------------------------------------------------
        add_unit("Volume", "Cubic Inch", "in3", "0.000016387 m3", UnitTypeEnum.ENGLISH, "International", 0.000016387, False, "cu in", 14)
        add_unit("Volume", "Cubic Yard", "yd3", "0.764555 m3", UnitTypeEnum.ENGLISH, "International", 0.764555, False, "cu yd", 15)
        add_unit("Volume", "Barrel (Oil)", "bbl", "0.158987 m3 (42 US gallons)", UnitTypeEnum.ENGLISH, "International", 0.158987, False, None, 16)
        add_unit("Volume", "Pint (US)", "pt", "0.000473176 m3", UnitTypeEnum.ENGLISH, "USA", 0.000473176, False, None, 17)
        add_unit("Volume", "Quart (US)", "qt", "0.000946353 m3", UnitTypeEnum.ENGLISH, "USA", 0.000946353, False, None, 18)
        
        # -----------------------------------------------------------------
        # ADDITIONAL POWER UNITS
        # -----------------------------------------------------------------
        add_unit("Power", "Metric Horsepower", "PS", "735.5 W (DIN standard)", UnitTypeEnum.INTERNATIONAL, None, 735.5, False, "hp(M)", 14)
        add_unit("Power", "Ton of Refrigeration", "TR", "3516.85 W (cooling)", UnitTypeEnum.INTERNATIONAL, None, 3516.85, False, None, 15)
        add_unit("Power", "Kilocalorie per Hour", "kcal/h", "1.163 W", UnitTypeEnum.INTERNATIONAL, None, 1.163, False, None, 16)
        
        # -----------------------------------------------------------------
        # ADDITIONAL ENERGY UNITS
        # -----------------------------------------------------------------
        add_unit("Energy", "Electronvolt", "eV", "1.602e-19 J (atomic scale)", UnitTypeEnum.SI, None, 1.602e-19, False, None, 12)
        add_unit("Energy", "Therm", "thm", "105,506,000 J (natural gas)", UnitTypeEnum.ENGLISH, "International", 105506000, False, None, 13)
        add_unit("Energy", "Ton of TNT", "tTNT", "4.184e9 J (explosive energy)", UnitTypeEnum.OTHER, None, 4184000000, False, None, 14)
        
        # -----------------------------------------------------------------
        # ADDITIONAL PRESSURE UNITS
        # -----------------------------------------------------------------
        add_unit("Pressure", "Inches of Mercury", "inHg", "3386.39 Pa", UnitTypeEnum.ENGLISH, "International", 3386.39, False, None, 16)
        add_unit("Pressure", "Feet of Water", "ftH2O", "2988.98 Pa", UnitTypeEnum.ENGLISH, "International", 2988.98, False, None, 17)
        
        # -----------------------------------------------------------------
        # ADDITIONAL FORCE UNITS
        # -----------------------------------------------------------------
        add_unit("Force", "Ounce-Force", "ozf", "0.278014 N", UnitTypeEnum.ENGLISH, "International", 0.278014, False, None, 14)
        add_unit("Force", "Poundal", "pdl", "0.138255 N", UnitTypeEnum.ENGLISH, "International", 0.138255, False, None, 15)
        
        # -----------------------------------------------------------------
        # ADDITIONAL TORQUE UNITS
        # -----------------------------------------------------------------
        add_unit("Torque", "Ounce-Inch", "oz.in", "0.00706155 Nm", UnitTypeEnum.ENGLISH, "International", 0.00706155, False, None, 15)
        add_unit("Torque", "Ounce-Foot", "oz.ft", "0.0847386 Nm", UnitTypeEnum.ENGLISH, "International", 0.0847386, False, None, 16)
        
        # -----------------------------------------------------------------
        # ADDITIONAL LUMINOUS INTENSITY UNITS
        # -----------------------------------------------------------------
        add_unit("Luminous Intensity", "Candela", "cd", "Luminous intensity (base SI)", UnitTypeEnum.SI, None, 1, False, None, 4)
        add_unit("Luminous Intensity", "Lumen per Square Meter", "lm/m2", "Same as lux", UnitTypeEnum.SI, None, 1, False, None, 5)
        
        # -----------------------------------------------------------------
        # ADDITIONAL AREA UNITS
        # -----------------------------------------------------------------
        add_unit("Area", "Square Mile", "mi2", "2,589,988 m2", UnitTypeEnum.ENGLISH, "International", 2589988, False, "sq mi", 13)
        add_unit("Area", "Square Inch", "in2", "0.00064516 m2", UnitTypeEnum.ENGLISH, "International", 0.00064516, False, "sq in", 14)
        
        # -----------------------------------------------------------------
        # ADDITIONAL SPEED UNITS
        # -----------------------------------------------------------------
        add_unit("Speed", "Mach", "Ma", "343 m/s (speed of sound at sea level)", UnitTypeEnum.OTHER, None, 343, False, None, 14)
        add_unit("Speed", "Speed of Light", "c", "299,792,458 m/s", UnitTypeEnum.SI, None, 299792458, False, None, 15)
        
        # -----------------------------------------------------------------
        # ADDITIONAL TEXTILE UNITS (Weaving & Construction)
        # -----------------------------------------------------------------
        add_unit("Textile - Thread", "Courses per Inch", "CPI", "Knitting density (horizontal)", UnitTypeEnum.INTERNATIONAL, None, 1, False, None, 6)
        add_unit("Textile - Thread", "Wales per Inch", "WPI", "Knitting density (vertical)", UnitTypeEnum.INTERNATIONAL, None, 1, False, None, 7)
        
        # -----------------------------------------------------------------
        # ADDITIONAL SHIPPING UNITS
        # -----------------------------------------------------------------
        add_unit("Shipping Container", "53ft Container", "53ft", "53-foot container: 105 m3", UnitTypeEnum.INTERNATIONAL, None, 3.18, False, None, 6)
        add_unit("Shipping Container", "Pallet", "PLT", "Standard pallet space", UnitTypeEnum.INTERNATIONAL, None, 0.04, False, None, 7)
        
        # -----------------------------------------------------------------
        # ADDITIONAL COUNT UNITS
        # -----------------------------------------------------------------
        add_unit("Count", "Thousand", "K_count", "1,000 pieces", UnitTypeEnum.INTERNATIONAL, None, 1000, False, None, 10)
        add_unit("Count", "Million", "M_count", "1,000,000 pieces", UnitTypeEnum.INTERNATIONAL, None, 1000000, False, None, 11)
        
        # -----------------------------------------------------------------
        # ADDITIONAL TEMPERATURE UNITS (for completeness)
        # -----------------------------------------------------------------
        add_unit("Temperature", "Delisle", "De", "Historical temperature scale", UnitTypeEnum.OTHER, None, 1, False, "°De", 5)
        add_unit("Temperature", "Newton", "N_temp", "Historical temperature scale", UnitTypeEnum.OTHER, None, 1, False, "°N", 6)
        add_unit("Temperature", "Réaumur", "Re", "Historical temperature scale", UnitTypeEnum.OTHER, None, 1, False, "°Ré", 7)

        db.commit()

        # Count results
        total_units = db.query(Unit).count()
        total_categories = db.query(UnitCategory).count()
        logger.info(f"Unit Conversion System seeded successfully!")
        logger.info(f"Total: {total_categories} categories, {total_units} units")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding unit conversion system: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_unit_conversion_system()
