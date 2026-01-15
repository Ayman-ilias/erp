"""
Seed data for Settings module
"""

# Color Families (18)
COLOR_FAMILIES = [
    {"color_family": "BLACK", "color_family_code": "BLK", "color_family_code_type": "INTERNAL", "sort_order": 1},
    {"color_family": "WHITE", "color_family_code": "WHT", "color_family_code_type": "INTERNAL", "sort_order": 2},
    {"color_family": "GREY", "color_family_code": "GRY", "color_family_code_type": "INTERNAL", "sort_order": 3},
    {"color_family": "BLUE", "color_family_code": "BLU", "color_family_code_type": "INTERNAL", "sort_order": 4},
    {"color_family": "GREEN", "color_family_code": "GRN", "color_family_code_type": "INTERNAL", "sort_order": 5},
    {"color_family": "RED", "color_family_code": "RED", "color_family_code_type": "INTERNAL", "sort_order": 6},
    {"color_family": "YELLOW", "color_family_code": "YLW", "color_family_code_type": "INTERNAL", "sort_order": 7},
    {"color_family": "ORANGE", "color_family_code": "ORG", "color_family_code_type": "INTERNAL", "sort_order": 8},
    {"color_family": "PINK", "color_family_code": "PNK", "color_family_code_type": "INTERNAL", "sort_order": 9},
    {"color_family": "PURPLE", "color_family_code": "PRP", "color_family_code_type": "INTERNAL", "sort_order": 10},
    {"color_family": "BROWN", "color_family_code": "BRN", "color_family_code_type": "INTERNAL", "sort_order": 11},
    {"color_family": "BEIGE", "color_family_code": "BGE", "color_family_code_type": "INTERNAL", "sort_order": 12},
    {"color_family": "KHAKI", "color_family_code": "KHK", "color_family_code_type": "INTERNAL", "sort_order": 13},
    {"color_family": "METALLIC", "color_family_code": "MTL", "color_family_code_type": "INTERNAL", "sort_order": 14},
    {"color_family": "NEUTRAL", "color_family_code": "NTL", "color_family_code_type": "INTERNAL", "sort_order": 15},
    {"color_family": "MULTI", "color_family_code": "MLT", "color_family_code_type": "INTERNAL", "sort_order": 16},
    {"color_family": "OTHER", "color_family_code": "OTH", "color_family_code_type": "INTERNAL", "sort_order": 17},
    {"color_family": "UNDEFINED", "color_family_code": "UND", "color_family_code_type": "INTERNAL", "sort_order": 18},
]

# Color Values (9)
COLOR_VALUES = [
    {"color_value_code": "VERY LIGHT", "color_value_code_type": "INTENSITY", "sort_order": 1},
    {"color_value_code": "LIGHT", "color_value_code_type": "INTENSITY", "sort_order": 2},
    {"color_value_code": "MEDIUM", "color_value_code_type": "INTENSITY", "sort_order": 3},
    {"color_value_code": "MEDIUM DUSTY", "color_value_code_type": "INTENSITY", "sort_order": 4},
    {"color_value_code": "DUSTY LIGHT", "color_value_code_type": "INTENSITY", "sort_order": 5},
    {"color_value_code": "BRIGHT", "color_value_code_type": "INTENSITY", "sort_order": 6},
    {"color_value_code": "DARK", "color_value_code_type": "INTENSITY", "sort_order": 7},
    {"color_value_code": "VERY DARK", "color_value_code_type": "INTENSITY", "sort_order": 8},
    {"color_value_code": "UNDEFINED", "color_value_code_type": "INTENSITY", "sort_order": 9},
]

# Colors (28) with their family mappings
COLORS = [
    {"color": "BEIGE", "color_family": "BEIGE", "color_code": "BGE", "color_code_type": "INTERNAL"},
    {"color": "BLACK", "color_family": "BLACK", "color_code": "BLK", "color_code_type": "INTERNAL"},
    {"color": "BLUE", "color_family": "BLUE", "color_code": "BLU", "color_code_type": "INTERNAL"},
    {"color": "BLUISH GREEN", "color_family": "GREEN", "color_code": "BGN", "color_code_type": "INTERNAL"},
    {"color": "BROWN", "color_family": "BROWN", "color_code": "BRN", "color_code_type": "INTERNAL"},
    {"color": "GREEN", "color_family": "GREEN", "color_code": "GRN", "color_code_type": "INTERNAL"},
    {"color": "GREY", "color_family": "GREY", "color_code": "GRY", "color_code_type": "INTERNAL"},
    {"color": "KHAKI GREEN", "color_family": "KHAKI", "color_code": "KGN", "color_code_type": "INTERNAL"},
    {"color": "LILAC", "color_family": "PURPLE", "color_code": "LLC", "color_code_type": "INTERNAL"},
    {"color": "MAROON", "color_family": "RED", "color_code": "MRN", "color_code_type": "INTERNAL"},
    {"color": "MOLE", "color_family": "BROWN", "color_code": "MOL", "color_code_type": "INTERNAL"},
    {"color": "NAVY BLUE", "color_family": "BLUE", "color_code": "NVY", "color_code_type": "INTERNAL"},
    {"color": "OFF-WHITE", "color_family": "WHITE", "color_code": "OFW", "color_code_type": "INTERNAL"},
    {"color": "ORANGE", "color_family": "ORANGE", "color_code": "ORG", "color_code_type": "INTERNAL"},
    {"color": "PINK", "color_family": "PINK", "color_code": "PNK", "color_code_type": "INTERNAL"},
    {"color": "PURPLE", "color_family": "PURPLE", "color_code": "PRP", "color_code_type": "INTERNAL"},
    {"color": "RED", "color_family": "RED", "color_code": "RED", "color_code_type": "INTERNAL"},
    {"color": "TURQUOISE", "color_family": "BLUE", "color_code": "TRQ", "color_code_type": "INTERNAL"},
    {"color": "WHITE", "color_family": "WHITE", "color_code": "WHT", "color_code_type": "INTERNAL"},
    {"color": "YELLOW", "color_family": "YELLOW", "color_code": "YLW", "color_code_type": "INTERNAL"},
    {"color": "YELLOWISH GREEN", "color_family": "GREEN", "color_code": "YGN", "color_code_type": "INTERNAL"},
    {"color": "IVORY", "color_family": "WHITE", "color_code": "IVR", "color_code_type": "INTERNAL"},
    {"color": "SILVER", "color_family": "METALLIC", "color_code": "SLV", "color_code_type": "INTERNAL"},
    {"color": "GOLD", "color_family": "METALLIC", "color_code": "GLD", "color_code_type": "INTERNAL"},
    {"color": "METAL", "color_family": "METALLIC", "color_code": "MTL", "color_code_type": "INTERNAL"},
    {"color": "TRANSPARENT", "color_family": "NEUTRAL", "color_code": "TRN", "color_code_type": "INTERNAL"},
    {"color": "MULTI-COLOR", "color_family": "MULTI", "color_code": "MLC", "color_code_type": "INTERNAL"},
    {"color": "UNDEFINED", "color_family": "UNDEFINED", "color_code": "UND", "color_code_type": "INTERNAL"},
]

# UoM Categories with their units (Garment Industry Specific)
UOM_CATEGORIES = [
    {
        "category": "Length",
        "uom_id": "LEN",
        "description": "Linear measurements for fabric rolls, trims, ribbons",
        "icon": "Ruler",
        "industry_use": "Fabric rolls, ribbons, trims, piping, zipper length",
        "sort_order": 1,
        "units": [
            {"name": "Meter", "symbol": "m", "factor": 1.0, "is_base": True, "is_si_unit": True, "display_name": "Meter (m)", "common_usage": "Fabric measurement (metric)", "decimal_places": 2, "sort_order": 1},
            {"name": "Centimeter", "symbol": "cm", "factor": 0.01, "is_base": False, "is_si_unit": True, "display_name": "Centimeter (cm)", "common_usage": "Button size, small measurements", "decimal_places": 1, "sort_order": 2},
            {"name": "Millimeter", "symbol": "mm", "factor": 0.001, "is_base": False, "is_si_unit": True, "display_name": "Millimeter (mm)", "common_usage": "Needle gauge, fine details", "decimal_places": 0, "sort_order": 3},
            {"name": "Inch", "symbol": "in", "factor": 0.0254, "is_base": False, "is_si_unit": False, "display_name": "Inch (in)", "common_usage": "Button size, zipper length (US)", "decimal_places": 2, "sort_order": 4},
            {"name": "Foot", "symbol": "ft", "factor": 0.3048, "is_base": False, "is_si_unit": False, "display_name": "Foot (ft)", "common_usage": "Roll length (US)", "decimal_places": 2, "sort_order": 5},
            {"name": "Yard", "symbol": "yd", "factor": 0.9144, "is_base": False, "is_si_unit": False, "display_name": "Yard (yd)", "common_usage": "Fabric measurement (US)", "decimal_places": 2, "sort_order": 6},
            {"name": "Kilometer", "symbol": "km", "factor": 1000.0, "is_base": False, "is_si_unit": True, "display_name": "Kilometer (km)", "common_usage": "Bulk thread length", "decimal_places": 3, "sort_order": 7},
        ]
    },
    {
        "category": "Weight",
        "uom_id": "WGT",
        "description": "Mass measurements for yarn, fabric, materials",
        "icon": "Scale",
        "industry_use": "Yarn weight, fabric weight, chemical dosing, raw materials",
        "sort_order": 2,
        "units": [
            {"name": "Kilogram", "symbol": "kg", "factor": 1.0, "is_base": True, "is_si_unit": True, "display_name": "Kilogram (kg)", "common_usage": "Yarn, fabric, bulk materials", "decimal_places": 3, "sort_order": 1},
            {"name": "Gram", "symbol": "g", "factor": 0.001, "is_base": False, "is_si_unit": True, "display_name": "Gram (g)", "common_usage": "GSM calculations, small quantities", "decimal_places": 2, "sort_order": 2},
            {"name": "Milligram", "symbol": "mg", "factor": 0.000001, "is_base": False, "is_si_unit": True, "display_name": "Milligram (mg)", "common_usage": "Chemical dosing", "decimal_places": 0, "sort_order": 3},
            {"name": "Pound", "symbol": "lb", "factor": 0.453592, "is_base": False, "is_si_unit": False, "display_name": "Pound (lb)", "common_usage": "Yarn hanks (US)", "decimal_places": 2, "sort_order": 4},
            {"name": "Ounce", "symbol": "oz", "factor": 0.0283495, "is_base": False, "is_si_unit": False, "display_name": "Ounce (oz)", "common_usage": "Fabric weight (US)", "decimal_places": 2, "sort_order": 5},
            {"name": "Metric Ton", "symbol": "MT", "factor": 1000.0, "is_base": False, "is_si_unit": True, "display_name": "Metric Ton (MT)", "common_usage": "Bulk orders, raw cotton", "decimal_places": 3, "sort_order": 6},
        ]
    },
    {
        "category": "Quantity",
        "uom_id": "QTY",
        "description": "Counting units for items, trims, accessories",
        "icon": "Hash",
        "industry_use": "Buttons, zippers, labels, hangtags, garments, accessories",
        "sort_order": 3,
        "units": [
            {"name": "Piece", "symbol": "pcs", "factor": 1.0, "is_base": True, "is_si_unit": False, "display_name": "Piece (pcs)", "common_usage": "Individual items, garments", "decimal_places": 0, "sort_order": 1},
            {"name": "Dozen", "symbol": "dz", "factor": 12.0, "is_base": False, "is_si_unit": False, "display_name": "Dozen (dz)", "common_usage": "Buttons, snaps, small items", "decimal_places": 2, "sort_order": 2},
            {"name": "Gross", "symbol": "gr", "factor": 144.0, "is_base": False, "is_si_unit": False, "display_name": "Gross (gr)", "common_usage": "Bulk buttons, beads, rivets", "decimal_places": 2, "sort_order": 3},
            {"name": "Great Gross", "symbol": "gg", "factor": 1728.0, "is_base": False, "is_si_unit": False, "display_name": "Great Gross (gg)", "common_usage": "Very large quantities", "decimal_places": 2, "sort_order": 4},
            {"name": "Pair", "symbol": "pr", "factor": 2.0, "is_base": False, "is_si_unit": False, "display_name": "Pair (pr)", "common_usage": "Cufflinks, socks, gloves", "decimal_places": 0, "sort_order": 5},
            {"name": "Set", "symbol": "set", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Set", "common_usage": "Button sets, trim kits", "decimal_places": 0, "sort_order": 6},
            {"name": "Pack", "symbol": "pk", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Pack (pk)", "common_usage": "Packaged items", "decimal_places": 0, "sort_order": 7},
        ]
    },
    {
        "category": "Textile Density",
        "uom_id": "TXD",
        "description": "Fabric weight and density specifications",
        "icon": "Layers",
        "industry_use": "Fabric GSM, denim weight, fabric specifications",
        "sort_order": 4,
        "units": [
            {"name": "GSM", "symbol": "gsm", "factor": 1.0, "is_base": True, "is_si_unit": False, "display_name": "Grams per Square Meter (GSM)", "common_usage": "Fabric weight specification", "decimal_places": 1, "sort_order": 1},
            {"name": "OZ/YD²", "symbol": "oz/yd²", "factor": 33.906, "is_base": False, "is_si_unit": False, "display_name": "Ounces per Square Yard (oz/yd²)", "common_usage": "Denim, heavy fabrics (US)", "decimal_places": 2, "sort_order": 2},
            {"name": "G/M²", "symbol": "g/m²", "factor": 1.0, "is_base": False, "is_si_unit": True, "display_name": "Grams per Square Meter (g/m²)", "common_usage": "Same as GSM, alternate notation", "decimal_places": 1, "sort_order": 3},
        ]
    },
    {
        "category": "Yarn Count",
        "uom_id": "YCT",
        "description": "Yarn fineness and count measurements",
        "icon": "Waypoints",
        "industry_use": "Yarn specifications, thread count, fiber fineness",
        "sort_order": 5,
        "units": [
            {"name": "Denier", "symbol": "den", "factor": 1.0, "is_base": True, "is_si_unit": False, "display_name": "Denier (den)", "common_usage": "Filament yarns, synthetic fibers", "decimal_places": 1, "sort_order": 1},
            {"name": "Tex", "symbol": "tex", "factor": 0.1111, "is_base": False, "is_si_unit": True, "display_name": "Tex", "common_usage": "Universal yarn count (ISO)", "decimal_places": 2, "sort_order": 2},
            {"name": "Decitex", "symbol": "dtex", "factor": 0.01111, "is_base": False, "is_si_unit": True, "display_name": "Decitex (dtex)", "common_usage": "Fine yarns", "decimal_places": 2, "sort_order": 3},
            {"name": "Ne (English Count)", "symbol": "Ne", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Ne (English Count)", "common_usage": "Cotton yarn count", "decimal_places": 1, "sort_order": 4},
            {"name": "Nm (Metric Count)", "symbol": "Nm", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Nm (Metric Count)", "common_usage": "Worsted, wool yarn", "decimal_places": 1, "sort_order": 5},
        ]
    },
    {
        "category": "Packaging",
        "uom_id": "PKG",
        "description": "Packaging and shipping units",
        "icon": "Package",
        "industry_use": "Thread cones, fabric rolls, cartons, shipping",
        "sort_order": 6,
        "units": [
            {"name": "Roll", "symbol": "roll", "factor": 1.0, "is_base": True, "is_si_unit": False, "display_name": "Roll", "common_usage": "Fabric rolls, ribbon rolls", "decimal_places": 0, "sort_order": 1},
            {"name": "Cone", "symbol": "cone", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Cone", "common_usage": "Thread, sewing yarn", "decimal_places": 0, "sort_order": 2},
            {"name": "Spool", "symbol": "spool", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Spool", "common_usage": "Small thread packages", "decimal_places": 0, "sort_order": 3},
            {"name": "Hank", "symbol": "hank", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Hank", "common_usage": "Yarn hanks", "decimal_places": 0, "sort_order": 4},
            {"name": "Bale", "symbol": "bale", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Bale", "common_usage": "Raw cotton, fiber bales", "decimal_places": 0, "sort_order": 5},
            {"name": "Carton", "symbol": "ctn", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Carton (ctn)", "common_usage": "Finished goods packaging", "decimal_places": 0, "sort_order": 6},
            {"name": "Box", "symbol": "box", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Box", "common_usage": "Small item packaging", "decimal_places": 0, "sort_order": 7},
            {"name": "Bundle", "symbol": "bdl", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Bundle (bdl)", "common_usage": "Cut panels, fabric bundles", "decimal_places": 0, "sort_order": 8},
            {"name": "Bag", "symbol": "bag", "factor": 1.0, "is_base": False, "is_si_unit": False, "display_name": "Bag", "common_usage": "Poly bags, zipper bags", "decimal_places": 0, "sort_order": 9},
        ]
    },
    {
        "category": "Area",
        "uom_id": "AREA",
        "description": "Surface area measurements",
        "icon": "Square",
        "industry_use": "Leather hides, fabric yardage, floor space",
        "sort_order": 7,
        "units": [
            {"name": "Square Meter", "symbol": "m²", "factor": 1.0, "is_base": True, "is_si_unit": True, "display_name": "Square Meter (m²)", "common_usage": "Fabric area (metric)", "decimal_places": 2, "sort_order": 1},
            {"name": "Square Centimeter", "symbol": "cm²", "factor": 0.0001, "is_base": False, "is_si_unit": True, "display_name": "Square Centimeter (cm²)", "common_usage": "Small surface areas", "decimal_places": 2, "sort_order": 2},
            {"name": "Square Foot", "symbol": "ft²", "factor": 0.092903, "is_base": False, "is_si_unit": False, "display_name": "Square Foot (ft²)", "common_usage": "Leather hides (US)", "decimal_places": 2, "sort_order": 3},
            {"name": "Square Yard", "symbol": "yd²", "factor": 0.836127, "is_base": False, "is_si_unit": False, "display_name": "Square Yard (yd²)", "common_usage": "Fabric area (US)", "decimal_places": 2, "sort_order": 4},
            {"name": "Square Inch", "symbol": "in²", "factor": 0.00064516, "is_base": False, "is_si_unit": False, "display_name": "Square Inch (in²)", "common_usage": "Small areas, patches", "decimal_places": 2, "sort_order": 5},
        ]
    },
    {
        "category": "Volume",
        "uom_id": "VOL",
        "description": "Liquid measurements for dyes, chemicals",
        "icon": "Beaker",
        "industry_use": "Dyes, chemicals, finishing agents, washing",
        "sort_order": 8,
        "units": [
            {"name": "Liter", "symbol": "L", "factor": 1.0, "is_base": True, "is_si_unit": True, "display_name": "Liter (L)", "common_usage": "Dye solutions, chemicals", "decimal_places": 2, "sort_order": 1},
            {"name": "Milliliter", "symbol": "mL", "factor": 0.001, "is_base": False, "is_si_unit": True, "display_name": "Milliliter (mL)", "common_usage": "Small chemical dosing", "decimal_places": 1, "sort_order": 2},
            {"name": "Cubic Meter", "symbol": "m³", "factor": 1000.0, "is_base": False, "is_si_unit": True, "display_name": "Cubic Meter (m³)", "common_usage": "Large tanks, shipping volume", "decimal_places": 3, "sort_order": 3},
            {"name": "Gallon (US)", "symbol": "gal", "factor": 3.78541, "is_base": False, "is_si_unit": False, "display_name": "Gallon (gal)", "common_usage": "Chemical drums (US)", "decimal_places": 2, "sort_order": 4},
        ]
    },
    {
        "category": "Time",
        "uom_id": "TIME",
        "description": "Time measurements for labor, SMV",
        "icon": "Clock",
        "industry_use": "SMV calculations, production time, labor hours",
        "sort_order": 9,
        "units": [
            {"name": "Minute", "symbol": "min", "factor": 1.0, "is_base": True, "is_si_unit": False, "display_name": "Minute (min)", "common_usage": "SMV, operation time", "decimal_places": 2, "sort_order": 1},
            {"name": "Second", "symbol": "sec", "factor": 0.0166667, "is_base": False, "is_si_unit": True, "display_name": "Second (sec)", "common_usage": "Precise timing", "decimal_places": 1, "sort_order": 2},
            {"name": "Hour", "symbol": "hr", "factor": 60.0, "is_base": False, "is_si_unit": False, "display_name": "Hour (hr)", "common_usage": "Labor hours, shift time", "decimal_places": 2, "sort_order": 3},
            {"name": "Day", "symbol": "day", "factor": 1440.0, "is_base": False, "is_si_unit": False, "display_name": "Day", "common_usage": "Lead time, production days", "decimal_places": 1, "sort_order": 4},
        ]
    },
]

# Countries (ISO 3166-1)
COUNTRIES = [
    {"country_id": "AF", "country_name": "Afghanistan", "international_country_code": "AFG", "international_dialing_number": "+93"},
    {"country_id": "AL", "country_name": "Albania", "international_country_code": "ALB", "international_dialing_number": "+355"},
    {"country_id": "DZ", "country_name": "Algeria", "international_country_code": "DZA", "international_dialing_number": "+213"},
    {"country_id": "AU", "country_name": "Australia", "international_country_code": "AUS", "international_dialing_number": "+61"},
    {"country_id": "AT", "country_name": "Austria", "international_country_code": "AUT", "international_dialing_number": "+43"},
    {"country_id": "BD", "country_name": "Bangladesh", "international_country_code": "BGD", "international_dialing_number": "+880"},
    {"country_id": "BE", "country_name": "Belgium", "international_country_code": "BEL", "international_dialing_number": "+32"},
    {"country_id": "BR", "country_name": "Brazil", "international_country_code": "BRA", "international_dialing_number": "+55"},
    {"country_id": "KH", "country_name": "Cambodia", "international_country_code": "KHM", "international_dialing_number": "+855"},
    {"country_id": "CA", "country_name": "Canada", "international_country_code": "CAN", "international_dialing_number": "+1"},
    {"country_id": "CN", "country_name": "China", "international_country_code": "CHN", "international_dialing_number": "+86"},
    {"country_id": "CO", "country_name": "Colombia", "international_country_code": "COL", "international_dialing_number": "+57"},
    {"country_id": "CZ", "country_name": "Czech Republic", "international_country_code": "CZE", "international_dialing_number": "+420"},
    {"country_id": "DK", "country_name": "Denmark", "international_country_code": "DNK", "international_dialing_number": "+45"},
    {"country_id": "EG", "country_name": "Egypt", "international_country_code": "EGY", "international_dialing_number": "+20"},
    {"country_id": "ET", "country_name": "Ethiopia", "international_country_code": "ETH", "international_dialing_number": "+251"},
    {"country_id": "FI", "country_name": "Finland", "international_country_code": "FIN", "international_dialing_number": "+358"},
    {"country_id": "FR", "country_name": "France", "international_country_code": "FRA", "international_dialing_number": "+33"},
    {"country_id": "DE", "country_name": "Germany", "international_country_code": "DEU", "international_dialing_number": "+49"},
    {"country_id": "GR", "country_name": "Greece", "international_country_code": "GRC", "international_dialing_number": "+30"},
    {"country_id": "HK", "country_name": "Hong Kong", "international_country_code": "HKG", "international_dialing_number": "+852"},
    {"country_id": "IN", "country_name": "India", "international_country_code": "IND", "international_dialing_number": "+91"},
    {"country_id": "ID", "country_name": "Indonesia", "international_country_code": "IDN", "international_dialing_number": "+62"},
    {"country_id": "IR", "country_name": "Iran", "international_country_code": "IRN", "international_dialing_number": "+98"},
    {"country_id": "IQ", "country_name": "Iraq", "international_country_code": "IRQ", "international_dialing_number": "+964"},
    {"country_id": "IE", "country_name": "Ireland", "international_country_code": "IRL", "international_dialing_number": "+353"},
    {"country_id": "IL", "country_name": "Israel", "international_country_code": "ISR", "international_dialing_number": "+972"},
    {"country_id": "IT", "country_name": "Italy", "international_country_code": "ITA", "international_dialing_number": "+39"},
    {"country_id": "JP", "country_name": "Japan", "international_country_code": "JPN", "international_dialing_number": "+81"},
    {"country_id": "JO", "country_name": "Jordan", "international_country_code": "JOR", "international_dialing_number": "+962"},
    {"country_id": "KE", "country_name": "Kenya", "international_country_code": "KEN", "international_dialing_number": "+254"},
    {"country_id": "KR", "country_name": "South Korea", "international_country_code": "KOR", "international_dialing_number": "+82"},
    {"country_id": "KW", "country_name": "Kuwait", "international_country_code": "KWT", "international_dialing_number": "+965"},
    {"country_id": "LB", "country_name": "Lebanon", "international_country_code": "LBN", "international_dialing_number": "+961"},
    {"country_id": "LY", "country_name": "Libya", "international_country_code": "LBY", "international_dialing_number": "+218"},
    {"country_id": "MY", "country_name": "Malaysia", "international_country_code": "MYS", "international_dialing_number": "+60"},
    {"country_id": "MV", "country_name": "Maldives", "international_country_code": "MDV", "international_dialing_number": "+960"},
    {"country_id": "MX", "country_name": "Mexico", "international_country_code": "MEX", "international_dialing_number": "+52"},
    {"country_id": "MA", "country_name": "Morocco", "international_country_code": "MAR", "international_dialing_number": "+212"},
    {"country_id": "MM", "country_name": "Myanmar", "international_country_code": "MMR", "international_dialing_number": "+95"},
    {"country_id": "NP", "country_name": "Nepal", "international_country_code": "NPL", "international_dialing_number": "+977"},
    {"country_id": "NL", "country_name": "Netherlands", "international_country_code": "NLD", "international_dialing_number": "+31"},
    {"country_id": "NZ", "country_name": "New Zealand", "international_country_code": "NZL", "international_dialing_number": "+64"},
    {"country_id": "NG", "country_name": "Nigeria", "international_country_code": "NGA", "international_dialing_number": "+234"},
    {"country_id": "NO", "country_name": "Norway", "international_country_code": "NOR", "international_dialing_number": "+47"},
    {"country_id": "OM", "country_name": "Oman", "international_country_code": "OMN", "international_dialing_number": "+968"},
    {"country_id": "PK", "country_name": "Pakistan", "international_country_code": "PAK", "international_dialing_number": "+92"},
    {"country_id": "PH", "country_name": "Philippines", "international_country_code": "PHL", "international_dialing_number": "+63"},
    {"country_id": "PL", "country_name": "Poland", "international_country_code": "POL", "international_dialing_number": "+48"},
    {"country_id": "PT", "country_name": "Portugal", "international_country_code": "PRT", "international_dialing_number": "+351"},
    {"country_id": "QA", "country_name": "Qatar", "international_country_code": "QAT", "international_dialing_number": "+974"},
    {"country_id": "RO", "country_name": "Romania", "international_country_code": "ROU", "international_dialing_number": "+40"},
    {"country_id": "RU", "country_name": "Russia", "international_country_code": "RUS", "international_dialing_number": "+7"},
    {"country_id": "SA", "country_name": "Saudi Arabia", "international_country_code": "SAU", "international_dialing_number": "+966"},
    {"country_id": "SG", "country_name": "Singapore", "international_country_code": "SGP", "international_dialing_number": "+65"},
    {"country_id": "ZA", "country_name": "South Africa", "international_country_code": "ZAF", "international_dialing_number": "+27"},
    {"country_id": "ES", "country_name": "Spain", "international_country_code": "ESP", "international_dialing_number": "+34"},
    {"country_id": "LK", "country_name": "Sri Lanka", "international_country_code": "LKA", "international_dialing_number": "+94"},
    {"country_id": "SE", "country_name": "Sweden", "international_country_code": "SWE", "international_dialing_number": "+46"},
    {"country_id": "CH", "country_name": "Switzerland", "international_country_code": "CHE", "international_dialing_number": "+41"},
    {"country_id": "TW", "country_name": "Taiwan", "international_country_code": "TWN", "international_dialing_number": "+886"},
    {"country_id": "TH", "country_name": "Thailand", "international_country_code": "THA", "international_dialing_number": "+66"},
    {"country_id": "TR", "country_name": "Turkey", "international_country_code": "TUR", "international_dialing_number": "+90"},
    {"country_id": "UA", "country_name": "Ukraine", "international_country_code": "UKR", "international_dialing_number": "+380"},
    {"country_id": "AE", "country_name": "United Arab Emirates", "international_country_code": "ARE", "international_dialing_number": "+971"},
    {"country_id": "GB", "country_name": "United Kingdom", "international_country_code": "GBR", "international_dialing_number": "+44"},
    {"country_id": "US", "country_name": "United States", "international_country_code": "USA", "international_dialing_number": "+1"},
    {"country_id": "UZ", "country_name": "Uzbekistan", "international_country_code": "UZB", "international_dialing_number": "+998"},
    {"country_id": "VN", "country_name": "Vietnam", "international_country_code": "VNM", "international_dialing_number": "+84"},
    {"country_id": "YE", "country_name": "Yemen", "international_country_code": "YEM", "international_dialing_number": "+967"},
]

# Major Cities for key garment/textile countries
CITIES = [
    # Bangladesh
    {"city_id": "BD-DAC", "city_name": "Dhaka", "country_id": "BD", "state_province": "Dhaka Division"},
    {"city_id": "BD-CGP", "city_name": "Chittagong", "country_id": "BD", "state_province": "Chittagong Division"},
    {"city_id": "BD-NAR", "city_name": "Narayanganj", "country_id": "BD", "state_province": "Dhaka Division"},
    {"city_id": "BD-GAZ", "city_name": "Gazipur", "country_id": "BD", "state_province": "Dhaka Division"},
    {"city_id": "BD-KHL", "city_name": "Khulna", "country_id": "BD", "state_province": "Khulna Division"},
    # China
    {"city_id": "CN-SHA", "city_name": "Shanghai", "country_id": "CN", "state_province": "Shanghai"},
    {"city_id": "CN-GUA", "city_name": "Guangzhou", "country_id": "CN", "state_province": "Guangdong"},
    {"city_id": "CN-SHE", "city_name": "Shenzhen", "country_id": "CN", "state_province": "Guangdong"},
    {"city_id": "CN-NIN", "city_name": "Ningbo", "country_id": "CN", "state_province": "Zhejiang"},
    {"city_id": "CN-QIN", "city_name": "Qingdao", "country_id": "CN", "state_province": "Shandong"},
    # India
    {"city_id": "IN-BOM", "city_name": "Mumbai", "country_id": "IN", "state_province": "Maharashtra"},
    {"city_id": "IN-DEL", "city_name": "Delhi", "country_id": "IN", "state_province": "Delhi"},
    {"city_id": "IN-TIR", "city_name": "Tirupur", "country_id": "IN", "state_province": "Tamil Nadu"},
    {"city_id": "IN-CHE", "city_name": "Chennai", "country_id": "IN", "state_province": "Tamil Nadu"},
    {"city_id": "IN-KOL", "city_name": "Kolkata", "country_id": "IN", "state_province": "West Bengal"},
    # Vietnam
    {"city_id": "VN-SGN", "city_name": "Ho Chi Minh City", "country_id": "VN", "state_province": "Ho Chi Minh"},
    {"city_id": "VN-HAN", "city_name": "Hanoi", "country_id": "VN", "state_province": "Hanoi"},
    {"city_id": "VN-HPH", "city_name": "Hai Phong", "country_id": "VN", "state_province": "Hai Phong"},
    # Turkey
    {"city_id": "TR-IST", "city_name": "Istanbul", "country_id": "TR", "state_province": "Istanbul"},
    {"city_id": "TR-IZM", "city_name": "Izmir", "country_id": "TR", "state_province": "Izmir"},
    # USA
    {"city_id": "US-NYC", "city_name": "New York", "country_id": "US", "state_province": "New York"},
    {"city_id": "US-LAX", "city_name": "Los Angeles", "country_id": "US", "state_province": "California"},
    {"city_id": "US-CHI", "city_name": "Chicago", "country_id": "US", "state_province": "Illinois"},
    # UK
    {"city_id": "GB-LON", "city_name": "London", "country_id": "GB", "state_province": "England"},
    {"city_id": "GB-MAN", "city_name": "Manchester", "country_id": "GB", "state_province": "England"},
    # Germany
    {"city_id": "DE-HAM", "city_name": "Hamburg", "country_id": "DE", "state_province": "Hamburg"},
    {"city_id": "DE-FRA", "city_name": "Frankfurt", "country_id": "DE", "state_province": "Hesse"},
    # Netherlands
    {"city_id": "NL-RTM", "city_name": "Rotterdam", "country_id": "NL", "state_province": "South Holland"},
    {"city_id": "NL-AMS", "city_name": "Amsterdam", "country_id": "NL", "state_province": "North Holland"},
    # Spain
    {"city_id": "ES-BCN", "city_name": "Barcelona", "country_id": "ES", "state_province": "Catalonia"},
    {"city_id": "ES-MAD", "city_name": "Madrid", "country_id": "ES", "state_province": "Madrid"},
]

# Major Ports (UN/LOCODE)
PORTS = [
    # Bangladesh
    {"locode": "BDCGP", "port_name": "Chittagong", "country_id": "BD", "city_id": "BD-CGP", "function": "1234----", "status": "AI"},
    {"locode": "BDMGL", "port_name": "Mongla", "country_id": "BD", "city_id": None, "function": "1-------", "status": "AI"},
    # China
    {"locode": "CNSHA", "port_name": "Shanghai", "country_id": "CN", "city_id": "CN-SHA", "function": "12345---", "status": "AI"},
    {"locode": "CNNBO", "port_name": "Ningbo", "country_id": "CN", "city_id": "CN-NIN", "function": "1234----", "status": "AI"},
    {"locode": "CNSZX", "port_name": "Shenzhen", "country_id": "CN", "city_id": "CN-SHE", "function": "1234----", "status": "AI"},
    {"locode": "CNCAN", "port_name": "Guangzhou (Nansha)", "country_id": "CN", "city_id": "CN-GUA", "function": "1234----", "status": "AI"},
    {"locode": "CNTAO", "port_name": "Qingdao", "country_id": "CN", "city_id": "CN-QIN", "function": "1234----", "status": "AI"},
    {"locode": "CNXMN", "port_name": "Xiamen", "country_id": "CN", "city_id": None, "function": "1234----", "status": "AI"},
    # India
    {"locode": "INNSA", "port_name": "Nhava Sheva (JNPT)", "country_id": "IN", "city_id": "IN-BOM", "function": "1234----", "status": "AI"},
    {"locode": "INMAA", "port_name": "Chennai", "country_id": "IN", "city_id": "IN-CHE", "function": "1234----", "status": "AI"},
    {"locode": "INCCU", "port_name": "Kolkata", "country_id": "IN", "city_id": "IN-KOL", "function": "1234----", "status": "AI"},
    {"locode": "INTUT", "port_name": "Tuticorin", "country_id": "IN", "city_id": None, "function": "1234----", "status": "AI"},
    # Vietnam
    {"locode": "VNSGN", "port_name": "Ho Chi Minh (Cat Lai)", "country_id": "VN", "city_id": "VN-SGN", "function": "1234----", "status": "AI"},
    {"locode": "VNHPH", "port_name": "Hai Phong", "country_id": "VN", "city_id": "VN-HPH", "function": "1234----", "status": "AI"},
    # Turkey
    {"locode": "TRIST", "port_name": "Istanbul (Ambarli)", "country_id": "TR", "city_id": "TR-IST", "function": "1234----", "status": "AI"},
    {"locode": "TRIZM", "port_name": "Izmir (Alsancak)", "country_id": "TR", "city_id": "TR-IZM", "function": "1234----", "status": "AI"},
    {"locode": "TRMER", "port_name": "Mersin", "country_id": "TR", "city_id": None, "function": "1234----", "status": "AI"},
    # USA
    {"locode": "USNYC", "port_name": "New York/New Jersey", "country_id": "US", "city_id": "US-NYC", "function": "12345---", "status": "AI"},
    {"locode": "USLAX", "port_name": "Los Angeles", "country_id": "US", "city_id": "US-LAX", "function": "12345---", "status": "AI"},
    {"locode": "USLGB", "port_name": "Long Beach", "country_id": "US", "city_id": "US-LAX", "function": "1234----", "status": "AI"},
    {"locode": "USSAV", "port_name": "Savannah", "country_id": "US", "city_id": None, "function": "1234----", "status": "AI"},
    # UK
    {"locode": "GBFXT", "port_name": "Felixstowe", "country_id": "GB", "city_id": None, "function": "1234----", "status": "AI"},
    {"locode": "GBSOU", "port_name": "Southampton", "country_id": "GB", "city_id": None, "function": "1234----", "status": "AI"},
    {"locode": "GBLON", "port_name": "London Gateway", "country_id": "GB", "city_id": "GB-LON", "function": "1234----", "status": "AI"},
    # Germany
    {"locode": "DEHAM", "port_name": "Hamburg", "country_id": "DE", "city_id": "DE-HAM", "function": "12345---", "status": "AI"},
    {"locode": "DEBRE", "port_name": "Bremerhaven", "country_id": "DE", "city_id": None, "function": "1234----", "status": "AI"},
    # Netherlands
    {"locode": "NLRTM", "port_name": "Rotterdam", "country_id": "NL", "city_id": "NL-RTM", "function": "12345---", "status": "AI"},
    # Belgium
    {"locode": "BEANR", "port_name": "Antwerp", "country_id": "BE", "city_id": None, "function": "12345---", "status": "AI"},
    # Spain
    {"locode": "ESBCN", "port_name": "Barcelona", "country_id": "ES", "city_id": "ES-BCN", "function": "1234----", "status": "AI"},
    {"locode": "ESVAL", "port_name": "Valencia", "country_id": "ES", "city_id": None, "function": "1234----", "status": "AI"},
    # Singapore
    {"locode": "SGSIN", "port_name": "Singapore", "country_id": "SG", "city_id": None, "function": "12345---", "status": "AI"},
    # Malaysia
    {"locode": "MYPKG", "port_name": "Port Klang", "country_id": "MY", "city_id": None, "function": "1234----", "status": "AI"},
    # UAE
    {"locode": "AEJEA", "port_name": "Jebel Ali", "country_id": "AE", "city_id": None, "function": "1234----", "status": "AI"},
    # Sri Lanka
    {"locode": "LKCMB", "port_name": "Colombo", "country_id": "LK", "city_id": None, "function": "1234----", "status": "AI"},
    # Pakistan
    {"locode": "PKKHI", "port_name": "Karachi", "country_id": "PK", "city_id": None, "function": "1234----", "status": "AI"},
]
