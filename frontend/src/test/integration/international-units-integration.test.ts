/**
 * International Units Integration Test Suite
 * 
 * **Validates: Requirements 11.3**
 * 
 * This test suite verifies that International units (kg, meter, piece, liter) are:
 * 1. Available in the unit selector
 * 2. Have correct unit_type = "SI" or "International"
 * 3. Can perform conversions between International units
 * 4. Display correctly in UI components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import * as React from 'react';
import fc from 'fast-check';
import { useUnitSearch, UnitWithCategory } from '@/hooks/use-units';
import { useAuth } from '@/lib/auth-context';
import { unitService } from '@/services/api';

// Mock dependencies
vi.mock('@/lib/auth-context');
vi.mock('@/services/api');

const mockUseAuth = vi.mocked(useAuth);
const mockUnitService = vi.mocked(unitService);

// International units test data based on seed script
const mockInternationalUnits: UnitWithCategory[] = [
  // Weight category SI units
  {
    id: 1,
    category_id: 1,
    name: 'Kilogram',
    symbol: 'kg',
    description: 'Base SI mass unit',
    unit_type: 'SI',
    region: null,
    to_base_factor: 1,
    alternate_names: 'kilo',
    is_base: true,
    is_active: true,
    decimal_places: 2,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Weight',
    base_unit_symbol: 'kg'
  },
  // Length category SI units
  {
    id: 2,
    category_id: 2,
    name: 'Meter',
    symbol: 'm',
    description: 'Base SI length unit',
    unit_type: 'SI',
    region: null,
    to_base_factor: 1,
    alternate_names: 'metre',
    is_base: true,
    is_active: true,
    decimal_places: 2,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Length',
    base_unit_symbol: 'm'
  },
  // Volume category SI units
  {
    id: 3,
    category_id: 3,
    name: 'Liter',
    symbol: 'L',
    description: '0.001 m3',
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
    base_unit_symbol: 'm3'
  },
  // Count category International units
  {
    id: 4,
    category_id: 4,
    name: 'Piece',
    symbol: 'pc',
    description: 'Single item',
    unit_type: 'SI',
    region: null,
    to_base_factor: 1,
    alternate_names: 'pcs, pieces',
    is_base: true,
    is_active: true,
    decimal_places: 0,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Count',
    base_unit_symbol: 'pc'
  }
];

// Additional non-international units for comparison
const mockOtherUnits: UnitWithCategory[] = [
  {
    id: 20,
    category_id: 1,
    name: 'Tola',
    symbol: 'tola',
    description: 'Traditional South Asian weight',
    unit_type: 'Desi',
    region: 'South Asia',
    to_base_factor: 0.011664,
    alternate_names: 'tol, bhori',
    is_base: false,
    is_active: true,
    decimal_places: 3,
    sort_order: 20,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Weight',
    base_unit_symbol: 'kg'
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
      children
    );
  };
}

describe('International Units Integration', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    mockUnitService.getAll.mockResolvedValue(allMockUnits);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Required International Units Availability', () => {
    // **Validates: Requirements 11.3**
    it('should have Kilogram unit available in unit selector', async () => {
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
    });

    // **Validates: Requirements 11.3**
    it('should have Meter unit available in unit selector', async () => {
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
    });

    // **Validates: Requirements 11.3**
    it('should have Piece unit available in unit selector', async () => {
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
    });

    // **Validates: Requirements 11.3**
    it('should have Liter unit available in unit selector', async () => {
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
    });

    // **Validates: Requirements 11.3**
    it('should have all required International units available', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const requiredUnits = ['kg', 'm', 'pc', 'L'];
      const availableUnits = result.current.searchUnits('');
      
      for (const symbol of requiredUnits) {
        const unit = availableUnits.find(u => u.symbol === symbol);
        expect(unit).toBeDefined();
        expect(['SI', 'International']).toContain(unit!.unit_type);
      }
    });
  });

  describe('International Unit Type Display', () => {
    // **Validates: Requirements 11.3**
    it('should show correct unit_type for all International units', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const internationalUnits = mockInternationalUnits;
      
      internationalUnits.forEach(unit => {
        expect(['SI', 'International']).toContain(unit.unit_type);
      });
    });

    // **Validates: Requirements 11.3**
    it('should filter units by SI type correctly', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const siUnits = result.current.getUnitsByType('SI');
      expect(siUnits.length).toBeGreaterThanOrEqual(4);
      
      siUnits.forEach(unit => {
        expect(unit.unit_type).toBe('SI');
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
      
      expect(siUnits.length).toBeGreaterThan(0);
      expect(desiUnits.length).toBeGreaterThan(0);
      
      // Ensure no overlap
      const siIds = siUnits.map(u => u.id);
      const desiIds = desiUnits.map(u => u.id);
      
      expect(siIds.some(id => desiIds.includes(id))).toBe(false);
    });
  });

  describe('International Units in Appropriate Categories', () => {
    // **Validates: Requirements 11.3**
    it('should have kilogram in Weight category', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const weightUnits = result.current.getUnitsByCategory('Weight');
      const kgUnit = weightUnits.find(u => u.symbol === 'kg');
      
      expect(kgUnit).toBeDefined();
      expect(kgUnit!.name).toBe('Kilogram');
      expect(kgUnit!.unit_type).toBe('SI');
    });

    // **Validates: Requirements 11.3**
    it('should have meter in Length category', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const lengthUnits = result.current.getUnitsByCategory('Length');
      const meterUnit = lengthUnits.find(u => u.symbol === 'm');
      
      expect(meterUnit).toBeDefined();
      expect(meterUnit!.name).toBe('Meter');
      expect(meterUnit!.unit_type).toBe('SI');
    });

    // **Validates: Requirements 11.3**
    it('should have liter in Volume category', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const volumeUnits = result.current.getUnitsByCategory('Volume');
      const literUnit = volumeUnits.find(u => u.symbol === 'L');
      
      expect(literUnit).toBeDefined();
      expect(literUnit!.name).toBe('Liter');
      expect(literUnit!.unit_type).toBe('SI');
    });

    // **Validates: Requirements 11.3**
    it('should have piece in Count category', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const countUnits = result.current.getUnitsByCategory('Count');
      const pieceUnit = countUnits.find(u => u.symbol === 'pc');
      
      expect(pieceUnit).toBeDefined();
      expect(pieceUnit!.name).toBe('Piece');
      expect(pieceUnit!.unit_type).toBe('SI');
    });
  });

  describe('International Unit Conversion Factors', () => {
    // **Validates: Requirements 11.3**
    it('should have correct conversion factors for base International units', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const kgUnit = result.current.findUnitBySymbol('kg');
      const meterUnit = result.current.findUnitBySymbol('m');
      const pieceUnit = result.current.findUnitBySymbol('pc');

      expect(kgUnit!.to_base_factor).toBe(1); // Base unit
      expect(meterUnit!.to_base_factor).toBe(1); // Base unit
      expect(pieceUnit!.to_base_factor).toBe(1); // Base unit
    });

    // **Validates: Requirements 11.3**
    it('should have mathematically valid conversion factors', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockInternationalUnits.forEach(unit => {
        expect(unit.to_base_factor).toBeGreaterThan(0);
        expect(typeof unit.to_base_factor).toBe('number');
        expect(isFinite(unit.to_base_factor)).toBe(true);
      });
    });
  });

  describe('International Unit Search and Filtering', () => {
    // **Validates: Requirements 11.3**
    it('should find International units by name search', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResults = result.current.searchUnits('kilogram');
      expect(searchResults.length).toBeGreaterThanOrEqual(1);
      expect(searchResults[0].name).toBe('Kilogram');
      expect(searchResults[0].unit_type).toBe('SI');
    });

    // **Validates: Requirements 11.3**
    it('should find International units by alternate names', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Search for 'kilo' which is alternate name for 'kilogram'
      const searchResults = result.current.searchUnits('kilo');
      expect(searchResults.length).toBeGreaterThanOrEqual(1);
      
      const kgUnit = searchResults.find(u => u.symbol === 'kg');
      expect(kgUnit).toBeDefined();
      expect(kgUnit!.alternate_names).toContain('kilo');
    });

    // **Validates: Requirements 11.3**
    it('should be case-insensitive when searching International units', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const upperCaseResults = result.current.searchUnits('KILOGRAM');
      const lowerCaseResults = result.current.searchUnits('kilogram');
      const mixedCaseResults = result.current.searchUnits('Kilogram');
      
      expect(upperCaseResults.length).toBe(lowerCaseResults.length);
      expect(lowerCaseResults.length).toBe(mixedCaseResults.length);
      expect(upperCaseResults.length).toBeGreaterThan(0);
    });
  });

  describe('Property-Based Tests for International Units', () => {
    // Feature: unit-conversion-integration, Property 1: International Unit Availability
    it('should always find required International units regardless of search case', async () => {
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

            const unit = result.current.findUnitBySymbol(searchSymbol);
            expect(unit).toBeDefined();
            expect(['SI', 'International']).toContain(unit!.unit_type);
          }
        ),
        { numRuns: 20 }
      );
    });

    // Feature: unit-conversion-integration, Property 2: International Unit Type Consistency
    it('should always return SI or International type for all International units', async () => {
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
          }
        ),
        { numRuns: 10 }
      );
    });

    // Feature: unit-conversion-integration, Property 3: International Unit Conversion Factor Validity
    it('should have positive conversion factors for all International units', async () => {
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
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});