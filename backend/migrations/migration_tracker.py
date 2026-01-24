"""
Migration Tracking System

This module provides a simple migration tracking system to avoid running
migrations multiple times and to provide better error handling.
"""

import logging
from sqlalchemy import text, create_engine
from core.database import SessionLocalSamples
from datetime import datetime
from typing import List, Dict, Callable
import traceback

logger = logging.getLogger(__name__)


class MigrationTracker:
    """
    Tracks which migrations have been run to avoid duplicate execution.
    """
    
    def __init__(self):
        self.db = SessionLocalSamples()
        self._ensure_migration_table()
        self.executed_migrations = set()
        self._load_executed_migrations()
    
    def _ensure_migration_table(self):
        """Create migration tracking table if it doesn't exist."""
        try:
            self.db.execute(text("""
                CREATE TABLE IF NOT EXISTS migration_history (
                    id SERIAL PRIMARY KEY,
                    migration_name VARCHAR(255) UNIQUE NOT NULL,
                    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    success BOOLEAN DEFAULT TRUE,
                    error_message TEXT,
                    execution_time_ms INTEGER
                )
            """))
            self.db.commit()
        except Exception as e:
            logger.error(f"Failed to create migration_history table: {e}")
            self.db.rollback()
            raise
    
    def _load_executed_migrations(self):
        """Load list of successfully executed migrations."""
        try:
            result = self.db.execute(text("""
                SELECT migration_name 
                FROM migration_history 
                WHERE success = TRUE
            """))
            self.executed_migrations = {row[0] for row in result}
        except Exception as e:
            logger.warning(f"Could not load migration history: {e}")
            self.executed_migrations = set()
    
    def has_run(self, migration_name: str) -> bool:
        """Check if a migration has already been successfully executed."""
        return migration_name in self.executed_migrations
    
    def mark_success(self, migration_name: str, execution_time_ms: int = 0):
        """Mark a migration as successfully executed."""
        try:
            self.db.execute(text("""
                INSERT INTO migration_history (migration_name, executed_at, success, execution_time_ms)
                VALUES (:name, NOW(), TRUE, :time_ms)
                ON CONFLICT (migration_name) 
                DO UPDATE SET 
                    executed_at = NOW(),
                    success = TRUE,
                    error_message = NULL,
                    execution_time_ms = :time_ms
            """), {"name": migration_name, "time_ms": execution_time_ms})
            self.db.commit()
            self.executed_migrations.add(migration_name)
        except Exception as e:
            logger.error(f"Failed to mark migration {migration_name} as successful: {e}")
            self.db.rollback()
    
    def mark_failure(self, migration_name: str, error_message: str):
        """Mark a migration as failed."""
        try:
            self.db.execute(text("""
                INSERT INTO migration_history (migration_name, executed_at, success, error_message)
                VALUES (:name, NOW(), FALSE, :error)
                ON CONFLICT (migration_name) 
                DO UPDATE SET 
                    executed_at = NOW(),
                    success = FALSE,
                    error_message = :error
            """), {"name": migration_name, "error": error_message})
            self.db.commit()
        except Exception as e:
            logger.error(f"Failed to mark migration {migration_name} as failed: {e}")
            self.db.rollback()
    
    def run_migration(self, migration_name: str, migration_func: Callable, *args, **kwargs):
        """
        Run a migration with tracking and error handling.
        
        Args:
            migration_name: Unique name for the migration
            migration_func: Function to execute
            *args, **kwargs: Arguments to pass to the migration function
        """
        if self.has_run(migration_name):
            logger.info(f"⏭️  Skipping {migration_name} (already executed)")
            return
        
        logger.info(f"🔄 Running migration: {migration_name}")
        start_time = datetime.now()
        
        try:
            migration_func(*args, **kwargs)
            end_time = datetime.now()
            execution_time_ms = int((end_time - start_time).total_seconds() * 1000)
            
            self.mark_success(migration_name, execution_time_ms)
            logger.info(f"✅ Migration {migration_name} completed successfully ({execution_time_ms}ms)")
            
        except Exception as e:
            error_message = f"{str(e)}\n{traceback.format_exc()}"
            self.mark_failure(migration_name, error_message)
            logger.error(f"❌ Migration {migration_name} failed: {e}")
            # Don't re-raise to allow other migrations to continue
    
    def get_migration_status(self) -> List[Dict]:
        """Get status of all migrations."""
        try:
            result = self.db.execute(text("""
                SELECT migration_name, executed_at, success, error_message, execution_time_ms
                FROM migration_history
                ORDER BY executed_at DESC
            """))
            return [
                {
                    "name": row[0],
                    "executed_at": row[1],
                    "success": row[2],
                    "error_message": row[3],
                    "execution_time_ms": row[4]
                }
                for row in result
            ]
        except Exception as e:
            logger.error(f"Failed to get migration status: {e}")
            return []
    
    def close(self):
        """Close database connection."""
        if self.db:
            self.db.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


def run_all_migrations():
    """
    Run all migrations with proper tracking and error handling.
    """
    with MigrationTracker() as tracker:
        logger.info("=" * 80)
        logger.info("STARTING MIGRATION SEQUENCE")
        logger.info("=" * 80)
        
        # Phase 1: Basic schema and buyer types
        from migrations.add_buyer_types import add_buyer_types
        tracker.run_migration("add_buyer_types", add_buyer_types)
        
        from migrations.add_buyer_name_to_sample_primary_info import add_buyer_name_column
        tracker.run_migration("add_buyer_name_to_sample_primary_info", add_buyer_name_column)
        
        # Phase 2: UOM system setup
        from migrations.add_uom_new_columns import run_migration
        tracker.run_migration("add_uom_new_columns", run_migration)
        
        from migrations.create_uom_conversion_system import create_uom_conversion_system
        tracker.run_migration("create_uom_conversion_system", create_uom_conversion_system)
        
        try:
            from migrations.seed_standard_uom_units import run_migration as seed_standard_units
            tracker.run_migration("seed_standard_uom_units", seed_standard_units)
        except ImportError:
            logger.warning("seed_standard_uom_units migration not found, skipping")
        
        from migrations.seed_unit_conversion_system import seed_unit_conversion_system
        tracker.run_migration("seed_unit_conversion_system", seed_unit_conversion_system)
        
        # Phase 3: Unit ID columns and data migration
        from migrations.add_unit_id_columns import run_migration as add_unit_id_columns
        tracker.run_migration("add_unit_id_columns", add_unit_id_columns)
        
        try:
            from migrations.migrate_unit_data import run_migration as migrate_unit_data
            tracker.run_migration("migrate_unit_data", migrate_unit_data)
        except ImportError:
            logger.warning("migrate_unit_data migration not found, skipping")
        
        # Phase 4: Color and size system
        from migrations.add_color_size_ids_to_sample_primary_info import add_color_size_ids_columns
        tracker.run_migration("add_color_size_ids_to_sample_primary_info", add_color_size_ids_columns)
        
        from migrations.add_color_size_yarn_ids_to_sample_requests import add_color_size_yarn_ids_columns
        tracker.run_migration("add_color_size_yarn_ids_to_sample_requests", add_color_size_yarn_ids_columns)
        
        from migrations.create_color_master import create_color_master
        tracker.run_migration("create_color_master", create_color_master)
        
        try:
            from migrations.fix_color_master_constraint import run_migration as fix_color_constraint
            tracker.run_migration("fix_color_master_constraint", fix_color_constraint)
        except ImportError:
            logger.warning("fix_color_master_constraint migration not found, skipping")
        
        try:
            from migrations.seed_pantone_tcx_colors import run_migration as seed_pantone_colors
            tracker.run_migration("seed_pantone_tcx_colors", seed_pantone_colors)
        except ImportError:
            logger.warning("seed_pantone_tcx_colors migration not found, skipping")
        
        from migrations.create_size_chart_system import create_size_chart_system
        tracker.run_migration("create_size_chart_system", create_size_chart_system)
        
        try:
            from migrations.enhance_size_chart_schema import run_migration as enhance_size_chart
            tracker.run_migration("enhance_size_chart_schema", enhance_size_chart)
        except ImportError:
            logger.warning("enhance_size_chart_schema migration not found, skipping")
        
        from migrations.seed_sizecolor_data import seed_sizecolor_data
        tracker.run_migration("seed_sizecolor_data", seed_sizecolor_data)
        
        # Remove universal color link from H&M colors
        from migrations.remove_hm_color_universal_link import run_migration as remove_hm_universal_link
        tracker.run_migration("remove_hm_color_universal_link", remove_hm_universal_link)
        
        # Phase 5: Workflow system
        from migrations.create_workflow_tables import create_workflow_tables
        tracker.run_migration("create_workflow_tables", create_workflow_tables)
        
        from migrations.seed_workflow_templates import seed_workflow_templates
        tracker.run_migration("seed_workflow_templates", seed_workflow_templates)
        
        # Phase 6: Sample schema improvements
        from migrations.add_priority_to_sample_tables import run_migration as add_priority_columns
        tracker.run_migration("add_priority_to_sample_tables", add_priority_columns)
        
        try:
            from migrations.add_techpack_files_column import run_migration as add_techpack_files
            tracker.run_migration("add_techpack_files_column", add_techpack_files)
        except ImportError:
            logger.warning("add_techpack_files_column migration not found, skipping")
        
        try:
            from migrations.fix_techpack_files_immediate import run_migration as fix_techpack_files
            tracker.run_migration("fix_techpack_files_immediate", fix_techpack_files)
        except ImportError:
            logger.warning("fix_techpack_files_immediate migration not found, skipping")
        
        try:
            from migrations.fix_decorative_part_additional_instruction_schema_v2 import migrate as fix_decorative_schema
            tracker.run_migration("fix_decorative_part_additional_instruction_schema_v2", fix_decorative_schema)
        except ImportError:
            logger.warning("fix_decorative_part_additional_instruction_schema_v2 migration not found, skipping")
        
        try:
            from migrations.update_sample_primary_info_schema import run_migration as update_sample_primary
            tracker.run_migration("update_sample_primary_info_schema", update_sample_primary)
        except ImportError:
            logger.warning("update_sample_primary_info_schema migration not found, skipping")
        
        try:
            from migrations.update_sample_status_schema import run_migration as update_sample_status
            tracker.run_migration("update_sample_status_schema", update_sample_status)
        except ImportError:
            logger.warning("update_sample_status_schema migration not found, skipping")
        
        try:
            from migrations.add_expecting_end_date_to_sample_status import run_migration as add_expecting_end_date
            tracker.run_migration("add_expecting_end_date_to_sample_status", add_expecting_end_date)
        except ImportError:
            logger.warning("add_expecting_end_date_to_sample_status migration not found, skipping")
        
        # Phase 7: Multi-company and settings
        from migrations.add_multi_company_support import run_migration as add_multi_company
        tracker.run_migration("add_multi_company_support", add_multi_company)
        
        from migrations.add_company_id_to_branches import run_migration as add_company_to_branches
        tracker.run_migration("add_company_id_to_branches", add_company_to_branches)
        
        from migrations.create_country_port_tables import run_migration as create_country_port
        tracker.run_migration("create_country_port_tables", create_country_port)
        
        try:
            from migrations.seed_countries_ports import run_migration as seed_countries_ports
            tracker.run_migration("seed_countries_ports", seed_countries_ports)
        except ImportError:
            logger.warning("seed_countries_ports migration not found, skipping")
        
        # Phase 8: Enhanced measurement specifications
        from migrations.enhance_size_measurement_specifications import enhance_size_measurement_specifications
        tracker.run_migration("enhance_size_measurement_specifications", enhance_size_measurement_specifications)
        
        # Phase 9: Packing and additional features
        # Phase 9: Packing and additional features
        try:
            from migrations.add_packing_good_carton_columns import run_migration as add_packing_columns
            tracker.run_migration("add_packing_good_carton_columns", add_packing_columns)
        except ImportError:
            logger.warning("add_packing_good_carton_columns migration not found, skipping")
        
        try:
            from migrations.create_unit_change_audit_table import run_migration as create_audit_table
            tracker.run_migration("create_unit_change_audit_table", create_audit_table)
        except ImportError:
            logger.warning("create_unit_change_audit_table migration not found, skipping")
        
        # Phase 10: Merchandiser UOM integration
        try:
            from migrations.add_uom_to_merchandiser_tables import run_migration as add_merchandiser_uom
            tracker.run_migration("add_uom_to_merchandiser_tables", add_merchandiser_uom)
        except ImportError:
            logger.warning("add_uom_to_merchandiser_tables migration not found, skipping")
        
        # Phase 11: Performance optimizations
        from migrations.add_performance_indexes import add_performance_indexes
        tracker.run_migration("add_performance_indexes", add_performance_indexes)
        
        # Phase 12: Comprehensive color data import (v2 - fixed H&M Excel reading)
        from migrations.import_comprehensive_colors import run_migration as import_comprehensive_colors
        tracker.run_migration("import_comprehensive_colors_v2", import_comprehensive_colors)

        # Phase 13: Order Management System
        try:
            from migrations.create_order_management_tables import run_migration as create_order_management
            tracker.run_migration("create_order_management_tables", create_order_management)
        except ImportError:
            logger.warning("create_order_management_tables migration not found, skipping")

        # Phase 14: Add yarn_composition_details and cuttable_width columns
        try:
            from migrations.add_yarn_fabric_columns import run_migration as add_yarn_fabric_columns
            tracker.run_migration("add_yarn_fabric_columns", add_yarn_fabric_columns)
        except ImportError:
            logger.warning("add_yarn_fabric_columns migration not found, skipping")

        # Phase 15: Add page_permissions to users for page-level access control
        try:
            from migrations.add_page_permissions_to_users import run_migration as add_page_permissions
            tracker.run_migration("add_page_permissions_to_users", add_page_permissions)
        except ImportError:
            logger.warning("add_page_permissions_to_users migration not found, skipping")

        logger.info("=" * 80)
        logger.info("MIGRATION SEQUENCE COMPLETED")
        logger.info("=" * 80)
        
        # Print summary
        status = tracker.get_migration_status()
        successful = sum(1 for s in status if s["success"])
        failed = sum(1 for s in status if not s["success"])
        
        logger.info(f"Total migrations: {len(status)}")
        logger.info(f"Successful: {successful}")
        logger.info(f"Failed: {failed}")
        
        if failed > 0:
            logger.warning("Some migrations failed. Check logs for details.")
            for s in status:
                if not s["success"]:
                    logger.error(f"Failed: {s['name']} - {s['error_message']}")


if __name__ == "__main__":
    run_all_migrations()