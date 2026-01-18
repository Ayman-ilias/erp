"""
Seed Size & Color Master Data
Redesigned for new schema with:
- Universal Colors (Pantone/TCX/RGB/Hex)
- H&M Colors (separate table)
- Garment Types with Measurement Specs
- Size Master with Measurements
"""

import logging
from sqlalchemy.orm import Session
from core.database import SessionLocalSizeColor
from modules.sizecolor.models.sizecolor import (
    # New models
    UniversalColor, HMColorGroup, HMColor,
    GarmentType, GarmentMeasurementSpec,
    SizeMaster, SizeMeasurement,
    # Enums
    ColorFamilyEnum, ColorTypeEnum, ColorValueEnum, FinishTypeEnum,
    GenderEnum, FitTypeEnum, AgeGroupEnum
)

logger = logging.getLogger(__name__)


def seed_sizecolor_data():
    """Seed initial size and color data with new schema"""
    db = SessionLocalSizeColor()
    try:
        # Check if data already exists
        existing_garment_types = db.query(GarmentType).count()
        existing_colors = db.query(UniversalColor).count()
        existing_hm_groups = db.query(HMColorGroup).count()

        if existing_garment_types > 0 and existing_colors > 0:
            logger.info("Size & Color data already seeded, skipping...")
            return

        logger.info("Seeding Size & Color Master data (new schema)...")

        # =================================================================
        # STEP 1: GARMENT TYPES with MEASUREMENT SPECS
        # =================================================================
        garment_types_data = [
            {
                "code": "SWT",
                "name": "Sweater",
                "category": "Tops",
                "display_order": 1,
                "measurements": [
                    ("Chest", "CHEST", "Full chest measurement at underarm", True, 1),
                    ("Waist", "WAIST", "Natural waist measurement", True, 2),
                    ("Hip", "HIP", "Hip measurement at widest point", True, 3),
                    ("Sleeve Length", "SLEEVE", "From shoulder point to cuff", True, 4),
                    ("Shoulder Width", "SHOULDER", "Across shoulders seam to seam", True, 5),
                    ("Body Length", "LENGTH", "From HPS (High Point Shoulder) to hem", True, 6),
                    ("Armhole", "ARMHOLE", "Armhole circumference", False, 7),
                    ("Neck Width", "NECK_W", "Neck opening width", False, 8),
                    ("Cuff Width", "CUFF", "Cuff opening", False, 9),
                ]
            },
            {
                "code": "TSH",
                "name": "T-Shirt",
                "category": "Tops",
                "display_order": 2,
                "measurements": [
                    ("Chest", "CHEST", "Full chest measurement at underarm", True, 1),
                    ("Waist", "WAIST", "Natural waist measurement", True, 2),
                    ("Hip", "HIP", "Hip measurement at widest point", True, 3),
                    ("Sleeve Length", "SLEEVE", "From shoulder to sleeve hem", True, 4),
                    ("Shoulder Width", "SHOULDER", "Across shoulders seam to seam", True, 5),
                    ("Body Length", "LENGTH", "From HPS to hem", True, 6),
                    ("Neck Opening", "NECK_O", "Neck rib stretched", False, 7),
                ]
            },
            {
                "code": "PLO",
                "name": "Polo Shirt",
                "category": "Tops",
                "display_order": 3,
                "measurements": [
                    ("Chest", "CHEST", "Full chest measurement", True, 1),
                    ("Waist", "WAIST", "Natural waist", True, 2),
                    ("Hip", "HIP", "Hip measurement", True, 3),
                    ("Sleeve Length", "SLEEVE", "Shoulder to sleeve hem", True, 4),
                    ("Shoulder Width", "SHOULDER", "Across shoulders", True, 5),
                    ("Body Length", "LENGTH", "HPS to hem", True, 6),
                    ("Placket Length", "PLACKET", "Collar to end of placket", True, 7),
                    ("Collar Stand", "COLLAR", "Collar height", False, 8),
                ]
            },
            {
                "code": "HOD",
                "name": "Hoodie",
                "category": "Tops",
                "display_order": 4,
                "measurements": [
                    ("Chest", "CHEST", "Full chest measurement", True, 1),
                    ("Waist", "WAIST", "Natural waist", True, 2),
                    ("Hip", "HIP", "Hip measurement", True, 3),
                    ("Sleeve Length", "SLEEVE", "From shoulder to cuff", True, 4),
                    ("Shoulder Width", "SHOULDER", "Across shoulders", True, 5),
                    ("Body Length", "LENGTH", "From HPS to hem", True, 6),
                    ("Hood Height", "HOOD_H", "Hood height from neckline", True, 7),
                    ("Hood Width", "HOOD_W", "Hood width when flat", True, 8),
                    ("Kangaroo Pocket Width", "POCKET", "Pocket width", False, 9),
                ]
            },
            {
                "code": "JKT",
                "name": "Jacket",
                "category": "Outerwear",
                "display_order": 5,
                "measurements": [
                    ("Chest", "CHEST", "Full chest measurement", True, 1),
                    ("Waist", "WAIST", "Natural waist", True, 2),
                    ("Hip", "HIP", "Hip measurement", True, 3),
                    ("Sleeve Length", "SLEEVE", "From shoulder to cuff", True, 4),
                    ("Shoulder Width", "SHOULDER", "Across shoulders", True, 5),
                    ("Body Length", "LENGTH", "From HPS to hem", True, 6),
                    ("Across Back", "BACK", "Across back at armhole", False, 7),
                ]
            },
            {
                "code": "CRD",
                "name": "Cardigan",
                "category": "Tops",
                "display_order": 6,
                "measurements": [
                    ("Chest", "CHEST", "Full chest measurement", True, 1),
                    ("Waist", "WAIST", "Natural waist", True, 2),
                    ("Hip", "HIP", "Hip measurement", True, 3),
                    ("Sleeve Length", "SLEEVE", "From shoulder to cuff", True, 4),
                    ("Shoulder Width", "SHOULDER", "Across shoulders", True, 5),
                    ("Body Length", "LENGTH", "From HPS to hem", True, 6),
                    ("Front Opening", "FRONT", "Front opening width", False, 7),
                ]
            },
            {
                "code": "PNT",
                "name": "Pants",
                "category": "Bottoms",
                "display_order": 10,
                "measurements": [
                    ("Waist", "WAIST", "Waistband measurement relaxed", True, 1),
                    ("Hip", "HIP", "Hip at widest point", True, 2),
                    ("Inseam", "INSEAM", "Inner leg from crotch to hem", True, 3),
                    ("Outseam", "OUTSEAM", "Outer leg from waist to hem", True, 4),
                    ("Thigh", "THIGH", "Thigh circumference 1\" below crotch", True, 5),
                    ("Knee", "KNEE", "Knee circumference", False, 6),
                    ("Leg Opening", "LEG_OPEN", "Hem opening", True, 7),
                    ("Front Rise", "RISE_F", "Front rise", False, 8),
                    ("Back Rise", "RISE_B", "Back rise", False, 9),
                ]
            },
            {
                "code": "JNS",
                "name": "Jeans",
                "category": "Bottoms",
                "display_order": 11,
                "measurements": [
                    ("Waist", "WAIST", "Waistband measurement", True, 1),
                    ("Hip", "HIP", "Hip at widest point", True, 2),
                    ("Inseam", "INSEAM", "Inner leg from crotch to hem", True, 3),
                    ("Outseam", "OUTSEAM", "Outer leg from waist to hem", True, 4),
                    ("Thigh", "THIGH", "Thigh circumference", True, 5),
                    ("Knee", "KNEE", "Knee circumference", True, 6),
                    ("Leg Opening", "LEG_OPEN", "Hem opening", True, 7),
                    ("Front Rise", "RISE_F", "Front rise", True, 8),
                    ("Back Rise", "RISE_B", "Back rise", True, 9),
                ]
            },
            {
                "code": "SHT",
                "name": "Shorts",
                "category": "Bottoms",
                "display_order": 12,
                "measurements": [
                    ("Waist", "WAIST", "Waistband measurement", True, 1),
                    ("Hip", "HIP", "Hip at widest point", True, 2),
                    ("Inseam", "INSEAM", "Inner leg length", True, 3),
                    ("Outseam", "OUTSEAM", "Outer leg from waist to hem", True, 4),
                    ("Thigh", "THIGH", "Thigh circumference", True, 5),
                    ("Leg Opening", "LEG_OPEN", "Hem opening", True, 6),
                ]
            },
            {
                "code": "HAT",
                "name": "Hat",
                "category": "Accessories",
                "display_order": 20,
                "measurements": [
                    ("Head Circumference", "HEAD", "Around the head", True, 1),
                    ("Crown Height", "CROWN", "Height of crown", True, 2),
                    ("Brim Width", "BRIM", "Width of brim", False, 3),
                ]
            },
            {
                "code": "BNE",
                "name": "Beanie",
                "category": "Accessories",
                "display_order": 21,
                "measurements": [
                    ("Head Circumference", "HEAD", "Fits head size (stretched)", True, 1),
                    ("Height", "HEIGHT", "Total height when flat", True, 2),
                    ("Cuff Height", "CUFF", "Folded cuff height", False, 3),
                ]
            },
            {
                "code": "GLV",
                "name": "Gloves",
                "category": "Accessories",
                "display_order": 22,
                "measurements": [
                    ("Palm Width", "PALM", "Width across palm", True, 1),
                    ("Total Length", "LENGTH", "Wrist to fingertip", True, 2),
                    ("Wrist Circumference", "WRIST", "Wrist opening", True, 3),
                    ("Finger Length", "FINGER", "Middle finger length", False, 4),
                ]
            },
            {
                "code": "SCF",
                "name": "Scarf",
                "category": "Accessories",
                "display_order": 23,
                "measurements": [
                    ("Length", "LENGTH", "Total length", True, 1),
                    ("Width", "WIDTH", "Width when flat", True, 2),
                    ("Fringe Length", "FRINGE", "Fringe length if any", False, 3),
                ]
            },
            {
                "code": "SKS",
                "name": "Socks",
                "category": "Accessories",
                "display_order": 24,
                "measurements": [
                    ("Foot Length", "FOOT", "Heel to toe", True, 1),
                    ("Leg Length", "LEG", "Heel to cuff", True, 2),
                    ("Ankle Circumference", "ANKLE", "At ankle bone", False, 3),
                    ("Calf Circumference", "CALF", "At widest calf", False, 4),
                ]
            },
            {
                "code": "DRS",
                "name": "Dress",
                "category": "Dresses",
                "display_order": 30,
                "measurements": [
                    ("Bust", "BUST", "Full bust measurement", True, 1),
                    ("Waist", "WAIST", "Natural waist", True, 2),
                    ("Hip", "HIP", "Hip at widest point", True, 3),
                    ("Shoulder Width", "SHOULDER", "Across shoulders", True, 4),
                    ("Sleeve Length", "SLEEVE", "Shoulder to cuff (if applicable)", False, 5),
                    ("Total Length", "LENGTH", "HPS to hem", True, 6),
                    ("Skirt Length", "SKIRT", "Waist to hem", False, 7),
                ]
            },
            {
                "code": "SKT",
                "name": "Skirt",
                "category": "Bottoms",
                "display_order": 31,
                "measurements": [
                    ("Waist", "WAIST", "Waistband measurement", True, 1),
                    ("Hip", "HIP", "Hip at widest point", True, 2),
                    ("Length", "LENGTH", "Waist to hem", True, 3),
                    ("Hem Width", "HEM", "Hem circumference", False, 4),
                ]
            },
        ]

        garment_type_map = {}  # Store for later use

        for gt_data in garment_types_data:
            existing = db.query(GarmentType).filter(GarmentType.code == gt_data["code"]).first()
            if existing:
                garment_type_map[gt_data["code"]] = existing
                continue

            gt = GarmentType(
                code=gt_data["code"],
                name=gt_data["name"],
                category=gt_data["category"],
                display_order=gt_data["display_order"],
            )
            db.add(gt)
            db.flush()
            garment_type_map[gt_data["code"]] = gt

            # Add measurement specs
            for m_name, m_code, m_desc, m_required, m_order in gt_data["measurements"]:
                spec = GarmentMeasurementSpec(
                    garment_type_id=gt.id,
                    measurement_name=m_name,
                    measurement_code=m_code,
                    description=m_desc,
                    is_required=m_required,
                    display_order=m_order,
                )
                db.add(spec)

        db.commit()
        logger.info(f"Garment types seeded: {len(garment_type_map)} types")

        # =================================================================
        # STEP 2: H&M COLOR GROUPS
        # =================================================================
        hm_groups_data = [
            ("01", "White", 1, 9, "#FFFFFF", 1),
            ("07", "Grey", 7, 9, "#808080", 2),
            ("09", "Black", 9, 9, "#000000", 3),
            ("10", "Red", 10, 19, "#FF0000", 4),
            ("20", "Yellow", 20, 29, "#FFFF00", 5),
            ("30", "Green", 30, 39, "#008000", 6),
            ("40", "Blue", 40, 49, "#0000FF", 7),
            ("50", "Violet/Purple", 50, 59, "#800080", 8),
            ("60", "Brown/Earth", 60, 69, "#8B4513", 9),
            ("70", "Pink", 70, 79, "#FFC0CB", 10),
        ]

        hm_group_map = {}
        for g_code, g_name, g_start, g_end, g_hex, g_order in hm_groups_data:
            existing = db.query(HMColorGroup).filter(HMColorGroup.group_code == g_code).first()
            if existing:
                hm_group_map[g_code] = existing
                continue

            group = HMColorGroup(
                group_code=g_code,
                group_name=g_name,
                group_range_start=g_start,
                group_range_end=g_end,
                hex_sample=g_hex,
                display_order=g_order,
            )
            db.add(group)
            db.flush()
            hm_group_map[g_code] = group

        db.commit()
        logger.info(f"H&M color groups seeded: {len(hm_group_map)} groups")

        # =================================================================
        # STEP 3: UNIVERSAL COLORS (Pantone/TCX/RGB/Hex)
        # =================================================================
        universal_colors_data = [
            # Blacks & Greys
            {"name": "Jet Black", "hex": "#000000", "family": ColorFamilyEnum.BLACK, "pantone": "19-0303", "tcx": "19-0303 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Charcoal Grey", "hex": "#36454F", "family": ColorFamilyEnum.GREY, "pantone": "19-3906", "tcx": "19-3906 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Heather Grey", "hex": "#9AA297", "family": ColorFamilyEnum.GREY, "pantone": "16-4402", "tcx": "16-4402 TCX", "type": ColorTypeEnum.MELANGE, "value": ColorValueEnum.MEDIUM, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Light Grey", "hex": "#D3D3D3", "family": ColorFamilyEnum.GREY, "pantone": "14-4103", "tcx": "14-4103 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.LIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Silver Grey", "hex": "#C0C0C0", "family": ColorFamilyEnum.GREY, "pantone": "14-4500", "tcx": "14-4500 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.LIGHT, "finish": FinishTypeEnum.YARN_DYED},

            # Whites & Creams
            {"name": "Bright White", "hex": "#FFFFFF", "family": ColorFamilyEnum.WHITE, "pantone": "11-0601", "tcx": "11-0601 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Off White", "hex": "#FAF9F6", "family": ColorFamilyEnum.WHITE, "pantone": "11-0602", "tcx": "11-0602 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.LIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Cream", "hex": "#FFFDD0", "family": ColorFamilyEnum.CREAM, "pantone": "11-0609", "tcx": "11-0609 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.LIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Ivory", "hex": "#FFFFF0", "family": ColorFamilyEnum.CREAM, "pantone": "11-0107", "tcx": "11-0107 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.LIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Natural", "hex": "#F5F5DC", "family": ColorFamilyEnum.CREAM, "pantone": "12-0605", "tcx": "12-0605 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.LIGHT, "finish": FinishTypeEnum.YARN_DYED},

            # Navy & Blues
            {"name": "Navy Blue", "hex": "#001F3F", "family": ColorFamilyEnum.NAVY, "pantone": "19-3921", "tcx": "19-3921 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Royal Blue", "hex": "#4169E1", "family": ColorFamilyEnum.BLUE, "pantone": "19-3952", "tcx": "19-3952 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Sky Blue", "hex": "#87CEEB", "family": ColorFamilyEnum.BLUE, "pantone": "14-4318", "tcx": "14-4318 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.LIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Baby Blue", "hex": "#89CFF0", "family": ColorFamilyEnum.BLUE, "pantone": "13-4411", "tcx": "13-4411 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.LIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Cobalt Blue", "hex": "#0047AB", "family": ColorFamilyEnum.BLUE, "pantone": "19-3864", "tcx": "19-3864 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Steel Blue", "hex": "#4682B4", "family": ColorFamilyEnum.BLUE, "pantone": "17-4028", "tcx": "17-4028 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.MEDIUM, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Powder Blue", "hex": "#B0E0E6", "family": ColorFamilyEnum.BLUE, "pantone": "12-4609", "tcx": "12-4609 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.PASTEL, "finish": FinishTypeEnum.YARN_DYED},

            # Reds
            {"name": "Classic Red", "hex": "#FF0000", "family": ColorFamilyEnum.RED, "pantone": "18-1664", "tcx": "18-1664 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Burgundy", "hex": "#800020", "family": ColorFamilyEnum.BURGUNDY, "pantone": "19-1617", "tcx": "19-1617 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Wine Red", "hex": "#722F37", "family": ColorFamilyEnum.RED, "pantone": "19-1725", "tcx": "19-1725 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Crimson", "hex": "#DC143C", "family": ColorFamilyEnum.RED, "pantone": "19-1762", "tcx": "19-1762 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Scarlet", "hex": "#FF2400", "family": ColorFamilyEnum.RED, "pantone": "18-1662", "tcx": "18-1662 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Maroon", "hex": "#800000", "family": ColorFamilyEnum.BURGUNDY, "pantone": "19-1531", "tcx": "19-1531 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},

            # Greens
            {"name": "Forest Green", "hex": "#228B22", "family": ColorFamilyEnum.GREEN, "pantone": "18-0130", "tcx": "18-0130 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Olive Green", "hex": "#808000", "family": ColorFamilyEnum.OLIVE, "pantone": "18-0622", "tcx": "18-0622 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.MEDIUM_DUSTY, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Sage Green", "hex": "#B2AC88", "family": ColorFamilyEnum.GREEN, "pantone": "15-0318", "tcx": "15-0318 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DUSTY, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Mint Green", "hex": "#98FB98", "family": ColorFamilyEnum.GREEN, "pantone": "13-0117", "tcx": "13-0117 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.PASTEL, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Hunter Green", "hex": "#355E3B", "family": ColorFamilyEnum.GREEN, "pantone": "19-5511", "tcx": "19-5511 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Emerald Green", "hex": "#50C878", "family": ColorFamilyEnum.GREEN, "pantone": "17-5936", "tcx": "17-5936 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},

            # Browns & Beiges
            {"name": "Beige", "hex": "#F5F5DC", "family": ColorFamilyEnum.BEIGE, "pantone": "13-1008", "tcx": "13-1008 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.LIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Camel", "hex": "#C19A6B", "family": ColorFamilyEnum.BROWN, "pantone": "15-1225", "tcx": "15-1225 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.MEDIUM, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Chocolate Brown", "hex": "#7B3F00", "family": ColorFamilyEnum.BROWN, "pantone": "19-1118", "tcx": "19-1118 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Tan", "hex": "#D2B48C", "family": ColorFamilyEnum.BROWN, "pantone": "14-1122", "tcx": "14-1122 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.MEDIUM, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Coffee Brown", "hex": "#6F4E37", "family": ColorFamilyEnum.BROWN, "pantone": "18-1027", "tcx": "18-1027 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Taupe", "hex": "#483C32", "family": ColorFamilyEnum.BROWN, "pantone": "18-1312", "tcx": "18-1312 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.MEDIUM_DUSTY, "finish": FinishTypeEnum.YARN_DYED},

            # Pinks
            {"name": "Blush Pink", "hex": "#DE5D83", "family": ColorFamilyEnum.PINK, "pantone": "15-1816", "tcx": "15-1816 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.MEDIUM, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Dusty Rose", "hex": "#C4A4A4", "family": ColorFamilyEnum.PINK, "pantone": "14-1316", "tcx": "14-1316 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DUSTY, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Hot Pink", "hex": "#FF69B4", "family": ColorFamilyEnum.PINK, "pantone": "17-2520", "tcx": "17-2520 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Baby Pink", "hex": "#F4C2C2", "family": ColorFamilyEnum.PINK, "pantone": "12-1212", "tcx": "12-1212 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.PASTEL, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Rose", "hex": "#FF007F", "family": ColorFamilyEnum.PINK, "pantone": "18-2120", "tcx": "18-2120 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},

            # Yellows & Oranges
            {"name": "Mustard Yellow", "hex": "#FFDB58", "family": ColorFamilyEnum.YELLOW, "pantone": "14-0952", "tcx": "14-0952 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Lemon Yellow", "hex": "#FFF44F", "family": ColorFamilyEnum.YELLOW, "pantone": "12-0752", "tcx": "12-0752 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Gold", "hex": "#FFD700", "family": ColorFamilyEnum.GOLD, "pantone": "14-0848", "tcx": "14-0848 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Burnt Orange", "hex": "#CC5500", "family": ColorFamilyEnum.ORANGE, "pantone": "17-1140", "tcx": "17-1140 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.MEDIUM, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Tangerine", "hex": "#FF9966", "family": ColorFamilyEnum.ORANGE, "pantone": "15-1247", "tcx": "15-1247 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Peach", "hex": "#FFCBA4", "family": ColorFamilyEnum.ORANGE, "pantone": "12-0915", "tcx": "12-0915 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.LIGHT, "finish": FinishTypeEnum.YARN_DYED},

            # Purples
            {"name": "Lavender", "hex": "#E6E6FA", "family": ColorFamilyEnum.PURPLE, "pantone": "13-3820", "tcx": "13-3820 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.PASTEL, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Plum", "hex": "#DDA0DD", "family": ColorFamilyEnum.PURPLE, "pantone": "17-3628", "tcx": "17-3628 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.MEDIUM, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Violet", "hex": "#8B00FF", "family": ColorFamilyEnum.PURPLE, "pantone": "18-3838", "tcx": "18-3838 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Eggplant", "hex": "#614051", "family": ColorFamilyEnum.PURPLE, "pantone": "19-2520", "tcx": "19-2520 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.DARK, "finish": FinishTypeEnum.YARN_DYED},

            # Teals & Corals
            {"name": "Teal", "hex": "#008080", "family": ColorFamilyEnum.TEAL, "pantone": "17-4919", "tcx": "17-4919 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.MEDIUM, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Turquoise", "hex": "#40E0D0", "family": ColorFamilyEnum.TEAL, "pantone": "14-4812", "tcx": "14-4812 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Coral", "hex": "#FF7F50", "family": ColorFamilyEnum.CORAL, "pantone": "16-1546", "tcx": "16-1546 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.BRIGHT, "finish": FinishTypeEnum.YARN_DYED},
            {"name": "Salmon", "hex": "#FA8072", "family": ColorFamilyEnum.CORAL, "pantone": "14-1419", "tcx": "14-1419 TCX", "type": ColorTypeEnum.SOLID, "value": ColorValueEnum.MEDIUM, "finish": FinishTypeEnum.YARN_DYED},
        ]

        color_num = 1
        universal_color_map = {}
        for color_data in universal_colors_data:
            color_code = f"UC-{color_num:04d}"

            existing = db.query(UniversalColor).filter(UniversalColor.color_code == color_code).first()
            if existing:
                universal_color_map[color_data["name"]] = existing
                color_num += 1
                continue

            # Parse RGB from hex
            hex_clean = color_data["hex"].lstrip('#')
            rgb_r = int(hex_clean[0:2], 16)
            rgb_g = int(hex_clean[2:4], 16)
            rgb_b = int(hex_clean[4:6], 16)

            color = UniversalColor(
                color_code=color_code,
                color_name=color_data["name"],
                display_name=color_data["name"],
                hex_code=color_data["hex"].upper(),
                rgb_r=rgb_r,
                rgb_g=rgb_g,
                rgb_b=rgb_b,
                pantone_code=color_data.get("pantone"),
                tcx_code=color_data.get("tcx"),
                color_family=color_data.get("family"),
                color_type=color_data.get("type"),
                color_value=color_data.get("value"),
                finish_type=color_data.get("finish"),
            )
            db.add(color)
            db.flush()
            universal_color_map[color_data["name"]] = color
            color_num += 1

        db.commit()
        logger.info(f"Universal colors seeded: {len(universal_color_map)} colors")

        # =================================================================
        # STEP 4: H&M COLORS (linked to groups and universal colors)
        # =================================================================
        hm_colors_data = [
            # White group (01)
            {"code": "01-001", "name": "White", "group": "01", "hex": "#FFFFFF", "universal": "Bright White"},
            {"code": "01-010", "name": "Off White", "group": "01", "hex": "#FAF9F6", "universal": "Off White"},
            {"code": "01-020", "name": "Cream White", "group": "01", "hex": "#FFFDD0", "universal": "Cream"},
            {"code": "01-030", "name": "Natural White", "group": "01", "hex": "#F5F5DC", "universal": "Natural"},

            # Grey group (07)
            {"code": "07-010", "name": "Charcoal", "group": "07", "hex": "#36454F", "universal": "Charcoal Grey"},
            {"code": "07-020", "name": "Heather Grey", "group": "07", "hex": "#9AA297", "universal": "Heather Grey"},
            {"code": "07-030", "name": "Light Grey", "group": "07", "hex": "#D3D3D3", "universal": "Light Grey"},
            {"code": "07-040", "name": "Silver", "group": "07", "hex": "#C0C0C0", "universal": "Silver Grey"},

            # Black group (09)
            {"code": "09-001", "name": "Black", "group": "09", "hex": "#000000", "universal": "Jet Black"},
            {"code": "09-090", "name": "Jet Black", "group": "09", "hex": "#0A0A0A", "universal": "Jet Black"},

            # Red group (10-19)
            {"code": "10-001", "name": "Red", "group": "10", "hex": "#FF0000", "universal": "Classic Red"},
            {"code": "10-050", "name": "Burgundy", "group": "10", "hex": "#800020", "universal": "Burgundy"},
            {"code": "10-060", "name": "Wine", "group": "10", "hex": "#722F37", "universal": "Wine Red"},
            {"code": "10-070", "name": "Crimson", "group": "10", "hex": "#DC143C", "universal": "Crimson"},

            # Yellow group (20-29)
            {"code": "20-010", "name": "Mustard", "group": "20", "hex": "#FFDB58", "universal": "Mustard Yellow"},
            {"code": "20-020", "name": "Lemon", "group": "20", "hex": "#FFF44F", "universal": "Lemon Yellow"},
            {"code": "20-030", "name": "Gold", "group": "20", "hex": "#FFD700", "universal": "Gold"},

            # Green group (30-39)
            {"code": "30-010", "name": "Forest", "group": "30", "hex": "#228B22", "universal": "Forest Green"},
            {"code": "30-020", "name": "Olive", "group": "30", "hex": "#808000", "universal": "Olive Green"},
            {"code": "30-030", "name": "Sage", "group": "30", "hex": "#B2AC88", "universal": "Sage Green"},
            {"code": "30-040", "name": "Mint", "group": "30", "hex": "#98FB98", "universal": "Mint Green"},
            {"code": "30-050", "name": "Hunter", "group": "30", "hex": "#355E3B", "universal": "Hunter Green"},

            # Blue group (40-49)
            {"code": "40-010", "name": "Navy", "group": "40", "hex": "#001F3F", "universal": "Navy Blue"},
            {"code": "40-020", "name": "Royal Blue", "group": "40", "hex": "#4169E1", "universal": "Royal Blue"},
            {"code": "40-030", "name": "Sky Blue", "group": "40", "hex": "#87CEEB", "universal": "Sky Blue"},
            {"code": "40-040", "name": "Cobalt", "group": "40", "hex": "#0047AB", "universal": "Cobalt Blue"},
            {"code": "40-050", "name": "Baby Blue", "group": "40", "hex": "#89CFF0", "universal": "Baby Blue"},

            # Purple group (50-59)
            {"code": "50-010", "name": "Lavender", "group": "50", "hex": "#E6E6FA", "universal": "Lavender"},
            {"code": "50-020", "name": "Plum", "group": "50", "hex": "#DDA0DD", "universal": "Plum"},
            {"code": "50-030", "name": "Violet", "group": "50", "hex": "#8B00FF", "universal": "Violet"},
            {"code": "50-040", "name": "Eggplant", "group": "50", "hex": "#614051", "universal": "Eggplant"},

            # Brown/Earth group (60-69)
            {"code": "60-010", "name": "Chocolate", "group": "60", "hex": "#7B3F00", "universal": "Chocolate Brown"},
            {"code": "60-020", "name": "Camel", "group": "60", "hex": "#C19A6B", "universal": "Camel"},
            {"code": "60-030", "name": "Tan", "group": "60", "hex": "#D2B48C", "universal": "Tan"},
            {"code": "60-040", "name": "Coffee", "group": "60", "hex": "#6F4E37", "universal": "Coffee Brown"},
            {"code": "60-050", "name": "Beige", "group": "60", "hex": "#F5F5DC", "universal": "Beige"},

            # Pink group (70-79)
            {"code": "70-010", "name": "Blush", "group": "70", "hex": "#DE5D83", "universal": "Blush Pink"},
            {"code": "70-020", "name": "Dusty Rose", "group": "70", "hex": "#C4A4A4", "universal": "Dusty Rose"},
            {"code": "70-030", "name": "Hot Pink", "group": "70", "hex": "#FF69B4", "universal": "Hot Pink"},
            {"code": "70-040", "name": "Baby Pink", "group": "70", "hex": "#F4C2C2", "universal": "Baby Pink"},
        ]

        for hm_data in hm_colors_data:
            existing = db.query(HMColor).filter(HMColor.hm_code == hm_data["code"]).first()
            if existing:
                continue

            # Get group
            group = hm_group_map.get(hm_data["group"])
            group_id = group.id if group else None

            # Get universal color reference
            universal = universal_color_map.get(hm_data.get("universal"))
            universal_id = universal.id if universal else None

            # Parse RGB
            hex_clean = hm_data["hex"].lstrip('#')
            rgb_r = int(hex_clean[0:2], 16)
            rgb_g = int(hex_clean[2:4], 16)
            rgb_b = int(hex_clean[4:6], 16)

            hm_color = HMColor(
                hm_code=hm_data["code"],
                hm_name=hm_data["name"],
                group_id=group_id,
                universal_color_id=universal_id,
                hex_code=hm_data["hex"].upper(),
                rgb_r=rgb_r,
                rgb_g=rgb_g,
                rgb_b=rgb_b,
            )
            db.add(hm_color)

        db.commit()
        logger.info(f"H&M colors seeded: {len(hm_colors_data)} colors")

        # =================================================================
        # STEP 5: SIZE MASTER DATA
        # =================================================================

        def create_size(garment_type, gender, size_name, fit_type, age_group, measurements, size_num):
            """Helper to create size with measurements"""
            garment_abbr = garment_type.code
            size_code = f"SZ-{garment_abbr}-{size_name[:3].upper()}-{size_num:05d}"

            existing = db.query(SizeMaster).filter(SizeMaster.size_code == size_code).first()
            if existing:
                return existing

            size = SizeMaster(
                size_code=size_code,
                garment_type_id=garment_type.id,
                gender=gender,
                age_group=age_group,
                fit_type=fit_type,
                size_name=size_name,
                size_label=f"{size_name} ({fit_type.value})",
            )
            db.add(size)
            db.flush()

            for m_code, value_cm, tol_plus, tol_minus in measurements:
                # Get measurement name from code
                m_name = {
                    "CHEST": "Chest", "WAIST": "Waist", "HIP": "Hip",
                    "SLEEVE": "Sleeve Length", "SHOULDER": "Shoulder Width",
                    "LENGTH": "Body Length", "ARMHOLE": "Armhole",
                    "NECK_W": "Neck Width", "CUFF": "Cuff Width",
                    "INSEAM": "Inseam", "OUTSEAM": "Outseam",
                    "THIGH": "Thigh", "KNEE": "Knee", "LEG_OPEN": "Leg Opening",
                    "HEAD": "Head Circumference", "CROWN": "Crown Height",
                    "HEIGHT": "Height", "PALM": "Palm Width",
                    "WRIST": "Wrist Circumference", "BRIM": "Brim Width",
                }.get(m_code, m_code)

                measurement = SizeMeasurement(
                    size_master_id=size.id,
                    measurement_name=m_name,
                    measurement_code=m_code,
                    value_cm=value_cm,
                    tolerance_plus=tol_plus,
                    tolerance_minus=tol_minus,
                    value_inch=round(float(value_cm) / 2.54, 2),
                )
                db.add(measurement)

            return size

        # Sweater sizes - Male Adult
        sweater = garment_type_map.get("SWT")
        if sweater:
            size_num = 1
            sweater_sizes_male = [
                ("XS", [("CHEST", 88, 2.5, 2.5), ("WAIST", 80, 2.0, 2.0), ("HIP", 90, 2.5, 2.5), ("SLEEVE", 58, 1.5, 1.5), ("SHOULDER", 42, 1.0, 1.0), ("LENGTH", 65, 2.0, 2.0)]),
                ("S", [("CHEST", 92, 2.5, 2.5), ("WAIST", 84, 2.0, 2.0), ("HIP", 94, 2.5, 2.5), ("SLEEVE", 59, 1.5, 1.5), ("SHOULDER", 43, 1.0, 1.0), ("LENGTH", 66, 2.0, 2.0)]),
                ("M", [("CHEST", 96, 2.5, 2.5), ("WAIST", 88, 2.0, 2.0), ("HIP", 98, 2.5, 2.5), ("SLEEVE", 61, 1.5, 1.5), ("SHOULDER", 44, 1.0, 1.0), ("LENGTH", 68, 2.0, 2.0)]),
                ("L", [("CHEST", 102, 2.5, 2.5), ("WAIST", 94, 2.0, 2.0), ("HIP", 104, 2.5, 2.5), ("SLEEVE", 62, 1.5, 1.5), ("SHOULDER", 46, 1.0, 1.0), ("LENGTH", 70, 2.0, 2.0)]),
                ("XL", [("CHEST", 108, 2.5, 2.5), ("WAIST", 100, 2.0, 2.0), ("HIP", 110, 2.5, 2.5), ("SLEEVE", 63, 1.5, 1.5), ("SHOULDER", 48, 1.0, 1.0), ("LENGTH", 72, 2.0, 2.0)]),
                ("XXL", [("CHEST", 114, 2.5, 2.5), ("WAIST", 106, 2.0, 2.0), ("HIP", 116, 2.5, 2.5), ("SLEEVE", 64, 1.5, 1.5), ("SHOULDER", 50, 1.0, 1.0), ("LENGTH", 74, 2.0, 2.0)]),
            ]
            for size_name, measurements in sweater_sizes_male:
                create_size(sweater, GenderEnum.MALE, size_name, FitTypeEnum.REGULAR, AgeGroupEnum.ADULT, measurements, size_num)
                size_num += 1

            # Sweater sizes - Female Adult
            sweater_sizes_female = [
                ("XS", [("CHEST", 80, 2.5, 2.5), ("WAIST", 64, 2.0, 2.0), ("HIP", 86, 2.5, 2.5), ("SLEEVE", 55, 1.5, 1.5), ("SHOULDER", 38, 1.0, 1.0), ("LENGTH", 60, 2.0, 2.0)]),
                ("S", [("CHEST", 84, 2.5, 2.5), ("WAIST", 68, 2.0, 2.0), ("HIP", 90, 2.5, 2.5), ("SLEEVE", 56, 1.5, 1.5), ("SHOULDER", 39, 1.0, 1.0), ("LENGTH", 62, 2.0, 2.0)]),
                ("M", [("CHEST", 88, 2.5, 2.5), ("WAIST", 72, 2.0, 2.0), ("HIP", 94, 2.5, 2.5), ("SLEEVE", 57, 1.5, 1.5), ("SHOULDER", 40, 1.0, 1.0), ("LENGTH", 64, 2.0, 2.0)]),
                ("L", [("CHEST", 94, 2.5, 2.5), ("WAIST", 78, 2.0, 2.0), ("HIP", 100, 2.5, 2.5), ("SLEEVE", 58, 1.5, 1.5), ("SHOULDER", 42, 1.0, 1.0), ("LENGTH", 66, 2.0, 2.0)]),
                ("XL", [("CHEST", 100, 2.5, 2.5), ("WAIST", 84, 2.0, 2.0), ("HIP", 106, 2.5, 2.5), ("SLEEVE", 59, 1.5, 1.5), ("SHOULDER", 44, 1.0, 1.0), ("LENGTH", 68, 2.0, 2.0)]),
            ]
            for size_name, measurements in sweater_sizes_female:
                create_size(sweater, GenderEnum.FEMALE, size_name, FitTypeEnum.REGULAR, AgeGroupEnum.ADULT, measurements, size_num)
                size_num += 1

        # T-Shirt sizes
        tshirt = garment_type_map.get("TSH")
        if tshirt:
            size_num = 100
            tshirt_sizes_unisex = [
                ("XS", [("CHEST", 88, 2.0, 2.0), ("WAIST", 80, 2.0, 2.0), ("HIP", 88, 2.0, 2.0), ("SLEEVE", 18, 1.0, 1.0), ("SHOULDER", 42, 1.0, 1.0), ("LENGTH", 66, 2.0, 2.0)]),
                ("S", [("CHEST", 92, 2.0, 2.0), ("WAIST", 84, 2.0, 2.0), ("HIP", 92, 2.0, 2.0), ("SLEEVE", 19, 1.0, 1.0), ("SHOULDER", 44, 1.0, 1.0), ("LENGTH", 68, 2.0, 2.0)]),
                ("M", [("CHEST", 96, 2.0, 2.0), ("WAIST", 88, 2.0, 2.0), ("HIP", 96, 2.0, 2.0), ("SLEEVE", 20, 1.0, 1.0), ("SHOULDER", 46, 1.0, 1.0), ("LENGTH", 70, 2.0, 2.0)]),
                ("L", [("CHEST", 102, 2.0, 2.0), ("WAIST", 94, 2.0, 2.0), ("HIP", 102, 2.0, 2.0), ("SLEEVE", 21, 1.0, 1.0), ("SHOULDER", 48, 1.0, 1.0), ("LENGTH", 72, 2.0, 2.0)]),
                ("XL", [("CHEST", 108, 2.0, 2.0), ("WAIST", 100, 2.0, 2.0), ("HIP", 108, 2.0, 2.0), ("SLEEVE", 22, 1.0, 1.0), ("SHOULDER", 50, 1.0, 1.0), ("LENGTH", 74, 2.0, 2.0)]),
            ]
            for size_name, measurements in tshirt_sizes_unisex:
                create_size(tshirt, GenderEnum.UNISEX, size_name, FitTypeEnum.REGULAR, AgeGroupEnum.ADULT, measurements, size_num)
                size_num += 1

        # Beanie sizes
        beanie = garment_type_map.get("BNE")
        if beanie:
            size_num = 200
            beanie_sizes = [
                ("S", [("HEAD", 52, 2.0, 2.0), ("HEIGHT", 20, 1.0, 1.0)]),
                ("M", [("HEAD", 56, 2.0, 2.0), ("HEIGHT", 21, 1.0, 1.0)]),
                ("L", [("HEAD", 60, 2.0, 2.0), ("HEIGHT", 22, 1.0, 1.0)]),
                ("ONE SIZE", [("HEAD", 56, 4.0, 4.0), ("HEIGHT", 21, 1.0, 1.0)]),
            ]
            for size_name, measurements in beanie_sizes:
                create_size(beanie, GenderEnum.UNISEX, size_name, FitTypeEnum.REGULAR, AgeGroupEnum.ADULT, measurements, size_num)
                size_num += 1

        # Gloves sizes
        gloves = garment_type_map.get("GLV")
        if gloves:
            size_num = 300
            gloves_sizes = [
                ("XS", [("PALM", 7.0, 0.5, 0.5), ("LENGTH", 18, 1.0, 1.0), ("WRIST", 15, 1.0, 1.0)]),
                ("S", [("PALM", 7.5, 0.5, 0.5), ("LENGTH", 19, 1.0, 1.0), ("WRIST", 16, 1.0, 1.0)]),
                ("M", [("PALM", 8.0, 0.5, 0.5), ("LENGTH", 20, 1.0, 1.0), ("WRIST", 17, 1.0, 1.0)]),
                ("L", [("PALM", 8.5, 0.5, 0.5), ("LENGTH", 21, 1.0, 1.0), ("WRIST", 18, 1.0, 1.0)]),
                ("XL", [("PALM", 9.0, 0.5, 0.5), ("LENGTH", 22, 1.0, 1.0), ("WRIST", 19, 1.0, 1.0)]),
            ]
            for size_name, measurements in gloves_sizes:
                create_size(gloves, GenderEnum.UNISEX, size_name, FitTypeEnum.REGULAR, AgeGroupEnum.ADULT, measurements, size_num)
                size_num += 1

        db.commit()
        logger.info("Size Master data seeded")

        logger.info("Size & Color Master data seeding completed successfully!")

    except Exception as e:
        logger.error(f"Error seeding Size & Color data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_sizecolor_data()
