'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
 import { Download, ExternalLink, Monitor, Tablet, Smartphone } from 'lucide-react';

interface EmailFile {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export default function EmailPreviewPage({ params }: { params: { fileId: string } }) {
  const t = useTranslations('Dashboard.email-preview');
  const router = useRouter();
  const [file, setFile] = useState<EmailFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetchFileData();
  }, [params.fileId]);

  const fetchFileData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const sessionData = await authClient.getSession();
      setSession(sessionData);
      
      if (!sessionData.data?.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/get-email-files');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch files');
      }

      // Find the specific file
      const foundFile = result.files.find((f: EmailFile) => f.id === params.fileId);
      if (!foundFile) {
        throw new Error('File not found');
      }

      setFile(foundFile);
      
      // Fetch file content
      await fetchFileContent(foundFile, sessionData);
    } catch (error: any) {
      console.error('Error fetching file:', error);
      toast.error(t('fetch-error'), {
        description: error.message || t('fetch-error-description')
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (file: EmailFile, sessionData: any) => {
    try {
      // Construct the filename as it's stored on the server
      // Format: originalName-userId-fileId.extension
      const fileExtension = file.fileType;
      const fileNameWithoutExtension = file.filename.replace(/\.[^/.]+$/, '');
      const formattedFileName = `${fileNameWithoutExtension}-${sessionData.data?.user?.id}-${file.id}.${fileExtension}`;
      
      const response = await fetch(`/api/get-email-file-content/${formattedFileName}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      
      const content = await response.text();
      setFileContent(content);
    } catch (error: any) {
      console.error('Error fetching file content:', error);
      toast.error(t('content-fetch-error'), {
        description: error.message || t('content-fetch-error-description')
      });
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
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const handleDownload = async () => {
    if (!file) return;
    
    try {
      // Construct the filename as it's stored on the server
      const filenameParts = file.filename.split('.');
      const fileExtension = filenameParts.pop();
      const fileNameWithoutExtension = filenameParts.join('.');
      
      // Format: originalName-userId-fileId.extension
      const formattedFileName = `${fileNameWithoutExtension}-${file.id}.${fileExtension}`;
      
      const response = await fetch(`/api/download-email-file/${formattedFileName}`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(t('download-success'), {
        description: t('download-success-description')
      });
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error(t('download-error'), {
        description: error.message || t('download-error-description')
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        
        <Card className="w-full">
          <CardContent className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        
        <Card className="w-full">
          <CardContent className="flex flex-col justify-center items-center h-64 gap-4">
            <p className="text-muted-foreground">{t('file-not-found')}</p>
            <Button onClick={() => router.back()}>
              {t('go-back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('download')}
          </Button>
        </div>
      </div>
      
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {file.filename}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(window.location.href, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                  <span>{t('file-type')}: {file.fileType.toUpperCase()}</span>
                  <span>{t('file-size')}: {formatFileSize(file.fileSize)}</span>
                  <span>{t('upload-date')}: {formatDate(file.createdAt)}</span>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {fileContent ? (
            <div className="space-y-6">
              {/* Preview Panes Header */}
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">{t('preview-title')}</h2>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Monitor className="h-4 w-4" />
                    {t('desktop')}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Tablet className="h-4 w-4" />
                    {t('tablet')}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Smartphone className="h-4 w-4" />
                    {t('mobile')}
                  </div>
                </div>
              </div>
              
              {/* Preview Panes */}
              <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto">
                {/* Desktop Preview */}
                <div className="flex-1 min-w-[375px]">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    {t('desktop')} (1200px)
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    {file.fileType === 'html' ? (
                      <iframe 
                        srcDoc={fileContent} 
                        className="w-full h-[70vh]"
                        style={{ minWidth: '375px', maxWidth: '1200px' }}
                        title="Desktop Preview"
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap break-words max-w-full overflow-x-auto">
                        {fileContent}
                      </pre>
                    )}
                  </div>
                </div>
                
                {/* Tablet Preview */}
                <div className="flex-1 min-w-[375px]">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Tablet className="h-4 w-4" />
                    {t('tablet')} (768px)
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    {file.fileType === 'html' ? (
                      <iframe 
                        srcDoc={fileContent} 
                        className="w-full h-[70vh]"
                        style={{ minWidth: '375px', width: '768px', maxWidth: '768px' }}
                        title="Tablet Preview"
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap break-words max-w-[768px] overflow-x-auto">
                        {fileContent}
                      </pre>
                    )}
                  </div>
                </div>
                
                {/* Mobile Preview */}
                <div className="flex-1 min-w-[375px]">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    {t('mobile')} (375px)
                  </div>
                  <div className="border rounded-lg p-4 bg-white">
                    {file.fileType === 'html' ? (
                      <iframe 
                        srcDoc={fileContent} 
                        className="w-full h-[70vh]"
                        style={{ minWidth: '375px', width: '375px', maxWidth: '375px' }}
                        title="Mobile Preview"
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap break-words max-w-[375px] overflow-x-auto">
                        {fileContent}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}