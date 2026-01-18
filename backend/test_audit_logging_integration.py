"""
Test Audit Logging Integration

This test verifies that the audit logging functionality works correctly
across all material services.

Requirements: 15.1, 15.2, 15.3
"""

from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

from modules.units.services.audit_service import UnitChangeAuditService, AuditServiceError
from modules.units.services.migration_audit_service import MigrationAuditService
from modules.units.services.conversion_audit_service import ConversionAuditService
from modules.materials.services.material_service import MaterialService
from modules.samples.services.sample_material_service import SampleMaterialService


class TestUnitChangeAuditService:
    """Test the core audit logging service"""
    
    def test_log_unit_change_success(self):
        """Test successful unit change logging"""
        with patch.object(UnitChangeAuditService, '_get_audit_db_session') as mock_db:
            mock_session = MagicMock()
            mock_db.return_value = mock_session
            
            result = UnitChangeAuditService.log_unit_change(
                table_name="material_master",
                record_id=123,
                field_name="unit_id",
                old_unit_id=1,
                new_unit_id=2,
                changed_by="user_456",
                change_reason="user_update"
            )
            
            assert result is True
            mock_session.add.assert_called_once()
            mock_session.commit.assert_called_once()
            mock_session.close.assert_called_once()
    
    def test_log_unit_change_database_error(self):
        """Test unit change logging with database error"""
        with patch.object(UnitChangeAuditService, '_get_audit_db_session') as mock_db:
            mock_session = MagicMock()
            mock_session.commit.side_effect = Exception("Database error")
            mock_db.return_value = mock_session
            
            result = UnitChangeAuditService.log_unit_change(
                table_name="material_master",
                record_id=123,
                field_name="unit_id",
                old_unit_id=1,
                new_unit_id=2
            )
            
            assert result is False
            mock_session.rollback.assert_called_once()
            mock_session.close.assert_called_once()
    
    def test_log_migration_mapping(self):
        """Test migration mapping logging"""
        with patch.object(UnitChangeAuditService, 'log_unit_change') as mock_log:
            mock_log.return_value = True
            
            result = UnitChangeAuditService.log_migration_mapping(
                table_name="material_master",
                record_id=123,
                field_name="unit_id",
                old_text_unit="kg",
                new_unit_id=5
            )
            
            assert result is True
            mock_log.assert_called_once_with(
                table_name="material_master",
                record_id=123,
                field_name="unit_id",
                old_unit_id=None,
                new_unit_id=5,
                changed_by="migration_system",
                change_reason="migration_from_text:kg"
            )
    
    def test_log_conversion_audit(self):
        """Test conversion audit logging"""
        with patch.object(UnitChangeAuditService, 'log_unit_change') as mock_log:
            mock_log.return_value = True
            
            result = UnitChangeAuditService.log_conversion_audit(
                from_unit_id=1,
                to_unit_id=2,
                input_value=100.0,
                output_value=0.1,
                user_id="user_456",
                context="inline_converter"
            )
            
            assert result is True
            mock_log.assert_called_once_with(
                table_name="conversion_audit",
                record_id=0,
                field_name="conversion",
                old_unit_id=1,
                new_unit_id=2,
                changed_by="user_456",
                change_reason="conversion:100.0→0.1:inline_converter"
            )
    
    def test_get_audit_logs_with_filters(self):
        """Test retrieving audit logs with filters"""
        with patch.object(UnitChangeAuditService, '_get_audit_db_session') as mock_db:
            mock_session = MagicMock()
            mock_db.return_value = mock_session
            
            # Mock query results
            mock_log = MagicMock()
            mock_log.id = 1
            mock_log.table_name = "material_master"
            mock_log.record_id = 123
            mock_log.field_name = "unit_id"
            mock_log.old_unit_id = 1
            mock_log.new_unit_id = 2
            mock_log.changed_by = "user_456"
            mock_log.changed_at = datetime.now()
            mock_log.change_reason = "user_update"
            
            mock_query = mock_session.query.return_value
            mock_query.filter.return_value = mock_query
            mock_query.order_by.return_value = mock_query
            mock_query.offset.return_value = mock_query
            mock_query.limit.return_value = mock_query
            mock_query.all.return_value = [mock_log]
            
            logs = UnitChangeAuditService.get_audit_logs(
                table_name="material_master",
                record_id=123,
                limit=50
            )
            
            assert len(logs) == 1
            assert logs[0]["table_name"] == "material_master"
            assert logs[0]["record_id"] == 123
            assert logs[0]["field_name"] == "unit_id"
            mock_session.close.assert_called_once()


class TestMigrationAuditService:
    """Test the migration audit service"""
    
    def test_log_migration_batch(self):
        """Test batch migration logging"""
        mappings = [
            {
                "record_id": 1,
                "field_name": "unit_id",
                "old_text_unit": "kg",
                "new_unit_id": 5
            },
            {
                "record_id": 2,
                "field_name": "unit_id",
                "old_text_unit": "meter",
                "new_unit_id": 10
            }
        ]
        
        with patch.object(UnitChangeAuditService, 'log_migration_mapping') as mock_log:
            mock_log.return_value = True
            
            success, failed = MigrationAuditService.log_migration_batch(
                "material_master", mappings
            )
            
            assert success == 2
            assert failed == 0
            assert mock_log.call_count == 2
    
    def test_log_unmapped_units(self):
        """Test logging unmapped units"""
        unmapped = [
            {
                "record_id": 100,
                "field_name": "unit_id",
                "old_text_unit": "unknown_unit"
            }
        ]
        
        with patch.object(UnitChangeAuditService, 'log_unit_change') as mock_log:
            mock_log.return_value = True
            
            count = MigrationAuditService.log_unmapped_units(
                "material_master", unmapped
            )
            
            assert count == 1
            mock_log.assert_called_once_with(
                table_name="material_master",
                record_id=100,
                field_name="unit_id",
                old_unit_id=None,
                new_unit_id=None,
                changed_by="migration_system",
                change_reason="migration_unmapped:unknown_unit"
            )
    
    def test_get_migration_report(self):
        """Test migration report generation"""
        mock_logs = [
            {
                'change_reason': 'migration_from_text:kg',
                'new_unit_id': 5,
                'table_name': 'material_master'
            },
            {
                'change_reason': 'migration_unmapped:unknown_unit',
                'new_unit_id': None,
                'table_name': 'material_master'
            }
        ]
        
        with patch.object(UnitChangeAuditService, 'get_audit_logs') as mock_get:
            mock_get.return_value = mock_logs
            
            report = MigrationAuditService.get_migration_report("material_master")
            
            assert report['total_migration_logs'] == 2
            assert report['mapped_count'] == 1
            assert report['unmapped_count'] == 1
            assert 'kg' in report['unit_mappings']
            assert 'unknown_unit' in report['unmapped_units']


class TestConversionAuditService:
    """Test the conversion audit service"""
    
    def test_log_conversion(self):
        """Test conversion logging"""
        with patch.object(UnitChangeAuditService, 'log_conversion_audit') as mock_log:
            mock_log.return_value = True
            
            result = ConversionAuditService.log_conversion(
                from_unit_id=1,
                to_unit_id=2,
                input_value=1.5,
                output_value=1500.0,
                user_id="user_456",
                context="inline_converter",
                source_table="material_master",
                source_record_id=123
            )
            
            assert result is True
            mock_log.assert_called_once_with(
                from_unit_id=1,
                to_unit_id=2,
                input_value=1.5,
                output_value=1500.0,
                user_id="user_456",
                context="inline_converter|source:material_master:123"
            )
    
    def test_log_batch_conversions(self):
        """Test batch conversion logging"""
        conversions = [
            {
                "from_unit_id": 1,
                "to_unit_id": 2,
                "input_value": 1.0,
                "output_value": 1000.0
            },
            {
                "from_unit_id": 3,
                "to_unit_id": 4,
                "input_value": 100.0,
                "output_value": 1.0
            }
        ]
        
        with patch.object(ConversionAuditService, 'log_conversion') as mock_log:
            mock_log.return_value = True
            
            count = ConversionAuditService.log_batch_conversions(
                conversions, user_id="user_456", context="bulk_conversion"
            )
            
            assert count == 2
            assert mock_log.call_count == 2
    
    def test_get_conversion_analytics(self):
        """Test conversion analytics generation"""
        mock_logs = [
            {
                'changed_by': 'user_456',
                'old_unit_id': 1,
                'new_unit_id': 2,
                'change_reason': 'conversion:1.0→1000.0:inline_converter'
            },
            {
                'changed_by': 'user_789',
                'old_unit_id': 1,
                'new_unit_id': 2,
                'change_reason': 'conversion:2.0→2000.0:api_call'
            }
        ]
        
        with patch.object(UnitChangeAuditService, 'get_audit_logs') as mock_get:
            mock_get.return_value = mock_logs
            
            analytics = ConversionAuditService.get_conversion_analytics()
            
            assert analytics['total_conversions'] == 2
            assert analytics['unique_users'] == 2
            assert '1→2' in analytics['conversion_pairs']
            assert analytics['conversion_pairs']['1→2'] == 2


class TestMaterialServiceAuditIntegration:
    """Test audit logging integration in MaterialService"""
    
    def test_update_material_logs_unit_change(self):
        """Test that updating material unit_id logs the change"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_session_class:
            with patch('modules.materials.services.material_service.ValidationService.validate_unit_id') as mock_validate:
                with patch.object(UnitChangeAuditService, 'log_unit_change') as mock_log:
                    with patch.object(MaterialService, 'get_material_with_unit') as mock_get:
                        
                        # Setup mocks
                        mock_validate.return_value = True
                        mock_log.return_value = True
                        mock_get.return_value = {"id": 123, "unit_id": 2}
                        
                        mock_session = MagicMock()
                        mock_session_class.return_value = mock_session
                        
                        mock_material = MagicMock()
                        mock_material.id = 123
                        mock_material.unit_id = 1  # Old unit_id
                        mock_session.query.return_value.filter.return_value.first.return_value = mock_material
                        
                        # Test update
                        service = MaterialService()
                        result = service.update_material(
                            material_id=123,
                            unit_id=2,
                            changed_by="user_456"
                        )
                        
                        # Verify audit log was called
                        mock_log.assert_called_once_with(
                            table_name="material_master",
                            record_id=123,
                            field_name="unit_id",
                            old_unit_id=1,
                            new_unit_id=2,
                            changed_by="user_456",
                            change_reason="user_update"
                        )
    
    def test_update_material_no_unit_change_no_log(self):
        """Test that updating material without unit change doesn't log"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_session_class:
            with patch.object(UnitChangeAuditService, 'log_unit_change') as mock_log:
                with patch.object(MaterialService, 'get_material_with_unit') as mock_get:
                    
                    # Setup mocks
                    mock_log.return_value = True
                    mock_get.return_value = {"id": 123, "unit_id": 1}
                    
                    mock_session = MagicMock()
                    mock_session_class.return_value = mock_session
                    
                    mock_material = MagicMock()
                    mock_material.id = 123
                    mock_material.unit_id = 1
                    mock_session.query.return_value.filter.return_value.first.return_value = mock_material
                    
                    # Test update without unit change
                    service = MaterialService()
                    result = service.update_material(
                        material_id=123,
                        material_name="Updated Name",
                        changed_by="user_456"
                    )
                    
                    # Verify audit log was NOT called
                    mock_log.assert_not_called()


def run_audit_integration_tests():
    """Run all audit integration tests"""
    print("Running Audit Logging Integration Tests...")
    
    # Test UnitChangeAuditService
    test_audit = TestUnitChangeAuditService()
    test_audit.test_log_unit_change_success()
    test_audit.test_log_unit_change_database_error()
    test_audit.test_log_migration_mapping()
    test_audit.test_log_conversion_audit()
    test_audit.test_get_audit_logs_with_filters()
    print("✓ UnitChangeAuditService tests passed")
    
    # Test MigrationAuditService
    test_migration = TestMigrationAuditService()
    test_migration.test_log_migration_batch()
    test_migration.test_log_unmapped_units()
    test_migration.test_get_migration_report()
    print("✓ MigrationAuditService tests passed")
    
    # Test ConversionAuditService
    test_conversion = TestConversionAuditService()
    test_conversion.test_log_conversion()
    test_conversion.test_log_batch_conversions()
    test_conversion.test_get_conversion_analytics()
    print("✓ ConversionAuditService tests passed")
    
    # Test MaterialService integration
    test_material = TestMaterialServiceAuditIntegration()
    test_material.test_update_material_logs_unit_change()
    test_material.test_update_material_no_unit_change_no_log()
    print("✓ MaterialService audit integration tests passed")
    
    print("\n🎉 All audit logging integration tests passed!")
    print("\nAudit logging features implemented:")
    print("- ✅ Unit change logging in material services")
    print("- ✅ Migration unit mapping logging")
    print("- ✅ Optional unit conversion logging")
    print("- ✅ Audit log retrieval with filtering")
    print("- ✅ Migration and conversion analytics")
    print("- ✅ Error handling and database fallback")


if __name__ == "__main__":
    run_audit_integration_tests()