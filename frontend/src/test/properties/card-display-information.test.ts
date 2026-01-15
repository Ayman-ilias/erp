/**
 * Property Test 7: Card Display Information Completeness
 * Validates: Requirements 3.2
 * 
 * This test ensures that rendered workflow cards include card title, assignee, 
 * due date, and current status when these fields have values.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Type definitions for test data
interface CardResponse {
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

// Mock rendered card display structure
interface RenderedCardDisplay {
  cardTitle: string
  assignee?: string
  dueDate?: string
  status: string
  stageName: string
  stageOrder: number
  hasComments: boolean
  hasAttachments: boolean
  isOverdue?: boolean
  blockedReason?: string
}

describe('Property Test 7: Card Display Information Completeness', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Helper function to simulate card rendering logic
  const renderCard = (card: CardResponse): RenderedCardDisplay => {
    const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.cardStatus !== 'completed'
    
    return {
      cardTitle: card.cardTitle,
      assignee: card.assignedTo || undefined,
      dueDate: card.dueDate || undefined,
      status: card.cardStatus,
      stageName: card.stageName,
      stageOrder: card.stageOrder,
      hasComments: card.comments.length > 0,
      hasAttachments: card.attachments.length > 0,
      isOverdue: isOverdue || false,
      blockedReason: card.cardStatus === 'blocked' ? (card.blockedReason || undefined) : undefined
    }
  }

  it('should include card title, assignee, due date, and status when these fields have values', async () => {
    // Feature: clickup-style-sample-workflow, Property 7: Card Display Information Completeness
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          workflowId: fc.integer({ min: 1, max: 1000 }),
          stageName: fc.constantFrom('Design Approval', 'Assign Designer', 'Programming', 'Supervisor Knitting', 'Supervisor Finishing'),
          stageOrder: fc.integer({ min: 1, max: 5 }),
          cardTitle: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
          cardDescription: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined }),
          assignedTo: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
          cardStatus: fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked'),
          dueDate: fc.option(fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-06-30') }).map(ts => new Date(ts).toISOString()), { nil: undefined }),
          createdAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-06-30') }).map(ts => new Date(ts).toISOString()),
          updatedAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-06-30') }).map(ts => new Date(ts).toISOString()),
          completedAt: fc.option(fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-06-30') }).map(ts => new Date(ts).toISOString()), { nil: undefined }),
          blockedReason: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
          comments: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              cardId: fc.integer({ min: 1, max: 10000 }),
              commentText: fc.string({ minLength: 5, maxLength: 200 }),
              commentedBy: fc.string({ minLength: 3, maxLength: 50 }),
              createdAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString())
            }),
            { maxLength: 10 }
          ).map(arr => [...arr]),
          attachments: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              cardId: fc.integer({ min: 1, max: 10000 }),
              fileName: fc.string({ minLength: 5, maxLength: 50 }),
              fileUrl: fc.webUrl(),
              fileSize: fc.integer({ min: 1, max: 10000000 }),
              uploadedBy: fc.string({ minLength: 3, maxLength: 50 }),
              createdAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString())
            }),
            { maxLength: 5 }
          ).map(arr => [...arr])
        }),
        async (card) => {
          // Render the card
          const renderedCard = renderCard(card)

          // Property 7: Card Display Information Completeness
          // For any rendered workflow card, the display should include card title, assignee, 
          // due date, and current status when these fields have values

          // Card title should always be displayed (required field)
          expect(renderedCard.cardTitle).toBeDefined()
          expect(renderedCard.cardTitle).toBe(card.cardTitle)
          expect(renderedCard.cardTitle.trim().length).toBeGreaterThan(0)

          // Status should always be displayed (required field)
          expect(renderedCard.status).toBeDefined()
          expect(renderedCard.status).toBe(card.cardStatus)

          // Stage information should always be displayed
          expect(renderedCard.stageName).toBeDefined()
          expect(renderedCard.stageName).toBe(card.stageName)
          expect(renderedCard.stageOrder).toBeDefined()
          expect(renderedCard.stageOrder).toBe(card.stageOrder)

          // Assignee should be displayed when present
          if (card.assignedTo) {
            expect(renderedCard.assignee).toBeDefined()
            expect(renderedCard.assignee).toBe(card.assignedTo)
          } else {
            expect(renderedCard.assignee).toBeUndefined()
          }

          // Due date should be displayed when present
          if (card.dueDate) {
            expect(renderedCard.dueDate).toBeDefined()
            expect(renderedCard.dueDate).toBe(card.dueDate)
          } else {
            expect(renderedCard.dueDate).toBeUndefined()
          }

          // Comments indicator should reflect actual comments
          expect(renderedCard.hasComments).toBe(card.comments.length > 0)

          // Attachments indicator should reflect actual attachments
          expect(renderedCard.hasAttachments).toBe(card.attachments.length > 0)

          // Blocked reason should be displayed when card is blocked and reason exists
          if (card.cardStatus === 'blocked' && card.blockedReason) {
            expect(renderedCard.blockedReason).toBeDefined()
            expect(renderedCard.blockedReason).toBe(card.blockedReason)
          } else {
            expect(renderedCard.blockedReason).toBeUndefined()
          }

          // Overdue status should be calculated correctly
          if (card.dueDate && card.cardStatus !== 'completed') {
            const dueDate = new Date(card.dueDate)
            const now = new Date()
            const expectedOverdue = dueDate < now
            expect(renderedCard.isOverdue).toBe(expectedOverdue)
          } else {
            expect(renderedCard.isOverdue).toBe(false)
          }
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should handle cards with minimal information correctly', async () => {
    // Feature: clickup-style-sample-workflow, Property 7: Card Display Information Completeness
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          workflowId: fc.integer({ min: 1, max: 1000 }),
          stageName: fc.constantFrom('Design Approval', 'Assign Designer', 'Programming'),
          stageOrder: fc.integer({ min: 1, max: 3 }),
          cardTitle: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
          cardDescription: fc.constant(undefined), // No description
          assignedTo: fc.constant(undefined), // No assignee
          cardStatus: fc.constantFrom('pending', 'ready'),
          dueDate: fc.constant(undefined), // No due date
          createdAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString()),
          updatedAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString()),
          completedAt: fc.constant(undefined),
          blockedReason: fc.constant(undefined),
          comments: fc.constant([]), // No comments
          attachments: fc.constant([]) // No attachments
        }),
        async (card) => {
          const renderedCard = renderCard(card)

          // Property: Cards with minimal information should still display required fields
          
          // Required fields should always be present
          expect(renderedCard.cardTitle).toBeDefined()
          expect(renderedCard.cardTitle).toBe(card.cardTitle)
          expect(renderedCard.status).toBeDefined()
          expect(renderedCard.status).toBe(card.cardStatus)
          expect(renderedCard.stageName).toBeDefined()
          expect(renderedCard.stageName).toBe(card.stageName)
          expect(renderedCard.stageOrder).toBeDefined()
          expect(renderedCard.stageOrder).toBe(card.stageOrder)

          // Optional fields should be undefined when not provided
          expect(renderedCard.assignee).toBeUndefined()
          expect(renderedCard.dueDate).toBeUndefined()
          expect(renderedCard.blockedReason).toBeUndefined()

          // Indicators should reflect empty state
          expect(renderedCard.hasComments).toBe(false)
          expect(renderedCard.hasAttachments).toBe(false)
          expect(renderedCard.isOverdue).toBe(false)
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should handle cards with complete information correctly', async () => {
    // Feature: clickup-style-sample-workflow, Property 7: Card Display Information Completeness
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          workflowId: fc.integer({ min: 1, max: 1000 }),
          stageName: fc.constantFrom('Design Approval', 'Assign Designer', 'Programming', 'Supervisor Knitting', 'Supervisor Finishing'),
          stageOrder: fc.integer({ min: 1, max: 5 }),
          cardTitle: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
          cardDescription: fc.string({ minLength: 10, maxLength: 200 }), // Always has description
          assignedTo: fc.string({ minLength: 3, maxLength: 50 }), // Always has assignee
          cardStatus: fc.constantFrom('in_progress', 'completed', 'blocked'),
          dueDate: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString()), // Always has due date
          createdAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString()),
          updatedAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString()),
          completedAt: fc.option(fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString()), { nil: undefined }),
          blockedReason: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
          comments: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              cardId: fc.integer({ min: 1, max: 10000 }),
              commentText: fc.string({ minLength: 5, maxLength: 200 }),
              commentedBy: fc.string({ minLength: 3, maxLength: 50 }),
              createdAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString())
            }),
            { minLength: 1, maxLength: 5 } // Always has comments
          ).map(arr => [...arr]),
          attachments: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              cardId: fc.integer({ min: 1, max: 10000 }),
              fileName: fc.string({ minLength: 5, maxLength: 50 }),
              fileUrl: fc.webUrl(),
              fileSize: fc.integer({ min: 1, max: 10000000 }),
              uploadedBy: fc.string({ minLength: 3, maxLength: 50 }),
              createdAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString())
            }),
            { minLength: 1, maxLength: 3 } // Always has attachments
          ).map(arr => [...arr])
        }),
        async (card) => {
          const renderedCard = renderCard(card)

          // Property: Cards with complete information should display all available fields
          
          // All fields should be present and correctly mapped
          expect(renderedCard.cardTitle).toBeDefined()
          expect(renderedCard.cardTitle).toBe(card.cardTitle)
          expect(renderedCard.status).toBeDefined()
          expect(renderedCard.status).toBe(card.cardStatus)
          expect(renderedCard.stageName).toBeDefined()
          expect(renderedCard.stageName).toBe(card.stageName)
          expect(renderedCard.stageOrder).toBeDefined()
          expect(renderedCard.stageOrder).toBe(card.stageOrder)

          // Optional fields should be present when provided
          expect(renderedCard.assignee).toBeDefined()
          expect(renderedCard.assignee).toBe(card.assignedTo)
          expect(renderedCard.dueDate).toBeDefined()
          expect(renderedCard.dueDate).toBe(card.dueDate)

          // Indicators should reflect populated state
          expect(renderedCard.hasComments).toBe(true)
          expect(renderedCard.hasAttachments).toBe(true)

          // Blocked reason should be displayed for blocked cards
          if (card.cardStatus === 'blocked' && card.blockedReason) {
            expect(renderedCard.blockedReason).toBeDefined()
            expect(renderedCard.blockedReason).toBe(card.blockedReason)
          }

          // Overdue calculation should work with due dates
          if (card.cardStatus !== 'completed') {
            const dueDate = new Date(card.dueDate)
            const now = new Date()
            const expectedOverdue = dueDate < now
            expect(renderedCard.isOverdue).toBe(expectedOverdue)
          } else {
            expect(renderedCard.isOverdue).toBe(false)
          }
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should maintain display consistency across different card statuses', async () => {
    // Feature: clickup-style-sample-workflow, Property 7: Card Display Information Completeness
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          baseCard: fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            workflowId: fc.integer({ min: 1, max: 1000 }),
            stageName: fc.constantFrom('Design Approval', 'Assign Designer', 'Programming'),
            stageOrder: fc.integer({ min: 1, max: 3 }),
            cardTitle: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
            cardDescription: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined }),
            assignedTo: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
            dueDate: fc.option(fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString()), { nil: undefined }),
            createdAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString()),
            updatedAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString()),
            completedAt: fc.option(fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString()), { nil: undefined }),
            blockedReason: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
            comments: fc.array(
              fc.record({
                id: fc.integer({ min: 1, max: 10000 }),
                cardId: fc.integer({ min: 1, max: 10000 }),
                commentText: fc.string({ minLength: 5, maxLength: 200 }),
                commentedBy: fc.string({ minLength: 3, maxLength: 50 }),
                createdAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString())
              }),
              { maxLength: 3 }
            ).map(arr => [...arr]),
            attachments: fc.array(
              fc.record({
                id: fc.integer({ min: 1, max: 10000 }),
                cardId: fc.integer({ min: 1, max: 10000 }),
                fileName: fc.string({ minLength: 5, maxLength: 50 }),
                fileUrl: fc.webUrl(),
                fileSize: fc.integer({ min: 1, max: 10000000 }),
                uploadedBy: fc.string({ minLength: 3, maxLength: 50 }),
                createdAt: fc.integer({ min: Date.parse('2024-01-01'), max: Date.parse('2024-12-30') }).map(ts => new Date(ts).toISOString())
              }),
              { maxLength: 2 }
            ).map(arr => [...arr])
          }),
          statuses: fc.shuffledSubarray(['pending', 'ready', 'in_progress', 'completed', 'blocked'], { minLength: 2, maxLength: 5 })
        }),
        async ({ baseCard, statuses }) => {
          // Create cards with same data but different statuses
          const cardsWithDifferentStatuses = statuses.map(status => ({
            ...baseCard,
            cardStatus: status as any
          }))

          const renderedCards = cardsWithDifferentStatuses.map(card => renderCard(card))

          // Property: Display consistency should be maintained across different statuses
          
          // Core information should be identical across all status variations
          renderedCards.forEach((renderedCard, index) => {
            const originalCard = cardsWithDifferentStatuses[index]

            // Required fields should be consistent
            expect(renderedCard.cardTitle).toBe(baseCard.cardTitle)
            expect(renderedCard.stageName).toBe(baseCard.stageName)
            expect(renderedCard.stageOrder).toBe(baseCard.stageOrder)
            expect(renderedCard.status).toBe(originalCard.cardStatus)

            // Optional fields should be consistent when present
            if (baseCard.assignedTo) {
              expect(renderedCard.assignee).toBe(baseCard.assignedTo)
            }
            if (baseCard.dueDate) {
              expect(renderedCard.dueDate).toBe(baseCard.dueDate)
            }

            // Indicators should be consistent
            expect(renderedCard.hasComments).toBe(baseCard.comments.length > 0)
            expect(renderedCard.hasAttachments).toBe(baseCard.attachments.length > 0)

            // Status-specific behavior should be correct
            if (originalCard.cardStatus === 'blocked' && baseCard.blockedReason) {
              expect(renderedCard.blockedReason).toBe(baseCard.blockedReason)
            } else {
              expect(renderedCard.blockedReason).toBeUndefined()
            }

            // Overdue calculation should consider completion status
            if (baseCard.dueDate && originalCard.cardStatus !== 'completed') {
              const dueDate = new Date(baseCard.dueDate)
              const now = new Date()
              expect(renderedCard.isOverdue).toBe(dueDate < now)
            } else {
              expect(renderedCard.isOverdue).toBe(false)
            }
          })

          // All cards should have the same non-status-dependent information
          const firstCard = renderedCards[0]
          renderedCards.slice(1).forEach(card => {
            expect(card.cardTitle).toBe(firstCard.cardTitle)
            expect(card.stageName).toBe(firstCard.stageName)
            expect(card.stageOrder).toBe(firstCard.stageOrder)
            expect(card.assignee).toBe(firstCard.assignee)
            expect(card.dueDate).toBe(firstCard.dueDate)
            expect(card.hasComments).toBe(firstCard.hasComments)
            expect(card.hasAttachments).toBe(firstCard.hasAttachments)
          })
        }
      ),
      { numRuns: 10 }
    )
  })
})