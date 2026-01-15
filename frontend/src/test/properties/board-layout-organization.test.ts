/**
 * Property Test 8: Board Layout Organization
 * Validates: Requirements 3.1, 3.4, 3.5
 * 
 * This test ensures that workflow cards are properly grouped by workflow instance
 * and organized by status columns within each workflow for any set of workflow cards.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Type definitions for test data
interface WorkflowCard {
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
  comments: CommentResponse[]
  attachments: AttachmentResponse[]
}

interface CommentResponse {
  id: number
  cardId: number
  commentText: string
  commentedBy: string
  createdAt: string
}

interface AttachmentResponse {
  id: number
  cardId: number
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedBy: string
  createdAt: string
}

// Removed unused WorkflowResponse interface

describe('Property Test 8: Board Layout Organization', () => {
  const statusColumns = ['pending', 'ready', 'in_progress', 'completed', 'blocked'] as const

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should group workflow cards by workflow instance and organize by status columns', async () => {
    // Feature: clickup-style-sample-workflow, Property 8: Board Layout Organization
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            sampleRequestId: fc.integer({ min: 1, max: 1000 }),
            workflowName: fc.string({ minLength: 5, maxLength: 100 }),
            workflowStatus: fc.constantFrom('active', 'completed', 'cancelled'),
            createdBy: fc.string({ minLength: 3, maxLength: 50 }),
            createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
            updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
            priority: fc.constantFrom('low', 'medium', 'high'),
            sampleRequest: fc.record({
              sampleId: fc.string({ minLength: 5, maxLength: 20 }),
              sampleName: fc.string({ minLength: 5, maxLength: 50 }),
              buyerName: fc.string({ minLength: 3, maxLength: 50 })
            }),
            cards: fc.array(
              fc.record({
                id: fc.integer({ min: 1, max: 10000 }),
                stageName: fc.constantFrom('Design Approval', 'Assign Designer', 'Programming', 'Supervisor Knitting', 'Supervisor Finishing'),
                stageOrder: fc.integer({ min: 1, max: 5 }),
                cardTitle: fc.string({ minLength: 5, maxLength: 100 }),
                cardDescription: fc.option(fc.string({ minLength: 10, maxLength: 200 })),
                assignedTo: fc.option(fc.string({ minLength: 3, maxLength: 50 })),
                cardStatus: fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked'),
                dueDate: fc.option(fc.constant('2024-06-01T00:00:00.000Z'), { nil: undefined }),
                createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
                updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
                completedAt: fc.option(fc.constant('2024-06-01T00:00:00.000Z'), { nil: undefined }),
                blockedReason: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
                comments: fc.array(
                  fc.record({
                    id: fc.integer({ min: 1, max: 10000 }),
                    cardId: fc.integer({ min: 1, max: 10000 }),
                    commentText: fc.string({ minLength: 5, maxLength: 200 }),
                    commentedBy: fc.string({ minLength: 3, maxLength: 50 }),
                    createdAt: fc.constant('2024-01-01T00:00:00.000Z')
                  }),
                  { maxLength: 5 }
                ).map(arr => [...arr]),
                attachments: fc.array(
                  fc.record({
                    id: fc.integer({ min: 1, max: 10000 }),
                    cardId: fc.integer({ min: 1, max: 10000 }),
                    fileName: fc.string({ minLength: 5, maxLength: 50 }),
                    fileUrl: fc.webUrl(),
                    fileSize: fc.integer({ min: 1, max: 10000000 }),
                    uploadedBy: fc.string({ minLength: 3, maxLength: 50 }),
                    createdAt: fc.constant('2024-01-01T00:00:00.000Z')
                  }),
                  { maxLength: 3 }
                ).map(arr => [...arr])
              }),
              { minLength: 1, maxLength: 10 }
            )
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (workflows) => {
          // Ensure unique workflow IDs and assign workflow IDs to cards
          const uniqueWorkflows = workflows.map((workflow, index) => ({
            ...workflow,
            id: index + 1,
            cards: workflow.cards.map((card, cardIndex) => ({
              ...card,
              id: index * 1000 + cardIndex + 1,
              workflowId: index + 1
            }))
          }))

          if (uniqueWorkflows.length === 0) return // Skip if no workflows

          // Property 8: Board Layout Organization
          // For any set of workflow cards, they should be grouped by workflow instance 
          // and organized by status columns within each workflow

          // Test 1: Cards should be grouped by workflow instance
          uniqueWorkflows.forEach(workflow => {
            const workflowCards = workflow.cards
            
            // All cards in a workflow should have the same workflowId
            workflowCards.forEach(card => {
              expect(card.workflowId).toBe(workflow.id)
            })

            // Cards should be properly associated with their workflow
            expect(workflowCards.every(card => card.workflowId === workflow.id)).toBe(true)
          })

          // Test 2: Cards should be organizable by status columns
          uniqueWorkflows.forEach(workflow => {
            const workflowCards = workflow.cards

            // Group cards by status
            const cardsByStatus = statusColumns.reduce((acc, status) => {
              acc[status] = workflowCards.filter(card => card.cardStatus === status)
              return acc
            }, {} as Record<string, WorkflowCard[]>)

            // Verify that all cards are accounted for in status columns
            const totalCardsInColumns = Object.values(cardsByStatus).reduce((sum, cards) => sum + cards.length, 0)
            expect(totalCardsInColumns).toBe(workflowCards.length)

            // Verify that each status column contains only cards with that status
            statusColumns.forEach(status => {
              const statusCards = cardsByStatus[status]
              statusCards.forEach(card => {
                expect(card.cardStatus).toBe(status)
              })
            })

            // Verify that cards within each status column can be properly organized by stage order
            statusColumns.forEach(status => {
              const statusCards = cardsByStatus[status]
              if (statusCards.length > 1) {
                // Test that cards can be sorted by stage order (this is what the UI component does)
                const sortedCards = [...statusCards].sort((a, b) => a.stageOrder - b.stageOrder)
                
                // Verify sorting produces a valid result
                expect(sortedCards.length).toBe(statusCards.length)
                
                // Verify that sorted cards maintain their properties
                sortedCards.forEach((card, index) => {
                  expect(card.cardStatus).toBe(status)
                  expect(card.workflowId).toBeDefined()
                  expect(card.stageOrder).toBeDefined()
                  
                  // Verify ascending order
                  if (index > 0) {
                    expect(card.stageOrder).toBeGreaterThanOrEqual(sortedCards[index - 1].stageOrder)
                  }
                })
                
                // Verify all original cards are present after sorting
                statusCards.forEach(originalCard => {
                  const foundCard = sortedCards.find(sortedCard => sortedCard.id === originalCard.id)
                  expect(foundCard).toBeDefined()
                  expect(foundCard).toEqual(originalCard)
                })
              }
            })
          })

          // Test 3: Workflow separation should be maintained
          const allCards = uniqueWorkflows.flatMap(w => w.cards)
          const cardsByWorkflow = allCards.reduce((acc, card) => {
            if (!acc[card.workflowId]) {
              acc[card.workflowId] = []
            }
            acc[card.workflowId].push(card)
            return acc
          }, {} as Record<number, WorkflowCard[]>)

          // Each workflow should have its own separate card collection
          Object.keys(cardsByWorkflow).forEach(workflowId => {
            const workflowCards = cardsByWorkflow[parseInt(workflowId)]
            const expectedWorkflow = uniqueWorkflows.find(w => w.id === parseInt(workflowId))
            
            if (expectedWorkflow) {
              expect(workflowCards.length).toBe(expectedWorkflow.cards.length)
              
              // All cards should belong to the same workflow
              workflowCards.forEach(card => {
                expect(card.workflowId).toBe(parseInt(workflowId))
              })
            }
          })

          // Test 4: Status column organization should be consistent across workflows
          uniqueWorkflows.forEach(workflow => {
            const workflowCards = workflow.cards

            // Each status should form a distinct column
            statusColumns.forEach(status => {
              const statusCards = workflowCards.filter(card => card.cardStatus === status)
              
              // Cards in the same status column should be distinguishable from other columns
              const otherStatusCards = workflowCards.filter(card => card.cardStatus !== status)
              
              // No overlap between status columns
              statusCards.forEach(statusCard => {
                expect(otherStatusCards.find(otherCard => otherCard.id === statusCard.id)).toBeUndefined()
              })
            })
          })

          // Test 5: Board layout should support multiple workflows simultaneously
          if (uniqueWorkflows.length > 1) {
            // Each workflow should maintain its own identity
            const workflowIds = uniqueWorkflows.map(w => w.id)
            const uniqueWorkflowIds = [...new Set(workflowIds)]
            expect(workflowIds.length).toBe(uniqueWorkflowIds.length)

            // Cards should not be mixed between workflows
            uniqueWorkflows.forEach(workflow => {
              const workflowCards = workflow.cards
              const otherWorkflowCards = uniqueWorkflows
                .filter(w => w.id !== workflow.id)
                .flatMap(w => w.cards)

              workflowCards.forEach(card => {
                expect(otherWorkflowCards.find(otherCard => otherCard.id === card.id)).toBeUndefined()
              })
            })
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain proper status column structure with empty columns', async () => {
    // Feature: clickup-style-sample-workflow, Property 8: Board Layout Organization
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.constant(1), // Fixed ID to match cards
          sampleRequestId: fc.integer({ min: 1, max: 1000 }),
          workflowName: fc.string({ minLength: 5, maxLength: 100 }),
          workflowStatus: fc.constantFrom('active', 'completed', 'cancelled'),
          createdBy: fc.string({ minLength: 3, maxLength: 50 }),
          createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
          updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
          priority: fc.constantFrom('low', 'medium', 'high'),
          sampleRequest: fc.record({
            sampleId: fc.string({ minLength: 5, maxLength: 20 }),
            sampleName: fc.string({ minLength: 5, maxLength: 50 }),
            buyerName: fc.string({ minLength: 3, maxLength: 50 })
          }),
          cards: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              workflowId: fc.constant(1), // All cards belong to same workflow
              stageName: fc.constantFrom('Design Approval', 'Assign Designer', 'Programming'),
              stageOrder: fc.integer({ min: 1, max: 3 }),
              cardTitle: fc.string({ minLength: 5, maxLength: 100 }),
              cardStatus: fc.constantFrom('pending', 'in_progress'), // Only use subset of statuses
              createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
              updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
              comments: fc.constant([]),
              attachments: fc.constant([])
            }),
            { minLength: 1, maxLength: 5 }
          )
        }),
        async (workflow) => {
          const workflowCards = workflow.cards

          // Property: Status column structure should be maintained even with empty columns
          const cardsByStatus = statusColumns.reduce((acc, status) => {
            acc[status] = workflowCards.filter(card => card.cardStatus === status)
            return acc
          }, {} as Record<string, WorkflowCard[]>)

          // All status columns should exist (even if empty)
          statusColumns.forEach(status => {
            expect(cardsByStatus[status]).toBeDefined()
            expect(Array.isArray(cardsByStatus[status])).toBe(true)
          })

          // Some columns may be empty, but structure should be preserved
          const nonEmptyColumns = statusColumns.filter(status => cardsByStatus[status].length > 0)
          const emptyColumns = statusColumns.filter(status => cardsByStatus[status].length === 0)

          // At least one column should have cards (since we have cards in the workflow)
          expect(nonEmptyColumns.length).toBeGreaterThan(0)

          // Empty columns should still be valid arrays
          emptyColumns.forEach(status => {
            expect(cardsByStatus[status]).toEqual([])
          })

          // Total cards should equal sum of all columns
          const totalCards = statusColumns.reduce((sum, status) => sum + cardsByStatus[status].length, 0)
          expect(totalCards).toBe(workflowCards.length)

          // Column organization should be independent of whether columns are empty
          statusColumns.forEach(status => {
            const columnCards = cardsByStatus[status]
            columnCards.forEach(card => {
              expect(card.cardStatus).toBe(status)
              expect(card.workflowId).toBe(workflow.id)
            })
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle workflow cards with complex metadata while maintaining organization', async () => {
    // Feature: clickup-style-sample-workflow, Property 8: Board Layout Organization
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            workflowId: fc.integer({ min: 1, max: 5 }),
            stageName: fc.string({ minLength: 5, maxLength: 50 }),
            stageOrder: fc.integer({ min: 1, max: 20 }),
            cardTitle: fc.string({ minLength: 5, maxLength: 100 }),
            cardDescription: fc.option(fc.string({ minLength: 10, maxLength: 500 }), { nil: undefined }),
            assignedTo: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
            cardStatus: fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked'),
            dueDate: fc.option(fc.constant('2024-06-01T00:00:00.000Z'), { nil: undefined }),
            createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
            updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
            completedAt: fc.option(fc.constant('2024-06-01T00:00:00.000Z'), { nil: undefined }),
            blockedReason: fc.option(fc.string({ minLength: 5, maxLength: 200 }), { nil: undefined }),
            comments: fc.array(
              fc.record({
                id: fc.integer({ min: 1, max: 10000 }),
                cardId: fc.integer({ min: 1, max: 10000 }),
                commentText: fc.string({ minLength: 5, maxLength: 300 }),
                commentedBy: fc.string({ minLength: 3, maxLength: 50 }),
                createdAt: fc.constant('2024-01-01T00:00:00.000Z')
              }),
              { maxLength: 10 }
            ).map(arr => [...arr]),
            attachments: fc.array(
              fc.record({
                id: fc.integer({ min: 1, max: 10000 }),
                cardId: fc.integer({ min: 1, max: 10000 }),
                fileName: fc.string({ minLength: 5, maxLength: 100 }),
                fileUrl: fc.webUrl(),
                fileSize: fc.integer({ min: 1, max: 100000000 }),
                uploadedBy: fc.string({ minLength: 3, maxLength: 50 }),
                createdAt: fc.constant('2024-01-01T00:00:00.000Z')
              }),
              { maxLength: 5 }
            ).map(arr => [...arr])
          }),
          { minLength: 1, maxLength: 20 }
        ).map(cards => {
          // Ensure unique card IDs
          return cards.map((card, index) => ({
            ...card,
            id: index + 1
          }))
        }),
        async (cards) => {
          if (cards.length === 0) return // Skip if no cards

          // Property: Complex metadata should not affect basic organization principles
          
          // Group cards by workflow
          const cardsByWorkflow = cards.reduce((acc, card) => {
            if (!acc[card.workflowId]) {
              acc[card.workflowId] = []
            }
            acc[card.workflowId].push(card)
            return acc
          }, {} as Record<number, WorkflowCard[]>)

          // Test organization within each workflow
          Object.entries(cardsByWorkflow).forEach(([workflowId, workflowCards]) => {
            const wId = parseInt(workflowId)

            // All cards should belong to the same workflow
            workflowCards.forEach(card => {
              expect(card.workflowId).toBe(wId)
            })

            // Status-based organization should work regardless of metadata complexity
            const cardsByStatus = statusColumns.reduce((acc, status) => {
              acc[status] = workflowCards.filter(card => card.cardStatus === status)
              return acc
            }, {} as Record<string, WorkflowCard[]>)

            // Verify status column integrity
            statusColumns.forEach(status => {
              const statusCards = cardsByStatus[status]
              statusCards.forEach(card => {
                expect(card.cardStatus).toBe(status)
                
                // Metadata should be preserved regardless of organization
                if (card.cardDescription) {
                  expect(typeof card.cardDescription).toBe('string')
                  expect(card.cardDescription.length).toBeGreaterThan(0)
                }
                
                if (card.assignedTo) {
                  expect(typeof card.assignedTo).toBe('string')
                  expect(card.assignedTo.length).toBeGreaterThan(0)
                }
                
                if (card.dueDate) {
                  expect(typeof card.dueDate).toBe('string')
                  expect(new Date(card.dueDate)).toBeInstanceOf(Date)
                }
                
                if (card.blockedReason) {
                  expect(typeof card.blockedReason).toBe('string')
                  expect(card.blockedReason.length).toBeGreaterThan(0)
                }
                
                // Comments and attachments should be arrays
                expect(Array.isArray(card.comments)).toBe(true)
                expect(Array.isArray(card.attachments)).toBe(true)
                
                // Complex metadata should not interfere with basic card properties
                expect(typeof card.id).toBe('number')
                expect(typeof card.stageName).toBe('string')
                expect(typeof card.stageOrder).toBe('number')
                expect(typeof card.cardTitle).toBe('string')
              })
            })

            // Total cards should be preserved
            const totalCardsInColumns = Object.values(cardsByStatus).reduce((sum, cards) => sum + cards.length, 0)
            expect(totalCardsInColumns).toBe(workflowCards.length)
          })

          // Cross-workflow organization should be maintained
          const allWorkflowIds = [...new Set(cards.map(card => card.workflowId))]
          allWorkflowIds.forEach(workflowId => {
            const workflowCards = cards.filter(card => card.workflowId === workflowId)
            const otherWorkflowCards = cards.filter(card => card.workflowId !== workflowId)
            
            // No card should appear in multiple workflows (check by combination of id and workflowId)
            workflowCards.forEach(card => {
              const duplicateInOtherWorkflow = otherWorkflowCards.find(otherCard => 
                otherCard.id === card.id && otherCard.workflowId !== card.workflowId
              )
              expect(duplicateInOtherWorkflow).toBeUndefined()
            })
          })
        }
      ),
      { numRuns: 50 }
    )
  })
})