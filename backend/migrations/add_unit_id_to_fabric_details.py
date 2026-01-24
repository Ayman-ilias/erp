"""
Add unit_id column to fabric_details table
Migration to integrate fabric details with unit conversion system
"""
import asyncio
from sqlalchemy import text
from core.database import get_db_merchandiser

async def add_unit_id_to_fabric_details():
    """Add unit_id column to fabric_details table"""
    
    # Get database session
    db = next(get_db_merchandiser())
    
    try:
        # Check if unit_id column already exists
        check_column_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'fabric_details' 
            AND column_name = 'unit_id'
        """)
        
        result = db.execute(check_column_query).fetchone()
        
        if not result:
            print("Adding unit_id column to fabric_details table...")
            
            # Add unit_id column
            add_column_query = text("""
                ALTER TABLE fabric_details 
                ADD COLUMN unit_id INTEGER
            """)
            
            db.execute(add_column_query)
            db.commit()
            
            print("✅ Successfully added unit_id column to fabric_details table")
        else:
            print("✅ unit_id column already exists in fabric_details table")
            
    except Exception as e:
        print(f"❌ Error adding unit_id column: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(add_unit_id_to_fabric_details())