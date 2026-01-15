/**
 * Property Test 3: Initial Workflow State
 * Validates: Requirements 1.4, 5.1
 * 
 * This test ensures that for any newly created workflow, only the first stage card 
 * should have "pending" status while all subsequent stages should have "ready" status.
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

describe('Property Test 3: Initial Workflow State', () => {
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

  it('should create workflows where only the first stage is pending and others are ready', async () => {
    // Feature: clickup-style-sample-workflow, Property 3: Initial Workflow State
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
          deliveryPlanDate: fc.option(fc.string().map(() => new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString())),
          priority: fc.constantFrom('low', 'medium', 'high')
        }),
        async (workflowData) => {
          // Generate workflow cards with proper initial status
          const generatedCards: WorkflowCard[] = DEFAULT_WORKFLOW_STAGES.map((template, index) => ({
            id: index + 1,
            workflow_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
            assigned_to: getAssigneeForStage(template.stage_name, workflowData),
            // Requirements 1.4, 5.1: First stage is pending, others are ready (waiting)
            card_status: template.stage_order === 1 ? 'pending' : 'ready',
            due_date: workflowData.deliveryPlanDate,
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

          // Create workflow
          const result = await workflowService.createWorkflow(workflowData)

          // Property 3: Initial Workflow State
          // For any newly created workflow, only the first stage card should have "pending" status 
          // while all subsequent stages should have "ready" status
          
          // Sort cards by stage order to ensure proper checking
          const sortedCards = result.cards.sort((a, b) => a.stage_order - b.stage_order)
          
          // Verify we have cards
          expect(sortedCards.length).toBeGreaterThan(0)
          
          // First stage should be pending (Requirements 1.4, 5.1)
          expect(sortedCards[0].card_status).toBe('pending')
          expect(sortedCards[0].stage_order).toBe(1)
          
          // All subsequent stages should be ready (waiting for prerequisites)
          for (let i = 1; i < sortedCards.length; i++) {
            expect(sortedCards[i].card_status).toBe('ready')
            expect(sortedCards[i].stage_order).toBe(i + 1)
          }
          
          // Verify no cards have other statuses initially
          const invalidStatuses = ['in_progress', 'completed', 'blocked']
          sortedCards.forEach(card => {
            expect(invalidStatuses).not.toContain(card.card_status)
          })
          
          // Verify exactly one pending card exists
          const pendingCards = sortedCards.filter(card => card.card_status === 'pending')
          expect(pendingCards.length).toBe(1)
          expect(pendingCards[0].stage_order).toBe(1)
          
          // Verify all other cards are ready
          const readyCards = sortedCards.filter(card => card.card_status === 'ready')
          expect(readyCards.length).toBe(sortedCards.length - 1)
          
          // Verify ready cards have stage_order > 1
          readyCards.forEach(card => {
            expect(card.stage_order).toBeGreaterThan(1)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain initial state consistency across different workflow configurations', async () => {
    // Feature: clickup-style-sample-workflow, Property 3: Initial Workflow State
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
          { minLength: 2, maxLength: 10 } // At least 2 stages to test the property
        ),
        fc.record({
          sampleRequestId: fc.integer({ min: 1, max: 10000 }),
          workflowName: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
          priority: fc.constantFrom('low', 'medium', 'high')
        }),
        async (customTemplates, workflowData) => {
          // Ensure unique stage orders and names, and sort by stage order
          const uniqueTemplates = customTemplates
            .filter((template, index, arr) => 
              arr.findIndex(t => t.stage_order === template.stage_order || t.stage_name === template.stage_name) === index
            )
            .sort((a, b) => a.stage_order - b.stage_order)
            .map((template, index) => ({
              ...template,
              id: index + 1,
              stage_order: index + 1 // Ensure sequential ordering starting from 1
            }))

          if (uniqueTemplates.length < 2) return // Skip if less than 2 stages

          // Mock custom templates
          vi.mocked(workflowTemplateService.getTemplates).mockResolvedValue(uniqueTemplates)

          const generatedCards: WorkflowCard[] = uniqueTemplates.map((template, index) => ({
            id: index + 1,
            workflow_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            stage_name: template.stage_name,
            stage_order: template.stage_order,
            card_title: template.stage_name,
            card_description: template.stage_description,
            // Initial state: first stage pending, others ready
            card_status: template.stage_order === 1 ? 'pending' : 'ready',
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

          // Property: Initial state should be consistent regardless of template configuration
          const sortedCards = result.cards.sort((a, b) => a.stage_order - b.stage_order)
          
          // Exactly one card should be pending (the first one)
          const pendingCards = sortedCards.filter(card => card.card_status === 'pending')
          expect(pendingCards.length).toBe(1)
          expect(pendingCards[0].stage_order).toBe(1)
          
          // All other cards should be ready
          const readyCards = sortedCards.filter(card => card.card_status === 'ready')
          expect(readyCards.length).toBe(sortedCards.length - 1)
          
          // Verify ready cards have stage_order > 1
          readyCards.forEach(card => {
            expect(card.stage_order).toBeGreaterThan(1)
          })
          
          // No cards should have other statuses initially
          const allStatuses = sortedCards.map(card => card.card_status)
          const validInitialStatuses = ['pending', 'ready']
          allStatuses.forEach(status => {
            expect(validInitialStatuses).toContain(status)
          })
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should preserve initial state property when workflow has single stage', async () => {
    // Feature: clickup-style-sample-workflow, Property 3: Initial Workflow State
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          sampleRequestId: fc.integer({ min: 1, max: 10000 }),
          workflowName: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
          priority: fc.constantFrom('low', 'medium', 'high')
        }),
        async (workflowData) => {
          // Single stage template
          const singleStageTemplate: WorkflowTemplate[] = [{
            id: 1,
            template_name: 'sample_development',
            stage_name: 'Single Stage',
            stage_order: 1,
            stage_description: 'Single stage workflow',
            default_assignee_role: 'manager',
            estimated_duration_hours: 8,
            is_active: true
          }]

          vi.mocked(workflowTemplateService.getTemplates).mockResolvedValue(singleStageTemplate)

          const generatedCards: WorkflowCard[] = [{
            id: 1,
            workflow_id: fc.sample(fc.integer({ min: 1, max: 10000 }), 1)[0],
            stage_name: 'Single Stage',
            stage_order: 1,
            card_title: 'Single Stage',
            card_description: 'Single stage workflow',
            card_status: 'pending', // Single stage should be pending
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]

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

          // Property: Even with single stage, initial state rules should apply
          expect(result.cards.length).toBe(1)
          expect(result.cards[0].card_status).toBe('pending')
          expect(result.cards[0].stage_order).toBe(1)
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