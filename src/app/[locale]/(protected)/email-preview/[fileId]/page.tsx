'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

// MultiSelect imports
import { MultiSelect, MultiSelectItem, MultiSelectContext } from '@/components/ui/multi-select';

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

  // Filter states
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>([]);

  // Mock data (replace with API data if needed)
  const [availableEmails, setAvailableEmails] = useState<EmailFile[]>([]);
  const screenResolutions = [
    { id: 'desktop', name: t('desktop'), width: 1200, icon: <Monitor className="h-4 w-4" /> },
    { id: 'tablet', name: t('tablet'), width: 768, icon: <Tablet className="h-4 w-4" /> },
    { id: 'mobile', name: t('mobile'), width: 375, icon: <Smartphone className="h-4 w-4" /> },
  ];

  useEffect(() => {
    fetchFileData();
  }, [params.fileId]);

  const fetchFileData = async () => {
    try {
      setLoading(true);
      const sessionData = await authClient.getSession();
      setSession(sessionData);

      if (!sessionData.data?.user) throw new Error('User not authenticated');

      const response = await fetch('/api/get-email-files');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch files');

      setAvailableEmails(result.files); // Populate filter options

      const foundFile = result.files.find((f: EmailFile) => f.id === params.fileId);
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
      setFileContent(content);
    } catch (error: any) {
      console.error('Error fetching file content:', error);
      toast.error(t('content-fetch-error'), { description: error.message || t('content-fetch-error-description') });
    }
  };

  const handleEmailChange = (values: string[]) => {
    setSelectedEmails(values);
  };

  const handleResolutionChange = (values: string[]) => {
    setSelectedResolutions(values);
  };

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
            <Button onClick={() => router.back()}>{t('go-back')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      {/* Filters Section */}
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{t('filters-title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('select-emails')}</label>
              <MultiSelectContext.Provider value={{ value: selectedEmails, onValueChange: handleEmailChange }}>
                <MultiSelect
                  value={selectedEmails}
                  onValueChange={handleEmailChange}
                  placeholder={t('select-emails-placeholder')}
                >
                  {availableEmails.map((email) => (
                    <MultiSelectItem key={email.id} value={email.id}>
                      {email.filename}
                    </MultiSelectItem>
                  ))}
                </MultiSelect>
              </MultiSelectContext.Provider>
            </div>

            {/* Resolution Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('select-resolutions')}</label>
              <MultiSelectContext.Provider value={{ value: selectedResolutions, onValueChange: handleResolutionChange }}>
                <MultiSelect
                  value={selectedResolutions}
                  onValueChange={handleResolutionChange}
                  placeholder={t('select-resolutions-placeholder')}
                >
                  {screenResolutions.map((resolution) => (
                    <MultiSelectItem key={resolution.id} value={resolution.id}>
                      <div className="flex items-center gap-2">
                        {resolution.icon}
                        {resolution.name} ({resolution.width}px)
                      </div>
                    </MultiSelectItem>
                  ))}
                </MultiSelect>
              </MultiSelectContext.Provider>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Card */}
      <Card className="w-full">
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
          {fileContent ? (
            <div className="space-y-6">
              {/* Preview Panes */}
              <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto">
                {screenResolutions
                  .filter((res) => selectedResolutions.length === 0 || selectedResolutions.includes(res.id))
                  .map((res) => (
                    <div key={res.id} className="flex-1 min-w-[375px]">
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        {res.icon}{res.name} ({res.width}px)
                      </div>
                      {file.fileType === 'html' ? (
                        <iframe
                          srcDoc={fileContent}
                          className="w-full h-[70vh]"
                          style={{ minWidth: '375px', width: `${res.width}px`, maxWidth: `${res.width}px` }}
                          title={`${res.name} Preview`}
                        />
                      ) : (
                        <pre className={`whitespace-pre-wrap break-words max-w-[${res.width}px] overflow-x-auto`}>
                          {fileContent}
                        </pre>
                      )}
                    </div>
                  ))}
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
