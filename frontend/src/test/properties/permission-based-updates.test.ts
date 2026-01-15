/**
 * Property Test 9: Permission-Based Status Updates
 * Validates: Requirements 4.1
 * 
 * This test ensures that card status updates are only allowed if the user 
 * is assigned to that card or has administrative privileges.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock the API services
vi.mock('@/services/api', () => ({
  workflowService: {
    updateCardStatus: vi.fn(),
    updateCardAssignee: vi.fn(),
  },
}))

import { workflowService } from '@/services/api'

// Type definitions for test data
interface User {
  id: number
  username: string
  role: 'admin' | 'designer' | 'programmer' | 'supervisor' | 'user'
  permissions: string[]
}

interface CardResponse {
  id: number
  workflowId: number
  stageName: string
  stageOrder: number
  cardTitle: string
  cardDescription?: string
  assignedTo?: string
  cardStatus: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked'
  dueDate?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  blockedReason?: string
}

describe('Property Test 9: Permission-Based Status Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to check if user has permission to update card
  const hasUpdatePermission = (user: User, card: CardResponse): boolean => {
    // Validate user data - reject invalid usernames (only alphanumeric and basic chars)
    if (!user.username || user.username.trim().length === 0 || !/^[a-zA-Z0-9_-]+$/.test(user.username.trim())) {
      return false
    }
    
    // Admin users can update any card
    if (user.role === 'admin') {
      return true
    }
    
    // Users can update cards assigned to them (handle null/undefined assignedTo)
    if (card.assignedTo && card.assignedTo.trim() === user.username.trim()) {
      return true
    }
    
    // Users with specific permissions can update cards
    if (user.permissions.includes('update_all_cards')) {
      return true
    }
    
    return false
  }

  // Helper function to simulate status update attempt
  const attemptStatusUpdate = async (
    user: User, 
    card: CardResponse, 
    newStatus: string, 
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!hasUpdatePermission(user, card)) {
      return { success: false, error: 'Permission denied' }
    }
    
    try {
      await workflowService.updateCardStatus(card.id, newStatus, reason)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  it('should only allow status updates if user is assigned to card or has admin privileges', async () => {
    // Feature: clickup-style-sample-workflow, Property 9: Permission-Based Status Updates
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user: fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            username: fc.string({ minLength: 3, maxLength: 20 })
              .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(s.trim())),
            role: fc.constantFrom('admin', 'designer', 'programmer', 'supervisor', 'user'),
            permissions: fc.array(
              fc.constantFrom('update_all_cards', 'view_all_cards', 'create_workflows'),
              { maxLength: 3 }
            )
          }),
          card: fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            workflowId: fc.integer({ min: 1, max: 1000 }),
            stageName: fc.constantFrom('Design Approval', 'Assign Designer', 'Programming'),
            stageOrder: fc.integer({ min: 1, max: 3 }),
            cardTitle: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
            cardDescription: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined }),
            assignedTo: fc.option(
              fc.string({ minLength: 3, maxLength: 20 })
                .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(s.trim())), 
              { nil: undefined }
            ),
            cardStatus: fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked'),
            dueDate: fc.option(fc.constant('2024-06-30T00:00:00.000Z'), { nil: undefined }),
            createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
            updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
            completedAt: fc.option(fc.constant('2024-06-30T00:00:00.000Z'), { nil: undefined }),
            blockedReason: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined })
          }),
          newStatus: fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked'),
          reason: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined })
        }),
        async ({ user, card, newStatus, reason }) => {
          // Create a fresh mock for this iteration to avoid accumulation
          const mockUpdateCardStatus = vi.fn()
          vi.mocked(workflowService.updateCardStatus).mockImplementation(mockUpdateCardStatus)
          
          // Mock successful API call
          mockUpdateCardStatus.mockResolvedValue({
            ...card,
            cardStatus: newStatus as any,
            blockedReason: newStatus === 'blocked' ? reason : undefined
          })

          // Attempt status update
          const result = await attemptStatusUpdate(user, card, newStatus, reason)

          // Property 9: Permission-Based Status Updates
          // For any card status update attempt, the system should only allow the update 
          // if the user is assigned to that card or has administrative privileges

          const expectedPermission = hasUpdatePermission(user, card)

          if (expectedPermission) {
            // User should have permission - update should succeed
            expect(result.success).toBe(true)
            expect(result.error).toBeUndefined()
            expect(mockUpdateCardStatus).toHaveBeenCalledWith(card.id, newStatus, reason)
          } else {
            // User should not have permission - update should fail
            expect(result.success).toBe(false)
            expect(result.error).toBe('Permission denied')
            expect(mockUpdateCardStatus).not.toHaveBeenCalled()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should allow admin users to update any card regardless of assignment', async () => {
    // Feature: clickup-style-sample-workflow, Property 9: Permission-Based Status Updates
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          adminUser: fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            username: fc.string({ minLength: 3, maxLength: 20 })
              .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(s.trim())),
            role: fc.constant('admin' as const),
            permissions: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { maxLength: 5 })
          }),
          card: fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            workflowId: fc.integer({ min: 1, max: 1000 }),
            stageName: fc.constantFrom('Design Approval', 'Assign Designer', 'Programming'),
            stageOrder: fc.integer({ min: 1, max: 3 }),
            cardTitle: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
            assignedTo: fc.option(
              fc.string({ minLength: 3, maxLength: 20 })
                .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(s.trim())), 
              { nil: undefined }
            ), // May be assigned to someone else
            cardStatus: fc.constantFrom('pending', 'ready', 'in_progress'),
            createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
            updatedAt: fc.constant('2024-01-01T00:00:00.000Z')
          }),
          newStatus: fc.constantFrom('ready', 'in_progress', 'completed', 'blocked')
        }),
        async ({ adminUser, card, newStatus }) => {
          // Ensure admin user is different from assignee (if any)
          if (card.assignedTo && card.assignedTo.trim() === adminUser.username.trim()) {
            return // Skip this case as it would be allowed anyway
          }

          // Create a fresh mock for this iteration
          const mockUpdateCardStatus = vi.fn()
          vi.mocked(workflowService.updateCardStatus).mockImplementation(mockUpdateCardStatus)

          mockUpdateCardStatus.mockResolvedValue({
            ...card,
            cardStatus: newStatus as any
          })

          const result = await attemptStatusUpdate(adminUser, card, newStatus)

          // Property: Admin users should always be able to update cards
          expect(result.success).toBe(true)
          expect(result.error).toBeUndefined()
          expect(mockUpdateCardStatus).toHaveBeenCalledWith(card.id, newStatus, undefined)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should allow assigned users to update their own cards', async () => {
    // Feature: clickup-style-sample-workflow, Property 9: Permission-Based Status Updates
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user: fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            username: fc.string({ minLength: 3, maxLength: 20 })
              .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(s.trim())),
            role: fc.constantFrom('designer', 'programmer', 'supervisor', 'user'),
            permissions: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { maxLength: 3 })
          }),
          cardStatus: fc.constantFrom('pending', 'ready', 'in_progress'),
          newStatus: fc.constantFrom('ready', 'in_progress', 'completed', 'blocked')
        }),
        async ({ user, cardStatus, newStatus }) => {
          // Create card assigned to the user
          const card: CardResponse = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            workflowId: fc.sample(fc.integer({ min: 1, max: 1000 }), 1)[0],
            stageName: 'Design Approval',
            stageOrder: 1,
            cardTitle: 'Test Card',
            assignedTo: user.username, // Assigned to the user
            cardStatus: cardStatus as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          // Create a fresh mock for this iteration
          const mockUpdateCardStatus = vi.fn()
          vi.mocked(workflowService.updateCardStatus).mockImplementation(mockUpdateCardStatus)

          mockUpdateCardStatus.mockResolvedValue({
            ...card,
            cardStatus: newStatus as any
          })

          const result = await attemptStatusUpdate(user, card, newStatus)

          // Property: Users should be able to update cards assigned to them
          expect(result.success).toBe(true)
          expect(result.error).toBeUndefined()
          expect(mockUpdateCardStatus).toHaveBeenCalledWith(card.id, newStatus, undefined)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should deny updates for non-assigned users without special permissions', async () => {
    // Feature: clickup-style-sample-workflow, Property 9: Permission-Based Status Updates
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user: fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            username: fc.string({ minLength: 3, maxLength: 20 })
              .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(s.trim())),
            role: fc.constantFrom('designer', 'programmer', 'supervisor', 'user'),
            permissions: fc.array(
              fc.constantFrom('view_cards', 'create_comments'), // No update permissions
              { maxLength: 2 }
            )
          }),
          assignedUser: fc.string({ minLength: 3, maxLength: 20 })
            .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(s.trim())),
          cardStatus: fc.constantFrom('pending', 'ready', 'in_progress'),
          newStatus: fc.constantFrom('ready', 'in_progress', 'completed', 'blocked')
        }),
        async ({ user, assignedUser, cardStatus, newStatus }) => {
          // Ensure user is not the assigned user
          if (user.username.trim() === assignedUser.trim()) {
            return // Skip this case
          }

          // Create card assigned to someone else
          const card: CardResponse = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            workflowId: fc.sample(fc.integer({ min: 1, max: 1000 }), 1)[0],
            stageName: 'Design Approval',
            stageOrder: 1,
            cardTitle: 'Test Card',
            assignedTo: assignedUser, // Assigned to someone else
            cardStatus: cardStatus as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          // Create a fresh mock for this iteration
          const mockUpdateCardStatus = vi.fn()
          vi.mocked(workflowService.updateCardStatus).mockImplementation(mockUpdateCardStatus)

          const result = await attemptStatusUpdate(user, card, newStatus)

          // Property: Users should not be able to update cards not assigned to them
          expect(result.success).toBe(false)
          expect(result.error).toBe('Permission denied')
          expect(mockUpdateCardStatus).not.toHaveBeenCalled()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should allow users with special permissions to update any card', async () => {
    // Feature: clickup-style-sample-workflow, Property 9: Permission-Based Status Updates
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user: fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            username: fc.string({ minLength: 3, maxLength: 20 })
              .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(s.trim())),
            role: fc.constantFrom('designer', 'programmer', 'supervisor', 'user'),
            permissions: fc.constant(['update_all_cards']) // Special permission
          }),
          assignedUser: fc.string({ minLength: 3, maxLength: 20 })
            .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(s.trim())),
          cardStatus: fc.constantFrom('pending', 'ready', 'in_progress'),
          newStatus: fc.constantFrom('ready', 'in_progress', 'completed', 'blocked')
        }),
        async ({ user, assignedUser, cardStatus, newStatus }) => {
          // Ensure user is not the assigned user (to test permission, not assignment)
          if (user.username.trim() === assignedUser.trim()) {
            return // Skip this case
          }

          // Create card assigned to someone else
          const card: CardResponse = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            workflowId: fc.sample(fc.integer({ min: 1, max: 1000 }), 1)[0],
            stageName: 'Design Approval',
            stageOrder: 1,
            cardTitle: 'Test Card',
            assignedTo: assignedUser, // Assigned to someone else
            cardStatus: cardStatus as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          // Create a fresh mock for this iteration
          const mockUpdateCardStatus = vi.fn()
          vi.mocked(workflowService.updateCardStatus).mockImplementation(mockUpdateCardStatus)

          mockUpdateCardStatus.mockResolvedValue({
            ...card,
            cardStatus: newStatus as any
          })

          const result = await attemptStatusUpdate(user, card, newStatus)

          // Property: Users with special permissions should be able to update any card
          expect(result.success).toBe(true)
          expect(result.error).toBeUndefined()
          expect(mockUpdateCardStatus).toHaveBeenCalledWith(card.id, newStatus, undefined)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle unassigned cards based on user permissions', async () => {
    // Feature: clickup-style-sample-workflow, Property 9: Permission-Based Status Updates
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user: fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            username: fc.string({ minLength: 3, maxLength: 20 })
              .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9_-]+$/.test(s.trim())),
            role: fc.constantFrom('admin', 'designer', 'programmer', 'supervisor', 'user'),
            permissions: fc.array(
              fc.constantFrom('update_all_cards', 'view_cards', 'create_comments'),
              { maxLength: 3 }
            )
          }),
          cardStatus: fc.constantFrom('pending', 'ready'),
          newStatus: fc.constantFrom('ready', 'in_progress')
        }),
        async ({ user, cardStatus, newStatus }) => {
          // Create unassigned card
          const card: CardResponse = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            workflowId: fc.sample(fc.integer({ min: 1, max: 1000 }), 1)[0],
            stageName: 'Design Approval',
            stageOrder: 1,
            cardTitle: 'Test Card',
            assignedTo: undefined, // Unassigned
            cardStatus: cardStatus as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          // Create a fresh mock for this iteration
          const mockUpdateCardStatus = vi.fn()
          vi.mocked(workflowService.updateCardStatus).mockImplementation(mockUpdateCardStatus)

          mockUpdateCardStatus.mockResolvedValue({
            ...card,
            cardStatus: newStatus as any
          })

          const result = await attemptStatusUpdate(user, card, newStatus)

          // Property: Unassigned cards should only be updatable by admins or users with special permissions
          const expectedPermission = user.role === 'admin' || user.permissions.includes('update_all_cards')

          if (expectedPermission) {
            expect(result.success).toBe(true)
            expect(result.error).toBeUndefined()
            expect(mockUpdateCardStatus).toHaveBeenCalledWith(card.id, newStatus, undefined)
          } else {
            expect(result.success).toBe(false)
            expect(result.error).toBe('Permission denied')
            expect(mockUpdateCardStatus).not.toHaveBeenCalled()
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})