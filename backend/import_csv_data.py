"""
Import CSV Data into Database
Imports Color, Size Chart, and Raw Material data from CSV files

Usage:
    # If running locally (outside Docker):
    POSTGRES_HOST_SETTINGS=localhost POSTGRES_HOST_MERCHANDISER=localhost python backend/import_csv_data.py
    
    # If running in Docker:
    docker-compose exec backend python backend/import_csv_data.py
"""
import csv
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Clean up environment variables that Settings class doesn't recognize
# These are likely from docker-compose.env or .env file but not in Settings model
env_vars_to_remove = [
    "FRONTEND_PORT", "BACKEND_PORT", "BACKEND_URL", 
    "NEXT_PUBLIC_API_MASK_URL", "NEXT_PUBLIC_ENCRYPT_SECRETS",
    "NEXT_PUBLIC_USER_COOKIE", "COMPOSE_PROJECT_NAME"
]
for var in env_vars_to_remove:
    if var in os.environ:
        del os.environ[var]

# Set environment variables for local execution if not in Docker
# Check if we're in Docker by looking for the container environment
in_docker = os.path.exists("/.dockerenv")
if not in_docker:
    # Running locally - use localhost
    if os.getenv("POSTGRES_HOST_SETTINGS") is None:
        os.environ["POSTGRES_HOST_SETTINGS"] = "localhost"
    if os.getenv("POSTGRES_HOST_MERCHANDISER") is None:
        os.environ["POSTGRES_HOST_MERCHANDISER"] = "localhost"

from sqlalchemy.orm import Session
from core.database import SessionLocalSettings, SessionLocalMerchandiser
from modules.settings.models.master_data import ColorFamily, Color, ColorValue, ColorMaster
from modules.merchandiser.models.merchandiser import YarnDetail, FabricDetail, SizeChart
from core.logging import setup_logging

logger = setup_logging()

# Base directory for CSV files
# When running in Docker, the working directory is /app (backend folder)
# CSV files should be in the parent directory (project root)
# When running locally, they're also in the parent directory
BASE_DIR = Path(__file__).parent.parent
COLOR_CSV = BASE_DIR / "DataBase Diagram - COLOUR.csv"
SIZE_CSV = BASE_DIR / "DataBase Diagram - Size Chart.csv"
RAW_MATERIAL_CSV = BASE_DIR / "DataBase Diagram - Raw Material.csv"

# If CSV files not found in parent, try current directory
if not COLOR_CSV.exists():
    BASE_DIR = Path(__file__).parent
    COLOR_CSV = BASE_DIR / "DataBase Diagram - COLOUR.csv"
    SIZE_CSV = BASE_DIR / "DataBase Diagram - Size Chart.csv"
    RAW_MATERIAL_CSV = BASE_DIR / "DataBase Diagram - Raw Material.csv"


def import_size_charts():
    """Import size chart data from Size Chart CSV"""
    db = SessionLocalMerchandiser()
    try:
        logger.info("=" * 60)
        logger.info("Starting Size Chart import...")
        
        if not SIZE_CSV.exists():
            logger.error(f"❌ Size Chart CSV not found at {SIZE_CSV}")
            return 0
        
        sizes_imported = 0
        sizes_skipped = 0
        
        with open(SIZE_CSV, 'r', encoding='utf-8') as f:
            # Read the file first to handle header variations
            lines = f.readlines()
            # Find header line (contains SIZE ID)
            header_line_idx = None
            for idx, line in enumerate(lines):
                if 'SIZE ID' in line.upper():
                    header_line_idx = idx
                    break
            
            if header_line_idx is None:
                logger.error("Could not find SIZE ID header in CSV")
                return 0
            
            # Parse from the header line onwards
            reader = csv.DictReader(lines[header_line_idx:])
            for row in reader:
                # Try different column name formats (with/without leading space)
                size_id = (row.get('SIZE ID', '').strip() or 
                          row.get(' SIZE ID', '').strip() or
                          row.get('SIZE ID ', '').strip())
                
                # Skip empty rows and rows without valid size_id
                if not size_id or size_id == '-' or size_id == '' or size_id.upper().startswith('SIZE'):
                    continue
                
                # Check if already exists
                existing = db.query(SizeChart).filter(SizeChart.size_id == size_id).first()
                if existing:
                    sizes_skipped += 1
                    continue
                
                # Parse numeric values
                def parse_float(value):
                    if not value or value.strip() == '-' or value.strip() == '':
                        return None
                    try:
                        return float(value.strip())
                    except:
                        return None
                
                size_chart = SizeChart(
                    size_id=size_id,
                    size_name=row.get('SIZE NAME', '').strip() or size_id,
                    garment_type=row.get('GARMENT TYPE', '').strip() or None,
                    gender=row.get('GENDER', '').strip() or None,
                    age_group=row.get('AGE GROUP', '').strip() or None,
                    chest=parse_float(row.get('CHEST', '')),
                    waist=parse_float(row.get('WAIST', '')),
                    hip=parse_float(row.get('HIP', '')),
                    sleeve_length=parse_float(row.get('SLEEVE LENGTH', '')),
                    body_length=parse_float(row.get('BODY LENGTH', '')),
                    shoulder_width=parse_float(row.get('SHOULDER WIDTH', '')),
                    inseam=parse_float(row.get('INSEAM', '')),
                    uom=(row.get('UOM', '').strip() or 'inch').lower(),
                    remarks=row.get('REMARKS', '').strip() or None,
                )
                db.add(size_chart)
                sizes_imported += 1
                
                # Commit every 50 records
                if sizes_imported % 50 == 0:
                    db.commit()
                    logger.info(f"  Imported {sizes_imported} size charts...")
        
        db.commit()
        logger.info(f"✅ Size Chart Import Complete:")
        logger.info(f"   - Imported: {sizes_imported} records")
        logger.info(f"   - Skipped (duplicates): {sizes_skipped} records")
        return sizes_imported
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error importing size charts: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


def import_yarn_and_fabrics():
    """Import Yarn and Fabric data from Raw Material CSV"""
    db = SessionLocalMerchandiser()
    try:
        logger.info("=" * 60)
        logger.info("Starting Raw Material import...")
        
        if not RAW_MATERIAL_CSV.exists():
            logger.error(f"❌ Raw Material CSV not found at {RAW_MATERIAL_CSV}")
            return 0, 0
        
        yarns_imported = 0
        yarns_skipped = 0
        fabrics_imported = 0
        fabrics_skipped = 0
        
        with open(RAW_MATERIAL_CSV, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        i = 0
        current_section = None
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Detect section headers
            if 'YARN ID' in line and 'YARN NAME' in line:
                current_section = 'yarn'
                i += 1
                continue
            elif 'Fabric ID' in line and 'Fabric Name' in line:
                current_section = 'fabric'
                i += 1
                continue
            elif 'Product ID' in line:
                # Skip products section (trims, etc.)
                current_section = None
                i += 1
                continue
            
            # Skip empty lines
            if not line:
                i += 1
                continue
            
            # Process Yarn section
            if current_section == 'yarn':
                parts = [p.strip() for p in line.split(',')]
                if len(parts) < 2:
                    i += 1
                    continue
                
                yarn_id = parts[0]
                # Check if it's a valid yarn ID (starts with Y and has numbers)
                if not yarn_id or not yarn_id.startswith('Y') or len(yarn_id) < 4:
                    i += 1
                    continue
                
                # Check if already exists
                existing = db.query(YarnDetail).filter(YarnDetail.yarn_id == yarn_id).first()
                if existing:
                    yarns_skipped += 1
                    i += 1
                    continue
                
                yarn = YarnDetail(
                    yarn_id=yarn_id,
                    yarn_name=parts[1] if len(parts) > 1 else yarn_id,
                    yarn_composition=parts[2] if len(parts) > 2 else None,
                    blend_ratio=parts[3] if len(parts) > 3 else None,
                    yarn_count=parts[4] if len(parts) > 4 else None,
                    count_system=parts[5] if len(parts) > 5 else None,
                    yarn_type=parts[6] if len(parts) > 6 else None,
                    yarn_form=parts[7] if len(parts) > 7 else None,
                    tpi=parts[8] if len(parts) > 8 else None,
                    yarn_finish=parts[9] if len(parts) > 9 else None,
                    color=parts[10] if len(parts) > 10 else None,
                    dye_type=parts[11] if len(parts) > 11 else None,
                    uom=(parts[12].lower() if len(parts) > 12 and parts[12] else 'kg'),
                    remarks=parts[13] if len(parts) > 13 else None,
                )
                db.add(yarn)
                yarns_imported += 1
                
                if yarns_imported % 20 == 0:
                    db.commit()
            
            # Process Fabric section
            elif current_section == 'fabric':
                parts = [p.strip() for p in line.split(',')]
                if len(parts) < 2:
                    i += 1
                    continue
                
                fabric_id = parts[0]
                if not fabric_id or not fabric_id.startswith('F'):
                    i += 1
                    continue
                
                # Check if already exists
                existing = db.query(FabricDetail).filter(FabricDetail.fabric_id == fabric_id).first()
                if existing:
                    fabrics_skipped += 1
                    i += 1
                    continue
                
                # Parse GSM
                gsm = None
                if len(parts) > 6:
                    try:
                        gsm = int(parts[6]) if parts[6] and parts[6].isdigit() else None
                    except:
                        pass
                
                fabric = FabricDetail(
                    fabric_id=fabric_id,
                    fabric_name=parts[1] if len(parts) > 1 else fabric_id,
                    category=parts[2] if len(parts) > 2 else None,
                    type=parts[3] if len(parts) > 3 else None,
                    construction=parts[4] if len(parts) > 4 else None,
                    weave_knit=parts[5] if len(parts) > 5 else None,
                    gsm=gsm,
                    gauge_epi=parts[7] if len(parts) > 7 else None,
                    width=parts[8] if len(parts) > 8 else None,
                    stretch=parts[9] if len(parts) > 9 else None,
                    shrink=parts[10] if len(parts) > 10 else None,
                    finish=parts[11] if len(parts) > 11 else None,
                    composition=parts[12] if len(parts) > 12 else None,
                    handfeel=parts[13] if len(parts) > 13 else None,
                    uom=(parts[14].lower() if len(parts) > 14 and parts[14] else 'meter'),
                    remarks=parts[15] if len(parts) > 15 else None,
                )
                db.add(fabric)
                fabrics_imported += 1
                
                if fabrics_imported % 20 == 0:
                    db.commit()
            
            i += 1
        
        db.commit()
        logger.info(f"✅ Raw Material Import Complete:")
        logger.info(f"   - Yarns Imported: {yarns_imported} records")
        logger.info(f"   - Yarns Skipped: {yarns_skipped} records")
        logger.info(f"   - Fabrics Imported: {fabrics_imported} records")
        logger.info(f"   - Fabrics Skipped: {fabrics_skipped} records")
        return yarns_imported, fabrics_imported
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error importing raw materials: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


def import_colors():
    """Import color data from Color CSV - H&M codes section"""
    db = SessionLocalSettings()
    try:
        logger.info("=" * 60)
        logger.info("Starting Color import...")
        
        if not COLOR_CSV.exists():
            logger.error(f"❌ Color CSV not found at {COLOR_CSV}")
            return 0
        
        colors_imported = 0
        colors_skipped = 0
        hnm_section_started = False
        
        with open(COLOR_CSV, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            
            for row in reader:
                # Skip empty rows
                if not row or not any(cell.strip() for cell in row):
                    continue
                
                # Check if we've reached H&M section
                if 'H&M COLOR CODE' in str(row):
                    hnm_section_started = True
                    # Skip header row and empty row after header
                    next(reader, None)
                    next(reader, None)
                    continue
                
                # Process H&M color codes section
                if hnm_section_started:
                    if len(row) < 3:
                        continue
                    
                    colour_code = row[0].strip() if len(row) > 0 else ''
                    colour_master = row[1].strip() if len(row) > 1 else ''
                    colour_value = row[2].strip() if len(row) > 2 else ''
                    mixed_name = row[3].strip() if len(row) > 3 else ''
                    
                    # Skip header row and invalid rows
                    if not colour_code or colour_code in ['Colour Code', 'H&M COLOR CODE']:
                        continue
                    
                    if not colour_master or not colour_value:
                        continue
                    
                    # Check if color master already exists
                    existing = db.query(ColorMaster).filter(
                        ColorMaster.color_code == colour_code,
                        ColorMaster.color_code_type == "H&M"
                    ).first()
                    
                    if existing:
                        colors_skipped += 1
                        continue
                    
                    # Get or create color family
                    family_name = colour_master.upper()
                    family = db.query(ColorFamily).filter(
                        ColorFamily.color_family == family_name
                    ).first()
                    
                    if not family:
                        family = ColorFamily(
                            color_family=family_name,
                            color_family_code=family_name[:3].upper(),
                            sort_order=0,
                            is_active=True
                        )
                        db.add(family)
                        db.commit()
                        db.refresh(family)
                    
                    # Get or create color
                    color = db.query(Color).filter(
                        Color.color == family_name,
                        Color.color_family_id == family.id
                    ).first()
                    
                    if not color:
                        color = Color(
                            color=family_name,
                            color_family_id=family.id,
                            is_active=True
                        )
                        db.add(color)
                        db.commit()
                        db.refresh(color)
                    
                    # Get or create color value
                    value_code = colour_value.upper()
                    value = db.query(ColorValue).filter(
                        ColorValue.color_value_code == value_code
                    ).first()
                    
                    if not value:
                        value = ColorValue(
                            color_value_code=value_code,
                            color_value_code_type="H&M",
                            sort_order=0,
                            is_active=True
                        )
                        db.add(value)
                        db.commit()
                        db.refresh(value)
                    
                    # Check if color master already exists with this color_code
                    existing_master = db.query(ColorMaster).filter(
                        ColorMaster.color_code == colour_code,
                        ColorMaster.color_code_type == "H&M"
                    ).first()
                    
                    if not existing_master:
                        # The unique constraint is now on (color_code, color_code_type)
                        # This allows multiple codes per color+value combination
                        # Just check if this specific color_code already exists (already done above)
                        # Create color master
                        color_name = mixed_name or f"{colour_master} {colour_value}"
                        try:
                            color_master = ColorMaster(
                                color_id=color.id,
                                color_family_id=family.id,
                                color_value_id=value.id,
                                color_name=color_name,
                                color_code_type="H&M",
                                color_code=colour_code,
                                is_active=True
                            )
                            db.add(color_master)
                            db.commit()  # Commit immediately to avoid batch conflicts
                            colors_imported += 1
                        except Exception as e:
                            db.rollback()
                            colors_skipped += 1
                            # Skip duplicate constraint violations silently
                            if "uq_color_code_type" not in str(e) and "duplicate" not in str(e).lower():
                                logger.warning(f"Error importing {colour_code}: {e}")
                    else:
                        colors_skipped += 1
                    
                    # Log progress every 100 records
                    if (colors_imported + colors_skipped) % 100 == 0:
                        logger.info(f"  Processed {colors_imported + colors_skipped} H&M color codes ({colors_imported} imported)...")
                
                # Process basic color section (first section)
                elif not hnm_section_started:
                    # Skip header row
                    if 'COLOR ID' in str(row[0]).upper():
                        continue
                    
                    color_id = row[0].strip() if len(row) > 0 else ''
                    if not color_id or not color_id.startswith('C'):
                        continue
                    
                    color_name = row[1].strip() if len(row) > 1 else ''
                    color_code = row[2].strip() if len(row) > 2 else ''
                    color_family_name = row[3].strip() if len(row) > 3 else ''
                    colour_value = row[5].strip() if len(row) > 5 else ''
                    hm_code = row[9].strip() if len(row) > 9 else ''
                    
                    if not color_name or not color_family_name:
                        continue
                    
                    # Get or create color family
                    family_name = color_family_name.upper()
                    family = db.query(ColorFamily).filter(
                        ColorFamily.color_family == family_name
                    ).first()
                    
                    if not family:
                        family = ColorFamily(
                            color_family=family_name,
                            color_family_code=family_name[:3].upper(),
                            sort_order=0,
                            is_active=True
                        )
                        db.add(family)
                        db.commit()
                        db.refresh(family)
                    
                    # Get or create color
                    color = db.query(Color).filter(
                        Color.color == color_name.upper(),
                        Color.color_family_id == family.id
                    ).first()
                    
                    if not color:
                        color = Color(
                            color=color_name.upper(),
                            color_family_id=family.id,
                            color_code=color_code if color_code.startswith('#') else None,
                            is_active=True
                        )
                        db.add(color)
                        db.commit()
                        db.refresh(color)
                    
                    # If H&M code exists, create H&M color master entry
                    if hm_code:
                        value_code = (colour_value or "STANDARD").upper()
                        value = db.query(ColorValue).filter(
                            ColorValue.color_value_code == value_code
                        ).first()
                        
                        if not value and colour_value:
                            value = ColorValue(
                                color_value_code=value_code,
                                color_value_code_type="H&M",
                                sort_order=0,
                                is_active=True
                            )
                            db.add(value)
                            db.commit()
                            db.refresh(value)
                        
                        if value:
                            existing = db.query(ColorMaster).filter(
                                ColorMaster.color_code == hm_code,
                                ColorMaster.color_code_type == "H&M"
                            ).first()
                            
                            if not existing:
                                color_master = ColorMaster(
                                    color_id=color.id,
                                    color_family_id=family.id,
                                    color_value_id=value.id,
                                    color_name=color_name,
                                    color_code_type="H&M",
                                    color_code=hm_code,
                                    hex_value=color_code if color_code.startswith('#') else None,
                                    is_active=True
                                )
                                db.add(color_master)
                                colors_imported += 1
        
        db.commit()
        logger.info(f"✅ Color Import Complete:")
        logger.info(f"   - Imported: {colors_imported} color master records")
        logger.info(f"   - Skipped (duplicates): {colors_skipped} records")
        return colors_imported
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error importing colors: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


def main():
    """Main import function"""
    logger.info("=" * 60)
    logger.info("🚀 Starting CSV Data Import")
    logger.info("=" * 60)
    
    try:
        # Import in order
        size_count = import_size_charts()
        yarn_count, fabric_count = import_yarn_and_fabrics()
        color_count = import_colors()
        
        logger.info("=" * 60)
        logger.info("✅ ALL IMPORTS COMPLETED SUCCESSFULLY!")
        logger.info("=" * 60)
        logger.info(f"Summary:")
        logger.info(f"  - Size Charts: {size_count} records")
        logger.info(f"  - Yarns: {yarn_count} records")
        logger.info(f"  - Fabrics: {fabric_count} records")
        logger.info(f"  - Colors: {color_count} records")
        logger.info("=" * 60)
        logger.info("✨ Data is now available in the system!")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
