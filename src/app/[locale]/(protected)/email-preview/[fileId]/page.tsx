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
import { Monitor, Smartphone, Tablet, Laptop, RotateCcw } from 'lucide-react';
import { useCurrentPlan } from '@/hooks/use-payment';
import { Routes } from '@/routes';
import Link from 'next/link';

// --------------------- Utility functions ---------------------

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

const parseEml = (content: string) => {
  const headers: EmailHeaders = { from: '', to: '', subject: '' };
  let body = content;

  const headerEndIndex = content.indexOf('\n\n');
  if (headerEndIndex > 0) {
    const headerSection = content.slice(0, headerEndIndex);
    body = content.slice(headerEndIndex + 2);

    const headerLines = headerSection.split(/\r?\n/);
    for (const line of headerLines) {
      if (line.toLowerCase().startsWith('from:')) headers.from = line.slice(5).trim();
      else if (line.toLowerCase().startsWith('to:')) headers.to = line.slice(3).trim();
      else if (line.toLowerCase().startsWith('subject:')) headers.subject = line.slice(8).trim();
      else if (line.toLowerCase().startsWith('date:')) headers.date = line.slice(5).trim();
    }
  }
  return { headers, body };
};

const parseMbox = (content: string) => {
  const emails = content.split(/\n(?=From )/);
  const firstEmail = emails[0] || content;
  return parseEml(firstEmail);
};

const wrapHtmlContent = (content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial,sans-serif; line-height:1.6; background:#f9f9f9; padding:20px; }
        .email-container { background:white; padding:30px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1); }
      </style>
    </head>
    <body>
      <div class="email-container">
        ${content}
      </div>
    </body>
  </html>
`;

const wrapTextInHtml = (text: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial,sans-serif; line-height:1.6; background:#f9f9f9; padding:20px; }
        .email-container { background:white; padding:30px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1); }
        .plain-text-content { white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="plain-text-content">${text}</div>
      </div>
    </body>
  </html>
`;

const injectHeaders = (htmlBody: string, headers: EmailHeaders) => {
  const headerHtml = `
    <div style="background:#f8f9fa;padding:15px;border-radius:8px 8px 0 0;border-bottom:1px solid #dee2e6;font-size:14px;">
      <p><strong>From:</strong> ${headers.from || 'Unknown'}</p>
      <p><strong>To:</strong> ${headers.to || 'Unknown'}</p>
      <p><strong>Subject:</strong> ${headers.subject || 'No Subject'}</p>
      ${headers.date ? `<p><strong>Date:</strong> ${headers.date}</p>` : ''}
    </div>
  `;
  if (htmlBody.includes('<body')) {
    return htmlBody.replace(/<body[^>]*>/i, match => `${match}${headerHtml}`);
  }
  return headerHtml + htmlBody;
};

// --------------------- Component ---------------------

export default function EmailPreviewPage({ params }: { params: Promise<{ fileId: string }> }) {
  const resolvedParams = use(params);
  const fileId = resolvedParams.fileId;

  const t = useTranslations('Dashboard.email-preview');
  const router = useRouter();

  // ---------- Hooks (must always be called) ----------
  const [session, setSession] = useState<any>(null);
  const [emailHtml, setEmailHtml] = useState<string | null>(null);
  const [file, setFile] = useState<EmailFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([fileId]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [availableEmails, setAvailableEmails] = useState<EmailFile[]>([]);

  useEffect(() => {
    authClient.getSession().then(sessionData => setSession(sessionData));
  }, []);

  const userId = session?.data?.user?.id;
  const { data: paymentData, isLoading: isPaymentLoading } = useCurrentPlan(userId);

  const hasPaidPlan = Boolean(
    paymentData?.subscription?.status === 'active' &&
    paymentData?.currentPlan &&
    !paymentData.currentPlan.isFree
  );

  // Always call hooks — even if they might redirect or not
  useEffect(() => {
    if (!isPaymentLoading && paymentData && !hasPaidPlan) {
      router.push(Routes.PaymentRequired);
    }
  }, [paymentData, isPaymentLoading, hasPaidPlan, router]);

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
      console.error(error);
      toast.error(t('fetch-error'), { description: error.message || t('fetch-error-description') });
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (file: EmailFile, sessionData: any) => {
    try {
      const fileNameWithoutExt = file.filename.replace(/\.[^/.]+$/, '');
      const formattedFileName = `${fileNameWithoutExt}-${sessionData.data?.user?.id}-${file.id}.${file.fileType}`;

      const response = await fetch(`/api/get-email-file-content/${formattedFileName}`);
      if (!response.ok) throw new Error('Failed to fetch file content');

      const content = await response.text();
      let headers: EmailHeaders = { from: '', to: '', subject: '' };
      let htmlContent = '';

      switch (file.fileType.toLowerCase()) {
        case 'eml': {
          const parsed = parseEml(content);
          headers = parsed.headers;
          htmlContent = injectHeaders(wrapTextInHtml(parsed.body), headers);
          break;
        }
        case 'mbox':
        case 'mbx': {
          const parsed = parseMbox(content);
          headers = parsed.headers;
          htmlContent = injectHeaders(wrapTextInHtml(parsed.body), headers);
          break;
        }
        case 'html':
        case 'htm': {
          htmlContent = wrapHtmlContent(content);
          break;
        }
        case 'txt': {
          const parsed = parseEml(content);
          headers = parsed.headers;
          htmlContent = injectHeaders(wrapTextInHtml(parsed.body), headers);
          break;
        }
        case 'msg':
        case 'pst':
        case 'ost': {
          const parsedServer = JSON.parse(content);
          headers = parsedServer.headers || headers;
          htmlContent = injectHeaders(parsedServer.htmlContent, headers);
          break;
        }
        default: {
          const parsed = parseEml(content);
          headers = parsed.headers;
          htmlContent = injectHeaders(wrapTextInHtml(parsed.body), headers);
          break;
        }
      }

      setEmailHtml(htmlContent);
    } catch (error: any) {
      console.error(error);
      toast.error(t('content-fetch-error'), {
        description: error.message || t('content-fetch-error-description'),
      });
    }
  };

  useEffect(() => {
    fetchFileData();
  }, [fileId]);

  // ---------- Helper handlers ----------
  const handleEmailsChange = (emails: string[]) => setSelectedEmails(emails);
  const handleDevicesChange = (devices: string[]) => setSelectedDevices(devices);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();

  const getDeviceIcon = (deviceId: string) => {
    if (deviceId.includes('iphone') || deviceId.includes('samsung-phone') || deviceId.includes('pixel') || deviceId.includes('galaxy-s') || deviceId.includes('note')) {
      return <Smartphone className="size-4" />;
    } else if (deviceId.includes('ipad') || deviceId.includes('galaxy-tab') || deviceId.includes('tablet')) {
      return <Tablet className="size-4" />;
    } else if (deviceId.includes('macbook') || deviceId.includes('galaxy-book') || deviceId.includes('laptop')) {
      return <Laptop className="size-4" />;
    } else {
      return <Monitor className="size-4" />;
    }
  };

  const getDeviceStyle = (deviceId: string) => {
    if (deviceId.includes("iphone") || deviceId.includes("samsung-phone") || deviceId.includes("pixel") || deviceId.includes("galaxy-s") || deviceId.includes("note")) {
      return {
        containerClass: "w-[380px] h-[720px] overflow-hidden rounded-lg border bg-white shadow",
        iframeClass: "w-full h-full overflow-y-auto",
      };
    } else if (deviceId.includes("ipad") || deviceId.includes("galaxy-tab") || deviceId.includes("tablet")) {
      return {
        containerClass: "w-[640px] h-[850px] overflow-hidden rounded-lg border bg-white shadow",
        iframeClass: "w-full h-full overflow-y-auto",
      };
    } else {
      return {
        containerClass: "w-[960px] h-[600px] overflow-hidden rounded-lg border bg-white shadow",
        iframeClass: "w-full h-full overflow-y-auto",
      };
    }
  };

  // ---------- Conditional rendering (safe now) ----------
  if (isPaymentLoading) {
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

  if (!hasPaidPlan) {
    return (
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <DashboardHeader breadcrumbs={[{ label: t('title'), isCurrentPage: true }]} />
        <Card className="w-full mt-4">
          <CardContent className="flex flex-col justify-center items-center h-64 gap-4">
            <p className="text-muted-foreground">{t('payment-required')}</p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href={Routes.Pricing}>Upgrade Now</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={Routes.Dashboard}>Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // ---------- Main render ----------
  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <DashboardHeader
        breadcrumbs={[{ label: t('title') }, { label: file.filename, isCurrentPage: true }]}
      />

      <FilterSection
        availableEmails={availableEmails}
        onEmailsChange={handleEmailsChange}
        selectedEmails={selectedEmails}
        onDevicesChange={handleDevicesChange}
        selectedDevices={selectedDevices}
      />

      <Card className="w-full mt-4">
        <CardHeader>
          <div className="flex flex-row justify-between items-center">
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
          </div>
        </CardHeader>

        <CardContent>
          {emailHtml ? (
            <>
              {selectedDevices.length === 0 && (
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    srcDoc={emailHtml}
                    className="w-full h-[700px] border-0"
                    title="Email preview"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              )}

              {selectedDevices.length > 0 && (
                <div className="flex flex-wrap justify-center gap-8">
                  {selectedDevices.map((deviceId) => {
                    const deviceStyle = getDeviceStyle(deviceId);

                    return (
                      <div key={deviceId} className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2 mb-3 text-sm font-medium text-gray-700">
                          {getDeviceIcon(deviceId)}
                          <span className="text-xs">
                            {deviceId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>
                        <div className={deviceStyle.containerClass}>
                          <iframe
                            srcDoc={emailHtml}
                            title={`Email preview on ${deviceId}`}
                            sandbox="allow-same-origin allow-scripts"
                            className={deviceStyle.iframeClass}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
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
