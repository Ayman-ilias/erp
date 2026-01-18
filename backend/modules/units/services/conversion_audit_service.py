"""
Unit Conversion Audit Service

This service provides optional audit logging for unit conversions.
It can be used to track what conversions users are performing for analytics
and audit purposes.

Requirements: 15.3
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import logging

from modules.units.services.audit_service import UnitChangeAuditService

logger = logging.getLogger(__name__)


class ConversionAuditService:
    """
    Service for optionally logging unit conversions for audit purposes.
    
    This service provides methods to:
    - Log individual unit conversions
    - Log batch conversions
    - Generate conversion analytics
    - Track conversion patterns
    """
    
    @classmethod
    def log_conversion(
        cls,
        from_unit_id: int,
        to_unit_id: int,
        input_value: float,
        output_value: float,
        user_id: Optional[str] = None,
        context: Optional[str] = None,
        source_table: Optional[str] = None,
        source_record_id: Optional[int] = None
    ) -> bool:
        """
        Log a unit conversion for audit purposes.
        
        Args:
            from_unit_id: Source unit ID
            to_unit_id: Target unit ID
            input_value: Input value
            output_value: Converted value
            user_id: Optional user identifier
            context: Optional context (e.g., "material_form", "inline_converter", "api_call")
            source_table: Optional table name where conversion was used
            source_record_id: Optional record ID where conversion was used
            
        Returns:
            True if logged successfully, False otherwise
            
        Example:
            >>> ConversionAuditService.log_conversion(
            ...     from_unit_id=1,  # kilogram
            ...     to_unit_id=2,    # gram
            ...     input_value=1.5,
            ...     output_value=1500.0,
            ...     user_id="user_456",
            ...     context="inline_converter",
            ...     source_table="material_master",
            ...     source_record_id=123
            ... )
        """
        try:
            # Build context string with additional information
            context_parts = []
            if context:
                context_parts.append(context)
            if source_table and source_record_id:
                context_parts.append(f"source:{source_table}:{source_record_id}")
            
            full_context = "|".join(context_parts) if context_parts else "unknown"
            
            # Use the audit service to log the conversion
            return UnitChangeAuditService.log_conversion_audit(
                from_unit_id=from_unit_id,
                to_unit_id=to_unit_id,
                input_value=input_value,
                output_value=output_value,
                user_id=user_id,
                context=full_context
            )
            
        except Exception as e:
            logger.error(f"Error logging conversion audit: {str(e)}")
            return False
    
    @classmethod
    def log_batch_conversions(
        cls,
        conversions: List[Dict[str, Any]],
        user_id: Optional[str] = None,
        context: Optional[str] = None
    ) -> int:
        """
        Log multiple conversions in batch.
        
        Args:
            conversions: List of conversion dictionaries with keys:
                        - from_unit_id: Source unit ID
                        - to_unit_id: Target unit ID
                        - input_value: Input value
                        - output_value: Converted value
                        - source_table: Optional source table
                        - source_record_id: Optional source record ID
            user_id: Optional user identifier
            context: Optional context for all conversions
            
        Returns:
            Number of conversions successfully logged
            
        Example:
            >>> conversions = [
            ...     {
            ...         "from_unit_id": 1,
            ...         "to_unit_id": 2,
            ...         "input_value": 1.0,
            ...         "output_value": 1000.0,
            ...         "source_table": "material_master",
            ...         "source_record_id": 123
            ...     },
            ...     {
            ...         "from_unit_id": 3,
            ...         "to_unit_id": 4,
            ...         "input_value": 100.0,
            ...         "output_value": 1.0
            ...     }
            ... ]
            >>> logged_count = ConversionAuditService.log_batch_conversions(
            ...     conversions, user_id="user_456", context="bulk_conversion"
            ... )
        """
        logged_count = 0
        
        for conversion in conversions:
            try:
                success = cls.log_conversion(
                    from_unit_id=conversion["from_unit_id"],
                    to_unit_id=conversion["to_unit_id"],
                    input_value=conversion["input_value"],
                    output_value=conversion["output_value"],
                    user_id=user_id,
                    context=context,
                    source_table=conversion.get("source_table"),
                    source_record_id=conversion.get("source_record_id")
                )
                
                if success:
                    logged_count += 1
                    
            except Exception as e:
                logger.error(f"Error logging conversion in batch: {str(e)}")
        
        logger.info(f"Logged {logged_count} out of {len(conversions)} conversions")
        return logged_count
    
    @classmethod
    def get_conversion_analytics(
        cls,
        user_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 1000
    ) -> Dict[str, Any]:
        """
        Get conversion analytics and patterns.
        
        Args:
            user_id: Optional filter by user
            start_date: Optional start date filter
            end_date: Optional end date filter
            limit: Maximum number of conversion logs to analyze
            
        Returns:
            Dictionary with conversion analytics
            
        Example:
            >>> analytics = ConversionAuditService.get_conversion_analytics(
            ...     user_id="user_456",
            ...     start_date=datetime.now() - timedelta(days=30)
            ... )
            >>> print(f"Most common conversion: {analytics['most_common_conversion']}")
        """
        try:
            # Get conversion audit logs
            audit_logs = UnitChangeAuditService.get_audit_logs(
                table_name="conversion_audit",
                changed_by=user_id,
                start_date=start_date,
                end_date=end_date,
                limit=limit
            )
            
            if not audit_logs:
                return {
                    'total_conversions': 0,
                    'unique_users': 0,
                    'conversion_pairs': {},
                    'context_usage': {},
                    'date_range': {
                        'start': start_date.isoformat() if start_date else None,
                        'end': end_date.isoformat() if end_date else None
                    }
                }
            
            # Analyze conversion patterns
            conversion_pairs = {}
            context_usage = {}
            users = set()
            
            for log in audit_logs:
                # Track users
                if log.get('changed_by'):
                    users.add(log['changed_by'])
                
                # Track conversion pairs
                from_unit = log.get('old_unit_id')
                to_unit = log.get('new_unit_id')
                if from_unit and to_unit:
                    pair_key = f"{from_unit}→{to_unit}"
                    conversion_pairs[pair_key] = conversion_pairs.get(pair_key, 0) + 1
                
                # Track context usage
                reason = log.get('change_reason', '')
                if reason.startswith('conversion:'):
                    # Extract context from reason: "conversion:value→value:context"
                    parts = reason.split(':', 2)
                    if len(parts) >= 3:
                        context = parts[2]
                        # Further split context by | for multiple context parts
                        context_parts = context.split('|')
                        for part in context_parts:
                            context_usage[part] = context_usage.get(part, 0) + 1
            
            # Find most common patterns
            most_common_conversion = max(conversion_pairs.items(), key=lambda x: x[1]) if conversion_pairs else None
            most_common_context = max(context_usage.items(), key=lambda x: x[1]) if context_usage else None
            
            return {
                'total_conversions': len(audit_logs),
                'unique_users': len(users),
                'unique_conversion_pairs': len(conversion_pairs),
                'conversion_pairs': dict(sorted(conversion_pairs.items(), key=lambda x: x[1], reverse=True)[:10]),
                'context_usage': dict(sorted(context_usage.items(), key=lambda x: x[1], reverse=True)),
                'most_common_conversion': {
                    'pair': most_common_conversion[0],
                    'count': most_common_conversion[1]
                } if most_common_conversion else None,
                'most_common_context': {
                    'context': most_common_context[0],
                    'count': most_common_context[1]
                } if most_common_context else None,
                'date_range': {
                    'start': start_date.isoformat() if start_date else None,
                    'end': end_date.isoformat() if end_date else None
                },
                'filters': {
                    'user_id': user_id,
                    'limit': limit
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting conversion analytics: {str(e)}")
            return {
                'error': str(e),
                'total_conversions': 0,
                'unique_users': 0
            }
    
    @classmethod
    def get_user_conversion_summary(
        cls,
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get conversion summary for a specific user.
        
        Args:
            user_id: User identifier
            days: Number of days to look back (default: 30)
            
        Returns:
            Dictionary with user's conversion summary
            
        Example:
            >>> summary = ConversionAuditService.get_user_conversion_summary("user_456")
            >>> print(f"User performed {summary['total_conversions']} conversions")
        """
        try:
            start_date = datetime.now() - timedelta(days=days)
            
            analytics = cls.get_conversion_analytics(
                user_id=user_id,
                start_date=start_date,
                limit=1000
            )
            
            return {
                'user_id': user_id,
                'period_days': days,
                'total_conversions': analytics.get('total_conversions', 0),
                'unique_conversion_pairs': analytics.get('unique_conversion_pairs', 0),
                'favorite_conversions': list(analytics.get('conversion_pairs', {}).items())[:5],
                'contexts_used': list(analytics.get('context_usage', {}).items()),
                'most_active_context': analytics.get('most_common_context'),
                'period_start': start_date.isoformat(),
                'period_end': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting user conversion summary: {str(e)}")
            return {
                'user_id': user_id,
                'error': str(e),
                'total_conversions': 0
            }