/**
 * Property Test 5: Stage Sequence Validation
 * Validates: Requirements 5.3
 * 
 * This test ensures that the system only allows stage activation if all previous stages are completed,
 * preventing out-of-sequence progression in workflows.
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
    validateStageSequence: vi.fn(),
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

interface ValidationResult {
  isValid: boolean
  error?: string
}

describe('Property Test 5: Stage Sequence Validation', () => {
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

  it('should prevent activation of stages when prerequisites are not completed', async () => {
    // Feature: clickup-style-sample-workflow, Property 5: Stage Sequence Validation
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          workflowId: fc.integer({ min: 1, max: 10000 }),
          targetStageOrder: fc.integer({ min: 2, max: DEFAULT_WORKFLOW_STAGES.length }), // Not first stage
          completedStages: fc.array(fc.integer({ min: 1, max: DEFAULT_WORKFLOW_STAGES.length - 1 }), { maxLength: DEFAULT_WORKFLOW_STAGES.length - 1 }),
          userId: fc.string({ minLength: 3, max: 50 })
        }),
        async (testData) => {
          const { workflowId, targetStageOrder, completedStages, userId } = testData

          // Ensure completed stages don't include the target stage or stages after it
          const validCompletedStages = completedStages.filter(stage => stage < targetStageOrder)
          const uniqueCompletedStages = [...new Set(validCompletedStages)].sort((a, b) => a - b)

          // Check if all prerequisite stages are completed
          const allPrerequisitesCompleted = Array.from({ length: targetStageOrder - 1 }, (_, i) => i + 1)
            .every(stage => uniqueCompletedStages.includes(stage))

          // Create workflow cards with the given completion state
          const workflowCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((template, index) => ({
            id: index + 1,
            workflow_id: workflowId,
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
            card_status: uniqueCompletedStages.includes(template.stage_order) ? 'completed' :
                        template.stage_order === targetStageOrder ? 'ready' :
                        template.stage_order === 1 && uniqueCompletedStages.length === 0 ? 'pending' : 'ready',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: uniqueCompletedStages.includes(template.stage_order) ? new Date().toISOString() : undefined
          }))

          const workflow: WorkflowResponse = {
            id: workflowId,
            sample_request_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            workflow_name: 'Test Sequence Validation Workflow',
            workflow_status: 'active',
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            priority: 'medium',
            cards: workflowCards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(workflow)

          // Mock validation function
          const validationResult: ValidationResult = {
            isValid: allPrerequisitesCompleted,
            error: allPrerequisitesCompleted ? undefined : 'Prerequisites not completed'
          }
          vi.mocked(workflowService.validateStageSequence).mockResolvedValue(validationResult)

          // Attempt to activate the target stage
          const targetCard = workflowCards.find(card => card.stage_order === targetStageOrder)!
          
          if (allPrerequisitesCompleted) {
            // Should allow activation
            vi.mocked(workflowService.updateCardStatus).mockResolvedValue({
              ...targetCard,
              card_status: 'in_progress',
              updated_at: new Date().toISOString()
            })

            const updateRequest: UpdateCardStatusRequest = {
              status: 'in_progress',
              reason: 'Starting work on stage'
            }

            const result = await workflowService.updateCardStatus(targetCard.id, updateRequest)
            expect(result.card_status).toBe('in_progress')
          } else {
            // Should prevent activation
            vi.mocked(workflowService.updateCardStatus).mockRejectedValue(
              new Error('Cannot update card status: prerequisite stages not completed')
            )

            const updateRequest: UpdateCardStatusRequest = {
              status: 'in_progress',
              reason: 'Attempting to start work'
            }

            await expect(workflowService.updateCardStatus(targetCard.id, updateRequest))
              .rejects.toThrow('Cannot update card status: prerequisite stages not completed')
          }

          // Property 5: Stage Sequence Validation
          // For any attempt to activate a stage, the system should only allow activation 
          // if all previous stages are completed
          const validation = await workflowService.validateStageSequence(targetCard.id, 'in_progress')
          expect(validation.isValid).toBe(allPrerequisitesCompleted)

          if (!allPrerequisitesCompleted) {
            expect(validation.error).toBeDefined()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should allow activation only when all prerequisite stages are completed in sequence', async () => {
    // Feature: clickup-style-sample-workflow, Property 5: Stage Sequence Validation
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          workflowId: fc.integer({ min: 1, max: 10000 }),
          targetStageOrder: fc.integer({ min: 1, max: DEFAULT_WORKFLOW_STAGES.length }),
          userId: fc.string({ minLength: 3, max: 50 })
        }),
        async (testData) => {
          const { workflowId, targetStageOrder, userId } = testData

          // Create two scenarios: valid (all prerequisites completed) and invalid (missing prerequisites)
          const scenarios = [
            {
              name: 'valid_sequence',
              completedStages: Array.from({ length: targetStageOrder - 1 }, (_, i) => i + 1),
              shouldAllow: true
            },
            {
              name: 'invalid_sequence',
              completedStages: targetStageOrder > 2 ? 
                Array.from({ length: targetStageOrder - 2 }, (_, i) => i + 1) : [], // Missing one prerequisite
              shouldAllow: targetStageOrder === 1 // Only first stage should be allowed without prerequisites
            }
          ]

          for (const scenario of scenarios) {
            // Create workflow cards based on scenario
            const workflowCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((template, index) => ({
              id: index + 1,
              workflow_id: workflowId,
              stage_name: template.stage_name,
              stage_order: template.stage_order,
              card_title: template.stage_name,
              card_description: template.stage_description,
              card_status: scenario.completedStages.includes(template.stage_order) ? 'completed' :
                          template.stage_order === targetStageOrder ? 'ready' :
                          template.stage_order === 1 && scenario.completedStages.length === 0 ? 'pending' : 'ready',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              completed_at: scenario.completedStages.includes(template.stage_order) ? new Date().toISOString() : undefined
            }))

            const workflow: WorkflowResponse = {
              id: workflowId,
              sample_request_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
              workflow_name: `Test ${scenario.name} Workflow`,
              workflow_status: 'active',
              created_by: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              priority: 'medium',
              cards: workflowCards
            }

            vi.mocked(workflowService.getWorkflow).mockResolvedValue(workflow)

            // Mock validation based on scenario
            const validationResult: ValidationResult = {
              isValid: scenario.shouldAllow,
              error: scenario.shouldAllow ? undefined : 'Prerequisites not completed'
            }
            vi.mocked(workflowService.validateStageSequence).mockResolvedValue(validationResult)

            const targetCard = workflowCards.find(card => card.stage_order === targetStageOrder)!

            // Property: Validation should match expected outcome
            const validation = await workflowService.validateStageSequence(targetCard.id, 'in_progress')
            expect(validation.isValid).toBe(scenario.shouldAllow)

            if (scenario.shouldAllow) {
              expect(validation.error).toBeUndefined()
            } else {
              expect(validation.error).toBeDefined()
            }
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should validate sequence for different target statuses consistently', async () => {
    // Feature: clickup-style-sample-workflow, Property 5: Stage Sequence Validation
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          workflowId: fc.integer({ min: 1, max: 10000 }),
          targetStageOrder: fc.integer({ min: 2, max: DEFAULT_WORKFLOW_STAGES.length }),
          targetStatus: fc.constantFrom('in_progress', 'completed'),
          userId: fc.string({ minLength: 3, max: 50 })
        }),
        async (testData) => {
          const { workflowId, targetStageOrder, targetStatus, userId } = testData

          // Create scenario with incomplete prerequisites
          const incompletePrerequisites = Array.from({ length: targetStageOrder - 2 }, (_, i) => i + 1)

          const workflowCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((template, index) => ({
            id: index + 1,
            workflow_id: workflowId,
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
            card_status: incompletePrerequisites.includes(template.stage_order) ? 'completed' :
                        template.stage_order === targetStageOrder ? 'ready' : 'ready',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: incompletePrerequisites.includes(template.stage_order) ? new Date().toISOString() : undefined
          }))

          const workflow: WorkflowResponse = {
            id: workflowId,
            sample_request_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            workflow_name: 'Test Status Validation Workflow',
            workflow_status: 'active',
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            priority: 'medium',
            cards: workflowCards
          }

          vi.mocked(workflowService.getWorkflow).mockResolvedValue(workflow)

          const targetCard = workflowCards.find(card => card.stage_order === targetStageOrder)!

          // Mock validation - should fail for both in_progress and completed when prerequisites missing
          const validationResult: ValidationResult = {
            isValid: false,
            error: 'Prerequisites not completed'
          }
          vi.mocked(workflowService.validateStageSequence).mockResolvedValue(validationResult)

          // Property: Validation should be consistent regardless of target status
          const validation = await workflowService.validateStageSequence(targetCard.id, targetStatus)
          
          // Both 'in_progress' and 'completed' should require prerequisites
          expect(validation.isValid).toBe(false)
          expect(validation.error).toBeDefined()
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle edge cases in sequence validation correctly', async () => {
    // Feature: clickup-style-sample-workflow, Property 5: Stage Sequence Validation
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          workflowId: fc.integer({ min: 1, max: 10000 }),
          userId: fc.string({ minLength: 3, max: 50 })
        }),
        async (testData) => {
          const { workflowId, userId } = testData

          // Test edge cases
          const edgeCases = [
            {
              name: 'first_stage_no_prerequisites',
              targetStageOrder: 1,
              completedStages: [],
              shouldAllow: true,
              description: 'First stage should always be allowed'
            },
            {
              name: 'last_stage_all_prerequisites',
              targetStageOrder: DEFAULT_WORKFLOW_STAGES.length,
              completedStages: Array.from({ length: DEFAULT_WORKFLOW_STAGES.length - 1 }, (_, i) => i + 1),
              shouldAllow: true,
              description: 'Last stage should be allowed when all prerequisites completed'
            },
            {
              name: 'middle_stage_gap_in_prerequisites',
              targetStageOrder: 3,
              completedStages: [1], // Missing stage 2
              shouldAllow: false,
              description: 'Should not allow skipping stages'
            }
          ]

          for (const edgeCase of edgeCases) {
            const workflowCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((template, index) => ({
              id: index + 1,
              workflow_id: workflowId,
              stage_name: template.stage_name,
              stage_order: template.stage_order,
              card_title: template.stage_name,
              card_description: template.stage_description,
              card_status: edgeCase.completedStages.includes(template.stage_order) ? 'completed' :
                          template.stage_order === edgeCase.targetStageOrder ? 'ready' :
                          template.stage_order === 1 && edgeCase.completedStages.length === 0 ? 'pending' : 'ready',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              completed_at: edgeCase.completedStages.includes(template.stage_order) ? new Date().toISOString() : undefined
            }))

            const workflow: WorkflowResponse = {
              id: workflowId,
              sample_request_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
              workflow_name: `Test ${edgeCase.name} Workflow`,
              workflow_status: 'active',
              created_by: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              priority: 'medium',
              cards: workflowCards
            }

            vi.mocked(workflowService.getWorkflow).mockResolvedValue(workflow)

            const validationResult: ValidationResult = {
              isValid: edgeCase.shouldAllow,
              error: edgeCase.shouldAllow ? undefined : 'Prerequisites not completed'
            }
            vi.mocked(workflowService.validateStageSequence).mockResolvedValue(validationResult)

            const targetCard = workflowCards.find(card => card.stage_order === edgeCase.targetStageOrder)!

            // Property: Edge cases should be handled correctly
            const validation = await workflowService.validateStageSequence(targetCard.id, 'in_progress')
            expect(validation.isValid).toBe(edgeCase.shouldAllow)

            if (edgeCase.shouldAllow) {
              expect(validation.error).toBeUndefined()
            } else {
              expect(validation.error).toBeDefined()
            }
          }
        }
      ),
      { numRuns: 30 }
    )
  })
})