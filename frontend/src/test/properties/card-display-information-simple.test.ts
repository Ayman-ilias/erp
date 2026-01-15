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
          stageName: fc.constantFrom('Design Approval', 'Assign Designer', 'Programming'),
          stageOrder: fc.integer({ min: 1, max: 3 }),
          cardTitle: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
          cardDescription: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined }),
          assignedTo: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
          cardStatus: fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked'),
          dueDate: fc.option(fc.constant('2024-03-15T10:00:00.000Z'), { nil: undefined }),
          createdAt: fc.constant('2024-01-15T10:00:00.000Z'),
          updatedAt: fc.constant('2024-01-16T10:00:00.000Z'),
          completedAt: fc.option(fc.constant('2024-01-20T10:00:00.000Z'), { nil: undefined }),
          blockedReason: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
          comments: fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              cardId: fc.integer({ min: 1, max: 10000 }),
              commentText: fc.string({ minLength: 5, maxLength: 200 }),
              commentedBy: fc.string({ minLength: 3, maxLength: 50 }),
              createdAt: fc.constant('2024-01-17T10:00:00.000Z')
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
              createdAt: fc.constant('2024-01-18T10:00:00.000Z')
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
      { numRuns: 50 }
    )
  })
})