/**
 * Unit of Measure Error Handling Service
 * 
 * Specialized error handling for Unit Conversion System operations.
 * Provides user-friendly error messages, retry logic, and fallback states.
 * 
 * **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**
 */

import { errorHandlingService, ErrorContext } from './error-handling';

// ============================================================================
// UOM ERROR TYPES
// ============================================================================

export enum UoMErrorType {
  UNIT_DATA_FETCH_FAILED = 'unit_data_fetch_failed',
  CONVERSION_API_UNAVAILABLE = 'conversion_api_unavailable',
  INCOMPATIBLE_UNIT_CONVERSION = 'incompatible_unit_conversion',
  INVALID_UNIT_ID = 'invalid_unit_id',
  MISSING_UNIT_SELECTION = 'missing_unit_selection',
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_ERROR = 'unknown_error',
}

export interface UoMError {
  type: UoMErrorType;
  message: string;
  userMessage: string;
  suggestions: string[];
  retryable: boolean;
  context?: Record<string, any>;
}

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

export class UoMErrorHandler {
  private static instance: UoMErrorHandler;

  private constructor() {}

  public static getInstance(): UoMErrorHandler {
    if (!UoMErrorHandler.instance) {
      UoMErrorHandler.instance = new UoMErrorHandler();
    }
    return UoMErrorHandler.instance;
  }

  /**
   * Classify and enhance UoM-specific errors
   */
  public classifyError(error: any, context?: Record<string, any>): UoMError {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const statusCode = error?.response?.status;
    const responseData = error?.response?.data;

    // Network and connectivity errors
    if (this.isNetworkError(error)) {
      return {
        type: UoMErrorType.NETWORK_ERROR,
        message: errorMessage,
        userMessage: 'Unable to connect to the unit conversion service. Please check your internet connection.',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact support if the problem persists'
        ],
        retryable: true,
        context,
      };
    }

    // API unavailable errors
    if (statusCode === 503 || statusCode === 502 || errorMessage.includes('service unavailable')) {
      return {
        type: UoMErrorType.CONVERSION_API_UNAVAILABLE,
        message: errorMessage,
        userMessage: 'Unit conversion service is temporarily unavailable. Please try again in a few moments.',
        suggestions: [
          'Wait a few moments and try again',
          'Refresh the page',
          'Use manual calculations as a temporary workaround'
        ],
        retryable: true,
        context,
      };
    }

    // Unit data fetch failures
    if (errorMessage.includes('units') && (statusCode === 500 || errorMessage.includes('fetch failed'))) {
      return {
        type: UoMErrorType.UNIT_DATA_FETCH_FAILED,
        message: errorMessage,
        userMessage: 'Failed to load unit data. Some features may not work properly.',
        suggestions: [
          'Refresh the page to reload unit data',
          'Check your internet connection',
          'Try again in a few moments'
        ],
        retryable: true,
        context,
      };
    }

    // Incompatible unit conversion
    if (this.isIncompatibleConversionError(errorMessage, responseData)) {
      return {
        type: UoMErrorType.INCOMPATIBLE_UNIT_CONVERSION,
        message: errorMessage,
        userMessage: 'Cannot convert between units in different categories (e.g., weight to length).',
        suggestions: [
          'Select units from the same category',
          'Check that both units measure the same type of quantity',
          'Use the unit selector to find compatible units'
        ],
        retryable: false,
        context,
      };
    }

    // Invalid unit ID
    if (this.isInvalidUnitError(errorMessage, responseData, statusCode)) {
      return {
        type: UoMErrorType.INVALID_UNIT_ID,
        message: errorMessage,
        userMessage: 'The selected unit is not valid or no longer available.',
        suggestions: [
          'Select a different unit from the dropdown',
          'Refresh the page to reload unit data',
          'Contact support if the unit should be available'
        ],
        retryable: false,
        context,
      };
    }

    // Missing unit selection
    if (errorMessage.includes('required') && errorMessage.includes('unit')) {
      return {
        type: UoMErrorType.MISSING_UNIT_SELECTION,
        message: errorMessage,
        userMessage: 'Please select a unit before proceeding.',
        suggestions: [
          'Choose a unit from the dropdown menu',
          'Make sure all required unit fields are filled'
        ],
        retryable: false,
        context,
      };
    }

    // Check for "Unit is required" pattern specifically
    if (errorMessage.toLowerCase().includes('unit is required')) {
      return {
        type: UoMErrorType.MISSING_UNIT_SELECTION,
        message: errorMessage,
        userMessage: 'Please select a unit before proceeding.',
        suggestions: [
          'Choose a unit from the dropdown menu',
          'Make sure all required unit fields are filled'
        ],
        retryable: false,
        context,
      };
    }

    // Validation errors
    if (statusCode === 400 || errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return {
        type: UoMErrorType.VALIDATION_ERROR,
        message: errorMessage,
        userMessage: 'Please check your input and try again.',
        suggestions: [
          'Verify all fields are filled correctly',
          'Check that numeric values are positive',
          'Ensure units are selected from the dropdown'
        ],
        retryable: false,
        context,
      };
    }

    // Default unknown error
    return {
      type: UoMErrorType.UNKNOWN_ERROR,
      message: errorMessage,
      userMessage: 'An unexpected error occurred. Please try again or contact support.',
      suggestions: [
        'Try the operation again',
        'Refresh the page',
        'Contact support if the problem persists'
      ],
      retryable: true,
      context,
    };
  }

  /**
   * Execute UoM operation with specialized error handling
   */
  public async executeWithUoMErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: Record<string, any>
  ): Promise<T> {
    const errorContext: ErrorContext = {
      operation: operationName,
      timestamp: new Date(),
      ...context,
    };

    try {
      return await errorHandlingService.executeWithRetry(
        operation,
        errorContext,
        {
          maxRetries: 2, // Reduced retries for UoM operations
          baseDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 1.5,
          retryableErrors: [
            'Network Error',
            'fetch failed',
            'service unavailable',
            'timeout',
            'connection refused',
          ],
        }
      );
    } catch (error) {
      const uomError = this.classifyError(error, context);
      
      // Log the classified error
      console.error(`[UoM Error] ${operationName}:`, {
        type: uomError.type,
        message: uomError.message,
        userMessage: uomError.userMessage,
        context: uomError.context,
      });

      // Throw enhanced error with UoM-specific information
      const enhancedError = new Error(uomError.userMessage);
      (enhancedError as any).uomError = uomError;
      (enhancedError as any).originalError = error;
      
      throw enhancedError;
    }
  }

  /**
   * Get user-friendly error message for display
   */
  public getUserMessage(error: any): string {
    if (error?.uomError?.userMessage) {
      return error.uomError.userMessage;
    }

    const classified = this.classifyError(error);
    return classified.userMessage;
  }

  /**
   * Get error suggestions for user
   */
  public getErrorSuggestions(error: any): string[] {
    if (error?.uomError?.suggestions) {
      return error.uomError.suggestions;
    }

    const classified = this.classifyError(error);
    return classified.suggestions;
  }

  /**
   * Check if error is retryable
   */
  public isRetryable(error: any): boolean {
    if (error?.uomError?.retryable !== undefined) {
      return error.uomError.retryable;
    }

    const classified = this.classifyError(error);
    return classified.retryable;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private isNetworkError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return (
      message.includes('network error') ||
      message.includes('fetch failed') ||
      message.includes('connection refused') ||
      message.includes('timeout') ||
      error?.code === 'ERR_NETWORK' ||
      error?.code === 'ERR_INTERNET_DISCONNECTED'
    );
  }

  private isIncompatibleConversionError(message: string, responseData: any): boolean {
    const lowerMessage = message.toLowerCase();
    const detail = responseData?.detail?.toLowerCase() || '';
    
    return (
      lowerMessage.includes('incompatible') ||
      lowerMessage.includes('different categories') ||
      lowerMessage.includes('cannot convert') ||
      detail.includes('incompatible') ||
      detail.includes('different categories')
    );
  }

  private isInvalidUnitError(message: string, responseData: any, statusCode?: number): boolean {
    const lowerMessage = message.toLowerCase();
    const detail = responseData?.detail?.toLowerCase() || '';
    
    return (
      statusCode === 404 ||
      lowerMessage.includes('invalid unit') ||
      lowerMessage.includes('unit not found') ||
      lowerMessage.includes('unit_id') ||
      detail.includes('invalid unit') ||
      detail.includes('unit not found')
    );
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const uomErrorHandler = UoMErrorHandler.getInstance();

/**
 * Execute unit data fetch with error handling
 */
export async function executeUnitDataFetch<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return uomErrorHandler.executeWithUoMErrorHandling(
    operation,
    'fetch-unit-data',
    context
  );
}

/**
 * Execute unit conversion with error handling
 */
export async function executeUnitConversion<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return uomErrorHandler.executeWithUoMErrorHandling(
    operation,
    'unit-conversion',
    context
  );
}

/**
 * Execute unit validation with error handling
 */
export async function executeUnitValidation<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return uomErrorHandler.executeWithUoMErrorHandling(
    operation,
    'unit-validation',
    context
  );
}

/**
 * Handle form validation errors for unit fields
 */
export function validateUnitField(
  value: any,
  fieldName: string,
  required: boolean = true
): { isValid: boolean; error?: UoMError } {
  if (required && (!value || value === 0)) {
    return {
      isValid: false,
      error: {
        type: UoMErrorType.MISSING_UNIT_SELECTION,
        message: `${fieldName} is required`,
        userMessage: `Please select a ${fieldName.toLowerCase()}.`,
        suggestions: [
          `Choose a ${fieldName.toLowerCase()} from the dropdown menu`,
          'Make sure all required fields are filled'
        ],
        retryable: false,
      },
    };
  }

  if (value && (typeof value !== 'number' || value <= 0)) {
    return {
      isValid: false,
      error: {
        type: UoMErrorType.INVALID_UNIT_ID,
        message: `Invalid ${fieldName}`,
        userMessage: `The selected ${fieldName.toLowerCase()} is not valid.`,
        suggestions: [
          `Select a different ${fieldName.toLowerCase()} from the dropdown`,
          'Refresh the page to reload unit data'
        ],
        retryable: false,
      },
    };
  }

  return { isValid: true };
}

export default UoMErrorHandler;