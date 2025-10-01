'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import FilterSection from '@/components/FilterSection';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

interface EmailFile {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

interface EmailHeaders {
  from: string;
  to: string;
  subject: string;
  date?: string;
}

export default function EmailPreviewPage({ params }: { params: Promise<{ fileId: string }> }) {
  const resolvedParams = use(params);
  const fileId = resolvedParams.fileId;

  const t = useTranslations('Dashboard.email-preview');
  const router = useRouter();

  const [file, setFile] = useState<EmailFile | null>(null);
  const [emailContent, setEmailContent] = useState<string | null>(null);
  const [emailHeaders, setEmailHeaders] = useState<EmailHeaders | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const [selectedEmails, setSelectedEmails] = useState<string[]>([fileId]);
  const [availableEmails, setAvailableEmails] = useState<EmailFile[]>([]);

  useEffect(() => {
    fetchFileData();
  }, [fileId]);

  const parseEmailHeaders = (content: string): { headers: EmailHeaders; body: string } => {
    const headers: EmailHeaders = {
      from: '',
      to: '',
      subject: ''
    };

    let body = content;
    const headerEndIndex = content.indexOf('\n\n');
    
    if (headerEndIndex > 0) {
      const headerSection = content.slice(0, headerEndIndex);
      body = content.slice(headerEndIndex + 2);
      
      // Parse headers
      const headerLines = headerSection.split('\n');
      for (const line of headerLines) {
        if (line.toLowerCase().startsWith('from:')) {
          headers.from = line.slice(5).trim();
        } else if (line.toLowerCase().startsWith('to:')) {
          headers.to = line.slice(3).trim();
        } else if (line.toLowerCase().startsWith('subject:')) {
          headers.subject = line.slice(8).trim();
        } else if (line.toLowerCase().startsWith('date:')) {
          headers.date = line.slice(5).trim();
        }
      }
    }

    return { headers, body };
  };

  const extractEmailBody = (content: string): { htmlContent: string; headers: EmailHeaders } => {
    try {
      const { headers, body } = parseEmailHeaders(content);
      
      let htmlBody = body;

      // If body is already HTML, use it directly
      if (body.trim().startsWith('<!DOCTYPE') || body.trim().startsWith('<html')) {
        htmlBody = body;
      } else {
        // Check if this is an HTML email based on headers
        const isHtmlEmail = content.toLowerCase().includes('content-type: text/html') || 
                           body.includes('<') || 
                           body.includes('</');
        
        if (isHtmlEmail && (body.includes('<!DOCTYPE') || body.includes('<html') || body.includes('<body'))) {
          // Try to extract HTML content
          const htmlMatch = body.match(/<!DOCTYPE[^]*?<\/html>|<html[^]*?<\/html>|<body[^]*?<\/body>/i);
          if (htmlMatch) {
            htmlBody = htmlMatch[0];
          }
        } else {
          // Wrap plain text in HTML
          htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  line-height: 1.6; 
                  color: #333; 
                  max-width: 800px; 
                  margin: 0 auto; 
                  padding: 20px;
                  background: #f9f9f9;
                }
                .email-container {
                  background: white;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .plain-text-content {
                  white-space: pre-wrap;
                  font-family: Arial, sans-serif;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="plain-text-content">${body}</div>
              </div>
            </body>
            </html>
          `;
        }
      }

      // Create the final HTML with headers
      const finalHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background: #f9f9f9;
            }
            .email-headers {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              border-bottom: 1px solid #dee2e6;
              font-size: 14px;
            }
            .header-row {
              margin-bottom: 8px;
              display: flex;
            }
            .header-label {
              font-weight: bold;
              min-width: 80px;
              color: #495057;
            }
            .header-value {
              flex: 1;
              color: #212529;
            }
            .email-body {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="email-headers">
            <div class="header-row">
              <div class="header-label">From:</div>
              <div class="header-value">${headers.from || 'Unknown Sender'}</div>
            </div>
            <div class="header-row">
              <div class="header-label">To:</div>
              <div class="header-value">${headers.to || 'Unknown Recipient'}</div>
            </div>
            <div class="header-row">
              <div class="header-label">Subject:</div>
              <div class="header-value">${headers.subject || 'No Subject'}</div>
            </div>
            ${headers.date ? `
            <div class="header-row">
              <div class="header-label">Date:</div>
              <div class="header-value">${headers.date}</div>
            </div>
            ` : ''}
          </div>
          <div class="email-body">
            ${htmlBody}
          </div>
        </body>
        </html>
      `;

      return { htmlContent: finalHtml, headers };

    } catch (error) {
      console.error('Error extracting email body:', error);
      
      // Fallback with basic headers
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background: #f5f5f5;
            }
            .error-content {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #ddd;
              white-space: pre-wrap;
              font-family: monospace;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="error-content">${content}</div>
        </body>
        </html>
      `;

      return { 
        htmlContent: fallbackHtml, 
        headers: { from: '', to: '', subject: '' } 
      };
    }
  };

  const fetchFileData = async () => {
    try {
      setLoading(true);
      const sessionData = await authClient.getSession();
      setSession(sessionData);

      if (!sessionData.data?.user) throw new Error('User not authenticated');

      const response = await fetch('/api/get-email-files');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch files');

      setAvailableEmails(result.files);

      const foundFile = result.files.find((f: EmailFile) => f.id === fileId);
      if (!foundFile) throw new Error('File not found');

      setFile(foundFile);
      await fetchFileContent(foundFile, sessionData);
    } catch (error: any) {
      console.error('Error fetching file:', error);
      toast.error(t('fetch-error'), { description: error.message || t('fetch-error-description') });
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (file: EmailFile, sessionData: any) => {
    try {
      const fileExtension = file.fileType;
      const fileNameWithoutExtension = file.filename.replace(/\.[^/.]+$/, '');
      const formattedFileName = `${fileNameWithoutExtension}-${sessionData.data?.user?.id}-${file.id}.${fileExtension}`;

      const response = await fetch(`/api/get-email-file-content/${formattedFileName}`);
      if (!response.ok) throw new Error('Failed to fetch file content');

      const content = await response.text();
      const { htmlContent, headers } = extractEmailBody(content);
      setEmailContent(htmlContent);
      setEmailHeaders(headers);
    } catch (error: any) {
      console.error('Error fetching file content:', error);
      toast.error(t('content-fetch-error'), { description: error.message || t('content-fetch-error-description') });
    }
  };

  const handleEmailsChange = (emails: string[]) => setSelectedEmails(emails);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <DashboardHeader breadcrumbs={[{ label: t('title'), isCurrentPage: true }]} />
        <Card className="w-full mt-4">
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
        <DashboardHeader breadcrumbs={[{ label: t('title'), isCurrentPage: true }]} />
        <Card className="w-full mt-4">
          <CardContent className="flex flex-col justify-center items-center h-64 gap-4">
            <p className="text-muted-foreground">{t('file-not-found')}</p>
            <Button onClick={() => router.back()}>{t('go-back')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <DashboardHeader
        breadcrumbs={[
          { label: t('title') },
          { label: file.filename, isCurrentPage: true }
        ]}
      />

      <FilterSection
        availableEmails={availableEmails}
        onEmailsChange={handleEmailsChange}
        selectedEmails={selectedEmails}
        onDevicesChange={() => {}}
        selectedDevices={[]}
      />

      <Card className="w-full mt-4">
        <CardHeader>
          <div>
            <CardTitle>{file.filename}</CardTitle>
            <CardDescription>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <span>{t('file-type')}: {file.fileType.toUpperCase()}</span>
                <span>{t('file-size')}: {formatFileSize(file.fileSize)}</span>
                <span>{t('upload-date')}: {formatDate(file.createdAt)}</span>
              </div>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {emailContent ? (
            <div className="border rounded-lg overflow-hidden bg-white">
              <iframe
                srcDoc={emailContent}
                className="w-full h-[700px] border-0"
                title="Email preview"
                sandbox="allow-same-origin"
              />
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