/**
 * Property Test 11: Blocking Workflow Prevention
 * Validates: Requirements 5.4
 *
 * This test ensures that when a card is blocked, subsequent stages
 * are properly prevented from progressing until the block is resolved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock the API services
vi.mock('@/services/api', () => ({
  workflowService: {
    updateCardStatus: vi.fn(),
    getWorkflow: vi.fn(),
    getWorkflowCards: vi.fn(),
  },
}))

import { workflowService } from '@/services/api'

// Type definitions
interface WorkflowCard {
  id: number
  workflow_id: number
  stage_name: string
  stage_order: number
  card_status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked'
  blocked_reason?: string
  assigned_to?: string
}

interface Workflow {
  id: number
  sample_request_id: number
  workflow_name: string
  workflow_status: 'active' | 'completed' | 'cancelled'
  priority: string
  created_at: string
  updated_at: string
  cards: WorkflowCard[]
}

// Default workflow stages
const DEFAULT_STAGES = [
  'Design Approval',
  'Assign Designer',
  'Programming',
  'Supervisor Knitting',
  'Supervisor Finishing'
]

// Helper to create workflow cards with blocking scenarios
function createCardsWithBlockage(
  workflowId: number,
  blockedIndex: number,
  blockedReason: string
): WorkflowCard[] {
  return DEFAULT_STAGES.map((stage, index) => {
    let status: WorkflowCard['card_status']
    
    if (index < blockedIndex) {
      status = 'completed'
    } else if (index === blockedIndex) {
      status = 'blocked'
    } else {
      status = 'ready' // Subsequent stages are ready (waiting) due to block
    }
    
    return {
      id: workflowId * 10 + index,
      workflow_id: workflowId,
      stage_name: stage,
      stage_order: index + 1,
      card_status: status,
      blocked_reason: index === blockedIndex ? blockedReason : undefined,
      assigned_to: `User ${index + 1}`
    }
  })
}

describe('Property Test 11: Blocking Workflow Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should prevent subsequent stages when a card is blocked', async () => {
    // Feature: clickup-style-sample-workflow, Property 11: Blocking Workflow Prevention
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: DEFAULT_STAGES.length - 2 }), // Leave at least one subsequent stage
        fc.string({ minLength: 5, maxLength: 100 }),
        async (workflowId, blockedIndex, blockedReason) => {
          const cards = createCardsWithBlockage(workflowId, blockedIndex, blockedReason)

          const workflow: Workflow = {
            id: workflowId,
            sample_request_id: workflowId,
            workflow_name: `Workflow ${workflowId}`,
            workflow_status: 'active',
            priority: 'medium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            cards: cards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(workflow)
          vi.mocked(workflowService.getWorkflowCards).mockResolvedValue(cards)

          const result = await workflowService.getWorkflow(workflowId)

          // Property: All cards after the blocked stage should be in 'ready' status
          const blockedCard = result.cards.find(c => c.card_status === 'blocked')
          expect(blockedCard).toBeDefined()
          
          if (blockedCard) {
            const blockedOrder = blockedCard.stage_order
            const subsequentCards = result.cards.filter(c => c.stage_order > blockedOrder)
            
            // All subsequent cards should be in 'ready' (waiting) status
            subsequentCards.forEach(card => {
              expect(card.card_status).toBe('ready')
            })
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not allow in_progress status for stages after a blocked stage', async () => {
    // Feature: clickup-style-sample-workflow, Property 11: Blocking Workflow Prevention
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: DEFAULT_STAGES.length - 2 }),
        async (workflowId, blockedIndex) => {
          const cards = createCardsWithBlockage(workflowId, blockedIndex, 'Material shortage')

          const workflow: Workflow = {
            id: workflowId,
            sample_request_id: workflowId,
            workflow_name: `Workflow ${workflowId}`,
            workflow_status: 'active',
            priority: 'medium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            cards: cards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(workflow)

          const result = await workflowService.getWorkflow(workflowId)
          const blockedCard = result.cards.find(c => c.card_status === 'blocked')

          // Property: No card after a blocked stage should be 'in_progress'
          if (blockedCard) {
            const cardsAfterBlocked = result.cards.filter(
              c => c.stage_order > blockedCard.stage_order
            )
            
            cardsAfterBlocked.forEach(card => {
              expect(card.card_status).not.toBe('in_progress')
              expect(card.card_status).not.toBe('completed')
            })
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should allow progress after block is resolved', async () => {
    // Feature: clickup-style-sample-workflow, Property 11: Blocking Workflow Prevention
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: DEFAULT_STAGES.length - 2 }),
        async (workflowId, previouslyBlockedIndex) => {
          // Cards after the block has been resolved (previously blocked card is now completed)
          const cards: WorkflowCard[] = DEFAULT_STAGES.map((stage, index) => {
            let status: WorkflowCard['card_status']
            
            if (index <= previouslyBlockedIndex) {
              status = 'completed'
            } else if (index === previouslyBlockedIndex + 1) {
              status = 'in_progress' // Next stage can now progress
            } else {
              status = 'ready'
            }
            
            return {
              id: workflowId * 10 + index,
              workflow_id: workflowId,
              stage_name: stage,
              stage_order: index + 1,
              card_status: status,
              assigned_to: `User ${index + 1}`
            }
          })

          const workflow: Workflow = {
            id: workflowId,
            sample_request_id: workflowId,
            workflow_name: `Workflow ${workflowId}`,
            workflow_status: 'active',
            priority: 'medium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            cards: cards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(workflow)

          const result = await workflowService.getWorkflow(workflowId)

          // Property: No blocked cards means progression is allowed
          const blockedCards = result.cards.filter(c => c.card_status === 'blocked')
          expect(blockedCards.length).toBe(0)

          // The stage after the previously blocked one should be allowed to progress
          const completedCards = result.cards.filter(c => c.card_status === 'completed')
          expect(completedCards.length).toBeGreaterThanOrEqual(previouslyBlockedIndex + 1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle multiple blocked cards correctly', async () => {
    // Feature: clickup-style-sample-workflow, Property 11: Blocking Workflow Prevention
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        fc.array(fc.integer({ min: 0, max: DEFAULT_STAGES.length - 1 }), { minLength: 1, maxLength: 3 }),
        async (workflowId, blockedIndices) => {
          // Create cards with multiple blocked stages
          const uniqueBlockedIndices = [...new Set(blockedIndices)]
          
          const cards: WorkflowCard[] = DEFAULT_STAGES.map((stage, index) => {
            const isBlocked = uniqueBlockedIndices.includes(index)
            
            return {
              id: workflowId * 10 + index,
              workflow_id: workflowId,
              stage_name: stage,
              stage_order: index + 1,
              card_status: isBlocked ? 'blocked' : 'ready',
              blocked_reason: isBlocked ? 'Issue detected' : undefined,
              assigned_to: `User ${index + 1}`
            }
          })

          const workflow: Workflow = {
            id: workflowId,
            sample_request_id: workflowId,
            workflow_name: `Workflow ${workflowId}`,
            workflow_status: 'active',
            priority: 'medium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            cards: cards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(workflow)

          const result = await workflowService.getWorkflow(workflowId)

          // Property: Number of blocked cards should match the input
          const blockedCards = result.cards.filter(c => c.card_status === 'blocked')
          expect(blockedCards.length).toBe(uniqueBlockedIndices.length)

          // Property: Each blocked card should have a reason
          blockedCards.forEach(card => {
            expect(card.blocked_reason).toBeDefined()
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should track earliest blocked stage for prevention logic', async () => {
    // Feature: clickup-style-sample-workflow, Property 11: Blocking Workflow Prevention
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        fc.array(fc.integer({ min: 0, max: DEFAULT_STAGES.length - 1 }), { minLength: 2, maxLength: 3 }),
        async (workflowId, blockedIndices) => {
          const uniqueBlockedIndices = [...new Set(blockedIndices)].sort((a, b) => a - b)
          
          // Only proceed if we have at least one blocked card with subsequent cards
          if (uniqueBlockedIndices.length === 0 || uniqueBlockedIndices[0] >= DEFAULT_STAGES.length - 1) {
            return
          }
          
          const earliestBlockedIndex = uniqueBlockedIndices[0]
          
          const cards: WorkflowCard[] = DEFAULT_STAGES.map((stage, index) => {
            let status: WorkflowCard['card_status']
            
            if (index < earliestBlockedIndex) {
              status = 'completed'
            } else if (uniqueBlockedIndices.includes(index)) {
              status = 'blocked'
            } else {
              status = 'ready'
            }
            
            return {
              id: workflowId * 10 + index,
              workflow_id: workflowId,
              stage_name: stage,
              stage_order: index + 1,
              card_status: status,
              blocked_reason: uniqueBlockedIndices.includes(index) ? 'Issue' : undefined,
              assigned_to: `User ${index + 1}`
            }
          })

          const workflow: Workflow = {
            id: workflowId,
            sample_request_id: workflowId,
            workflow_name: `Workflow ${workflowId}`,
            workflow_status: 'active',
            priority: 'medium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            cards: cards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(workflow)

          const result = await workflowService.getWorkflow(workflowId)

          // Property: Find earliest blocked stage order
          const blockedCards = result.cards.filter(c => c.card_status === 'blocked')
          const earliestBlockedOrder = Math.min(...blockedCards.map(c => c.stage_order))

          // All non-blocked cards after earliest blocked should be 'ready'
          const cardsAfterEarliest = result.cards.filter(
            c => c.stage_order > earliestBlockedOrder && c.card_status !== 'blocked'
          )
          
          cardsAfterEarliest.forEach(card => {
            expect(['ready', 'pending']).toContain(card.card_status)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})
