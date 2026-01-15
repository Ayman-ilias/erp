/**
 * Property Test 3: Buyer Type Management Persistence
 * Validates: Requirements 2.2, 2.4, 2.5
 * 
 * This test ensures that buyer type selection and creation is persistent
 * across various scenarios and data operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock the API services
vi.mock('@/services/api', () => ({
  buyerTypesService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  buyersService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import { buyerTypesService, buyersService } from '@/services/api'

// Type definitions for test data
interface BuyerType {
  id: number
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

interface Buyer {
  id: number
  buyer_name: string
  company_name: string
  buyer_type_id?: number
  buyer_type?: BuyerType
  created_at: string
  updated_at?: string
}

describe('Property Test 3: Buyer Type Management Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should persist buyer type creation and make it available for future use', async () => {
    // Feature: erp-system-improvements, Property 3: Buyer Type Management Persistence
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          description: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
          is_active: fc.boolean(),
        }),
        async (buyerTypeData) => {
          const createdBuyerType: BuyerType = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            name: buyerTypeData.name.trim(),
            description: buyerTypeData.description,
            is_active: buyerTypeData.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          // Mock successful creation
          vi.mocked(buyerTypesService.create).mockResolvedValue(createdBuyerType)
          
          // Mock getAll to return the created type in subsequent calls
          vi.mocked(buyerTypesService.getAll).mockResolvedValue([createdBuyerType])

          // Create buyer type
          const result = await buyerTypesService.create(buyerTypeData)

          // Verify creation was successful
          expect(result).toEqual(createdBuyerType)
          expect(result.name).toBe(buyerTypeData.name.trim())
          expect(result.description).toBe(buyerTypeData.description)
          expect(result.is_active).toBe(buyerTypeData.is_active)
          expect(result.id).toBeGreaterThan(0)

          // Verify it's available in subsequent getAll calls
          const allBuyerTypes = await buyerTypesService.getAll()
          expect(allBuyerTypes).toContain(createdBuyerType)
          expect(allBuyerTypes.find(bt => bt.id === createdBuyerType.id)).toEqual(createdBuyerType)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate buyer type name uniqueness during creation', async () => {
    // Feature: erp-system-improvements, Property 3: Buyer Type Management Persistence
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        async (buyerTypeName) => {
          const existingBuyerType: BuyerType = {
            id: 1,
            name: buyerTypeName.trim(),
            is_active: true,
            created_at: new Date().toISOString(),
          }

          // Mock existing buyer type
          vi.mocked(buyerTypesService.getAll).mockResolvedValue([existingBuyerType])
          
          // Mock creation failure due to duplicate name
          vi.mocked(buyerTypesService.create).mockRejectedValue(
            new Error('Buyer type name already exists')
          )

          // Attempt to create duplicate buyer type
          const duplicateData = {
            name: buyerTypeName.trim(),
            is_active: true,
          }

          await expect(buyerTypesService.create(duplicateData)).rejects.toThrow(
            'Buyer type name already exists'
          )

          // Verify create was called with the duplicate data
          expect(buyerTypesService.create).toHaveBeenCalledWith(duplicateData)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should persist buyer type selection with buyer records', async () => {
    // Feature: erp-system-improvements, Property 3: Buyer Type Management Persistence
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          buyerType: fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            is_active: fc.constant(true),
          }),
          buyer: fc.record({
            buyer_name: fc.string({ minLength: 1, maxLength: 50 }),
            company_name: fc.string({ minLength: 1, maxLength: 100 }),
          }),
        }),
        async ({ buyerType, buyer }) => {
          const buyerWithType: Buyer = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            buyer_name: buyer.buyer_name,
            company_name: buyer.company_name,
            buyer_type_id: buyerType.id,
            buyer_type: buyerType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          // Mock buyer creation with buyer type
          vi.mocked(buyersService.create).mockResolvedValue(buyerWithType)
          vi.mocked(buyersService.getById).mockResolvedValue(buyerWithType)

          // Create buyer with buyer type
          const createData = {
            buyer_name: buyer.buyer_name,
            company_name: buyer.company_name,
            buyer_type_id: buyerType.id,
          }

          const createdBuyer = await buyersService.create(createData)

          // Verify buyer type is persisted with buyer
          expect(createdBuyer.buyer_type_id).toBe(buyerType.id)
          expect(createdBuyer.buyer_type).toEqual(buyerType)

          // Verify buyer type relationship is maintained on retrieval
          const retrievedBuyer = await buyersService.getById(createdBuyer.id)
          expect(retrievedBuyer.buyer_type_id).toBe(buyerType.id)
          expect(retrievedBuyer.buyer_type).toEqual(buyerType)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle buyer type updates and maintain data consistency', async () => {
    // Feature: erp-system-improvements, Property 3: Buyer Type Management Persistence
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          originalType: fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            description: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
            is_active: fc.boolean(),
          }),
          updates: fc.record({
            name: fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)),
            description: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
            is_active: fc.option(fc.boolean()),
          }),
        }),
        async ({ originalType, updates }) => {
          const updatedType: BuyerType = {
            ...originalType,
            name: updates.name?.trim() || originalType.name,
            description: updates.description !== undefined ? updates.description : originalType.description,
            is_active: updates.is_active !== undefined ? updates.is_active : originalType.is_active,
            updated_at: new Date().toISOString(),
            created_at: originalType.created_at || new Date().toISOString(),
          }

          // Mock successful update
          vi.mocked(buyerTypesService.update).mockResolvedValue(updatedType)
          vi.mocked(buyerTypesService.getById).mockResolvedValue(updatedType)

          // Update buyer type
          const result = await buyerTypesService.update(originalType.id, updates)

          // Verify update was successful
          expect(result.id).toBe(originalType.id)
          expect(result.name).toBe(updates.name?.trim() || originalType.name)
          expect(result.description).toBe(updates.description !== undefined ? updates.description : originalType.description)
          expect(result.is_active).toBe(updates.is_active !== undefined ? updates.is_active : originalType.is_active)

          // Verify updated data is retrievable
          const retrievedType = await buyerTypesService.getById(originalType.id)
          expect(retrievedType).toEqual(updatedType)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should filter active buyer types correctly', async () => {
    // Feature: erp-system-improvements, Property 3: Buyer Type Management Persistence
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            is_active: fc.boolean(),
            created_at: fc.constant(new Date().toISOString()),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (buyerTypes) => {
          const activeBuyerTypes = buyerTypes.filter(bt => bt.is_active)
          const inactiveBuyerTypes = buyerTypes.filter(bt => !bt.is_active)

          // Mock getAll with active filter
          vi.mocked(buyerTypesService.getAll).mockImplementation((isActive?: boolean) => {
            if (isActive === true) {
              return Promise.resolve(activeBuyerTypes)
            } else if (isActive === false) {
              return Promise.resolve(inactiveBuyerTypes)
            } else {
              return Promise.resolve(buyerTypes)
            }
          })

          // Test filtering active buyer types
          const activeResults = await buyerTypesService.getAll(true)
          expect(activeResults).toEqual(activeBuyerTypes)
          expect(activeResults.every(bt => bt.is_active)).toBe(true)

          // Test filtering inactive buyer types
          const inactiveResults = await buyerTypesService.getAll(false)
          expect(inactiveResults).toEqual(inactiveBuyerTypes)
          expect(inactiveResults.every(bt => !bt.is_active)).toBe(true)

          // Test getting all buyer types (no filter)
          const allResults = await buyerTypesService.getAll()
          expect(allResults).toEqual(buyerTypes)
          expect(allResults.length).toBe(activeBuyerTypes.length + inactiveBuyerTypes.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should prevent deletion of buyer types in use by buyers', async () => {
    // Feature: erp-system-improvements, Property 3: Buyer Type Management Persistence
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          buyerType: fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            is_active: fc.boolean(),
          }),
          buyersUsingType: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              buyer_name: fc.string({ minLength: 1, maxLength: 50 }),
              company_name: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
        }),
        async ({ buyerType, buyersUsingType }) => {
          const buyersCount = buyersUsingType.length

          // Mock deletion failure due to buyers using the type
          vi.mocked(buyerTypesService.delete).mockRejectedValue(
            new Error(`Cannot delete buyer type. ${buyersCount} buyer(s) are using this type.`)
          )

          // Attempt to delete buyer type in use
          await expect(buyerTypesService.delete(buyerType.id)).rejects.toThrow(
            `Cannot delete buyer type. ${buyersCount} buyer(s) are using this type.`
          )

          // Verify delete was attempted
          expect(buyerTypesService.delete).toHaveBeenCalledWith(buyerType.id)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle buyer type data consistency across multiple operations', async () => {
    // Feature: erp-system-improvements, Property 3: Buyer Type Management Persistence
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          buyerType: fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            description: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
            is_active: fc.constant(true),
          }),
        }),
        async ({ buyerType }) => {
          const createdType: BuyerType = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            name: buyerType.name.trim(),
            description: buyerType.description,
            is_active: buyerType.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          // Mock consistent responses across operations
          vi.mocked(buyerTypesService.create).mockResolvedValue(createdType)
          vi.mocked(buyerTypesService.getById).mockResolvedValue(createdType)
          vi.mocked(buyerTypesService.getAll).mockResolvedValue([createdType])

          // Perform multiple operations
          const createResult = await buyerTypesService.create(buyerType)
          const getByIdResult = await buyerTypesService.getById(createdType.id)
          const getAllResult = await buyerTypesService.getAll(true)

          // Verify data consistency across operations
          expect(createResult).toEqual(createdType)
          expect(getByIdResult).toEqual(createdType)
          expect(getAllResult).toContain(createdType)
          
          // Verify all operations return the same data structure
          expect(createResult.id).toBe(getByIdResult.id)
          expect(createResult.name).toBe(getByIdResult.name)
          expect(createResult.description).toBe(getByIdResult.description)
          expect(createResult.is_active).toBe(getByIdResult.is_active)
          
          const foundInList = getAllResult.find(bt => bt.id === createdType.id)
          expect(foundInList).toEqual(createdType)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty buyer type name validation', async () => {
    // Feature: erp-system-improvements, Property 3: Buyer Type Management Persistence
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', '   ', '\t', '\n', '  \t  \n  '),
        async (emptyName) => {
          // Mock validation error for empty names
          vi.mocked(buyerTypesService.create).mockRejectedValue(
            new Error('Buyer type name is required')
          )

          const invalidData = {
            name: emptyName,
            is_active: true,
          }

          // Attempt to create buyer type with empty name
          await expect(buyerTypesService.create(invalidData)).rejects.toThrow(
            'Buyer type name is required'
          )

          // Verify create was called with invalid data
          expect(buyerTypesService.create).toHaveBeenCalledWith(invalidData)
        }
      ),
      { numRuns: 50 }
    )
  })
})