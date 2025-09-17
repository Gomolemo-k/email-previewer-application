'use client';

import { useState, useRef, useCallback, DragEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface EmailUploadProps {
  onUploadSuccess?: (file: File) => void;
}

export function EmailUpload({ onUploadSuccess }: EmailUploadProps) {
  const t = useTranslations('Dashboard.email-upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileType = (file: File): boolean => {
    const validTypes = ['.eml', '.html'];
    const fileName = file.name.toLowerCase();
    return validTypes.some(type => fileName.endsWith(type));
  };

  const handleFiles = useCallback((files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    
    if (!validateFileType(file)) {
      toast.error(t('invalid-file-type'), {
        description: t('invalid-file-type-description')
      });
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('file-too-large'), {
        description: t('file-too-large-description')
      });
      return;
    }

    handleUpload(file);
  }, [t, onUploadSuccess]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Create FormData object to send file to backend
      const formData = new FormData();
      formData.append('file', file);

      // Send file to backend
      const response = await fetch('/api/upload-email', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast.success(t('upload-success'), {
        description: t('upload-success-description', { fileName: file.name })
      });
      
      onUploadSuccess?.(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(t('upload-error'), {
        description: error.message || t('upload-error-description')
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
      // Reset input to allow selecting the same file again
      e.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </div>
            <div>
              <p className="font-medium">
                {isDragging ? t('drop-here') : t('drag-and-drop')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('file-types')}
              </p>
            </div>
            <Button variant="secondary" disabled={isUploading}>
              {isUploading ? t('uploading') : t('browse-files')}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {t('max-file-size')}
            </p>
          </div>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
            accept=".eml,.html"
          />
        </div>
      </CardContent>
    </Card>
  );
}