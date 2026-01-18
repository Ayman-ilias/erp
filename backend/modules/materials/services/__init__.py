"""
Materials Services

Service layer for materials module with cross-database operations.
"""

from .validation_service import (
    ValidationService,
    ValidationError,
    DatabaseConnectionError
)
from .unit_mapping_service import UnitMappingService

__all__ = [
    'ValidationService',
    'ValidationError',
    'DatabaseConnectionError',
    'UnitMappingService',
]
