'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { useQueryClient } from '@tanstack/react-query';
import { Download, ExternalLink, Monitor, Tablet, Smartphone, ArrowLeft, Laptop, MonitorSpeaker } from 'lucide-react';
import { MultiSelect, MultiSelectItem, MultiSelectContext } from '@/components/ui/multi-select';

interface EmailFile {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

// Screen resolution types
interface ScreenResolution {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

export default function EmailPreviewPage({ params }: { params: { fileId: string } }) {
  const t = useTranslations('Dashboard.email-preview');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<EmailFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>(['desktop', 'tablet', 'mobile']);
  const [availableEmails, setAvailableEmails] = useState<EmailFile[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // Available screen resolutions with realistic device dimensions
  const screenResolutions: ScreenResolution[] = [
    { id: '4k', name: t('4k'), width: 3840, height: 2160, icon: <MonitorSpeaker className="h-4 w-4" /> },
    { id: 'laptop', name: t('laptop'), width: 1440, height: 900, icon: <Laptop className="h-4 w-4" /> },
    { id: 'desktop', name: t('desktop'), width: 1920, height: 1080, icon: <Monitor className="h-4 w-4" /> },
    { id: 'tablet', name: t('tablet'), width: 768, height: 1024, icon: <Tablet className="h-4 w-4" /> },
    { id: 'mobile', name: t('mobile'), width: 375, height: 667, icon: <Smartphone className="h-4 w-4" /> },
    { id: 'small-mobile', name: t('small-mobile'), width: 320, height: 568, icon: <Smartphone className="h-4 w-4" /> },
  ];

  // ✅ useSession must be called at top level
  const { data: sessionData } = authClient.useSession();

  // Invalidate payment queries when session loads
  useEffect(() => {
    if (sessionData?.data?.user?.id) {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'payment',
      });
    }
  }, [sessionData?.data?.user?.id, queryClient]);

  useEffect(() => {
    fetchFileData();
    fetchAllEmails();
  }, [params.fileId]);

  const fetchAllEmails = async () => {
    try {
      const sessionData = await authClient.getSession();
      if (!sessionData.data?.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/get-email-files');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch files');
      }

      setAvailableEmails(result.files);
      // Set the current file as selected by default
      if (params.fileId) {
        setSelectedEmails([params.fileId]);
      }
    } catch (error: any) {
      console.error('Error fetching emails:', error);
      toast.error(t('fetch-error'), {
        description: error.message || t('fetch-error-description'),
      });
    }
  };

  const fetchFileData = async () => {
    try {
      setLoading(true);

      // Get session manually for fetchFileContent
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
        description: error.message || t('fetch-error-description'),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (file: EmailFile, sessionData: any) => {
    try {
      setContentLoading(true);
      setContentError(null);

      const fileExtension = file.fileType;
      const fileNameWithoutExtension = file.filename.replace(/\.[^/.]+$/, '');
      // ✅ consistent filename format
      const formattedFileName = `${fileNameWithoutExtension}-${sessionData.data?.user?.id}-${file.id}.${fileExtension}`;

      const response = await fetch(`/api/get-email-file-content/${formattedFileName}`);

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to fetch file content');
      }

      const content = await response.text();
      setFileContent(content);
    } catch (error: any) {
      console.error('Error fetching file content:', error);
      setContentError(error.message || t('content-fetch-error-description'));
      toast.error(t('content-fetch-error'), {
        description: error.message || t('content-fetch-error-description'),
      });
    } finally {
      setContentLoading(false);
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
    if (!file || !session?.data?.user?.id) return;

    try {
      const filenameParts = file.filename.split('.');
      const fileExtension = filenameParts.pop();
      const fileNameWithoutExtension = filenameParts.join('.');

      // ✅ now includes userId
      const formattedFileName = `${fileNameWithoutExtension}-${session.data?.user?.id}-${file.id}.${fileExtension}`;

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
        description: t('download-success-description'),
      });
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error(t('download-error'), {
        description: error.message || t('download-error-description'),
      });
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleResolutionChange = (resolutions: string[]) => {
    setSelectedResolutions(resolutions);
  };

  const handleEmailChange = (emails: string[]) => {
    setSelectedEmails(emails);
    // If only one email is selected, navigate to its preview page
    if (emails.length === 1) {
      const selectedFile = availableEmails.find(f => f.id === emails[0]);
      if (selectedFile) {
        router.push(`/email-preview/${selectedFile.id}`);
      }
    }
  };

  // ✅ render logic unchanged
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

  // Filter resolutions based on selection
  const filteredResolutions = screenResolutions.filter(res => 
    selectedResolutions.includes(res.id)
  );

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleGoBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('go-back')}
          </Button>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('download')}
          </Button>
        </div>
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
          {contentLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : contentError ? (
            <div className="flex flex-col justify-center items-center h-32 gap-4">
              <p className="text-red-500">{t('content-fetch-error')}</p>
              <p className="text-muted-foreground text-sm">{contentError}</p>
              <Button onClick={() => file && session && fetchFileContent(file, session)}>
                {t('go-back')}
              </Button>
            </div>
          ) : fileContent ? (
            <div className="space-y-6">
              {/* Preview Panes Header */}
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">{t('preview-title')}</h2>
                <div className="flex gap-2 flex-wrap">
                  {screenResolutions.map((resolution) => (
                    selectedResolutions.includes(resolution.id) && (
                      <div key={resolution.id} className="flex items-center gap-1 text-sm text-muted-foreground">
                        {resolution.icon}
                        {resolution.name}
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Preview Panes */}
              <div className={`grid gap-6 ${filteredResolutions.length > 1 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredResolutions.map((resolution) => (
                  <div key={resolution.id} className="flex flex-col">
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      {resolution.icon}
                      {resolution.name} ({resolution.width}px)
                    </div>
                    <div className="border rounded-lg bg-white flex flex-col flex-1 overflow-hidden">
                      {/* Device frame for better visualization */}
                      <div 
                        className="flex-1 overflow-auto p-4 flex justify-center items-start"
                        style={{ 
                          height: '100vh',
                          backgroundColor: '#f8f9fa'
                        }}
                      >
                        {file.fileType === 'html' ? (
                          <div className="relative w-full max-w-full">
                            {/* Device frame based on resolution */}
                            {resolution.id === 'mobile' || resolution.id === 'small-mobile' ? (
                              // Mobile device frame
                              <div className="relative mx-auto w-full" style={{ maxWidth: `${resolution.width + 40}px` }}>
                                <div className="absolute inset-0 bg-gray-900 rounded-[40px] shadow-2xl" style={{ padding: '20px' }}>
                                  <div className="w-full h-full bg-white rounded-[30px] overflow-hidden">
                                    <iframe
                                      srcDoc={fileContent}
                                      className="w-full"
                                      style={{ 
                                        height: `${resolution.height}px`,
                                        border: 'none'
                                      }}
                                      title={`${resolution.name} Preview`}
                                    />
                                  </div>
                                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-full"></div>
                                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gray-700"></div>
                                </div>
                              </div>
                            ) : resolution.id === 'tablet' ? (
                              // Tablet device frame
                              <div className="relative mx-auto w-full" style={{ maxWidth: `${resolution.width + 40}px` }}>
                                <div className="absolute inset-0 bg-gray-900 rounded-[30px] shadow-2xl" style={{ padding: '20px' }}>
                                  <div className="w-full h-full bg-white rounded-[20px] overflow-hidden">
                                    <iframe
                                      srcDoc={fileContent}
                                      className="w-full"
                                      style={{ 
                                        height: `${resolution.height}px`,
                                        border: 'none'
                                      }}
                                      title={`${resolution.name} Preview`}
                                    />
                                  </div>
                                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-700"></div>
                                </div>
                              </div>
                            ) : (
                              // Desktop/laptop device frame
                              <div className="relative mx-auto w-full" style={{ maxWidth: `${Math.min(resolution.width + 40, 1400)}px` }}>
                                <div className="absolute inset-0 bg-gray-900 rounded-lg shadow-2xl" style={{ padding: '20px' }}>
                                  <div className="w-full h-full bg-white rounded overflow-hidden">
                                    <iframe
                                      srcDoc={fileContent}
                                      className="w-full"
                                      style={{ 
                                        height: `${resolution.height}px`,
                                        border: 'none'
                                      }}
                                      title={`${resolution.name} Preview`}
                                    />
                                  </div>
                                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-700 rounded-full"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative w-full max-w-full">
                            {/* Device frame for text content */}
                            {resolution.id === 'mobile' || resolution.id === 'small-mobile' ? (
                              // Mobile device frame for text
                              <div className="relative mx-auto w-full" style={{ maxWidth: `${resolution.width + 40}px` }}>
                                <div className="absolute inset-0 bg-gray-900 rounded-[40px] shadow-2xl" style={{ padding: '20px' }}>
                                  <div className="w-full h-full bg-white rounded-[30px] overflow-hidden p-4">
                                    <pre 
                                      className="m-0 text-xs overflow-auto"
                                      style={{ 
                                        height: `${resolution.height}px`,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {fileContent}
                                    </pre>
                                  </div>
                                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-full"></div>
                                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gray-700"></div>
                                </div>
                              </div>
                            ) : resolution.id === 'tablet' ? (
                              // Tablet device frame for text
                              <div className="relative mx-auto w-full" style={{ maxWidth: `${resolution.width + 40}px` }}>
                                <div className="absolute inset-0 bg-gray-900 rounded-[30px] shadow-2xl" style={{ padding: '20px' }}>
                                  <div className="w-full h-full bg-white rounded-[20px] overflow-hidden p-4">
                                    <pre 
                                      className="m-0 text-sm overflow-auto"
                                      style={{ 
                                        height: `${resolution.height}px`,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {fileContent}
                                    </pre>
                                  </div>
                                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-700"></div>
                                </div>
                              </div>
                            ) : (
                              // Desktop/laptop device frame for text
                              <div className="relative mx-auto w-full" style={{ maxWidth: `${Math.min(resolution.width + 40, 1400)}px` }}>
                                <div className="absolute inset-0 bg-gray-900 rounded-lg shadow-2xl" style={{ padding: '20px' }}>
                                  <div className="w-full h-full bg-white rounded overflow-hidden p-4">
                                    <pre 
                                      className="m-0 overflow-auto"
                                      style={{ 
                                        height: `${resolution.height}px`,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {fileContent}
                                    </pre>
                                  </div>
                                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-700 rounded-full"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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
