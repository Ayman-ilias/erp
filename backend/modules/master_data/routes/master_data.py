"""
Master Data API - Colors and Sizes Management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db_samples
from core.logging import setup_logging
from modules.samples.models.sample import GarmentColor, GarmentSize
from modules.samples.schemas.sample import (
    GarmentColorCreate, GarmentColorResponse, GarmentColorUpdate,
    GarmentSizeCreate, GarmentSizeResponse, GarmentSizeUpdate
)

logger = setup_logging()

router = APIRouter()


# ============================================
# GARMENT COLORS ENDPOINTS
# ============================================

@router.post("/colors", response_model=GarmentColorResponse, status_code=status.HTTP_201_CREATED)
def create_color(color_data: GarmentColorCreate, db: Session = Depends(get_db_samples)):
    """Create a new garment color"""
    try:
        # Check if color name already exists
        existing = db.query(GarmentColor).filter(GarmentColor.color_name == color_data.color_name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Color '{color_data.color_name}' already exists"
            )

        new_color = GarmentColor(**color_data.model_dump())
        db.add(new_color)
        db.commit()
        db.refresh(new_color)
        return new_color
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Color creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create color")


@router.get("/colors", response_model=List[GarmentColorResponse])
def get_colors(
    category: str = None,
    is_active: bool = None,
    skip: int = 0,
    limit: int = 1000,
    db: Session = Depends(get_db_samples)
):
    """Get all garment colors with optional filters"""
    query = db.query(GarmentColor)

    if category:
        query = query.filter(GarmentColor.category == category)
    if is_active is not None:
        query = query.filter(GarmentColor.is_active == is_active)

    colors = query.order_by(GarmentColor.category, GarmentColor.color_name).offset(skip).limit(limit).all()
    return colors


@router.get("/colors/{color_id}", response_model=GarmentColorResponse)
def get_color(color_id: int, db: Session = Depends(get_db_samples)):
    """Get a specific color by ID"""
    color = db.query(GarmentColor).filter(GarmentColor.id == color_id).first()
    if not color:
        raise HTTPException(status_code=404, detail="Color not found")
    return color


@router.put("/colors/{color_id}", response_model=GarmentColorResponse)
def update_color(color_id: int, color_data: GarmentColorUpdate, db: Session = Depends(get_db_samples)):
    """Update a garment color"""
    try:
        color = db.query(GarmentColor).filter(GarmentColor.id == color_id).first()
        if not color:
            raise HTTPException(status_code=404, detail="Color not found")

        # Check if new name conflicts with existing
        if color_data.color_name and color_data.color_name != color.color_name:
            existing = db.query(GarmentColor).filter(GarmentColor.color_name == color_data.color_name).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Color '{color_data.color_name}' already exists"
                )

        for key, value in color_data.model_dump(exclude_unset=True).items():
            setattr(color, key, value)

        db.commit()
        db.refresh(color)
        return color
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Color update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update color")


@router.delete("/colors/{color_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_color(color_id: int, db: Session = Depends(get_db_samples)):
    """Delete a garment color"""
    try:
        color = db.query(GarmentColor).filter(GarmentColor.id == color_id).first()
        if not color:
            raise HTTPException(status_code=404, detail="Color not found")

        db.delete(color)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Color delete error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete color")


# ============================================
# GARMENT SIZES ENDPOINTS
# ============================================

@router.post("/sizes", response_model=GarmentSizeResponse, status_code=status.HTTP_201_CREATED)
def create_size(size_data: GarmentSizeCreate, db: Session = Depends(get_db_samples)):
    """Create a new garment size"""
    try:
        # Check if size value already exists
        existing = db.query(GarmentSize).filter(GarmentSize.size_value == size_data.size_value).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Size '{size_data.size_value}' already exists"
            )

        new_size = GarmentSize(**size_data.model_dump())
        db.add(new_size)
        db.commit()
        db.refresh(new_size)
        return new_size
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Size creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create size")


@router.get("/sizes", response_model=List[GarmentSizeResponse])
def get_sizes(
    category: str = None,
    is_active: bool = None,
    skip: int = 0,
    limit: int = 1000,
    db: Session = Depends(get_db_samples)
):
    """Get all garment sizes with optional filters"""
    query = db.query(GarmentSize)

    if category:
        query = query.filter(GarmentSize.size_category == category)
    if is_active is not None:
        query = query.filter(GarmentSize.is_active == is_active)

    sizes = query.order_by(GarmentSize.sort_order, GarmentSize.size_value).offset(skip).limit(limit).all()
    return sizes


@router.get("/sizes/{size_id}", response_model=GarmentSizeResponse)
def get_size(size_id: int, db: Session = Depends(get_db_samples)):
    """Get a specific size by ID"""
    size = db.query(GarmentSize).filter(GarmentSize.id == size_id).first()
    if not size:
        raise HTTPException(status_code=404, detail="Size not found")
    return size


@router.put("/sizes/{size_id}", response_model=GarmentSizeResponse)
def update_size(size_id: int, size_data: GarmentSizeUpdate, db: Session = Depends(get_db_samples)):
    """Update a garment size"""
    try:
        size = db.query(GarmentSize).filter(GarmentSize.id == size_id).first()
        if not size:
            raise HTTPException(status_code=404, detail="Size not found")

        # Check if new value conflicts with existing
        if size_data.size_value and size_data.size_value != size.size_value:
            existing = db.query(GarmentSize).filter(GarmentSize.size_value == size_data.size_value).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Size '{size_data.size_value}' already exists"
                )

        for key, value in size_data.model_dump(exclude_unset=True).items():
            setattr(size, key, value)

        db.commit()
        db.refresh(size)
        return size
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Size update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update size")


@router.delete("/sizes/{size_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_size(size_id: int, db: Session = Depends(get_db_samples)):
    """Delete a garment size"""
    try:
        size = db.query(GarmentSize).filter(GarmentSize.id == size_id).first()
        if not size:
            raise HTTPException(status_code=404, detail="Size not found")

        db.delete(size)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Size delete error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete size")


# ============================================
# SEED DEFAULT DATA ENDPOINT
# ============================================

@router.post("/seed-defaults", status_code=status.HTTP_201_CREATED)
def seed_default_data(db: Session = Depends(get_db_samples)):
    """Seed default colors and sizes (run once during setup)"""
    try:
        # Check if data already exists
        existing_colors = db.query(GarmentColor).count()
        existing_sizes = db.query(GarmentSize).count()

        if existing_colors > 0 or existing_sizes > 0:
            return {"message": "Default data already exists", "colors": existing_colors, "sizes": existing_sizes}

        # Default colors
        default_colors = [
            # Reds
            {"color_name": "Red", "color_code": "#FF0000", "color_ref": "186 C", "category": "Red"},
            {"color_name": "Dark Red", "color_code": "#8B0000", "color_ref": "1807 C", "category": "Red"},
            {"color_name": "Crimson", "color_code": "#DC143C", "color_ref": "199 C", "category": "Red"},
            {"color_name": "Maroon", "color_code": "#800000", "color_ref": "1815 C", "category": "Red"},
            {"color_name": "Burgundy", "color_code": "#722F37", "color_ref": "195 C", "category": "Red"},
            # Blues
            {"color_name": "Navy Blue", "color_code": "#001F3F", "color_ref": "19-4052", "category": "Blue"},
            {"color_name": "Royal Blue", "color_code": "#4169E1", "color_ref": "286 C", "category": "Blue"},
            {"color_name": "Sky Blue", "color_code": "#87CEEB", "color_ref": "291 C", "category": "Blue"},
            {"color_name": "Light Blue", "color_code": "#ADD8E6", "color_ref": "2905 C", "category": "Blue"},
            {"color_name": "Turquoise", "color_code": "#40E0D0", "color_ref": "3262 C", "category": "Blue"},
            {"color_name": "Teal", "color_code": "#008080", "color_ref": "321 C", "category": "Blue"},
            # Greens
            {"color_name": "Green", "color_code": "#008000", "color_ref": "355 C", "category": "Green"},
            {"color_name": "Dark Green", "color_code": "#006400", "color_ref": "350 C", "category": "Green"},
            {"color_name": "Lime Green", "color_code": "#32CD32", "color_ref": "375 C", "category": "Green"},
            {"color_name": "Olive Green", "color_code": "#808000", "color_ref": "399 C", "category": "Green"},
            {"color_name": "Forest Green", "color_code": "#228B22", "color_ref": "349 C", "category": "Green"},
            {"color_name": "Mint Green", "color_code": "#98FF98", "color_ref": "337 C", "category": "Green"},
            # Yellows
            {"color_name": "Yellow", "color_code": "#FFFF00", "color_ref": "Yellow C", "category": "Yellow"},
            {"color_name": "Gold", "color_code": "#FFD700", "color_ref": "1235 C", "category": "Yellow"},
            {"color_name": "Mustard", "color_code": "#FFDB58", "color_ref": "7408 C", "category": "Yellow"},
            # Oranges
            {"color_name": "Orange", "color_code": "#FFA500", "color_ref": "151 C", "category": "Orange"},
            {"color_name": "Dark Orange", "color_code": "#FF8C00", "color_ref": "152 C", "category": "Orange"},
            {"color_name": "Coral", "color_code": "#FF7F50", "color_ref": "170 C", "category": "Orange"},
            {"color_name": "Peach", "color_code": "#FFCBA4", "color_ref": "162 C", "category": "Orange"},
            # Purples
            {"color_name": "Purple", "color_code": "#800080", "color_ref": "2617 C", "category": "Purple"},
            {"color_name": "Violet", "color_code": "#EE82EE", "color_ref": "2582 C", "category": "Purple"},
            {"color_name": "Lavender", "color_code": "#E6E6FA", "color_ref": "2635 C", "category": "Purple"},
            # Pinks
            {"color_name": "Pink", "color_code": "#FFC0CB", "color_ref": "189 C", "category": "Pink"},
            {"color_name": "Hot Pink", "color_code": "#FF69B4", "color_ref": "212 C", "category": "Pink"},
            {"color_name": "Magenta", "color_code": "#FF00FF", "color_ref": "Magenta C", "category": "Pink"},
            {"color_name": "Rose", "color_code": "#FF007F", "color_ref": "1925 C", "category": "Pink"},
            # Neutrals
            {"color_name": "White", "color_code": "#FFFFFF", "color_ref": "White", "category": "Neutral"},
            {"color_name": "Black", "color_code": "#000000", "color_ref": "Black C", "category": "Neutral"},
            {"color_name": "Gray", "color_code": "#808080", "color_ref": "Cool Gray 9 C", "category": "Neutral"},
            {"color_name": "Light Gray", "color_code": "#D3D3D3", "color_ref": "Cool Gray 3 C", "category": "Neutral"},
            {"color_name": "Dark Gray", "color_code": "#A9A9A9", "color_ref": "Cool Gray 7 C", "category": "Neutral"},
            {"color_name": "Charcoal", "color_code": "#36454F", "color_ref": "433 C", "category": "Neutral"},
            {"color_name": "Silver", "color_code": "#C0C0C0", "color_ref": "877 C", "category": "Neutral"},
            # Browns
            {"color_name": "Brown", "color_code": "#A52A2A", "color_ref": "4695 C", "category": "Brown"},
            {"color_name": "Tan", "color_code": "#D2B48C", "color_ref": "466 C", "category": "Brown"},
            {"color_name": "Chocolate", "color_code": "#D2691E", "color_ref": "1615 C", "category": "Brown"},
            {"color_name": "Coffee", "color_code": "#6F4E37", "color_ref": "476 C", "category": "Brown"},
            # Beige
            {"color_name": "Beige", "color_code": "#F5F5DC", "color_ref": "7527 C", "category": "Beige"},
            {"color_name": "Cream", "color_code": "#FFFDD0", "color_ref": "7499 C", "category": "Beige"},
            {"color_name": "Ivory", "color_code": "#FFFFF0", "color_ref": "7541 C", "category": "Beige"},
            {"color_name": "Khaki", "color_code": "#F0E68C", "color_ref": "7503 C", "category": "Beige"},
        ]

        # Default sizes
        default_sizes = [
            {"size_value": "XXS", "size_label": "Extra Extra Small", "size_category": "Standard", "sort_order": 1},
            {"size_value": "XS", "size_label": "Extra Small", "size_category": "Standard", "sort_order": 2},
            {"size_value": "S", "size_label": "Small", "size_category": "Standard", "sort_order": 3},
            {"size_value": "M", "size_label": "Medium", "size_category": "Standard", "sort_order": 4},
            {"size_value": "L", "size_label": "Large", "size_category": "Standard", "sort_order": 5},
            {"size_value": "XL", "size_label": "Extra Large", "size_category": "Standard", "sort_order": 6},
            {"size_value": "XXL", "size_label": "Extra Extra Large", "size_category": "Standard", "sort_order": 7},
            {"size_value": "XXXL", "size_label": "3XL", "size_category": "Standard", "sort_order": 8},
            {"size_value": "4XL", "size_label": "4XL", "size_category": "Standard", "sort_order": 9},
            {"size_value": "5XL", "size_label": "5XL", "size_category": "Standard", "sort_order": 10},
            # Numeric sizes
            {"size_value": "36", "size_label": "Size 36", "size_category": "Numeric", "sort_order": 11},
            {"size_value": "38", "size_label": "Size 38", "size_category": "Numeric", "sort_order": 12},
            {"size_value": "40", "size_label": "Size 40", "size_category": "Numeric", "sort_order": 13},
            {"size_value": "42", "size_label": "Size 42", "size_category": "Numeric", "sort_order": 14},
            {"size_value": "44", "size_label": "Size 44", "size_category": "Numeric", "sort_order": 15},
            {"size_value": "46", "size_label": "Size 46", "size_category": "Numeric", "sort_order": 16},
            {"size_value": "48", "size_label": "Size 48", "size_category": "Numeric", "sort_order": 17},
            {"size_value": "50", "size_label": "Size 50", "size_category": "Numeric", "sort_order": 18},
        ]

        # Insert colors
        for color_data in default_colors:
            color = GarmentColor(**color_data)
            db.add(color)

        # Insert sizes
        for size_data in default_sizes:
            size = GarmentSize(**size_data)
            db.add(size)

        db.commit()

        return {
            "message": "Default data seeded successfully",
            "colors_created": len(default_colors),
            "sizes_created": len(default_sizes)
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Seed data error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to seed default data: {str(e)}")
