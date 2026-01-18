"""
Unit Tests for Validation Service

Tests the validation service for unit_id validation across databases.
Validates Requirements: 9.5, 13.3
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from sqlalchemy.exc import OperationalError, DatabaseError
from validation_service import (
    ValidationService,
    ValidationError,
    DatabaseConnectionError
)
from modules.units.models.unit import Unit, UnitCategory, UnitTypeEnum


class TestValidateUnitId:
    """Test cases for validate_unit_id method"""
    
    def test_valid_active_unit(self):
        """Test validation succeeds for valid active unit"""
        # Mock database session and query
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Mock unit query result
            mock_unit = Mock(spec=Unit)
            mock_unit.id = 1
            mock_unit.name = "Kilogram"
            mock_unit.is_active = True
            
            mock_query = Mock()
            mock_query.filter.return_value.first.return_value = mock_unit
            mock_db.query.return_value = mock_query
            
            # Execute validation
            result = ValidationService.validate_unit_id(1)
            
            # Assertions
            assert result is True
            mock_db.close.assert_called_once()
    
    def test_invalid_unit_id_not_found(self):
        """Test validation fails for non-existent unit_id"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Mock query returns None (unit not found)
            mock_query = Mock()
            mock_query.filter.return_value.first.return_value = None
            mock_db.query.return_value = mock_query
            
            result = ValidationService.validate_unit_id(99999)
            
            assert result is False
            mock_db.close.assert_called_once()
    
    def test_inactive_unit(self):
        """Test validation fails for inactive unit"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Mock query returns None (filtered out by is_active=True)
            mock_query = Mock()
            mock_query.filter.return_value.first.return_value = None
            mock_db.query.return_value = mock_query
            
            result = ValidationService.validate_unit_id(1)
            
            assert result is False
    
    def test_invalid_unit_id_zero(self):
        """Test validation fails for unit_id = 0"""
        result = ValidationService.validate_unit_id(0)
        assert result is False
    
    def test_invalid_unit_id_negative(self):
        """Test validation fails for negative unit_id"""
        result = ValidationService.validate_unit_id(-1)
        assert result is False
    
    def test_invalid_unit_id_none(self):
        """Test validation fails for None unit_id"""
        result = ValidationService.validate_unit_id(None)
        assert result is False
    
    def test_database_connection_error(self):
        """Test proper error handling for database connection failure"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Simulate connection error
            mock_db.query.side_effect = OperationalError("Connection failed", None, None)
            
            with pytest.raises(DatabaseConnectionError) as exc_info:
                ValidationService.validate_unit_id(1)
            
            assert "Failed to connect to Unit Conversion System database" in str(exc_info.value)
            mock_db.close.assert_called_once()
    
    def test_database_error(self):
        """Test proper error handling for database errors"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Simulate database error
            mock_db.query.side_effect = DatabaseError("Query failed", None, None)
            
            with pytest.raises(ValidationError) as exc_info:
                ValidationService.validate_unit_id(1)
            
            assert "Database error during unit validation" in str(exc_info.value)
            mock_db.close.assert_called_once()
    
    def test_unexpected_error(self):
        """Test proper error handling for unexpected errors"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Simulate unexpected error
            mock_db.query.side_effect = Exception("Unexpected error")
            
            with pytest.raises(ValidationError) as exc_info:
                ValidationService.validate_unit_id(1)
            
            assert "Unexpected error during unit validation" in str(exc_info.value)
            mock_db.close.assert_called_once()


class TestValidateUnitCategory:
    """Test cases for validate_unit_category method"""
    
    def test_valid_unit_in_expected_category(self):
        """Test validation succeeds when unit belongs to expected category"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Mock unit with category
            mock_unit = Mock(spec=Unit)
            mock_unit.id = 1
            mock_unit.name = "Kilogram"
            mock_unit.is_active = True
            
            mock_query = Mock()
            mock_query.join.return_value.filter.return_value.first.return_value = mock_unit
            mock_db.query.return_value = mock_query
            
            result = ValidationService.validate_unit_category(1, "Weight")
            
            assert result is True
            mock_db.close.assert_called_once()
    
    def test_unit_in_wrong_category(self):
        """Test validation fails when unit belongs to different category"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # First query returns None (wrong category)
            mock_query = Mock()
            mock_query.join.return_value.filter.return_value.first.return_value = None
            
            # Second query for error logging
            mock_actual_unit = Mock(spec=Unit)
            mock_actual_unit.id = 1
            mock_actual_unit.category_id = 2
            
            mock_category = Mock(spec=UnitCategory)
            mock_category.name = "Length"
            
            # Setup query chain for error logging
            def query_side_effect(model):
                if model == Unit:
                    mock_unit_query = Mock()
                    if hasattr(mock_unit_query, '_join_called'):
                        # First call with join
                        mock_unit_query.join.return_value.filter.return_value.first.return_value = None
                    else:
                        # Second call without join (for error logging)
                        mock_unit_query.filter.return_value.first.return_value = mock_actual_unit
                    mock_unit_query._join_called = True
                    return mock_unit_query
                elif model == UnitCategory:
                    mock_cat_query = Mock()
                    mock_cat_query.filter.return_value.first.return_value = mock_category
                    return mock_cat_query
            
            mock_db.query.side_effect = query_side_effect
            
            result = ValidationService.validate_unit_category(1, "Weight")
            
            assert result is False
    
    def test_invalid_unit_id(self):
        """Test validation fails for invalid unit_id"""
        result = ValidationService.validate_unit_category(0, "Weight")
        assert result is False
        
        result = ValidationService.validate_unit_category(-1, "Weight")
        assert result is False
        
        result = ValidationService.validate_unit_category(None, "Weight")
        assert result is False
    
    def test_invalid_category_name(self):
        """Test validation fails for invalid category name"""
        result = ValidationService.validate_unit_category(1, "")
        assert result is False
        
        result = ValidationService.validate_unit_category(1, "   ")
        assert result is False
        
        result = ValidationService.validate_unit_category(1, None)
        assert result is False
    
    def test_database_connection_error(self):
        """Test proper error handling for database connection failure"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            mock_db.query.side_effect = OperationalError("Connection failed", None, None)
            
            with pytest.raises(DatabaseConnectionError):
                ValidationService.validate_unit_category(1, "Weight")
            
            mock_db.close.assert_called_once()


class TestValidateUnitIdWithDetails:
    """Test cases for validate_unit_id_with_details method"""
    
    def test_valid_unit_returns_details(self):
        """Test validation returns unit details for valid unit"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Mock unit with category
            mock_category = Mock(spec=UnitCategory)
            mock_category.name = "Weight"
            
            mock_unit = Mock(spec=Unit)
            mock_unit.id = 1
            mock_unit.name = "Kilogram"
            mock_unit.symbol = "kg"
            mock_unit.category_id = 1
            mock_unit.category = mock_category
            mock_unit.unit_type = UnitTypeEnum.SI
            mock_unit.is_base = True
            mock_unit.decimal_places = 2
            mock_unit.to_base_factor = 1.0
            mock_unit.is_active = True
            
            mock_query = Mock()
            mock_query.join.return_value.filter.return_value.first.return_value = mock_unit
            mock_db.query.return_value = mock_query
            
            is_valid, details = ValidationService.validate_unit_id_with_details(1)
            
            assert is_valid is True
            assert details is not None
            assert details["id"] == 1
            assert details["name"] == "Kilogram"
            assert details["symbol"] == "kg"
            assert details["category_name"] == "Weight"
            assert details["unit_type"] == "SI"
            assert details["is_base"] is True
            assert details["decimal_places"] == 2
            mock_db.close.assert_called_once()
    
    def test_invalid_unit_returns_none(self):
        """Test validation returns None for invalid unit"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            mock_query = Mock()
            mock_query.join.return_value.filter.return_value.first.return_value = None
            mock_db.query.return_value = mock_query
            
            is_valid, details = ValidationService.validate_unit_id_with_details(99999)
            
            assert is_valid is False
            assert details is None


class TestValidateMultipleUnitIds:
    """Test cases for validate_multiple_unit_ids method"""
    
    def test_batch_validation_all_valid(self):
        """Test batch validation with all valid units"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Mock query results
            mock_units = [Mock(id=1), Mock(id=2), Mock(id=3)]
            mock_query = Mock()
            mock_query.filter.return_value.all.return_value = mock_units
            mock_db.query.return_value = mock_query
            
            results = ValidationService.validate_multiple_unit_ids([1, 2, 3])
            
            assert results == {1: True, 2: True, 3: True}
            mock_db.close.assert_called_once()
    
    def test_batch_validation_mixed_results(self):
        """Test batch validation with mix of valid and invalid units"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Only units 1 and 2 are active
            mock_units = [Mock(id=1), Mock(id=2)]
            mock_query = Mock()
            mock_query.filter.return_value.all.return_value = mock_units
            mock_db.query.return_value = mock_query
            
            results = ValidationService.validate_multiple_unit_ids([1, 2, 99999])
            
            assert results == {1: True, 2: True, 99999: False}
    
    def test_batch_validation_empty_list(self):
        """Test batch validation with empty list"""
        results = ValidationService.validate_multiple_unit_ids([])
        assert results == {}
    
    def test_batch_validation_invalid_ids(self):
        """Test batch validation filters out invalid IDs"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            mock_query = Mock()
            mock_query.filter.return_value.all.return_value = []
            mock_db.query.return_value = mock_query
            
            results = ValidationService.validate_multiple_unit_ids([0, -1, None])
            
            assert all(not v for v in results.values())
    
    def test_batch_validation_database_error(self):
        """Test batch validation handles database errors"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            mock_db.query.side_effect = OperationalError("Connection failed", None, None)
            
            with pytest.raises(DatabaseConnectionError):
                ValidationService.validate_multiple_unit_ids([1, 2, 3])
            
            mock_db.close.assert_called_once()


class TestEdgeCases:
    """Test edge cases and boundary conditions"""
    
    def test_very_large_unit_id(self):
        """Test validation with very large unit_id"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            mock_query = Mock()
            mock_query.filter.return_value.first.return_value = None
            mock_db.query.return_value = mock_query
            
            result = ValidationService.validate_unit_id(999999999)
            assert result is False
    
    def test_category_name_case_sensitivity(self):
        """Test category validation is case-sensitive"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            # Query returns None for case mismatch
            mock_query = Mock()
            mock_query.join.return_value.filter.return_value.first.return_value = None
            mock_db.query.return_value = mock_query
            
            # Should fail because "weight" != "Weight"
            result = ValidationService.validate_unit_category(1, "weight")
            assert result is False
    
    def test_database_session_cleanup_on_error(self):
        """Test database session is properly closed even on error"""
        with patch('validation_service.SessionLocalUnits') as mock_session:
            mock_db = Mock()
            mock_session.return_value = mock_db
            
            mock_db.query.side_effect = Exception("Test error")
            
            try:
                ValidationService.validate_unit_id(1)
            except ValidationError:
                pass
            
            # Verify close was called despite error
            mock_db.close.assert_called_once()
