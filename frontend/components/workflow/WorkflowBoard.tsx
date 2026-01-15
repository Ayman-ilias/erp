"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { workflowService } from "@/services/api";
import { WorkflowLane } from "./WorkflowLane";
import { CreateWorkflowModal } from "./CreateWorkflowModal";
import { CardDetailModal } from "./CardDetailModal";
import { Plus, Filter, Search } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";

// Types matching the actual API response (snake_case)
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

interface CreateWorkflowRequest {
  sample_request_id: number;
  workflow_name: string;
  assigned_designer?: string;
  assigned_programmer?: string;
  assigned_supervisor_knitting?: string;
  assigned_supervisor_finishing?: string;
  required_knitting_machine_id?: number;
  delivery_plan_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface WorkflowBoardProps {
  className?: string;
  workflowId?: number; // Optional workflow ID to filter by specific workflow
}

export const WorkflowBoard: React.FC<WorkflowBoardProps> = ({ className, workflowId }) => {
  const [workflows, setWorkflows] = useState<WorkflowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardResponse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    assignee: '',
    priority: '',
    search: ''
  });

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadWorkflows();
  }, [filters, workflowId]);

  // Helper function to normalize API response (convert empty strings to empty arrays)
  const normalizeWorkflowData = (workflows: any[]): WorkflowResponse[] => {
    return workflows.map((workflow) => ({
      ...workflow,
      cards: (workflow.cards || []).map((card: any) => ({
        ...card,
        comments: Array.isArray(card.comments) ? card.comments : [],
        attachments: Array.isArray(card.attachments) ? card.attachments : []
      }))
    }));
  };

  const loadWorkflows = async () => {
    try {
      setLoading(true);

      // If workflowId is provided, load only that workflow
      if (workflowId) {
        const data = await workflowService.getWorkflow(workflowId);
        setWorkflows(normalizeWorkflowData([data]));
      } else {
        // Otherwise, load all workflows with filters
        const filterParams = Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        const data = await workflowService.getWorkflows(filterParams);
        setWorkflows(normalizeWorkflowData(data));
      }
    } catch (error) {
      toast.error("Failed to load workflows");
      console.error("Error loading workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardUpdate = async (cardId: number, updates: Partial<CardResponse>) => {
    try {
      if (updates.card_status) {
        await workflowService.updateCardStatus(cardId, updates.card_status, updates.blocked_reason);
      }
      if (updates.assigned_to) {
        await workflowService.updateCardAssignee(cardId, updates.assigned_to);
      }
      
      // Reload workflows to get updated data
      await loadWorkflows();
      toast.success("Card updated successfully");
    } catch (error) {
      toast.error("Failed to update card");
      console.error("Error updating card:", error);
    }
  };

  const handleWorkflowCreate = async (data: CreateWorkflowRequest) => {
    try {
      await workflowService.createWorkflow(data);
      await loadWorkflows();
      setIsCreateModalOpen(false);
      toast.success("Workflow created successfully");
    } catch (error) {
      toast.error("Failed to create workflow");
      console.error("Error creating workflow:", error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const cardId = parseInt(active.id as string);
    const newStatus = over.id as string;

    // Validate status transition
    const validStatuses = ['pending', 'ready', 'in_progress', 'completed', 'blocked'];
    if (!validStatuses.includes(newStatus)) return;

    // Find the card being moved
    const card = workflows
      .flatMap(w => w.cards)
      .find(c => c.id === cardId);

    if (!card) return;

    // Check if status actually changed
    if (card.card_status === newStatus) return;

    // Validate allowed transitions
    const allowedTransitions: Record<string, string[]> = {
      pending: ['ready', 'blocked'],
      ready: ['in_progress', 'blocked'],
      in_progress: ['completed', 'blocked'],
      completed: [],
      blocked: ['ready', 'in_progress']
    };

    const currentStatus = card.card_status;
    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      toast.error(`Cannot move from ${currentStatus} to ${newStatus}`);
      return;
    }

    // Update card status
    handleCardUpdate(cardId, { card_status: newStatus as any });
  };

  const getWorkflowStats = () => {
    const stats = {
      total: workflows.length,
      active: workflows.filter(w => w.workflow_status === 'active').length,
      completed: workflows.filter(w => w.workflow_status === 'completed').length,
      blocked: workflows.filter(w => 
        w.cards.some(card => card.card_status === 'blocked')
      ).length
    };
    return stats;
  };

  const stats = getWorkflowStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`space-y-6 ${className || ''}`}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sample Workflows</h1>
            <p className="text-muted-foreground">
              Manage sample development workflows with ClickUp-style cards
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Workflows</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Active</div>
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Blocked</div>
              <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search workflows..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={filters.priority || "all"} onValueChange={(value) => setFilters({ ...filters, priority: value === "all" ? "" : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  placeholder="Filter by assignee..."
                  value={filters.assignee}
                  onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Board */}
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <div className="text-lg font-medium mb-2">No workflows found</div>
                  <div className="text-sm">Create your first workflow to get started</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            workflows.map(workflow => (
              <WorkflowLane
                key={workflow.id}
                workflow={workflow}
                onCardClick={setSelectedCard}
                onCardUpdate={handleCardUpdate}
              />
            ))
          )}
        </div>

        {/* Modals */}
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            onUpdate={handleCardUpdate}
          />
        )}
        
        <CreateWorkflowModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleWorkflowCreate}
        />
      </div>
    </DndContext>
  );
};