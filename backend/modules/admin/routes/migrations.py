"""
Admin routes for migration management
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
import logging

from migrations.migration_tracker import MigrationTracker

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/migrations/status", response_model=List[Dict])
async def get_migration_status():
    """
    Get the status of all migrations.
    
    Returns:
        List of migration status records
    """
    try:
        with MigrationTracker() as tracker:
            status = tracker.get_migration_status()
            return status
    except Exception as e:
        logger.error(f"Failed to get migration status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve migration status")


@router.post("/migrations/run")
async def run_migrations():
    """
    Manually trigger migration execution.
    
    Returns:
        Summary of migration execution
    """
    try:
        from migrations.migration_tracker import run_all_migrations
        
        logger.info("Manual migration execution requested")
        run_all_migrations()
        
        # Get updated status
        with MigrationTracker() as tracker:
            status = tracker.get_migration_status()
            successful = sum(1 for s in status if s["success"])
            failed = sum(1 for s in status if not s["success"])
            
            return {
                "message": "Migration execution completed",
                "total_migrations": len(status),
                "successful": successful,
                "failed": failed,
                "details": status
            }
    except Exception as e:
        logger.error(f"Failed to run migrations: {e}")
        raise HTTPException(status_code=500, detail=f"Migration execution failed: {str(e)}")