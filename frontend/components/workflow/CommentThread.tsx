"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Clock,
  User
} from "lucide-react";

interface CommentResponse {
  id: number;
  card_id: number;
  comment_text: string;
  commented_by: string;
  created_at: string;
}

interface CommentThreadProps {
  cardId: number;
  comments: CommentResponse[];
  onAddComment?: (cardId: number, comment: string) => Promise<void>;
  currentUser?: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  cardId,
  comments,
  onAddComment,
  currentUser = "Current User"
}) => {
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !onAddComment) return;

    setIsAddingComment(true);
    try {
      await onAddComment(cardId, newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // Sort comments chronologically (most recent first)
  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Add Comment Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="newComment" className="text-sm font-medium">
            Add Comment
          </Label>
        </div>
        
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="text-xs">
              {getInitials(currentUser)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <Textarea
              id="newComment"
              placeholder="Write a comment... (Ctrl+Enter to send)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="resize-none"
            />
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {newComment.length}/1000 characters
              </p>
              
              <Button 
                onClick={handleAddComment} 
                size="sm" 
                disabled={!newComment.trim() || isAddingComment || newComment.length > 1000}
              >
                {isAddingComment ? (
                  <>
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {sortedComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No comments yet</p>
            <p className="text-xs text-muted-foreground">
              Be the first to add a comment to start the discussion
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {sortedComments.length} Comment{sortedComments.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {sortedComments.map((comment, index) => (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(comment.commented_by)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{comment.commented_by}</span>
                      
                      {comment.commented_by === currentUser && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span title={new Date(comment.created_at).toLocaleString()}>
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {comment.comment_text}
                    </p>
                  </div>
                  
                  {/* Thread connector line for visual continuity */}
                  {index < sortedComments.length - 1 && (
                    <div className="w-px h-4 bg-border ml-4 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Comment Guidelines */}
      {sortedComments.length === 0 && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p className="font-medium mb-1">💡 Comment Tips:</p>
          <ul className="space-y-1 ml-4">
            <li>• Use comments to discuss progress, ask questions, or share updates</li>
            <li>• Comments are displayed in chronological order</li>
            <li>• Use Ctrl+Enter to quickly send your comment</li>
          </ul>
        </div>
      )}
    </div>
  );
};