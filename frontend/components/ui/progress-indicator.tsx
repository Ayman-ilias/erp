/**
 * Progress Indicator Component
 * Provides progress tracking and cancellation for bulk operations
 * Requirements: 7.5
 */

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BulkOperationProgress {
  id: string
  total: number
  completed: number
  failed: number
  status: 'pending' | 'running' | 'completed' | 'cancelled' | 'failed'
  startTime: Date
  endTime?: Date
  errors: Array<{ index: number; error: string }>
  operationName: string
}

export interface ProgressIndicatorProps {
  progress: BulkOperationProgress
  onCancel?: () => void
  onClose?: () => void
  showDetails?: boolean
  className?: string
}

export function ProgressIndicator({
  progress,
  onCancel,
  onClose,
  showDetails = true,
  className
}: ProgressIndicatorProps) {
  const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0
  const isRunning = progress.status === 'running'
  const isCompleted = progress.status === 'completed'
  const isCancelled = progress.status === 'cancelled'
  const hasFailed = progress.status === 'failed' || progress.failed > 0

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-orange-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (progress.status) {
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      case 'cancelled':
        return 'Cancelled'
      case 'running':
        return 'In Progress'
      default:
        return 'Pending'
    }
  }

  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDuration = () => {
    const start = progress.startTime
    const end = progress.endTime || new Date()
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000)
    
    if (duration < 60) {
      return `${duration}s`
    } else if (duration < 3600) {
      return `${Math.floor(duration / 60)}m ${duration % 60}s`
    } else {
      return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-base">{progress.operationName}</CardTitle>
            <Badge variant="outline" className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {isRunning && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            )}
            {(isCompleted || isCancelled || hasFailed) && onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {progress.completed} of {progress.total} operations completed
          {progress.failed > 0 && ` • ${progress.failed} failed`}
          {showDetails && ` • ${formatDuration()}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className={cn(
                "h-2",
                hasFailed && "bg-red-100",
                isCancelled && "bg-orange-100"
              )}
            />
          </div>

          {showDetails && (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">{progress.completed}</div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{progress.failed}</div>
                <div className="text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">
                  {progress.total - progress.completed - progress.failed}
                </div>
                <div className="text-muted-foreground">Remaining</div>
              </div>
            </div>
          )}

          {progress.errors.length > 0 && showDetails && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-red-600">Errors:</div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {progress.errors.slice(0, 3).map((error, index) => (
                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    Operation {error.index + 1}: {error.error}
                  </div>
                ))}
                {progress.errors.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    ... and {progress.errors.length - 3} more errors
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export interface BulkOperationManagerProps {
  operations: BulkOperationProgress[]
  onCancelOperation?: (operationId: string) => void
  onCloseOperation?: (operationId: string) => void
  className?: string
}

export function BulkOperationManager({
  operations,
  onCancelOperation,
  onCloseOperation,
  className
}: BulkOperationManagerProps) {
  if (operations.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Bulk Operations</h3>
        <Badge variant="outline">
          {operations.filter(op => op.status === 'running').length} active
        </Badge>
      </div>
      <div className="space-y-3">
        {operations.map((operation) => (
          <ProgressIndicator
            key={operation.id}
            progress={operation}
            onCancel={onCancelOperation ? () => onCancelOperation(operation.id) : undefined}
            onClose={onCloseOperation ? () => onCloseOperation(operation.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}