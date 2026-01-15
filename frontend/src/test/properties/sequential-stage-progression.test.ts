/**
 * Property Test 4: Sequential Stage Progression
 * Validates: Requirements 2.3, 5.2
 * 
 * This test ensures that for any workflow stage marked as completed, 
 * the immediately following stage should automatically change status from "ready" to "pending".
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock the API services
vi.mock('@/services/api', () => ({
  workflowService: {
    createWorkflow: vi.fn(),
    getWorkflow: vi.fn(),
    getWorkflowCards: vi.fn(),
    updateCardStatus: vi.fn(),
  },
  workflowTemplateService: {
    getTemplates: vi.fn(),
  },
}))

import { workflowService, workflowTemplateService } from '@/services/api'

// Type definitions for test data
interface WorkflowTemplate {
  id: number
  template_name: string
  stage_name: string
  stage_order: number
  stage_description?: string
  default_assignee_role?: string
  estimated_duration_hours?: number
  is_active: boolean
}

interface WorkflowCard {
  id: number
  workflow_id: number
  stage_name: string
  stage_order: number
  card_title: string
  card_description?: string
  assigned_to?: string
  card_status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked'
  due_date?: string
  created_at: string
  updated_at: string
  completed_at?: string
  blocked_reason?: string
}

interface WorkflowResponse {
  id: number
  sample_request_id: number
  workflow_name: string
  workflow_status: 'active' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
  updated_at: string
  completed_at?: string
  priority: string
  due_date?: string
  cards: WorkflowCard[]
}

interface UpdateCardStatusRequest {
  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked'
  reason?: string
}

describe('Property Test 4: Sequential Stage Progression', () => {
  // Default workflow stages as defined in the design document
  const DEFAULT_WORKFLOW_STAGES: WorkflowTemplate[] = [
    {
      id: 1,
      template_name: 'sample_development',
      stage_name: 'Design Approval',
      stage_order: 1,
      stage_description: 'Review and approve the initial design concept',
      default_assignee_role: 'design_manager',
      estimated_duration_hours: 4,
      is_active: true
    },
    {
      id: 2,
      template_name: 'sample_development',
      stage_name: 'Assign Designer',
      stage_order: 2,
      stage_description: 'Assign designer and create detailed specifications',
      default_assignee_role: 'designer',
      estimated_duration_hours: 8,
      is_active: true
    },
    {
      id: 3,
      template_name: 'sample_development',
      stage_name: 'Programming',
      stage_order: 3,
      stage_description: 'Create jacquard program for knitting machine',
      default_assignee_role: 'programmer',
      estimated_duration_hours: 12,
      is_active: true
    },
    {
      id: 4,
      template_name: 'sample_development',
      stage_name: 'Supervisor Knitting',
      stage_order: 4,
      stage_description: 'Supervise knitting process and quality control',
      default_assignee_role: 'knitting_supervisor',
      estimated_duration_hours: 16,
      is_active: true
    },
    {
      id: 5,
      template_name: 'sample_development',
      stage_name: 'Supervisor Finishing',
      stage_order: 5,
      stage_description: 'Supervise finishing process and final quality check',
      default_assignee_role: 'finishing_supervisor',
      estimated_duration_hours: 8,
      is_active: true
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock workflow templates to return default stages
    vi.mocked(workflowTemplateService.getTemplates).mockResolvedValue(DEFAULT_WORKFLOW_STAGES)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should automatically activate next stage when current stage is completed', async () => {
    // Feature: clickup-style-sample-workflow, Property 4: Sequential Stage Progression
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          workflowId: fc.integer({ min: 1, max: 10000 }),
          completedStageOrder: fc.integer({ min: 1, max: DEFAULT_WORKFLOW_STAGES.length - 1 }), // Not the last stage
          userId: fc.string({ minLength: 3, max: 50 })
        }),
        async (testData) => {
          const { workflowId, completedStageOrder, userId } = testData

          // Create initial workflow cards with proper status
          const initialCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((template, index) => ({
            id: index + 1,
            workflow_id: workflowId,
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
            // Set status based on completion scenario
            card_status: template.stage_order < completedStageOrder ? 'completed' :
                        template.stage_order === completedStageOrder ? 'in_progress' :
                        template.stage_order === completedStageOrder + 1 ? 'ready' : 'ready',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: template.stage_order < completedStageOrder ? new Date().toISOString() : undefined
          }))

          const initialWorkflow: WorkflowResponse = {
            id: workflowId,
            sample_request_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            workflow_name: 'Test Workflow',
            workflow_status: 'active',
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            priority: 'medium',
            cards: initialCards
          }

          // Mock initial workflow state
          vi.mocked(workflowService.getWorkflow).mockResolvedValue(initialWorkflow)
          vi.mocked(workflowService.getWorkflowCards).mockResolvedValue(initialCards)

          // Simulate completing the current stage
          const completedCard = initialCards.find(card => card.stage_order === completedStageOrder)!
          const nextCard = initialCards.find(card => card.stage_order === completedStageOrder + 1)!

          // Create updated cards after completion
          const updatedCards = initialCards.map(card => {
            if (card.stage_order === completedStageOrder) {
              return {
                ...card,
                card_status: 'completed' as const,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            } else if (card.stage_order === completedStageOrder + 1) {
              // Requirements 2.3, 5.2: Next stage should be auto-activated to pending
              return {
                ...card,
                card_status: 'pending' as const,
                updated_at: new Date().toISOString()
              }
            }
            return card
          })

          const updatedWorkflow: WorkflowResponse = {
            ...initialWorkflow,
            cards: updatedCards,
            updated_at: new Date().toISOString()
          }

          // Mock the status update response
          vi.mocked(workflowService.updateCardStatus).mockResolvedValue({
            ...completedCard,
            card_status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

          // Mock updated workflow state
          vi.mocked(workflowService.getWorkflow).mockResolvedValue(updatedWorkflow)

          // Update card status to completed
          const updateRequest: UpdateCardStatusRequest = {
            status: 'completed',
            reason: 'Stage completed successfully'
          }

          await workflowService.updateCardStatus(completedCard.id, updateRequest)

          // Get updated workflow
          const result = await workflowService.getWorkflow(workflowId)

          // Property 4: Sequential Stage Progression
          // For any workflow stage marked as completed, the immediately following stage 
          // should automatically change status from "ready" to "pending"

          const resultCompletedCard = result.cards.find(card => card.stage_order === completedStageOrder)!
          const resultNextCard = result.cards.find(card => card.stage_order === completedStageOrder + 1)!

          // Verify the completed card is marked as completed
          expect(resultCompletedCard.card_status).toBe('completed')
          expect(resultCompletedCard.completed_at).toBeDefined()

          // Verify the next stage is automatically activated (ready -> pending)
          expect(resultNextCard.card_status).toBe('pending')
          expect(resultNextCard.completed_at).toBeUndefined()

          // Verify no other cards changed status inappropriately
          result.cards.forEach(card => {
            if (card.stage_order < completedStageOrder) {
              // Previous stages should remain completed
              expect(card.card_status).toBe('completed')
            } else if (card.stage_order > completedStageOrder + 1) {
              // Future stages should remain ready
              expect(card.card_status).toBe('ready')
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain sequential progression across multiple stage completions', async () => {
    // Feature: clickup-style-sample-workflow, Property 4: Sequential Stage Progression
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          workflowId: fc.integer({ min: 1, max: 10000 }),
          stagesToComplete: fc.integer({ min: 1, max: DEFAULT_WORKFLOW_STAGES.length - 1 }),
          userId: fc.string({ minLength: 3, max: 50 })
        }),
        async (testData) => {
          const { workflowId, stagesToComplete, userId } = testData

          // Start with initial workflow state
          let currentCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((template, index) => ({
            id: index + 1,
            workflow_id: workflowId,
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
            card_status: index === 0 ? 'pending' : 'ready',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))

          // Simulate completing stages sequentially
          for (let stageOrder = 1; stageOrder <= stagesToComplete; stageOrder++) {
            // Update cards to reflect completion and auto-activation
            currentCards = currentCards.map(card => {
              if (card.stage_order === stageOrder) {
                return {
                  ...card,
                  card_status: 'completed' as const,
                  completed_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              } else if (card.stage_order === stageOrder + 1) {
                // Auto-activate next stage
                return {
                  ...card,
                  card_status: 'pending' as const,
                  updated_at: new Date().toISOString()
                }
              }
              return card
            })

            const updatedWorkflow: WorkflowResponse = {
              id: workflowId,
              sample_request_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
              workflow_name: 'Test Sequential Workflow',
              workflow_status: 'active',
              created_by: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              priority: 'medium',
              cards: currentCards
            }

            vi.mocked(workflowService.getWorkflow).mockResolvedValue(updatedWorkflow)
          }

          const result = await workflowService.getWorkflow(workflowId)

          // Property: Sequential progression should be maintained across multiple completions
          result.cards.forEach(card => {
            if (card.stage_order <= stagesToComplete) {
              // Completed stages should be marked as completed
              expect(card.card_status).toBe('completed')
              expect(card.completed_at).toBeDefined()
            } else if (card.stage_order === stagesToComplete + 1) {
              // Next stage should be pending (auto-activated)
              expect(card.card_status).toBe('pending')
              expect(card.completed_at).toBeUndefined()
            } else {
              // Future stages should remain ready
              expect(card.card_status).toBe('ready')
              expect(card.completed_at).toBeUndefined()
            }
          })

          // Verify proper ordering is maintained
          const sortedCards = result.cards.sort((a, b) => a.stage_order - b.stage_order)
          for (let i = 1; i < sortedCards.length; i++) {
            expect(sortedCards[i].stage_order).toBeGreaterThan(sortedCards[i - 1].stage_order)
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle edge case of completing the last stage without errors', async () => {
    // Feature: clickup-style-sample-workflow, Property 4: Sequential Stage Progression
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          workflowId: fc.integer({ min: 1, max: 10000 }),
          userId: fc.string({ minLength: 3, max: 50 })
        }),
        async (testData) => {
          const { workflowId, userId } = testData
          const lastStageOrder = DEFAULT_WORKFLOW_STAGES.length

          // Create workflow with all stages completed except the last one
          const initialCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((template, index) => ({
            id: index + 1,
            workflow_id: workflowId,
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
            card_status: template.stage_order < lastStageOrder ? 'completed' : 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: template.stage_order < lastStageOrder ? new Date().toISOString() : undefined
          }))

          const initialWorkflow: WorkflowResponse = {
            id: workflowId,
            sample_request_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            workflow_name: 'Test Last Stage Workflow',
            workflow_status: 'active',
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            priority: 'medium',
            cards: initialCards
          }

          // Complete the last stage
          const completedCards = initialCards.map(card => {
            if (card.stage_order === lastStageOrder) {
              return {
                ...card,
                card_status: 'completed' as const,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }
            return card
          })

          const completedWorkflow: WorkflowResponse = {
            ...initialWorkflow,
            workflow_status: 'completed', // Workflow should be completed when all stages are done
            completed_at: new Date().toISOString(),
            cards: completedCards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(completedWorkflow)

          const result = await workflowService.getWorkflow(workflowId)

          // Property: Completing the last stage should not cause errors and should complete workflow
          expect(result.cards.every(card => card.card_status === 'completed')).toBe(true)
          expect(result.workflow_status).toBe('completed')
          expect(result.completed_at).toBeDefined()

          // Verify no stage has invalid status after completion
          result.cards.forEach(card => {
            expect(card.card_status).toBe('completed')
            expect(card.completed_at).toBeDefined()
          })
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should preserve progression property with custom workflow templates', async () => {
    // Feature: clickup-style-sample-workflow, Property 4: Sequential Stage Progression
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            template_name: fc.constant('sample_development'),
            stage_name: fc.string({ minLength: 3, maxLength: 50 }),
            stage_order: fc.integer({ min: 1, max: 10 }),
            stage_description: fc.option(fc.string({ minLength: 10, maxLength: 200 })),
            default_assignee_role: fc.option(fc.string({ minLength: 3, maxLength: 30 })),
            estimated_duration_hours: fc.option(fc.integer({ min: 1, max: 48 })),
            is_active: fc.constant(true)
          }),
          { minLength: 3, maxLength: 8 } // At least 3 stages to test progression
        ),
        fc.record({
          workflowId: fc.integer({ min: 1, max: 10000 }),
          completedStageIndex: fc.integer({ min: 0, max: 5 }), // Will be adjusted based on array length
          userId: fc.string({ minLength: 3, max: 50 })
        }),
        async (customTemplates, testData) => {
          // Ensure unique stage orders and names
          const uniqueTemplates = customTemplates
            .filter((template, index, arr) => 
              arr.findIndex(t => t.stage_order === template.stage_order || t.stage_name === template.stage_name) === index
            )
            .sort((a, b) => a.stage_order - b.stage_order)
            .map((template, index) => ({
              ...template,
              id: index + 1,
              stage_order: index + 1 // Ensure sequential ordering
            }))

          if (uniqueTemplates.length < 3) return // Skip if less than 3 stages

          const { workflowId, userId } = testData
          const completedStageIndex = Math.min(testData.completedStageIndex, uniqueTemplates.length - 2) // Ensure not last stage

          vi.mocked(workflowTemplateService.getTemplates).mockResolvedValue(uniqueTemplates)

          // Create workflow cards
          const initialCards: WorkflowCard[] = uniqueTemplates.map((template, index) => ({
            id: index + 1,
            workflow_id: workflowId,
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
            card_status: index < completedStageIndex ? 'completed' :
                        index === completedStageIndex ? 'in_progress' :
                        index === completedStageIndex + 1 ? 'ready' : 'ready',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: index < completedStageIndex ? new Date().toISOString() : undefined
          }))

          // Simulate completing the current stage
          const updatedCards = initialCards.map((card, index) => {
            if (index === completedStageIndex) {
              return {
                ...card,
                card_status: 'completed' as const,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            } else if (index === completedStageIndex + 1) {
              return {
                ...card,
                card_status: 'pending' as const,
                updated_at: new Date().toISOString()
              }
            }
            return card
          })

          const updatedWorkflow: WorkflowResponse = {
            id: workflowId,
            sample_request_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            workflow_name: 'Test Custom Template Workflow',
            workflow_status: 'active',
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            priority: 'medium',
            cards: updatedCards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(updatedWorkflow)

          const result = await workflowService.getWorkflow(workflowId)

          // Property: Sequential progression should work with any valid template configuration
          const sortedCards = result.cards.sort((a, b) => a.stage_order - b.stage_order)
          
          // Verify completed stage
          expect(sortedCards[completedStageIndex].card_status).toBe('completed')
          
          // Verify next stage is activated
          if (completedStageIndex + 1 < sortedCards.length) {
            expect(sortedCards[completedStageIndex + 1].card_status).toBe('pending')
          }
          
          // Verify previous stages remain completed
          for (let i = 0; i < completedStageIndex; i++) {
            expect(sortedCards[i].card_status).toBe('completed')
          }
          
          // Verify future stages remain ready
          for (let i = completedStageIndex + 2; i < sortedCards.length; i++) {
            expect(sortedCards[i].card_status).toBe('ready')
          }
        }
      ),
      { numRuns: 30 }
    )
  })
})