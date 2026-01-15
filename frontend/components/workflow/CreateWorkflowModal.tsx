"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkflowRequest) => Promise<void>;
}

export const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateWorkflowRequest>({
    sample_request_id: 0,
    workflow_name: '',
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      sample_request_id: 0,
      workflow_name: '',
      priority: 'medium'
    });
  };

  const handleClose = () => {
    setFormData({
      sample_request_id: 0,
      workflow_name: '',
      priority: 'medium'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Create a new sample development workflow with predefined stages.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sample_request_id">Sample Request ID *</Label>
              <Input
                id="sample_request_id"
                type="number"
                required
                value={formData.sample_request_id || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  sample_request_id: parseInt(e.target.value) || 0 
                })}
                placeholder="Enter sample request ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow_name">Workflow Name *</Label>
            <Input
              id="workflow_name"
              required
              value={formData.workflow_name}
              onChange={(e) => setFormData({ ...formData, workflow_name: e.target.value })}
              placeholder="Enter workflow name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedDesigner">Assigned Designer</Label>
              <Input
                id="assignedDesigner"
                value={formData.assigned_designer || ''}
                onChange={(e) => setFormData({ ...formData, assigned_designer: e.target.value })}
                placeholder="Designer name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedProgrammer">Assigned Programmer</Label>
              <Input
                id="assignedProgrammer"
                value={formData.assigned_programmer || ''}
                onChange={(e) => setFormData({ ...formData, assigned_programmer: e.target.value })}
                placeholder="Programmer name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedSupervisorKnitting">Knitting Supervisor</Label>
              <Input
                id="assignedSupervisorKnitting"
                value={formData.assigned_supervisor_knitting || ''}
                onChange={(e) => setFormData({ ...formData, assigned_supervisor_knitting: e.target.value })}
                placeholder="Knitting supervisor name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedSupervisorFinishing">Finishing Supervisor</Label>
              <Input
                id="assignedSupervisorFinishing"
                value={formData.assigned_supervisor_finishing || ''}
                onChange={(e) => setFormData({ ...formData, assigned_supervisor_finishing: e.target.value })}
                placeholder="Finishing supervisor name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="required_knitting_machine_id">Knitting Machine ID</Label>
              <Input
                id="required_knitting_machine_id"
                type="number"
                value={formData.required_knitting_machine_id || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  required_knitting_machine_id: parseInt(e.target.value) || undefined 
                })}
                placeholder="Machine ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delivery_plan_date">Delivery Plan Date</Label>
              <Input
                id="delivery_plan_date"
                type="date"
                value={formData.delivery_plan_date || ''}
                onChange={(e) => setFormData({ ...formData, delivery_plan_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Workflow</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};