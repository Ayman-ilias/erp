"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Paperclip, 
  Upload, 
  Download, 
  File, 
  Image, 
  FileText, 
  Archive,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface AttachmentResponse {
  id: number;
  card_id: number;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

interface AttachmentManagerProps {
  cardId: number;
  attachments: AttachmentResponse[];
  onUploadAttachment?: (cardId: number, file: File) => Promise<void>;
  onDownloadAttachment?: (attachment: AttachmentResponse) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  currentUser?: string;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  cardId,
  attachments,
  onUploadAttachment,
  onDownloadAttachment,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.gif', '.zip', '.rar'],
  currentUser = "Current User"
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <Image className="w-4 h-4 text-purple-500" />;
      case 'zip':
      case 'rar':
        return <Archive className="w-4 h-4 text-orange-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
    if (!allowedFileTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not allowed`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setUploadError(null);
    const error = validateFile(file);
    
    if (error) {
      setUploadError(error);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !onUploadAttachment) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await onUploadAttachment(cardId, selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }, 1000);
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (attachment: AttachmentResponse) => {
    if (onDownloadAttachment) {
      onDownloadAttachment(attachment);
    } else {
      // Fallback: create download link
      const link = document.createElement('a');
      link.href = attachment.file_url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Sort attachments by upload date (most recent first)
  const sortedAttachments = [...attachments].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Attach Files</Label>
        </div>

        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop files here, or click to browse
          </p>
          
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            accept={allowedFileTypes.join(',')}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
          >
            Choose File
          </Button>
          
          <p className="text-xs text-muted-foreground mt-2">
            Max size: {formatFileSize(maxFileSize)} • 
            Allowed: {allowedFileTypes.join(', ')}
          </p>
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            {getFileIcon(selectedFile.name)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelectedFile}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleFileUpload}
              size="sm"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Upload className="w-4 h-4 mr-1 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </>
              )}
            </Button>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Success */}
        {uploadProgress === 100 && !isUploading && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            File uploaded successfully!
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {uploadError}
          </div>
        )}
      </div>

      {/* Attachments List */}
      <div className="space-y-3">
        {sortedAttachments.length === 0 ? (
          <div className="text-center py-8">
            <Paperclip className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No files attached</p>
            <p className="text-xs text-muted-foreground">
              Upload files to share with your team
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {sortedAttachments.length} Attachment{sortedAttachments.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {sortedAttachments.map(attachment => (
              <div 
                key={attachment.id} 
                className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors group"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(attachment.file_name)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <span>•</span>
                    <span>Uploaded by {attachment.uploaded_by}</span>
                    {attachment.uploaded_by === currentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                    <span>•</span>
                    <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* File Guidelines */}
      {sortedAttachments.length === 0 && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p className="font-medium mb-1">📎 Attachment Guidelines:</p>
          <ul className="space-y-1 ml-4">
            <li>• Drag and drop files or click to browse</li>
            <li>• Maximum file size: {formatFileSize(maxFileSize)}</li>
            <li>• Supported formats: {allowedFileTypes.slice(0, 5).join(', ')}{allowedFileTypes.length > 5 ? '...' : ''}</li>
            <li>• Files are shared with all team members</li>
          </ul>
        </div>
      )}
    </div>
  );
};