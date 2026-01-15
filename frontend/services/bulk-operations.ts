/**
 * Bulk Operations Service
 * Handles progress tracking and cancellation for bulk operations
 * Requirements: 7.5
 */

import { BulkOperationProgress } from "@/components/ui/progress-indicator"

export interface BulkOperationItem {
  id: string
  data: any
  operation: () => Promise<any>
}

export interface BulkOperationConfig {
  operationName: string
  items: BulkOperationItem[]
  concurrency?: number
  onProgress?: (progress: BulkOperationProgress) => void
  onComplete?: (progress: BulkOperationProgress) => void
  onError?: (progress: BulkOperationProgress) => void
}

export class BulkOperationManager {
  private static instance: BulkOperationManager
  private activeOperations = new Map<string, AbortController>()
  private progressCallbacks = new Map<string, (progress: BulkOperationProgress) => void>()

  private constructor() {}

  public static getInstance(): BulkOperationManager {
    if (!BulkOperationManager.instance) {
      BulkOperationManager.instance = new BulkOperationManager()
    }
    return BulkOperationManager.instance
  }

  /**
   * Execute a bulk operation with progress tracking and cancellation support
   */
  public async executeBulkOperation(config: BulkOperationConfig): Promise<BulkOperationProgress> {
    const operationId = this.generateOperationId()
    const abortController = new AbortController()
    
    // Initialize progress
    const progress: BulkOperationProgress = {
      id: operationId,
      total: config.items.length,
      completed: 0,
      failed: 0,
      status: 'running',
      startTime: new Date(),
      errors: [],
      operationName: config.operationName
    }

    // Store abort controller and progress callback
    this.activeOperations.set(operationId, abortController)
    if (config.onProgress) {
      this.progressCallbacks.set(operationId, config.onProgress)
    }

    // Report initial progress
    this.reportProgress(operationId, progress)

    try {
      // Execute operations with controlled concurrency
      const concurrency = config.concurrency || 3
      const results = await this.executeWithConcurrency(
        config.items,
        concurrency,
        abortController.signal,
        (completed, failed, errors) => {
          progress.completed = completed
          progress.failed = failed
          progress.errors = errors
          this.reportProgress(operationId, progress)
        }
      )

      // Update final status
      if (abortController.signal.aborted) {
        progress.status = 'cancelled'
      } else if (progress.failed > 0) {
        progress.status = 'failed'
      } else {
        progress.status = 'completed'
      }

      progress.endTime = new Date()
      this.reportProgress(operationId, progress)

      // Call completion callback
      if (config.onComplete) {
        config.onComplete(progress)
      }

      return progress

    } catch (error) {
      progress.status = 'failed'
      progress.endTime = new Date()
      
      if (!abortController.signal.aborted) {
        progress.errors.push({
          index: -1,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
      }

      this.reportProgress(operationId, progress)

      if (config.onError) {
        config.onError(progress)
      }

      throw error
    } finally {
      // Clean up
      this.activeOperations.delete(operationId)
      this.progressCallbacks.delete(operationId)
    }
  }

  /**
   * Cancel a running bulk operation
   */
  public cancelOperation(operationId: string): boolean {
    const abortController = this.activeOperations.get(operationId)
    if (abortController) {
      abortController.abort()
      return true
    }
    return false
  }

  /**
   * Get list of active operations
   */
  public getActiveOperations(): string[] {
    return Array.from(this.activeOperations.keys())
  }

  /**
   * Check if an operation is active
   */
  public isOperationActive(operationId: string): boolean {
    return this.activeOperations.has(operationId)
  }

  /**
   * Execute operations with controlled concurrency
   */
  private async executeWithConcurrency(
    items: BulkOperationItem[],
    concurrency: number,
    signal: AbortSignal,
    onProgress: (completed: number, failed: number, errors: Array<{ index: number; error: string }>) => void
  ): Promise<any[]> {
    const results: any[] = []
    const errors: Array<{ index: number; error: string }> = []
    let completed = 0
    let failed = 0

    // Create a semaphore to limit concurrency
    const semaphore = new Semaphore(concurrency)

    // Create promises for all operations
    const promises = items.map(async (item, index) => {
      // Wait for semaphore
      await semaphore.acquire()

      try {
        // Check if operation was cancelled
        if (signal.aborted) {
          throw new Error('Operation cancelled')
        }

        // Execute the operation
        const result = await item.operation()
        results[index] = result
        completed++
        
        // Report progress
        onProgress(completed, failed, errors)
        
        return result
      } catch (error) {
        failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({ index, error: errorMessage })
        
        // Report progress
        onProgress(completed, failed, errors)
        
        // Don't throw here - we want to continue with other operations
        return null
      } finally {
        semaphore.release()
      }
    })

    // Wait for all operations to complete
    await Promise.allSettled(promises)

    return results
  }

  /**
   * Report progress to callback
   */
  private reportProgress(operationId: string, progress: BulkOperationProgress): void {
    const callback = this.progressCallbacks.get(operationId)
    if (callback) {
      callback({ ...progress })
    }
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(): string {
    return `bulk_op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }
}

/**
 * Simple semaphore implementation for concurrency control
 */
class Semaphore {
  private permits: number
  private waitQueue: Array<() => void> = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve)
    })
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!
      resolve()
    } else {
      this.permits++
    }
  }
}

// Export singleton instance
export const bulkOperationManager = BulkOperationManager.getInstance()

/**
 * Hook for managing bulk operations in React components
 */
export function useBulkOperations() {
  const [operations, setOperations] = React.useState<BulkOperationProgress[]>([])

  const addOperation = React.useCallback((progress: BulkOperationProgress) => {
    setOperations(prev => [...prev, progress])
  }, [])

  const updateOperation = React.useCallback((progress: BulkOperationProgress) => {
    setOperations(prev => 
      prev.map(op => op.id === progress.id ? progress : op)
    )
  }, [])

  const removeOperation = React.useCallback((operationId: string) => {
    setOperations(prev => prev.filter(op => op.id !== operationId))
  }, [])

  const cancelOperation = React.useCallback((operationId: string) => {
    return bulkOperationManager.cancelOperation(operationId)
  }, [])

  const executeBulkOperation = React.useCallback(async (config: Omit<BulkOperationConfig, 'onProgress'>) => {
    return bulkOperationManager.executeBulkOperation({
      ...config,
      onProgress: (progress) => {
        if (operations.find(op => op.id === progress.id)) {
          updateOperation(progress)
        } else {
          addOperation(progress)
        }
      }
    })
  }, [operations, addOperation, updateOperation])

  return {
    operations,
    addOperation,
    updateOperation,
    removeOperation,
    cancelOperation,
    executeBulkOperation
  }
}

// Import React for the hook
import * as React from "react"