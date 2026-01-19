/**
 * Simple Material Details Test
 * 
 * Basic test to check if the component renders without errors
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MaterialDetailsPage from '@/app/dashboard/(authenticated)/erp/merchandising/material-details/page';

// Mock the API with simple responses
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
        getAll: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      trims: {
        getAll: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      accessories: {
        getAll: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      finishedGood: {
        getAll: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      packingGood: {
        getAll: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    }
  }
}));

// Mock the UOM components
vi.mock('@/components/uom/UnitDisplay', () => ({
  UnitDisplay: vi.fn(() => <span>Unit Display</span>)
}));

vi.mock('@/components/uom/UnitSelector', () => ({
  UnitSelector: vi.fn(() => <div>Unit Selector</div>)
}));

vi.mock('@/components/uom/InlineConverter', () => ({
  InlineConverter: vi.fn(() => <div>Inline Converter</div>)
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

describe('Material Details Simple Test', () => {
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

  it('should render the component without errors', async () => {
    renderWithQueryClient(<MaterialDetailsPage />);

    // Wait for the main heading to appear
    await waitFor(() => {
      expect(screen.getByText('Material Details')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Check if tabs are rendered
    expect(screen.getByRole('tab', { name: /yarn/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /fabric/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /trims/i })).toBeInTheDocument();
  });
});