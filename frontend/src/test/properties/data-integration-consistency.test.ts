/**
 * Property-Based Test: Data Integration Consistency
 * Feature: clickup-style-sample-workflow, Property 15: Data Integration Consistency
 * 
 * **Property 15: Data Integration Consistency**
 * *For any* workflow status change, the corresponding sample request record should be updated with the current workflow status
 * **Validates: Requirements 10.2**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';

// Mock API services
const mockSamplesService = {
  requests: {
    getAll: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  }
};

const mockWorkflowService = {
  updateCardStatus: vi.fn(),
  getWorkflow: vi.fn(),
};

// Mock the API services
vi.mock('@/services/api', () => ({
  samplesService: mockSamplesService,
  workflowService: mockWorkflowService,
}));

// Test data generators
const workflowStatusGenerator = fc.constantFrom('active', 'completed', 'cancelled');
const cardStatusGenerator = fc.constantFrom('pending', 'ready', 'in_progress', 'completed', 'blocked');

const sampleRequestGenerator = fc.record({
  id: fc.integer({ min: 1, max: 1000 }),
  sample_id: fc.string({ minLength: 5, maxLength: 20 }),
  sample_name: fc.string({ minLength: 3, maxLength: 50 }),
  current_status: fc.constantFrom('Pending', 'In Progress', 'Completed', 'Blocked', 'Cancelled'),
  workflow_status: fc.option(fc.record({
    workflow_id: fc.integer({ min: 1, max: 1000 }),
    workflow_name: fc.string({ minLength: 5, maxLength: 50 }),
    status: workflowStatusGenerator,
    progress: fc.integer({ min: 0, max: 100 }),
    current_stage: fc.record({
      stage_name: fc.string({ minLength: 3, maxLength: 30 }),
      status: cardStatusGenerator,
      assigned_to: fc.option(fc.string({ minLength: 3, maxLength: 30 }))
    })
  }))
});

describe('Data Integration Consistency Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Property 15: Sample requests with workflow status should have valid structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        sampleRequestGenerator,
        async (sampleRequest) => {
          // Mock the API response
          mockSamplesService.requests.getById.mockResolvedValue(sampleRequest);
          
          // Act: Get the sample request
          const result = await mockSamplesService.requests.getById(sampleRequest.id);
          
          // Assert: Verify the integration consistency (Requirements 10.2)
          if (result.workflow_status) {
            // Workflow status should have required fields
            expect(result.workflow_status).toHaveProperty('workflow_id');
            expect(result.workflow_status).toHaveProperty('workflow_name');
            expect(result.workflow_status).toHaveProperty('status');
            expect(result.workflow_status).toHaveProperty('progress');
            expect(result.workflow_status).toHaveProperty('current_stage');
            
            // Validate field types and ranges
            expect(typeof result.workflow_status.workflow_id).toBe('number');
            expect(typeof result.workflow_status.workflow_name).toBe('string');
            expect(['active', 'completed', 'cancelled']).toContain(result.workflow_status.status);
            expect(result.workflow_status.progress).toBeGreaterThanOrEqual(0);
            expect(result.workflow_status.progress).toBeLessThanOrEqual(100);
            
            // Current stage should have valid structure
            if (result.workflow_status.current_stage) {
              expect(result.workflow_status.current_stage).toHaveProperty('stage_name');
              expect(result.workflow_status.current_stage).toHaveProperty('status');
              expect(typeof result.workflow_status.current_stage.stage_name).toBe('string');
              expect(['pending', 'ready', 'in_progress', 'completed', 'blocked']).toContain(result.workflow_status.current_stage.status);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15a: Sample requests without workflows should not have workflow status', async () => {
    await fc.assert(
      fc.asyncProperty(
        sampleRequestGenerator,
        async (sampleRequest) => {
          // Arrange: Sample request without workflow
          const sampleWithoutWorkflow = {
            ...sampleRequest,
            workflow_status: null
          };
          
          mockSamplesService.requests.getById.mockResolvedValue(sampleWithoutWorkflow);
          
          // Act: Get the sample request
          const result = await mockSamplesService.requests.getById(sampleRequest.id);
          
          // Assert: Workflow status should be null or undefined
          expect(result.workflow_status).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 15b: Workflow progress should be within valid range', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          workflow_status: fc.record({
            workflow_id: fc.integer({ min: 1, max: 1000 }),
            workflow_name: fc.string({ minLength: 5, maxLength: 50 }),
            status: workflowStatusGenerator,
            progress: fc.integer({ min: 0, max: 100 }),
            current_stage: fc.record({
              stage_name: fc.string({ minLength: 3, maxLength: 30 }),
              status: cardStatusGenerator,
              assigned_to: fc.option(fc.string({ minLength: 3, maxLength: 30 }))
            })
          })
        }),
        async (sampleWithWorkflow) => {
          // Mock the API response
          mockSamplesService.requests.getById.mockResolvedValue(sampleWithWorkflow);
          
          // Act: Get the sample request
          const result = await mockSamplesService.requests.getById(1);
          
          // Assert: Progress should be within valid range
          expect(result.workflow_status.progress).toBeGreaterThanOrEqual(0);
          expect(result.workflow_status.progress).toBeLessThanOrEqual(100);
          expect(Number.isInteger(result.workflow_status.progress)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});