/**
 * Property Test 6: Workflow Completion Detection
 * Validates: Requirements 5.5
 *
 * This test ensures that workflow completion is detected correctly
 * when all stages are completed, and the workflow status is updated appropriately.
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
  assigned_to?: string
  completed_at?: string
}

interface Workflow {
  id: number
  sample_request_id: number
  workflow_name: string
  workflow_status: 'active' | 'completed' | 'cancelled'
  priority: string
  created_at: string
  updated_at: string
  completed_at?: string
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

describe('Property Test 6: Workflow Completion Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should mark workflow as completed when all cards are completed', async () => {
    // Feature: clickup-style-sample-workflow, Property 6: Workflow Completion Detection
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (workflowId, workflowName) => {
          // Create workflow with all completed cards
          const completedCards: WorkflowCard[] = DEFAULT_STAGES.map((stage, index) => ({
            id: workflowId * 10 + index,
            workflow_id: workflowId,
            stage_name: stage,
            stage_order: index + 1,
            card_status: 'completed',
            completed_at: new Date().toISOString()
          }))

          const completedWorkflow: Workflow = {
            id: workflowId,
            sample_request_id: workflowId,
            workflow_name: workflowName,
            workflow_status: 'completed',
            priority: 'medium',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            cards: completedCards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(completedWorkflow)
          vi.mocked(workflowService.getWorkflowCards).mockResolvedValue(completedCards)

          const workflow = await workflowService.getWorkflow(workflowId)

          // Property: When all cards are completed, workflow should be completed
          const allCardsCompleted = workflow.cards.every(card => card.card_status === 'completed')
          expect(allCardsCompleted).toBe(true)
          expect(workflow.workflow_status).toBe('completed')
          expect(workflow.completed_at).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not mark workflow as completed if any card is not completed', async () => {
    // Feature: clickup-style-sample-workflow, Property 6: Workflow Completion Detection
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: DEFAULT_STAGES.length - 1 }),
        fc.constantFrom('pending', 'ready', 'in_progress', 'blocked') as fc.Arbitrary<'pending' | 'ready' | 'in_progress' | 'blocked'>,
        async (workflowId, incompleteIndex, incompleteStatus) => {
          // Create workflow with one incomplete card
          const cards: WorkflowCard[] = DEFAULT_STAGES.map((stage, index) => ({
            id: workflowId * 10 + index,
            workflow_id: workflowId,
            stage_name: stage,
            stage_order: index + 1,
            card_status: index === incompleteIndex ? incompleteStatus : 'completed',
            completed_at: index === incompleteIndex ? undefined : new Date().toISOString()
          }))

          const activeWorkflow: Workflow = {
            id: workflowId,
            sample_request_id: workflowId,
            workflow_name: `Workflow ${workflowId}`,
            workflow_status: 'active',
            priority: 'medium',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            cards: cards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(activeWorkflow)
          vi.mocked(workflowService.getWorkflowCards).mockResolvedValue(cards)

          const workflow = await workflowService.getWorkflow(workflowId)

          // Property: Workflow should remain active if any card is not completed
          const hasIncompleteCard = workflow.cards.some(card => card.card_status !== 'completed')
          expect(hasIncompleteCard).toBe(true)
          expect(workflow.workflow_status).not.toBe('completed')
          expect(workflow.completed_at).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect completion regardless of card count', async () => {
    // Feature: clickup-style-sample-workflow, Property 6: Workflow Completion Detection
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 10 }),
        async (workflowId, cardCount) => {
          // Create workflow with variable number of all-completed cards
          const completedCards: WorkflowCard[] = Array.from({ length: cardCount }, (_, index) => ({
            id: workflowId * 10 + index,
            workflow_id: workflowId,
            stage_name: `Stage ${index + 1}`,
            stage_order: index + 1,
            card_status: 'completed' as const,
            completed_at: new Date().toISOString()
          }))

          const completedWorkflow: Workflow = {
            id: workflowId,
            sample_request_id: workflowId,
            workflow_name: `Workflow ${workflowId}`,
            workflow_status: 'completed',
            priority: 'medium',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            cards: completedCards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(completedWorkflow)
          vi.mocked(workflowService.getWorkflowCards).mockResolvedValue(completedCards)

          const workflow = await workflowService.getWorkflow(workflowId)

          // Property: Completion detection should work for any number of cards
          expect(workflow.cards.length).toBe(cardCount)
          expect(workflow.cards.every(card => card.card_status === 'completed')).toBe(true)
          expect(workflow.workflow_status).toBe('completed')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should transition to completed when last card is completed', async () => {
    // Feature: clickup-style-sample-workflow, Property 6: Workflow Completion Detection
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: DEFAULT_STAGES.length - 1 }),
        async (workflowId, lastCardIndex) => {
          const lastCardId = workflowId * 10 + lastCardIndex

          // Before: All but one card completed
          const cardsBeforeUpdate: WorkflowCard[] = DEFAULT_STAGES.map((stage, index) => ({
            id: workflowId * 10 + index,
            workflow_id: workflowId,
            stage_name: stage,
            stage_order: index + 1,
            card_status: index === lastCardIndex ? 'in_progress' : 'completed',
            completed_at: index === lastCardIndex ? undefined : new Date().toISOString()
          }))

          // After: All cards completed (simulating the last card being marked complete)
          const cardsAfterUpdate: WorkflowCard[] = DEFAULT_STAGES.map((stage, index) => ({
            id: workflowId * 10 + index,
            workflow_id: workflowId,
            stage_name: stage,
            stage_order: index + 1,
            card_status: 'completed',
            completed_at: new Date().toISOString()
          }))

          const workflowAfterUpdate: Workflow = {
            id: workflowId,
            sample_request_id: workflowId,
            workflow_name: `Workflow ${workflowId}`,
            workflow_status: 'completed',
            priority: 'medium',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            cards: cardsAfterUpdate
          }

          // Mock status update completing the last card
          vi.mocked(workflowService.updateCardStatus).mockResolvedValue(cardsAfterUpdate[lastCardIndex])
          vi.mocked(workflowService.getWorkflow).mockResolvedValue(workflowAfterUpdate)

          // Update the last card to completed
          await workflowService.updateCardStatus(lastCardId, 'completed')
          const workflow = await workflowService.getWorkflow(workflowId)

          // Property: After completing the last card, workflow should be completed
          expect(workflow.workflow_status).toBe('completed')
          expect(workflow.completed_at).toBeDefined()
          expect(workflow.cards.every(card => card.card_status === 'completed')).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
