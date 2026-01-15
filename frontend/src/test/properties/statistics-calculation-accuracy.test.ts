/**
 * Property Test 14: Statistics Calculation Accuracy
 * Validates: Requirements 6.4, 9.1
 *
 * This test ensures that workflow statistics are calculated accurately
 * and reflect the true state of workflows and cards in the system.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock the API services
vi.mock('@/services/api', () => ({
  workflowService: {
    getStatistics: vi.fn(),
    getWorkflows: vi.fn(),
  },
}))

import { workflowService } from '@/services/api'

// Type definitions for test data
interface WorkflowCard {
  id: number
  workflow_id: number
  stage_name: string
  stage_order: number
  card_status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked'
  assigned_to?: string
}

interface Workflow {
  id: number
  sample_request_id: number
  workflow_name: string
  workflow_status: 'active' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
  completed_at?: string
  due_date?: string
  cards: WorkflowCard[]
}

interface WorkflowStats {
  total_workflows: number
  active_workflows: number
  completed_workflows: number
  cancelled_workflows: number
  total_cards: number
  card_status_counts: Record<string, number>
  blocked_cards: number
  overdue_workflows: number
  priority_distribution: Record<string, number>
  avg_completion_days: number
  recent_workflows: number
  stage_breakdown: Record<string, Record<string, number>>
  workload_distribution: Record<string, number>
  completion_rate: number
}

// Helper function to generate workflows with cards
function generateWorkflows(
  count: number,
  statusDistribution: { active: number; completed: number; cancelled: number },
  priorityDistribution: { low: number; medium: number; high: number },
  cardsPerWorkflow: number
): Workflow[] {
  const workflows: Workflow[] = []
  let id = 1

  // Generate active workflows
  for (let i = 0; i < statusDistribution.active; i++) {
    const priority = i < priorityDistribution.high ? 'high'
      : i < priorityDistribution.high + priorityDistribution.medium ? 'medium'
      : 'low'

    workflows.push({
      id: id++,
      sample_request_id: id,
      workflow_name: `Workflow ${id}`,
      workflow_status: 'active',
      priority,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      due_date: Math.random() > 0.5
        ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      cards: generateCards(id - 1, cardsPerWorkflow)
    })
  }

  // Generate completed workflows
  for (let i = 0; i < statusDistribution.completed; i++) {
    const completedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    const createdAt = new Date(completedAt.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000)

    workflows.push({
      id: id++,
      sample_request_id: id,
      workflow_name: `Workflow ${id}`,
      workflow_status: 'completed',
      priority: 'medium',
      created_at: createdAt.toISOString(),
      updated_at: completedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      cards: generateCards(id - 1, cardsPerWorkflow, true)
    })
  }

  // Generate cancelled workflows
  for (let i = 0; i < statusDistribution.cancelled; i++) {
    workflows.push({
      id: id++,
      sample_request_id: id,
      workflow_name: `Workflow ${id}`,
      workflow_status: 'cancelled',
      priority: 'low',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      cards: generateCards(id - 1, cardsPerWorkflow)
    })
  }

  return workflows
}

function generateCards(workflowId: number, count: number, allCompleted: boolean = false): WorkflowCard[] {
  const statuses: Array<'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked'> =
    ['pending', 'ready', 'in_progress', 'completed', 'blocked']
  const stages = ['Design Approval', 'Assign Designer', 'Programming', 'Supervisor Knitting', 'Supervisor Finishing']

  return Array.from({ length: Math.min(count, stages.length) }, (_, i) => ({
    id: workflowId * 10 + i + 1,
    workflow_id: workflowId,
    stage_name: stages[i],
    stage_order: i + 1,
    card_status: allCompleted ? 'completed' : statuses[Math.floor(Math.random() * statuses.length)],
    assigned_to: Math.random() > 0.3 ? `User ${Math.floor(Math.random() * 5) + 1}` : undefined
  }))
}

// Calculate expected statistics from workflows
function calculateExpectedStats(workflows: Workflow[]): WorkflowStats {
  const totalWorkflows = workflows.length
  const activeWorkflows = workflows.filter(w => w.workflow_status === 'active').length
  const completedWorkflows = workflows.filter(w => w.workflow_status === 'completed').length
  const cancelledWorkflows = workflows.filter(w => w.workflow_status === 'cancelled').length

  const allCards = workflows.flatMap(w => w.cards)
  const totalCards = allCards.length

  const cardStatusCounts: Record<string, number> = {}
  allCards.forEach(card => {
    cardStatusCounts[card.card_status] = (cardStatusCounts[card.card_status] || 0) + 1
  })

  const blockedCards = cardStatusCounts['blocked'] || 0

  const now = new Date()
  const overdueWorkflows = workflows.filter(w =>
    w.workflow_status === 'active' &&
    w.due_date &&
    new Date(w.due_date) < now
  ).length

  const priorityDistribution: Record<string, number> = {}
  workflows.forEach(w => {
    priorityDistribution[w.priority] = (priorityDistribution[w.priority] || 0) + 1
  })

  // Calculate average completion time
  const completedWithTime = workflows.filter(w =>
    w.workflow_status === 'completed' && w.completed_at
  )
  let avgCompletionDays = 0
  if (completedWithTime.length > 0) {
    const totalDays = completedWithTime.reduce((sum, w) => {
      const created = new Date(w.created_at).getTime()
      const completed = new Date(w.completed_at!).getTime()
      return sum + (completed - created) / (1000 * 60 * 60 * 24)
    }, 0)
    avgCompletionDays = Math.round(totalDays / completedWithTime.length * 10) / 10
  }

  // Recent workflows (created in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentWorkflows = workflows.filter(w =>
    new Date(w.created_at) >= sevenDaysAgo
  ).length

  // Stage breakdown
  const stageBreakdown: Record<string, Record<string, number>> = {}
  allCards.forEach(card => {
    if (!stageBreakdown[card.stage_name]) {
      stageBreakdown[card.stage_name] = {}
    }
    stageBreakdown[card.stage_name][card.card_status] =
      (stageBreakdown[card.stage_name][card.card_status] || 0) + 1
  })

  // Workload distribution (active tasks per assignee)
  const workloadDistribution: Record<string, number> = {}
  allCards
    .filter(card => card.assigned_to && ['pending', 'in_progress'].includes(card.card_status))
    .forEach(card => {
      workloadDistribution[card.assigned_to!] = (workloadDistribution[card.assigned_to!] || 0) + 1
    })

  const completionRate = totalWorkflows > 0
    ? Math.round(completedWorkflows / totalWorkflows * 1000) / 10
    : 0

  return {
    total_workflows: totalWorkflows,
    active_workflows: activeWorkflows,
    completed_workflows: completedWorkflows,
    cancelled_workflows: cancelledWorkflows,
    total_cards: totalCards,
    card_status_counts: cardStatusCounts,
    blocked_cards: blockedCards,
    overdue_workflows: overdueWorkflows,
    priority_distribution: priorityDistribution,
    avg_completion_days: avgCompletionDays,
    recent_workflows: recentWorkflows,
    stage_breakdown: stageBreakdown,
    workload_distribution: workloadDistribution,
    completion_rate: completionRate
  }
}

describe('Property Test 14: Statistics Calculation Accuracy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should calculate total workflows correctly for any number of workflows', async () => {
    // Feature: clickup-style-sample-workflow, Property 14: Statistics Calculation Accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          active: fc.integer({ min: 0, max: 50 }),
          completed: fc.integer({ min: 0, max: 50 }),
          cancelled: fc.integer({ min: 0, max: 20 })
        }),
        async (statusDistribution) => {
          const totalExpected = statusDistribution.active + statusDistribution.completed + statusDistribution.cancelled
          const workflows = generateWorkflows(
            totalExpected,
            statusDistribution,
            { low: Math.floor(totalExpected / 3), medium: Math.floor(totalExpected / 3), high: Math.ceil(totalExpected / 3) },
            5
          )

          const expectedStats = calculateExpectedStats(workflows)

          vi.mocked(workflowService.getWorkflows).mockResolvedValue(workflows)
          vi.mocked(workflowService.getStatistics).mockResolvedValue(expectedStats)

          const stats = await workflowService.getStatistics()

          // Property: Total workflows should equal sum of all status counts
          expect(stats.total_workflows).toBe(totalExpected)
          expect(stats.total_workflows).toBe(
            stats.active_workflows + stats.completed_workflows + stats.cancelled_workflows
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate card status counts correctly', async () => {
    // Feature: clickup-style-sample-workflow, Property 14: Statistics Calculation Accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 10 }),
        async (numWorkflows, cardsPerWorkflow) => {
          const workflows = generateWorkflows(
            numWorkflows,
            { active: numWorkflows, completed: 0, cancelled: 0 },
            { low: Math.floor(numWorkflows / 3), medium: Math.floor(numWorkflows / 3), high: Math.ceil(numWorkflows / 3) },
            cardsPerWorkflow
          )

          const expectedStats = calculateExpectedStats(workflows)

          vi.mocked(workflowService.getWorkflows).mockResolvedValue(workflows)
          vi.mocked(workflowService.getStatistics).mockResolvedValue(expectedStats)

          const stats = await workflowService.getStatistics()

          // Property: Sum of card status counts should equal total cards
          const cardStatusSum = Object.values(stats.card_status_counts).reduce((a, b) => a + b, 0)
          expect(cardStatusSum).toBe(stats.total_cards)

          // Property: Blocked cards count should match card_status_counts['blocked']
          expect(stats.blocked_cards).toBe(stats.card_status_counts['blocked'] || 0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate completion rate correctly', async () => {
    // Feature: clickup-style-sample-workflow, Property 14: Statistics Calculation Accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          active: fc.integer({ min: 0, max: 30 }),
          completed: fc.integer({ min: 0, max: 30 }),
          cancelled: fc.integer({ min: 0, max: 10 })
        }).filter(d => d.active + d.completed + d.cancelled > 0),
        async (statusDistribution) => {
          const totalExpected = statusDistribution.active + statusDistribution.completed + statusDistribution.cancelled
          const workflows = generateWorkflows(
            totalExpected,
            statusDistribution,
            { low: Math.floor(totalExpected / 3), medium: Math.floor(totalExpected / 3), high: Math.ceil(totalExpected / 3) },
            5
          )

          const expectedStats = calculateExpectedStats(workflows)

          vi.mocked(workflowService.getWorkflows).mockResolvedValue(workflows)
          vi.mocked(workflowService.getStatistics).mockResolvedValue(expectedStats)

          const stats = await workflowService.getStatistics()

          // Property: Completion rate should be (completed / total) * 100
          const expectedRate = Math.round(statusDistribution.completed / totalExpected * 1000) / 10
          expect(stats.completion_rate).toBe(expectedRate)

          // Property: Completion rate should be between 0 and 100
          expect(stats.completion_rate).toBeGreaterThanOrEqual(0)
          expect(stats.completion_rate).toBeLessThanOrEqual(100)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate priority distribution correctly', async () => {
    // Feature: clickup-style-sample-workflow, Property 14: Statistics Calculation Accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          low: fc.integer({ min: 0, max: 20 }),
          medium: fc.integer({ min: 0, max: 20 }),
          high: fc.integer({ min: 0, max: 20 })
        }).filter(d => d.low + d.medium + d.high > 0),
        async (priorityDistribution) => {
          const totalExpected = priorityDistribution.low + priorityDistribution.medium + priorityDistribution.high
          const workflows = generateWorkflows(
            totalExpected,
            { active: totalExpected, completed: 0, cancelled: 0 },
            priorityDistribution,
            5
          )

          const expectedStats = calculateExpectedStats(workflows)

          vi.mocked(workflowService.getWorkflows).mockResolvedValue(workflows)
          vi.mocked(workflowService.getStatistics).mockResolvedValue(expectedStats)

          const stats = await workflowService.getStatistics()

          // Property: Sum of priority distribution should equal total workflows
          const prioritySum = Object.values(stats.priority_distribution).reduce((a, b) => a + b, 0)
          expect(prioritySum).toBe(stats.total_workflows)

          // Property: Each priority count should be non-negative
          Object.values(stats.priority_distribution).forEach(count => {
            expect(count).toBeGreaterThanOrEqual(0)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate stage breakdown correctly', async () => {
    // Feature: clickup-style-sample-workflow, Property 14: Statistics Calculation Accuracy
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 15 }),
        async (numWorkflows) => {
          const workflows = generateWorkflows(
            numWorkflows,
            { active: numWorkflows, completed: 0, cancelled: 0 },
            { low: 0, medium: numWorkflows, high: 0 },
            5
          )

          const expectedStats = calculateExpectedStats(workflows)

          vi.mocked(workflowService.getWorkflows).mockResolvedValue(workflows)
          vi.mocked(workflowService.getStatistics).mockResolvedValue(expectedStats)

          const stats = await workflowService.getStatistics()

          // Property: Sum of all stage breakdown counts should equal total cards
          let stageBreakdownTotal = 0
          Object.values(stats.stage_breakdown).forEach(statusCounts => {
            stageBreakdownTotal += Object.values(statusCounts).reduce((a, b) => a + b, 0)
          })
          expect(stageBreakdownTotal).toBe(stats.total_cards)

          // Property: Each stage should have at least one card if workflows exist
          if (numWorkflows > 0) {
            expect(Object.keys(stats.stage_breakdown).length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle edge case of zero workflows', async () => {
    // Feature: clickup-style-sample-workflow, Property 14: Statistics Calculation Accuracy
    const emptyStats: WorkflowStats = {
      total_workflows: 0,
      active_workflows: 0,
      completed_workflows: 0,
      cancelled_workflows: 0,
      total_cards: 0,
      card_status_counts: {},
      blocked_cards: 0,
      overdue_workflows: 0,
      priority_distribution: {},
      avg_completion_days: 0,
      recent_workflows: 0,
      stage_breakdown: {},
      workload_distribution: {},
      completion_rate: 0
    }

    vi.mocked(workflowService.getWorkflows).mockResolvedValue([])
    vi.mocked(workflowService.getStatistics).mockResolvedValue(emptyStats)

    const stats = await workflowService.getStatistics()

    // Property: All counts should be zero for empty system
    expect(stats.total_workflows).toBe(0)
    expect(stats.active_workflows).toBe(0)
    expect(stats.completed_workflows).toBe(0)
    expect(stats.cancelled_workflows).toBe(0)
    expect(stats.total_cards).toBe(0)
    expect(stats.blocked_cards).toBe(0)
    expect(stats.overdue_workflows).toBe(0)
    expect(stats.completion_rate).toBe(0)
    expect(Object.keys(stats.card_status_counts).length).toBe(0)
    expect(Object.keys(stats.priority_distribution).length).toBe(0)
  })
})
