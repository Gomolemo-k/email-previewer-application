'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Minimize2, Maximize2, X, Trash2 } from 'lucide-react';

interface EmailFile {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export function EmailFileTable() {
  const t = useTranslations('Dashboard.email-files');
  const [files, setFiles] = useState<EmailFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<EmailFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    fetchFiles();
    
    // Listen for file upload events
    const handleFileUploaded = () => {
      fetchFiles();
    };
    
    window.addEventListener('fileUploaded', handleFileUploaded);
    
    return () => {
      window.removeEventListener('fileUploaded', handleFileUploaded);
    };
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const session = await authClient.getSession();
      if (!session.data?.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/get-email-files');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch files');
      }

      setFiles(result.files);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast.error(t('fetch-error'), {
        description: error.message || t('fetch-error-description')
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  const handleFilePreview = (file: EmailFile) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  const handleDeleteFile = async (fileId: string, filename: string) => {
    try {
      // Check if user is authenticated
      const session = await authClient.getSession();
      if (!session.data?.user) {
        throw new Error('User not authenticated');
      }

      // Make API call to delete the file
      const response = await fetch(`/api/delete-email-file/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete file');
      }

      // Remove file from the list
      setFiles(files.filter(file => file.id !== fileId));
      
      toast.success(t('delete-success'), {
        description: t('delete-success-description', { filename })
      });
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(t('delete-error'), {
        description: error.message || t('delete-error-description')
      });
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setIsMaximized(false);
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('no-files')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('filename')}</TableHead>
              <TableHead>{t('file-type')}</TableHead>
              <TableHead>{t('file-size')}</TableHead>
              <TableHead>{t('upload-date')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.filename}</TableCell>
                <TableCell>{file.fileType.toUpperCase()}</TableCell>
                <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                <TableCell>{formatDate(file.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleFilePreview(file)}
                    >
                      {t('view')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteFile(file.id, file.filename)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* File Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent 
            className={`${isMaximized ? 'max-w-full h-full' : 'max-w-4xl'}`}
          >
            <DialogHeader className={`${isMaximized ? 'p-6' : ''}`}>
              <div className="flex justify-between items-center">
                <DialogTitle>{selectedFile?.filename}</DialogTitle>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={toggleMaximize}>
                    {isMaximized ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={closePreview}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogDescription>
                {selectedFile && (
                  <div className="flex space-x-4 text-sm">
                    <span>{t('file-type')}: {selectedFile.fileType.toUpperCase()}</span>
                    <span>{t('file-size')}: {formatFileSize(selectedFile.fileSize)}</span>
                    <span>{t('upload-date')}: {formatDate(selectedFile.createdAt)}</span>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className={`overflow-auto ${isMaximized ? 'h-[calc(100vh-120px)]' : 'h-[60vh]'}`}>
              {selectedFile && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {t('preview-not-available')}
                  </p>
                  <p className="text-xs mt-2">
                    {t('preview-not-available-description')}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}