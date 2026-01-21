"""
Comprehensive Color Import Script
=================================

This script imports:
1. All H&M colors from Excel file (skipping null values)
2. Comprehensive universal color dataset (Pantone, TCX, RGB, Hex)

Usage: python import_comprehensive_colors.py <excel_file_path>
"""

import pandas as pd
import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import text
from core.database import SessionLocalSizeColor
import logging
from typing import List, Dict, Optional
import time
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
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
            
            logger.info(f"H&M Colors - Batch {i//batch_size + 1}: +{batch_inserted} new, ~{batch_updated} updated")
            
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
                # Check if color exists by color_code or pantone_code
                existing = db.execute(text("""
                    SELECT id FROM universal_colors 
                    WHERE color_code = :color_code 
                    OR (pantone_code IS NOT NULL AND pantone_code = :pantone_code)
                    OR (tcx_code IS NOT NULL AND tcx_code = :tcx_code)
                """), {
                    "color_code": color_data['color_code'],
                    "pantone_code": color_data.get('pantone_code'),
                    "tcx_code": color_data.get('tcx_code')
                }).fetchone()
                
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
            
            logger.info(f"Universal Colors - Batch {i//batch_size + 1}: +{batch_inserted} new, ~{batch_updated} updated")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error in universal colors batch {i//batch_size + 1}: {e}")
            raise
    
    return total_inserted, total_updated


def import_hm_colors_from_excel(excel_file_path: str, db: Session):
    """Import H&M colors from Excel file"""
    logger.info("=" * 60)
    logger.info("IMPORTING H&M COLORS FROM EXCEL")
    logger.info("=" * 60)
    
    if not os.path.exists(excel_file_path):
        logger.error(f"Excel file not found: {excel_file_path}")
        return 0, 0
    
    try:
        # Read Excel file - skip empty rows and use row 21 as header
        logger.info(f"Reading Excel file: {excel_file_path}")
        df = pd.read_excel(excel_file_path, header=21)  # Row 21 contains the headers
        
        # Drop rows that are completely empty
        df = df.dropna(how='all')
        
        logger.info(f"Found {len(df)} rows in Excel file")
        logger.info(f"Columns: {list(df.columns)}")
        
        # Validate required columns
        required_columns = ['Colour Code', 'Colour Master']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            logger.error(f"Missing required columns: {missing_columns}")
            return 0, 0
        
        # Prepare data for batch processing
        colors_data = []
        error_count = 0
        skipped_count = 0
        
        logger.info("Processing H&M color data...")
        
        for index, row in df.iterrows():
            try:
                # Extract and clean data from row
                color_code = clean_string_value(row.get('Colour Code'))
                color_master = clean_string_value(row.get('Colour Master'))
                color_value = clean_string_value(row.get('Colour Value'))
                mixed_name = clean_string_value(row.get('MIXED NAME'))
                
                # Skip rows with null/empty required fields
                if not color_code or not color_master:
                    logger.debug(f"Row {index + 1}: Missing Color Code or Color Master, skipping")
                    skipped_count += 1
                    continue
                
                # Skip UNDEFINED values as requested
                if color_master.upper() == 'UNDEFINED':
                    logger.debug(f"Row {index + 1}: UNDEFINED color master, skipping")
                    skipped_count += 1
                    continue
                
                # Prepare color data
                color_data = {
                    'color_code': color_code,
                    'color_master': color_master,
                    'color_value': color_value,
                    'mixed_name': mixed_name,
                    'is_active': True
                }
                
                colors_data.append(color_data)
                
                # Progress indicator for large datasets
                if (index + 1) % 500 == 0:
                    logger.info(f"Processed {index + 1}/{len(df)} rows...")
                
            except Exception as e:
                logger.error(f"Error processing row {index + 1}: {e}")
                error_count += 1
                continue
        
        logger.info(f"Prepared {len(colors_data)} H&M colors for import")
        logger.info(f"Skipped {skipped_count} rows with null/empty/undefined fields")
        
        if len(colors_data) == 0:
            logger.warning("No valid H&M color data to import!")
            return 0, 0
        
        # Batch insert for performance
        logger.info("Starting H&M colors batch import...")
        imported_count, updated_count = batch_insert_hm_colors(db, colors_data, batch_size=500)
        
        logger.info(f"✅ H&M Colors - Imported: {imported_count} new colors")
        logger.info(f"🔄 H&M Colors - Updated: {updated_count} existing colors")
        logger.info(f"⏭️  H&M Colors - Skipped: {skipped_count} rows (null/undefined fields)")
        logger.info(f"❌ H&M Colors - Errors: {error_count} rows")
        
        return imported_count, updated_count
        
    except Exception as e:
        logger.error(f"Error reading Excel file: {e}")
        return 0, 0


def generate_universal_color_code(db: Session, prefix: str = "UC") -> str:
    """Generate unique universal color code"""
    # Get the highest existing ID
    result = db.execute(text("SELECT MAX(id) FROM universal_colors")).fetchone()
    max_id = result[0] if result[0] else 0
    return f"{prefix}-{max_id + 1:04d}"


def get_comprehensive_universal_colors():
    """
    Generate comprehensive universal color dataset
    This includes major color families with variations
    """
    colors = []
    
    # Color families with their variations
    color_families = {
        "Red": [
            {"name": "Crimson Red", "hex": "#DC143C", "pantone": "18-1763", "family": "Red", "type": "Solid", "value": "Dark"},
            {"name": "Cherry Red", "hex": "#DE3163", "pantone": "18-1664", "family": "Red", "type": "Solid", "value": "Medium"},
            {"name": "Fire Engine Red", "hex": "#CE2029", "pantone": "18-1664", "family": "Red", "type": "Solid", "value": "Bright"},
            {"name": "Burgundy", "hex": "#800020", "pantone": "19-1557", "family": "Red", "type": "Solid", "value": "Dark"},
            {"name": "Maroon", "hex": "#800000", "pantone": "18-1142", "family": "Red", "type": "Solid", "value": "Dark"},
            {"name": "Rose Red", "hex": "#FF007F", "pantone": "17-1937", "family": "Red", "type": "Solid", "value": "Bright"},
            {"name": "Coral Red", "hex": "#FF4040", "pantone": "16-1546", "family": "Red", "type": "Solid", "value": "Medium"},
            {"name": "Brick Red", "hex": "#CB4154", "pantone": "18-1142", "family": "Red", "type": "Solid", "value": "Medium"},
            {"name": "Ruby Red", "hex": "#E0115F", "pantone": "18-1763", "family": "Red", "type": "Solid", "value": "Bright"},
            {"name": "Wine Red", "hex": "#722F37", "pantone": "19-1557", "family": "Red", "type": "Solid", "value": "Dark"},
        ],
        "Blue": [
            {"name": "Navy Blue", "hex": "#000080", "pantone": "19-3832", "family": "Blue", "type": "Solid", "value": "Dark"},
            {"name": "Royal Blue", "hex": "#4169E1", "pantone": "18-3963", "family": "Blue", "type": "Solid", "value": "Bright"},
            {"name": "Sky Blue", "hex": "#87CEEB", "pantone": "14-4318", "family": "Blue", "type": "Solid", "value": "Light"},
            {"name": "Powder Blue", "hex": "#B0E0E6", "pantone": "13-4110", "family": "Blue", "type": "Solid", "value": "Pastel"},
            {"name": "Teal Blue", "hex": "#008080", "pantone": "18-4735", "family": "Blue", "type": "Solid", "value": "Medium"},
            {"name": "Cobalt Blue", "hex": "#0047AB", "pantone": "19-4052", "family": "Blue", "type": "Solid", "value": "Bright"},
            {"name": "Midnight Blue", "hex": "#191970", "pantone": "19-3832", "family": "Blue", "type": "Solid", "value": "Dark"},
            {"name": "Cerulean Blue", "hex": "#007BA7", "pantone": "18-4043", "family": "Blue", "type": "Solid", "value": "Medium"},
            {"name": "Periwinkle Blue", "hex": "#CCCCFF", "pantone": "13-3820", "family": "Blue", "type": "Solid", "value": "Pastel"},
            {"name": "Steel Blue", "hex": "#4682B4", "pantone": "17-4041", "family": "Blue", "type": "Solid", "value": "Medium"},
        ],
        "Green": [
            {"name": "Forest Green", "hex": "#228B22", "pantone": "18-6024", "family": "Green", "type": "Solid", "value": "Dark"},
            {"name": "Emerald Green", "hex": "#50C878", "pantone": "17-5641", "family": "Green", "type": "Solid", "value": "Bright"},
            {"name": "Lime Green", "hex": "#32CD32", "pantone": "15-0343", "family": "Green", "type": "Solid", "value": "Bright"},
            {"name": "Olive Green", "hex": "#808000", "pantone": "18-0228", "family": "Green", "type": "Solid", "value": "Medium"},
            {"name": "Mint Green", "hex": "#98FB98", "pantone": "13-0221", "family": "Green", "type": "Solid", "value": "Pastel"},
            {"name": "Sage Green", "hex": "#9CAF88", "pantone": "15-6114", "family": "Green", "type": "Solid", "value": "Dusty"},
            {"name": "Hunter Green", "hex": "#355E3B", "pantone": "19-6026", "family": "Green", "type": "Solid", "value": "Dark"},
            {"name": "Sea Green", "hex": "#2E8B57", "pantone": "17-5936", "family": "Green", "type": "Solid", "value": "Medium"},
            {"name": "Pine Green", "hex": "#01796F", "pantone": "18-5845", "family": "Green", "type": "Solid", "value": "Dark"},
            {"name": "Apple Green", "hex": "#8DB600", "pantone": "16-0230", "family": "Green", "type": "Solid", "value": "Bright"},
        ],
        "Yellow": [
            {"name": "Lemon Yellow", "hex": "#FFFF00", "pantone": "13-0859", "family": "Yellow", "type": "Solid", "value": "Bright"},
            {"name": "Golden Yellow", "hex": "#FFD700", "pantone": "13-0947", "family": "Yellow", "type": "Solid", "value": "Medium"},
            {"name": "Canary Yellow", "hex": "#FFEF00", "pantone": "12-0752", "family": "Yellow", "type": "Solid", "value": "Bright"},
            {"name": "Mustard Yellow", "hex": "#FFDB58", "pantone": "14-0952", "family": "Yellow", "type": "Solid", "value": "Medium"},
            {"name": "Butter Yellow", "hex": "#FFFF8B", "pantone": "12-0643", "family": "Yellow", "type": "Solid", "value": "Pastel"},
            {"name": "Amber Yellow", "hex": "#FFBF00", "pantone": "14-1064", "family": "Yellow", "type": "Solid", "value": "Medium"},
            {"name": "Cream Yellow", "hex": "#FFFDD0", "pantone": "11-0616", "family": "Yellow", "type": "Solid", "value": "Light"},
            {"name": "Corn Yellow", "hex": "#FFF8DC", "pantone": "11-0618", "family": "Yellow", "type": "Solid", "value": "Light"},
            {"name": "Banana Yellow", "hex": "#FFE135", "pantone": "13-0859", "family": "Yellow", "type": "Solid", "value": "Bright"},
            {"name": "Saffron Yellow", "hex": "#F4C430", "pantone": "14-1064", "family": "Yellow", "type": "Solid", "value": "Medium"},
        ],
        "Orange": [
            {"name": "Tangerine Orange", "hex": "#FF8C00", "pantone": "15-1263", "family": "Orange", "type": "Solid", "value": "Bright"},
            {"name": "Burnt Orange", "hex": "#CC5500", "pantone": "17-1463", "family": "Orange", "type": "Solid", "value": "Dark"},
            {"name": "Peach Orange", "hex": "#FFCBA4", "pantone": "13-1023", "family": "Orange", "type": "Solid", "value": "Pastel"},
            {"name": "Coral Orange", "hex": "#FF7F50", "pantone": "16-1546", "family": "Orange", "type": "Solid", "value": "Medium"},
            {"name": "Pumpkin Orange", "hex": "#FF7518", "pantone": "16-1364", "family": "Orange", "type": "Solid", "value": "Bright"},
            {"name": "Apricot Orange", "hex": "#FBCEB1", "pantone": "13-1023", "family": "Orange", "type": "Solid", "value": "Light"},
            {"name": "Rust Orange", "hex": "#B7410E", "pantone": "18-1142", "family": "Orange", "type": "Solid", "value": "Dark"},
            {"name": "Mandarin Orange", "hex": "#FF8243", "pantone": "15-1263", "family": "Orange", "type": "Solid", "value": "Bright"},
            {"name": "Papaya Orange", "hex": "#FFEFD5", "pantone": "12-0727", "family": "Orange", "type": "Solid", "value": "Light"},
            {"name": "Copper Orange", "hex": "#B87333", "pantone": "17-1142", "family": "Orange", "type": "Solid", "value": "Medium"},
        ],
        "Purple": [
            {"name": "Royal Purple", "hex": "#7851A9", "pantone": "18-3838", "family": "Purple", "type": "Solid", "value": "Medium"},
            {"name": "Lavender Purple", "hex": "#E6E6FA", "pantone": "13-3820", "family": "Purple", "type": "Solid", "value": "Pastel"},
            {"name": "Violet Purple", "hex": "#8A2BE2", "pantone": "18-3838", "family": "Purple", "type": "Solid", "value": "Bright"},
            {"name": "Plum Purple", "hex": "#DDA0DD", "pantone": "15-3716", "family": "Purple", "type": "Solid", "value": "Medium"},
            {"name": "Eggplant Purple", "hex": "#614051", "pantone": "19-2311", "family": "Purple", "type": "Solid", "value": "Dark"},
            {"name": "Orchid Purple", "hex": "#DA70D6", "pantone": "16-3520", "family": "Purple", "type": "Solid", "value": "Medium"},
            {"name": "Amethyst Purple", "hex": "#9966CC", "pantone": "17-3834", "family": "Purple", "type": "Solid", "value": "Medium"},
            {"name": "Grape Purple", "hex": "#6F2DA8", "pantone": "18-3838", "family": "Purple", "type": "Solid", "value": "Dark"},
            {"name": "Lilac Purple", "hex": "#C8A2C8", "pantone": "14-3207", "family": "Purple", "type": "Solid", "value": "Light"},
            {"name": "Mauve Purple", "hex": "#E0B0FF", "pantone": "14-3207", "family": "Purple", "type": "Solid", "value": "Light"},
        ],
        "Pink": [
            {"name": "Hot Pink", "hex": "#FF69B4", "pantone": "17-2034", "family": "Pink", "type": "Solid", "value": "Bright"},
            {"name": "Baby Pink", "hex": "#F8BBD0", "pantone": "13-1404", "family": "Pink", "type": "Solid", "value": "Pastel"},
            {"name": "Rose Pink", "hex": "#FF007F", "pantone": "17-1937", "family": "Pink", "type": "Solid", "value": "Bright"},
            {"name": "Blush Pink", "hex": "#DE5D83", "pantone": "16-1720", "family": "Pink", "type": "Solid", "value": "Medium"},
            {"name": "Fuchsia Pink", "hex": "#FF00FF", "pantone": "17-2624", "family": "Pink", "type": "Solid", "value": "Bright"},
            {"name": "Salmon Pink", "hex": "#FA8072", "pantone": "16-1546", "family": "Pink", "type": "Solid", "value": "Medium"},
            {"name": "Dusty Pink", "hex": "#D2B2A0", "pantone": "15-1512", "family": "Pink", "type": "Solid", "value": "Dusty"},
            {"name": "Magenta Pink", "hex": "#FF0090", "pantone": "18-2436", "family": "Pink", "type": "Solid", "value": "Bright"},
            {"name": "Carnation Pink", "hex": "#FFA6C9", "pantone": "14-1909", "family": "Pink", "type": "Solid", "value": "Light"},
            {"name": "Bubblegum Pink", "hex": "#FFC1CC", "pantone": "13-1404", "family": "Pink", "type": "Solid", "value": "Pastel"},
        ],
        "Brown": [
            {"name": "Chocolate Brown", "hex": "#7B3F00", "pantone": "18-1142", "family": "Brown", "type": "Solid", "value": "Dark"},
            {"name": "Coffee Brown", "hex": "#6F4E37", "pantone": "18-1142", "family": "Brown", "type": "Solid", "value": "Dark"},
            {"name": "Tan Brown", "hex": "#D2B48C", "pantone": "14-1118", "family": "Brown", "type": "Solid", "value": "Light"},
            {"name": "Chestnut Brown", "hex": "#954535", "pantone": "18-1142", "family": "Brown", "type": "Solid", "value": "Medium"},
            {"name": "Mahogany Brown", "hex": "#C04000", "pantone": "18-1142", "family": "Brown", "type": "Solid", "value": "Dark"},
            {"name": "Camel Brown", "hex": "#C19A6B", "pantone": "15-1142", "family": "Brown", "type": "Solid", "value": "Medium"},
            {"name": "Mocha Brown", "hex": "#967117", "pantone": "17-1142", "family": "Brown", "type": "Solid", "value": "Medium"},
            {"name": "Sienna Brown", "hex": "#A0522D", "pantone": "17-1142", "family": "Brown", "type": "Solid", "value": "Medium"},
            {"name": "Umber Brown", "hex": "#635147", "pantone": "19-1142", "family": "Brown", "type": "Solid", "value": "Dark"},
            {"name": "Beige Brown", "hex": "#F5F5DC", "pantone": "12-0605", "family": "Brown", "type": "Solid", "value": "Light"},
        ],
        "Grey": [
            {"name": "Charcoal Grey", "hex": "#36454F", "pantone": "19-4005", "family": "Grey", "type": "Solid", "value": "Dark"},
            {"name": "Light Grey", "hex": "#D3D3D3", "pantone": "14-4002", "family": "Grey", "type": "Solid", "value": "Light"},
            {"name": "Medium Grey", "hex": "#808080", "pantone": "17-4402", "family": "Grey", "type": "Solid", "value": "Medium"},
            {"name": "Slate Grey", "hex": "#708090", "pantone": "17-4408", "family": "Grey", "type": "Solid", "value": "Medium"},
            {"name": "Silver Grey", "hex": "#C0C0C0", "pantone": "14-4107", "family": "Grey", "type": "Solid", "value": "Light"},
            {"name": "Ash Grey", "hex": "#B2BEB5", "pantone": "15-4101", "family": "Grey", "type": "Solid", "value": "Medium"},
            {"name": "Smoke Grey", "hex": "#738276", "pantone": "16-5907", "family": "Grey", "type": "Solid", "value": "Medium"},
            {"name": "Dove Grey", "hex": "#6D6E71", "pantone": "17-4402", "family": "Grey", "type": "Solid", "value": "Medium"},
            {"name": "Pearl Grey", "hex": "#E5E4E2", "pantone": "13-4105", "family": "Grey", "type": "Solid", "value": "Light"},
            {"name": "Storm Grey", "hex": "#4F666A", "pantone": "18-4510", "family": "Grey", "type": "Solid", "value": "Dark"},
        ],
        "Black": [
            {"name": "Jet Black", "hex": "#000000", "pantone": "19-4007", "family": "Black", "type": "Solid", "value": "Dark"},
            {"name": "Carbon Black", "hex": "#0C0C0C", "pantone": "19-4007", "family": "Black", "type": "Solid", "value": "Dark"},
            {"name": "Onyx Black", "hex": "#353839", "pantone": "19-4005", "family": "Black", "type": "Solid", "value": "Dark"},
            {"name": "Ebony Black", "hex": "#555D50", "pantone": "19-4005", "family": "Black", "type": "Solid", "value": "Dark"},
            {"name": "Midnight Black", "hex": "#2C3539", "pantone": "19-4005", "family": "Black", "type": "Solid", "value": "Dark"},
        ],
        "White": [
            {"name": "Pure White", "hex": "#FFFFFF", "pantone": "11-4001", "family": "White", "type": "Solid", "value": "Light"},
            {"name": "Off White", "hex": "#FAF0E6", "pantone": "11-0602", "family": "White", "type": "Solid", "value": "Light"},
            {"name": "Ivory White", "hex": "#FFFFF0", "pantone": "11-0602", "family": "White", "type": "Solid", "value": "Light"},
            {"name": "Cream White", "hex": "#FFFDD0", "pantone": "11-0616", "family": "White", "type": "Solid", "value": "Light"},
            {"name": "Pearl White", "hex": "#F8F6F0", "pantone": "11-4001", "family": "White", "type": "Solid", "value": "Light"},
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
                'finish_type': 'Raw',  # Default finish type
                'hex_code': hex_code,
                'rgb_r': rgb_r,
                'rgb_g': rgb_g,
                'rgb_b': rgb_b,
                'pantone_code': color_info.get("pantone"),
                'tcx_code': tcx_code,
                'tpx_code': None,
                'description': f"{color_info['name']} - {color_info['family']} family color",
                'season': 'AW25',  # Default season
                'year': 2025,
                'is_active': True
            }
            
            colors.append(color_data)
            color_id += 1
    
    return colors


def import_universal_colors(db: Session):
    """Import comprehensive universal colors"""
    logger.info("=" * 60)
    logger.info("IMPORTING COMPREHENSIVE UNIVERSAL COLORS")
    logger.info("=" * 60)
    
    # Get comprehensive color dataset
    colors_data = get_comprehensive_universal_colors()
    
    logger.info(f"Generated {len(colors_data)} universal colors for import")
    
    if len(colors_data) == 0:
        logger.warning("No universal color data to import!")
        return 0, 0
    
    # Batch insert for performance
    logger.info("Starting universal colors batch import...")
    imported_count, updated_count = batch_insert_universal_colors(db, colors_data, batch_size=500)
    
    logger.info(f"✅ Universal Colors - Imported: {imported_count} new colors")
    logger.info(f"🔄 Universal Colors - Updated: {updated_count} existing colors")
    
    return imported_count, updated_count


def main():
    """Main function to run the comprehensive color import"""
    if len(sys.argv) != 2:
        print("Usage: python import_comprehensive_colors.py <excel_file_path>")
        print("Example: python import_comprehensive_colors.py ../hm_colors.xlsx")
        print("Note: Run this script from inside the Docker container or ensure database connectivity")
        sys.exit(1)
    
    excel_file_path = sys.argv[1]
    
    # Check if file exists
    if not os.path.exists(excel_file_path):
        # Try relative to parent directory (common case when run from backend/)
        parent_path = os.path.join("..", os.path.basename(excel_file_path))
        if os.path.exists(parent_path):
            excel_file_path = parent_path
            logger.info(f"Found Excel file at: {excel_file_path}")
        else:
            logger.error(f"Excel file not found at: {sys.argv[1]} or {parent_path}")
            print(f"❌ Excel file not found: {sys.argv[1]}")
            print("Make sure the file exists and the path is correct.")
            sys.exit(1)
    
    start_time = time.time()
    
    # Get database session
    db = SessionLocalSizeColor()
    
    try:
        logger.info("🚀 STARTING COMPREHENSIVE COLOR IMPORT")
        logger.info("=" * 80)
        
        # Import H&M colors from Excel
        hm_imported, hm_updated = import_hm_colors_from_excel(excel_file_path, db)
        
        # Import universal colors
        universal_imported, universal_updated = import_universal_colors(db)
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        # Final summary
        logger.info("=" * 80)
        logger.info("🎉 COMPREHENSIVE COLOR IMPORT COMPLETED")
        logger.info("=" * 80)
        logger.info(f"📊 H&M COLORS:")
        logger.info(f"   ✅ Imported: {hm_imported} new colors")
        logger.info(f"   🔄 Updated: {hm_updated} existing colors")
        logger.info(f"   📈 Total H&M: {hm_imported + hm_updated} colors")
        logger.info("")
        logger.info(f"🌈 UNIVERSAL COLORS:")
        logger.info(f"   ✅ Imported: {universal_imported} new colors")
        logger.info(f"   🔄 Updated: {universal_updated} existing colors")
        logger.info(f"   📈 Total Universal: {universal_imported + universal_updated} colors")
        logger.info("")
        logger.info(f"🎯 GRAND TOTAL:")
        logger.info(f"   📊 Total Colors Processed: {hm_imported + hm_updated + universal_imported + universal_updated}")
        logger.info(f"   ⏱️  Processing Time: {processing_time:.2f} seconds")
        logger.info(f"   🚀 Average Speed: {(hm_imported + hm_updated + universal_imported + universal_updated)/processing_time:.1f} colors/second")
        logger.info("=" * 80)
        
        print("✅ Comprehensive color import completed successfully!")
        sys.exit(0)
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Comprehensive color import failed: {e}")
        print("❌ Comprehensive color import failed!")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()