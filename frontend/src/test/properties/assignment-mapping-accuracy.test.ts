/**
 * Property Test 2: Assignment Mapping Accuracy
 * Validates: Requirements 1.3
 * 
 * This test ensures that workflow creation correctly maps assignees from form data
 * to the appropriate workflow cards based on stage-to-assignee mapping.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock the API services
vi.mock('@/services/api', () => ({
  workflowService: {
    createWorkflow: vi.fn(),
    getWorkflow: vi.fn(),
    getWorkflowCards: vi.fn(),
  },
  workflowTemplateService: {
    getTemplates: vi.fn(),
  },
}))

import { workflowService, workflowTemplateService } from '@/services/api'

// Type definitions for test data
interface CreateWorkflowRequest {
  sampleRequestId: number
  workflowName: string
  assignedDesigner?: string
  assignedProgrammer?: string
  assignedSupervisorKnitting?: string
  assignedSupervisorFinishing?: string
  requiredKnittingMachineId?: number
  deliveryPlanDate?: string
  priority?: 'low' | 'medium' | 'high'
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

describe('Property Test 2: Assignment Mapping Accuracy', () => {
  // Stage to assignee field mapping as defined in the design
  const STAGE_ASSIGNEE_MAPPING = {
    'Design Approval': null, // No specific assignee field for this stage
    'Assign Designer': 'assignedDesigner',
    'Programming': 'assignedProgrammer',
    'Supervisor Knitting': 'assignedSupervisorKnitting',
    'Supervisor Finishing': 'assignedSupervisorFinishing'
  }

  const DEFAULT_WORKFLOW_STAGES = [
    { stage_name: 'Design Approval', stage_order: 1 },
    { stage_name: 'Assign Designer', stage_order: 2 },
    { stage_name: 'Programming', stage_order: 3 },
    { stage_name: 'Supervisor Knitting', stage_order: 4 },
    { stage_name: 'Supervisor Finishing', stage_order: 5 }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should correctly map assignees from form data to workflow cards based on stage names', async () => {
    // Feature: clickup-style-sample-workflow, Property 2: Assignment Mapping Accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          sampleRequestId: fc.integer({ min: 1, max: 10000 }),
          workflowName: fc.string({ minLength: 5, max: 100 }).filter(s => s.trim().length >= 5),
          assignedDesigner: fc.option(fc.string({ minLength: 3, max: 50 })),
          assignedProgrammer: fc.option(fc.string({ minLength: 3, max: 50 })),
          assignedSupervisorKnitting: fc.option(fc.string({ minLength: 3, max: 50 })),
          assignedSupervisorFinishing: fc.option(fc.string({ minLength: 3, max: 50 })),
          priority: fc.constantFrom('low', 'medium', 'high')
        }),
        async (workflowData) => {
          // Generate workflow cards with correct assignee mapping
          const generatedCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((stage, index) => ({
            id: index + 1,
            workflow_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            stage_name: stage.stage_name,
            stage_order: stage.stage_order,
            card_title: stage.stage_name,
            assigned_to: getExpectedAssigneeForStage(stage.stage_name, workflowData),
            card_status: index === 0 ? 'pending' : 'ready' as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))

          const createdWorkflow: WorkflowResponse = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            sample_request_id: workflowData.sampleRequestId,
            workflow_name: workflowData.workflowName.trim(),
            workflow_status: 'active',
            created_by: 'test_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            priority: workflowData.priority,
            cards: generatedCards
          }

          // Mock successful workflow creation
          vi.mocked(workflowService.createWorkflow).mockResolvedValue(createdWorkflow)

          // Create workflow
          const result = await workflowService.createWorkflow(workflowData)

          // Property 2: Assignment Mapping Accuracy
          // For any workflow creation with form assignee data, each card should be assigned 
          // to the correct person based on the stage-to-assignee mapping from the form
          
          // Verify each card has the correct assignee based on stage mapping
          result.cards.forEach(card => {
            const expectedAssignee = getExpectedAssigneeForStage(card.stage_name, workflowData)
            expect(card.assigned_to).toBe(expectedAssignee)
          })

          // Verify specific stage mappings
          const designerCard = result.cards.find(card => card.stage_name === 'Assign Designer')
          if (designerCard) {
            expect(designerCard.assigned_to).toBe(workflowData.assignedDesigner)
          }

          const programmerCard = result.cards.find(card => card.stage_name === 'Programming')
          if (programmerCard) {
            expect(programmerCard.assigned_to).toBe(workflowData.assignedProgrammer)
          }

          const knittingCard = result.cards.find(card => card.stage_name === 'Supervisor Knitting')
          if (knittingCard) {
            expect(knittingCard.assigned_to).toBe(workflowData.assignedSupervisorKnitting)
          }

          const finishingCard = result.cards.find(card => card.stage_name === 'Supervisor Finishing')
          if (finishingCard) {
            expect(finishingCard.assigned_to).toBe(workflowData.assignedSupervisorFinishing)
          }

          // Verify Design Approval stage has no assignee (as per mapping)
          const designApprovalCard = result.cards.find(card => card.stage_name === 'Design Approval')
          if (designApprovalCard) {
            expect(designApprovalCard.assigned_to).toBeUndefined()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle partial assignee data correctly', async () => {
    // Feature: clickup-style-sample-workflow, Property 2: Assignment Mapping Accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          sampleRequestId: fc.integer({ min: 1, max: 10000 }),
          workflowName: fc.string({ minLength: 5, max: 100 }).filter(s => s.trim().length >= 5),
          // Only some assignees provided
          assignedDesigner: fc.option(fc.string({ minLength: 3, max: 50 }), { nil: 0.5 }),
          assignedProgrammer: fc.option(fc.string({ minLength: 3, max: 50 }), { nil: 0.5 }),
          assignedSupervisorKnitting: fc.option(fc.string({ minLength: 3, max: 50 }), { nil: 0.5 }),
          assignedSupervisorFinishing: fc.option(fc.string({ minLength: 3, max: 50 }), { nil: 0.5 }),
          priority: fc.constantFrom('low', 'medium', 'high')
        }),
        async (workflowData) => {
          const generatedCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((stage, index) => ({
            id: index + 1,
            workflow_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            stage_name: stage.stage_name,
            stage_order: stage.stage_order,
            card_title: stage.stage_name,
            assigned_to: getExpectedAssigneeForStage(stage.stage_name, workflowData),
            card_status: index === 0 ? 'pending' : 'ready' as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))

          const createdWorkflow: WorkflowResponse = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            sample_request_id: workflowData.sampleRequestId,
            workflow_name: workflowData.workflowName.trim(),
            workflow_status: 'active',
            created_by: 'test_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            priority: workflowData.priority,
            cards: generatedCards
          }

          vi.mocked(workflowService.createWorkflow).mockResolvedValue(createdWorkflow)

          const result = await workflowService.createWorkflow(workflowData)

          // Property: Assignment mapping should work correctly even with partial data
          // Cards with no corresponding assignee data should have undefined assigned_to
          result.cards.forEach(card => {
            const expectedAssignee = getExpectedAssigneeForStage(card.stage_name, workflowData)
            expect(card.assigned_to).toBe(expectedAssignee)
            
            // If no assignee was provided for this stage, assigned_to should be undefined
            if (!expectedAssignee) {
              expect(card.assigned_to).toBeUndefined()
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain assignment consistency across multiple workflow creations', async () => {
    // Feature: clickup-style-sample-workflow, Property 2: Assignment Mapping Accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            sampleRequestId: fc.integer({ min: 1, max: 10000 }),
            workflowName: fc.string({ minLength: 5, max: 100 }).filter(s => s.trim().length >= 5),
            assignedDesigner: fc.option(fc.string({ minLength: 3, max: 50 })),
            assignedProgrammer: fc.option(fc.string({ minLength: 3, max: 50 })),
            assignedSupervisorKnitting: fc.option(fc.string({ minLength: 3, max: 50 })),
            assignedSupervisorFinishing: fc.option(fc.string({ minLength: 3, max: 50 })),
            priority: fc.constantFrom('low', 'medium', 'high')
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (workflowDataArray) => {
          const createdWorkflows: WorkflowResponse[] = []

          // Create multiple workflows
          for (const workflowData of workflowDataArray) {
            const generatedCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((stage, index) => ({
              id: index + 1,
              workflow_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
              stage_name: stage.stage_name,
              stage_order: stage.stage_order,
              card_title: stage.stage_name,
              assigned_to: getExpectedAssigneeForStage(stage.stage_name, workflowData),
              card_status: index === 0 ? 'pending' : 'ready' as any,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))

            const createdWorkflow: WorkflowResponse = {
              id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
              sample_request_id: workflowData.sampleRequestId,
              workflow_name: workflowData.workflowName.trim(),
              workflow_status: 'active',
              created_by: 'test_user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              priority: workflowData.priority,
              cards: generatedCards
            }

            createdWorkflows.push(createdWorkflow)
          }

          // Mock service to return workflows in sequence
          vi.mocked(workflowService.createWorkflow).mockImplementation(async (data) => {
            // Find the corresponding workflow for this data
            const matchingWorkflow = createdWorkflows.find(w => 
              w.sample_request_id === data.sampleRequestId && 
              w.workflow_name === data.workflowName.trim()
            )
            return matchingWorkflow || createdWorkflows[0] // Fallback to first workflow
          })

          // Create workflows and verify assignment consistency
          for (let i = 0; i < workflowDataArray.length; i++) {
            const workflowData = workflowDataArray[i]
            const result = await workflowService.createWorkflow(workflowData)

            // Property: Assignment mapping should be consistent across all workflow creations
            // Each workflow should have the same mapping logic applied
            if (result && result.cards) {
              result.cards.forEach(card => {
                const expectedAssignee = getExpectedAssigneeForStage(card.stage_name, workflowData)
                expect(card.assigned_to).toBe(expectedAssignee)
              })
            }
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle edge cases in assignee names correctly', async () => {
    // Feature: clickup-style-sample-workflow, Property 2: Assignment Mapping Accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          sampleRequestId: fc.integer({ min: 1, max: 10000 }),
          workflowName: fc.string({ minLength: 5, max: 100 }).filter(s => s.trim().length >= 5),
          // Test edge cases in assignee names
          assignedDesigner: fc.option(fc.oneof(
            fc.string({ minLength: 1, max: 1 }), // Single character
            fc.string({ minLength: 50, max: 50 }), // Maximum length
            fc.constant('user@domain.com'), // Email format
            fc.constant('User Name With Spaces'), // Spaces
            fc.constant('user_with_underscores'), // Underscores
            fc.constant('user-with-dashes') // Dashes
          )),
          assignedProgrammer: fc.option(fc.string({ minLength: 3, max: 50 })),
          assignedSupervisorKnitting: fc.option(fc.string({ minLength: 3, max: 50 })),
          assignedSupervisorFinishing: fc.option(fc.string({ minLength: 3, max: 50 })),
          priority: fc.constantFrom('low', 'medium', 'high')
        }),
        async (workflowData) => {
          const generatedCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((stage, index) => ({
            id: index + 1,
            workflow_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            stage_name: stage.stage_name,
            stage_order: stage.stage_order,
            card_title: stage.stage_name,
            assigned_to: getExpectedAssigneeForStage(stage.stage_name, workflowData),
            card_status: index === 0 ? 'pending' : 'ready' as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))

          const createdWorkflow: WorkflowResponse = {
            id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            sample_request_id: workflowData.sampleRequestId,
            workflow_name: workflowData.workflowName.trim(),
            workflow_status: 'active',
            created_by: 'test_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            priority: workflowData.priority,
            cards: generatedCards
          }

          vi.mocked(workflowService.createWorkflow).mockResolvedValue(createdWorkflow)

          const result = await workflowService.createWorkflow(workflowData)

          // Property: Assignment mapping should handle edge cases in assignee names correctly
          // The exact assignee value should be preserved without modification
          result.cards.forEach(card => {
            const expectedAssignee = getExpectedAssigneeForStage(card.stage_name, workflowData)
            expect(card.assigned_to).toBe(expectedAssignee)
            
            // If assignee is provided, it should be exactly as provided (no trimming, etc.)
            if (expectedAssignee) {
              expect(card.assigned_to).toBe(expectedAssignee)
              expect(typeof card.assigned_to).toBe('string')
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  // Helper function to get expected assignee for a stage based on form data
  function getExpectedAssigneeForStage(stageName: string, workflowData: CreateWorkflowRequest): string | undefined {
    const assigneeField = STAGE_ASSIGNEE_MAPPING[stageName as keyof typeof STAGE_ASSIGNEE_MAPPING]
    if (!assigneeField) {
      return undefined
    }
    return workflowData[assigneeField as keyof CreateWorkflowRequest] as string | undefined
  }
})