/**
 * Enhanced Error Handling Service
 * Implements retry logic, exponential backoff, and user-friendly error messages
 * Requirements: 1.3, 1.4
 */

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableErrors: string[]
}

export interface ErrorContext {
  operation: string
  endpoint?: string
  timestamp: Date
  userAgent?: string
  userId?: string
}

export interface ErrorLogEntry {
  id: string
  context: ErrorContext
  error: Error
  retryAttempt: number
  resolved: boolean
  timestamp: Date
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService
  private errorLog: ErrorLogEntry[] = []
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
    retryableErrors: [
      'Network Error',
      'Timeout',
      'Connection refused',
      'Server unavailable',
      'fetch failed',
      'Failed to fetch',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED'
    ]
  }

  private constructor() {}

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService()
    }
    return ErrorHandlingService.instance
  }

  /**
   * Execute an operation with retry logic and exponential backoff
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config }
    let lastError: Error
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const result = await operation()
        
        // If we had previous errors for this operation, mark them as resolved
        this.markErrorsResolved(context.operation)
        
        return result
      } catch (error) {
        lastError = error as Error
        
        // Log the error
        this.logError(lastError, context, attempt)
        
        // Check if this error is retryable
        if (!this.isRetryableError(lastError, retryConfig) || attempt === retryConfig.maxRetries) {
          throw this.enhanceError(lastError, context, attempt)
        }
        
        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, retryConfig)
        await this.sleep(delay)
      }
    }
    
    throw this.enhanceError(lastError!, context, retryConfig.maxRetries)
  }

  /**
   * Check if an error is retryable based on configuration
   */
  private isRetryableError(error: Error, config: RetryConfig): boolean {
    const errorMessage = error.message.toLowerCase()
    return config.retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError.toLowerCase())
    )
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt)
    const delayWithJitter = exponentialDelay + (Math.random() * 1000) // Add up to 1s jitter
    return Math.min(delayWithJitter, config.maxDelay)
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Log error with context information
   */
  private logError(error: Error, context: ErrorContext, retryAttempt: number): void {
    const logEntry: ErrorLogEntry = {
      id: this.generateErrorId(),
      context,
      error,
      retryAttempt,
      resolved: false,
      timestamp: new Date()
    }
    
    this.errorLog.push(logEntry)
    
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorHandlingService] ${context.operation} failed (attempt ${retryAttempt + 1}):`, {
        error: error.message,
        context,
        timestamp: logEntry.timestamp
      })
    }
    
    // Keep only last 100 error entries to prevent memory leaks
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }
  }

  /**
   * Mark errors as resolved for a specific operation
   */
  private markErrorsResolved(operation: string): void {
    this.errorLog
      .filter(entry => entry.context.operation === operation && !entry.resolved)
      .forEach(entry => entry.resolved = true)
  }

  /**
   * Enhance error with user-friendly message and context
   */
  private enhanceError(error: Error, context: ErrorContext, finalAttempt: number): Error {
    const userFriendlyMessage = this.getUserFriendlyMessage(error, context)
    const enhancedError = new Error(userFriendlyMessage)
    
    // Preserve original error information
    ;(enhancedError as any).originalError = error
    ;(enhancedError as any).context = context
    ;(enhancedError as any).finalAttempt = finalAttempt
    
    return enhancedError
  }

  /**
   * Generate user-friendly error messages
   */
  private getUserFriendlyMessage(error: Error, context: ErrorContext): string {
    const errorMessage = error.message.toLowerCase()
    
    // Network-related errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch failed')) {
      return `Unable to connect to the server. Please check your internet connection and try again.`
    }
    
    if (errorMessage.includes('timeout')) {
      return `The request took too long to complete. Please try again.`
    }
    
    if (errorMessage.includes('connection refused') || errorMessage.includes('server unavailable')) {
      return `The server is currently unavailable. Please try again in a few moments.`
    }
    
    // Authentication errors
    if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return `Your session has expired. Please log in again.`
    }
    
    if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      return `You don't have permission to perform this action.`
    }
    
    // Not found errors
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return `The requested information could not be found.`
    }
    
    // Server errors
    if (errorMessage.includes('500') || errorMessage.includes('internal server error')) {
      return `A server error occurred. Our team has been notified. Please try again later.`
    }
    
    // Validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return `Please check your input and try again.`
    }
    
    // Context-specific messages
    switch (context.operation) {
      case 'load-shipping-data':
        return `Failed to load shipping information. Please refresh the page or try again later.`
      case 'load-banking-data':
        return `Failed to load banking information. Please refresh the page or try again later.`
      case 'create-shipping':
        return `Failed to create shipping information. Please check your input and try again.`
      case 'create-banking':
        return `Failed to create banking information. Please check your input and try again.`
      case 'update-shipping':
        return `Failed to update shipping information. Please try again.`
      case 'update-banking':
        return `Failed to update banking information. Please try again.`
      case 'delete-shipping':
        return `Failed to delete shipping information. Please try again.`
      case 'delete-banking':
        return `Failed to delete banking information. Please try again.`
      default:
        return `An unexpected error occurred. Please try again or contact support if the problem persists.`
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStats(): {
    totalErrors: number
    resolvedErrors: number
    unresolvedErrors: number
    errorsByOperation: Record<string, number>
    recentErrors: ErrorLogEntry[]
  } {
    const totalErrors = this.errorLog.length
    const resolvedErrors = this.errorLog.filter(e => e.resolved).length
    const unresolvedErrors = totalErrors - resolvedErrors
    
    const errorsByOperation = this.errorLog.reduce((acc, entry) => {
      const operation = entry.context.operation
      acc[operation] = (acc[operation] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const recentErrors = this.errorLog
      .filter(e => !e.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)
    
    return {
      totalErrors,
      resolvedErrors,
      unresolvedErrors,
      errorsByOperation,
      recentErrors
    }
  }

  /**
   * Clear error log (useful for testing)
   */
  public clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * Handle empty state scenarios
   */
  public handleEmptyState(_operation: string, dataType: string): {
    isEmpty: boolean
    message: string
    suggestions: string[]
  } {
    const suggestions: string[] = []
    let message = ''
    
    switch (dataType) {
      case 'shipping':
        message = 'No shipping information found.'
        suggestions.push('Add your first shipping destination to get started')
        suggestions.push('Check if you have the correct permissions')
        break
      case 'banking':
        message = 'No banking information found.'
        suggestions.push('Add your first banking details to get started')
        suggestions.push('Verify your client type filter settings')
        break
      default:
        message = 'No data found.'
        suggestions.push('Try adjusting your search criteria')
        suggestions.push('Check your filters and try again')
    }
    
    return {
      isEmpty: true,
      message,
      suggestions
    }
  }
}

// Export singleton instance
export const errorHandlingService = ErrorHandlingService.getInstance()