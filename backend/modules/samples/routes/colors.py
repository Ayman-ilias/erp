"""
Colors API Routes - Color Master System
Handles color management with buyer-specific filtering
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, or_
from typing import List, Optional
from pydantic import BaseModel
from core.database import get_db_samples

router = APIRouter()


@router.get("/colors/test")
async def test_colors_db(db: Session = Depends(get_db_samples)):
    """Test endpoint to debug color fetching"""
    from sqlalchemy import text
    query = text("SELECT COUNT(*) FROM color_master WHERE is_active = TRUE")
    count = db.execute(query).scalar()
    
    query2 = text("SELECT id, color_name, hex_code FROM color_master WHERE is_active = TRUE LIMIT 3")
    result = db.execute(query2)
    rows = result.fetchall()
    
    return {
        "count": count,
        "sample_colors": [{"id": r[0], "name": r[1], "hex": r[2]} for r in rows]
    }


# Pydantic models
class ColorResponse(BaseModel):
    id: int
    color_name: str
    tcx_code: Optional[str]
    hex_code: str
    rgb_r: int
    rgb_g: int
    rgb_b: int
    buyer_id: Optional[int]
    is_general: bool
    is_active: bool

    class Config:
        from_attributes = True


class ColorCreate(BaseModel):
    color_name: str
    tcx_code: Optional[str] = None
    hex_code: str
    rgb_r: int
    rgb_g: int
    rgb_b: int
    buyer_id: Optional[int] = None
    is_general: bool = False


@router.get("/colors")
async def get_colors(
    buyer_id: Optional[int] = Query(None, description="Filter by buyer ID"),
    is_active: bool = Query(True, description="Filter by active status"),
    db: Session = Depends(get_db_samples)
):
    """
    Get all colors with optional buyer filtering
    If buyer_id is provided, returns buyer-specific + general colors
    """
    try:
        if buyer_id:
            # Get buyer-specific colors + general colors
            query = text("""
                SELECT id, color_name, tcx_code, hex_code, rgb_r, rgb_g, rgb_b,
                       buyer_id, is_general, is_active
                FROM color_master
                WHERE (buyer_id = :buyer_id OR is_general = TRUE)
                  AND is_active = :is_active
                ORDER BY color_name
            """)
            result = db.execute(query, {"buyer_id": buyer_id, "is_active": is_active})
        else:
            # Get all colors (both general and buyer-specific)
            query = text("""
                SELECT id, color_name, tcx_code, hex_code, rgb_r, rgb_g, rgb_b,
                       buyer_id, is_general, is_active
                FROM color_master
                WHERE is_active = :is_active
                ORDER BY is_general DESC, color_name
            """)
            result = db.execute(query, {"is_active": is_active})
        
        colors = []
        rows = result.fetchall()
        print(f"DEBUG: Found {len(rows)} colors in database")
        for row in rows:
            color_dict = {
                "id": row[0],
                "color_name": row[1],
                "tcx_code": row[2],
                "hex_code": row[3],
                "rgb_r": row[4],
                "rgb_g": row[5],
                "rgb_b": row[6],
                "buyer_id": row[7],
                "is_general": row[8],
                "is_active": row[9]
            }
            colors.append(color_dict)
        
        print(f"DEBUG: Returning {len(colors)} colors")
        return colors
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch colors: {str(e)}")


@router.get("/colors/{color_id}", response_model=ColorResponse)
async def get_color(color_id: int, db: Session = Depends(get_db_samples)):
    """Get a specific color by ID"""
    try:
        query = text("""
            SELECT id, color_name, tcx_code, hex_code, rgb_r, rgb_g, rgb_b,
                   buyer_id, is_general, is_active
            FROM color_master
            WHERE id = :color_id
        """)
        result = db.execute(query, {"color_id": color_id})
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Color not found")
        
        return {
            "id": row[0],
            "color_name": row[1],
            "tcx_code": row[2],
            "hex_code": row[3],
            "rgb_r": row[4],
            "rgb_g": row[5],
            "rgb_b": row[6],
            "buyer_id": row[7],
            "is_general": row[8],
            "is_active": row[9]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch color: {str(e)}")


@router.post("/colors", response_model=ColorResponse)
async def create_color(color: ColorCreate, db: Session = Depends(get_db_samples)):
    """Create a new color"""
    try:
        # Check if color already exists
        check_query = text("""
            SELECT id FROM color_master 
            WHERE color_name = :color_name 
              AND (buyer_id = :buyer_id OR (buyer_id IS NULL AND :buyer_id IS NULL))
        """)
        existing = db.execute(check_query, {
            "color_name": color.color_name,
            "buyer_id": color.buyer_id
        }).fetchone()
        
        if existing:
            raise HTTPException(status_code=400, detail="Color already exists for this buyer")
        
        query = text("""
            INSERT INTO color_master 
            (color_name, tcx_code, hex_code, rgb_r, rgb_g, rgb_b, buyer_id, is_general, is_active)
            VALUES (:color_name, :tcx_code, :hex_code, :rgb_r, :rgb_g, :rgb_b, :buyer_id, :is_general, TRUE)
            RETURNING id, color_name, tcx_code, hex_code, rgb_r, rgb_g, rgb_b, buyer_id, is_general, is_active
        """)
        
        result = db.execute(query, {
            "color_name": color.color_name,
            "tcx_code": color.tcx_code,
            "hex_code": color.hex_code,
            "rgb_r": color.rgb_r,
            "rgb_g": color.rgb_g,
            "rgb_b": color.rgb_b,
            "buyer_id": color.buyer_id,
            "is_general": color.is_general
        })
        db.commit()
        
        row = result.fetchone()
        return {
            "id": row[0],
            "color_name": row[1],
            "tcx_code": row[2],
            "hex_code": row[3],
            "rgb_r": row[4],
            "rgb_g": row[5],
            "rgb_b": row[6],
            "buyer_id": row[7],
            "is_general": row[8],
            "is_active": row[9]
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create color: {str(e)}")


@router.put("/colors/{color_id}", response_model=ColorResponse)
async def update_color(
    color_id: int,
    color: ColorCreate,
    db: Session = Depends(get_db_samples)
):
    """Update an existing color"""
    try:
        query = text("""
            UPDATE color_master
            SET color_name = :color_name,
                tcx_code = :tcx_code,
                hex_code = :hex_code,
                rgb_r = :rgb_r,
                rgb_g = :rgb_g,
                rgb_b = :rgb_b,
                buyer_id = :buyer_id,
                is_general = :is_general,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :color_id
            RETURNING id, color_name, tcx_code, hex_code, rgb_r, rgb_g, rgb_b, buyer_id, is_general, is_active
        """)
        
        result = db.execute(query, {
            "color_id": color_id,
            "color_name": color.color_name,
            "tcx_code": color.tcx_code,
            "hex_code": color.hex_code,
            "rgb_r": color.rgb_r,
            "rgb_g": color.rgb_g,
            "rgb_b": color.rgb_b,
            "buyer_id": color.buyer_id,
            "is_general": color.is_general
        })
        db.commit()
        
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Color not found")
        
        return {
            "id": row[0],
            "color_name": row[1],
            "tcx_code": row[2],
            "hex_code": row[3],
            "rgb_r": row[4],
            "rgb_g": row[5],
            "rgb_b": row[6],
            "buyer_id": row[7],
            "is_general": row[8],
            "is_active": row[9]
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update color: {str(e)}")


@router.delete("/colors/{color_id}")
async def delete_color(color_id: int, db: Session = Depends(get_db_samples)):
    """Deactivate a color (soft delete)"""
    try:
        query = text("""
            UPDATE color_master
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = :color_id
            RETURNING id
        """)
        
        result = db.execute(query, {"color_id": color_id})
        db.commit()
        
        if not result.fetchone():
            raise HTTPException(status_code=404, detail="Color not found")
        
        return {"message": "Color deactivated successfully", "id": color_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete color: {str(e)}")


@router.post("/colors/seed-tcx")
async def seed_pantone_tcx_colors(db: Session = Depends(get_db_samples)):
    """Seed comprehensive Pantone TCX color database"""
    try:
        # Comprehensive Pantone TCX colors (150 popular colors)
        pantone_colors = [
            # REDS
            ("Fiery Red", "18-1664", "#CE2939", 206, 41, 57),
            ("Flame Scarlet", "18-1662", "#CD212A", 205, 33, 42),
            ("Racing Red", "18-1764", "#D01C1F", 208, 28, 31),
            ("Chinese Red", "18-1663", "#BF1932", 191, 25, 50),
            ("True Red", "19-1664", "#BF0A30", 191, 10, 48),
            ("Tango Red", "17-1563", "#DD4132", 221, 65, 50),
            ("Cherry Tomato", "17-1564", "#EB3C27", 235, 60, 39),
            ("Poppy Red", "17-1662", "#E2583E", 226, 88, 62),
            ("Tangerine Tango", "17-1463", "#DD4124", 221, 65, 36),
            ("Red Orange", "17-1562", "#FF5349", 255, 83, 73),
            
            # PINKS
            ("Pink Carnation", "17-2031", "#F2C4D0", 242, 196, 208),
            ("Prism Pink", "17-2627", "#FF86C8", 255, 134, 200),
            ("Cyclamen", "17-2624", "#E95094", 233, 80, 148),
            ("Hot Pink", "18-2436", "#E93479", 233, 52, 121),
            ("Fuchsia Rose", "18-2436", "#C74375", 199, 67, 117),
            ("Honeysuckle", "18-2120", "#D94F70", 217, 79, 112),
            ("Pink Lavender", "16-3115", "#D6A0C1", 214, 160, 193),
            ("Orchid Bloom", "17-3240", "#E39BCB", 227, 155, 203),
            ("Bodacious", "17-2435", "#CD0077", 205, 0, 119),
            ("Carmine", "18-1754", "#A4343A", 164, 52, 58),
            
            # ORANGES
            ("Flame Orange", "17-1464", "#FF6F3C", 255, 111, 60),
            ("Russet Orange", "18-1447", "#B84F2E", 184, 79, 46),
            ("Autumn Glory", "17-1447", "#B1502D", 177, 80, 45),
            ("Burnt Orange", "17-1461", "#DD571C", 221, 87, 28),
            ("Orange Peel", "16-1362", "#FC7E2F", 252, 126, 47),
            ("Tangerine", "15-1263", "#FA9D2A", 250, 157, 42),
            ("Apricot", "14-1133", "#FFB088", 255, 176, 136),
            ("Desert Sun", "15-1242", "#FFB259", 255, 178, 89),
            ("Coral", "16-1546", "#FF6F61", 255, 111, 97),
            ("Living Coral", "16-1546", "#FF6F61", 255, 111, 97),
            
            # YELLOWS
            ("Lemon Chrome", "13-0859", "#F7EA48", 247, 234, 72),
            ("Blazing Yellow", "13-0858", "#F9E814", 249, 232, 20),
            ("Cyber Yellow", "13-0758", "#FFD500", 255, 213, 0),
            ("Buttercup", "13-0752", "#EFCB4F", 239, 203, 79),
            ("Freesia", "13-0755", "#F3D54E", 243, 213, 78),
            ("Primrose Yellow", "12-0752", "#F7D654", 247, 214, 84),
            ("Banana", "12-0642", "#FFE299", 255, 226, 153),
            ("Mellow Yellow", "12-0738", "#FFEB84", 255, 235, 132),
            ("Golden Lime", "14-0756", "#CBC547", 203, 197, 71),
            ("Chartreuse", "14-0452", "#D0DA3D", 208, 218, 61),
            
            # GREENS
            ("Kelly Green", "17-6153", "#41A85A", 65, 168, 90),
            ("Classic Green", "18-6330", "#008542", 0, 133, 66),
            ("Greenery", "15-0343", "#88B04B", 136, 176, 75),
            ("Kale", "18-0107", "#5A7247", 90, 114, 71),
            ("Foliage Green", "18-0135", "#6D7541", 109, 117, 65),
            ("Forest Green", "19-5420", "#2D4438", 45, 68, 56),
            ("Mint Green", "14-6316", "#98DDCC", 152, 221, 204),
            ("Yucca", "16-6318", "#83AA92", 131, 170, 146),
            ("Jade", "17-5638", "#00A693", 0, 166, 147),
            ("Emerald", "17-5641", "#009B77", 0, 155, 119),
            
            # BLUES
            ("Navy Blazer", "19-4029", "#2A3244", 42, 50, 68),
            ("Classic Blue", "19-4052", "#0F4C81", 15, 76, 129),
            ("True Blue", "19-4151", "#0071BB", 0, 113, 187),
            ("Brilliant Blue", "18-4252", "#0073AE", 0, 115, 174),
            ("Ibiza Blue", "18-4530", "#00A7E1", 0, 167, 225),
            ("Diva Blue", "18-4148", "#1F3A93", 31, 58, 147),
            ("Princess Blue", "19-4150", "#003DA5", 0, 61, 165),
            ("Blue Atoll", "16-4535", "#00B4D5", 0, 180, 213),
            ("Bachelor Button", "18-4051", "#4773AA", 71, 115, 170),
            ("Dusk Blue", "18-4028", "#5F7A91", 95, 122, 145),
            
            # PURPLES
            ("Royal Purple", "19-3536", "#7B4491", 123, 68, 145),
            ("Purple Orchid", "18-3540", "#8B4789", 139, 71, 137),
            ("Violet", "18-3838", "#5F4B8B", 95, 75, 139),
            ("Ultra Violet", "18-3838", "#5F4B8B", 95, 75, 139),
            ("Deep Purple", "19-3737", "#5A3D5C", 90, 61, 92),
            ("Plum Purple", "19-2814", "#6A2C3E", 106, 44, 62),
            ("Lavender", "15-3817", "#B19CD9", 177, 156, 217),
            ("Lilac", "16-3520", "#C8A8D2", 200, 168, 210),
            ("African Violet", "17-3817", "#9E73AD", 158, 115, 173),
            ("Crocus Petal", "16-3525", "#C0A2CC", 192, 162, 204),
            
            # BROWNS
            ("Mocha Mousse", "18-1230", "#A47864", 164, 120, 100),
            ("Cognac", "18-1048", "#9E6847", 158, 104, 71),
            ("Adobe", "17-1340", "#C26941", 194, 105, 65),
            ("Cinnamon", "17-1340", "#D2691E", 210, 105, 30),
            ("Copper", "17-1430", "#C57E4F", 197, 126, 79),
            ("Tobacco Brown", "19-1220", "#704A35", 112, 74, 53),
            ("Chocolate Brown", "19-1220", "#704A35", 112, 74, 53),
            ("Sepia", "19-1118", "#5C4934", 92, 73, 52),
            ("Desert Mist", "16-1318", "#D6B08A", 214, 176, 138),
            ("Toasted Almond", "14-1128", "#E0BA9B", 224, 186, 155),
            
            # NEUTRALS & GRAYS
            ("Brilliant White", "11-0601", "#F8F8F8", 248, 248, 248),
            ("Bright White", "11-0601", "#F4F4F4", 244, 244, 244),
            ("Cloud Dancer", "11-4201", "#F0EFEA", 240, 239, 234),
            ("Marshmallow", "11-0602", "#F6F2E8", 246, 242, 232),
            ("Moonbeam", "11-0605", "#E8E3D5", 232, 227, 213),
            ("Light Gray", "14-4102", "#C7C7C7", 199, 199, 199),
            ("Silver", "14-4103", "#B3B3B3", 179, 179, 179),
            ("Paloma", "16-3802", "#9D9D9D", 157, 157, 157),
            ("Frost Gray", "14-4106", "#A8ADB1", 168, 173, 177),
            ("Sharkskin", "18-0510", "#676B6A", 103, 107, 106),
            ("Charcoal Gray", "19-0000", "#545859", 84, 88, 89),
            ("Black Beauty", "19-0303", "#2D2926", 45, 41, 38),
            ("Jet Black", "19-0303", "#2E2D2B", 46, 45, 43),
            ("Phantom", "19-0303", "#2B2D2F", 43, 45, 47),
            
            # PASTELS
            ("Pale Pink", "12-2905", "#F5E2E7", 245, 226, 231),
            ("Cherry Blossom", "13-2010", "#F7C5CC", 247, 197, 204),
            ("Ballerina", "13-2808", "#F2CFD4", 242, 207, 212),
            ("Rosewater", "13-2803", "#F6E2E1", 246, 226, 225),
            ("Pale Lilac", "13-3820", "#E5D7E8", 229, 215, 232),
            ("Barely Blue", "12-4607", "#E0EBF0", 224, 235, 240),
            ("Air Blue", "13-4410", "#D0E4EA", 208, 228, 234),
            ("Skylight", "13-4411", "#B8D3E0", 184, 211, 224),
            ("Mint", "12-5507", "#DCEDC8", 220, 237, 200),
            ("Spring Bud", "12-0435", "#E3EBC3", 227, 235, 195),
            
            # EARTH TONES
            ("Warm Taupe", "17-1417", "#AF8E68", 175, 142, 104),
            ("Plaza Taupe", "17-1310", "#B39B8D", 179, 155, 141),
            ("Simply Taupe", "17-1311", "#B09C8D", 176, 156, 141),
            ("Nomad", "18-1028", "#B1876F", 177, 135, 111),
            ("Almond", "15-1315", "#D2B38F", 210, 179, 143),
            ("Safari", "16-1320", "#CCA97D", 204, 169, 125),
            ("Camel", "16-1328", "#C59963", 197, 153, 99),
            ("Golden Brown", "17-1328", "#A8714A", 168, 113, 74),
            ("Oak Buff", "15-1234", "#D9B48F", 217, 180, 143),
            ("Sand Dollar", "13-1106", "#DFD2BA", 223, 210, 186),
            
            # JEWEL TONES
            ("Ruby Wine", "19-1940", "#8B0033", 139, 0, 51),
            ("Burgundy", "19-1716", "#6D2135", 109, 33, 53),
            ("Garnet", "19-1934", "#9C2542", 156, 37, 66),
            ("Sapphire", "19-4049", "#00449E", 0, 68, 158),
            ("Peacock Blue", "18-4530", "#005F73", 0, 95, 115),
            ("Teal Green", "18-5121", "#008183", 0, 129, 131),
            ("Amazonite", "16-5533", "#00BFA5", 0, 191, 165),
            ("Amethyst Orchid", "18-3531", "#926AA6", 146, 106, 166),
            ("Purple Passion", "19-3638", "#6F2C91", 111, 44, 145),
            ("Citrine", "14-0850", "#D8C13D", 216, 193, 61),
            
            # NEONS & BRIGHTS
            ("Neon Yellow", "13-0650", "#F3F315", 243, 243, 21),
            ("Safety Yellow", "13-0859", "#EED202", 238, 210, 2),
            ("Neon Orange", "16-1359", "#FF6700", 255, 103, 0),
            ("Hot Coral", "16-1546", "#FF6F61", 255, 111, 97),
            ("Electric Pink", "17-2624", "#FF007F", 255, 0, 127),
            ("Neon Pink", "17-2624", "#FF10F0", 255, 16, 240),
            ("Shocking Pink", "18-2436", "#E90074", 233, 0, 116),
            ("Electric Blue", "17-4245", "#00B0FF", 0, 176, 255),
            ("Cyan Blue", "16-4535", "#00FFFF", 0, 255, 255),
            ("Electric Green", "15-0146", "#00FF00", 0, 255, 0),
        ]
        
        inserted = 0
        updated = 0
        
        for color_name, tcx_code, hex_code, rgb_r, rgb_g, rgb_b in pantone_colors:
            try:
                # Check if exists
                check_query = text("""
                    SELECT id FROM color_master 
                    WHERE color_name = :color_name AND buyer_id IS NULL
                """)
                existing = db.execute(check_query, {"color_name": color_name}).fetchone()
                
                if existing:
                    # Update
                    query = text("""
                        UPDATE color_master SET
                            tcx_code = :tcx_code,
                            hex_code = :hex_code,
                            rgb_r = :rgb_r,
                            rgb_g = :rgb_g,
                            rgb_b = :rgb_b,
                            is_general = TRUE,
                            is_active = TRUE,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                    """)
                    db.execute(query, {
                        "id": existing[0],
                        "tcx_code": tcx_code,
                        "hex_code": hex_code,
                        "rgb_r": rgb_r,
                        "rgb_g": rgb_g,
                        "rgb_b": rgb_b
                    })
                    updated += 1
                else:
                    # Insert
                    query = text("""
                        INSERT INTO color_master 
                        (color_name, tcx_code, hex_code, rgb_r, rgb_g, rgb_b, buyer_id, is_general, is_active)
                        VALUES (:color_name, :tcx_code, :hex_code, :rgb_r, :rgb_g, :rgb_b, NULL, TRUE, TRUE)
                    """)
                    db.execute(query, {
                        "color_name": color_name,
                        "tcx_code": tcx_code,
                        "hex_code": hex_code,
                        "rgb_r": rgb_r,
                        "rgb_g": rgb_g,
                        "rgb_b": rgb_b
                    })
                    inserted += 1
            except Exception as e:
                print(f"Failed to process color {color_name}: {e}")
                continue
        
        db.commit()
        
        # Get total count
        result = db.execute(text("SELECT COUNT(*) FROM color_master WHERE is_general = TRUE"))
        total = result.scalar()
        
        return {
            "message": "Pantone TCX colors seeded successfully",
            "inserted": inserted,
            "updated": updated,
            "total_general_colors": total
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to seed colors: {str(e)}")
