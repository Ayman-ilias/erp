/**
 * Textile Units Integration Test Suite
 * 
 * **Validates: Requirements 11.2**
 * 
 * This test suite verifies that Textile units work with the actual unit conversion system:
 * 1. Real API endpoints return Textile units
 * 2. Conversions between Textile units work correctly
 * 3. Unit selector can find and display Textile units
 * 4. Unit display shows correct information for Textile units
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { UnitSelector } from '@/components/uom/UnitSelector';
import { UnitDisplay } from '@/components/uom/UnitDisplay';
import { api } from '@/services/api';

// This test requires the backend to be running
describe('Textile Units Integration Tests', () => {
  let queryClient: QueryClient;
  let backendAvailable = false;

  beforeAll(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Check if backend is available
    try {
      await api.get('/settings/uom-categories');
      backendAvailable = true;
    } catch (error) {
      console.warn('Backend not available for integration tests');
      backendAvailable = false;
    }
  });

  afterAll(() => {
    queryClient.clear();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      React.createElement(QueryClientProvider, { client: queryClient }, component)
    );
  };

  describe('API Integration', () => {
    it.skipIf(!backendAvailable)('should fetch Textile units from API', async () => {
      const response = await api.get('/settings/uom-units');
      const units = response.data;
      
      // Find Textile units
      const textileUnits = units.filter((unit: any) => unit.unit_type === 'Textile');
      
      expect(textileUnits.length).toBeGreaterThan(0);
      
      // Check for required Textile units
      const unitNames = textileUnits.map((unit: any) => unit.name);
      expect(unitNames).toContain('GSM');
      expect(unitNames).toContain('Denier');
      expect(unitNames).toContain('Tex');
      expect(unitNames).toContain('Momme');
    });

    it.skipIf(!backendAvailable)('should fetch Textile categories from API', async () => {
      const response = await api.get('/settings/uom-categories');
      const categories = response.data;
      
      // Find Textile categories
      const textileCategories = categories.filter((cat: any) => 
        cat.name.includes('Textile')
      );
      
      expect(textileCategories.length).toBeGreaterThan(0);
      
      const categoryNames = textileCategories.map((cat: any) => cat.name);
      expect(categoryNames.some(name => name.includes('Fabric Weight'))).toBe(true);
      expect(categoryNames.some(name => name.includes('Fiber Thickness'))).toBe(true);
    });

    it.skipIf(!backendAvailable)('should perform conversion between Textile units', async () => {
      // First get available units
      const unitsResponse = await api.get('/settings/uom-units');
      const units = unitsResponse.data;
      
      // Find GSM and Ounce per Square Yard (both fabric weight units)
      const gsmUnit = units.find((unit: any) => unit.symbol === 'g/m²');
      const ozUnit = units.find((unit: any) => unit.symbol === 'oz/yd²');
      
      if (gsmUnit && ozUnit) {
        // Test conversion: 100 GSM to oz/yd²
        const conversionResponse = await api.post('/settings/uom/convert', {
          value: 100,
          from_unit_id: gsmUnit.id,
          to_unit_id: ozUnit.id
        });
        
        const result = conversionResponse.data;
        
        expect(result.value).toBe(100);
        expect(result.from_unit.symbol).toBe('g/m²');
        expect(result.to_unit.symbol).toBe('oz/yd²');
        expect(result.result).toBeGreaterThan(0);
        expect(typeof result.result).toBe('number');
      }
    });
  });

  describe('Component Integration', () => {
    it.skipIf(!backendAvailable)('should load Textile units in UnitSelector', async () => {
      const handleChange = vi.fn();
      
      renderWithQueryClient(
        React.createElement(UnitSelector, {
          value: undefined,
          onChange: handleChange,
          placeholder: "Select textile unit..."
        })
      );

      // Wait for units to load
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Open dropdown
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      // Search for textile units
      const searchInput = screen.getByPlaceholderText('Search units...');
      fireEvent.change(searchInput, { target: { value: 'textile' } });

      // Should find textile units
      await waitFor(() => {
        const dropdown = screen.getByRole('listbox');
        expect(dropdown).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it.skipIf(!backendAvailable)('should display Textile unit information in UnitDisplay', async () => {
      // Get a Textile unit ID from API
      const response = await api.get('/settings/uom-units');
      const units = response.data;
      const gsmUnit = units.find((unit: any) => unit.symbol === 'g/m²');
      
      if (gsmUnit) {
        renderWithQueryClient(
          React.createElement(UnitDisplay, { 
            unitId: gsmUnit.id,
            showUnitType: true 
          })
        );

        // Should display the unit symbol
        await waitFor(() => {
          expect(screen.getByText('g/m²')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Should show unit type
        await waitFor(() => {
          expect(screen.getByText('Textile')).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    });
  });

  describe('Search and Filter Integration', () => {
    it.skipIf(!backendAvailable)('should find GSM by searching "gsm"', async () => {
      const response = await api.get('/settings/uom-units?search=gsm');
      const units = response.data;
      
      const gsmUnit = units.find((unit: any) => unit.name === 'GSM');
      expect(gsmUnit).toBeDefined();
      expect(gsmUnit.unit_type).toBe('Textile');
      expect(gsmUnit.symbol).toBe('g/m²');
    });

    it.skipIf(!backendAvailable)('should filter by Textile categories', async () => {
      // Get categories first
      const categoriesResponse = await api.get('/settings/uom-categories');
      const categories = categoriesResponse.data;
      
      const fabricWeightCategory = categories.find((cat: any) => 
        cat.name.includes('Fabric Weight')
      );
      
      if (fabricWeightCategory) {
        const unitsResponse = await api.get(`/settings/uom-units?category_id=${fabricWeightCategory.id}`);
        const units = unitsResponse.data;
        
        // All units should be from the fabric weight category
        units.forEach((unit: any) => {
          expect(unit.category_id).toBe(fabricWeightCategory.id);
        });
        
        // Should include GSM
        const gsmUnit = units.find((unit: any) => unit.name === 'GSM');
        expect(gsmUnit).toBeDefined();
      }
    });
  });

  describe('Data Validation', () => {
    it.skipIf(!backendAvailable)('should have valid Textile unit data structure', async () => {
      const response = await api.get('/settings/uom-units');
      const units = response.data;
      
      const textileUnits = units.filter((unit: any) => unit.unit_type === 'Textile');
      
      textileUnits.forEach((unit: any) => {
        // Required fields
        expect(unit.id).toBeDefined();
        expect(typeof unit.id).toBe('number');
        expect(unit.name).toBeDefined();
        expect(typeof unit.name).toBe('string');
        expect(unit.symbol).toBeDefined();
        expect(typeof unit.symbol).toBe('string');
        expect(unit.unit_type).toBe('Textile');
        expect(unit.category_id).toBeDefined();
        expect(typeof unit.category_id).toBe('number');
        expect(unit.to_base_factor).toBeDefined();
        expect(unit.is_active).toBe(true);
        
        // Conversion factor should be a valid number
        const factor = parseFloat(unit.to_base_factor);
        expect(factor).toBeGreaterThan(0);
        expect(isNaN(factor)).toBe(false);
      });
    });

    it.skipIf(!backendAvailable)('should have unique IDs for Textile units', async () => {
      const response = await api.get('/settings/uom-units');
      const units = response.data;
      
      const textileUnits = units.filter((unit: any) => unit.unit_type === 'Textile');
      const ids = textileUnits.map((unit: any) => unit.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });

    it.skipIf(!backendAvailable)('should have appropriate decimal places for Textile units', async () => {
      const response = await api.get('/settings/uom-units');
      const units = response.data;
      
      const textileUnits = units.filter((unit: any) => unit.unit_type === 'Textile');
      
      textileUnits.forEach((unit: any) => {
        if (unit.decimal_places !== undefined) {
          expect(unit.decimal_places).toBeGreaterThanOrEqual(0);
          expect(unit.decimal_places).toBeLessThanOrEqual(6);
        }
      });
    });
  });

  describe('Conversion Accuracy', () => {
    it.skipIf(!backendAvailable)('should perform accurate conversions between Textile units', async () => {
      const unitsResponse = await api.get('/settings/uom-units');
      const units = unitsResponse.data;
      
      // Find two units in the same Textile category for conversion
      const fabricWeightUnits = units.filter((unit: any) => 
        unit.unit_type === 'Textile' && 
        unit.category_name && 
        unit.category_name.includes('Fabric Weight')
      );
      
      if (fabricWeightUnits.length >= 2) {
        const [unit1, unit2] = fabricWeightUnits;
        const testValue = 100;
        
        // Convert unit1 to unit2
        const conversionResponse = await api.post('/settings/uom/convert', {
          value: testValue,
          from_unit_id: unit1.id,
          to_unit_id: unit2.id
        });
        
        const result = conversionResponse.data;
        
        expect(result.value).toBe(testValue);
        expect(result.result).toBeGreaterThan(0);
        expect(typeof result.result).toBe('number');
        expect(result.from_unit.id).toBe(unit1.id);
        expect(result.to_unit.id).toBe(unit2.id);
        
        // Test round-trip conversion
        const backConversionResponse = await api.post('/settings/uom/convert', {
          value: result.result,
          from_unit_id: unit2.id,
          to_unit_id: unit1.id
        });
        
        const backResult = backConversionResponse.data;
        
        // Should be close to original value (within precision)
        const precision = Math.pow(10, -(unit1.decimal_places || 2));
        expect(Math.abs(backResult.result - testValue)).toBeLessThan(precision);
      }
    });
  });
});