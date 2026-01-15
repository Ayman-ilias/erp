"""
IMMEDIATE FIX: Add techpack_files column to sample_primary_info
Run this script directly on your server to fix the issue immediately
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from core.config import settings

def fix_techpack_files_column():
    """Add techpack_files column if missing"""
    
    # Build database URL for merchandiser
    db_url = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST_MERCHANDISER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB_MERCHANDISER}"
    
    print(f"Connecting to database: {settings.POSTGRES_HOST_MERCHANDISER}/{settings.POSTGRES_DB_MERCHANDISER}")
    
    try:
        engine = create_engine(db_url)
        
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'sample_primary_info' 
                AND column_name = 'techpack_files'
            """))
            
            if result.fetchone():
                print("✅ Column 'techpack_files' already exists!")
                return True
            
            # Add the column
            print("Adding 'techpack_files' column...")
            conn.execute(text("""
                ALTER TABLE sample_primary_info 
                ADD COLUMN techpack_files jsonb
            """))
            conn.commit()
            
            print("✅ Successfully added 'techpack_files' column!")
            return True
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("FIX: Adding techpack_files column to sample_primary_info")
    print("=" * 60)
    
    success = fix_techpack_files_column()
    
    if success:
        print("\n✅ Fix completed successfully!")
        print("You can now restart your backend or refresh the page.")
        sys.exit(0)
    else:
        print("\n❌ Fix failed! Check the error above.")
        sys.exit(1)
