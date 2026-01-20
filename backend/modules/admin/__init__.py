"""
Admin module for system administration tasks
"""

from fastapi import APIRouter
from .routes.migrations import router as migrations_router

# Create main admin router
admin_router = APIRouter()

# Include sub-routers
admin_router.include_router(migrations_router, prefix="/admin", tags=["admin-migrations"])