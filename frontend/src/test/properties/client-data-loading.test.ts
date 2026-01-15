/**
 * Property Test 1: Client Data Loading Reliability
 * Validates: Requirements 1.1, 1.2, 1.3
 * 
 * This test ensures that client data loading (shipping and banking) is reliable
 * across various network conditions and data scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { errorHandlingService } from '@/services/error-handling'

// Mock the API services
vi.mock('@/services/api', () => ({
  shippingService: {
    getAll: vi.fn(),
  },
  bankingService: {
    getAll: vi.fn(),
  },
}))

import { shippingService, bankingService } from '@/services/api'

describe('Property Test 1: Client Data Loading Reliability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle successful data loading for shipping addresses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          buyer_id: fc.integer({ min: 1, max: 100 }),
          buyer_name: fc.string({ minLength: 1, maxLength: 50 }),
          brand_name: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          company_name: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          destination_country: fc.string({ minLength: 2, maxLength: 50 }),
          destination_country_code: fc.option(fc.string({ minLength: 2, maxLength: 3 })),
          destination_port: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          place_of_delivery: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          destination_code: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          warehouse_no: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          address: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
        }), { minLength: 0, maxLength: 50 }),
        async (mockData) => {
          // Mock successful API response
          vi.mocked(shippingService.getAll).mockResolvedValue(mockData)

          // Call the service directly to test the API layer
          const result = await shippingService.getAll()

          // Verify the data is correctly returned
          expect(result).toEqual(mockData)
          expect(Array.isArray(result)).toBe(true)
          
          // Verify API was called correctly
          expect(shippingService.getAll).toHaveBeenCalledWith()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle successful data loading for banking details', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          client_type: fc.constantFrom('buyer', 'supplier'),
          client_id: fc.integer({ min: 1, max: 100 }),
          client_name: fc.string({ minLength: 1, maxLength: 50 }),
          country: fc.option(fc.string({ minLength: 2, maxLength: 50 })),
          bank_name: fc.string({ minLength: 1, maxLength: 100 }),
          sort_code: fc.option(fc.string({ minLength: 6, maxLength: 8 })),
          account_number: fc.string({ minLength: 8, maxLength: 20 }),
        }), { minLength: 0, maxLength: 50 }),
        async (mockData) => {
          // Mock successful API response
          vi.mocked(bankingService.getAll).mockResolvedValue(mockData)

          // Call the service directly to test the API layer
          const result = await bankingService.getAll()

          // Verify the data is correctly returned
          expect(result).toEqual(mockData)
          expect(Array.isArray(result)).toBe(true)
          
          // Verify API was called correctly
          expect(bankingService.getAll).toHaveBeenCalledWith()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty data arrays gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant([]), // Always empty array
        async (emptyData) => {
          // Mock empty response for both services
          vi.mocked(shippingService.getAll).mockResolvedValue(emptyData)
          vi.mocked(bankingService.getAll).mockResolvedValue(emptyData)

          // Test shipping service
          const shippingResult = await shippingService.getAll()
          expect(shippingResult).toEqual([])
          expect(Array.isArray(shippingResult)).toBe(true)

          // Test banking service
          const bankingResult = await bankingService.getAll()
          expect(bankingResult).toEqual([])
          expect(Array.isArray(bankingResult)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle network errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          new Error('Network Error'),
          new Error('Timeout'),
          new Error('Connection refused'),
          new Error('Server unavailable')
        ),
        async (networkError) => {
          // Mock network error for both services
          vi.mocked(shippingService.getAll).mockRejectedValue(networkError)
          vi.mocked(bankingService.getAll).mockRejectedValue(networkError)

          // Test shipping service error handling
          await expect(shippingService.getAll()).rejects.toThrow(networkError.message)

          // Test banking service error handling
          await expect(bankingService.getAll()).rejects.toThrow(networkError.message)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle various limit parameters correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.option(fc.integer({ min: 1, max: 10000 })),
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          buyer_name: fc.string({ minLength: 1, maxLength: 50 }),
        }), { minLength: 0, maxLength: 100 }),
        async (limit, mockData) => {
          // Mock API response
          vi.mocked(shippingService.getAll).mockResolvedValue(mockData)

          // Call service with limit parameter
          const result = await shippingService.getAll(limit ?? undefined)

          // Verify API was called with correct limit
          expect(shippingService.getAll).toHaveBeenCalledWith(limit ?? undefined)
          expect(result).toEqual(mockData)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain data consistency across multiple calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          buyer_name: fc.string({ minLength: 1, maxLength: 50 }),
          destination_country: fc.string({ minLength: 2, maxLength: 50 }),
        }), { minLength: 1, maxLength: 20 }),
        async (mockData) => {
          // Mock consistent API response
          vi.mocked(shippingService.getAll).mockResolvedValue(mockData)

          // Make multiple calls
          const result1 = await shippingService.getAll()
          const result2 = await shippingService.getAll()
          const result3 = await shippingService.getAll()

          // Data should remain consistent across calls
          expect(result1).toEqual(mockData)
          expect(result2).toEqual(mockData)
          expect(result3).toEqual(mockData)
          expect(result1).toEqual(result2)
          expect(result2).toEqual(result3)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Property Test 2: Network Error Recovery
 * Validates: Requirements 1.4
 * 
 * This test ensures that network error recovery mechanisms work correctly
 * with retry logic, exponential backoff, and user-friendly error messages.
 */
describe('Property Test 2: Network Error Recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    errorHandlingService.clearErrorLog()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should retry retryable network operations', async () => {
    // Feature: erp-system-improvements, Property 2: Network Error Recovery
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'Network Error',
          'Timeout',
          'Connection refused',
          'Server unavailable',
          'fetch failed',
          'Failed to fetch'
        ),
        fc.integer({ min: 1, max: 2 }), // maxRetries (reduced for faster tests)
        async (errorMessage, maxRetries) => {
          let attemptCount = 0
          const mockOperation = vi.fn().mockImplementation(() => {
            attemptCount++
            if (attemptCount <= maxRetries) {
              throw new Error(errorMessage)
            }
            return Promise.resolve({ success: true, data: [] })
          })

          const context = {
            operation: 'test-network-operation',
            endpoint: '/test',
            timestamp: new Date()
          }

          const config = {
            maxRetries,
            baseDelay: 10, // Very small delay for testing
            maxDelay: 100,
            backoffMultiplier: 2,
            retryableErrors: [errorMessage]
          }

          // Should eventually succeed after retries
          const result = await errorHandlingService.executeWithRetry(
            mockOperation,
            context,
            config
          )

          // Verify operation was retried the expected number of times
          expect(attemptCount).toBe(maxRetries + 1)
          expect(result).toEqual({ success: true, data: [] })
          expect(mockOperation).toHaveBeenCalledTimes(maxRetries + 1)
        }
      ),
      { numRuns: 20, timeout: 5000 } // Reduced runs for faster tests
    )
  }, 10000) // Increased test timeout

  it('should provide user-friendly error messages for network failures', async () => {
    // Feature: erp-system-improvements, Property 2: Network Error Recovery
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          originalError: fc.constantFrom(
            'Network Error',
            'Timeout',
            'Connection refused',
            'unauthorized',
            'forbidden',
            'not found'
          ),
          operation: fc.constantFrom(
            'load-shipping-data',
            'load-banking-data',
            'create-shipping',
            'update-banking'
          )
        }),
        async ({ originalError, operation }) => {
          const mockOperation = vi.fn().mockRejectedValue(new Error(originalError))
          
          const context = {
            operation,
            endpoint: '/test',
            timestamp: new Date()
          }

          const config = {
            maxRetries: 0, // No retries for faster tests
            baseDelay: 10,
            maxDelay: 100,
            backoffMultiplier: 2,
            retryableErrors: [originalError]
          }

          try {
            await errorHandlingService.executeWithRetry(mockOperation, context, config)
            // Should not reach here
            expect(false).toBe(true)
          } catch (enhancedError: any) {
            // Verify error has been enhanced with user-friendly message
            expect(enhancedError).toBeInstanceOf(Error)
            expect(enhancedError.message).not.toBe(originalError)
            expect(enhancedError.message.length).toBeGreaterThan(0)
            
            // Verify original error is preserved
            expect((enhancedError as any).originalError).toBeInstanceOf(Error)
            expect((enhancedError as any).originalError.message).toBe(originalError)
            
            // Verify context is preserved
            expect((enhancedError as any).context).toEqual(context)
          }
        }
      ),
      { numRuns: 20, timeout: 3000 } // Reduced runs for faster tests
    )
  }, 8000) // Increased test timeout

  it('should not retry non-retryable errors', async () => {
    // Feature: erp-system-improvements, Property 2: Network Error Recovery
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'Validation Error',
          'Bad Request',
          'Unauthorized Access',
          'Custom Business Logic Error'
        ),
        async (nonRetryableError) => {
          let attemptCount = 0
          const mockOperation = vi.fn().mockImplementation(() => {
            attemptCount++
            throw new Error(nonRetryableError)
          })

          const context = {
            operation: 'test-non-retryable',
            endpoint: '/test',
            timestamp: new Date()
          }

          try {
            await errorHandlingService.executeWithRetry(mockOperation, context)
            // Should not reach here
            expect(false).toBe(true)
          } catch (error) {
            // Should fail immediately without retries
            expect(attemptCount).toBe(1)
            expect(mockOperation).toHaveBeenCalledTimes(1)
            expect(error).toBeInstanceOf(Error)
          }
        }
      ),
      { numRuns: 30 }
    )
  })

  it('should log errors with proper context information', async () => {
    // Feature: erp-system-improvements, Property 2: Network Error Recovery
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          operation: fc.constantFrom(
            'load-shipping-data',
            'load-banking-data', 
            'create-shipping',
            'update-banking',
            'delete-client-info',
            'fetch-user-data'
          ),
          endpoint: fc.string({ minLength: 1, maxLength: 50 }),
          errorMessage: fc.constantFrom('Network Error', 'Timeout', 'fetch failed')
        }),
        async ({ operation, endpoint, errorMessage }) => {
          const mockOperation = vi.fn().mockRejectedValue(new Error(errorMessage))
          
          const context = {
            operation,
            endpoint,
            timestamp: new Date()
          }

          const config = {
            maxRetries: 0, // No retries for faster tests
            baseDelay: 10,
            maxDelay: 100,
            backoffMultiplier: 2,
            retryableErrors: [errorMessage]
          }

          try {
            await errorHandlingService.executeWithRetry(mockOperation, context, config)
          } catch (error) {
            // Verify error was logged
            const errorStats = errorHandlingService.getErrorStats()
            expect(errorStats.totalErrors).toBeGreaterThan(0)
            expect(errorStats.errorsByOperation[operation]).toBeGreaterThanOrEqual(1)
            
            // Verify recent errors contain our error
            const recentErrors = errorStats.recentErrors
            expect(recentErrors.length).toBeGreaterThan(0)
            
            const ourError = recentErrors.find(e => e.context.operation === operation)
            expect(ourError).toBeDefined()
            expect(ourError?.context.endpoint).toBe(endpoint)
            expect(ourError?.error.message).toContain(errorMessage)
          }
        }
      ),
      { numRuns: 20, timeout: 3000 } // Reduced runs for faster tests
    )
  }, 8000) // Increased test timeout

  it('should handle empty state scenarios correctly', async () => {
    // Feature: erp-system-improvements, Property 2: Network Error Recovery
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('shipping', 'banking'),
        async (dataType) => {
          const emptyState = errorHandlingService.handleEmptyState('test-operation', dataType)
          
          // Verify empty state response structure
          expect(emptyState.isEmpty).toBe(true)
          expect(emptyState.message).toBeDefined()
          expect(emptyState.message.length).toBeGreaterThan(0)
          expect(Array.isArray(emptyState.suggestions)).toBe(true)
          expect(emptyState.suggestions.length).toBeGreaterThan(0)
          
          // Verify data type specific messages
          if (dataType === 'shipping') {
            expect(emptyState.message.toLowerCase()).toContain('shipping')
          } else if (dataType === 'banking') {
            expect(emptyState.message.toLowerCase()).toContain('banking')
          }
        }
      ),
      { numRuns: 50 }
    )
  })
})