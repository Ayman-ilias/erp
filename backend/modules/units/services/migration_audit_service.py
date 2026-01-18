"""
Migration Audit Service

This service provides audit logging functionality specifically for migration operations.
It logs unit mappings during migration from text units to unit_id values.

Requirements: 15.2
"""

from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, DatabaseError
from sqlalchemy import text
import logging

from core.database import SessionLocalSamples, SessionLocalUnits, SessionLocalSettings
from modules.units.services.audit_service import UnitChangeAuditService

logger = logging.getLogger(__name__)


class MigrationAuditServiceError(Exception):
    """Custom exception for migration audit service errors"""
    pass


class MigrationAuditService:
    """
    Service for logging unit mappings during migration operations.
    
    This service provides methods to:
    - Log unit mappings during migration from text to unit_id
    - Log unmapped units for manual review
    - Generate migration audit reports
    - Verify migration completeness
    """
    
    @classmethod
    def log_migration_batch(
        cls,
        table_name: str,
        mappings: List[Dict[str, Any]],
        changed_by: str = "migration_system"
    ) -> Tuple[int, int]:
        """
        Log a batch of migration mappings for audit purposes.
        
        Args:
            table_name: Name of the table being migrated
            mappings: List of mapping dictionaries with keys:
                     - record_id: ID of the record
                     - field_name: Name of the field (e.g., "unit_id")
                     - old_text_unit: Original text unit value
                     - new_unit_id: Mapped unit ID
            changed_by: System identifier (default: "migration_system")
            
        Returns:
            Tuple of (successful_logs, failed_logs)
            
        Example:
            >>> mappings = [
            ...     {
            ...         "record_id": 1,
            ...         "field_name": "unit_id",
            ...         "old_text_unit": "kg",
            ...         "new_unit_id": 5
            ...     },
            ...     {
            ...         "record_id": 2,
            ...         "field_name": "unit_id",
            ...         "old_text_unit": "meter",
            ...         "new_unit_id": 10
            ...     }
            ... ]
            >>> success, failed = MigrationAuditService.log_migration_batch(
            ...     "material_master", mappings
            ... )
        """
        successful_logs = 0
        failed_logs = 0
        
        for mapping in mappings:
            try:
                success = UnitChangeAuditService.log_migration_mapping(
                    table_name=table_name,
                    record_id=mapping["record_id"],
                    field_name=mapping["field_name"],
                    old_text_unit=mapping["old_text_unit"],
                    new_unit_id=mapping["new_unit_id"],
                    changed_by=changed_by
                )
                
                if success:
                    successful_logs += 1
                else:
                    failed_logs += 1
                    logger.warning(
                        f"Failed to log migration mapping: table={table_name}, "
                        f"record_id={mapping['record_id']}, "
                        f"old_unit={mapping['old_text_unit']}, "
                        f"new_unit_id={mapping['new_unit_id']}"
                    )
                    
            except Exception as e:
                failed_logs += 1
                logger.error(
                    f"Error logging migration mapping: table={table_name}, "
                    f"record_id={mapping['record_id']}, error={str(e)}"
                )
        
        logger.info(
            f"Migration batch logging completed: table={table_name}, "
            f"successful={successful_logs}, failed={failed_logs}"
        )
        
        return successful_logs, failed_logs
    
    @classmethod
    def log_unmapped_units(
        cls,
        table_name: str,
        unmapped_records: List[Dict[str, Any]],
        changed_by: str = "migration_system"
    ) -> int:
        """
        Log unmapped units that could not be migrated automatically.
        
        These entries will have new_unit_id=None and a special change_reason
        to indicate they need manual review.
        
        Args:
            table_name: Name of the table being migrated
            unmapped_records: List of unmapped record dictionaries with keys:
                            - record_id: ID of the record
                            - field_name: Name of the field
                            - old_text_unit: Original text unit value that couldn't be mapped
            changed_by: System identifier (default: "migration_system")
            
        Returns:
            Number of unmapped units logged
            
        Example:
            >>> unmapped = [
            ...     {
            ...         "record_id": 100,
            ...         "field_name": "unit_id",
            ...         "old_text_unit": "unknown_unit"
            ...     }
            ... ]
            >>> count = MigrationAuditService.log_unmapped_units(
            ...     "material_master", unmapped
            ... )
        """
        logged_count = 0
        
        for record in unmapped_records:
            try:
                success = UnitChangeAuditService.log_unit_change(
                    table_name=table_name,
                    record_id=record["record_id"],
                    field_name=record["field_name"],
                    old_unit_id=None,  # No old unit_id during migration
                    new_unit_id=None,  # No mapping found
                    changed_by=changed_by,
                    change_reason=f"migration_unmapped:{record['old_text_unit']}"
                )
                
                if success:
                    logged_count += 1
                else:
                    logger.warning(
                        f"Failed to log unmapped unit: table={table_name}, "
                        f"record_id={record['record_id']}, "
                        f"old_unit={record['old_text_unit']}"
                    )
                    
            except Exception as e:
                logger.error(
                    f"Error logging unmapped unit: table={table_name}, "
                    f"record_id={record['record_id']}, error={str(e)}"
                )
        
        logger.info(
            f"Logged {logged_count} unmapped units for table={table_name}"
        )
        
        return logged_count
    
    @classmethod
    def get_migration_report(
        cls,
        table_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a migration audit report.
        
        Args:
            table_name: Optional filter by table name
            
        Returns:
            Dictionary with migration statistics and details
            
        Example:
            >>> report = MigrationAuditService.get_migration_report("material_master")
            >>> print(f"Mapped: {report['mapped_count']}, Unmapped: {report['unmapped_count']}")
        """
        try:
            # Get all migration-related audit logs
            audit_logs = UnitChangeAuditService.get_audit_logs(
                table_name=table_name,
                limit=10000  # Get all migration logs
            )
            
            # Filter migration logs
            migration_logs = [
                log for log in audit_logs
                if log.get('change_reason', '').startswith('migration_')
            ]
            
            # Categorize logs
            mapped_logs = [
                log for log in migration_logs
                if log.get('change_reason', '').startswith('migration_from_text:')
            ]
            
            unmapped_logs = [
                log for log in migration_logs
                if log.get('change_reason', '').startswith('migration_unmapped:')
            ]
            
            # Extract unit mappings
            unit_mappings = {}
            unmapped_units = set()
            
            for log in mapped_logs:
                reason = log.get('change_reason', '')
                if ':' in reason:
                    old_text = reason.split(':', 1)[1]
                    new_unit_id = log.get('new_unit_id')
                    if old_text and new_unit_id:
                        unit_mappings[old_text] = new_unit_id
            
            for log in unmapped_logs:
                reason = log.get('change_reason', '')
                if ':' in reason:
                    old_text = reason.split(':', 1)[1]
                    if old_text:
                        unmapped_units.add(old_text)
            
            # Table statistics
            table_stats = {}
            for log in migration_logs:
                table = log.get('table_name')
                if table:
                    if table not in table_stats:
                        table_stats[table] = {'mapped': 0, 'unmapped': 0}
                    
                    if log.get('change_reason', '').startswith('migration_from_text:'):
                        table_stats[table]['mapped'] += 1
                    elif log.get('change_reason', '').startswith('migration_unmapped:'):
                        table_stats[table]['unmapped'] += 1
            
            return {
                'total_migration_logs': len(migration_logs),
                'mapped_count': len(mapped_logs),
                'unmapped_count': len(unmapped_logs),
                'unique_unit_mappings': len(unit_mappings),
                'unique_unmapped_units': len(unmapped_units),
                'table_statistics': table_stats,
                'unit_mappings': unit_mappings,
                'unmapped_units': list(unmapped_units),
                'filters': {
                    'table_name': table_name
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating migration report: {str(e)}")
            raise MigrationAuditServiceError(f"Failed to generate migration report: {str(e)}")
    
    @classmethod
    def verify_migration_completeness(
        cls,
        table_name: str,
        expected_record_count: int
    ) -> Dict[str, Any]:
        """
        Verify that migration was complete by checking audit logs.
        
        Args:
            table_name: Name of the table to verify
            expected_record_count: Expected number of records that should have been migrated
            
        Returns:
            Dictionary with verification results
            
        Example:
            >>> result = MigrationAuditService.verify_migration_completeness(
            ...     "material_master", 1000
            ... )
            >>> if result['is_complete']:
            ...     print("Migration completed successfully")
        """
        try:
            # Get migration logs for this table
            audit_logs = UnitChangeAuditService.get_audit_logs(
                table_name=table_name,
                limit=expected_record_count + 100  # Buffer for safety
            )
            
            # Filter migration logs
            migration_logs = [
                log for log in audit_logs
                if log.get('change_reason', '').startswith('migration_')
            ]
            
            # Count unique records that were migrated
            migrated_record_ids = set()
            for log in migration_logs:
                record_id = log.get('record_id')
                if record_id is not None:
                    migrated_record_ids.add(record_id)
            
            actual_migrated_count = len(migrated_record_ids)
            
            # Calculate completeness
            is_complete = actual_migrated_count >= expected_record_count
            completeness_percentage = (actual_migrated_count / expected_record_count * 100) if expected_record_count > 0 else 0
            
            # Count mapped vs unmapped
            mapped_count = len([
                log for log in migration_logs
                if log.get('change_reason', '').startswith('migration_from_text:')
            ])
            
            unmapped_count = len([
                log for log in migration_logs
                if log.get('change_reason', '').startswith('migration_unmapped:')
            ])
            
            return {
                'table_name': table_name,
                'is_complete': is_complete,
                'expected_count': expected_record_count,
                'actual_migrated_count': actual_migrated_count,
                'completeness_percentage': round(completeness_percentage, 2),
                'mapped_count': mapped_count,
                'unmapped_count': unmapped_count,
                'missing_count': max(0, expected_record_count - actual_migrated_count),
                'verification_passed': is_complete and unmapped_count == 0
            }
            
        except Exception as e:
            logger.error(f"Error verifying migration completeness: {str(e)}")
            raise MigrationAuditServiceError(f"Failed to verify migration completeness: {str(e)}")