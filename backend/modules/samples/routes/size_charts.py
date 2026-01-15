"""
Size Charts API Routes - Size Chart System
Handles size chart management with buyer and product type filtering
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from core.database import get_db_samples
from core.services.buyer_service import buyer_service
import json
import re

router = APIRouter()


# Pydantic models
class ProductTypeResponse(BaseModel):
    id: int
    type_name: str
    type_code: str
    measurement_fields: List[str]
    is_active: bool


class SizeChartProfileResponse(BaseModel):
    id: int
    profile_name: str
    buyer_id: Optional[int]
    is_general: bool
    is_active: bool


class SizeChartResponse(BaseModel):
    id: int
    profile_id: int
    product_type_id: int
    size_name: str
    size_order: int
    measurements: Dict[str, Any]
    is_active: bool
    gender: Optional[str] = None
    auto_generated_id: Optional[str] = None
    profile_name: Optional[str] = None
    product_type_name: Optional[str] = None


class SizeChartCreate(BaseModel):
    profile_id: int
    product_type_id: int
    size_name: str
    size_order: int
    measurements: Dict[str, Any]
    gender: Optional[str] = "Unisex"
    auto_generated_id: Optional[str] = None


@router.post("/admin/enhance-schema")
async def enhance_size_chart_schema(db: Session = Depends(get_db_samples)):
    """Admin endpoint to enhance size chart schema with all measurement fields"""
    try:
        # Add gender and auto-ID columns
        db.execute(text("""
            ALTER TABLE size_chart_master 
            ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'Unisex',
            ADD COLUMN IF NOT EXISTS auto_generated_id VARCHAR(50);
        """))
        
        # Create indexes
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_size_chart_gender 
            ON size_chart_master(gender);
            
            CREATE INDEX IF NOT EXISTS idx_size_chart_auto_id
            ON size_chart_master(auto_generated_id);
        """))
        
        # Add all measurement fields
        measurement_columns = [
            'chest_bust', 'body_length', 'sleeve_length', 'shoulder_width',
            'waist', 'hem_width', 'neck_collar_width', 'cuff_width',
            'thigh', 'knee', 'leg_opening', 'front_rise', 'back_rise',
            'hip', 'cuff_opening', 'collar_neck',
            'head_circumference', 'height_crown', 'brim_width',
            'hand_circumference', 'hand_length', 'wrist_opening',
            'length', 'width'
        ]
        
        added_columns = []
        for column in measurement_columns:
            try:
                db.execute(text(f"""
                    ALTER TABLE size_chart_master 
                    ADD COLUMN IF NOT EXISTS {column} DECIMAL(10, 2);
                """))
                added_columns.append(column)
            except Exception as e:
                # Column might already exist or other database error
                logger.debug(f"Column {column} might already exist or error: {e}")
                pass
        
        db.commit()
        
        return {
            "message": "Size chart schema enhanced successfully",
            "columns_processed": len(measurement_columns),
            "columns_added": len(added_columns)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Schema enhancement failed: {str(e)}")


@router.post("/admin/update-product-types")
async def update_product_types(db: Session = Depends(get_db_samples)):
    """Update product types with measurement field definitions"""
    try:
        product_types_config = {
            "Sweater": {
                "fields": ["chest_bust", "body_length", "sleeve_length", "shoulder_width", 
                           "waist", "hem_width", "neck_collar_width", "cuff_width"],
                "required": ["chest_bust", "body_length", "sleeve_length"],
                "description": "Measurements for sweaters, pullovers, and hoodies"
            },
            "Pants": {
                "fields": ["waist", "hip", "inseam", "thigh", "knee", 
                           "leg_opening", "front_rise", "back_rise"],
                "required": ["waist", "hip", "inseam"],
                "description": "Measurements for pants, trousers, and shorts"
            },
            "Jacket": {
                "fields": ["chest_bust", "body_length", "shoulder_width", "sleeve_length",
                           "waist", "hip", "cuff_opening", "collar_neck"],
                "required": ["chest_bust", "body_length", "shoulder_width"],
                "description": "Measurements for jackets and coats"
            },
            "Hat": {
                "fields": ["head_circumference", "height_crown", "brim_width"],
                "required": ["head_circumference"],
                "description": "Measurements for hats, beanies, and caps"
            },
            "Gloves": {
                "fields": ["hand_circumference", "hand_length", "wrist_opening"],
                "required": ["hand_circumference", "hand_length"],
                "description": "Measurements for gloves and mittens"
            },
            "Muffler": {
                "fields": ["length", "width", "hem_width"],
                "required": ["length", "width"],
                "description": "Measurements for scarves, mufflers, and wraps"
            }
        }
        
        updated = 0
        for type_name, config in product_types_config.items():
            db.execute(text("""
                UPDATE product_types 
                SET measurement_fields = CAST(:fields AS jsonb)
                WHERE type_name = :name
            """), {"fields": json.dumps(config), "name": type_name})
            updated += 1
        
        db.commit()
        
        return {
            "message": "Product types updated successfully",
            "updated_count": updated
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")


@router.post("/generate-id")
async def generate_size_chart_id(
    profile_id: int,
    gender: str,
    product_type_id: int,
    db: Session = Depends(get_db_samples)
):
    """Generate auto-ID for size chart (format: S_{Buyer_name}_{producttype_3_words}_{counter})"""
    try:
        # Get profile with buyer_id
        profile_query = text("SELECT profile_name, buyer_id FROM size_chart_profiles WHERE id = :id")
        profile_row = db.execute(profile_query, {"id": profile_id}).fetchone()
        
        if not profile_row:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        profile_name, buyer_id = profile_row
        
        # Get buyer name from clients database if buyer_id exists, otherwise use profile_name
        buyer_name = None
        if buyer_id:
            buyer_name = buyer_service.get_buyer_name(buyer_id)
        
        # Use buyer_name if available, otherwise use profile_name
        buyer_name_clean = (buyer_name or profile_name).upper()
        # Clean buyer name: remove special chars, keep only alphanumeric and spaces, then join
        buyer_name_clean = re.sub(r'[^A-Z0-9\s]', '', buyer_name_clean).strip()
        buyer_name_clean = buyer_name_clean.replace(' ', '_')  # Replace spaces with underscores
        
        # Get product type name (not code)
        type_query = text("SELECT type_name FROM product_types WHERE id = :id")
        type_row = db.execute(type_query, {"id": product_type_id}).fetchone()
        
        if not type_row:
            raise HTTPException(status_code=404, detail="Product type not found")
        
        type_name = type_row[0]
        # Get first 3 words from product type name
        words = type_name.upper().split()[:3]
        product_type_3_words = '_'.join(words) if words else type_name.upper().replace(' ', '_')
        # Clean: remove special chars, keep only alphanumeric and underscores
        product_type_3_words = re.sub(r'[^A-Z0-9_]', '', product_type_3_words)
        
        # Get counter - must be unique across ALL size charts (not filtered by profile/product_type/gender)
        # Find the highest counter for this buyer_name + product_type combination
        counter_query = text("""
            SELECT MAX(
                CAST(
                    SUBSTRING(
                        auto_generated_id 
                        FROM '_(\\d+)$'
                    ) AS INTEGER
                )
            )
            FROM size_chart_master 
            WHERE auto_generated_id LIKE :pattern
        """)
        
        # Pattern: S_{buyer_name}_{product_type}_%
        pattern = f"S_{buyer_name_clean}_{product_type_3_words}_%"
        max_counter = db.execute(counter_query, {"pattern": pattern}).scalar()
        
        # If no existing records, start at 1, otherwise increment
        counter = (max_counter or 0) + 1
        
        # Format: S_{Buyer_name}_{producttype_3_words}_{counter}
        auto_id = f"S_{buyer_name_clean}_{product_type_3_words}_{str(counter).zfill(4)}"
        
        return {"size_id": auto_id, "counter": counter}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"ID generation failed: {str(e)}"
        print(f"ERROR in generate_size_chart_id: {error_detail}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_detail)


@router.get("/product-types", response_model=List[ProductTypeResponse])
async def get_product_types(
    is_active: bool = Query(True),
    db: Session = Depends(get_db_samples)
):
    """Get all product types"""
    try:
        query = text("""
            SELECT id, type_name, type_code, measurement_fields, is_active
            FROM product_types
            WHERE is_active = :is_active
            ORDER BY type_name
        """)
        result = db.execute(query, {"is_active": is_active})
        
        types = []
        for row in result:
            # measurement_fields is already a list from JSONB, no need to parse
            fields = row[3] if isinstance(row[3], list) else (json.loads(row[3]) if row[3] else [])
            types.append({
                "id": row[0],
                "type_name": row[1],
                "type_code": row[2],
                "measurement_fields": fields,
                "is_active": row[4]
            })
        
        return types
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch product types: {str(e)}")


@router.get("/profiles", response_model=List[SizeChartProfileResponse])
async def get_size_chart_profiles(
    buyer_id: Optional[int] = Query(None),
    is_active: bool = Query(True),
    db: Session = Depends(get_db_samples)
):
    """Get all size chart profiles (optionally filtered by buyer)"""
    try:
        if buyer_id:
            query = text("""
                SELECT id, profile_name, buyer_id, is_general, is_active
                FROM size_chart_profiles
                WHERE (buyer_id = :buyer_id OR is_general = TRUE)
                  AND is_active = :is_active
                ORDER BY profile_name
            """)
            result = db.execute(query, {"buyer_id": buyer_id, "is_active": is_active})
        else:
            query = text("""
                SELECT id, profile_name, buyer_id, is_general, is_active
                FROM size_chart_profiles
                WHERE is_active = :is_active
                ORDER BY profile_name
            """)
            result = db.execute(query, {"is_active": is_active})
        
        profiles = []
        for row in result:
            profiles.append({
                "id": row[0],
                "profile_name": row[1],
                "buyer_id": row[2],
                "is_general": row[3],
                "is_active": row[4]
            })
        
        return profiles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profiles: {str(e)}")


@router.get("", response_model=List[SizeChartResponse])
async def get_size_charts(
    profile_id: Optional[int] = Query(None),
    product_type_id: Optional[int] = Query(None),
    is_active: bool = Query(True),
    db: Session = Depends(get_db_samples)
):
    """
    Get size charts with optional filtering by profile and product type
    Returns size charts with measurements
    """
    try:
        query_str = """
            SELECT sc.id, sc.profile_id, sc.product_type_id, sc.size_name, 
                   sc.size_order, sc.measurements, sc.gender, sc.auto_generated_id, sc.is_active,
                   p.profile_name, pt.type_name
            FROM size_chart_master sc
            LEFT JOIN size_chart_profiles p ON sc.profile_id = p.id
            LEFT JOIN product_types pt ON sc.product_type_id = pt.id
            WHERE sc.is_active = :is_active
        """
        
        params = {"is_active": is_active}
        
        if profile_id:
            query_str += " AND sc.profile_id = :profile_id"
            params["profile_id"] = profile_id
        
        if product_type_id:
            query_str += " AND sc.product_type_id = :product_type_id"
            params["product_type_id"] = product_type_id
        
        query_str += " ORDER BY sc.size_order"
        
        result = db.execute(text(query_str), params)
        
        charts = []
        for row in result:
            # measurements is already a dict from JSONB, no need to parse
            measurements = row[5] if isinstance(row[5], dict) else (json.loads(row[5]) if row[5] else {})
            charts.append({
                "id": row[0],
                "profile_id": row[1],
                "product_type_id": row[2],
                "size_name": row[3],
                "size_order": row[4],
                "measurements": measurements,
                "gender": row[6] if len(row) > 6 else None,
                "auto_generated_id": row[7] if len(row) > 7 else None,
                "is_active": row[8] if len(row) > 8 else row[6],
                "profile_name": row[9] if len(row) > 9 else (row[7] if len(row) > 7 else None),
                "product_type_name": row[10] if len(row) > 10 else (row[8] if len(row) > 8 else None)
            })
        
        return charts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch size charts: {str(e)}")


@router.post("", response_model=SizeChartResponse)
async def create_size_chart(
    size_chart: SizeChartCreate,
    db: Session = Depends(get_db_samples)
):
    """Create a new size chart entry"""
    try:
        # Check if entry already exists
        check_query = text("""
            SELECT id FROM size_chart_master
            WHERE profile_id = :profile_id 
              AND product_type_id = :product_type_id
              AND size_name = :size_name
        """)
        existing = db.execute(check_query, {
            "profile_id": size_chart.profile_id,
            "product_type_id": size_chart.product_type_id,
            "size_name": size_chart.size_name
        }).fetchone()
        
        if existing:
            raise HTTPException(status_code=400, detail="Size chart entry already exists")
        
        # Generate auto ID if not provided (format: S_{Buyer_name}_{producttype_3_words}_{counter})
        auto_id = None
        if hasattr(size_chart, 'auto_generated_id') and size_chart.auto_generated_id:
            auto_id = size_chart.auto_generated_id
        else:
            # Get profile with buyer_id
            profile_query = text("SELECT profile_name, buyer_id FROM size_chart_profiles WHERE id = :id")
            profile_row = db.execute(profile_query, {"id": size_chart.profile_id}).fetchone()
            
            if not profile_row:
                raise HTTPException(status_code=404, detail="Profile not found")
            
            profile_name, buyer_id = profile_row
            
            # Get buyer name from clients database if buyer_id exists
            buyer_name = None
            if buyer_id:
                buyer_name = buyer_service.get_buyer_name(buyer_id)
            
            # Use buyer_name if available, otherwise use profile_name
            buyer_name_clean = (buyer_name or profile_name).upper()
            buyer_name_clean = re.sub(r'[^A-Z0-9\s]', '', buyer_name_clean).strip()
            buyer_name_clean = buyer_name_clean.replace(' ', '_')
            
            # Get product type name
            type_query = text("SELECT type_name FROM product_types WHERE id = :id")
            type_row = db.execute(type_query, {"id": size_chart.product_type_id}).fetchone()
            
            if not type_row:
                raise HTTPException(status_code=404, detail="Product type not found")
            
            type_name = type_row[0]
            # Get first 3 words from product type name
            words = type_name.upper().split()[:3]
            product_type_3_words = '_'.join(words) if words else type_name.upper().replace(' ', '_')
            product_type_3_words = re.sub(r'[^A-Z0-9_]', '', product_type_3_words)
            
            # Get counter - unique across all size charts with same buyer_name + product_type
            counter_query = text("""
                SELECT MAX(
                    CAST(
                        SUBSTRING(
                            auto_generated_id 
                            FROM '_(\\d+)$'
                        ) AS INTEGER
                    )
                )
                FROM size_chart_master 
                WHERE auto_generated_id LIKE :pattern
            """)
            
            pattern = f"S_{buyer_name_clean}_{product_type_3_words}_%"
            max_counter = db.execute(counter_query, {"pattern": pattern}).scalar()
            counter = (max_counter or 0) + 1
            
            auto_id = f"S_{buyer_name_clean}_{product_type_3_words}_{str(counter).zfill(4)}"
        
        gender_val = getattr(size_chart, 'gender', 'Unisex')
        
        query = text("""
            INSERT INTO size_chart_master 
            (profile_id, product_type_id, size_name, size_order, measurements, gender, auto_generated_id, is_active)
            VALUES (:profile_id, :product_type_id, :size_name, :size_order, :measurements, :gender, :auto_generated_id, TRUE)
            RETURNING id, profile_id, product_type_id, size_name, size_order, measurements, gender, auto_generated_id, is_active
        """)
        
        result = db.execute(query, {
            "profile_id": size_chart.profile_id,
            "product_type_id": size_chart.product_type_id,
            "size_name": size_chart.size_name,
            "size_order": size_chart.size_order,
            "measurements": json.dumps(size_chart.measurements),
            "gender": gender_val,
            "auto_generated_id": auto_id
        })
        db.commit()
        
        row = result.fetchone()
        # Handle measurements - PostgreSQL JSONB returns as dict, not string
        measurements = row[5] if isinstance(row[5], dict) else (json.loads(row[5]) if row[5] else {})
        return {
            "id": row[0],
            "profile_id": row[1],
            "product_type_id": row[2],
            "size_name": row[3],
            "size_order": row[4],
            "measurements": measurements,
            "gender": row[6] if len(row) > 6 else None,
            "auto_generated_id": row[7] if len(row) > 7 else None,
            "is_active": row[8] if len(row) > 8 else row[6]
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create size chart: {str(e)}")


@router.put("/{size_chart_id}", response_model=SizeChartResponse)
async def update_size_chart(
    size_chart_id: int,
    size_chart: SizeChartCreate,
    db: Session = Depends(get_db_samples)
):
    """Update an existing size chart"""
    try:
        gender_val = getattr(size_chart, 'gender', 'Unisex')
        
        query = text("""
            UPDATE size_chart_master
            SET profile_id = :profile_id,
                product_type_id = :product_type_id,
                size_name = :size_name,
                size_order = :size_order,
                measurements = :measurements,
                gender = :gender,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :size_chart_id
            RETURNING id, profile_id, product_type_id, size_name, size_order, measurements, gender, auto_generated_id, is_active
        """)
        
        result = db.execute(query, {
            "size_chart_id": size_chart_id,
            "profile_id": size_chart.profile_id,
            "product_type_id": size_chart.product_type_id,
            "size_name": size_chart.size_name,
            "size_order": size_chart.size_order,
            "measurements": json.dumps(size_chart.measurements),
            "gender": gender_val
        })
        db.commit()
        
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Size chart not found")
        
        return {
            "id": row[0],
            "profile_id": row[1],
            "product_type_id": row[2],
            "size_name": row[3],
            "size_order": row[4],
            "measurements": row[5] if isinstance(row[5], dict) else (json.loads(row[5]) if row[5] else {}),
            "gender": row[6] if len(row) > 6 else None,
            "auto_generated_id": row[7] if len(row) > 7 else None,
            "is_active": row[8] if len(row) > 8 else row[6]
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update size chart: {str(e)}")


@router.delete("/{size_chart_id}")
async def delete_size_chart(size_chart_id: int, db: Session = Depends(get_db_samples)):
    """Deactivate a size chart (soft delete)"""
    try:
        query = text("""
            UPDATE size_chart_master
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = :size_chart_id
            RETURNING id
        """)
        
        result = db.execute(query, {"size_chart_id": size_chart_id})
        db.commit()
        
        if not result.fetchone():
            raise HTTPException(status_code=404, detail="Size chart not found")
        
        return {"message": "Size chart deactivated successfully", "id": size_chart_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete size chart: {str(e)}")
