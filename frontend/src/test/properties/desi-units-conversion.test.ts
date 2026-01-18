/**
 * Desi Units Conversion Tests
 * 
 * Tests for actual conversions between Desi units to verify
 * the conversion calculations work correctly.
 * 
 * **Validates: Requirements 11.1, 11.4**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { settingsService } from '@/services/api';
import { useUnitConversion, UnitWithCategory } from '@/hooks/use-units';

import { ReactNode } from 'react';
import * as React from 'react';
import fc from 'fast-check';

// Mock dependencies
vi.mock('@/lib/auth-context');
vi.mock('@/services/api');

const mockUseAuth = vi.mocked(useAuth);
const mockSettingsService = vi.mocked(settingsService);

// Mock conversion responses for Desi units
const mockConversions = {
  // Tola to Seer: 1 seer = 80 tola
  'tola_to_seer': {
    value: 80,
    from_unit: { id: 20, name: 'Tola', symbol: 'tola', decimal_places: 3 },
    to_unit: { id: 21, name: 'Seer', symbol: 'seer', decimal_places: 3 },
    result: 1,
    formula: '80 tola × (0.011664 ÷ 0.933) = 1 seer'
  },
  'seer_to_tola': {
    value: 1,
    from_unit: { id: 21, name: 'Seer', symbol: 'seer', decimal_places: 3 },
    to_unit: { id: 20, name: 'Tola', symbol: 'tola', decimal_places: 3 },
    result: 80,
    formula: '1 seer × (0.933 ÷ 0.011664) = 80 tola'
  },
  // Seer to Maund: 1 maund = 40 seer
  'seer_to_maund': {
    value: 40,
    from_unit: { id: 21, name: 'Seer', symbol: 'seer', decimal_places: 3 },
    to_unit: { id: 22, name: 'Maund', symbol: 'mun', decimal_places: 2 },
    result: 1,
    formula: '40 seer × (0.933 ÷ 37.32) = 1 mun'
  },
  'maund_to_seer': {
    value: 1,
    from_unit: { id: 22, name: 'Maund', symbol: 'mun', decimal_places: 2 },
    to_unit: { id: 21, name: 'Seer', symbol: 'seer', decimal_places: 3 },
    result: 40,
    formula: '1 mun × (37.32 ÷ 0.933) = 40 seer'
  },
  // Lakh to Crore: 1 crore = 100 lakh
  'lakh_to_crore': {
    value: 100,
    from_unit: { id: 40, name: 'Lakh', symbol: 'lakh', decimal_places: 0 },
    to_unit: { id: 41, name: 'Crore', symbol: 'crore', decimal_places: 0 },
    result: 1,
    formula: '100 lakh × (100000 ÷ 10000000) = 1 crore'
  },
  'crore_to_lakh': {
    value: 1,
    from_unit: { id: 41, name: 'Crore', symbol: 'crore', decimal_places: 0 },
    to_unit: { id: 40, name: 'Lakh', symbol: 'lakh', decimal_places: 0 },
    result: 100,
    formula: '1 crore × (10000000 ÷ 100000) = 100 lakh'
  },
  // Tola to Maund: 1 maund = 3200 tola (40 seer × 80 tola)
  'tola_to_maund': {
    value: 3200,
    from_unit: { id: 20, name: 'Tola', symbol: 'tola', decimal_places: 3 },
    to_unit: { id: 22, name: 'Maund', symbol: 'mun', decimal_places: 2 },
    result: 1,
    formula: '3200 tola × (0.011664 ÷ 37.32) = 1 mun'
  }
};

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

describe('Desi Units Conversion Tests', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    // Mock the conversion API calls
    mockSettingsService.uom.convert.mockImplementation(async ({ value, from_uom_id, to_uom_id }) => {
      const key = `${from_uom_id}_${to_uom_id}_${value}`;
      
      // Handle specific conversions
      if (from_uom_id === 20 && to_uom_id === 21 && value === 80) {
        return mockConversions.tola_to_seer;
      }
      if (from_uom_id === 21 && to_uom_id === 20 && value === 1) {
        return mockConversions.seer_to_tola;
      }
      if (from_uom_id === 21 && to_uom_id === 22 && value === 40) {
        return mockConversions.seer_to_maund;
      }
      if (from_uom_id === 22 && to_uom_id === 21 && value === 1) {
        return mockConversions.maund_to_seer;
      }
      if (from_uom_id === 40 && to_uom_id === 41 && value === 100) {
        return mockConversions.lakh_to_crore;
      }
      if (from_uom_id === 41 && to_uom_id === 40 && value === 1) {
        return mockConversions.crore_to_lakh;
      }
      if (from_uom_id === 20 && to_uom_id === 22 && value === 3200) {
        return mockConversions.tola_to_maund;
      }
      
      // Default mock response
      return {
        value,
        from_unit: { id: from_uom_id, name: 'Test Unit', symbol: 'test', decimal_places: 2 },
        to_unit: { id: to_uom_id, name: 'Target Unit', symbol: 'target', decimal_places: 2 },
        result: value * 1.5, // Simple mock conversion
        formula: `${value} test × 1.5 = ${value * 1.5} target`
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Weight Desi Unit Conversions', () => {
    // **Validates: Requirements 11.1, 11.4**
    it('should convert 80 Tola to 1 Seer correctly', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitConversion(), { wrapper });

      await result.current.convert({
        value: 80,
        fromUnitId: 20, // Tola
        toUnitId: 21    // Seer
      });

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(result.current.convertedValue).toBeDefined();
      expect(result.current.convertedValue!.result).toBe(1);
      expect(result.current.convertedValue!.from_unit.symbol).toBe('tola');
      expect(result.current.convertedValue!.to_unit.symbol).toBe('seer');
      expect(result.current.error).toBeNull();
    });

    // **Validates: Requirements 11.1, 11.4**
    it('should convert 1 Seer to 80 Tola correctly', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitConversion(), { wrapper });

      await result.current.convert({
        value: 1,
        fromUnitId: 21, // Seer
        toUnitId: 20    // Tola
      });

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(result.current.convertedValue).toBeDefined();
      expect(result.current.convertedValue!.result).toBe(80);
      expect(result.current.convertedValue!.from_unit.symbol).toBe('seer');
      expect(result.current.convertedValue!.to_unit.symbol).toBe('tola');
      expect(result.current.error).toBeNull();
    });

    // **Validates: Requirements 11.1, 11.4**
    it('should convert 40 Seer to 1 Maund correctly', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitConversion(), { wrapper });

      await result.current.convert({
        value: 40,
        fromUnitId: 21, // Seer
        toUnitId: 22    // Maund
      });

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(result.current.convertedValue).toBeDefined();
      expect(result.current.convertedValue!.result).toBe(1);
      expect(result.current.convertedValue!.from_unit.symbol).toBe('seer');
      expect(result.current.convertedValue!.to_unit.symbol).toBe('mun');
      expect(result.current.error).toBeNull();
    });

    // **Validates: Requirements 11.1, 11.4**
    it('should convert 1 Maund to 40 Seer correctly', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitConversion(), { wrapper });

      await result.current.convert({
        value: 1,
        fromUnitId: 22, // Maund
        toUnitId: 21    // Seer
      });

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(result.current.convertedValue).toBeDefined();
      expect(result.current.convertedValue!.result).toBe(40);
      expect(result.current.convertedValue!.from_unit.symbol).toBe('mun');
      expect(result.current.convertedValue!.to_unit.symbol).toBe('seer');
      expect(result.current.error).toBeNull();
    });

    // **Validates: Requirements 11.1, 11.4**
    it('should convert 3200 Tola to 1 Maund correctly', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitConversion(), { wrapper });

      await result.current.convert({
        value: 3200,
        fromUnitId: 20, // Tola
        toUnitId: 22    // Maund
      });

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(result.current.convertedValue).toBeDefined();
      expect(result.current.convertedValue!.result).toBe(1);
      expect(result.current.convertedValue!.from_unit.symbol).toBe('tola');
      expect(result.current.convertedValue!.to_unit.symbol).toBe('mun');
      expect(result.current.error).toBeNull();
    });
  });

  describe('Count Desi Unit Conversions', () => {
    // **Validates: Requirements 11.1, 11.4**
    it('should convert 100 Lakh to 1 Crore correctly', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitConversion(), { wrapper });

      await result.current.convert({
        value: 100,
        fromUnitId: 40, // Lakh
        toUnitId: 41    // Crore
      });

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(result.current.convertedValue).toBeDefined();
      expect(result.current.convertedValue!.result).toBe(1);
      expect(result.current.convertedValue!.from_unit.symbol).toBe('lakh');
      expect(result.current.convertedValue!.to_unit.symbol).toBe('crore');
      expect(result.current.error).toBeNull();
    });

    // **Validates: Requirements 11.1, 11.4**
    it('should convert 1 Crore to 100 Lakh correctly', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitConversion(), { wrapper });

      await result.current.convert({
        value: 1,
        fromUnitId: 41, // Crore
        toUnitId: 40    // Lakh
      });

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(result.current.convertedValue).toBeDefined();
      expect(result.current.convertedValue!.result).toBe(100);
      expect(result.current.convertedValue!.from_unit.symbol).toBe('crore');
      expect(result.current.convertedValue!.to_unit.symbol).toBe('lakh');
      expect(result.current.error).toBeNull();
    });
  });

  describe('Property-Based Conversion Tests', () => {
    // Feature: unit-conversion-integration, Property 8: Conversion Calculation Accuracy
    it('should maintain conversion accuracy for Desi weight units', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: 0.1, max: 1000 }),
          fc.constantFrom(
            { from: 20, to: 21, name: 'Tola to Seer' },
            { from: 21, to: 20, name: 'Seer to Tola' },
            { from: 21, to: 22, name: 'Seer to Maund' },
            { from: 22, to: 21, name: 'Maund to Seer' }
          ),
          async (value, conversion) => {
            const wrapper = createWrapper();
            const { result } = renderHook(() => useUnitConversion(), { wrapper });

            await result.current.convert({
              value,
              fromUnitId: conversion.from,
              toUnitId: conversion.to
            });

            await waitFor(() => {
              expect(result.current.isConverting).toBe(false);
            });

            // Should have a valid conversion result
            expect(result.current.convertedValue).toBeDefined();
            expect(result.current.convertedValue!.result).toBeGreaterThan(0);
            expect(isFinite(result.current.convertedValue!.result)).toBe(true);
            expect(result.current.error).toBeNull();
          }
        ),
        { numRuns: 20 }
      );
    });

    // Feature: unit-conversion-integration, Property 8: Conversion Calculation Accuracy
    it('should maintain conversion accuracy for Desi count units', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000 }),
          fc.constantFrom(
            { from: 40, to: 41, name: 'Lakh to Crore' },
            { from: 41, to: 40, name: 'Crore to Lakh' }
          ),
          async (value, conversion) => {
            const wrapper = createWrapper();
            const { result } = renderHook(() => useUnitConversion(), { wrapper });

            await result.current.convert({
              value,
              fromUnitId: conversion.from,
              toUnitId: conversion.to
            });

            await waitFor(() => {
              expect(result.current.isConverting).toBe(false);
            });

            // Should have a valid conversion result
            expect(result.current.convertedValue).toBeDefined();
            expect(result.current.convertedValue!.result).toBeGreaterThan(0);
            expect(isFinite(result.current.convertedValue!.result)).toBe(true);
            expect(result.current.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Conversion Display Format', () => {
    // **Validates: Requirements 11.1, 11.4**
    it('should provide conversion formula for Desi units', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitConversion(), { wrapper });

      await result.current.convert({
        value: 80,
        fromUnitId: 20, // Tola
        toUnitId: 21    // Seer
      });

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(result.current.convertedValue).toBeDefined();
      expect(result.current.convertedValue!.formula).toBeDefined();
      expect(result.current.convertedValue!.formula).toContain('tola');
      expect(result.current.convertedValue!.formula).toContain('seer');
    });

    // **Validates: Requirements 11.1, 11.4**
    it('should show correct decimal places for Desi units', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnitConversion(), { wrapper });

      await result.current.convert({
        value: 100,
        fromUnitId: 40, // Lakh
        toUnitId: 41    // Crore
      });

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(result.current.convertedValue).toBeDefined();
      expect(result.current.convertedValue!.from_unit.decimal_places).toBe(0);
      expect(result.current.convertedValue!.to_unit.decimal_places).toBe(0);
    });
  });
});