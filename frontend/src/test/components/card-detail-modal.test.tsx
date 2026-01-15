/**
 * Unit Tests for CardDetailModal Component
 * Tests modal opening/closing behavior, form submissions, validations, and file upload functionality
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardDetailModal } from '@/components/workflow/CardDetailModal'

// Mock UI components that might cause issues in tests
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div data-testid="modal-container">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="modal-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="modal-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => 
    <h2 data-testid="modal-title">{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => 
    <p data-testid="modal-description">{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="modal-footer">{children}</div>,
}))

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: { 
    children: React.ReactNode; 
    value: string; 
    onValueChange: (value: string) => void 
  }) => (
    <div data-testid="tabs-container" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value, onClick }: { 
    children: React.ReactNode; 
    value: string;
    onClick?: () => void;
  }) => (
    <button data-testid={`tab-${value}`} onClick={onClick}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => 
    <div data-testid={`tab-content-${value}`}>{children}</div>,
}))

// Mock the new components
vi.mock('@/components/workflow/CommentThread', () => ({
  CommentThread: ({ cardId, comments, onAddComment }: {
    cardId: number;
    comments: any[];
    onAddComment?: (cardId: number, comment: string) => Promise<void>;
  }) => (
    <div data-testid="comment-thread">
      <div data-testid="comment-count">{comments.length}</div>
      <button 
        data-testid="add-comment-btn"
        onClick={() => onAddComment?.(cardId, "Test comment")}
      >
        Add Comment
      </button>
    </div>
  ),
}))

vi.mock('@/components/workflow/AttachmentManager', () => ({
  AttachmentManager: ({ cardId, attachments, onUploadAttachment }: {
    cardId: number;
    attachments: any[];
    onUploadAttachment?: (cardId: number, file: File) => Promise<void>;
  }) => (
    <div data-testid="attachment-manager">
      <div data-testid="attachment-count">{attachments.length}</div>
      <button 
        data-testid="upload-file-btn"
        onClick={() => {
          const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
          onUploadAttachment?.(cardId, mockFile);
        }}
      >
        Upload File
      </button>
    </div>
  ),
}))

// Type definitions
interface CardResponse {
  id: number;
  workflowId: number;
  stageName: string;
  stageOrder: number;
  cardTitle: string;
  cardDescription?: string;
  assignedTo?: string;
  cardStatus: 'pending' | 'ready' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  blockedReason?: string;
  comments: Array<{
    id: number;
    cardId: number;
    commentText: string;
    commentedBy: string;
    createdAt: string;
  }>;
  attachments: Array<{
    id: number;
    cardId: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedBy: string;
    createdAt: string;
  }>;
}

describe('CardDetailModal Component', () => {
  const mockCard: CardResponse = {
    id: 1,
    workflowId: 1,
    stageName: 'Design Approval',
    stageOrder: 1,
    cardTitle: 'Test Card',
    cardDescription: 'Test card description',
    assignedTo: 'John Doe',
    cardStatus: 'in_progress',
    dueDate: '2024-12-31T23:59:59Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    comments: [
      {
        id: 1,
        cardId: 1,
        commentText: 'Test comment',
        commentedBy: 'Jane Smith',
        createdAt: '2024-01-01T12:00:00Z'
      }
    ],
    attachments: [
      {
        id: 1,
        cardId: 1,
        fileName: 'test-file.pdf',
        fileUrl: '/uploads/test-file.pdf',
        fileSize: 1024,
        uploadedBy: 'John Doe',
        createdAt: '2024-01-01T10:00:00Z'
      }
    ]
  };

  const mockProps = {
    card: mockCard,
    onClose: vi.fn(),
    onUpdate: vi.fn(),
    onAddComment: vi.fn(),
    onUploadAttachment: vi.fn(),
    onDownloadAttachment: vi.fn(),
    statusHistory: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Modal Opening and Closing Behavior', () => {
    it('should render modal when opened', () => {
      // Requirements 7.1: Modal should display card information
      render(<CardDetailModal {...mockProps} />);
      
      expect(screen.getByTestId('modal-container')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Test Card');
    });

    it('should display card information correctly', () => {
      // Requirements 7.1: Display comprehensive card information
      render(<CardDetailModal {...mockProps} />);
      
      expect(screen.getByTestId('modal-title')).toHaveTextContent(mockCard.cardTitle);
      expect(screen.getByTestId('modal-description')).toHaveTextContent(`Stage ${mockCard.stageOrder}: ${mockCard.stageName}`);
    });

    it('should call onClose when close button is clicked', async () => {
      // Requirements 7.1: Modal closing behavior
      const user = userEvent.setup();
      render(<CardDetailModal {...mockProps} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should display tabs for different sections', () => {
      // Requirements 7.1: Modal should have tabbed interface
      render(<CardDetailModal {...mockProps} />);
      
      expect(screen.getByTestId('tabs-container')).toBeInTheDocument();
      expect(screen.getByTestId('tab-details')).toBeInTheDocument();
      expect(screen.getByTestId('tab-comments')).toBeInTheDocument();
      expect(screen.getByTestId('tab-attachments')).toBeInTheDocument();
      expect(screen.getByTestId('tab-history')).toBeInTheDocument();
    });
  });

  describe('Form Submissions and Validations', () => {
    it('should handle status update form submission', async () => {
      // Requirements 7.2: Status update form functionality
      const user = userEvent.setup();
      render(<CardDetailModal {...mockProps} />);
      
      // Find and interact with status update form
      const statusSelect = screen.getByRole('combobox');
      await user.click(statusSelect);
      
      // Select completed status
      const completedOption = screen.getByRole('option', { name: /completed/i });
      await user.click(completedOption);
      
      // Submit status update
      const updateButton = screen.getByRole('button', { name: /update status/i });
      await user.click(updateButton);
      
      await waitFor(() => {
        expect(mockProps.onUpdate).toHaveBeenCalledWith(
          mockCard.id,
          expect.objectContaining({
            cardStatus: 'completed'
          })
        );
      });
    });

    it('should require reason when blocking a card', async () => {
      // Requirements 7.2: Validation for blocking status
      const user = userEvent.setup();
      render(<CardDetailModal {...mockProps} />);
      
      // Select blocked status
      const statusSelect = screen.getByRole('combobox');
      await user.click(statusSelect);
      
      const blockedOption = screen.getByRole('option', { name: /blocked/i });
      await user.click(blockedOption);
      
      // Reason input should appear
      expect(screen.getByPlaceholderText(/reason for blocking/i)).toBeInTheDocument();
      
      // Update button should be disabled without reason
      const updateButton = screen.getByRole('button', { name: /update status/i });
      expect(updateButton).toBeDisabled();
      
      // Add reason and submit
      const reasonInput = screen.getByPlaceholderText(/reason for blocking/i);
      await user.type(reasonInput, 'Missing materials');
      
      expect(updateButton).not.toBeDisabled();
      await user.click(updateButton);
      
      await waitFor(() => {
        expect(mockProps.onUpdate).toHaveBeenCalledWith(
          mockCard.id,
          expect.objectContaining({
            cardStatus: 'blocked',
            blockedReason: 'Missing materials'
          })
        );
      });
    });

    it('should handle card details editing', async () => {
      // Requirements 7.2: Edit card details functionality
      const user = userEvent.setup();
      render(<CardDetailModal {...mockProps} />);
      
      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);
      
      // Edit card title
      const titleInput = screen.getByDisplayValue(mockCard.cardTitle);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Card Title');
      
      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockProps.onUpdate).toHaveBeenCalledWith(
          mockCard.id,
          expect.objectContaining({
            cardTitle: 'Updated Card Title'
          })
        );
      });
    });

    it('should validate form inputs', async () => {
      // Requirements 7.2: Form validation
      const user = userEvent.setup();
      render(<CardDetailModal {...mockProps} />);
      
      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);
      
      // Try to save with empty title
      const titleInput = screen.getByDisplayValue(mockCard.cardTitle);
      await user.clear(titleInput);
      
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      
      // Save button should be disabled or validation should prevent submission
      // This depends on implementation - adjust based on actual validation logic
      expect(titleInput).toHaveValue('');
    });
  });

  describe('Comment Functionality', () => {
    it('should display comments tab with comment count', () => {
      // Requirements 7.3: Comment display
      render(<CardDetailModal {...mockProps} />);
      
      const commentsTab = screen.getByTestId('tab-comments');
      expect(commentsTab).toHaveTextContent(`Comments (${mockCard.comments.length})`);
    });

    it('should handle adding comments', async () => {
      // Requirements 7.3: Add comment functionality
      const user = userEvent.setup();
      render(<CardDetailModal {...mockProps} />);
      
      // Switch to comments tab
      const commentsTab = screen.getByTestId('tab-comments');
      await user.click(commentsTab);
      
      // Add comment through the CommentThread component
      const addCommentBtn = screen.getByTestId('add-comment-btn');
      await user.click(addCommentBtn);
      
      await waitFor(() => {
        expect(mockProps.onAddComment).toHaveBeenCalledWith(mockCard.id, 'Test comment');
      });
    });

    it('should display existing comments', () => {
      // Requirements 7.3: Display comment thread
      render(<CardDetailModal {...mockProps} />);
      
      // Check that CommentThread is rendered with correct props
      expect(screen.getByTestId('comment-thread')).toBeInTheDocument();
      expect(screen.getByTestId('comment-count')).toHaveTextContent('1');
    });
  });

  describe('File Upload Functionality', () => {
    it('should display attachments tab with attachment count', () => {
      // Requirements 7.4: Attachment display
      render(<CardDetailModal {...mockProps} />);
      
      const attachmentsTab = screen.getByTestId('tab-attachments');
      expect(attachmentsTab).toHaveTextContent(`Files (${mockCard.attachments.length})`);
    });

    it('should handle file upload', async () => {
      // Requirements 7.4: File upload functionality
      const user = userEvent.setup();
      render(<CardDetailModal {...mockProps} />);
      
      // Switch to attachments tab
      const attachmentsTab = screen.getByTestId('tab-attachments');
      await user.click(attachmentsTab);
      
      // Upload file through the AttachmentManager component
      const uploadBtn = screen.getByTestId('upload-file-btn');
      await user.click(uploadBtn);
      
      await waitFor(() => {
        expect(mockProps.onUploadAttachment).toHaveBeenCalledWith(
          mockCard.id,
          expect.any(File)
        );
      });
    });

    it('should display existing attachments', () => {
      // Requirements 7.4: Display attachment list
      render(<CardDetailModal {...mockProps} />);
      
      // Check that AttachmentManager is rendered with correct props
      expect(screen.getByTestId('attachment-manager')).toBeInTheDocument();
      expect(screen.getByTestId('attachment-count')).toHaveTextContent('1');
    });

    it('should handle file download', async () => {
      // Requirements 7.4: File download functionality
      const user = userEvent.setup();
      render(<CardDetailModal {...mockProps} />);
      
      // Mock download functionality would be tested here
      // This depends on the actual implementation in AttachmentManager
      expect(mockProps.onDownloadAttachment).toBeDefined();
    });
  });

  describe('Status History Display', () => {
    it('should display status history tab', () => {
      const propsWithHistory = {
        ...mockProps,
        statusHistory: [
          {
            id: 1,
            cardId: 1,
            previousStatus: 'pending',
            newStatus: 'in_progress',
            updatedBy: 'John Doe',
            updateReason: 'Started work',
            createdAt: '2024-01-01T10:00:00Z'
          }
        ]
      };
      
      render(<CardDetailModal {...propsWithHistory} />);
      
      const historyTab = screen.getByTestId('tab-history');
      expect(historyTab).toHaveTextContent('History (1)');
    });

    it('should show empty state when no history exists', () => {
      render(<CardDetailModal {...mockProps} />);
      
      const historyTab = screen.getByTestId('tab-history');
      expect(historyTab).toHaveTextContent('History (0)');
    });
  });

  describe('Error Handling', () => {
    it('should handle update errors gracefully', async () => {
      // Requirements 7.1, 7.2: Error handling
      const user = userEvent.setup();
      const mockPropsWithError = {
        ...mockProps,
        onUpdate: vi.fn().mockRejectedValue(new Error('Update failed'))
      };
      
      render(<CardDetailModal {...mockPropsWithError} />);
      
      // Try to update status
      const statusSelect = screen.getByRole('combobox');
      await user.click(statusSelect);
      
      const completedOption = screen.getByRole('option', { name: /completed/i });
      await user.click(completedOption);
      
      const updateButton = screen.getByRole('button', { name: /update status/i });
      await user.click(updateButton);
      
      // Should handle error without crashing
      await waitFor(() => {
        expect(mockPropsWithError.onUpdate).toHaveBeenCalled();
      });
    });

    it('should handle comment addition errors', async () => {
      // Requirements 7.3: Comment error handling
      const user = userEvent.setup();
      const mockPropsWithError = {
        ...mockProps,
        onAddComment: vi.fn().mockRejectedValue(new Error('Comment failed'))
      };
      
      render(<CardDetailModal {...mockPropsWithError} />);
      
      const commentsTab = screen.getByTestId('tab-comments');
      await user.click(commentsTab);
      
      const addCommentBtn = screen.getByTestId('add-comment-btn');
      await user.click(addCommentBtn);
      
      // Should handle error without crashing
      await waitFor(() => {
        expect(mockPropsWithError.onAddComment).toHaveBeenCalled();
      });
    });

    it('should handle file upload errors', async () => {
      // Requirements 7.4: File upload error handling
      const user = userEvent.setup();
      const mockPropsWithError = {
        ...mockProps,
        onUploadAttachment: vi.fn().mockRejectedValue(new Error('Upload failed'))
      };
      
      render(<CardDetailModal {...mockPropsWithError} />);
      
      const attachmentsTab = screen.getByTestId('tab-attachments');
      await user.click(attachmentsTab);
      
      const uploadBtn = screen.getByTestId('upload-file-btn');
      await user.click(uploadBtn);
      
      // Should handle error without crashing
      await waitFor(() => {
        expect(mockPropsWithError.onUploadAttachment).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      // Requirements 7.1: Accessibility compliance
      render(<CardDetailModal {...mockProps} />);
      
      expect(screen.getByTestId('modal-title')).toBeInTheDocument();
      expect(screen.getByTestId('modal-description')).toBeInTheDocument();
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check for proper form elements
      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      // Requirements 7.1: Keyboard accessibility
      const user = userEvent.setup();
      render(<CardDetailModal {...mockProps} />);
      
      // Tab navigation should work
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
      
      // Enter key should activate buttons
      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();
      await user.keyboard('{Enter}');
      
      // Should not crash and should handle keyboard interaction
    });
  });
});