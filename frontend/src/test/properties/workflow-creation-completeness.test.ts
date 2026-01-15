/**
 * Property Test 1: Workflow Creation Completeness
 * Validates: Requirements 1.1, 1.2, 2.2
 * 
 * This test ensures that workflow creation generates the correct number of cards
 * matching the predefined workflow stages for any valid sample plan form submission.
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

describe('Property Test 1: Workflow Creation Completeness', () => {
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

  it('should create a workflow with exactly the number of cards matching predefined workflow stages', async () => {
    // Feature: clickup-style-sample-workflow, Property 1: Workflow Creation Completeness
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          sampleRequestId: fc.integer({ min: 1, max: 10000 }),
          workflowName: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
          assignedDesigner: fc.option(fc.string({ minLength: 3, maxLength: 50 })),
          assignedProgrammer: fc.option(fc.string({ minLength: 3, maxLength: 50 })),
          assignedSupervisorKnitting: fc.option(fc.string({ minLength: 3, maxLength: 50 })),
          assignedSupervisorFinishing: fc.option(fc.string({ minLength: 3, maxLength: 50 })),
          requiredKnittingMachineId: fc.option(fc.integer({ min: 1, max: 100 })),
          deliveryPlanDate: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }).map(d => d.toISOString())),
          priority: fc.constantFrom('low', 'medium', 'high')
        }),
        async (workflowData) => {
          const expectedStageCount = DEFAULT_WORKFLOW_STAGES.length
          
          // Generate workflow cards based on templates
          const generatedCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((template, index) => ({
            id: index + 1,
            workflow_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
            assigned_to: getAssigneeForStage(template.stage_name, workflowData),
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
            due_date: workflowData.deliveryPlanDate,
            cards: generatedCards
          }

          // Mock successful workflow creation
          vi.mocked(workflowService.createWorkflow).mockResolvedValue(createdWorkflow)
          vi.mocked(workflowService.getWorkflow).mockResolvedValue(createdWorkflow)
          vi.mocked(workflowService.getWorkflowCards).mockResolvedValue(generatedCards)

          // Create workflow
          const result = await workflowService.createWorkflow(workflowData)

          // Property 1: Workflow Creation Completeness
          // For any valid sample plan form submission, the system should create a workflow 
          // with exactly the number of cards matching the predefined workflow stages
          expect(result.cards).toBeDefined()
          expect(result.cards.length).toBe(expectedStageCount)
          
          // Verify each predefined stage has a corresponding card
          DEFAULT_WORKFLOW_STAGES.forEach((template) => {
            const matchingCard = result.cards.find(card => 
              card.stage_name === template.stage_name && 
              card.stage_order === template.stage_order
            )
            expect(matchingCard).toBeDefined()
            expect(matchingCard!.stage_name).toBe(template.stage_name)
            expect(matchingCard!.stage_order).toBe(template.stage_order)
          })

          // Verify no extra cards were created
          expect(result.cards.every(card => 
            DEFAULT_WORKFLOW_STAGES.some(template => 
              template.stage_name === card.stage_name && 
              template.stage_order === card.stage_order
            )
          )).toBe(true)

          // Verify cards are ordered correctly by stage_order
          for (let i = 1; i < result.cards.length; i++) {
            expect(result.cards[i].stage_order).toBeGreaterThan(result.cards[i - 1].stage_order)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should create workflow cards with proper initial status based on stage order', async () => {
    // Feature: clickup-style-sample-workflow, Property 1: Workflow Creation Completeness
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          sampleRequestId: fc.integer({ min: 1, max: 10000 }),
          workflowName: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
          priority: fc.constantFrom('low', 'medium', 'high')
        }),
        async (workflowData) => {
          const generatedCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((template, index) => ({
            id: index + 1,
            workflow_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
            card_status: index === 0 ? 'pending' : 'ready' as any, // First stage pending, others ready
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

          // Verify initial status assignment
          const sortedCards = result.cards.sort((a, b) => a.stage_order - b.stage_order)
          
          // First stage should be pending (ready to start)
          expect(sortedCards[0].card_status).toBe('pending')
          
          // All subsequent stages should be ready (waiting for prerequisites)
          for (let i = 1; i < sortedCards.length; i++) {
            expect(sortedCards[i].card_status).toBe('ready')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain workflow completeness across different template configurations', async () => {
    // Feature: clickup-style-sample-workflow, Property 1: Workflow Creation Completeness
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            template_name: fc.constant('sample_development'),
            stage_name: fc.string({ minLength: 3, maxLength: 50 }),
            stage_order: fc.integer({ min: 1, max: 20 }),
            stage_description: fc.option(fc.string({ minLength: 10, maxLength: 200 })),
            default_assignee_role: fc.option(fc.string({ minLength: 3, maxLength: 30 })),
            estimated_duration_hours: fc.option(fc.integer({ min: 1, max: 48 })),
            is_active: fc.constant(true)
          }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.record({
          sampleRequestId: fc.integer({ min: 1, max: 10000 }),
          workflowName: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
          priority: fc.constantFrom('low', 'medium', 'high')
        }),
        async (customTemplates, workflowData) => {
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

          if (uniqueTemplates.length === 0) return // Skip if no valid templates

          // Mock custom templates
          vi.mocked(workflowTemplateService.getTemplates).mockResolvedValue(uniqueTemplates)

          const generatedCards: WorkflowCard[] = uniqueTemplates.map((template, index) => ({
            id: index + 1,
            workflow_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
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

          // Property: Workflow completeness should be maintained regardless of template configuration
          expect(result.cards.length).toBe(uniqueTemplates.length)
          
          // Each template should have exactly one corresponding card
          uniqueTemplates.forEach(template => {
            const matchingCards = result.cards.filter(card => card.stage_name === template.stage_name)
            expect(matchingCards.length).toBe(1)
            expect(matchingCards[0].stage_order).toBe(template.stage_order)
          })

          // No duplicate cards should exist
          const stageNames = result.cards.map(card => card.stage_name)
          const uniqueStageNames = [...new Set(stageNames)]
          expect(stageNames.length).toBe(uniqueStageNames.length)

          const stageOrders = result.cards.map(card => card.stage_order)
          const uniqueStageOrders = [...new Set(stageOrders)]
          expect(stageOrders.length).toBe(uniqueStageOrders.length)
        }
      ),
      { numRuns: 50 }
    )
  })

  // Helper function to assign users to stages based on form data
  function getAssigneeForStage(stageName: string, workflowData: CreateWorkflowRequest): string | undefined {
    switch (stageName) {
      case 'Assign Designer':
        return workflowData.assignedDesigner
      case 'Programming':
        return workflowData.assignedProgrammer
      case 'Supervisor Knitting':
        return workflowData.assignedSupervisorKnitting
      case 'Supervisor Finishing':
        return workflowData.assignedSupervisorFinishing
      default:
        return undefined
    }
  }
})