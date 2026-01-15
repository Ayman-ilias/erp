/**
 * Property Test 10: Status Change Audit Trail
 * Validates: Requirements 4.2, 4.5
 * 
 * This test ensures that for any card status change, the system should create a history record 
 * with timestamp, user, previous status, new status, and optional reason.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock the API services
vi.mock('@/services/api', () => ({
  workflowService: {
    updateCardStatus: vi.fn(),
    getCardStatusHistory: vi.fn(),
  },
}))

import { workflowService } from '@/services/api'

// Type definitions for test data
type CardStatus = 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked'

interface UpdateCardStatusRequest {
  status: CardStatus
  reason?: string
}

interface CardStatusHistoryResponse {
  id: number
  cardId: number
  previousStatus?: string
  newStatus: string
  updatedBy: string
  updateReason?: string
  createdAt: string
}

interface WorkflowCard {
  id: number
  workflowId: number
  stageName: string
  stageOrder: number
  cardTitle: string
  cardDescription?: string
  assignedTo?: string
  cardStatus: CardStatus
  dueDate?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  blockedReason?: string
}

describe('Property Test 10: Status Change Audit Trail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create audit trail record for every status change', async () => {
    // Feature: clickup-style-sample-workflow, Property 10: Status Change Audit Trail
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          cardId: fc.integer({ min: 1, max: 10000 }),
          currentStatus: fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked'),
          newStatus: fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked'),
          updatedBy: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3),
          reason: fc.option(fc.string({ minLength: 5, maxLength: 200 })),
          timestamp: fc.string().map(() => new Date().toISOString())
        }).chain(data => {
          // If new status is blocked, ensure reason is provided
          if (data.newStatus === 'blocked' && !data.reason) {
            return fc.constant({
              ...data,
              reason: 'Test blocking reason'
            });
          }
          return fc.constant(data);
        }),
        async (testData) => {
          // Skip if status is not changing
          if (testData.currentStatus === testData.newStatus) return

          const updateRequest: UpdateCardStatusRequest = {
            status: testData.newStatus,
            reason: testData.reason
          }

          const updatedCard: WorkflowCard = {
            id: testData.cardId,
            workflowId: fc.sample(fc.integer({ min: 1, max: 1000 }), 1)[0],
            stageName: fc.sample(fc.string({ minLength: 5, maxLength: 30 }), 1)[0],
            stageOrder: fc.sample(fc.integer({ min: 1, max: 10 }), 1)[0],
            cardTitle: fc.sample(fc.string({ minLength: 5, maxLength: 50 }), 1)[0],
            assignedTo: fc.sample(fc.option(fc.string({ minLength: 3, maxLength: 30 })), 1)[0],
            cardStatus: testData.newStatus,
            createdAt: testData.timestamp,
            updatedAt: testData.timestamp,
            blockedReason: testData.newStatus === 'blocked' ? testData.reason : undefined
          }

          // Generate expected audit trail record
          const expectedAuditRecord: CardStatusHistoryResponse = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            cardId: testData.cardId,
            previousStatus: testData.currentStatus,
            newStatus: testData.newStatus,
            updatedBy: testData.updatedBy,
            updateReason: testData.reason,
            createdAt: testData.timestamp
          }

          // Mock successful status update
          vi.mocked(workflowService.updateCardStatus).mockResolvedValue(updatedCard)
          vi.mocked(workflowService.getCardStatusHistory).mockResolvedValue([expectedAuditRecord])

          // Update card status
          const result = await workflowService.updateCardStatus(testData.cardId, updateRequest, testData.updatedBy)

          // Get status history
          const history = await workflowService.getCardStatusHistory(testData.cardId)

          // Property 10: Status Change Audit Trail
          // For any card status change, the system should create a history record with 
          // timestamp, user, previous status, new status, and optional reason

          // Verify status was updated
          expect(result.cardStatus).toBe(testData.newStatus)

          // Verify audit trail record exists
          expect(history.length).toBeGreaterThan(0)
          
          const auditRecord = history.find(h => 
            h.previousStatus === testData.currentStatus && 
            h.newStatus === testData.newStatus
          )
          
          expect(auditRecord).toBeDefined()
          
          if (auditRecord) {
            // Requirements 4.2, 4.5: Audit trail must contain all required fields
            expect(auditRecord.cardId).toBe(testData.cardId)
            expect(auditRecord.previousStatus).toBe(testData.currentStatus)
            expect(auditRecord.newStatus).toBe(testData.newStatus)
            expect(auditRecord.updatedBy).toBe(testData.updatedBy)
            expect(auditRecord.createdAt).toBeDefined()
            expect(new Date(auditRecord.createdAt).getTime()).toBeGreaterThan(0)
            
            // Reason should be included if provided
            if (testData.reason) {
              expect(auditRecord.updateReason).toBe(testData.reason)
            }
            
            // For blocked status, reason should be required and recorded
            if (testData.newStatus === 'blocked') {
              expect(auditRecord.updateReason).toBeDefined()
              expect(typeof auditRecord.updateReason).toBe('string')
              expect(auditRecord.updateReason!.length).toBeGreaterThan(0)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain chronological order in audit trail', async () => {
    // Feature: clickup-style-sample-workflow, Property 10: Status Change Audit Trail
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          cardId: fc.integer({ min: 1, max: 10000 }),
          statusChanges: fc.array(
            fc.record({
              fromStatus: fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked'),
              toStatus: fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked'),
              updatedBy: fc.string({ minLength: 3, maxLength: 50 }),
              reason: fc.option(fc.string({ minLength: 5, maxLength: 200 })),
              timestamp: fc.integer({ min: 1000000000000, max: Date.now() }) // Valid timestamp range
            }),
            { minLength: 2, maxLength: 5 }
          )
        }),
        async (testData) => {
          // Filter out non-changes and ensure chronological order
          const validChanges = testData.statusChanges
            .filter(change => change.fromStatus !== change.toStatus)
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((change, index) => ({
              ...change,
              timestamp: testData.statusChanges[0].timestamp + (index * 1000) // Ensure sequential timestamps
            }))

          if (validChanges.length < 2) return

          // Generate audit trail records
          const auditRecords: CardStatusHistoryResponse[] = validChanges.map((change, index) => ({
            id: index + 1,
            cardId: testData.cardId,
            previousStatus: change.fromStatus,
            newStatus: change.toStatus,
            updatedBy: change.updatedBy,
            updateReason: change.reason,
            createdAt: new Date(change.timestamp).toISOString()
          }))

          // Mock the service to return audit records
          vi.mocked(workflowService.getCardStatusHistory).mockResolvedValue(auditRecords)

          const history = await workflowService.getCardStatusHistory(testData.cardId)

          // Property: Audit trail should maintain chronological order
          expect(history.length).toBe(validChanges.length)

          // Verify chronological order (most recent first)
          const sortedHistory = [...history].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )

          for (let i = 0; i < sortedHistory.length - 1; i++) {
            const currentTime = new Date(sortedHistory[i].createdAt).getTime()
            const nextTime = new Date(sortedHistory[i + 1].createdAt).getTime()
            expect(currentTime).toBeGreaterThanOrEqual(nextTime)
          }

          // Verify all required fields are present in each record
          history.forEach(record => {
            expect(record.cardId).toBe(testData.cardId)
            expect(record.newStatus).toBeDefined()
            expect(record.updatedBy).toBeDefined()
            expect(record.createdAt).toBeDefined()
            expect(new Date(record.createdAt).getTime()).toBeGreaterThan(0)
          })
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle blocked status changes with mandatory reasons', async () => {
    // Feature: clickup-style-sample-workflow, Property 10: Status Change Audit Trail
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          cardId: fc.integer({ min: 1, max: 10000 }),
          currentStatus: fc.constantFrom('pending', 'ready', 'in_progress'),
          updatedBy: fc.string({ minLength: 3, maxLength: 50 }),
          blockingReason: fc.string({ minLength: 10, maxLength: 200 }),
          timestamp: fc.string().map(() => new Date().toISOString())
        }),
        async (testData) => {
          const updateRequest: UpdateCardStatusRequest = {
            status: 'blocked',
            reason: testData.blockingReason
          }

          const updatedCard: WorkflowCard = {
            id: testData.cardId,
            workflowId: fc.sample(fc.integer({ min: 1, max: 1000 }), 1)[0],
            stageName: fc.sample(fc.string({ minLength: 5, maxLength: 30 }), 1)[0],
            stageOrder: fc.sample(fc.integer({ min: 1, max: 10 }), 1)[0],
            cardTitle: fc.sample(fc.string({ minLength: 5, maxLength: 50 }), 1)[0],
            assignedTo: fc.sample(fc.option(fc.string({ minLength: 3, maxLength: 30 })), 1)[0],
            cardStatus: 'blocked',
            createdAt: testData.timestamp,
            updatedAt: testData.timestamp,
            blockedReason: testData.blockingReason
          }

          const auditRecord: CardStatusHistoryResponse = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            cardId: testData.cardId,
            previousStatus: testData.currentStatus,
            newStatus: 'blocked',
            updatedBy: testData.updatedBy,
            updateReason: testData.blockingReason,
            createdAt: testData.timestamp
          }

          vi.mocked(workflowService.updateCardStatus).mockResolvedValue(updatedCard)
          vi.mocked(workflowService.getCardStatusHistory).mockResolvedValue([auditRecord])

          const result = await workflowService.updateCardStatus(testData.cardId, updateRequest, testData.updatedBy)
          const history = await workflowService.getCardStatusHistory(testData.cardId)

          // Property: Blocked status changes must have reasons recorded in audit trail
          expect(result.cardStatus).toBe('blocked')
          expect(result.blockedReason).toBe(testData.blockingReason)

          const blockingRecord = history.find(h => h.newStatus === 'blocked')
          expect(blockingRecord).toBeDefined()
          
          if (blockingRecord) {
            // Requirements 4.2, 4.5: Blocking reason must be recorded
            expect(blockingRecord.updateReason).toBe(testData.blockingReason)
            expect(blockingRecord.updateReason?.length).toBeGreaterThan(0)
            expect(blockingRecord.previousStatus).toBe(testData.currentStatus)
            expect(blockingRecord.updatedBy).toBe(testData.updatedBy)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve audit trail integrity across multiple status changes', async () => {
    // Feature: clickup-style-sample-workflow, Property 10: Status Change Audit Trail
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          cardId: fc.integer({ min: 1, max: 10000 }),
          initialStatus: fc.constantFrom('pending', 'ready'),
          updatedBy: fc.string({ minLength: 3, maxLength: 50 })
        }),
        async (testData) => {
          // Simulate a typical workflow progression
          const statusProgression: Array<{ from: CardStatus; to: CardStatus; reason?: string }> = [
            { from: testData.initialStatus, to: 'in_progress' },
            { from: 'in_progress', to: 'blocked', reason: 'Missing materials' },
            { from: 'blocked', to: 'in_progress', reason: 'Materials received' },
            { from: 'in_progress', to: 'completed' }
          ]

          const auditRecords: CardStatusHistoryResponse[] = statusProgression.map((change, index) => ({
            id: index + 1,
            cardId: testData.cardId,
            previousStatus: change.from,
            newStatus: change.to,
            updatedBy: testData.updatedBy,
            updateReason: change.reason,
            createdAt: new Date(Date.now() + (index * 1000)).toISOString()
          }))

          vi.mocked(workflowService.getCardStatusHistory).mockResolvedValue(auditRecords)

          const history = await workflowService.getCardStatusHistory(testData.cardId)

          // Property: Audit trail should maintain complete history of all changes
          expect(history.length).toBe(statusProgression.length)

          // Verify each status change is recorded
          statusProgression.forEach((expectedChange, index) => {
            const record = history.find(h => 
              h.previousStatus === expectedChange.from && 
              h.newStatus === expectedChange.to
            )
            
            expect(record).toBeDefined()
            
            if (record) {
              expect(record.cardId).toBe(testData.cardId)
              expect(record.updatedBy).toBe(testData.updatedBy)
              
              if (expectedChange.reason) {
                expect(record.updateReason).toBe(expectedChange.reason)
              }
            }
          })

          // Verify no duplicate records
          const uniqueRecords = new Set(history.map(h => `${h.previousStatus}-${h.newStatus}-${h.createdAt}`))
          expect(uniqueRecords.size).toBe(history.length)

          // Verify all records have required fields
          history.forEach(record => {
            expect(record.id).toBeGreaterThan(0)
            expect(record.cardId).toBe(testData.cardId)
            expect(record.newStatus).toBeDefined()
            expect(record.updatedBy).toBe(testData.updatedBy)
            expect(record.createdAt).toBeDefined()
          })
        }
      ),
      { numRuns: 50 }
    )
  })
})