"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { useDroppable } from "@dnd-kit/core";

// Import WorkflowCard component
import { WorkflowCard } from "./WorkflowCard";

// Types from WorkflowBoard (snake_case to match API)
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
  comments: CommentResponse[];
  attachments: AttachmentResponse[];
}

interface CommentResponse {
  id: number;
  card_id: number;
  comment_text: string;
  commented_by: string;
  created_at: string;
}

interface AttachmentResponse {
  id: number;
  card_id: number;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

interface StatusColumnProps {
  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked';
  cards: CardResponse[];
  onCardClick: (card: CardResponse) => void;
  onCardDrop: (cardId: number) => void;
}

export const StatusColumn: React.FC<StatusColumnProps> = ({
  status,
  cards,
  onCardClick,
  onCardDrop
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pending',
      ready: 'Ready',
      in_progress: 'In Progress',
      completed: 'Completed',
      blocked: 'Blocked'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      ready: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[500px] bg-muted/50 rounded-lg p-4 transition-colors ${
        isOver ? 'bg-primary/10 ring-2 ring-primary' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            {cards.length}
          </span>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {cards.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No cards in this status
          </div>
        ) : (
          cards.map((card) => (
            <WorkflowCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
              onDrop={() => onCardDrop(card.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
