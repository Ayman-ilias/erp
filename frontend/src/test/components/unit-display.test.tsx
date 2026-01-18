/**
 * UnitDisplay Component Tests
 * 
 * Tests for the UnitDisplay component functionality including:
 * - Basic unit display with symbol and tooltip
 * - Full name display mode
 * - Unit type badge display
 * - Inactive unit handling with deprecation markers
 * - Quantity with unit display
 * - Unit comparison display
 * 
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.5, 11.5**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UnitDisplay, QuantityWithUnit, UnitComparison } from '@/components/uom/UnitDisplay';

// Mock the useUnitSearch hook
vi.mock('@/hooks/use-units', () => ({
  useUnitSearch: () => ({
    findUnitById: (id: number) => {
      const mockUnits = {
        1: {
          id: 1,
          name: 'Kilogram',
          symbol: 'kg',
          category_name: 'Weight',
          unit_type: 'SI',
          region: 'International',
          is_active: true,
          is_base: true,
          description: 'Base unit of mass in the International System of Units',
        },
        2: {
          id: 2,
          name: 'Tola',
          symbol: 'tola',
          category_name: 'Weight',
          unit_type: 'Desi',
          region: 'South Asia',
          is_active: true,
          is_base: false,
          description: 'Traditional unit of mass used in South Asia',
        },
        3: {
          id: 3,
          name: 'Obsolete Unit',
          symbol: 'obs',
          category_name: 'Weight',
          unit_type: 'Other',
          is_active: false,
          is_base: false,
          description: 'This unit is no longer in use',
        },
      };
      return mockUnits[id as keyof typeof mockUnits] || null;
    },
  }),
}));

// Test wrapper with QueryClient
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('UnitDisplay Component', () => {
  describe('Basic Display', () => {
    it('displays unit symbol by default', () => {
      render(
        <TestWrapper>
          <UnitDisplay unitId={1} />
        </TestWrapper>
      );
      
      expect(screen.getByText('kg')).toBeInTheDocument();
    });
    
    it('displays full unit name when showFullName is true', () => {
      render(
        <TestWrapper>
          <UnitDisplay unitId={1} showFullName={true} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Kilogram')).toBeInTheDocument();
    });
    
    it('displays unknown unit message for invalid unitId', () => {
      render(
        <TestWrapper>
          <UnitDisplay unitId={999} />
        </TestWrapper>
      );
      
      expect(screen.getByText('Unknown unit')).toBeInTheDocument();
    });
  });
  
  describe('Unit Type Display', () => {
    it('shows unit type badge when showUnitType is true', () => {
      render(
        <TestWrapper>
          <UnitDisplay unitId={1} showUnitType={true} />
        </TestWrapper>
      );
      
      expect(screen.getByText('SI')).toBeInTheDocument();
    });
    
    it('shows Desi unit type badge with correct styling', () => {
      render(
        <TestWrapper>
          <UnitDisplay unitId={2} showUnitType={true} />
        </TestWrapper>
      );
      
      const badge = screen.getByText('Desi');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-800');
    });
  });
  
  describe('Inactive Unit Handling', () => {
    it('shows deprecation warning for inactive units', () => {
      render(
        <TestWrapper>
          <UnitDisplay unitId={3} showDeprecationWarning={true} />
        </TestWrapper>
      );
      
      const unitElement = screen.getByText('obs');
      expect(unitElement).toHaveClass('line-through');
    });
  });
});

describe('QuantityWithUnit Component', () => {
  it('displays quantity with unit symbol', () => {
    render(
      <TestWrapper>
        <QuantityWithUnit value={5.5} unitId={1} />
      </TestWrapper>
    );
    
    expect(screen.getByText('5.5')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });
  
  it('formats numeric values with specified precision', () => {
    render(
      <TestWrapper>
        <QuantityWithUnit value={5.123456} unitId={1} precision={3} />
      </TestWrapper>
    );
    
    expect(screen.getByText('5.123')).toBeInTheDocument();
  });
  
  it('removes trailing zeros from formatted values', () => {
    render(
      <TestWrapper>
        <QuantityWithUnit value={5.0} unitId={1} precision={2} />
      </TestWrapper>
    );
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });
  
  it('displays string values as-is', () => {
    render(
      <TestWrapper>
        <QuantityWithUnit value="5.5" unitId={1} />
      </TestWrapper>
    );
    
    expect(screen.getByText('5.5')).toBeInTheDocument();
  });
});

describe('UnitComparison Component', () => {
  it('displays conversion comparison with equals sign', () => {
    render(
      <TestWrapper>
        <UnitComparison
          fromValue={1}
          fromUnitId={1}
          toValue={1000}
          toUnitId={2}
        />
      </TestWrapper>
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('tola')).toBeInTheDocument();
  });
  
  it('hides arrow when showArrow is false', () => {
    render(
      <TestWrapper>
        <UnitComparison
          fromValue={1}
          fromUnitId={1}
          toValue={1000}
          toUnitId={2}
          showArrow={false}
        />
      </TestWrapper>
    );
    
    expect(screen.queryByText('=')).not.toBeInTheDocument();
  });
});