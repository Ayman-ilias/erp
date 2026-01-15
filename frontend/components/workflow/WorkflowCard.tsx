"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDraggable } from "@dnd-kit/core";
import { 
  User,
  Calendar,
  MessageCircle,
  Paperclip,
  AlertCircle,
  Clock,
  GripVertical
} from "lucide-react";

// Types from API (snake_case)
interface CardResponse {
  id: number;
  workflow_id: number;
  stage_name: string;
  stage_order: number;
  card_title: string;
  card_description?: string;
  assigned_to?: string;
  card_status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked';
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  blocked_reason?: string;
  comments?: any[];
  attachments?: any[];
}

interface WorkflowCardProps {
  card: CardResponse;
  onClick: () => void;
  onDrop: () => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  card,
  onClick,
  onDrop
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id.toString(),
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-500',
      ready: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-green-500',
      blocked: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card
        onClick={onClick}
        className="hover:shadow-md transition-all group"
      >
        <div className="p-3 space-y-2">
          {/* Drag Handle & Title */}
          <div className="flex items-start gap-2">
            <div
              {...listeners}
              {...attributes}
              className="cursor-grab active:cursor-grabbing mt-1 opacity-50 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{card.card_title}</h4>
              {card.card_description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {card.card_description}
                </p>
              )}
            </div>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(card.card_status)} flex-shrink-0 mt-1.5`} />
          </div>

          {/* Card Info */}
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            {/* Assigned User */}
            {card.assigned_to && (
              <div className="flex items-center gap-1">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(card.assigned_to)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[80px]">{card.assigned_to}</span>
              </div>
            )}

            {/* Due Date */}
            {card.due_date && (
              <div className={`flex items-center gap-1 ${isOverdue(card.due_date) ? 'text-red-600' : ''}`}>
                <Calendar className="w-3 h-3" />
                <span>{formatDate(card.due_date)}</span>
              </div>
            )}

            {/* Comments Count */}
            {card.comments && card.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{card.comments.length}</span>
              </div>
            )}

            {/* Attachments Count */}
            {card.attachments && card.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                <span>{card.attachments.length}</span>
              </div>
            )}

            {/* Blocked Indicator */}
            {card.card_status === 'blocked' && (
              <Badge variant="destructive" className="text-[10px] px-1 py-0">
                <AlertCircle className="w-3 h-3 mr-1" />
                Blocked
              </Badge>
            )}
          </div>

          {/* Stage Info */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
            <span>Stage {card.stage_order}: {card.stage_name}</span>
            {card.completed_at && (
              <div className="flex items-center gap-1 text-green-600">
                <Clock className="w-3 h-3" />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
