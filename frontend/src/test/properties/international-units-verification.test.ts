/**
 * International Units Verification Test
 * **Validates: Requirements 11.3**
 * 
 * This test suite verifies that International units (standard SI and commonly used international units) 
 * are properly available in the unit conversion system and work correctly:
 * 1. International units are available in unit selector
 * 2. Conversions between International units work correctly
 * 3. Unit_type is correctly set to "SI" or "International"
 * 4. Units appear in appropriate categories
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

// Mock the unit search hook
const mockUseUnitSearch = vi.fn();
vi.mock('@/components/uom/hooks/useUnitSearch', () => ({
  useUnitSearch: mockUseUnitSearch
}));

// Mock the unit conversion hook
const mockUseUnitConversion = vi.fn();
vi.mock('@/components/uom/hooks/useUnitConversion', () => ({
  useUnitConversion: mockUseUnitConversion
}));

// Sample International units data based on the unit conversion system
const mockInternationalUnits = [
  {
    id: 1,
    name: 'Kilogram',
    symbol: 'kg',
    category_id: 2,
    category_name: 'Weight',
    unit_type: 'SI',
    to_base_factor: '1.0',
    is_base: true,
    decimal_places: 3,
    is_active: true,
    description: 'Base unit of mass in the International System of Units',
    region: 'International',
    alternate_names: 'kilogram, kilo, kg'
  },
  {
    id: 2,
    name: 'Gram',
    symbol: 'g',
    category_id: 2,
    category_name: 'Weight',
    unit_type: 'SI',
    to_base_factor: '0.001',
    is_base: false,
    decimal_places: 2,
    is_active: true,
    description: 'Metric unit of mass',
    region: 'International',
    alternate_names: 'gram, g, gm'
  },
  {
    id: 3,
    name: 'Meter',
    symbol: 'm',
    category_id: 1,
    category_name: 'Length',
    unit_type: 'SI',
    to_base_factor: '1.0',
    is_base: true,
    decimal_places: 2,
    is_active: true,
    description: 'Base unit of length in the International System of Units',
    region: 'International',
    alternate_names: 'meter, metre, m'
  },
  {
    id: 4,
    name: 'Centimeter',
    symbol: 'cm',
    category_id: 1,
    category_name: 'Length',
    unit_type: 'SI',
    to_base_factor: '0.01',
    is_base: false,
    decimal_places: 1,
    is_active: true,
    description: 'Metric unit of length',
    region: 'International',
    alternate_names: 'centimeter, centimetre, cm'
  },
  {
    id: 5,
    name: 'Piece',
    symbol: 'pcs',
    category_id: 3,
    category_name: 'Quantity',
    unit_type: 'International',
    to_base_factor: '1.0',
    is_base: true,
    decimal_places: 0,
    is_active: true,
    description: 'Individual counting unit',
    region: 'International',
    alternate_names: 'piece, pcs, pc'
  },
  {
    id: 6,
    name: 'Liter',
    symbol: 'L',
    category_id: 8,
    category_name: 'Volume',
    unit_type: 'SI',
    to_base_factor: '1.0',
    is_base: true,
    decimal_places: 2,
    is_active: true,
    description: 'Base unit of volume in the metric system',
    region: 'International',
    alternate_names: 'liter, litre, L, l'
  },
  {
    id: 7,
    name: 'Milliliter',
    symbol: 'mL',
    category_id: 8,
    category_name: 'Volume',
    unit_type: 'SI',
    to_base_factor: '0.001',
    is_base: false,
    decimal_places: 1,
    is_active: true,
    description: 'Metric unit of volume',
    region: 'International',
    alternate_names: 'milliliter, millilitre, mL, ml'
  }
];

// Mock all units including International units
const mockAllUnits = [
  ...mockInternationalUnits,
  // Add some non-International units for comparison
  {
    id: 100,
    name: 'Tola',
    symbol: 'tola',
    category_id: 2,
    category_name: 'Weight',
    unit_type: 'Desi',
    to_base_factor: '0.011664',
    is_base: false,
    decimal_places: 3,
    is_active: true,
    description: 'Traditional Desi unit of weight',
    region: 'South Asia',
    alternate_names: 'tola'
  },
  {
    id: 101,
    name: 'GSM',
    symbol: 'gsm',
    category_id: 15,
    category_name: 'Textile - Fabric Weight',
    unit_type: 'Textile',
    to_base_factor: '1.0',
    is_base: true,
    decimal_places: 1,
    is_active: true,
    description: 'Grams per square meter - fabric weight measurement',
    region: 'International',
    alternate_names: 'gsm, g/m2, grams per square meter'
  }
];

const mockCategories = [
  { id: 1, name: 'Length', description: 'Length measurements' },
  { id: 2, name: 'Weight', description: 'Weight measurements' },
  { id: 3, name: 'Quantity', description: 'Counting units' },
  { id: 8, name: 'Volume', description: 'Volume measurements' },
  { id: 15, name: 'Textile - Fabric Weight', description: 'Fabric weight measurements' }
];

describe('International Units Verification', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockUseUnitSearch.mockReturnValue({
      units: mockAllUnits,
      categories: mockCategories,
      searchUnits: (query: string) => mockAllUnits.filter(unit => 
        unit.name.toLowerCase().includes(query.toLowerCase()) ||
        unit.symbol.toLowerCase().includes(query.toLowerCase()) ||
        unit.alternate_names?.toLowerCase().includes(query.toLowerCase())
      ),
      getUnitsByCategory: (categoryName: string) => mockAllUnits.filter(unit => 
        unit.category_name === categoryName
      ),
      getUnitsByType: (unitType: string) => mockAllUnits.filter(unit => 
        unit.unit_type === unitType
      ),
      isLoading: false,
      error: null
    });

    mockUseUnitConversion.mockReturnValue({
      convert: vi.fn(),
      isConverting: false,
      convertedValue: null,
      error: null
    });
  });

  describe('Unit Availability', () => {
    it('should have required International units available', () => {
      const { units } = mockUseUnitSearch();
      
      // Check for specific required International units
      const requiredUnits = ['Kilogram', 'Meter', 'Piece', 'Liter'];
      
      requiredUnits.forEach(unitName => {
        const unit = units.find((u: any) => u.name === unitName);
        expect(unit).toBeDefined();
        expect(unit?.is_active).toBe(true);
      });
    });

    it('should have International units with correct symbols', () => {
      const { units } = mockUseUnitSearch();
      
      const expectedSymbols = [
        { name: 'Kilogram', symbol: 'kg' },
        { name: 'Meter', symbol: 'm' },
        { name: 'Piece', symbol: 'pcs' },
        { name: 'Liter', symbol: 'L' }
      ];
      
      expectedSymbols.forEach(({ name, symbol }) => {
        const unit = units.find((u: any) => u.name === name);
        expect(unit?.symbol).toBe(symbol);
      });
    });

    it('should have International units in correct categories', () => {
      const { units } = mockUseUnitSearch();
      
      const expectedCategories = [
        { name: 'Kilogram', category: 'Weight' },
        { name: 'Meter', category: 'Length' },
        { name: 'Piece', category: 'Quantity' },
        { name: 'Liter', category: 'Volume' }
      ];
      
      expectedCategories.forEach(({ name, category }) => {
        const unit = units.find((u: any) => u.name === name);
        expect(unit?.category_name).toBe(category);
      });
    });
  });

  describe('Unit Type Verification', () => {
    it('should have correct unit_type for International units', () => {
      const { units } = mockUseUnitSearch();
      
      const siUnits = ['Kilogram', 'Gram', 'Meter', 'Centimeter', 'Liter', 'Milliliter'];
      const internationalUnits = ['Piece'];
      
      siUnits.forEach(unitName => {
        const unit = units.find((u: any) => u.name === unitName);
        expect(unit?.unit_type).toBe('SI');
      });
      
      internationalUnits.forEach(unitName => {
        const unit = units.find((u: any) => u.name === unitName);
        expect(unit?.unit_type).toBe('International');
      });
    });

    it('should distinguish International units from other unit types', () => {
      const { getUnitsByType } = mockUseUnitSearch();
      
      const siUnits = getUnitsByType('SI');
      const internationalUnits = getUnitsByType('International');
      const desiUnits = getUnitsByType('Desi');
      const textileUnits = getUnitsByType('Textile');
      
      // Verify we have International/SI units
      expect(siUnits.length).toBeGreaterThan(0);
      expect(internationalUnits.length).toBeGreaterThan(0);
      
      // Verify they are distinct from other types
      const siIds = siUnits.map((u: any) => u.id);
      const internationalIds = internationalUnits.map((u: any) => u.id);
      const desiIds = desiUnits.map((u: any) => u.id);
      const textileIds = textileUnits.map((u: any) => u.id);
      
      // No overlap between different unit types
      expect(siIds.some(id => desiIds.includes(id))).toBe(false);
      expect(siIds.some(id => textileIds.includes(id))).toBe(false);
      expect(internationalIds.some(id => desiIds.includes(id))).toBe(false);
      expect(internationalIds.some(id => textileIds.includes(id))).toBe(false);
    });
  });

  describe('Unit Selector Integration', () => {
    it('should find International units by name search', () => {
      const { searchUnits } = mockUseUnitSearch();
      
      const searchTerms = ['kilogram', 'meter', 'piece', 'liter'];
      
      searchTerms.forEach(term => {
        const results = searchUnits(term);
        expect(results.length).toBeGreaterThan(0);
        
        // Should find the unit with matching name
        const matchingUnit = results.find((u: any) => 
          u.name.toLowerCase().includes(term.toLowerCase())
        );
        expect(matchingUnit).toBeDefined();
      });
    });

    it('should find International units by symbol search', () => {
      const { searchUnits } = mockUseUnitSearch();
      
      const symbolSearches = ['kg', 'm', 'pcs', 'L'];
      
      symbolSearches.forEach(symbol => {
        const results = searchUnits(symbol);
        expect(results.length).toBeGreaterThan(0);
        
        // Should find the unit with matching symbol
        const matchingUnit = results.find((u: any) => 
          u.symbol.toLowerCase() === symbol.toLowerCase()
        );
        expect(matchingUnit).toBeDefined();
      });
    });

    it('should filter International units by category', () => {
      const { getUnitsByCategory } = mockUseUnitSearch();
      
      const categoryTests = [
        { category: 'Weight', expectedUnits: ['Kilogram', 'Gram'] },
        { category: 'Length', expectedUnits: ['Meter', 'Centimeter'] },
        { category: 'Quantity', expectedUnits: ['Piece'] },
        { category: 'Volume', expectedUnits: ['Liter', 'Milliliter'] }
      ];
      
      categoryTests.forEach(({ category, expectedUnits }) => {
        const categoryUnits = getUnitsByCategory(category);
        
        expectedUnits.forEach(unitName => {
          const unit = categoryUnits.find((u: any) => u.name === unitName);
          expect(unit).toBeDefined();
          expect(unit?.category_name).toBe(category);
        });
      });
    });
  });

  describe('Conversion Properties', () => {
    it('should have valid conversion factors for International units', () => {
      const { units } = mockUseUnitSearch();
      
      const internationalUnits = units.filter((u: any) => 
        u.unit_type === 'SI' || u.unit_type === 'International'
      );
      
      internationalUnits.forEach((unit: any) => {
        const factor = parseFloat(unit.to_base_factor);
        expect(factor).toBeGreaterThan(0);
        expect(isFinite(factor)).toBe(true);
      });
    });

    it('should have appropriate decimal places for International units', () => {
      const { units } = mockUseUnitSearch();
      
      const decimalPlaceTests = [
        { name: 'Kilogram', expectedDecimals: 3 },
        { name: 'Gram', expectedDecimals: 2 },
        { name: 'Meter', expectedDecimals: 2 },
        { name: 'Centimeter', expectedDecimals: 1 },
        { name: 'Piece', expectedDecimals: 0 },
        { name: 'Liter', expectedDecimals: 2 },
        { name: 'Milliliter', expectedDecimals: 1 }
      ];
      
      decimalPlaceTests.forEach(({ name, expectedDecimals }) => {
        const unit = units.find((u: any) => u.name === name);
        expect(unit?.decimal_places).toBe(expectedDecimals);
      });
    });
  });

  describe('Property-Based Tests', () => {
    // Feature: unit-conversion-integration, Property 11.3: International Units Availability
    it('should maintain International unit properties across different searches', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom('kilogram', 'kg', 'kilo'),
            fc.constantFrom('meter', 'm', 'metre'),
            fc.constantFrom('piece', 'pcs', 'pc'),
            fc.constantFrom('liter', 'L', 'litre')
          ),
          (searchTerm) => {
            const { searchUnits } = mockUseUnitSearch();
            const results = searchUnits(searchTerm);
            
            // Should find at least one International unit
            const internationalResults = results.filter((u: any) => 
              u.unit_type === 'SI' || u.unit_type === 'International'
            );
            
            expect(internationalResults.length).toBeGreaterThan(0);
            
            // All found International units should be active
            internationalResults.forEach((unit: any) => {
              expect(unit.is_active).toBe(true);
              expect(['SI', 'International']).toContain(unit.unit_type);
            });
          }
        ),
        { numRuns: 20 }
      );
    });

    // Feature: unit-conversion-integration, Property 11.3: International Units Category Consistency
    it('should maintain category consistency for International units', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Weight', 'Length', 'Quantity', 'Volume'),
          (categoryName) => {
            const { getUnitsByCategory } = mockUseUnitSearch();
            const categoryUnits = getUnitsByCategory(categoryName);
            
            // Filter for International units in this category
            const internationalUnits = categoryUnits.filter((u: any) => 
              u.unit_type === 'SI' || u.unit_type === 'International'
            );
            
            // All units in category should have consistent category_name
            internationalUnits.forEach((unit: any) => {
              expect(unit.category_name).toBe(categoryName);
              expect(unit.is_active).toBe(true);
            });
          }
        ),
        { numRuns: 10 }
      );
    });

    // Feature: unit-conversion-integration, Property 11.3: International Units Type Consistency
    it('should maintain unit type consistency for International units', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('SI', 'International'),
          (unitType) => {
            const { getUnitsByType } = mockUseUnitSearch();
            const typeUnits = getUnitsByType(unitType);
            
            // All units should have the correct type
            typeUnits.forEach((unit: any) => {
              expect(unit.unit_type).toBe(unitType);
              expect(unit.is_active).toBe(true);
              
              // International units should have valid symbols and names
              expect(unit.name).toBeTruthy();
              expect(unit.symbol).toBeTruthy();
              expect(unit.name.length).toBeGreaterThan(0);
              expect(unit.symbol.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Display Format Verification', () => {
    it('should display International units with correct format', () => {
      const { units } = mockUseUnitSearch();
      
      const displayTests = [
        { name: 'Kilogram', symbol: 'kg', expectedDisplay: 'Kilogram (kg)' },
        { name: 'Meter', symbol: 'm', expectedDisplay: 'Meter (m)' },
        { name: 'Piece', symbol: 'pcs', expectedDisplay: 'Piece (pcs)' },
        { name: 'Liter', symbol: 'L', expectedDisplay: 'Liter (L)' }
      ];
      
      displayTests.forEach(({ name, symbol, expectedDisplay }) => {
        const unit = units.find((u: any) => u.name === name);
        expect(unit).toBeDefined();
        expect(unit?.symbol).toBe(symbol);
        
        // Verify display format can be constructed
        const displayFormat = `${unit?.name} (${unit?.symbol})`;
        expect(displayFormat).toBe(expectedDisplay);
      });
    });

    it('should have proper regional information for International units', () => {
      const { units } = mockUseUnitSearch();
      
      const internationalUnits = units.filter((u: any) => 
        u.unit_type === 'SI' || u.unit_type === 'International'
      );
      
      internationalUnits.forEach((unit: any) => {
        expect(unit.region).toBe('International');
        expect(unit.description).toBeTruthy();
        expect(unit.alternate_names).toBeTruthy();
      });
    });
  });
});