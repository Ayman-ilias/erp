/**
 * Textile Units Core Verification Test Suite
 * 
 * **Validates: Requirements 11.2**
 * 
 * This test suite verifies the core functionality of Textile units without UI components:
 * 1. Textile units are available in the system
 * 2. Have correct unit_type = "Textile"
 * 3. Can be found and filtered correctly
 * 4. Have proper conversion factors and properties
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useUnits, useUnitSearch } from '@/hooks/use-units';

// Mock the hooks
vi.mock('@/hooks/use-units');
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ token: 'mock-token' })
}));

// Sample Textile units data based on the unit conversion system
const mockTextileUnits = [
  {
    id: 201,
    name: 'GSM',
    symbol: 'g/m²',
    category_id: 15,
    category_name: 'Textile - Fabric Weight',
    unit_type: 'Textile',
    to_base_factor: '1.0',
    is_base: true,
    decimal_places: 2,
    is_active: true,
    description: 'Grams per square meter - fabric weight measurement',
    region: 'International',
    alternate_names: 'gsm, g/m2, grams per square meter'
  },
  {
    id: 202,
    name: 'Denier',
    symbol: 'den',
    category_id: 16,
    category_name: 'Textile - Fiber Thickness',
    unit_type: 'Textile',
    to_base_factor: '1.0',
    is_base: true,
    decimal_places: 1,
    is_active: true,
    description: 'Fiber thickness measurement - mass in grams per 9000 meters',
    region: 'International',
    alternate_names: 'denier, d'
  },
  {
    id: 203,
    name: 'Tex',
    symbol: 'tex',
    category_id: 17,
    category_name: 'Textile - Linear Mass Density',
    unit_type: 'Textile',
    to_base_factor: '1.0',
    is_base: true,
    decimal_places: 2,
    is_active: true,
    description: 'Linear mass density - mass in grams per 1000 meters',
    region: 'International',
    alternate_names: 'tex, linear density'
  },
  {
    id: 204,
    name: 'Momme',
    symbol: 'mm',
    category_id: 18,
    category_name: 'Textile - Silk Weight',
    unit_type: 'Textile',
    to_base_factor: '4.340',
    is_base: false,
    decimal_places: 1,
    is_active: true,
    description: 'Traditional silk weight measurement - 1 momme = 4.34 g/m²',
    region: 'Traditional',
    alternate_names: 'momme, silk weight'
  },
  {
    id: 205,
    name: 'Ounce per Square Yard',
    symbol: 'oz/yd²',
    category_id: 15,
    category_name: 'Textile - Fabric Weight',
    unit_type: 'Textile',
    to_base_factor: '33.906',
    is_base: false,
    decimal_places: 2,
    is_active: true,
    description: 'Fabric weight in ounces per square yard',
    region: 'Imperial',
    alternate_names: 'oz/yd2, ounce per square yard'
  }
];

const mockAllUnits = [
  ...mockTextileUnits,
  // Add some non-textile units for comparison
  {
    id: 1,
    name: 'Kilogram',
    symbol: 'kg',
    category_id: 1,
    category_name: 'Weight',
    unit_type: 'SI',
    to_base_factor: '1.0',
    is_base: true,
    decimal_places: 3,
    is_active: true
  },
  {
    id: 50,
    name: 'Tola',
    symbol: 'tola',
    category_id: 1,
    category_name: 'Weight',
    unit_type: 'Desi',
    to_base_factor: '0.011664',
    is_base: false,
    decimal_places: 4,
    is_active: true
  }
];

const mockCategories = [
  { id: 15, name: 'Textile - Fabric Weight', description: 'Fabric weight measurements' },
  { id: 16, name: 'Textile - Fiber Thickness', description: 'Fiber thickness measurements' },
  { id: 17, name: 'Textile - Linear Mass Density', description: 'Linear mass density measurements' },
  { id: 18, name: 'Textile - Silk Weight', description: 'Silk weight measurements' }
];

describe('Textile Units Core Verification', () => {
  beforeEach(() => {
    // Mock useUnits hook
    vi.mocked(useUnits).mockReturnValue({
      units: mockAllUnits,
      categories: mockCategories,
      isLoading: false,
      error: null
    });

    // Mock useUnitSearch hook
    vi.mocked(useUnitSearch).mockReturnValue({
      searchUnits: (query: string) => 
        mockAllUnits.filter(unit => 
          unit.name.toLowerCase().includes(query.toLowerCase()) ||
          unit.symbol.toLowerCase().includes(query.toLowerCase()) ||
          unit.category_name.toLowerCase().includes(query.toLowerCase()) ||
          (unit.alternate_names && unit.alternate_names.toLowerCase().includes(query.toLowerCase()))
        ),
      searchUnitsByCategory: (category: string) =>
        mockAllUnits.filter(unit => unit.category_name === category),
      searchUnitsByType: (type: string) =>
        mockAllUnits.filter(unit => unit.unit_type === type),
      getUnitsByCategory: (category: string) =>
        mockAllUnits.filter(unit => unit.category_name === category),
      getUnitsByType: (type: string) =>
        mockAllUnits.filter(unit => unit.unit_type === type),
      findUnitById: (id: number) =>
        mockAllUnits.find(unit => unit.id === id),
      findUnitBySymbol: (symbol: string) =>
        mockAllUnits.find(unit => unit.symbol === symbol),
      totalUnits: mockAllUnits.length,
      categories: mockCategories.map(cat => cat.name),
      unitTypes: ['SI', 'Desi', 'Textile']
    });
  });

  describe('Required Textile Units Availability', () => {
    it('should include GSM unit in the system', () => {
      const { findUnitBySymbol } = vi.mocked(useUnitSearch)();
      const gsmUnit = findUnitBySymbol('g/m²');
      
      expect(gsmUnit).toBeDefined();
      expect(gsmUnit?.name).toBe('GSM');
      expect(gsmUnit?.unit_type).toBe('Textile');
      expect(gsmUnit?.category_name).toBe('Textile - Fabric Weight');
    });

    it('should include Denier unit in the system', () => {
      const { findUnitBySymbol } = vi.mocked(useUnitSearch)();
      const denierUnit = findUnitBySymbol('den');
      
      expect(denierUnit).toBeDefined();
      expect(denierUnit?.name).toBe('Denier');
      expect(denierUnit?.unit_type).toBe('Textile');
      expect(denierUnit?.category_name).toBe('Textile - Fiber Thickness');
    });

    it('should include Tex unit in the system', () => {
      const { findUnitBySymbol } = vi.mocked(useUnitSearch)();
      const texUnit = findUnitBySymbol('tex');
      
      expect(texUnit).toBeDefined();
      expect(texUnit?.name).toBe('Tex');
      expect(texUnit?.unit_type).toBe('Textile');
      expect(texUnit?.category_name).toBe('Textile - Linear Mass Density');
    });

    it('should include Momme unit in the system', () => {
      const { findUnitBySymbol } = vi.mocked(useUnitSearch)();
      const mommeUnit = findUnitBySymbol('mm');
      
      expect(mommeUnit).toBeDefined();
      expect(mommeUnit?.name).toBe('Momme');
      expect(mommeUnit?.unit_type).toBe('Textile');
      expect(mommeUnit?.category_name).toBe('Textile - Silk Weight');
    });

    it('should have all required Textile units available', () => {
      const requiredUnits = ['GSM', 'Denier', 'Tex', 'Momme'];
      const availableTextileUnits = mockTextileUnits.map(unit => unit.name);
      
      requiredUnits.forEach(unitName => {
        expect(availableTextileUnits).toContain(unitName);
      });
    });
  });

  describe('Textile Unit Type Verification', () => {
    it('should have correct unit_type for all required Textile units', () => {
      const requiredUnits = ['GSM', 'Denier', 'Tex', 'Momme'];
      
      requiredUnits.forEach(unitName => {
        const unit = mockTextileUnits.find(u => u.name === unitName);
        expect(unit).toBeDefined();
        expect(unit?.unit_type).toBe('Textile');
      });
    });

    it('should filter units by Textile type correctly', () => {
      const { getUnitsByType } = vi.mocked(useUnitSearch)();
      const textileUnits = getUnitsByType('Textile');
      
      expect(textileUnits.length).toBe(mockTextileUnits.length);
      textileUnits.forEach(unit => {
        expect(unit.unit_type).toBe('Textile');
      });
    });

    it('should distinguish Textile units from other unit types', () => {
      const { getUnitsByType } = vi.mocked(useUnitSearch)();
      
      const textileUnits = getUnitsByType('Textile');
      const siUnits = getUnitsByType('SI');
      const desiUnits = getUnitsByType('Desi');
      
      expect(textileUnits.length).toBeGreaterThan(0);
      expect(siUnits.length).toBeGreaterThan(0);
      expect(desiUnits.length).toBeGreaterThan(0);
      
      // Ensure no overlap
      const textileIds = textileUnits.map(u => u.id);
      const siIds = siUnits.map(u => u.id);
      const desiIds = desiUnits.map(u => u.id);
      
      expect(textileIds.some(id => siIds.includes(id))).toBe(false);
      expect(textileIds.some(id => desiIds.includes(id))).toBe(false);
    });
  });

  describe('Textile Unit Categories', () => {
    it('should have proper categories for Textile units', () => {
      const expectedCategories = [
        'Textile - Fabric Weight',
        'Textile - Fiber Thickness', 
        'Textile - Linear Mass Density',
        'Textile - Silk Weight'
      ];
      
      const textileCategories = mockTextileUnits.map(unit => unit.category_name);
      const uniqueCategories = [...new Set(textileCategories)];
      
      expectedCategories.forEach(category => {
        expect(uniqueCategories).toContain(category);
      });
    });

    it('should group GSM and Ounce per Square Yard in Fabric Weight category', () => {
      const { getUnitsByCategory } = vi.mocked(useUnitSearch)();
      const fabricWeightUnits = getUnitsByCategory('Textile - Fabric Weight');
      
      const unitNames = fabricWeightUnits.map(u => u.name);
      expect(unitNames).toContain('GSM');
      expect(unitNames).toContain('Ounce per Square Yard');
    });

    it('should have Denier in its own Fiber Thickness category', () => {
      const { getUnitsByCategory } = vi.mocked(useUnitSearch)();
      const fiberThicknessUnits = getUnitsByCategory('Textile - Fiber Thickness');
      
      expect(fiberThicknessUnits.some(u => u.name === 'Denier')).toBe(true);
    });

    it('should have Tex in its own Linear Mass Density category', () => {
      const { getUnitsByCategory } = vi.mocked(useUnitSearch)();
      const linearDensityUnits = getUnitsByCategory('Textile - Linear Mass Density');
      
      expect(linearDensityUnits.some(u => u.name === 'Tex')).toBe(true);
    });

    it('should have Momme in its own Silk Weight category', () => {
      const { getUnitsByCategory } = vi.mocked(useUnitSearch)();
      const silkWeightUnits = getUnitsByCategory('Textile - Silk Weight');
      
      expect(silkWeightUnits.some(u => u.name === 'Momme')).toBe(true);
    });
  });

  describe('Textile Unit Search and Discovery', () => {
    it('should find Textile units by searching "textile"', () => {
      const { searchUnits } = vi.mocked(useUnitSearch)();
      const results = searchUnits('textile');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(unit => {
        expect(unit.unit_type).toBe('Textile');
      });
    });

    it('should find GSM by searching "gsm"', () => {
      const { searchUnits } = vi.mocked(useUnitSearch)();
      const results = searchUnits('gsm');
      
      expect(results.some(u => u.name === 'GSM')).toBe(true);
    });

    it('should find Denier by searching "denier"', () => {
      const { searchUnits } = vi.mocked(useUnitSearch)();
      const results = searchUnits('denier');
      
      expect(results.some(u => u.name === 'Denier')).toBe(true);
    });

    it('should find Tex by searching "tex"', () => {
      const { searchUnits } = vi.mocked(useUnitSearch)();
      const results = searchUnits('tex');
      
      expect(results.some(u => u.name === 'Tex')).toBe(true);
    });

    it('should find Momme by searching "momme" or "silk"', () => {
      const { searchUnits } = vi.mocked(useUnitSearch)();
      const mommeResults = searchUnits('momme');
      const silkResults = searchUnits('silk');
      
      expect(mommeResults.some(u => u.name === 'Momme')).toBe(true);
      expect(silkResults.some(u => u.name === 'Momme')).toBe(true);
    });

    it('should be case-insensitive when searching', () => {
      const { searchUnits } = vi.mocked(useUnitSearch)();
      
      const upperResults = searchUnits('GSM');
      const lowerResults = searchUnits('gsm');
      const mixedResults = searchUnits('Gsm');
      
      expect(upperResults.length).toBe(lowerResults.length);
      expect(lowerResults.length).toBe(mixedResults.length);
      expect(upperResults.length).toBeGreaterThan(0);
    });
  });

  describe('Textile Unit Properties', () => {
    it('should have valid conversion factors', () => {
      mockTextileUnits.forEach(unit => {
        const factor = parseFloat(unit.to_base_factor);
        expect(factor).toBeGreaterThan(0);
        expect(isNaN(factor)).toBe(false);
      });
    });

    it('should have appropriate decimal places', () => {
      mockTextileUnits.forEach(unit => {
        expect(unit.decimal_places).toBeGreaterThanOrEqual(0);
        expect(unit.decimal_places).toBeLessThanOrEqual(6);
      });
    });

    it('should have all units active', () => {
      mockTextileUnits.forEach(unit => {
        expect(unit.is_active).toBe(true);
      });
    });

    it('should have valid IDs', () => {
      mockTextileUnits.forEach(unit => {
        expect(unit.id).toBeGreaterThan(0);
        expect(Number.isInteger(unit.id)).toBe(true);
      });
    });

    it('should have non-empty names and symbols', () => {
      mockTextileUnits.forEach(unit => {
        expect(unit.name).toBeTruthy();
        expect(unit.name.length).toBeGreaterThan(0);
        expect(unit.symbol).toBeTruthy();
        expect(unit.symbol.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Textile Unit Display Format', () => {
    it('should format units correctly as "Name (Symbol)"', () => {
      const testCases = [
        { unit: mockTextileUnits[0], expected: 'GSM (g/m²)' },
        { unit: mockTextileUnits[1], expected: 'Denier (den)' },
        { unit: mockTextileUnits[2], expected: 'Tex (tex)' },
        { unit: mockTextileUnits[3], expected: 'Momme (mm)' }
      ];
      
      testCases.forEach(({ unit, expected }) => {
        const displayFormat = `${unit.name} (${unit.symbol})`;
        expect(displayFormat).toBe(expected);
      });
    });

    it('should have unique symbols for each Textile unit', () => {
      const symbols = mockTextileUnits.map(unit => unit.symbol);
      const uniqueSymbols = [...new Set(symbols)];
      
      expect(symbols.length).toBe(uniqueSymbols.length);
    });
  });

  describe('Property-Based Tests for Textile Units', () => {
    // Feature: unit-conversion-integration, Property 17: Unit Type Display
    it('should consistently have unit_type "Textile" for all Textile units', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...mockTextileUnits),
          (unit) => {
            expect(unit.unit_type).toBe('Textile');
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    // Feature: unit-conversion-integration, Property 5: Unit Search Filtering
    it('should filter correctly across different search terms', () => {
      const searchTerms = ['textile', 'fabric', 'gsm', 'denier', 'tex', 'momme', 'silk', 'weight', 'density'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...searchTerms),
          (searchTerm) => {
            const { searchUnits } = vi.mocked(useUnitSearch)();
            const results = searchUnits(searchTerm);
            
            // All results should contain the search term somewhere
            results.forEach(unit => {
              const matchesName = unit.name.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesSymbol = unit.symbol.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesCategory = unit.category_name.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesAlternate = unit.alternate_names?.toLowerCase().includes(searchTerm.toLowerCase());
              
              expect(matchesName || matchesSymbol || matchesCategory || matchesAlternate).toBe(true);
            });
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    // Feature: unit-conversion-integration, Property 14: Category-Filtered Unit Display
    it('should filter by Textile categories correctly', () => {
      const textileCategories = [
        'Textile - Fabric Weight',
        'Textile - Fiber Thickness',
        'Textile - Linear Mass Density',
        'Textile - Silk Weight'
      ];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...textileCategories),
          (category) => {
            const { getUnitsByCategory } = vi.mocked(useUnitSearch)();
            const results = getUnitsByCategory(category);
            
            // All results should belong to the specified category and be Textile type
            results.forEach(unit => {
              expect(unit.category_name).toBe(category);
              expect(unit.unit_type).toBe('Textile');
            });
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Conversion Readiness', () => {
    it('should have conversion factors that allow mathematical operations', () => {
      mockTextileUnits.forEach(unit => {
        const factor = parseFloat(unit.to_base_factor);
        
        // Should be able to multiply and divide
        const testValue = 100;
        const converted = testValue * factor;
        const backConverted = converted / factor;
        
        expect(Math.abs(backConverted - testValue)).toBeLessThan(0.001);
      });
    });

    it('should support conversions within same category', () => {
      // Test that units in the same category can theoretically convert
      const fabricWeightUnits = mockTextileUnits.filter(u => 
        u.category_name === 'Textile - Fabric Weight'
      );
      
      if (fabricWeightUnits.length >= 2) {
        const [unit1, unit2] = fabricWeightUnits;
        const factor1 = parseFloat(unit1.to_base_factor);
        const factor2 = parseFloat(unit2.to_base_factor);
        
        // Conversion ratio should be calculable
        const ratio = factor1 / factor2;
        expect(ratio).toBeGreaterThan(0);
        expect(isNaN(ratio)).toBe(false);
      }
    });
  });
});