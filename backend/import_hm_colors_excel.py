"""
Import H&M Colors from Excel file - Updated for simplified structure
This script reads an Excel file and imports H&M color data into the new simplified table
Fields: Color Code, Color Master, Color Value, MIXED NAME
"""

import pandas as pd
import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import text
from core.database import SessionLocalSizeColor
import logging
from typing import List, Dict
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def batch_insert_colors(db: Session, colors_data: List[Dict], batch_size: int = 500):
    """
    Batch insert colors for better performance with large datasets
    """
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
            
            logger.info(f"Processed batch {i//batch_size + 1}: +{batch_inserted} new, ~{batch_updated} updated")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error in batch {i//batch_size + 1}: {e}")
            raise
    
    return total_inserted, total_updated


def clean_string_value(value) -> str:
    """Clean and normalize string values"""
    if pd.isna(value) or value is None:
        return None
    
    # Convert to string and strip whitespace
    cleaned = str(value).strip()
    
    # Return None for empty strings
    if not cleaned or cleaned.lower() in ['nan', 'null', '']:
        return None
    
    return cleaned


def import_hm_colors_from_excel(excel_file_path: str):
    """
    Import H&M colors from Excel file with new simplified structure:
    - Color Code -> color_code
    - Color Master -> color_master  
    - Color Value -> color_value
    - MIXED NAME -> mixed_name
    """
    
    if not os.path.exists(excel_file_path):
        logger.error(f"Excel file not found: {excel_file_path}")
        return False
    
    try:
        start_time = time.time()
        
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
            return False
        
        # Get database session
        db = SessionLocalSizeColor()
        
        try:
            # Prepare data for batch processing
            colors_data = []
            error_count = 0
            skipped_count = 0
            
            logger.info("Processing color data...")
            
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
            
            logger.info(f"Prepared {len(colors_data)} colors for import")
            logger.info(f"Skipped {skipped_count} rows with null/empty required fields")
            
            if len(colors_data) == 0:
                logger.warning("No valid color data to import!")
                return False
            
            # Batch insert for performance
            logger.info("Starting batch import...")
            imported_count, updated_count = batch_insert_colors(db, colors_data, batch_size=500)
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            logger.info("=" * 60)
            logger.info("H&M COLORS IMPORT COMPLETED")
            logger.info("=" * 60)
            logger.info(f"✅ Imported: {imported_count} new colors")
            logger.info(f"🔄 Updated: {updated_count} existing colors")
            logger.info(f"⏭️  Skipped: {skipped_count} rows (null fields)")
            logger.info(f"❌ Errors: {error_count} rows")
            logger.info(f"📊 Total processed: {imported_count + updated_count} colors")
            logger.info(f"⏱️  Processing time: {processing_time:.2f} seconds")
            logger.info(f"🚀 Average: {len(colors_data)/processing_time:.1f} colors/second")
            
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Database error: {e}")
            return False
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error reading Excel file: {e}")
        return False


def main():
    """Main function to run the import"""
    if len(sys.argv) != 2:
        print("Usage: python import_hm_colors_excel.py <excel_file_path>")
        print("Example: python import_hm_colors_excel.py hm_colors.xlsx")
        sys.exit(1)
    
    excel_file_path = sys.argv[1]
    success = import_hm_colors_from_excel(excel_file_path)
    
    if success:
        print("✅ H&M colors import completed successfully!")
        sys.exit(0)
    else:
        print("❌ H&M colors import failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()