"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Play, 
  XCircle,
  ArrowRight
} from "lucide-react";

type CardStatus = 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked';

interface StatusUpdateInterfaceProps {
  currentStatus: CardStatus;
  onStatusUpdate: (status: CardStatus, reason?: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  cardTitle: string;
  assignedTo?: string;
}

export const StatusUpdateInterface: React.FC<StatusUpdateInterfaceProps> = ({
  currentStatus,
  onStatusUpdate,
  isOpen,
  onClose,
  cardTitle,
  assignedTo
}) => {
  const [selectedStatus, setSelectedStatus] = useState<CardStatus>(currentStatus);
  const [reason, setReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: CardStatus) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      ready: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status];
  };

  const getStatusIcon = (status: CardStatus) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      ready: <Play className="w-4 h-4" />,
      in_progress: <Play className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      blocked: <XCircle className="w-4 h-4" />
    };
    return icons[status];
  };

  const getStatusLabel = (status: CardStatus) => {
    const labels = {
      pending: 'Pending',
      ready: 'Ready',
      in_progress: 'In Progress',
      completed: 'Completed',
      blocked: 'Blocked'
    };
    return labels[status];
  };

  const getValidTransitions = (currentStatus: CardStatus): CardStatus[] => {
    const transitions: Record<CardStatus, CardStatus[]> = {
      pending: ['ready', 'blocked'],
      ready: ['in_progress', 'blocked'],
      in_progress: ['completed', 'blocked', 'ready'],
      completed: ['ready'], // Allow reopening if needed
      blocked: ['ready', 'in_progress']
    };
    return transitions[currentStatus] || [];
  };

  const getStatusDescription = (status: CardStatus) => {
    const descriptions = {
      pending: 'Task is waiting to be started',
      ready: 'Task is ready to begin work',
      in_progress: 'Task is currently being worked on',
      completed: 'Task has been finished successfully',
      blocked: 'Task is blocked and cannot proceed'
    };
    return descriptions[status];
  };

  const isValidTransition = (fromStatus: CardStatus, toStatus: CardStatus): boolean => {
    return getValidTransitions(fromStatus).includes(toStatus);
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }

    if (!isValidTransition(currentStatus, selectedStatus)) {
      return;
    }

    if (selectedStatus === 'blocked' && !reason.trim()) {
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusUpdate(selectedStatus, reason.trim() || undefined);
      onClose();
      setReason("");
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus(currentStatus);
    setReason("");
    onClose();
  };

  const validTransitions = getValidTransitions(currentStatus);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Card Status</DialogTitle>
          <DialogDescription>
            Change the status of "{cardTitle}"
            {assignedTo && ` (assigned to ${assignedTo})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge className={getStatusColor(currentStatus)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(currentStatus)}
                  {getStatusLabel(currentStatus)}
                </div>
              </Badge>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status-select">New Status</Label>
            <Select 
              value={selectedStatus} 
              onValueChange={(value: CardStatus) => setSelectedStatus(value)}
            >
              <SelectTrigger id="status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* Current status (disabled) */}
                <SelectItem value={currentStatus} disabled>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentStatus)}
                    {getStatusLabel(currentStatus)} (Current)
                  </div>
                </SelectItem>
                
                {/* Valid transitions */}
                {validTransitions.map(status => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      {getStatusLabel(status)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedStatus !== currentStatus && (
              <p className="text-xs text-muted-foreground">
                {getStatusDescription(selectedStatus)}
              </p>
            )}
          </div>

          {/* Status Transition Preview */}
          {selectedStatus !== currentStatus && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Badge variant="outline" className={getStatusColor(currentStatus)}>
                {getStatusLabel(currentStatus)}
              </Badge>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Badge variant="outline" className={getStatusColor(selectedStatus)}>
                {getStatusLabel(selectedStatus)}
              </Badge>
            </div>
          )}

          {/* Reason Input for Blocking */}
          {selectedStatus === 'blocked' && (
            <div className="space-y-2">
              <Label htmlFor="block-reason" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Reason for Blocking (Required)
              </Label>
              <Textarea
                id="block-reason"
                placeholder="Explain why this task is blocked..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
              {reason.trim() && (
                <p className="text-xs text-muted-foreground">
                  {reason.length}/500 characters
                </p>
              )}
            </div>
          )}

          {/* Optional Reason for Other Status Changes */}
          {selectedStatus !== 'blocked' && selectedStatus !== currentStatus && (
            <div className="space-y-2">
              <Label htmlFor="update-reason">Additional Notes (Optional)</Label>
              <Textarea
                id="update-reason"
                placeholder="Add any notes about this status change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          )}

          {/* Validation Messages */}
          {selectedStatus === 'blocked' && !reason.trim() && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              A reason is required when blocking a task
            </div>
          )}

          {selectedStatus !== currentStatus && !isValidTransition(currentStatus, selectedStatus) && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              This status transition is not allowed
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            disabled={
              selectedStatus === currentStatus || 
              (selectedStatus === 'blocked' && !reason.trim()) ||
              !isValidTransition(currentStatus, selectedStatus) ||
              isUpdating
            }
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};