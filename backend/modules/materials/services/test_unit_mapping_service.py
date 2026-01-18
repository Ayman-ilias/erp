"""
Unit tests for Unit Mapping Service

Tests the unit text mapping functionality including:
- Text normalization
- Variation handling
- Symbol and name matching
- Batch operations
- Statistics generation
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
from modules.materials.services.unit_mapping_service import UnitMappingService
from modules.units.models.unit import Unit, UnitAlias


class TestUnitMappingService:
    """Test suite for UnitMappingService"""
    
    @pytest.fixture
    def service(self):
        """Create a fresh service instance for each test"""
        return UnitMappingService()
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database session"""
        return Mock()
    
    @pytest.fixture
    def sample_units(self):
        """Create sample unit objects for testing"""
        units = [
            Mock(
                id=1,
                name="Kilogram",
                symbol="kg",
                alternate_names="kilo,kilos",
                is_active=True
            ),
            Mock(
                id=2,
                name="Gram",
                symbol="g",
                alternate_names="gm,gms",
                is_active=True
            ),
            Mock(
                id=3,
                name="Meter",
                symbol="m",
                alternate_names="metre",
                is_active=True
            ),
            Mock(
                id=4,
                name="Piece",
                symbol="pc",
                alternate_names="pcs,pieces",
                is_active=True
            ),
            Mock(
                id=5,
                name="GSM",
                symbol="g/m²",
                alternate_names="g/m2,grams per square meter",
                is_active=True
            ),
        ]
        return units
    
    @pytest.fixture
    def sample_aliases(self):
        """Create sample alias objects for testing"""
        aliases = [
            Mock(alias_name="kilogram", alias_symbol="kg", unit_id=1),
            Mock(alias_name="kilo", alias_symbol=None, unit_id=1),
            Mock(alias_name="gram", alias_symbol="g", unit_id=2),
            Mock(alias_name="meter", alias_symbol="m", unit_id=3),
            Mock(alias_name="piece", alias_symbol="pc", unit_id=4),
        ]
        return aliases
    
    # Test normalization
    
    def test_normalize_unit_text_lowercase(self, service):
        """Test that text is converted to lowercase"""
        assert service.normalize_unit_text("KG") == "kg"
        assert service.normalize_unit_text("Kilogram") == "kilogram"
        assert service.normalize_unit_text("GSM") == "gsm"
    
    def test_normalize_unit_text_trim(self, service):
        """Test that whitespace is trimmed"""
        assert service.normalize_unit_text("  kg  ") == "kg"
        assert service.normalize_unit_text("  piece ") == "piece"
        assert service.normalize_unit_text("meter  ") == "meter"
    
    def test_normalize_unit_text_multiple_spaces(self, service):
        """Test that multiple spaces are collapsed"""
        assert service.normalize_unit_text("square   meter") == "square meter"
        assert service.normalize_unit_text("grams  per  square  meter") == "grams per square meter"
    
    def test_normalize_unit_text_empty(self, service):
        """Test that empty strings are handled"""
        assert service.normalize_unit_text("") == ""
        assert service.normalize_unit_text("   ") == ""
        assert service.normalize_unit_text(None) == ""
    
    def test_normalize_unit_text_special_chars(self, service):
        """Test that periods are removed"""
        assert service.normalize_unit_text("kg.") == "kg"
        assert service.normalize_unit_text("m.") == "m"
    
    # Test standardization
    
    def test_get_standardized_term_weight_units(self, service):
        """Test standardization of weight unit variations"""
        assert service.get_standardized_term("kg") == "kilogram"
        assert service.get_standardized_term("kgs") == "kilogram"
        assert service.get_standardized_term("kilo") == "kilogram"
        assert service.get_standardized_term("g") == "gram"
        assert service.get_standardized_term("gm") == "gram"
    
    def test_get_standardized_term_length_units(self, service):
        """Test standardization of length unit variations"""
        assert service.get_standardized_term("m") == "meter"
        assert service.get_standardized_term("meter") == "meter"
        assert service.get_standardized_term("cm") == "centimeter"
        assert service.get_standardized_term("mm") == "millimeter"
    
    def test_get_standardized_term_textile_units(self, service):
        """Test standardization of textile unit variations"""
        assert service.get_standardized_term("gsm") == "gsm"
        assert service.get_standardized_term("g/m2") == "gsm"
        assert service.get_standardized_term("g/m²") == "gsm"
        assert service.get_standardized_term("denier") == "denier"
    
    def test_get_standardized_term_count_units(self, service):
        """Test standardization of count unit variations"""
        assert service.get_standardized_term("pc") == "piece"
        assert service.get_standardized_term("pcs") == "piece"
        assert service.get_standardized_term("piece") == "piece"
        assert service.get_standardized_term("dozen") == "dozen"
        assert service.get_standardized_term("lakh") == "lakh"
    
    def test_get_standardized_term_unknown(self, service):
        """Test that unknown terms return unchanged"""
        assert service.get_standardized_term("unknown") == "unknown"
        assert service.get_standardized_term("xyz") == "xyz"
    
    # Test cache loading
    
    def test_load_unit_cache(self, service, mock_db, sample_units):
        """Test that unit cache is loaded correctly"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        service._load_unit_cache(mock_db)
        
        assert service._unit_cache is not None
        assert "kg" in service._unit_cache
        assert "kilogram" in service._unit_cache
        assert "g" in service._unit_cache
        assert "gram" in service._unit_cache
        assert "m" in service._unit_cache
        assert "meter" in service._unit_cache
    
    def test_load_unit_cache_alternate_names(self, service, mock_db, sample_units):
        """Test that alternate names are added to cache"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        service._load_unit_cache(mock_db)
        
        # Check alternate names are in cache
        assert "kilo" in service._unit_cache
        assert "kilos" in service._unit_cache
        assert "gm" in service._unit_cache
        assert "gms" in service._unit_cache
    
    def test_load_unit_cache_only_once(self, service, mock_db, sample_units):
        """Test that cache is only loaded once"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        service._load_unit_cache(mock_db)
        service._load_unit_cache(mock_db)
        
        # Query should only be called once
        assert mock_db.query.call_count == 1
    
    def test_load_alias_cache(self, service, mock_db, sample_aliases):
        """Test that alias cache is loaded correctly"""
        mock_db.query.return_value.all.return_value = sample_aliases
        
        service._load_alias_cache(mock_db)
        
        assert service._alias_cache is not None
        assert "kilogram" in service._alias_cache
        assert "kilo" in service._alias_cache
        assert "gram" in service._alias_cache
    
    # Test search functionality
    
    def test_search_unit_by_text_direct_symbol(self, service, mock_db, sample_units):
        """Test searching by direct symbol match"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        unit = service.search_unit_by_text("kg", mock_db)
        
        assert unit is not None
        assert unit.symbol == "kg"
        assert unit.name == "Kilogram"
    
    def test_search_unit_by_text_direct_name(self, service, mock_db, sample_units):
        """Test searching by direct name match"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        unit = service.search_unit_by_text("kilogram", mock_db)
        
        assert unit is not None
        assert unit.name == "Kilogram"
    
    def test_search_unit_by_text_case_insensitive(self, service, mock_db, sample_units):
        """Test that search is case-insensitive"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        unit1 = service.search_unit_by_text("KG", mock_db)
        unit2 = service.search_unit_by_text("kg", mock_db)
        unit3 = service.search_unit_by_text("Kg", mock_db)
        
        assert unit1 is not None
        assert unit2 is not None
        assert unit3 is not None
        assert unit1.id == unit2.id == unit3.id
    
    def test_search_unit_by_text_with_whitespace(self, service, mock_db, sample_units):
        """Test that whitespace is handled"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        unit = service.search_unit_by_text("  kg  ", mock_db)
        
        assert unit is not None
        assert unit.symbol == "kg"
    
    def test_search_unit_by_text_variation(self, service, mock_db, sample_units):
        """Test searching by variation (e.g., 'pcs' -> 'piece')"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        unit = service.search_unit_by_text("pcs", mock_db)
        
        assert unit is not None
        assert unit.name == "Piece"
    
    def test_search_unit_by_text_not_found(self, service, mock_db, sample_units):
        """Test that None is returned for unknown units"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        unit = service.search_unit_by_text("unknown", mock_db)
        
        assert unit is None
    
    def test_search_unit_by_text_empty(self, service, mock_db):
        """Test that empty text returns None"""
        unit = service.search_unit_by_text("", mock_db)
        assert unit is None
        
        unit = service.search_unit_by_text(None, mock_db)
        assert unit is None
    
    # Test mapping functions
    
    def test_map_text_to_unit_id(self, service, mock_db, sample_units):
        """Test mapping text to unit_id"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        unit_id = service.map_text_to_unit_id("kg", mock_db)
        
        assert unit_id == 1
    
    def test_map_text_to_unit_id_not_found(self, service, mock_db, sample_units):
        """Test that None is returned for unmapped text"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        unit_id = service.map_text_to_unit_id("unknown", mock_db)
        
        assert unit_id is None
    
    def test_batch_map_texts_to_unit_ids(self, service, mock_db, sample_units):
        """Test batch mapping of multiple texts"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        texts = ["kg", "piece", "meter", "unknown"]
        result = service.batch_map_texts_to_unit_ids(texts, mock_db)
        
        assert len(result) == 4
        assert result["kg"] == 1
        assert result["piece"] == 4
        assert result["meter"] == 3
        assert result["unknown"] is None
    
    def test_batch_map_texts_to_unit_ids_empty(self, service, mock_db):
        """Test batch mapping with empty list"""
        result = service.batch_map_texts_to_unit_ids([], mock_db)
        
        assert result == {}
    
    # Test statistics
    
    def test_get_mapping_statistics(self, service, mock_db, sample_units):
        """Test statistics generation"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        texts = ["kg", "piece", "meter", "unknown1", "unknown2"]
        stats = service.get_mapping_statistics(texts, mock_db)
        
        assert stats['total'] == 5
        assert stats['mapped'] == 3
        assert stats['unmapped'] == 2
        assert stats['success_rate'] == 60.0
        assert "unknown1" in stats['unmapped_texts']
        assert "unknown2" in stats['unmapped_texts']
    
    def test_get_mapping_statistics_empty(self, service, mock_db):
        """Test statistics with empty list"""
        stats = service.get_mapping_statistics([], mock_db)
        
        assert stats['total'] == 0
        assert stats['mapped'] == 0
        assert stats['unmapped'] == 0
        assert stats['success_rate'] == 0.0
        assert stats['unmapped_texts'] == []
    
    def test_get_mapping_statistics_all_mapped(self, service, mock_db, sample_units):
        """Test statistics when all texts are mapped"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        texts = ["kg", "piece", "meter"]
        stats = service.get_mapping_statistics(texts, mock_db)
        
        assert stats['total'] == 3
        assert stats['mapped'] == 3
        assert stats['unmapped'] == 0
        assert stats['success_rate'] == 100.0
        assert stats['unmapped_texts'] == []
    
    # Test cache management
    
    def test_clear_cache(self, service, mock_db, sample_units):
        """Test that cache can be cleared"""
        mock_db.query.return_value.filter.return_value.all.return_value = sample_units
        
        # Load cache
        service._load_unit_cache(mock_db)
        assert service._unit_cache is not None
        
        # Clear cache
        service.clear_cache()
        assert service._unit_cache is None
    
    # Test singleton
    
    def test_get_unit_mapping_service(self):
        """Test that singleton returns same instance"""
        from modules.materials.services.unit_mapping_service import get_unit_mapping_service
        
        service1 = get_unit_mapping_service()
        service2 = get_unit_mapping_service()
        
        assert service1 is service2


# Integration test markers
@pytest.mark.integration
class TestUnitMappingServiceIntegration:
    """Integration tests that require actual database connection"""
    
    def test_search_real_units(self):
        """Test searching for real units in database"""
        # This test requires DATABASE_URL_UNITS to be set
        # and the database to be populated with units
        pytest.skip("Integration test - requires database")
    
    def test_batch_mapping_performance(self):
        """Test performance of batch mapping with large dataset"""
        # This test requires DATABASE_URL_UNITS to be set
        pytest.skip("Integration test - requires database")
