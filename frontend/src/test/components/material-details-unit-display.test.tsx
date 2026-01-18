/**
 * Material Details Unit Display Integration Test
 * 
 * Tests the integration of UnitDisplay component in material list and detail views.
 * Validates Requirements 5.5, 10.1, 10.2, 10.3
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MaterialDetailsPage from '@/app/dashboard/(authenticated)/erp/merchandising/material-details/page';

// Mock the API
vi.mock('@/services/api', () => ({
  api: {
    merchandiser: {
      yarn: {
        getAll: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      fabric: {
        getAll: vi.fn(() => Promise.resolve([
          {
            id: 1,
            fabric_id: 'FAB_001',
            fabric_name: 'Cotton Jersey',
            category: 'Knit',
            type: 'Single Jersey',
            gsm: 180,
            unit_id: 25, // GSM unit ID
            width: '72 inches',
            composition: '100% Cotton'
          }
        ])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      trims: {
        getAll: vi.fn(() => Promise.resolve([
          {
            id: 1,
            product_id: 'BUTTON_BTN_0001',
            product_name: 'Metal Button',
            category: 'Button',
            sub_category: '4-hole',
            unit_id: 15, // Piece unit ID
            consumable_flag: true
          }
        ])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      accessories: {
        getAll: vi.fn(() => Promise.resolve([
          {
            id: 1,
            product_id: 'LABEL_LBL_0001',
            product_name: 'Care Label',
            category: 'Label',
            sub_category: 'Woven',
            unit_id: 15, // Piece unit ID
            consumable_flag: false
          }
        ])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      finishedGood: {
        getAll: vi.fn(() => Promise.resolve([
          {
            id: 1,
            product_id: 'TSHIRT_TSH_0001',
            product_name: 'Basic T-Shirt',
            category: 'Garment',
            sub_category: 'T-Shirt',
            unit_id: 15, // Piece unit ID
            consumable_flag: false
          }
        ])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      packingGood: {
        getAll: vi.fn(() => Promise.resolve([
          {
            id: 1,
            product_id: 'POLYBAG_PKG_0001',
            product_name: 'Poly Bag',
            category: 'Packaging',
            sub_category: 'Bag',
            unit_id: 15, // Piece unit ID
            consumable_flag: true
          }
        ])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    }
  }
}));

// Mock the UnitDisplay component to verify it's being called correctly
vi.mock('@/components/uom/UnitDisplay', () => ({
  UnitDisplay: vi.fn(({ unitId, showFullName, showUnitType }) => (
    <span data-testid={`unit-display-${unitId}`} data-show-full-name={showFullName} data-show-unit-type={showUnitType}>
      {unitId === 25 ? 'g/m²' : unitId === 15 ? 'pc' : 'unit'}
    </span>
  ))
}));

// Mock the UnitSelector and InlineConverter components
vi.mock('@/components/uom/UnitSelector', () => ({
  UnitSelector: vi.fn(() => <div data-testid="unit-selector">Unit Selector</div>)
}));

vi.mock('@/components/uom/InlineConverter', () => ({
  InlineConverter: vi.fn(() => <div data-testid="inline-converter">Inline Converter</div>)
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Material Details Unit Display Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  /**
   * **Validates: Requirements 5.5, 10.1**
   * Test that unit symbols are displayed next to quantities in material lists
   */
  it('should display unit symbols next to quantities in fabric table', async () => {
    renderWithQueryClient(<MaterialDetailsPage />);

    // Wait for fabric data to load and click fabric tab
    await waitFor(() => {
      expect(screen.getByText('Fabric')).toBeInTheDocument();
    });

    // Click on fabric tab
    const fabricTab = screen.getByRole('tab', { name: /fabric/i });
    fabricTab.click();

    // Wait for fabric table to render
    await waitFor(() => {
      expect(screen.getByText('Cotton Jersey')).toBeInTheDocument();
    });

    // Verify that GSM is displayed with unit symbol using UnitDisplay
    const unitDisplay = screen.getByTestId('unit-display-25');
    expect(unitDisplay).toBeInTheDocument();
    expect(unitDisplay).toHaveTextContent('g/m²');
    expect(unitDisplay).toHaveAttribute('data-show-full-name', 'false');
    expect(unitDisplay).toHaveAttribute('data-show-unit-type', 'false');
  });

  /**
   * **Validates: Requirements 10.1, 10.2**
   * Test that unit symbols are displayed in trims table
   */
  it('should display unit symbols in trims table', async () => {
    renderWithQueryClient(<MaterialDetailsPage />);

    // Click on trims tab
    await waitFor(() => {
      const trimsTab = screen.getByRole('tab', { name: /trims/i });
      trimsTab.click();
    });

    // Wait for trims table to render
    await waitFor(() => {
      expect(screen.getByText('Metal Button')).toBeInTheDocument();
    });

    // Verify that UnitDisplay is used for the unit column
    const unitDisplay = screen.getByTestId('unit-display-15');
    expect(unitDisplay).toBeInTheDocument();
    expect(unitDisplay).toHaveTextContent('pc');
    expect(unitDisplay).toHaveAttribute('data-show-full-name', 'false');
    expect(unitDisplay).toHaveAttribute('data-show-unit-type', 'false');
  });

  /**
   * **Validates: Requirements 10.1, 10.2**
   * Test that unit symbols are displayed in accessories table
   */
  it('should display unit symbols in accessories table', async () => {
    renderWithQueryClient(<MaterialDetailsPage />);

    // Click on accessories tab
    await waitFor(() => {
      const accessoriesTab = screen.getByRole('tab', { name: /accessories/i });
      accessoriesTab.click();
    });

    // Wait for accessories table to render
    await waitFor(() => {
      expect(screen.getByText('Care Label')).toBeInTheDocument();
    });

    // Verify that UnitDisplay is used for the unit column
    const unitDisplay = screen.getByTestId('unit-display-15');
    expect(unitDisplay).toBeInTheDocument();
    expect(unitDisplay).toHaveTextContent('pc');
  });

  /**
   * **Validates: Requirements 10.1, 10.2**
   * Test that unit symbols are displayed in finished good table
   */
  it('should display unit symbols in finished good table', async () => {
    renderWithQueryClient(<MaterialDetailsPage />);

    // Click on finished good tab
    await waitFor(() => {
      const finishedGoodTab = screen.getByRole('tab', { name: /finished good/i });
      finishedGoodTab.click();
    });

    // Wait for finished good table to render
    await waitFor(() => {
      expect(screen.getByText('Basic T-Shirt')).toBeInTheDocument();
    });

    // Verify that UnitDisplay is used for the unit column
    const unitDisplay = screen.getByTestId('unit-display-15');
    expect(unitDisplay).toBeInTheDocument();
    expect(unitDisplay).toHaveTextContent('pc');
  });

  /**
   * **Validates: Requirements 10.1, 10.2**
   * Test that unit symbols are displayed in packing good table
   */
  it('should display unit symbols in packing good table', async () => {
    renderWithQueryClient(<MaterialDetailsPage />);

    // Click on packing good tab
    await waitFor(() => {
      const packingGoodTab = screen.getByRole('tab', { name: /packing good/i });
      packingGoodTab.click();
    });

    // Wait for packing good table to render
    await waitFor(() => {
      expect(screen.getByText('Poly Bag')).toBeInTheDocument();
    });

    // Verify that UnitDisplay is used for the unit column
    const unitDisplay = screen.getByTestId('unit-display-15');
    expect(unitDisplay).toBeInTheDocument();
    expect(unitDisplay).toHaveTextContent('pc');
  });

  /**
   * **Validates: Requirements 10.1, 10.3**
   * Test fallback to plain text when unit_id is not available
   */
  it('should fallback to plain text when unit_id is not available', async () => {
    // Mock API to return data without unit_id
    const mockApi = await import('@/services/api');
    vi.mocked(mockApi.api.merchandiser.trims.getAll).mockResolvedValueOnce([
      {
        id: 1,
        product_id: 'BUTTON_BTN_0001',
        product_name: 'Metal Button',
        category: 'Button',
        sub_category: '4-hole',
        uom: 'piece', // Plain text UoM instead of unit_id
        consumable_flag: true
      }
    ]);

    renderWithQueryClient(<MaterialDetailsPage />);

    // Click on trims tab
    await waitFor(() => {
      const trimsTab = screen.getByRole('tab', { name: /trims/i });
      trimsTab.click();
    });

    // Wait for trims table to render
    await waitFor(() => {
      expect(screen.getByText('Metal Button')).toBeInTheDocument();
    });

    // Verify that plain text is displayed when unit_id is not available
    expect(screen.getByText('piece')).toBeInTheDocument();
    expect(screen.queryByTestId('unit-display-15')).not.toBeInTheDocument();
  });

  /**
   * **Validates: Requirements 5.5, 10.1**
   * Test that fabric GSM is displayed with proper unit handling
   */
  it('should display fabric GSM with unit when both gsm and unit_id are available', async () => {
    renderWithQueryClient(<MaterialDetailsPage />);

    // Click on fabric tab
    await waitFor(() => {
      const fabricTab = screen.getByRole('tab', { name: /fabric/i });
      fabricTab.click();
    });

    // Wait for fabric table to render
    await waitFor(() => {
      expect(screen.getByText('Cotton Jersey')).toBeInTheDocument();
    });

    // Verify that GSM value is displayed along with unit symbol
    expect(screen.getByText('180')).toBeInTheDocument();
    const unitDisplay = screen.getByTestId('unit-display-25');
    expect(unitDisplay).toBeInTheDocument();
    expect(unitDisplay).toHaveTextContent('g/m²');
  });

  /**
   * **Validates: Requirements 5.5, 10.1**
   * Test fallback for fabric GSM when unit_id is not available
   */
  it('should fallback to "GSM" text when fabric unit_id is not available', async () => {
    // Mock API to return fabric data without unit_id
    const mockApi = await import('@/services/api');
    vi.mocked(mockApi.api.merchandiser.fabric.getAll).mockResolvedValueOnce([
      {
        id: 1,
        fabric_id: 'FAB_001',
        fabric_name: 'Cotton Jersey',
        category: 'Knit',
        type: 'Single Jersey',
        gsm: 180,
        // No unit_id provided
        width: '72 inches',
        composition: '100% Cotton'
      }
    ]);

    renderWithQueryClient(<MaterialDetailsPage />);

    // Click on fabric tab
    await waitFor(() => {
      const fabricTab = screen.getByRole('tab', { name: /fabric/i });
      fabricTab.click();
    });

    // Wait for fabric table to render
    await waitFor(() => {
      expect(screen.getByText('Cotton Jersey')).toBeInTheDocument();
    });

    // Verify that fallback "GSM" text is displayed
    expect(screen.getByText('180 GSM')).toBeInTheDocument();
    expect(screen.queryByTestId('unit-display-25')).not.toBeInTheDocument();
  });
});