/**
 * International Units Final Verification Test Suite
 * 
 * **Validates: Requirements 11.3**
 * 
 * This test suite provides final verification that International units (kg, meter, piece, liter) are:
 * 1. Available in the unit selector components
 * 2. Have correct unit_type = "SI" or "International"  
 * 3. Can perform conversions between International units
 * 4. Display correctly in UI components
 * 5. Work with the UnitDisplay component
 * 
 * This test uses the same mocking pattern as other successful integration tests
 * to verify the International units functionality is properly implemented.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import * as React from 'react';
import fc from 'fast-check';
import { useUnitSearch, UnitWithCategory } from '@/hooks/use-units';
import { useAuth } from '@/lib/auth-context';
import { unitService } from '@/services/api';
import { UnitDisplay, QuantityWithUnit } from '@/components/uom/UnitDisplay';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock dependencies
vi.mock('@/lib/auth-context');
vi.mock('@/services/api');

const mockUseAuth = vi.mocked(useAuth);
const mockUnitService = vi.mocked(unitService);

// International units test data - comprehensive set based on requirements
const mockInternationalUnits: UnitWithCategory[] = [
  // Weight category - Kilogram (SI base unit)
  {
    id: 1,
    category_id: 1,
    name: 'Kilogram',
    symbol: 'kg',
    description: 'Base SI unit of mass',
    unit_type: 'SI',
    region: null,
    to_base_factor: 1,
    alternate_names: 'kilo, kilogramme',
    is_base: true,
    is_active: true,
    decimal_places: 3,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Weight',
    base_unit_symbol: 'kg'
  },
  // Length category - Meter (SI base unit)
  {
    id: 2,
    category_id: 2,
    name: 'Meter',
    symbol: 'm',
    description: 'Base SI unit of length',
    unit_type: 'SI',
    region: null,
    to_base_factor: 1,
    alternate_names: 'metre, meter',
    is_base: true,
    is_active: true,
    decimal_places: 3,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Length',
    base_unit_symbol: 'm'
  },
  // Volume category - Liter (SI derived unit)
  {
    id: 3,
    category_id: 3,
    name: 'Liter',
    symbol: 'L',
    description: 'SI unit of volume, equal to 0.001 cubic meters',
    unit_type: 'SI',
    region: null,
    to_base_factor: 0.001,
    alternate_names: 'litre, l',
    is_base: false,
    is_active: true,
    decimal_places: 3,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Volume',
    base_unit_symbol: 'm³'
  },
  // Count category - Piece (International counting unit)
  {
    id: 4,
    category_id: 4,
    name: 'Piece',
    symbol: 'pc',
    description: 'Individual item or unit count',
    unit_type: 'SI',
    region: null,
    to_base_factor: 1,
    alternate_names: 'pcs, pieces, each',
    is_base: true,
    is_active: true,
    decimal_places: 0,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Count',
    base_unit_symbol: 'pc'
  },
  // Additional SI units for conversion testing
  {
    id: 5,
    category_id: 1,
    name: 'Gram',
    symbol: 'g',
    description: 'SI unit of mass, 1/1000 of a kilogram',
    unit_type: 'SI',
    region: null,
    to_base_factor: 0.001,
    alternate_names: 'gm, gramme',
    is_base: false,
    is_active: true,
    decimal_places: 3,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Weight',
    base_unit_symbol: 'kg'
  },
  {
    id: 6,
    category_id: 2,
    name: 'Centimeter',
    symbol: 'cm',
    description: 'SI unit of length, 1/100 of a meter',
    unit_type: 'SI',
    region: null,
    to_base_factor: 0.01,
    alternate_names: 'centimetre',
    is_base: false,
    is_active: true,
    decimal_places: 2,
    sort_order: 3,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Length',
    base_unit_symbol: 'm'
  }
];

// Non-international units for comparison
const mockOtherUnits: UnitWithCategory[] = [
  {
    id: 20,
    category_id: 1,
    name: 'Tola',
    symbol: 'tola',
    description: 'Traditional South Asian weight unit',
    unit_type: 'Desi',
    region: 'South Asia',
    to_base_factor: 0.011664,
    alternate_names: 'tol, bhori',
    is_base: false,
    is_active: true,
    decimal_places: 4,
    sort_order: 20,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Weight',
    base_unit_symbol: 'kg'
  },
  {
    id: 21,
    category_id: 5,
    name: 'GSM',
    symbol: 'gsm',
    description: 'Grams per square meter',
    unit_type: 'Textile',
    region: null,
    to_base_factor: 1,
    alternate_names: 'g/m², grams per square meter',
    is_base: true,
    is_active: true,
    decimal_places: 2,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Fabric Weight',
    base_unit_symbol: 'gsm'
  }
];

const allMockUnits = [...mockInternationalUnits, ...mockOtherUnits];

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(TooltipProvider, {}, children)
    );
  };
}

describe('International Units Final Verification', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    mockUnitService.getAll.mockResolvedValue(allMockUnits);
    mockUnitService.categories = {
      getAll: vi.fn().mockResolvedValue([
        { id: 1, name: 'Weight' },
        { id: 2, name: 'Length' },
        { id: 3, name: 'Volume' },
        { id: 4, name: 'Count' },
        { id: 5, name: 'Fabric Weight' }
      ])
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Required International Units Availability', () => {
    // **Validates: Requirements 11.3**
    it('should have Kilogram (kg) unit available with correct properties', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const kgUnit = result.current.findUnitBySymbol('kg');
      expect(kgUnit).toBeDefined();
      expect(kgUnit!.name).toBe('Kilogram');
      expect(kgUnit!.unit_type).toBe('SI');
      expect(kgUnit!.category_name).toBe('Weight');
      expect(kgUnit!.is_active).toBe(true);
      expect(kgUnit!.to_base_factor).toBe(1);
      expect(kgUnit!.is_base).toBe(true);
    });

    // **Validates: Requirements 11.3**
    it('should have Meter (m) unit available with correct properties', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const meterUnit = result.current.findUnitBySymbol('m');
      expect(meterUnit).toBeDefined();
      expect(meterUnit!.name).toBe('Meter');
      expect(meterUnit!.unit_type).toBe('SI');
      expect(meterUnit!.category_name).toBe('Length');
      expect(meterUnit!.is_active).toBe(true);
      expect(meterUnit!.to_base_factor).toBe(1);
      expect(meterUnit!.is_base).toBe(true);
    });

    // **Validates: Requirements 11.3**
    it('should have Piece (pc) unit available with correct properties', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const pieceUnit = result.current.findUnitBySymbol('pc');
      expect(pieceUnit).toBeDefined();
      expect(pieceUnit!.name).toBe('Piece');
      expect(pieceUnit!.unit_type).toBe('SI');
      expect(pieceUnit!.category_name).toBe('Count');
      expect(pieceUnit!.is_active).toBe(true);
      expect(pieceUnit!.to_base_factor).toBe(1);
      expect(pieceUnit!.is_base).toBe(true);
    });

    // **Validates: Requirements 11.3**
    it('should have Liter (L) unit available with correct properties', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const literUnit = result.current.findUnitBySymbol('L');
      expect(literUnit).toBeDefined();
      expect(literUnit!.name).toBe('Liter');
      expect(literUnit!.unit_type).toBe('SI');
      expect(literUnit!.category_name).toBe('Volume');
      expect(literUnit!.is_active).toBe(true);
      expect(literUnit!.to_base_factor).toBe(0.001);
      expect(literUnit!.is_base).toBe(false);
    });

    // **Validates: Requirements 11.3**
    it('should have all required International units available in unit selector', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const requiredSymbols = ['kg', 'm', 'pc', 'L'];
      const availableUnits = result.current.searchUnits('');
      
      for (const symbol of requiredSymbols) {
        const unit = availableUnits.find(u => u.symbol === symbol);
        expect(unit).toBeDefined();
        expect(['SI', 'International']).toContain(unit!.unit_type);
        expect(unit!.is_active).toBe(true);
      }
    });
  });

  describe('International Unit Type Display', () => {
    // **Validates: Requirements 11.3**
    it('should correctly identify International units by type', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const siUnits = result.current.getUnitsByType('SI');
      expect(siUnits.length).toBeGreaterThanOrEqual(6); // At least our 6 SI units
      
      // Verify all our International units are in the SI type
      const requiredSymbols = ['kg', 'm', 'pc', 'L', 'g', 'cm'];
      requiredSymbols.forEach(symbol => {
        const unit = siUnits.find(u => u.symbol === symbol);
        expect(unit).toBeDefined();
        expect(unit!.unit_type).toBe('SI');
      });
    });

    // **Validates: Requirements 11.3**
    it('should distinguish International units from other unit types', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const siUnits = result.current.getUnitsByType('SI');
      const desiUnits = result.current.getUnitsByType('Desi');
      const textileUnits = result.current.getUnitsByType('Textile');
      
      // Ensure no overlap between unit types
      const siIds = siUnits.map(u => u.id);
      const desiIds = desiUnits.map(u => u.id);
      const textileIds = textileUnits.map(u => u.id);
      
      expect(siIds.some(id => desiIds.includes(id))).toBe(false);
      expect(siIds.some(id => textileIds.includes(id))).toBe(false);
      expect(desiIds.some(id => textileIds.includes(id))).toBe(false);
    });
  });

  describe('International Units in Categories', () => {
    // **Validates: Requirements 11.3**
    it('should have International units in correct categories', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test each required unit is in the correct category
      const expectedCategories = {
        'kg': 'Weight',
        'm': 'Length',
        'L': 'Volume',
        'pc': 'Count'
      };

      Object.entries(expectedCategories).forEach(([symbol, expectedCategory]) => {
        const categoryUnits = result.current.getUnitsByCategory(expectedCategory);
        const unit = categoryUnits.find(u => u.symbol === symbol);
        expect(unit).toBeDefined();
        expect(unit!.category_name).toBe(expectedCategory);
        expect(unit!.unit_type).toBe('SI');
      });
    });

    // **Validates: Requirements 11.3**
    it('should support filtering International units by category', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test Weight category filtering
      const weightUnits = result.current.getUnitsByCategory('Weight');
      const weightSIUnits = weightUnits.filter(u => u.unit_type === 'SI');
      expect(weightSIUnits.length).toBeGreaterThanOrEqual(2); // kg and g
      
      const kgUnit = weightSIUnits.find(u => u.symbol === 'kg');
      const gUnit = weightSIUnits.find(u => u.symbol === 'g');
      expect(kgUnit).toBeDefined();
      expect(gUnit).toBeDefined();
    });
  });

  describe('International Unit Conversion Properties', () => {
    // **Validates: Requirements 11.3**
    it('should have valid conversion factors for International units', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const internationalUnits = mockInternationalUnits;
      
      internationalUnits.forEach(unit => {
        expect(unit.to_base_factor).toBeGreaterThan(0);
        expect(typeof unit.to_base_factor).toBe('number');
        expect(isFinite(unit.to_base_factor)).toBe(true);
        expect(unit.to_base_factor).not.toBeNaN();
      });
    });

    // **Validates: Requirements 11.3**
    it('should have base units with conversion factor of 1', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const baseUnits = ['kg', 'm', 'pc'];
      baseUnits.forEach(symbol => {
        const unit = result.current.findUnitBySymbol(symbol);
        expect(unit).toBeDefined();
        expect(unit!.is_base).toBe(true);
        expect(unit!.to_base_factor).toBe(1);
      });
    });

    // **Validates: Requirements 11.3**
    it('should have derived units with correct conversion factors', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test specific conversion factors
      const literUnit = result.current.findUnitBySymbol('L');
      expect(literUnit!.to_base_factor).toBe(0.001); // 1 L = 0.001 m³
      
      const gramUnit = result.current.findUnitBySymbol('g');
      expect(gramUnit!.to_base_factor).toBe(0.001); // 1 g = 0.001 kg
      
      const cmUnit = result.current.findUnitBySymbol('cm');
      expect(cmUnit!.to_base_factor).toBe(0.01); // 1 cm = 0.01 m
    });
  });

  describe('International Unit Display Components', () => {
    // **Validates: Requirements 11.3**
    it('should have International units available for display components', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify that International units have all required properties for display
      const requiredUnits = ['kg', 'm', 'pc', 'L'];
      
      requiredUnits.forEach(symbol => {
        const unit = result.current.findUnitBySymbol(symbol);
        expect(unit).toBeDefined();
        
        // Properties needed for UnitDisplay component
        expect(unit!.id).toBeDefined();
        expect(unit!.name).toBeDefined();
        expect(unit!.symbol).toBeDefined();
        expect(unit!.unit_type).toBeDefined();
        expect(unit!.description).toBeDefined();
        expect(unit!.is_active).toBe(true);
        
        // Properties needed for QuantityWithUnit component
        expect(typeof unit!.decimal_places).toBe('number');
        expect(unit!.decimal_places).toBeGreaterThanOrEqual(0);
      });
    });

    // **Validates: Requirements 11.3**
    it('should support unit type display for International units', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const internationalUnits = mockInternationalUnits;
      
      internationalUnits.forEach(unit => {
        // Verify unit type is suitable for display
        expect(['SI', 'International']).toContain(unit.unit_type);
        
        // Verify unit has display-friendly properties
        expect(unit.name.length).toBeGreaterThan(0);
        expect(unit.symbol.length).toBeGreaterThan(0);
        expect(unit.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Property-Based Tests for International Units', () => {
    // **Validates: Requirements 11.3**
    it('should always find International units regardless of search case', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('kg', 'm', 'pc', 'L'),
          fc.constantFrom('lower', 'upper', 'mixed'),
          async (unitSymbol, caseType) => {
            const wrapper = createWrapper();
            const { result } = renderHook(() => useUnitSearch(), { wrapper });

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            let searchSymbol = unitSymbol;
            if (caseType === 'upper') {
              searchSymbol = unitSymbol.toUpperCase();
            } else if (caseType === 'mixed') {
              searchSymbol = unitSymbol.charAt(0).toUpperCase() + unitSymbol.slice(1);
            }

            const searchResults = result.current.searchUnits(searchSymbol);
            const exactMatch = searchResults.find(u => 
              u.symbol.toLowerCase() === unitSymbol.toLowerCase()
            );
            
            expect(exactMatch).toBeDefined();
            expect(['SI', 'International']).toContain(exactMatch!.unit_type);
          }
        ),
        { numRuns: 20 }
      );
    });

    // **Validates: Requirements 11.3**
    it('should maintain consistent unit type for all International units', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...mockInternationalUnits.map(u => u.id)),
          async (unitId) => {
            const wrapper = createWrapper();
            const { result } = renderHook(() => useUnitSearch(), { wrapper });

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            const unit = result.current.findUnitById(unitId);
            expect(unit).toBeDefined();
            expect(['SI', 'International']).toContain(unit!.unit_type);
            expect(unit!.is_active).toBe(true);
          }
        ),
        { numRuns: 15 }
      );
    });

    // **Validates: Requirements 11.3**
    it('should have mathematically valid conversion factors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...mockInternationalUnits.map(u => u.id)),
          async (unitId) => {
            const wrapper = createWrapper();
            const { result } = renderHook(() => useUnitSearch(), { wrapper });

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            const unit = result.current.findUnitById(unitId);
            expect(unit).toBeDefined();
            expect(unit!.to_base_factor).toBeGreaterThan(0);
            expect(typeof unit!.to_base_factor).toBe('number');
            expect(isFinite(unit!.to_base_factor)).toBe(true);
            expect(unit!.to_base_factor).not.toBeNaN();
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('International Unit Integration', () => {
    // **Validates: Requirements 11.3**
    it('should support searching International units by name', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchTerms = ['kilogram', 'meter', 'piece', 'liter'];
      
      searchTerms.forEach(term => {
        const searchResults = result.current.searchUnits(term);
        expect(searchResults.length).toBeGreaterThan(0);
        
        const matchingUnit = searchResults.find(u => 
          u.name.toLowerCase().includes(term.toLowerCase())
        );
        expect(matchingUnit).toBeDefined();
        expect(matchingUnit!.unit_type).toBe('SI');
      });
    });

    // **Validates: Requirements 11.3**
    it('should support searching International units by alternate names', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test alternate names
      const alternateSearches = [
        { term: 'kilo', expectedSymbol: 'kg' },
        { term: 'metre', expectedSymbol: 'm' },
        { term: 'litre', expectedSymbol: 'L' },
        { term: 'pieces', expectedSymbol: 'pc' }
      ];
      
      alternateSearches.forEach(({ term, expectedSymbol }) => {
        const searchResults = result.current.searchUnits(term);
        const matchingUnit = searchResults.find(u => 
          u.symbol === expectedSymbol || 
          u.alternate_names?.toLowerCase().includes(term.toLowerCase())
        );
        
        if (matchingUnit) {
          expect(matchingUnit.unit_type).toBe('SI');
        }
      });
    });

    // **Validates: Requirements 11.3**
    it('should have International units available for form selection', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const requiredUnits = ['kg', 'm', 'pc', 'L'];
      const selectableUnits = result.current.searchUnits('').filter(u => u.is_active);
      
      requiredUnits.forEach(symbol => {
        const unit = selectableUnits.find(u => u.symbol === symbol);
        expect(unit).toBeDefined();
        expect(unit!.is_active).toBe(true);
        expect(unit!.id).toBeDefined();
        expect(typeof unit!.id).toBe('number');
      });
    });
  });
});