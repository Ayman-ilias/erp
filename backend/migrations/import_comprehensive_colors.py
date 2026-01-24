"""
Migration: Import Comprehensive Color Data
==========================================

This migration automatically imports:
1. H&M colors from Excel file (Sheet2 - 3860 colors)
2. Comprehensive universal color dataset

Runs automatically on docker-compose up
"""

import pandas as pd
import os
from sqlalchemy.orm import Session
from sqlalchemy import text
from core.database import SessionLocalSizeColor
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


def clean_string_value(value) -> Optional[str]:
    """Clean and normalize string values, return None for empty/null values"""
    if pd.isna(value) or value is None:
        return None

    # Convert to string and strip whitespace
    cleaned = str(value).strip()

    # Return None for empty strings or common null representations
    if not cleaned or cleaned.lower() in ['nan', 'null', '', 'undefined', 'none']:
        return None

    return cleaned


def batch_insert_hm_colors(db: Session, colors_data: List[Dict], batch_size: int = 500):
    """Batch insert H&M colors for better performance"""
    total_inserted = 0
    total_updated = 0

    for i in range(0, len(colors_data), batch_size):
        batch = colors_data[i:i + batch_size]
        batch_inserted = 0
        batch_updated = 0

        try:
            for color_data in batch:
                # Check if color exists
                existing = db.execute(text("""
                    SELECT id FROM hm_colors WHERE color_code = :color_code
                """), {"color_code": color_data['color_code']}).fetchone()

                if existing:
                    # Update existing
                    db.execute(text("""
                        UPDATE hm_colors
                        SET color_master = :color_master,
                            color_value = :color_value,
                            mixed_name = :mixed_name,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE color_code = :color_code
                    """), color_data)
                    batch_updated += 1
                else:
                    # Insert new
                    db.execute(text("""
                        INSERT INTO hm_colors (color_code, color_master, color_value, mixed_name, is_active)
                        VALUES (:color_code, :color_master, :color_value, :mixed_name, :is_active)
                    """), color_data)
                    batch_inserted += 1

            # Commit batch
            db.commit()
            total_inserted += batch_inserted
            total_updated += batch_updated

            if (i + batch_size) % 1000 == 0 or (i + batch_size) >= len(colors_data):
                logger.info(f"H&M Colors Progress: {min(i + batch_size, len(colors_data))}/{len(colors_data)}")

        except Exception as e:
            db.rollback()
            logger.error(f"Error in H&M colors batch {i//batch_size + 1}: {e}")
            raise

    return total_inserted, total_updated


def batch_insert_universal_colors(db: Session, colors_data: List[Dict], batch_size: int = 500):
    """Batch insert universal colors for better performance"""
    total_inserted = 0
    total_updated = 0

    for i in range(0, len(colors_data), batch_size):
        batch = colors_data[i:i + batch_size]
        batch_inserted = 0
        batch_updated = 0

        try:
            for color_data in batch:
                # Check if color exists by color_code
                existing = db.execute(text("""
                    SELECT id FROM universal_colors WHERE color_code = :color_code
                """), {"color_code": color_data['color_code']}).fetchone()

                if existing:
                    # Update existing
                    update_fields = []
                    update_params = {"id": existing[0]}

                    for field, value in color_data.items():
                        if field != 'color_code' and value is not None:
                            update_fields.append(f"{field} = :{field}")
                            update_params[field] = value

                    if update_fields:
                        update_fields.append("updated_at = CURRENT_TIMESTAMP")
                        update_query = f"UPDATE universal_colors SET {', '.join(update_fields)} WHERE id = :id"
                        db.execute(text(update_query), update_params)
                        batch_updated += 1
                else:
                    # Insert new
                    fields = list(color_data.keys())
                    placeholders = [f":{field}" for field in fields]

                    insert_query = f"""
                        INSERT INTO universal_colors ({', '.join(fields)})
                        VALUES ({', '.join(placeholders)})
                    """
                    db.execute(text(insert_query), color_data)
                    batch_inserted += 1

            # Commit batch
            db.commit()
            total_inserted += batch_inserted
            total_updated += batch_updated

        except Exception as e:
            db.rollback()
            logger.error(f"Error in universal colors batch {i//batch_size + 1}: {e}")
            raise

    return total_inserted, total_updated


def import_hm_colors_from_excel(excel_file_path: str, db: Session):
    """Import H&M colors from Excel file - reads Sheet2"""
    if not os.path.exists(excel_file_path):
        logger.info(f"Excel file not found: {excel_file_path} - skipping H&M color import")
        return 0, 0

    try:
        logger.info(f"Reading H&M colors from Excel: {excel_file_path}")

        # Read Excel file - Sheet2 contains the color data
        df = pd.read_excel(excel_file_path, sheet_name='Sheet2')

        logger.info(f"Found {len(df)} rows in H&M colors Excel")
        logger.info(f"Columns: {list(df.columns)}")

        # Validate required columns - handle both exact and similar column names
        column_mapping = {
            'color_code': None,
            'color_master': None,
            'color_value': None,
            'mixed_name': None
        }

        for col in df.columns:
            col_lower = col.lower().replace(' ', '_').replace('-', '_')
            if 'colour_code' in col_lower or 'color_code' in col_lower:
                column_mapping['color_code'] = col
            elif 'colour_master' in col_lower or 'color_master' in col_lower:
                column_mapping['color_master'] = col
            elif 'colour_value' in col_lower or 'color_value' in col_lower:
                column_mapping['color_value'] = col
            elif 'mixed' in col_lower:
                column_mapping['mixed_name'] = col

        # Check required columns
        if not column_mapping['color_code'] or not column_mapping['color_master']:
            logger.error(f"Missing required columns. Found: {list(df.columns)}")
            return 0, 0

        # Process color data
        colors_data = []
        skipped_count = 0

        for index, row in df.iterrows():
            try:
                color_code = clean_string_value(row.get(column_mapping['color_code']))
                color_master = clean_string_value(row.get(column_mapping['color_master']))
                color_value = clean_string_value(row.get(column_mapping['color_value'])) if column_mapping['color_value'] else None
                mixed_name = clean_string_value(row.get(column_mapping['mixed_name'])) if column_mapping['mixed_name'] else None

                # Skip rows with null/empty required fields or UNDEFINED values
                if not color_code or not color_master:
                    skipped_count += 1
                    continue

                # Skip UNDEFINED color masters
                if color_master.upper() == 'UNDEFINED':
                    skipped_count += 1
                    continue

                colors_data.append({
                    'color_code': color_code,
                    'color_master': color_master.upper(),  # Normalize to uppercase
                    'color_value': color_value.upper() if color_value else None,  # Normalize to uppercase
                    'mixed_name': mixed_name,
                    'is_active': True
                })

            except Exception as e:
                logger.error(f"Error processing H&M color row {index + 1}: {e}")
                continue

        if len(colors_data) == 0:
            logger.warning("No valid H&M color data to import!")
            return 0, 0

        logger.info(f"Processing {len(colors_data)} H&M colors (skipped {skipped_count} invalid rows)")

        # Batch insert
        imported_count, updated_count = batch_insert_hm_colors(db, colors_data, batch_size=500)

        logger.info(f"H&M Colors - Imported: {imported_count}, Updated: {updated_count}, Skipped: {skipped_count}")
        return imported_count, updated_count

    except Exception as e:
        logger.error(f"Error importing H&M colors from Excel: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return 0, 0


def get_comprehensive_universal_colors():
    """Generate comprehensive universal color dataset with correct enum values"""
    colors = []

    # Color families with their variations (using correct uppercase enum values)
    color_families = {
        "Red": [
            {"name": "Crimson Red", "hex": "#DC143C", "pantone": "18-1763", "family": "RED", "type": "SOLID", "value": "DARK"},
            {"name": "Cherry Red", "hex": "#DE3163", "pantone": "18-1664", "family": "RED", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Fire Engine Red", "hex": "#CE2029", "pantone": "18-1664", "family": "RED", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Burgundy", "hex": "#800020", "pantone": "19-1557", "family": "RED", "type": "SOLID", "value": "DARK"},
            {"name": "Maroon", "hex": "#800000", "pantone": "18-1142", "family": "RED", "type": "SOLID", "value": "DARK"},
            {"name": "Scarlet Red", "hex": "#FF2400", "pantone": "17-1563", "family": "RED", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Cardinal Red", "hex": "#C41E3A", "pantone": "18-1555", "family": "RED", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Ruby Red", "hex": "#9B111E", "pantone": "19-1663", "family": "RED", "type": "SOLID", "value": "DARK"},
            {"name": "Vermillion", "hex": "#E34234", "pantone": "17-1562", "family": "RED", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Rust Red", "hex": "#B7410E", "pantone": "18-1345", "family": "RED", "type": "SOLID", "value": "MEDIUM"},
        ],
        "Blue": [
            {"name": "Navy Blue", "hex": "#000080", "pantone": "19-3832", "family": "BLUE", "type": "SOLID", "value": "DARK"},
            {"name": "Royal Blue", "hex": "#4169E1", "pantone": "18-3963", "family": "BLUE", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Sky Blue", "hex": "#87CEEB", "pantone": "14-4318", "family": "BLUE", "type": "SOLID", "value": "LIGHT"},
            {"name": "Powder Blue", "hex": "#B0E0E6", "pantone": "13-4110", "family": "BLUE", "type": "SOLID", "value": "PASTEL"},
            {"name": "Teal Blue", "hex": "#008080", "pantone": "18-4735", "family": "BLUE", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Cobalt Blue", "hex": "#0047AB", "pantone": "19-4052", "family": "BLUE", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Indigo Blue", "hex": "#4B0082", "pantone": "19-3830", "family": "BLUE", "type": "SOLID", "value": "DARK"},
            {"name": "Steel Blue", "hex": "#4682B4", "pantone": "17-4023", "family": "BLUE", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Turquoise Blue", "hex": "#40E0D0", "pantone": "15-5217", "family": "BLUE", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Denim Blue", "hex": "#1560BD", "pantone": "18-4041", "family": "BLUE", "type": "SOLID", "value": "MEDIUM"},
        ],
        "Green": [
            {"name": "Forest Green", "hex": "#228B22", "pantone": "18-6024", "family": "GREEN", "type": "SOLID", "value": "DARK"},
            {"name": "Emerald Green", "hex": "#50C878", "pantone": "17-5641", "family": "GREEN", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Lime Green", "hex": "#32CD32", "pantone": "15-0343", "family": "GREEN", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Olive Green", "hex": "#808000", "pantone": "18-0228", "family": "GREEN", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Mint Green", "hex": "#98FB98", "pantone": "13-0221", "family": "GREEN", "type": "SOLID", "value": "PASTEL"},
            {"name": "Hunter Green", "hex": "#355E3B", "pantone": "18-6330", "family": "GREEN", "type": "SOLID", "value": "DARK"},
            {"name": "Kelly Green", "hex": "#4CBB17", "pantone": "16-6339", "family": "GREEN", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Sage Green", "hex": "#9DC183", "pantone": "15-6315", "family": "GREEN", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Seafoam Green", "hex": "#71EEB8", "pantone": "13-5714", "family": "GREEN", "type": "SOLID", "value": "LIGHT"},
            {"name": "Khaki Green", "hex": "#728C00", "pantone": "17-0530", "family": "GREEN", "type": "SOLID", "value": "MEDIUM"},
        ],
        "Yellow": [
            {"name": "Lemon Yellow", "hex": "#FFFF00", "pantone": "13-0859", "family": "YELLOW", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Golden Yellow", "hex": "#FFD700", "pantone": "13-0947", "family": "YELLOW", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Canary Yellow", "hex": "#FFEF00", "pantone": "12-0752", "family": "YELLOW", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Mustard Yellow", "hex": "#FFDB58", "pantone": "14-0952", "family": "YELLOW", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Butter Yellow", "hex": "#FFFF8B", "pantone": "12-0643", "family": "YELLOW", "type": "SOLID", "value": "PASTEL"},
            {"name": "Amber Yellow", "hex": "#FFBF00", "pantone": "14-0955", "family": "YELLOW", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Sunflower Yellow", "hex": "#FFDA03", "pantone": "13-0849", "family": "YELLOW", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Cream Yellow", "hex": "#FFFDD0", "pantone": "11-0110", "family": "YELLOW", "type": "SOLID", "value": "PASTEL"},
        ],
        "Orange": [
            {"name": "Tangerine Orange", "hex": "#FF8C00", "pantone": "15-1263", "family": "ORANGE", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Burnt Orange", "hex": "#CC5500", "pantone": "17-1463", "family": "ORANGE", "type": "SOLID", "value": "DARK"},
            {"name": "Peach Orange", "hex": "#FFCBA4", "pantone": "13-1023", "family": "ORANGE", "type": "SOLID", "value": "PASTEL"},
            {"name": "Coral Orange", "hex": "#FF7F50", "pantone": "16-1546", "family": "ORANGE", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Pumpkin Orange", "hex": "#FF7518", "pantone": "16-1364", "family": "ORANGE", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Apricot Orange", "hex": "#FBCEB1", "pantone": "13-1017", "family": "ORANGE", "type": "SOLID", "value": "PASTEL"},
            {"name": "Terracotta Orange", "hex": "#E2725B", "pantone": "17-1444", "family": "ORANGE", "type": "SOLID", "value": "MEDIUM"},
        ],
        "Purple": [
            {"name": "Royal Purple", "hex": "#7851A9", "pantone": "18-3838", "family": "PURPLE", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Lavender Purple", "hex": "#E6E6FA", "pantone": "13-3820", "family": "PURPLE", "type": "SOLID", "value": "PASTEL"},
            {"name": "Violet Purple", "hex": "#8A2BE2", "pantone": "18-3838", "family": "PURPLE", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Plum Purple", "hex": "#DDA0DD", "pantone": "15-3716", "family": "PURPLE", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Eggplant Purple", "hex": "#614051", "pantone": "19-2311", "family": "PURPLE", "type": "SOLID", "value": "DARK"},
            {"name": "Mauve Purple", "hex": "#E0B0FF", "pantone": "14-3612", "family": "PURPLE", "type": "SOLID", "value": "LIGHT"},
            {"name": "Grape Purple", "hex": "#6F2DA8", "pantone": "19-3536", "family": "PURPLE", "type": "SOLID", "value": "DARK"},
            {"name": "Lilac Purple", "hex": "#C8A2C8", "pantone": "15-3507", "family": "PURPLE", "type": "SOLID", "value": "LIGHT"},
        ],
        "Pink": [
            {"name": "Hot Pink", "hex": "#FF69B4", "pantone": "17-2034", "family": "PINK", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Baby Pink", "hex": "#F8BBD0", "pantone": "13-1404", "family": "PINK", "type": "SOLID", "value": "PASTEL"},
            {"name": "Rose Pink", "hex": "#FF007F", "pantone": "17-1937", "family": "PINK", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Blush Pink", "hex": "#DE5D83", "pantone": "16-1720", "family": "PINK", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Fuchsia Pink", "hex": "#FF00FF", "pantone": "17-2624", "family": "PINK", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Salmon Pink", "hex": "#FA8072", "pantone": "15-1530", "family": "PINK", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Magenta Pink", "hex": "#FF0090", "pantone": "18-2436", "family": "PINK", "type": "SOLID", "value": "BRIGHT"},
            {"name": "Dusty Pink", "hex": "#D4A5A5", "pantone": "15-1512", "family": "PINK", "type": "SOLID", "value": "MEDIUM"},
        ],
        "Brown": [
            {"name": "Chocolate Brown", "hex": "#7B3F00", "pantone": "18-1142", "family": "BROWN", "type": "SOLID", "value": "DARK"},
            {"name": "Coffee Brown", "hex": "#6F4E37", "pantone": "18-1142", "family": "BROWN", "type": "SOLID", "value": "DARK"},
            {"name": "Tan Brown", "hex": "#D2B48C", "pantone": "14-1118", "family": "BROWN", "type": "SOLID", "value": "LIGHT"},
            {"name": "Chestnut Brown", "hex": "#954535", "pantone": "18-1142", "family": "BROWN", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Mahogany Brown", "hex": "#C04000", "pantone": "18-1142", "family": "BROWN", "type": "SOLID", "value": "DARK"},
            {"name": "Caramel Brown", "hex": "#FFD59A", "pantone": "13-1022", "family": "BROWN", "type": "SOLID", "value": "LIGHT"},
            {"name": "Espresso Brown", "hex": "#4E312D", "pantone": "19-1118", "family": "BROWN", "type": "SOLID", "value": "DARK"},
            {"name": "Camel Brown", "hex": "#C19A6B", "pantone": "15-1225", "family": "BROWN", "type": "SOLID", "value": "MEDIUM"},
        ],
        "Beige": [
            {"name": "Sand Beige", "hex": "#C2B280", "pantone": "14-1116", "family": "BEIGE", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Cream Beige", "hex": "#F5F5DC", "pantone": "11-0107", "family": "BEIGE", "type": "SOLID", "value": "LIGHT"},
            {"name": "Nude Beige", "hex": "#E3BC9A", "pantone": "13-1012", "family": "BEIGE", "type": "SOLID", "value": "LIGHT"},
            {"name": "Taupe Beige", "hex": "#483C32", "pantone": "18-1312", "family": "BEIGE", "type": "SOLID", "value": "DARK"},
            {"name": "Khaki Beige", "hex": "#C3B091", "pantone": "15-1119", "family": "BEIGE", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Oatmeal Beige", "hex": "#D2C4B6", "pantone": "13-1008", "family": "BEIGE", "type": "SOLID", "value": "LIGHT"},
        ],
        "Grey": [
            {"name": "Charcoal Grey", "hex": "#36454F", "pantone": "19-4005", "family": "GREY", "type": "SOLID", "value": "DARK"},
            {"name": "Light Grey", "hex": "#D3D3D3", "pantone": "14-4002", "family": "GREY", "type": "SOLID", "value": "LIGHT"},
            {"name": "Medium Grey", "hex": "#808080", "pantone": "17-4402", "family": "GREY", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Slate Grey", "hex": "#708090", "pantone": "17-4408", "family": "GREY", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Silver Grey", "hex": "#C0C0C0", "pantone": "14-4107", "family": "GREY", "type": "SOLID", "value": "LIGHT"},
            {"name": "Heather Grey", "hex": "#9AA297", "pantone": "16-4402", "family": "GREY", "type": "SOLID", "value": "MEDIUM"},
            {"name": "Ash Grey", "hex": "#B2BEB5", "pantone": "15-4003", "family": "GREY", "type": "SOLID", "value": "LIGHT"},
            {"name": "Graphite Grey", "hex": "#5E5E5E", "pantone": "18-0601", "family": "GREY", "type": "SOLID", "value": "DARK"},
        ],
        "Black": [
            {"name": "Jet Black", "hex": "#000000", "pantone": "19-4007", "family": "BLACK", "type": "SOLID", "value": "DARK"},
            {"name": "Carbon Black", "hex": "#0C0C0C", "pantone": "19-4007", "family": "BLACK", "type": "SOLID", "value": "DARK"},
            {"name": "Onyx Black", "hex": "#353839", "pantone": "19-4005", "family": "BLACK", "type": "SOLID", "value": "DARK"},
            {"name": "Midnight Black", "hex": "#191970", "pantone": "19-3921", "family": "BLACK", "type": "SOLID", "value": "DARK"},
        ],
        "White": [
            {"name": "Pure White", "hex": "#FFFFFF", "pantone": "11-4001", "family": "WHITE", "type": "SOLID", "value": "LIGHT"},
            {"name": "Off White", "hex": "#FAF0E6", "pantone": "11-0602", "family": "WHITE", "type": "SOLID", "value": "LIGHT"},
            {"name": "Ivory White", "hex": "#FFFFF0", "pantone": "11-0602", "family": "WHITE", "type": "SOLID", "value": "LIGHT"},
            {"name": "Snow White", "hex": "#FFFAFA", "pantone": "11-4800", "family": "WHITE", "type": "SOLID", "value": "LIGHT"},
            {"name": "Pearl White", "hex": "#FDEEF4", "pantone": "11-0601", "family": "WHITE", "type": "SOLID", "value": "LIGHT"},
        ],
    }

    # Generate colors with proper codes
    color_id = 1
    for family_name, family_colors in color_families.items():
        for color_info in family_colors:
            # Convert hex to RGB
            hex_code = color_info["hex"]
            rgb_r = int(hex_code[1:3], 16)
            rgb_g = int(hex_code[3:5], 16)
            rgb_b = int(hex_code[5:7], 16)

            # Generate TCX code from Pantone if available
            tcx_code = None
            if color_info.get("pantone"):
                tcx_code = f"{color_info['pantone']} TCX"

            color_data = {
                'color_code': f"UC-{color_id:04d}",
                'color_name': color_info["name"],
                'display_name': color_info["name"],
                'color_family': color_info["family"],
                'color_type': color_info["type"],
                'color_value': color_info["value"],
                'finish_type': 'RAW',
                'hex_code': hex_code,
                'rgb_r': rgb_r,
                'rgb_g': rgb_g,
                'rgb_b': rgb_b,
                'pantone_code': color_info.get("pantone"),
                'tcx_code': tcx_code,
                'tpx_code': None,
                'description': f"{color_info['name']} - {color_info['family']} family color",
                'season': 'AW25',
                'year': 2025,
                'is_active': True
            }

            colors.append(color_data)
            color_id += 1

    return colors


def import_universal_colors(db: Session):
    """Import comprehensive universal colors"""
    colors_data = get_comprehensive_universal_colors()

    if len(colors_data) == 0:
        logger.warning("No universal color data to import!")
        return 0, 0

    imported_count, updated_count = batch_insert_universal_colors(db, colors_data, batch_size=500)
    logger.info(f"Universal Colors - Imported: {imported_count}, Updated: {updated_count}")

    return imported_count, updated_count


def run_migration():
    """Main migration function - imports comprehensive color data"""
    logger.info("=" * 60)
    logger.info("IMPORTING COMPREHENSIVE COLOR DATA")
    logger.info("=" * 60)

    db = SessionLocalSizeColor()

    try:
        # Try to import H&M colors from Excel (if file exists)
        # Check multiple possible locations
        excel_paths = [
            "data/hm_colors.xlsx",              # Backend data folder
            "/app/data/hm_colors.xlsx",         # Docker mounted path
            "../H&M colors.xlsx",               # Project root (from backend)
            "H&M colors.xlsx",                  # Current directory
            "/app/H&M colors.xlsx",             # Docker root
        ]

        hm_imported, hm_updated = 0, 0
        excel_found = False

        for excel_path in excel_paths:
            if os.path.exists(excel_path):
                logger.info(f"Found H&M Excel file at: {excel_path}")
                hm_imported, hm_updated = import_hm_colors_from_excel(excel_path, db)
                excel_found = True
                break

        if not excel_found:
            logger.info("No H&M Excel file found in any expected location - skipping H&M color import")
            logger.info(f"Searched paths: {excel_paths}")

        # Import universal colors
        universal_imported, universal_updated = import_universal_colors(db)

        # Summary
        total_processed = hm_imported + hm_updated + universal_imported + universal_updated

        logger.info("=" * 60)
        logger.info("COLOR IMPORT COMPLETED")
        logger.info("=" * 60)
        logger.info(f"H&M Colors - Imported: {hm_imported}, Updated: {hm_updated}")
        logger.info(f"Universal Colors - Imported: {universal_imported}, Updated: {universal_updated}")
        logger.info(f"Total Colors Processed: {total_processed}")

        if total_processed > 0:
            logger.info("Comprehensive color data imported successfully!")
        else:
            logger.warning("No color data was imported")

    except Exception as e:
        db.rollback()
        logger.error(f"Color import migration failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_migration()
