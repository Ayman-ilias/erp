/**
 * Unit Search Hook Tests
 * 
 * Tests for the useUnitSearch hook that provides local filtering
 * of units by name, symbol, and category without API calls.
 * 
 * **Validates: Requirements 3.2, 14.2**
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import * as React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useUnitSearch, UnitWithCategory, UnitTypeEnum } from '@/hooks/use-units';
import { useAuth } from '@/lib/auth-context';
import { unitService } from '@/services/api';

// Mock dependencies
vi.mock('@/lib/auth-context');
vi.mock('@/services/api');

const mockUseAuth = vi.mocked(useAuth);
const mockUnitService = vi.mocked(unitService);

// Test data
const mockUnits: UnitWithCategory[] = [
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
    id: 2,
    category_id: 1,
    name: 'Gram',
    symbol: 'g',
    description: 'Metric unit of mass',
    unit_type: 'SI',
    region: 'International',
    to_base_factor: 0.001,
    alternate_names: 'gm',
    is_base: false,
    is_active: true,
    decimal_places: 2,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Weight',
    base_unit_symbol: 'kg'
  },
  {
    id: 3,
    category_id: 1,
    name: 'Tola',
    symbol: 'tola',
    description: 'Traditional Desi unit of weight',
    unit_type: 'Desi',
    region: 'South Asia',
    to_base_factor: 0.01166,
    alternate_names: 'tola',
    is_base: false,
    is_active: true,
    decimal_places: 3,
    sort_order: 3,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Weight',
    base_unit_symbol: 'kg'
  },
  {
    id: 4,
    category_id: 2,
    name: 'Meter',
    symbol: 'm',
    description: 'Base unit of length',
    unit_type: 'SI',
    region: 'International',
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
  {
    id: 5,
    category_id: 2,
    name: 'Centimeter',
    symbol: 'cm',
    description: 'Metric unit of length',
    unit_type: 'SI',
    region: 'International',
    to_base_factor: 0.01,
    alternate_names: 'centimetre',
    is_base: false,
    is_active: true,
    decimal_places: 2,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Length',
    base_unit_symbol: 'm'
  },
  {
    id: 6,
    category_id: 3,
    name: 'GSM',
    symbol: 'g/m²',
    description: 'Grams per square meter',
    unit_type: 'Textile',
    region: 'International',
    to_base_factor: 1,
    alternate_names: 'gsm',
    is_base: true,
    is_active: true,
    decimal_places: 0,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    category_name: 'Textile - Fabric Weight',
    base_unit_symbol: 'g/m²'
  }
];

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

describe('useUnitSearch', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    mockUnitService.getAll.mockResolvedValue(mockUnits);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('searchUnits', () => {
    it('should return all units when no search query provided', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnits('');
      expect(searchResult).toHaveLength(6);
      expect(searchResult[0].category_name).toBe('Length'); // Sorted by category
    });

    it('should filter units by name (case-insensitive)', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnits('kilo');
      expect(searchResult).toHaveLength(1);
      expect(searchResult[0].name).toBe('Kilogram');
    });

    it('should filter units by symbol (case-insensitive)', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnits('KG');
      expect(searchResult).toHaveLength(1);
      expect(searchResult[0].symbol).toBe('kg');
    });

    it('should filter units by category name (case-insensitive)', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnits('weight');
      expect(searchResult.length).toBeGreaterThanOrEqual(3); // At least the 3 Weight category units
      // Should include units from Weight category and possibly others with "weight" in description
      const weightCategoryUnits = searchResult.filter(unit => unit.category_name === 'Weight');
      expect(weightCategoryUnits).toHaveLength(3);
    });

    it('should filter units by alternate names', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnits('metre');
      expect(searchResult).toHaveLength(2); // Meter and Centimeter both have 'metre' in alternate names
    });

    it('should apply category filter', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnits('', 'Weight');
      expect(searchResult).toHaveLength(3);
      expect(searchResult.every(unit => unit.category_name === 'Weight')).toBe(true);
    });

    it('should apply unit type filter', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnits('', undefined, 'Desi');
      expect(searchResult).toHaveLength(1);
      expect(searchResult[0].unit_type).toBe('Desi');
      expect(searchResult[0].name).toBe('Tola');
    });

    it('should combine search query with category filter', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnits('g', 'Weight');
      expect(searchResult.length).toBeGreaterThanOrEqual(2); // At least Kilogram and Gram
      expect(searchResult.every(unit => unit.category_name === 'Weight')).toBe(true);
      // Should include units that contain 'g' in name, symbol, or alternate names
      const expectedUnits = searchResult.filter(unit => 
        unit.name.toLowerCase().includes('g') || 
        unit.symbol.toLowerCase().includes('g') ||
        unit.alternate_names?.toLowerCase().includes('g')
      );
      expect(expectedUnits.length).toBeGreaterThanOrEqual(2);
    });

    it('should sort results by relevance (exact matches first)', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnits('g');
      // Should prioritize exact symbol match 'g' (Gram) over partial matches
      expect(searchResult[0].symbol).toBe('g');
      expect(searchResult[0].name).toBe('Gram');
    });
  });

  describe('searchUnitsByCategory', () => {
    it('should filter units by category and search query', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnitsByCategory('Weight', 'gram');
      expect(searchResult).toHaveLength(2); // Kilogram and Gram
      expect(searchResult.every(unit => unit.category_name === 'Weight')).toBe(true);
    });
  });

  describe('searchUnitsByType', () => {
    it('should filter units by type and search query', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResult = result.current.searchUnitsByType('SI', 'm');
      expect(searchResult.length).toBeGreaterThanOrEqual(2); // At least Meter and Centimeter
      expect(searchResult.every(unit => unit.unit_type === 'SI')).toBe(true);
      // Should include units that contain 'm' in name, symbol, or alternate names
      const expectedUnits = searchResult.filter(unit => 
        unit.name.toLowerCase().includes('m') || 
        unit.symbol.toLowerCase().includes('m') ||
        unit.alternate_names?.toLowerCase().includes('m')
      );
      expect(expectedUnits.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getUnitsByCategory', () => {
    it('should return all units in a category', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const categoryUnits = result.current.getUnitsByCategory('Weight');
      expect(categoryUnits).toHaveLength(3);
      expect(categoryUnits.every(unit => unit.category_name === 'Weight')).toBe(true);
      // Should be sorted by sort_order
      expect(categoryUnits[0].sort_order).toBeLessThanOrEqual(categoryUnits[1].sort_order!);
    });

    it('should handle case-insensitive category names', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const categoryUnits = result.current.getUnitsByCategory('WEIGHT');
      expect(categoryUnits).toHaveLength(3);
    });
  });

  describe('getUnitsByType', () => {
    it('should return all units of a specific type', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const typeUnits = result.current.getUnitsByType('SI');
      expect(typeUnits).toHaveLength(4); // kg, g, m, cm
      expect(typeUnits.every(unit => unit.unit_type === 'SI')).toBe(true);
    });
  });

  describe('findUnitById', () => {
    it('should find unit by ID', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const unit = result.current.findUnitById(3);
      expect(unit).toBeDefined();
      expect(unit!.name).toBe('Tola');
    });

    it('should return undefined for non-existent ID', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const unit = result.current.findUnitById(999);
      expect(unit).toBeUndefined();
    });
  });

  describe('findUnitBySymbol', () => {
    it('should find unit by symbol (case-insensitive)', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const unit = result.current.findUnitBySymbol('KG');
      expect(unit).toBeDefined();
      expect(unit!.name).toBe('Kilogram');
    });

    it('should find unit by symbol within category', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const unit = result.current.findUnitBySymbol('m', 'Length');
      expect(unit).toBeDefined();
      expect(unit!.name).toBe('Meter');
    });

    it('should return undefined for non-existent symbol', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const unit = result.current.findUnitBySymbol('xyz');
      expect(unit).toBeUndefined();
    });
  });

  describe('computed properties', () => {
    it('should provide total units count', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalUnits).toBe(6);
    });

    it('should provide unique categories list', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual([
        'Length',
        'Textile - Fabric Weight',
        'Weight'
      ]);
    });

    it('should provide unique unit types list', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.unitTypes).toEqual(['Desi', 'SI', 'Textile']);
    });
  });

  describe('no API calls requirement', () => {
    it('should not make additional API calls during search operations', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear the initial API call
      vi.clearAllMocks();

      // Perform multiple search operations
      result.current.searchUnits('test');
      result.current.searchUnitsByCategory('Weight', 'kg');
      result.current.getUnitsByType('SI');
      result.current.findUnitById(1);
      result.current.findUnitBySymbol('g');

      // Should not have made any additional API calls
      expect(mockUnitService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('empty data handling', () => {
    it('should handle empty units array gracefully', async () => {
      mockUnitService.getAll.mockResolvedValue([]);
      
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitSearch(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.searchUnits('test')).toEqual([]);
      expect(result.current.getUnitsByCategory('Weight')).toEqual([]);
      expect(result.current.findUnitById(1)).toBeUndefined();
      expect(result.current.totalUnits).toBe(0);
      expect(result.current.categories).toEqual([]);
    });
  });
});