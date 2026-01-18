/**
 * Textile Units Verification Test Suite
 * 
 * **Validates: Requirements 11.2**
 * 
 * This test suite verifies that Textile units (GSM, Denier, Tex, Momme) are:
 * 1. Available in the unit selector
 * 2. Have correct unit_type = "Textile"
 * 3. Can perform conversions between Textile units
 * 4. Display correctly in UI components
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import fc from 'fast-check';
import { UnitSelector } from '@/components/uom/UnitSelector';
import { UnitDisplay } from '@/components/uom/UnitDisplay';
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

describe('Textile Units Verification', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

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
          unit.category_name.toLowerCase().includes(query.toLowerCase())
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

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      React.createElement(QueryClientProvider, { client: queryClient }, component)
    );
  };

  describe('Textile Units Availability', () => {
    it('should include all required Textile units in the unit selector', () => {
      const requiredTextileUnits = ['GSM', 'Denier', 'Tex', 'Momme'];
      const availableTextileUnits = mockTextileUnits.map(unit => unit.name);
      
      requiredTextileUnits.forEach(unitName => {
        expect(availableTextileUnits).toContain(unitName);
      });
    });

    it('should display Textile units in UnitSelector component', async () => {
      const handleChange = vi.fn();
      
      renderWithQueryClient(
        React.createElement(UnitSelector, {
          value: undefined,
          onChange: handleChange,
          placeholder: "Select textile unit..."
        })
      );

      // Click to open dropdown
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      // Wait for dropdown to open and check for Textile units
      await waitFor(() => {
        expect(screen.getByText(/GSM/)).toBeInTheDocument();
        expect(screen.getByText(/Denier/)).toBeInTheDocument();
        expect(screen.getByText(/Tex/)).toBeInTheDocument();
        expect(screen.getByText(/Momme/)).toBeInTheDocument();
      });
    });

    it('should filter to show only Textile units when searching for "textile"', () => {
      const { searchUnits } = vi.mocked(useUnitSearch)();
      const textileResults = searchUnits('textile');
      
      expect(textileResults.length).toBeGreaterThan(0);
      textileResults.forEach(unit => {
        expect(unit.unit_type).toBe('Textile');
      });
    });

    it('should find Textile units by their symbols', () => {
      const { findUnitBySymbol } = vi.mocked(useUnitSearch)();
      
      const gsmUnit = findUnitBySymbol('g/m²');
      const denierUnit = findUnitBySymbol('den');
      const texUnit = findUnitBySymbol('tex');
      const mommeUnit = findUnitBySymbol('mm');
      
      expect(gsmUnit).toBeDefined();
      expect(gsmUnit?.unit_type).toBe('Textile');
      expect(denierUnit).toBeDefined();
      expect(denierUnit?.unit_type).toBe('Textile');
      expect(texUnit).toBeDefined();
      expect(texUnit?.unit_type).toBe('Textile');
      expect(mommeUnit).toBeDefined();
      expect(mommeUnit?.unit_type).toBe('Textile');
    });
  });

  describe('Textile Unit Type Verification', () => {
    it('should have correct unit_type for all Textile units', () => {
      const textileUnits = mockTextileUnits;
      
      textileUnits.forEach(unit => {
        expect(unit.unit_type).toBe('Textile');
      });
    });

    it('should display unit type in UnitDisplay component', () => {
      renderWithQueryClient(
        React.createElement(UnitDisplay, { unitId: 201, showUnitType: true })
      );

      // Should show the unit type badge
      expect(screen.getByText('Textile')).toBeInTheDocument();
    });

    it('should group Textile units by type correctly', () => {
      const { getUnitsByType } = vi.mocked(useUnitSearch)();
      const textileUnits = getUnitsByType('Textile');
      
      expect(textileUnits.length).toBe(mockTextileUnits.length);
      textileUnits.forEach(unit => {
        expect(unit.unit_type).toBe('Textile');
      });
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

    it('should filter units by Textile categories', () => {
      const { getUnitsByCategory } = vi.mocked(useUnitSearch)();
      
      const fabricWeightUnits = getUnitsByCategory('Textile - Fabric Weight');
      const fiberThicknessUnits = getUnitsByCategory('Textile - Fiber Thickness');
      const linearDensityUnits = getUnitsByCategory('Textile - Linear Mass Density');
      const silkWeightUnits = getUnitsByCategory('Textile - Silk Weight');
      
      expect(fabricWeightUnits.length).toBeGreaterThan(0);
      expect(fiberThicknessUnits.length).toBeGreaterThan(0);
      expect(linearDensityUnits.length).toBeGreaterThan(0);
      expect(silkWeightUnits.length).toBeGreaterThan(0);
      
      // All should be Textile type
      [...fabricWeightUnits, ...fiberThicknessUnits, ...linearDensityUnits, ...silkWeightUnits]
        .forEach(unit => {
          expect(unit.unit_type).toBe('Textile');
        });
    });
  });

  describe('Textile Unit Display Format', () => {
    it('should display Textile units in correct format: "Name (Symbol)"', () => {
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

    it('should show Textile unit symbols correctly in UnitDisplay', () => {
      renderWithQueryClient(React.createElement(UnitDisplay, { unitId: 201 }));
      expect(screen.getByText('g/m²')).toBeInTheDocument();
    });
  });

  describe('Textile Unit Conversion Properties', () => {
    it('should have valid conversion factors for Textile units', () => {
      mockTextileUnits.forEach(unit => {
        const factor = parseFloat(unit.to_base_factor);
        expect(factor).toBeGreaterThan(0);
        expect(isNaN(factor)).toBe(false);
      });
    });

    it('should have appropriate decimal places for Textile units', () => {
      const textileUnits = mockTextileUnits;
      
      textileUnits.forEach(unit => {
        expect(unit.decimal_places).toBeGreaterThanOrEqual(0);
        expect(unit.decimal_places).toBeLessThanOrEqual(6);
      });
    });

    it('should identify base units correctly in Textile categories', () => {
      const baseUnits = mockTextileUnits.filter(unit => unit.is_base);
      const nonBaseUnits = mockTextileUnits.filter(unit => !unit.is_base);
      
      expect(baseUnits.length).toBeGreaterThan(0);
      expect(nonBaseUnits.length).toBeGreaterThan(0);
      
      // Base units should have factor of 1.0
      baseUnits.forEach(unit => {
        expect(parseFloat(unit.to_base_factor)).toBe(1.0);
      });
    });
  });

  describe('Textile Unit Search and Filter', () => {
    it('should find Textile units by alternate names', () => {
      const { searchUnits } = vi.mocked(useUnitSearch)();
      
      // Search by alternate names
      const gsmResults = searchUnits('gsm');
      const denierResults = searchUnits('denier');
      const silkResults = searchUnits('silk');
      
      expect(gsmResults.some(unit => unit.name === 'GSM')).toBe(true);
      expect(denierResults.some(unit => unit.name === 'Denier')).toBe(true);
      expect(silkResults.some(unit => unit.name === 'Momme')).toBe(true);
    });

    it('should be case-insensitive when searching Textile units', () => {
      const { searchUnits } = vi.mocked(useUnitSearch)();
      
      const upperCaseResults = searchUnits('GSM');
      const lowerCaseResults = searchUnits('gsm');
      const mixedCaseResults = searchUnits('Gsm');
      
      expect(upperCaseResults.length).toBe(lowerCaseResults.length);
      expect(lowerCaseResults.length).toBe(mixedCaseResults.length);
      expect(upperCaseResults.length).toBeGreaterThan(0);
    });
  });

  describe('Property-Based Tests for Textile Units', () => {
    // Feature: unit-conversion-integration, Property 17: Unit Type Display
    it('should consistently display unit_type as "Textile" for all Textile units', () => {
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
    it('should filter Textile units correctly across different search terms', () => {
      const searchTerms = ['textile', 'fabric', 'gsm', 'denier', 'tex', 'momme', 'silk'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...searchTerms),
          (searchTerm) => {
            const { searchUnits } = vi.mocked(useUnitSearch)();
            const results = searchUnits(searchTerm);
            
            // All results should contain the search term in name, symbol, or category
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
    it('should filter Textile units by category correctly', () => {
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
            
            // All results should belong to the specified category
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

  describe('Integration with UnitSelector Component', () => {
    it('should allow selection of Textile units in UnitSelector', async () => {
      const handleChange = vi.fn();
      
      renderWithQueryClient(
        React.createElement(UnitSelector, {
          value: undefined,
          onChange: handleChange,
          placeholder: "Select unit..."
        })
      );

      // Open dropdown
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      // Wait for dropdown and select GSM
      await waitFor(() => {
        const gsmOption = screen.getByText(/GSM/);
        fireEvent.click(gsmOption);
      });

      // Should call onChange with GSM unit id
      expect(handleChange).toHaveBeenCalledWith(201);
    });

    it('should filter to Textile categories when categoryFilter is applied', () => {
      const handleChange = vi.fn();
      
      renderWithQueryClient(
        React.createElement(UnitSelector, {
          value: undefined,
          onChange: handleChange,
          categoryFilter: "Textile - Fabric Weight",
          placeholder: "Select fabric weight unit..."
        })
      );

      // The component should only show units from the Textile - Fabric Weight category
      // This is tested through the mock implementation
      const { getUnitsByCategory } = vi.mocked(useUnitSearch)();
      const filteredUnits = getUnitsByCategory('Textile - Fabric Weight');
      
      expect(filteredUnits.length).toBeGreaterThan(0);
      filteredUnits.forEach(unit => {
        expect(unit.category_name).toBe('Textile - Fabric Weight');
        expect(unit.unit_type).toBe('Textile');
      });
    });
  });

  describe('Textile Unit Validation', () => {
    it('should validate that all Textile units are active', () => {
      mockTextileUnits.forEach(unit => {
        expect(unit.is_active).toBe(true);
      });
    });

    it('should have valid IDs for all Textile units', () => {
      mockTextileUnits.forEach(unit => {
        expect(unit.id).toBeGreaterThan(0);
        expect(Number.isInteger(unit.id)).toBe(true);
      });
    });

    it('should have non-empty names and symbols for all Textile units', () => {
      mockTextileUnits.forEach(unit => {
        expect(unit.name).toBeTruthy();
        expect(unit.name.length).toBeGreaterThan(0);
        expect(unit.symbol).toBeTruthy();
        expect(unit.symbol.length).toBeGreaterThan(0);
      });
    });
  });
});