/**
 * Unit Tests for UnitSelector Component
 * 
 * Tests the UnitSelector component implementation against Requirements 3.1-3.5:
 * - 3.1: Displays searchable dropdown with all active units
 * - 3.2: Filters units by name, symbol, or category
 * - 3.3: Stores unit_id and displays unit symbol
 * - 3.4: Groups units by category with headers
 * - 3.5: Shows unit's full name and symbol in format "{name} ({symbol})"
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UnitSelector } from '@/components/uom/UnitSelector';
import { useUnits, useUnitSearch } from '@/hooks/use-units';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the hooks
vi.mock('@/hooks/use-units', () => ({
  useUnits: vi.fn(),
  useUnitSearch: vi.fn(),
}));

// Mock UI components
vi.mock('@/components/ui/command', () => ({
  Command: ({ children }: { children: React.ReactNode }) => <div data-testid="command">{children}</div>,
  CommandInput: ({ placeholder, value, onValueChange }: any) => (
    <input 
      data-testid="command-input" 
      placeholder={placeholder}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    />
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => <div data-testid="command-list">{children}</div>,
  CommandEmpty: ({ children }: { children: React.ReactNode }) => <div data-testid="command-empty">{children}</div>,
  CommandGroup: ({ heading, children }: { heading: React.ReactNode; children: React.ReactNode }) => (
    <div data-testid="command-group">
      <div data-testid="group-heading">{heading}</div>
      {children}
    </div>
  ),
  CommandItem: ({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) => (
    <div data-testid="command-item" onClick={onSelect}>{children}</div>
  ),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }: any) => (
    <div data-testid="popover" data-open={open}>
      <div onClick={() => onOpenChange(!open)}>{children}</div>
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock data
const mockUnits = [
  {
    id: 1,
    name: 'Kilogram',
    symbol: 'kg',
    category_id: 1,
    category_name: 'Weight',
    unit_type: 'SI',
    is_active: true,
    is_base: true,
    sort_order: 1,
    created_at: '2024-01-01',
  },
  {
    id: 2,
    name: 'Gram',
    symbol: 'g',
    category_id: 1,
    category_name: 'Weight',
    unit_type: 'SI',
    is_active: true,
    is_base: false,
    sort_order: 2,
    created_at: '2024-01-01',
  },
  {
    id: 3,
    name: 'Meter',
    symbol: 'm',
    category_id: 2,
    category_name: 'Length',
    unit_type: 'SI',
    is_active: true,
    is_base: true,
    sort_order: 1,
    created_at: '2024-01-01',
  },
  {
    id: 4,
    name: 'Tola',
    symbol: 'tola',
    category_id: 1,
    category_name: 'Weight',
    unit_type: 'Desi',
    is_active: true,
    is_base: false,
    sort_order: 10,
    created_at: '2024-01-01',
  },
  {
    id: 5,
    name: 'Inactive Unit',
    symbol: 'iu',
    category_id: 1,
    category_name: 'Weight',
    unit_type: 'Other',
    is_active: false,
    is_base: false,
    sort_order: 99,
    created_at: '2024-01-01',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('UnitSelector Component', () => {
  const mockOnChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useUnits hook
    (useUnits as any).mockReturnValue({
      data: mockUnits,
      isLoading: false,
      error: null,
    });
    
    // Mock useUnitSearch hook
    (useUnitSearch as any).mockReturnValue({
      searchUnits: vi.fn((search: string, categoryFilter?: string) => {
        let filtered = mockUnits.filter(unit => unit.is_active);
        
        if (categoryFilter) {
          filtered = filtered.filter(unit => 
            unit.category_name.toLowerCase() === categoryFilter.toLowerCase()
          );
        }
        
        if (search.trim()) {
          const query = search.toLowerCase();
          filtered = filtered.filter(unit =>
            unit.name.toLowerCase().includes(query) ||
            unit.symbol.toLowerCase().includes(query) ||
            unit.category_name.toLowerCase().includes(query)
          );
        }
        
        return filtered;
      }),
    });
  });

  /**
   * Test Requirement 3.1: Display searchable dropdown with all active units
   */
  it('should display searchable dropdown with all active units', () => {
    render(
      <UnitSelector value={undefined} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Should show the trigger button
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('Select unit...')).toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(screen.getByTestId('button'));

    // Should show search input
    expect(screen.getByTestId('command-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search units...')).toBeInTheDocument();

    // Should show active units only (not the inactive one)
    expect(screen.getByText('Kilogram (kg)')).toBeInTheDocument();
    expect(screen.getByText('Gram (g)')).toBeInTheDocument();
    expect(screen.getByText('Meter (m)')).toBeInTheDocument();
    expect(screen.getByText('Tola (tola)')).toBeInTheDocument();
    expect(screen.queryByText('Inactive Unit (iu)')).not.toBeInTheDocument();
  });

  /**
   * Test Requirement 3.2: Filter units by name, symbol, or category
   */
  it('should filter units by name, symbol, or category when searching', async () => {
    render(
      <UnitSelector value={undefined} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    fireEvent.click(screen.getByTestId('button'));

    // Search by name
    const searchInput = screen.getByTestId('command-input');
    fireEvent.change(searchInput, { target: { value: 'kilo' } });

    await waitFor(() => {
      // Should show only Kilogram
      expect(screen.getByText('Kilogram (kg)')).toBeInTheDocument();
      expect(screen.queryByText('Gram (g)')).not.toBeInTheDocument();
    });

    // Search by symbol
    fireEvent.change(searchInput, { target: { value: 'g' } });

    await waitFor(() => {
      // Should show Gram and Kilogram (kg contains 'g')
      expect(screen.getByText('Gram (g)')).toBeInTheDocument();
      expect(screen.getByText('Kilogram (kg)')).toBeInTheDocument();
    });

    // Search by category
    fireEvent.change(searchInput, { target: { value: 'weight' } });

    await waitFor(() => {
      // Should show all weight units
      expect(screen.getByText('Kilogram (kg)')).toBeInTheDocument();
      expect(screen.getByText('Gram (g)')).toBeInTheDocument();
      expect(screen.getByText('Tola (tola)')).toBeInTheDocument();
      expect(screen.queryByText('Meter (m)')).not.toBeInTheDocument();
    });
  });

  /**
   * Test Requirement 3.3: Store unit_id and display unit symbol
   */
  it('should store unit_id and display unit symbol when selected', () => {
    render(
      <UnitSelector value={1} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Should display selected unit with symbol (use getAllByText to handle multiple instances)
    expect(screen.getAllByText('Kilogram (kg)')[0]).toBeInTheDocument();

    // Open dropdown and select different unit
    fireEvent.click(screen.getByTestId('button'));
    
    // Find and click on Gram option
    const gramOption = screen.getAllByTestId('command-item').find(item => 
      item.textContent?.includes('Gram (g)')
    );
    expect(gramOption).toBeInTheDocument();
    
    fireEvent.click(gramOption!);

    // Should call onChange with unit_id
    expect(mockOnChange).toHaveBeenCalledWith(2);
  });

  /**
   * Test Requirement 3.4: Group units by category with headers
   */
  it('should group units by category with headers', () => {
    render(
      <UnitSelector value={undefined} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    fireEvent.click(screen.getByTestId('button'));

    // Should show category groups
    const groups = screen.getAllByTestId('command-group');
    expect(groups.length).toBeGreaterThan(0);

    // Should show category headers
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Length')).toBeInTheDocument();
  });

  /**
   * Test Requirement 3.5: Show unit's full name and symbol in format "{name} ({symbol})"
   */
  it('should show units in format "{name} ({symbol})"', () => {
    render(
      <UnitSelector value={undefined} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    fireEvent.click(screen.getByTestId('button'));

    // Should show units in correct format
    expect(screen.getByText('Kilogram (kg)')).toBeInTheDocument();
    expect(screen.getByText('Gram (g)')).toBeInTheDocument();
    expect(screen.getByText('Meter (m)')).toBeInTheDocument();
    expect(screen.getByText('Tola (tola)')).toBeInTheDocument();
  });

  /**
   * Test categoryFilter prop functionality
   */
  it('should filter by category when categoryFilter prop is provided', () => {
    render(
      <UnitSelector 
        value={undefined} 
        onChange={mockOnChange} 
        categoryFilter="Weight"
      />,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    fireEvent.click(screen.getByTestId('button'));

    // Should show only Weight category units
    expect(screen.getByText('Kilogram (kg)')).toBeInTheDocument();
    expect(screen.getByText('Gram (g)')).toBeInTheDocument();
    expect(screen.getByText('Tola (tola)')).toBeInTheDocument();
    expect(screen.queryByText('Meter (m)')).not.toBeInTheDocument();
  });

  /**
   * Test loading state
   */
  it('should show loading state when data is loading', () => {
    (useUnits as any).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    render(
      <UnitSelector value={undefined} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Loading units...')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeDisabled();
  });

  /**
   * Test disabled state
   */
  it('should be disabled when disabled prop is true', () => {
    render(
      <UnitSelector 
        value={undefined} 
        onChange={mockOnChange} 
        disabled={true}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('button')).toBeDisabled();
  });

  /**
   * Test custom placeholder
   */
  it('should show custom placeholder when provided', () => {
    render(
      <UnitSelector 
        value={undefined} 
        onChange={mockOnChange} 
        placeholder="Choose a unit..."
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Choose a unit...')).toBeInTheDocument();
  });

  /**
   * Test unit type display
   */
  it('should display unit type information', () => {
    render(
      <UnitSelector value={undefined} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    fireEvent.click(screen.getByTestId('button'));

    // Should show unit types (use getAllByText to handle multiple instances)
    expect(screen.getAllByText('SI').length).toBeGreaterThan(0);
    expect(screen.getByText('Desi')).toBeInTheDocument();
  });

  /**
   * Test base unit indicator
   */
  it('should show base unit indicator for base units', () => {
    render(
      <UnitSelector value={undefined} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    fireEvent.click(screen.getByTestId('button'));

    // Should show BASE indicator for base units
    expect(screen.getAllByText('BASE')).toHaveLength(2); // Kilogram and Meter are base units
  });
});