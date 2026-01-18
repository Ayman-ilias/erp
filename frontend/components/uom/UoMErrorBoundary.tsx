/**
 * UoM Error Boundary Component
 * 
 * React Error Boundary specifically for Unit of Measure components.
 * Catches JavaScript errors in UoM components and displays fallback UI.
 * Provides recovery options and error reporting.
 * 
 * **Validates: Requirements 13.4, 13.5**
 */

"use client";

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

export class UoMErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('UoM Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={cn("p-6 border border-destructive/20 rounded-lg bg-destructive/5", this.props.className)}>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">
                Unit System Error
              </h3>
              <p className="text-sm text-muted-foreground">
                Something went wrong with the unit conversion system
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Error details */}
            <div className="p-3 bg-muted rounded-md">
              <div className="text-sm font-medium mb-1">Error Details:</div>
              <div className="text-sm text-muted-foreground font-mono">
                {this.state.error?.message || 'Unknown error occurred'}
              </div>
              {this.state.retryCount > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Retry attempts: {this.state.retryCount}
                </div>
              )}
            </div>

            {/* Recovery actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>

              <Button
                onClick={this.handleReload}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            {/* Help text */}
            <div className="text-xs text-muted-foreground border-t pt-3">
              <p className="mb-2">
                <strong>What you can do:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Try refreshing the page</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  <Bug className="inline h-3 w-3 mr-1" />
                  Developer Details (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-muted rounded font-mono text-xs overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error?.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// FUNCTIONAL ERROR BOUNDARY WRAPPER
// ============================================================================

interface UoMErrorWrapperProps {
  children: ReactNode;
  fallbackMessage?: string;
  className?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Functional wrapper for UoM Error Boundary
 * Provides a simpler interface for wrapping UoM components
 */
export function UoMErrorWrapper({
  children,
  fallbackMessage = "Unit system temporarily unavailable",
  className,
  onError,
}: UoMErrorWrapperProps) {
  const fallback = (
    <div className={cn("p-4 border border-destructive/20 rounded bg-destructive/5", className)}>
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">{fallbackMessage}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Please refresh the page or try again later.
      </div>
    </div>
  );

  return (
    <UoMErrorBoundary
      fallback={fallback}
      className={className}
      onError={onError}
    >
      {children}
    </UoMErrorBoundary>
  );
}

export default UoMErrorBoundary;