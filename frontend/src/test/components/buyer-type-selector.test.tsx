/**
 * Unit Tests for BuyerTypeSelector Component
 * Tests dropdown functionality, "Add New" option, validation, and error handling
 * Requirements: 2.1, 2.2, 2.3
 * 
 * Note: These tests focus on the component's logic and data handling rather than
 * complex UI interactions due to Radix UI testing limitations in JSDOM environment.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BuyerTypeSelector } from '@/components/clients/buyer-type-selector'

// Mock the hooks
vi.mock('@/hooks/use-queries', () => ({
  useBuyerTypes: vi.fn(),
  useCreateBuyerType: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { useBuyerTypes, useCreateBuyerType } from '@/hooks/use-queries'
import { toast } from 'sonner'

// Test data
const mockBuyerTypes = [
  {
    id: 1,
    name: 'Retail',
    description: 'Retail buyers and chains',
    is_active: true,
  },
  {
    id: 2,
    name: 'Wholesale',
    description: 'Wholesale distributors',
    is_active: true,
  },
  {
    id: 3,
    name: 'Brand',
    description: 'Brand owners and manufacturers',
    is_active: true,
  },
]

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('BuyerTypeSelector Component', () => {
  const mockOnChange = vi.fn()
  const mockCreateMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  }
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementations
    vi.mocked(useBuyerTypes).mockReturnValue({
      data: mockBuyerTypes,
      isLoading: false,
      refetch: mockRefetch,
    } as any)

    vi.mocked(useCreateBuyerType).mockReturnValue(mockCreateMutation as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render with placeholder text', () => {
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            placeholder="Select buyer type"
          />
        </TestWrapper>
      )

      expect(screen.getByText('Select buyer type')).toBeInTheDocument()
    })

    it('should display selected buyer type correctly', () => {
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value="1"
            onChange={mockOnChange}
          />
        </TestWrapper>
      )

      // Should show the selected buyer type name
      expect(screen.getByText('Retail')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            className="custom-class"
          />
        </TestWrapper>
      )

      const container = document.querySelector('.custom-class')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Data Loading', () => {
    it('should handle loading state', () => {
      vi.mocked(useBuyerTypes).mockReturnValue({
        data: [],
        isLoading: true,
        refetch: mockRefetch,
      } as any)

      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
          />
        </TestWrapper>
      )

      // Component should render and be disabled during loading
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })

    it('should handle empty buyer types list', () => {
      vi.mocked(useBuyerTypes).mockReturnValue({
        data: [],
        isLoading: false,
        refetch: mockRefetch,
      } as any)

      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
          />
        </TestWrapper>
      )

      // Component should still render without errors
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should display buyer types when data is loaded', () => {
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
          />
        </TestWrapper>
      )

      // Should show buyer types in the component
      expect(screen.getByText('Retail')).toBeInTheDocument()
      expect(screen.getByText('Wholesale')).toBeInTheDocument()
      expect(screen.getByText('Brand')).toBeInTheDocument()
      
      // Should show descriptions
      expect(screen.getByText('Retail buyers and chains')).toBeInTheDocument()
      expect(screen.getByText('Wholesale distributors')).toBeInTheDocument()
      expect(screen.getByText('Brand owners and manufacturers')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            disabled={true}
          />
        </TestWrapper>
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })
  })

  describe('Create New Buyer Type', () => {
    it('should show "Add New Buyer Type" option when allowCreate is true', () => {
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            allowCreate={true}
          />
        </TestWrapper>
      )

      // Should show "Add New" option
      expect(screen.getByText('Add New Buyer Type')).toBeInTheDocument()
    })

    it('should not show "Add New Buyer Type" option when allowCreate is false', () => {
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            allowCreate={false}
          />
        </TestWrapper>
      )

      // Should not show "Add New" option
      expect(screen.queryByText('Add New Buyer Type')).not.toBeInTheDocument()
    })

    it('should show create dialog elements when rendered', async () => {
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            allowCreate={true}
          />
        </TestWrapper>
      )

      // Dialog elements should be present in the DOM (even if not visible)
      expect(screen.getByText('Create New Buyer Type')).toBeInTheDocument()
      expect(screen.getByText('Add a new buyer type to categorize your clients.')).toBeInTheDocument()
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('Form Validation and Creation', () => {
    it('should validate required name field', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            allowCreate={true}
          />
        </TestWrapper>
      )

      // Try to create without entering a name
      const createButton = screen.getByText('Create')
      await user.click(createButton)

      // Should show error toast
      expect(toast.error).toHaveBeenCalledWith('Buyer type name is required')
    })

    it('should create new buyer type successfully', async () => {
      const user = userEvent.setup()
      const newBuyerType = {
        id: 4,
        name: 'Export',
        description: 'Export customers',
        is_active: true,
      }

      mockCreateMutation.mutateAsync.mockResolvedValue(newBuyerType)
      
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            allowCreate={true}
          />
        </TestWrapper>
      )

      // Fill in the form
      const nameInput = screen.getByLabelText(/Name/)
      const descriptionInput = screen.getByLabelText(/Description/)
      
      await user.type(nameInput, 'Export')
      await user.type(descriptionInput, 'Export customers')

      // Submit the form
      const createButton = screen.getByText('Create')
      await user.click(createButton)

      // Verify the mutation was called with correct data
      expect(mockCreateMutation.mutateAsync).toHaveBeenCalledWith({
        name: 'Export',
        description: 'Export customers',
        is_active: true,
      })

      // Should call onChange with new buyer type ID
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('4')
      })

      // Should show success toast
      expect(toast.success).toHaveBeenCalledWith('Buyer type "Export" created successfully')

      // Should refetch the list
      expect(mockRefetch).toHaveBeenCalled()
    })

    it('should handle creation errors gracefully', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Buyer type name already exists'

      mockCreateMutation.mutateAsync.mockRejectedValue(new Error(errorMessage))
      
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            allowCreate={true}
          />
        </TestWrapper>
      )

      // Fill in the form
      const nameInput = screen.getByLabelText(/Name/)
      await user.type(nameInput, 'Duplicate Name')

      // Submit the form
      const createButton = screen.getByText('Create')
      await user.click(createButton)

      // Should show error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage)
      })
    })

    it('should show loading state in create button', () => {
      mockCreateMutation.isPending = true
      
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            allowCreate={true}
          />
        </TestWrapper>
      )

      // Check if create button shows loading state
      expect(screen.getByText('Creating...')).toBeInTheDocument()
    })

    it('should reset form when cancelled', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value=""
            onChange={mockOnChange}
            allowCreate={true}
          />
        </TestWrapper>
      )

      // Fill in some data
      const nameInput = screen.getByLabelText(/Name/)
      await user.type(nameInput, 'Test Name')

      // Cancel should reset the form
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Form should be reset (input should be empty)
      expect(nameInput).toHaveValue('')
    })
  })

  describe('Integration', () => {
    it('should integrate all functionality correctly', () => {
      render(
        <TestWrapper>
          <BuyerTypeSelector
            value="2"
            onChange={mockOnChange}
            allowCreate={true}
            placeholder="Choose buyer type"
            className="test-selector"
          />
        </TestWrapper>
      )

      // Should show selected value
      expect(screen.getByText('Wholesale')).toBeInTheDocument()
      
      // Should show all buyer types
      expect(screen.getByText('Retail')).toBeInTheDocument()
      expect(screen.getByText('Brand')).toBeInTheDocument()
      
      // Should show create option
      expect(screen.getByText('Add New Buyer Type')).toBeInTheDocument()
      
      // Should have custom class
      expect(document.querySelector('.test-selector')).toBeInTheDocument()
      
      // Should have form elements
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    })
  })
})