"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusColumn } from "./StatusColumn";
import { WorkflowCard } from "./WorkflowCard";
import { Calendar, User, AlertCircle } from "lucide-react";

// Types matching API response (snake_case)
interface WorkflowResponse {
  id: number;
  sample_request_id: number;
  workflow_name: string;
  workflow_status: 'active' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  priority: string;
  due_date?: string;
  cards: CardResponse[];
  sample_request?: {
    sample_id: string;
    sample_name: string;
    buyer_name: string;
  };
}

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

interface WorkflowLaneProps {
  workflow: WorkflowResponse;
  onCardClick: (card: CardResponse) => void;
  onCardUpdate: (cardId: number, updates: Partial<CardResponse>) => void;
}

export const WorkflowLane: React.FC<WorkflowLaneProps> = ({
  workflow,
  onCardClick,
  onCardUpdate
}) => {
  const statusColumns = ['pending', 'ready', 'in_progress', 'completed', 'blocked'] as const;
  
  const getStatusColor = (status: string) => {
    const colors = {
      active: 'success',
      completed: 'info',
      cancelled: 'destructive'
    } as const;
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'destructive',
      medium: 'warning',
      low: 'success'
    } as const;
    return colors[priority as keyof typeof colors] || 'secondary';
  };

  const getWorkflowProgress = () => {
    const totalCards = workflow.cards.length;
    const completedCards = workflow.cards.filter(card => card.card_status === 'completed').length;
    return totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
  };

  const hasBlockedCards = workflow.cards.some(card => card.card_status === 'blocked');

  return (
    <Card className="workflow-lane">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{workflow.workflow_name}</CardTitle>
              <Badge variant={getStatusColor(workflow.workflow_status)}>
                {workflow.workflow_status}
              </Badge>
              <Badge variant={getPriorityColor(workflow.priority)}>
                {workflow.priority} priority
              </Badge>
              {hasBlockedCards && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Blocked
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {workflow.sample_request && (
                <>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {workflow.sample_request.buyer_name}
                  </div>
                  <div>Sample: {workflow.sample_request.sample_id}</div>
                </>
              )}
              {workflow.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Due: {new Date(workflow.due_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium">{getWorkflowProgress()}% Complete</div>
            <div className="text-xs text-muted-foreground">
              {workflow.cards.filter(c => c.card_status === 'completed').length} of {workflow.cards.length} stages
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="status-columns grid grid-cols-5 gap-4">
          {statusColumns.map(status => (
            <StatusColumn
              key={status}
              status={status}
              cards={workflow.cards.filter(card => card.card_status === status)}
              onCardClick={onCardClick}
              onCardDrop={(cardId) => onCardUpdate(cardId, { card_status: status })}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};