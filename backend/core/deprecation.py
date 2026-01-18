"""
Deprecation Warning System

Provides utilities for logging deprecation warnings when legacy systems are accessed.
"""

import logging
import functools
import inspect
from typing import Optional, Callable, Any
from datetime import datetime

# Configure deprecation logger
deprecation_logger = logging.getLogger("deprecation")
deprecation_logger.setLevel(logging.WARNING)

# Create handler if not exists
if not deprecation_logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - DEPRECATION WARNING - %(message)s'
    )
    handler.setFormatter(formatter)
    deprecation_logger.addHandler(handler)


def log_legacy_table_access(
    table_name: str,
    operation: str,
    replacement_info: str,
    caller_info: Optional[str] = None
) -> None:
    """
    Log when legacy UoM tables are accessed
    
    Args:
        table_name: Name of the legacy table being accessed
        operation: Type of operation (SELECT, INSERT, UPDATE, DELETE)
        replacement_info: Information about the replacement system
        caller_info: Optional information about what code is accessing the table
    """
    
    # Get caller information if not provided
    if not caller_info:
        frame = inspect.currentframe()
        if frame and frame.f_back:
            caller_frame = frame.f_back
            caller_info = f"{caller_frame.f_code.co_filename}:{caller_frame.f_lineno}"
    
    warning_message = (
        f"Legacy table '{table_name}' accessed with {operation} operation. "
        f"This table is DEPRECATED. {replacement_info} "
        f"Called from: {caller_info}"
    )
    
    deprecation_logger.warning(warning_message)


def deprecated_table_access(
    table_name: str,
    replacement_info: str
) -> Callable:
    """
    Decorator to mark functions that access legacy tables
    
    Args:
        table_name: Name of the legacy table
        replacement_info: Information about the replacement system
    
    Returns:
        Decorator function
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Log the deprecation warning
            caller_frame = inspect.currentframe().f_back
            caller_info = f"{caller_frame.f_code.co_filename}:{caller_frame.f_lineno}"
            
            log_legacy_table_access(
                table_name=table_name,
                operation="FUNCTION_CALL",
                replacement_info=replacement_info,
                caller_info=caller_info
            )
            
            # Call the original function
            return func(*args, **kwargs)
        
        return wrapper
    return decorator


def log_legacy_uom_access(operation: str, details: str = "") -> None:
    """
    Convenience function specifically for legacy UoM table access
    
    Args:
        operation: Type of operation being performed
        details: Additional details about the operation
    """
    replacement_info = (
        "Use the Unit Conversion System in db-units database instead. "
        "New system provides 35 categories with 288 units including Desi, Textile, and International units. "
        "Migration guide: /docs/migration-guide-legacy-uom.md"
    )
    
    log_legacy_table_access(
        table_name="UoMCategory/UoM (Legacy)",
        operation=operation,
        replacement_info=replacement_info,
        details=details
    )


class LegacyUoMWarning:
    """
    Context manager for legacy UoM operations
    """
    
    def __init__(self, operation: str, details: str = ""):
        self.operation = operation
        self.details = details
    
    def __enter__(self):
        log_legacy_uom_access(self.operation, self.details)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass


# Decorator for legacy UoM table access
def warn_legacy_uom_table(table_name: str):
    """
    Decorator to automatically log deprecation warnings for legacy UoM table access
    
    Args:
        table_name: Name of the legacy table (UoMCategory or UoM)
    
    Usage:
        @warn_legacy_uom_table("UoMCategory")
        def get_uom_categories():
            # Function implementation
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Determine operation type from function name
            func_name = func.__name__.lower()
            if 'create' in func_name or 'post' in func_name:
                operation = "CREATE"
            elif 'update' in func_name or 'put' in func_name:
                operation = "UPDATE"
            elif 'delete' in func_name:
                operation = "DELETE"
            elif 'get' in func_name or 'read' in func_name:
                operation = "READ"
            else:
                operation = "ACCESS"
            
            # Log the deprecation warning
            replacement_info = (
                f"Use the Unit Conversion System in db-units database instead. "
                f"New system provides 35 categories with 288 units including Desi, Textile, and International units. "
                f"Migration guide: /docs/migration-guide-legacy-uom.md"
            )
            
            caller_frame = inspect.currentframe().f_back
            caller_info = f"{caller_frame.f_code.co_filename}:{caller_frame.f_lineno}"
            
            log_legacy_table_access(
                table_name=f"{table_name} (Legacy)",
                operation=operation,
                replacement_info=replacement_info,
                caller_info=caller_info
            )
            
            # Call the original function
            return func(*args, **kwargs)
        
        return wrapper
    return decorator


def log_legacy_model_access(model_class, operation: str, record_id: Optional[int] = None):
    """
    Log when legacy UoM models are accessed via SQLAlchemy
    
    Args:
        model_class: The SQLAlchemy model class being accessed
        operation: Type of operation (SELECT, INSERT, UPDATE, DELETE)
        record_id: Optional record ID being accessed
    """
    table_name = getattr(model_class, '__tablename__', str(model_class))
    
    details = f"Record ID: {record_id}" if record_id else ""
    
    replacement_info = (
        "Use the Unit Conversion System in db-units database instead. "
        "New system provides 35 categories with 288 units including Desi, Textile, and International units. "
        "Migration guide: /docs/migration-guide-legacy-uom.md"
    )
    
    log_legacy_table_access(
        table_name=f"{table_name} (Legacy)",
        operation=operation,
        replacement_info=replacement_info,
        caller_info=details
    )