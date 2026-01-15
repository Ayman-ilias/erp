"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentThread } from "./CommentThread";
import { AttachmentManager } from "./AttachmentManager";
import { 
  Calendar, 
  User, 
  MessageCircle, 
  Paperclip, 
  Clock,
  AlertCircle,
  Edit3,
  Save,
  X,
  Download,
  Upload,
  History
} from "lucide-react";

// Types matching API response (snake_case)
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

interface CardStatusHistoryResponse {
  id: number;
  cardId: number;
  previousStatus?: string;
  newStatus: string;
  updatedBy: string;
  updateReason?: string;
  createdAt: string;
}

interface CardDetailModalProps {
  card: CardResponse;
  onClose: () => void;
  onUpdate: (cardId: number, updates: Partial<CardResponse>) => void;
  onAddComment?: (cardId: number, comment: string) => Promise<void>;
  onUploadAttachment?: (cardId: number, file: File) => Promise<void>;
  onDownloadAttachment?: (attachment: AttachmentResponse) => void;
  statusHistory?: CardStatusHistoryResponse[];
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  onClose,
  onUpdate,
  onAddComment,
  onUploadAttachment,
  onDownloadAttachment,
  statusHistory = []
}) => {
  const { user } = useAuth();
  const currentUser = user?.username || user?.full_name || "Unknown User";
  
  const [activeTab, setActiveTab] = useState("details");
  const [newComment, setNewComment] = useState("");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedCard, setEditedCard] = useState({
    cardTitle: card.card_title,
    cardDescription: card.card_description || "",
    dueDate: card.due_date || ""
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: card.card_status,
    reason: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'secondary',
      ready: 'info',
      in_progress: 'warning',
      completed: 'success',
      blocked: 'destructive'
    } as const;
    return colors[status as keyof typeof colors] || 'secondary';
  };

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatusUpdate = async () => {
    try {
      await onUpdate(card.id, { 
        card_status: statusUpdate.status as any,
        blocked_reason: statusUpdate.status === 'blocked' ? statusUpdate.reason : undefined
      });
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleSaveDetails = async () => {
    try {
      await onUpdate(card.id, {
        card_title: editedCard.cardTitle,
        card_description: editedCard.cardDescription,
        due_date: editedCard.dueDate || undefined
      });
      setIsEditingDetails(false);
    } catch (error) {
      console.error("Failed to update card details:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditedCard({
      cardTitle: card.card_title,
      cardDescription: card.card_description || "",
      dueDate: card.due_date || ""
    });
    setIsEditingDetails(false);
  };

  const handleAddComment = async () => {
    if (newComment.trim() && onAddComment) {
      setIsAddingComment(true);
      try {
        await onAddComment(card.id, newComment.trim());
        setNewComment("");
      } catch (error) {
        console.error("Failed to add comment:", error);
      } finally {
        setIsAddingComment(false);
      }
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile && onUploadAttachment) {
      setIsUploading(true);
      try {
        await onUploadAttachment(card.id, selectedFile);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } catch (error) {
        console.error("Failed to upload file:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDownload = (attachment: AttachmentResponse) => {
    if (onDownloadAttachment) {
      onDownloadAttachment(attachment);
    } else {
      // Fallback: open in new tab
      window.open(attachment.file_url, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{card.card_title}</DialogTitle>
              <DialogDescription>
                Stage {card.stage_order}: {card.stage_name}
              </DialogDescription>
            </div>
            <Badge variant={getStatusColor(card.card_status)}>
              {getStatusLabel(card.card_status)}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">
              Comments ({card.comments.length})
            </TabsTrigger>
            <TabsTrigger value="attachments">
              Files ({card.attachments.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({statusHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Card Information Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Card Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => isEditingDetails ? handleCancelEdit() : setIsEditingDetails(true)}
              >
                {isEditingDetails ? (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </>
                )}
              </Button>
            </div>

            {/* Editable Card Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardTitle">Card Title</Label>
                {isEditingDetails ? (
                  <Input
                    id="cardTitle"
                    value={editedCard.cardTitle}
                    onChange={(e) => setEditedCard({ ...editedCard, cardTitle: e.target.value })}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{card.card_title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardDescription">Description</Label>
                {isEditingDetails ? (
                  <Textarea
                    id="cardDescription"
                    value={editedCard.cardDescription}
                    onChange={(e) => setEditedCard({ ...editedCard, cardDescription: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded min-h-[60px]">
                    {card.card_description || "No description provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                {isEditingDetails ? (
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={editedCard.dueDate ? new Date(editedCard.dueDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditedCard({ ...editedCard, dueDate: e.target.value })}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">
                    {card.due_date ? new Date(card.due_date).toLocaleString() : "No due date set"}
                  </p>
                )}
              </div>

              {isEditingDetails && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveDetails} size="sm">
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} size="sm">
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Card Information */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Assigned To:</span>
                  {card.assigned_to ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(card.assigned_to)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{card.assigned_to}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-sm">
                    {new Date(card.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Last Updated:</span>
                  <span className="text-sm">
                    {new Date(card.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {card.card_status === 'blocked' && card.blocked_reason && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium text-red-600">Blocked Reason:</span>
                      <p className="text-sm text-red-600 mt-1">{card.blocked_reason}</p>
                    </div>
                  </div>
                )}

                {card.completed_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Completed:</span>
                    <span className="text-sm">
                      {new Date(card.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Stage:</span>
                  <span className="text-sm">
                    {card.stage_order}. {card.stage_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">Update Status</Label>
              <div className="grid grid-cols-2 gap-3">
                <Select 
                  value={statusUpdate.status} 
                  onValueChange={(value: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked') => 
                    setStatusUpdate({ ...statusUpdate, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                
                {statusUpdate.status === 'blocked' && (
                  <Input
                    placeholder="Reason for blocking..."
                    value={statusUpdate.reason}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, reason: e.target.value })}
                  />
                )}
              </div>
              
              {statusUpdate.status !== card.card_status && (
                <Button onClick={handleStatusUpdate} size="sm">
                  Update Status
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <CommentThread
              cardId={card.id}
              comments={card.comments}
              onAddComment={onAddComment}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <AttachmentManager
              cardId={card.id}
              attachments={card.attachments}
              onUploadAttachment={onUploadAttachment}
              onDownloadAttachment={onDownloadAttachment}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              {statusHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No status history available</p>
                  <p className="text-xs text-muted-foreground">Status changes will appear here</p>
                </div>
              ) : (
                statusHistory
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(history => (
                    <div key={history.id} className="flex gap-3 p-3 bg-muted rounded-md">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <History className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{history.updatedBy}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(history.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          Changed status from{' '}
                          {history.previousStatus && (
                            <Badge variant="outline" className="mx-1">
                              {getStatusLabel(history.previousStatus)}
                            </Badge>
                          )}
                          {!history.previousStatus && <span className="mx-1 text-muted-foreground">initial</span>}
                          to{' '}
                          <Badge variant="outline" className="mx-1">
                            {getStatusLabel(history.newStatus)}
                          </Badge>
                        </div>
                        {history.updateReason && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Reason: {history.updateReason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};