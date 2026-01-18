/**
 * Desi Units Verification Tests
 * 
 * Comprehensive verification that all required Desi units are available
 * in the unit conversion system and work correctly.
 * 
 * **Validates: Requirements 11.1, 11.5**
 * 
 * Tests verify:
 * - Tola, Seer, Maund, Bigha, Lakh, Crore are available in unit selector
 * - Conversions between Desi units work correctly
 * - Desi units show correct unit_type
 * - Desi units appear in appropriate categories
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

// Complete Desi units test data based on seed script
const mockDesiUnits: UnitWithCategory[] = [
  // Weight category Desi units
  {
    id: 20,
    category_id: 1,
    name: 'Tola',
    symbol: 'tola',
    description: 'Traditional South Asian weight (11.664 grams)',
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
  },
  {
    id: 21,
    category_id: 1,
    name: 'Seer',
    symbol: 'seer',
    description: '80 tola (933 grams)',
    unit_type: 'Desi',
    region: 'South Asia',
    to_base_factor: 0.933,
    alternate_names: 'ser',
    is_base: false,
    is_active: true,
    decimal_places: 3,
    sort_order: 21,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Weight',
    base_unit_symbol: 'kg'
  },
  {
    id: 22,
    category_id: 1,
    name: 'Maund',
    symbol: 'mun',
    description: '40 seer (37.32 kg)',
    unit_type: 'Desi',
    region: 'South Asia',
    to_base_factor: 37.32,
    alternate_names: 'mon, maund',
    is_base: false,
    is_active: true,
    decimal_places: 2,
    sort_order: 22,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Weight',
    base_unit_symbol: 'kg'
  },
  // Area category Desi units
  {
    id: 30,
    category_id: 3,
    name: 'Bigha (Standard)',
    symbol: 'bigha',
    description: 'Generic traditional unit (2500 m2)',
    unit_type: 'Desi',
    region: 'South Asia',
    to_base_factor: 2500,
    alternate_names: null,
    is_base: false,
    is_active: true,
    decimal_places: 0,
    sort_order: 20,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Area',
    base_unit_symbol: 'm2'
  },
  {
    id: 31,
    category_id: 3,
    name: 'Bigha (Dhaka)',
    symbol: 'bigha_dh',
    description: 'Traditional land unit - Dhaka region',
    unit_type: 'Desi',
    region: 'Dhaka',
    to_base_factor: 2500,
    alternate_names: null,
    is_base: false,
    is_active: true,
    decimal_places: 0,
    sort_order: 21,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Area',
    base_unit_symbol: 'm2'
  },
  // Count category Desi units
  {
    id: 40,
    category_id: 4,
    name: 'Lakh',
    symbol: 'lakh',
    description: '100,000 count (Indian numbering)',
    unit_type: 'Desi',
    region: 'South Asia',
    to_base_factor: 100000,
    alternate_names: 'lac',
    is_base: false,
    is_active: true,
    decimal_places: 0,
    sort_order: 20,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Count',
    base_unit_symbol: 'pc'
  },
  {
    id: 41,
    category_id: 4,
    name: 'Crore',
    symbol: 'crore',
    description: '10,000,000 count (Indian numbering)',
    unit_type: 'Desi',
    region: 'South Asia',
    to_base_factor: 10000000,
    alternate_names: null,
    is_base: false,
    is_active: true,
    decimal_places: 0,
    sort_order: 21,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Count',
    base_unit_symbol: 'pc'
  }
];

// Additional non-Desi units for comparison
const mockOtherUnits: UnitWithCategory[] = [
  {
    id: 1,
    category_id: 1,
    name: 'Kilogram',
    symbol: 'kg',
    description: 'Base unit of mass',
    unit_type: 'SI',
    region: 'International',
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
  {
    id: 10,
    category_id: 4,
    name: 'Piece',
    symbol: 'pc',
    description: 'Individual item count',
    unit_type: 'International',
    region: 'International',
    to_base_factor: 1,
    alternate_names: 'pcs, piece',
    is_base: true,
    is_active: true,
    decimal_places: 0,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Count',
    base_unit_symbol: 'pc'
  }
];

const allMockUnits = [...mockDesiUnits, ...mockOtherUnits];

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

describe('Desi Units Verification', () => {
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

  describe('Required Desi Units Availability', () => {
    // **Validates: Requirements 11.1**
    it('should have Tola unit available in unit selector', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const tolaUnit = result.current.findUnitBySymbol('tola');
      expect(tolaUnit).toBeDefined();
      expect(tolaUnit!.name).toBe('Tola');
      expect(tolaUnit!.unit_type).toBe('Desi');
      expect(tolaUnit!.category_name).toBe('Weight');
    });

    // **Validates: Requirements 11.1**
    it('should have Seer unit available in unit selector', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const seerUnit = result.current.findUnitBySymbol('seer');
      expect(seerUnit).toBeDefined();
      expect(seerUnit!.name).toBe('Seer');
      expect(seerUnit!.unit_type).toBe('Desi');
      expect(seerUnit!.category_name).toBe('Weight');
    });

    // **Validates: Requirements 11.1**
    it('should have Maund unit available in unit selector', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const maundUnit = result.current.findUnitBySymbol('mun');
      expect(maundUnit).toBeDefined();
      expect(maundUnit!.name).toBe('Maund');
      expect(maundUnit!.unit_type).toBe('Desi');
      expect(maundUnit!.category_name).toBe('Weight');
    });

    // **Validates: Requirements 11.1**
    it('should have Bigha unit available in unit selector', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const bighaUnit = result.current.findUnitBySymbol('bigha');
      expect(bighaUnit).toBeDefined();
      expect(bighaUnit!.name).toBe('Bigha (Standard)');
      expect(bighaUnit!.unit_type).toBe('Desi');
      expect(bighaUnit!.category_name).toBe('Area');
    });

    // **Validates: Requirements 11.1**
    it('should have Lakh unit available in unit selector', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const lakhUnit = result.current.findUnitBySymbol('lakh');
      expect(lakhUnit).toBeDefined();
      expect(lakhUnit!.name).toBe('Lakh');
      expect(lakhUnit!.unit_type).toBe('Desi');
      expect(lakhUnit!.category_name).toBe('Count');
    });

    // **Validates: Requirements 11.1**
    it('should have Crore unit available in unit selector', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const croreUnit = result.current.findUnitBySymbol('crore');
      expect(croreUnit).toBeDefined();
      expect(croreUnit!.name).toBe('Crore');
      expect(croreUnit!.unit_type).toBe('Desi');
      expect(croreUnit!.category_name).toBe('Count');
    });

    // **Validates: Requirements 11.1**
    it('should have all required Desi units available', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const requiredDesiUnits = ['tola', 'seer', 'mun', 'bigha', 'lakh', 'crore'];
      const availableUnits = result.current.searchUnits('');
      
      for (const symbol of requiredDesiUnits) {
        const unit = availableUnits.find(u => u.symbol === symbol);
        expect(unit).toBeDefined();
        expect(unit!.unit_type).toBe('Desi');
      }
    });
  });

  describe('Desi Unit Type Display', () => {
    // **Validates: Requirements 11.5**
    it('should show correct unit_type for all Desi units', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const desiUnits = result.current.getUnitsByType('Desi');
      expect(desiUnits.length).toBeGreaterThanOrEqual(6);
      
      desiUnits.forEach(unit => {
        expect(unit.unit_type).toBe('Desi');
        expect(unit.region).toMatch(/South Asia|Dhaka|Chittagong|Sylhet|Rajshahi|Khulna|Barishal/);
      });
    });

    // **Validates: Requirements 11.5**
    it('should filter units by Desi type correctly', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const desiUnits = result.current.searchUnitsByType('Desi', '');
      expect(desiUnits.length).toBeGreaterThanOrEqual(6);
      
      // Should include all our test Desi units
      const unitNames = desiUnits.map(u => u.name);
      expect(unitNames).toContain('Tola');
      expect(unitNames).toContain('Seer');
      expect(unitNames).toContain('Maund');
      expect(unitNames).toContain('Bigha (Standard)');
      expect(unitNames).toContain('Lakh');
      expect(unitNames).toContain('Crore');
    });
  });

  describe('Desi Units in Appropriate Categories', () => {
    // **Validates: Requirements 11.1**
    it('should have weight Desi units in Weight category', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const weightUnits = result.current.getUnitsByCategory('Weight');
      const weightDesiUnits = weightUnits.filter(u => u.unit_type === 'Desi');
      
      expect(weightDesiUnits.length).toBeGreaterThanOrEqual(3);
      
      const unitNames = weightDesiUnits.map(u => u.name);
      expect(unitNames).toContain('Tola');
      expect(unitNames).toContain('Seer');
      expect(unitNames).toContain('Maund');
    });

    // **Validates: Requirements 11.1**
    it('should have area Desi units in Area category', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const areaUnits = result.current.getUnitsByCategory('Area');
      const areaDesiUnits = areaUnits.filter(u => u.unit_type === 'Desi');
      
      expect(areaDesiUnits.length).toBeGreaterThanOrEqual(1);
      
      const unitNames = areaDesiUnits.map(u => u.name);
      expect(unitNames).toContain('Bigha (Standard)');
    });

    // **Validates: Requirements 11.1**
    it('should have count Desi units in Count category', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const countUnits = result.current.getUnitsByCategory('Count');
      const countDesiUnits = countUnits.filter(u => u.unit_type === 'Desi');
      
      expect(countDesiUnits.length).toBeGreaterThanOrEqual(2);
      
      const unitNames = countDesiUnits.map(u => u.name);
      expect(unitNames).toContain('Lakh');
      expect(unitNames).toContain('Crore');
    });
  });

  describe('Desi Unit Conversion Factors', () => {
    // **Validates: Requirements 11.1**
    it('should have correct conversion factors for weight Desi units', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const tolaUnit = result.current.findUnitBySymbol('tola');
      const seerUnit = result.current.findUnitBySymbol('seer');
      const maundUnit = result.current.findUnitBySymbol('mun');

      expect(tolaUnit!.to_base_factor).toBe(0.011664); // 11.664 grams
      expect(seerUnit!.to_base_factor).toBe(0.933); // 933 grams
      expect(maundUnit!.to_base_factor).toBe(37.32); // 37.32 kg
    });

    // **Validates: Requirements 11.1**
    it('should have correct conversion factors for count Desi units', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const lakhUnit = result.current.findUnitBySymbol('lakh');
      const croreUnit = result.current.findUnitBySymbol('crore');

      expect(lakhUnit!.to_base_factor).toBe(100000); // 1 lakh = 100,000
      expect(croreUnit!.to_base_factor).toBe(10000000); // 1 crore = 10,000,000
    });

    // **Validates: Requirements 11.1**
    it('should verify Seer to Tola relationship (80 tola = 1 seer)', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const tolaUnit = result.current.findUnitBySymbol('tola');
      const seerUnit = result.current.findUnitBySymbol('seer');

      // 1 seer should equal 80 tola
      const seerToTolaRatio = seerUnit!.to_base_factor / tolaUnit!.to_base_factor;
      expect(Math.round(seerToTolaRatio)).toBe(80);
    });

    // **Validates: Requirements 11.1**
    it('should verify Maund to Seer relationship (40 seer = 1 maund)', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const seerUnit = result.current.findUnitBySymbol('seer');
      const maundUnit = result.current.findUnitBySymbol('mun');

      // 1 maund should equal 40 seer
      const maundToSeerRatio = maundUnit!.to_base_factor / seerUnit!.to_base_factor;
      expect(Math.round(maundToSeerRatio)).toBe(40);
    });

    // **Validates: Requirements 11.1**
    it('should verify Crore to Lakh relationship (100 lakh = 1 crore)', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const lakhUnit = result.current.findUnitBySymbol('lakh');
      const croreUnit = result.current.findUnitBySymbol('crore');

      // 1 crore should equal 100 lakh
      const croreToLakhRatio = croreUnit!.to_base_factor / lakhUnit!.to_base_factor;
      expect(croreToLakhRatio).toBe(100);
    });
  });

  describe('Desi Unit Search and Filtering', () => {
    // **Validates: Requirements 11.1**
    it('should find Desi units by name search', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResults = result.current.searchUnits('tola');
      expect(searchResults.length).toBeGreaterThanOrEqual(1);
      expect(searchResults[0].name).toBe('Tola');
      expect(searchResults[0].unit_type).toBe('Desi');
    });

    // **Validates: Requirements 11.1**
    it('should find Desi units by alternate names', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Search for 'lac' which is alternate name for 'lakh'
      const searchResults = result.current.searchUnits('lac');
      expect(searchResults.length).toBeGreaterThanOrEqual(1);
      
      const lakhUnit = searchResults.find(u => u.symbol === 'lakh');
      expect(lakhUnit).toBeDefined();
      expect(lakhUnit!.alternate_names).toContain('lac');
    });

    // **Validates: Requirements 11.1**
    it('should filter Desi units within specific categories', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const weightDesiUnits = result.current.searchUnitsByCategory('Weight', '');
      const desiWeightUnits = weightDesiUnits.filter(u => u.unit_type === 'Desi');
      
      expect(desiWeightUnits.length).toBeGreaterThanOrEqual(3);
      desiWeightUnits.forEach(unit => {
        expect(unit.category_name).toBe('Weight');
        expect(unit.unit_type).toBe('Desi');
      });
    });
  });

  describe('Property-Based Tests for Desi Units', () => {
    // Feature: unit-conversion-integration, Property 1: Desi Unit Availability
    it('should always find required Desi units regardless of search case', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('tola', 'seer', 'mun', 'bigha', 'lakh', 'crore'),
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
            expect(unit!.unit_type).toBe('Desi');
          }
        ),
        { numRuns: 30 }
      );
    });

    // Feature: unit-conversion-integration, Property 2: Desi Unit Type Consistency
    it('should always return Desi type for all Desi units', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...mockDesiUnits.map(u => u.id)),
          async (unitId) => {
            const wrapper = createWrapper();
            const { result } = renderHook(() => useUnitSearch(), { wrapper });

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            const unit = result.current.findUnitById(unitId);
            expect(unit).toBeDefined();
            expect(unit!.unit_type).toBe('Desi');
            expect(unit!.region).toMatch(/South Asia|Dhaka|Chittagong|Sylhet|Rajshahi|Khulna|Barishal/);
          }
        ),
        { numRuns: 20 }
      );
    });

    // Feature: unit-conversion-integration, Property 3: Desi Unit Conversion Factor Validity
    it('should have positive conversion factors for all Desi units', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...mockDesiUnits.map(u => u.id)),
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
        { numRuns: 20 }
      );
    });
  });
});