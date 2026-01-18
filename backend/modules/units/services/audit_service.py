"""
Unit Change Audit Service

This service provides audit logging functionality for tracking unit field changes
across material-related models. It logs changes to unit_id fields in:
- MaterialMaster (unit_id changes)
- SampleRequiredMaterial (unit_id changes)
- StyleVariantMaterial (unit_id and weight_unit_id changes)

Requirements: 15.1, 15.2, 15.3
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, DatabaseError
from datetime import datetime
import logging

from core.database import SessionLocalUnits, SessionLocalSettings
from modules.units.models.unit import UnitChangeAudit

logger = logging.getLogger(__name__)


class AuditServiceError(Exception):
    """Custom exception for audit service errors"""
    pass


class UnitChangeAuditService:
    """
    Service for logging unit field changes across material-related models.
    
    This service provides methods to:
    - Log unit changes during material updates
    - Log unit mappings during migration
    - Optionally log unit conversions for audit purposes
    - Retrieve audit logs with filtering
    """
    
    @staticmethod
    def _get_audit_db_session() -> Session:
        """
        Get database session for audit logging.
        
        Tries units database first, falls back to settings database.
        
        Returns:
            Database session for audit table
            
        Raises:
            AuditServiceError: If neither database is available
        """
        try:
            # Try units database first
            return SessionLocalUnits()
        except Exception as e:
            logger.warning(f"Units database not available for audit logging ({e}), trying settings database...")
            try:
                # Fall back to settings database
                return SessionLocalSettings()
            except Exception as e2:
                logger.error(f"Neither units nor settings database available for audit logging: {e2}")
                raise AuditServiceError(
                    f"Cannot connect to audit database. Units DB error: {e}, Settings DB error: {e2}"
                )
    
    @classmethod
    def log_unit_change(
        cls,
        table_name: str,
        record_id: int,
        field_name: str,
        old_unit_id: Optional[int],
        new_unit_id: Optional[int],
        changed_by: Optional[str] = None,
        change_reason: Optional[str] = None
    ) -> bool:
        """
        Log a unit field change to the audit table.
        
        Args:
            table_name: Name of the table where the change occurred (e.g., "material_master")
            record_id: ID of the record that was changed
            field_name: Name of the field that was changed (e.g., "unit_id", "weight_unit_id")
            old_unit_id: Previous unit ID (None for new records)
            new_unit_id: New unit ID (None for deletions)
            changed_by: User ID or system identifier who made the change
            change_reason: Optional reason for the change (e.g., "migration", "user_update")
            
        Returns:
            True if logged successfully, False otherwise
            
        Example:
            >>> UnitChangeAuditService.log_unit_change(
            ...     table_name="material_master",
            ...     record_id=123,
            ...     field_name="unit_id",
            ...     old_unit_id=1,
            ...     new_unit_id=2,
            ...     changed_by="user_456",
            ...     change_reason="user_update"
            ... )
        """
        db: Optional[Session] = None
        
        try:
            db = cls._get_audit_db_session()
            
            # Create audit log entry
            audit_entry = UnitChangeAudit(
                table_name=table_name,
                record_id=record_id,
                field_name=field_name,
                old_unit_id=old_unit_id,
                new_unit_id=new_unit_id,
                changed_by=changed_by,
                change_reason=change_reason
            )
            
            db.add(audit_entry)
            db.commit()
            
            logger.info(
                f"Logged unit change: table={table_name}, record_id={record_id}, "
                f"field={field_name}, old_unit={old_unit_id}, new_unit={new_unit_id}, "
                f"changed_by={changed_by}, reason={change_reason}"
            )
            
            return True
            
        except OperationalError as e:
            if db:
                db.rollback()
            logger.error(f"Database connection error while logging unit change: {str(e)}")
            return False
        except DatabaseError as e:
            if db:
                db.rollback()
            logger.error(f"Database error while logging unit change: {str(e)}")
            return False
        except Exception as e:
            if db:
                db.rollback()
            logger.error(f"Unexpected error while logging unit change: {str(e)}")
            return False
        finally:
            if db:
                try:
                    db.close()
                except Exception as e:
                    logger.error(f"Error closing audit database connection: {str(e)}")
    
    @classmethod
    def log_migration_mapping(
        cls,
        table_name: str,
        record_id: int,
        field_name: str,
        old_text_unit: str,
        new_unit_id: int,
        changed_by: str = "migration_system"
    ) -> bool:
        """
        Log a unit mapping during migration from text to unit_id.
        
        Args:
            table_name: Name of the table being migrated
            record_id: ID of the record being migrated
            field_name: Name of the field being migrated (e.g., "unit_id")
            old_text_unit: Original text unit value (e.g., "kg", "meter")
            new_unit_id: Mapped unit ID
            changed_by: System identifier (default: "migration_system")
            
        Returns:
            True if logged successfully, False otherwise
            
        Example:
            >>> UnitChangeAuditService.log_migration_mapping(
            ...     table_name="material_master",
            ...     record_id=123,
            ...     field_name="unit_id",
            ...     old_text_unit="kg",
            ...     new_unit_id=5
            ... )
        """
        return cls.log_unit_change(
            table_name=table_name,
            record_id=record_id,
            field_name=field_name,
            old_unit_id=None,  # No old unit_id during migration
            new_unit_id=new_unit_id,
            changed_by=changed_by,
            change_reason=f"migration_from_text:{old_text_unit}"
        )
    
    @classmethod
    def log_conversion_audit(
        cls,
        from_unit_id: int,
        to_unit_id: int,
        input_value: float,
        output_value: float,
        user_id: Optional[str] = None,
        context: Optional[str] = None
    ) -> bool:
        """
        Optionally log unit conversions for audit purposes.
        
        This creates an audit entry for conversion operations, which can be useful
        for tracking what conversions users are performing.
        
        Args:
            from_unit_id: Source unit ID
            to_unit_id: Target unit ID
            input_value: Input value
            output_value: Converted value
            user_id: Optional user identifier
            context: Optional context (e.g., "material_form", "inline_converter")
            
        Returns:
            True if logged successfully, False otherwise
            
        Example:
            >>> UnitChangeAuditService.log_conversion_audit(
            ...     from_unit_id=1,
            ...     to_unit_id=2,
            ...     input_value=100.0,
            ...     output_value=0.1,
            ...     user_id="user_456",
            ...     context="inline_converter"
            ... )
        """
        return cls.log_unit_change(
            table_name="conversion_audit",
            record_id=0,  # No specific record for conversions
            field_name="conversion",
            old_unit_id=from_unit_id,
            new_unit_id=to_unit_id,
            changed_by=user_id,
            change_reason=f"conversion:{input_value}→{output_value}:{context or 'unknown'}"
        )
    
    @classmethod
    def get_audit_logs(
        cls,
        table_name: Optional[str] = None,
        record_id: Optional[int] = None,
        field_name: Optional[str] = None,
        changed_by: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Retrieve audit logs with optional filtering.
        
        Args:
            table_name: Optional filter by table name
            record_id: Optional filter by record ID
            field_name: Optional filter by field name
            changed_by: Optional filter by who made the change
            start_date: Optional filter by start date
            end_date: Optional filter by end date
            limit: Maximum number of records to return
            offset: Number of records to skip
            
        Returns:
            List of audit log dictionaries
            
        Raises:
            AuditServiceError: If retrieval fails
            
        Example:
            >>> logs = UnitChangeAuditService.get_audit_logs(
            ...     table_name="material_master",
            ...     record_id=123,
            ...     limit=50
            ... )
        """
        db: Optional[Session] = None
        
        try:
            db = cls._get_audit_db_session()
            
            # Build query with filters
            query = db.query(UnitChangeAudit)
            
            if table_name:
                query = query.filter(UnitChangeAudit.table_name == table_name)
            if record_id is not None:
                query = query.filter(UnitChangeAudit.record_id == record_id)
            if field_name:
                query = query.filter(UnitChangeAudit.field_name == field_name)
            if changed_by:
                query = query.filter(UnitChangeAudit.changed_by == changed_by)
            if start_date:
                query = query.filter(UnitChangeAudit.changed_at >= start_date)
            if end_date:
                query = query.filter(UnitChangeAudit.changed_at <= end_date)
            
            # Order by most recent first
            query = query.order_by(UnitChangeAudit.changed_at.desc())
            
            # Apply pagination
            audit_logs = query.offset(offset).limit(limit).all()
            
            # Convert to dictionaries
            result = []
            for log in audit_logs:
                result.append({
                    "id": log.id,
                    "table_name": log.table_name,
                    "record_id": log.record_id,
                    "field_name": log.field_name,
                    "old_unit_id": log.old_unit_id,
                    "new_unit_id": log.new_unit_id,
                    "changed_by": log.changed_by,
                    "changed_at": log.changed_at,
                    "change_reason": log.change_reason
                })
            
            logger.debug(
                f"Retrieved {len(result)} audit logs with filters: "
                f"table={table_name}, record_id={record_id}, field={field_name}"
            )
            
            return result
            
        except OperationalError as e:
            logger.error(f"Database connection error while retrieving audit logs: {str(e)}")
            raise AuditServiceError(f"Failed to connect to audit database: {str(e)}")
        except DatabaseError as e:
            logger.error(f"Database error while retrieving audit logs: {str(e)}")
            raise AuditServiceError(f"Database error during audit log retrieval: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error while retrieving audit logs: {str(e)}")
            raise AuditServiceError(f"Unexpected error during audit log retrieval: {str(e)}")
        finally:
            if db:
                try:
                    db.close()
                except Exception as e:
                    logger.error(f"Error closing audit database connection: {str(e)}")
    
    @classmethod
    def get_audit_summary(
        cls,
        table_name: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get summary statistics for audit logs.
        
        Args:
            table_name: Optional filter by table name
            start_date: Optional filter by start date
            end_date: Optional filter by end date
            
        Returns:
            Dictionary with summary statistics
            
        Example:
            >>> summary = UnitChangeAuditService.get_audit_summary(
            ...     table_name="material_master"
            ... )
            >>> print(f"Total changes: {summary['total_changes']}")
        """
        db: Optional[Session] = None
        
        try:
            db = cls._get_audit_db_session()
            
            # Build base query
            query = db.query(UnitChangeAudit)
            
            if table_name:
                query = query.filter(UnitChangeAudit.table_name == table_name)
            if start_date:
                query = query.filter(UnitChangeAudit.changed_at >= start_date)
            if end_date:
                query = query.filter(UnitChangeAudit.changed_at <= end_date)
            
            # Get total count
            total_changes = query.count()
            
            # Get counts by table
            table_counts = {}
            if not table_name:  # Only if not filtering by table
                from sqlalchemy import func
                table_results = db.query(
                    UnitChangeAudit.table_name,
                    func.count(UnitChangeAudit.id).label('count')
                ).group_by(UnitChangeAudit.table_name).all()
                
                for table, count in table_results:
                    table_counts[table] = count
            
            # Get counts by change reason
            reason_counts = {}
            from sqlalchemy import func
            reason_results = query.with_entities(
                UnitChangeAudit.change_reason,
                func.count(UnitChangeAudit.id).label('count')
            ).group_by(UnitChangeAudit.change_reason).all()
            
            for reason, count in reason_results:
                reason_key = reason or "unknown"
                reason_counts[reason_key] = count
            
            return {
                "total_changes": total_changes,
                "table_counts": table_counts,
                "reason_counts": reason_counts,
                "filters": {
                    "table_name": table_name,
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting audit summary: {str(e)}")
            raise AuditServiceError(f"Failed to get audit summary: {str(e)}")
        finally:
            if db:
                try:
                    db.close()
                except Exception as e:
                    logger.error(f"Error closing audit database connection: {str(e)}")