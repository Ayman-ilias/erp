"""
Unit Tests for MaterialService

Tests cross-database resolution, caching, batch queries, and validation.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta

from modules.materials.services.material_service import MaterialService, MaterialServiceError
from modules.materials.services.validation_service import ValidationError, DatabaseConnectionError


class TestMaterialService:
    """Test suite for MaterialService"""
    
    @pytest.fixture
    def service(self):
        """Create MaterialService instance"""
        # Clear cache before each test
        MaterialService._unit_cache.clear()
        MaterialService._cache_timestamp = None
        return MaterialService()
    
    @pytest.fixture
    def mock_material(self):
        """Mock MaterialMaster object"""
        material = Mock()
        material.id = 1
        material.material_name = "Cotton Fabric"
        material.unit_id = 10
        material.material_category = "Fabric"
        material.description = "High quality cotton"
        material.created_at = datetime.now()
        material.updated_at = datetime.now()
        return material
    
    @pytest.fixture
    def mock_unit(self):
        """Mock Unit object"""
        unit = Mock()
        unit.id = 10
        unit.name = "Kilogram"
        unit.symbol = "kg"
        unit.category_id = 2
        unit.unit_type = Mock(value="SI")
        unit.is_base = True
        unit.decimal_places = 2
        
        # Mock category relationship
        category = Mock()
        category.name = "Weight"
        unit.category = category
        
        return unit
    
    # Test: get_material_with_unit
    
    def test_get_material_with_unit_success(self, service, mock_material, mock_unit):
        """Test successful material retrieval with unit details"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples, \
             patch('modules.materials.services.material_service.SessionLocalUnits') as mock_units:
            
            # Setup mocks
            mock_samples_session = Mock()
            mock_units_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_units.return_value = mock_units_session
            
            mock_samples_session.query.return_value.filter.return_value.first.return_value = mock_material
            mock_units_session.query.return_value.join.return_value.filter.return_value.first.return_value = mock_unit
            
            # Execute
            result = service.get_material_with_unit(1)
            
            # Verify
            assert result is not None
            assert result["id"] == 1
            assert result["material_name"] == "Cotton Fabric"
            assert result["unit_id"] == 10
            assert result["unit"] is not None
            assert result["unit"]["name"] == "Kilogram"
            assert result["unit"]["symbol"] == "kg"
            assert result["unit"]["category_name"] == "Weight"
    
    def test_get_material_with_unit_not_found(self, service):
        """Test material not found returns None"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples:
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_samples_session.query.return_value.filter.return_value.first.return_value = None
            
            result = service.get_material_with_unit(999)
            
            assert result is None
    
    def test_get_material_with_unit_uses_cache(self, service, mock_material, mock_unit):
        """Test that unit details are cached and reused"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples, \
             patch('modules.materials.services.material_service.SessionLocalUnits') as mock_units:
            
            mock_samples_session = Mock()
            mock_units_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_units.return_value = mock_units_session
            
            mock_samples_session.query.return_value.filter.return_value.first.return_value = mock_material
            mock_units_session.query.return_value.join.return_value.filter.return_value.first.return_value = mock_unit
            
            # First call - should query db-units
            result1 = service.get_material_with_unit(1)
            assert result1["unit"]["name"] == "Kilogram"
            
            # Second call - should use cache (no db-units query)
            mock_units.reset_mock()
            result2 = service.get_material_with_unit(1)
            assert result2["unit"]["name"] == "Kilogram"
            
            # Verify db-units was not called second time
            mock_units.assert_not_called()
    
    def test_get_material_with_unit_cache_expiration(self, service, mock_material, mock_unit):
        """Test that cache expires after TTL"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples, \
             patch('modules.materials.services.material_service.SessionLocalUnits') as mock_units:
            
            mock_samples_session = Mock()
            mock_units_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_units.return_value = mock_units_session
            
            mock_samples_session.query.return_value.filter.return_value.first.return_value = mock_material
            mock_units_session.query.return_value.join.return_value.filter.return_value.first.return_value = mock_unit
            
            # First call
            service.get_material_with_unit(1)
            
            # Simulate cache expiration
            MaterialService._cache_timestamp = datetime.now() - timedelta(minutes=10)
            
            # Second call - should query db-units again
            mock_units.reset_mock()
            service.get_material_with_unit(1)
            
            # Verify db-units was called again
            mock_units.assert_called()
    
    # Test: get_materials_with_units (batch resolution)
    
    def test_get_materials_with_units_batch_resolution(self, service):
        """Test batch unit resolution avoids N+1 queries"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples, \
             patch('modules.materials.services.material_service.SessionLocalUnits') as mock_units:
            
            # Create mock materials with different unit_ids
            materials = []
            for i in range(5):
                material = Mock()
                material.id = i + 1
                material.material_name = f"Material {i+1}"
                material.unit_id = (i % 2) + 10  # Alternates between unit_id 10 and 11
                material.material_category = "Fabric"
                material.description = f"Description {i+1}"
                material.created_at = datetime.now()
                material.updated_at = datetime.now()
                materials.append(material)
            
            # Create mock units
            units = []
            for i in range(2):
                unit = Mock()
                unit.id = i + 10
                unit.name = f"Unit {i+10}"
                unit.symbol = f"u{i+10}"
                unit.category_id = 2
                unit.unit_type = Mock(value="SI")
                unit.is_base = True
                unit.decimal_places = 2
                category = Mock()
                category.name = "Weight"
                unit.category = category
                units.append(unit)
            
            # Setup mocks
            mock_samples_session = Mock()
            mock_units_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_units.return_value = mock_units_session
            
            mock_samples_session.query.return_value.offset.return_value.limit.return_value.all.return_value = materials
            mock_units_session.query.return_value.join.return_value.filter.return_value.all.return_value = units
            
            # Execute
            result = service.get_materials_with_units(skip=0, limit=100)
            
            # Verify
            assert len(result) == 5
            assert all(m["unit"] is not None for m in result)
            
            # Verify only ONE query to db-units (batch query)
            assert mock_units.call_count == 1
    
    def test_get_materials_with_units_empty_result(self, service):
        """Test empty result when no materials found"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples:
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_samples_session.query.return_value.offset.return_value.limit.return_value.all.return_value = []
            
            result = service.get_materials_with_units()
            
            assert result == []
    
    def test_get_materials_with_units_category_filter(self, service):
        """Test category filtering works correctly"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples:
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            
            mock_query = Mock()
            mock_samples_session.query.return_value = mock_query
            mock_query.filter.return_value = mock_query
            mock_query.offset.return_value.limit.return_value.all.return_value = []
            
            # Execute with category filter
            service.get_materials_with_units(category_filter="Fabric")
            
            # Verify filter was called
            mock_query.filter.assert_called()
    
    # Test: create_material
    
    def test_create_material_success(self, service, mock_material):
        """Test successful material creation with unit validation"""
        with patch('modules.materials.services.material_service.ValidationService.validate_unit_id') as mock_validate, \
             patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples, \
             patch.object(service, 'get_material_with_unit') as mock_get:
            
            mock_validate.return_value = True
            
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            
            # Mock the created material
            mock_samples_session.add = Mock()
            mock_samples_session.commit = Mock()
            mock_samples_session.refresh = Mock(side_effect=lambda m: setattr(m, 'id', 1))
            
            mock_get.return_value = {
                "id": 1,
                "material_name": "Cotton Fabric",
                "unit_id": 10,
                "unit": {"name": "Kilogram", "symbol": "kg"}
            }
            
            # Execute
            result = service.create_material(
                material_name="Cotton Fabric",
                unit_id=10,
                material_category="Fabric"
            )
            
            # Verify
            assert result is not None
            assert result["material_name"] == "Cotton Fabric"
            mock_validate.assert_called_once_with(10)
            mock_samples_session.commit.assert_called_once()
    
    def test_create_material_invalid_unit(self, service):
        """Test material creation fails with invalid unit_id"""
        with patch('modules.materials.services.material_service.ValidationService.validate_unit_id') as mock_validate:
            mock_validate.return_value = False
            
            with pytest.raises(ValidationError) as exc_info:
                service.create_material(
                    material_name="Cotton Fabric",
                    unit_id=99999
                )
            
            assert "Invalid unit_id" in str(exc_info.value)
    
    def test_create_material_validation_error(self, service):
        """Test material creation handles validation errors"""
        with patch('modules.materials.services.material_service.ValidationService.validate_unit_id') as mock_validate:
            mock_validate.side_effect = DatabaseConnectionError("Connection failed")
            
            with pytest.raises(DatabaseConnectionError):
                service.create_material(
                    material_name="Cotton Fabric",
                    unit_id=10
                )
    
    # Test: update_material
    
    def test_update_material_success(self, service, mock_material):
        """Test successful material update with unit validation"""
        with patch('modules.materials.services.material_service.ValidationService.validate_unit_id') as mock_validate, \
             patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples, \
             patch.object(service, 'get_material_with_unit') as mock_get:
            
            mock_validate.return_value = True
            
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_samples_session.query.return_value.filter.return_value.first.return_value = mock_material
            
            mock_get.return_value = {
                "id": 1,
                "material_name": "Updated Fabric",
                "unit_id": 11,
                "unit": {"name": "Gram", "symbol": "g"}
            }
            
            # Execute
            result = service.update_material(
                material_id=1,
                material_name="Updated Fabric",
                unit_id=11
            )
            
            # Verify
            assert result is not None
            assert result["material_name"] == "Updated Fabric"
            mock_validate.assert_called_once_with(11)
            mock_samples_session.commit.assert_called_once()
    
    def test_update_material_not_found(self, service):
        """Test update fails when material not found"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples:
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_samples_session.query.return_value.filter.return_value.first.return_value = None
            
            with pytest.raises(MaterialServiceError) as exc_info:
                service.update_material(material_id=999, material_name="New Name")
            
            assert "not found" in str(exc_info.value)
    
    def test_update_material_invalid_unit(self, service, mock_material):
        """Test update fails with invalid unit_id"""
        with patch('modules.materials.services.material_service.ValidationService.validate_unit_id') as mock_validate, \
             patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples:
            
            mock_validate.return_value = False
            
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_samples_session.query.return_value.filter.return_value.first.return_value = mock_material
            
            with pytest.raises(ValidationError) as exc_info:
                service.update_material(material_id=1, unit_id=99999)
            
            assert "Invalid unit_id" in str(exc_info.value)
    
    def test_update_material_partial_update(self, service, mock_material):
        """Test partial update only changes provided fields"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples, \
             patch.object(service, 'get_material_with_unit') as mock_get:
            
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_samples_session.query.return_value.filter.return_value.first.return_value = mock_material
            
            mock_get.return_value = {"id": 1, "material_name": "Cotton Fabric"}
            
            # Execute - only update description
            service.update_material(material_id=1, description="New description")
            
            # Verify only description was changed
            assert mock_material.description == "New description"
            # Other fields should not be touched
            assert mock_material.material_name == "Cotton Fabric"
    
    # Test: delete_material
    
    def test_delete_material_success(self, service, mock_material):
        """Test successful material deletion"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples:
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_samples_session.query.return_value.filter.return_value.first.return_value = mock_material
            
            result = service.delete_material(1)
            
            assert result is True
            mock_samples_session.delete.assert_called_once_with(mock_material)
            mock_samples_session.commit.assert_called_once()
    
    def test_delete_material_not_found(self, service):
        """Test delete returns False when material not found"""
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples:
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_samples_session.query.return_value.filter.return_value.first.return_value = None
            
            result = service.delete_material(999)
            
            assert result is False
    
    # Test: Caching behavior
    
    def test_cache_clear_on_expiration(self, service):
        """Test cache is cleared when TTL expires"""
        # Populate cache
        MaterialService._unit_cache[1] = {"name": "Test"}
        MaterialService._cache_timestamp = datetime.now() - timedelta(minutes=10)
        
        # Trigger cache check
        MaterialService._clear_cache_if_expired()
        
        # Verify cache was cleared
        assert len(MaterialService._unit_cache) == 0
    
    def test_cache_not_cleared_within_ttl(self, service):
        """Test cache is not cleared within TTL"""
        # Populate cache
        MaterialService._unit_cache[1] = {"name": "Test"}
        MaterialService._cache_timestamp = datetime.now()
        
        # Trigger cache check
        MaterialService._clear_cache_if_expired()
        
        # Verify cache was not cleared
        assert len(MaterialService._unit_cache) == 1
    
    # Test: Error handling
    
    def test_database_connection_error_handling(self, service):
        """Test proper handling of database connection errors"""
        from sqlalchemy.exc import OperationalError
        
        with patch('modules.materials.services.material_service.SessionLocalSamples') as mock_samples:
            mock_samples_session = Mock()
            mock_samples.return_value = mock_samples_session
            mock_samples_session.query.side_effect = OperationalError("Connection failed", None, None)
            
            with pytest.raises(DatabaseConnectionError):
                service.get_material_with_unit(1)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
