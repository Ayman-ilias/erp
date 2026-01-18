/**
 * Unit Conversion System Error Handling Tests
 * 
 * Tests for comprehensive error handling in UoM components and hooks.
 * Covers all error scenarios specified in the requirements.
 * 
 * **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UnitSelector } from '@/components/uom/UnitSelector';
import { InlineConverter } from '@/components/uom/InlineConverter';
import { UnitDisplay } from '@/components/uom/UnitDisplay';
import { UoMErrorBoundary, UoMErrorWrapper } from '@/components/uom/UoMErrorBoundary';
import { uomErrorHandler, UoMErrorType } from '@/services/uom-error-handling';
import * as useUnitsHook from '@/hooks/use-units';

// ============================================================================
// TEST SETUP
// ============================================================================

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

// Mock auth context
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ token: 'mock-token' }),
}));

// Mock API services
vi.mock('@/services/api', () => ({
  settingsService: {
    uom: {
      convert: vi.fn(),
    },
  },
}));

// ============================================================================
// ERROR HANDLER TESTS
// ============================================================================

describe('UoM Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Classification', () => {
    it('should classify network errors correctly', () => {
      const networkError = new Error('Network Error');
      const classified = uomErrorHandler.classifyError(networkError);

      expect(classified.type).toBe(UoMErrorType.NETWORK_ERROR);
      expect(classified.userMessage).toContain('Unable to connect');
      expect(classified.retryable).toBe(true);
      expect(classified.suggestions).toContain('Check your internet connection');
    });

    it('should classify API unavailable errors correctly', () => {
      const apiError = { response: { status: 503, data: { detail: 'Service unavailable' } } };
      const classified = uomErrorHandler.classifyError(apiError);

      expect(classified.type).toBe(UoMErrorType.CONVERSION_API_UNAVAILABLE);
      expect(classified.userMessage).toContain('temporarily unavailable');
      expect(classified.retryable).toBe(true);
    });

    it('should classify incompatible unit conversion errors correctly', () => {
      const conversionError = { 
        response: { 
          status: 400, 
          data: { detail: 'Cannot convert between different categories' } 
        } 
      };
      const classified = uomErrorHandler.classifyError(conversionError);

      expect(classified.type).toBe(UoMErrorType.INCOMPATIBLE_UNIT_CONVERSION);
      expect(classified.userMessage).toContain('different categories');
      expect(classified.retryable).toBe(false);
      expect(classified.suggestions).toContain('Select units from the same category');
    });

    it('should classify invalid unit ID errors correctly', () => {
      const invalidUnitError = { response: { status: 404, data: { detail: 'Unit not found' } } };
      const classified = uomErrorHandler.classifyError(invalidUnitError);

      expect(classified.type).toBe(UoMErrorType.INVALID_UNIT_ID);
      expect(classified.userMessage).toContain('not valid or no longer available');
      expect(classified.retryable).toBe(false);
    });

    it('should classify missing unit selection errors correctly', () => {
      const validationError = new Error('Unit is required');
      const classified = uomErrorHandler.classifyError(validationError);

      expect(classified.type).toBe(UoMErrorType.MISSING_UNIT_SELECTION);
      expect(classified.userMessage).toContain('Please select a unit');
      expect(classified.retryable).toBe(false);
    });
  });

  describe('Error Messages', () => {
    it('should provide user-friendly messages', () => {
      const error = new Error('Some technical error');
      error.uomError = {
        type: UoMErrorType.UNIT_DATA_FETCH_FAILED,
        userMessage: 'Failed to load unit data',
        suggestions: ['Refresh the page'],
        retryable: true,
      };

      const userMessage = uomErrorHandler.getUserMessage(error);
      const suggestions = uomErrorHandler.getErrorSuggestions(error);
      const retryable = uomErrorHandler.isRetryable(error);

      expect(userMessage).toBe('Failed to load unit data');
      expect(suggestions).toContain('Refresh the page');
      expect(retryable).toBe(true);
    });
  });
});

// ============================================================================
// UNIT SELECTOR ERROR HANDLING TESTS
// ============================================================================

describe('UnitSelector Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display error state when unit data fetch fails', async () => {
    // Mock failed unit data fetch
    vi.spyOn(useUnitsHook, 'useUnits').mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to fetch units'),
      refetch: vi.fn(),
    });

    vi.spyOn(useUnitsHook, 'useUnitSearch').mockReturnValue({
      searchUnits: vi.fn(() => []),
      findUnitById: vi.fn(),
      allUnits: [],
      isLoading: false,
      error: new Error('Failed to fetch units'),
    });

    render(
      <TestWrapper>
        <UnitSelector value={undefined} onChange={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('Failed to load units')).toBeInTheDocument();
    expect(screen.getByText(/Unit data unavailable/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh Page/ })).toBeInTheDocument();
  });

  it('should handle retry functionality', async () => {
    const mockRefetch = vi.fn();
    vi.spyOn(useUnitsHook, 'useUnits').mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to fetch units'),
      refetch: mockRefetch,
    });

    vi.spyOn(useUnitsHook, 'useUnitSearch').mockReturnValue({
      searchUnits: vi.fn(() => []),
      findUnitById: vi.fn(),
      allUnits: [],
      isLoading: false,
      error: new Error('Failed to fetch units'),
    });

    render(
      <TestWrapper>
        <UnitSelector value={undefined} onChange={vi.fn()} />
      </TestWrapper>
    );

    const retryButton = screen.getByRole('button', { name: /Retry/ });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should show loading state during retry', async () => {
    const mockRefetch = vi.fn();
    
    // Mock error state with loading during retry
    vi.spyOn(useUnitsHook, 'useUnits').mockReturnValue({
      data: [],
      isLoading: true,
      error: new Error('Failed to fetch units'),
      refetch: mockRefetch,
    });

    vi.spyOn(useUnitsHook, 'useUnitSearch').mockReturnValue({
      searchUnits: vi.fn(() => []),
      findUnitById: vi.fn(),
      allUnits: [],
      isLoading: true,
      error: new Error('Failed to fetch units'),
    });

    render(
      <TestWrapper>
        <UnitSelector value={undefined} onChange={vi.fn()} />
      </TestWrapper>
    );

    // When both isLoading and error are true, should show loading state in main button
    expect(screen.getByText('Loading units...')).toBeInTheDocument();
    // Button should be disabled during loading
    const button = screen.getByRole('combobox');
    expect(button).toBeDisabled();
  });
});

// ============================================================================
// INLINE CONVERTER ERROR HANDLING TESTS
// ============================================================================

describe('InlineConverter Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should disable converter when units data is unavailable', () => {
    vi.spyOn(useUnitsHook, 'useUnitConversion').mockReturnValue({
      convert: vi.fn(),
      isConverting: false,
      convertedValue: null,
      error: null,
      reset: vi.fn(),
    });

    vi.spyOn(useUnitsHook, 'useUnits').mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Units unavailable'),
    });

    render(
      <TestWrapper>
        <InlineConverter value={10} fromUnitId={1} />
      </TestWrapper>
    );

    const converterButton = screen.getByRole('button');
    expect(converterButton).toBeDisabled();
    expect(converterButton).toHaveAttribute('title', 'Unit data unavailable - cannot convert');
  });

  it('should display conversion error with retry option', async () => {
    const mockConvert = vi.fn().mockRejectedValue(new Error('Conversion failed'));
    
    vi.spyOn(useUnitsHook, 'useUnitConversion').mockReturnValue({
      convert: mockConvert,
      isConverting: false,
      convertedValue: null,
      error: 'Unit conversion service is temporarily unavailable. Please try again.',
      reset: vi.fn(),
    });

    vi.spyOn(useUnitsHook, 'useUnits').mockReturnValue({
      data: [
        { id: 1, name: 'Kilogram', symbol: 'kg', category_name: 'Weight' },
        { id: 2, name: 'Gram', symbol: 'g', category_name: 'Weight' },
      ],
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <InlineConverter value={10} fromUnitId={1} />
      </TestWrapper>
    );

    // Open converter
    const converterButton = screen.getByRole('button');
    fireEvent.click(converterButton);

    await waitFor(() => {
      expect(screen.getByText('Conversion Failed:')).toBeInTheDocument();
      expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
    });
  });

  it('should handle incompatible unit conversion error', async () => {
    vi.spyOn(useUnitsHook, 'useUnitConversion').mockReturnValue({
      convert: vi.fn(),
      isConverting: false,
      convertedValue: null,
      error: 'Cannot convert between units in different categories. Please select units from the same category.',
      reset: vi.fn(),
    });

    vi.spyOn(useUnitsHook, 'useUnits').mockReturnValue({
      data: [
        { id: 1, name: 'Kilogram', symbol: 'kg', category_name: 'Weight' },
        { id: 2, name: 'Meter', symbol: 'm', category_name: 'Length' },
      ],
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <InlineConverter value={10} fromUnitId={1} />
      </TestWrapper>
    );

    // Open converter
    const converterButton = screen.getByRole('button');
    fireEvent.click(converterButton);

    await waitFor(() => {
      expect(screen.getByText('Conversion Failed:')).toBeInTheDocument();
      expect(screen.getByText(/different categories/)).toBeInTheDocument();
      // Should not show retry button for incompatible units
      expect(screen.queryByRole('button', { name: /Retry/ })).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// UNIT DISPLAY ERROR HANDLING TESTS
// ============================================================================

describe('UnitDisplay Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    vi.spyOn(useUnitsHook, 'useUnitSearch').mockReturnValue({
      findUnitById: vi.fn(() => undefined),
      isLoading: true,
      error: null,
    });

    render(
      <TestWrapper>
        <UnitDisplay unitId={1} />
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error state when units data fails to load', () => {
    vi.spyOn(useUnitsHook, 'useUnitSearch').mockReturnValue({
      findUnitById: vi.fn(() => undefined),
      isLoading: false,
      error: new Error('Failed to load units'),
    });

    render(
      <TestWrapper>
        <UnitDisplay unitId={1} />
      </TestWrapper>
    );

    expect(screen.getByText('Unit Error')).toBeInTheDocument();
  });

  it('should show unknown unit fallback with helpful message', () => {
    vi.spyOn(useUnitsHook, 'useUnitSearch').mockReturnValue({
      findUnitById: vi.fn(() => undefined),
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <UnitDisplay unitId={999} />
      </TestWrapper>
    );

    expect(screen.getByText('Unknown unit')).toBeInTheDocument();
  });
});

// ============================================================================
// ERROR BOUNDARY TESTS
// ============================================================================

describe('UoM Error Boundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('should catch and display JavaScript errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <UoMErrorBoundary>
        <ThrowError />
      </UoMErrorBoundary>
    );

    expect(screen.getByText('Unit System Error')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Page/ })).toBeInTheDocument();
  });

  it('should provide recovery options', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <UoMErrorBoundary>
        <ThrowError />
      </UoMErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /Try Again/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Page/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go Home/ })).toBeInTheDocument();
  });

  it('should show custom fallback when provided', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const customFallback = <div>Custom error message</div>;

    render(
      <UoMErrorBoundary fallback={customFallback}>
        <ThrowError />
      </UoMErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });
});

describe('UoM Error Wrapper', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('should show simplified error message', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <UoMErrorWrapper fallbackMessage="Units temporarily unavailable">
        <ThrowError />
      </UoMErrorWrapper>
    );

    expect(screen.getByText('Units temporarily unavailable')).toBeInTheDocument();
    expect(screen.getByText(/refresh the page/)).toBeInTheDocument();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Error Handling Integration', () => {
  it('should handle complete unit system failure gracefully', async () => {
    // Mock complete system failure
    vi.spyOn(useUnitsHook, 'useUnits').mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('System unavailable'),
      refetch: vi.fn(),
    });

    vi.spyOn(useUnitsHook, 'useUnitSearch').mockReturnValue({
      searchUnits: vi.fn(() => []),
      findUnitById: vi.fn(() => undefined),
      allUnits: [],
      isLoading: false,
      error: new Error('System unavailable'),
    });

    render(
      <TestWrapper>
        <UoMErrorWrapper>
          <div>
            <UnitSelector value={undefined} onChange={vi.fn()} />
            <UnitDisplay unitId={1} />
            <InlineConverter value={10} fromUnitId={1} />
          </div>
        </UoMErrorWrapper>
      </TestWrapper>
    );

    // Should show error states for all components
    expect(screen.getByText('Failed to load units')).toBeInTheDocument();
    expect(screen.getByText('Unit Error')).toBeInTheDocument();
    
    // Converter should be disabled
    const converterButton = screen.getByRole('button', { name: /Unit data unavailable/ });
    expect(converterButton).toBeDisabled();
  });
});