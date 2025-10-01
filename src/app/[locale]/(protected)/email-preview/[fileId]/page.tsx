'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import FilterSection from '@/components/FilterSection';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import Image from 'next/image';

interface EmailFile {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

interface DeviceOption {
  id: string;
  name: string;
  category: string;
}

const DEVICE_NAME_MAP: Record<string, string> = {
  // iPhones
  'iphone-17-pro-max': 'iPhone 17 Pro Max',
  'iphone-17-pro': 'iPhone 17 Pro',
  'iphone-17': 'iPhone 17',
  'iphone-16-pro-max': 'iPhone 16 Pro Max',
  'iphone-16-pro': 'iPhone 16 Pro',
  'iphone-16-plus': 'iPhone 16 Plus',
  'iphone-13-pro': 'iPhone 13 Pro',
  'iphone-13-pro-max': 'iPhone 13 Pro Max',
  'iphone-11-pro': 'iPhone 11 Pro',
  'iphone-11-pro-max': 'iPhone 11 Pro Max',
  'iphone-11': 'iPhone 11',
  // iPads
  'ipad-pro-13': 'iPad Pro 13-inch (2024)',
  'ipad-pro-11': 'iPad Pro 11-inch (2024)',
  'ipad-air-2025': 'iPad Air (2025)',
  'ipad-standard-2025': 'iPad (2025, Standard)',
  // Samsung Phones
  'galaxy-s25-ultra': 'Galaxy S25 Ultra',
  'galaxy-s25-plus': 'Galaxy S25+',
  'galaxy-s25-edge': 'Galaxy S25 Edge',
  'galaxy-s25-fe': 'Galaxy S25 FE',
  'galaxy-s24-ultra': 'Galaxy S24 Ultra',
  'galaxy-note-20-ultra': 'Galaxy Note 20 Ultra',
  // Samsung Tablets
  'galaxy-tab-s10-ultra': 'Galaxy Tab S10 Ultra',
  'galaxy-tab-s11-ultra': 'Galaxy Tab S11 Ultra',
  // Google Pixel Phones
  'pixel-10-pro-xl': 'Pixel 10 Pro XL',
  'pixel-10-pro': 'Pixel 10 Pro',
  'pixel-10': 'Pixel 10',
  'pixel-9-pro-xl': 'Pixel 9 Pro XL',
  'pixel-9': 'Pixel 9',
  'pixel-9a': 'Pixel 9a',
  'pixel-8-pro': 'Pixel 8 Pro',
  'pixel-7a': 'Pixel 7a',
  // Google Pixel Fold
  'pixel-9-pro-fold': 'Pixel 9 Pro Fold',
  // MacBooks
  'macbook-air-13-m4': 'MacBook Air 13" (M4)',
  'macbook-air-15-m4': 'MacBook Air 15" (M4)',
  'macbook-pro-14-m4': 'MacBook Pro 14" (M4)',
  'macbook-pro-16-m4': 'MacBook Pro 16" (M4)',
  // Samsung Laptops
  'galaxy-book4-13': 'Samsung Galaxy Book4 13"',
  'galaxy-book4-15': 'Samsung Galaxy Book4 15"',
  // iMacs
  'imac-24-m3': 'iMac 24" (M3)',
  'imac-24-m4': 'iMac 24" (M4)',
  // Apple Displays
  'apple-studio-display': 'Apple Studio Display',
  'apple-pro-display-xdr': 'Apple Pro Display XDR',
  // Samsung Displays
  'samsung-all-in-one-pro': 'Samsung All-in-One Pro PC',
  'samsung-m5-flat-fhd': 'Samsung M5 Flat FHD Smart Monitor',
  'samsung-odyssey-g9': 'Samsung Odyssey G9 Curved Gaming Monitor',
};

// Mapping from device ID to image filename
function getDeviceImageSrc(deviceId: string): string {
  const deviceImageMap: Record<string, string> = {
    'iphone-17-pro-max': '/devices/images/iPhone 17 Pro Max.png',
    'iphone-17-pro': '/devices/images/iPhone 17 Pro.png',
    'iphone-17': '/devices/images/iPhone 17.png',
    'iphone-16-pro-max': '/devices/images/iPhone 16 Pro Max.png',
    'iphone-16-pro': '/devices/images/iPhone 16 Pro.png',
    'iphone-16-plus': '/devices/images/iPhone 16 Plus.png',
    'iphone-13-pro': '/devices/images/iPhone 13 Pro.png',
    'iphone-13-pro-max': '/devices/images/iPhone 13 Pro Max.png',
    'iphone-11-pro': '/devices/images/iPhone 11 Pro .png',
    'iphone-11-pro-max': '/devices/images/iPhone 11 Pro Max.png',
    'iphone-11': '/devices/images/iPhone 11.png',
    'ipad-pro-13': '/devices/images/iPad Pro 13-inch (2024).png',
    'ipad-pro-11': '/devices/images/iPad Pro 11-inch (2024).png',
    'ipad-air-2025': '/devices/images/iPad Air (2025).png',
    'ipad-standard-2025': '/devices/images/iPad (2025, Standard).png',
    'galaxy-s25-ultra': '/devices/images/Galaxy S25 Ultra .png',
    'galaxy-s25-plus': '/devices/images/Galaxy S25+.png',
    'galaxy-s25-edge': '/devices/images/Galaxy S25 Edge.png',
    'galaxy-s25-fe': '/devices/images/Galaxy S25 FE.png',
    'galaxy-s24-ultra': '/devices/images/Galaxy S24 Ultra .png',
    'galaxy-note-20-ultra': '/devices/images/Galaxy Note 20 Ultra.png',
    'galaxy-tab-s10-ultra': '/devices/images/Galaxy Tab S10 Ultra.png',
    'galaxy-tab-s11-ultra': '/devices/images/Galaxy Tab S11 Ultra.png',
    'pixel-10-pro-xl': '/devices/images/Pixel 10 Pro XL.png',
    'pixel-10-pro': '/devices/images/Pixel 10 Pro.png',
    'pixel-10': '/devices/images/Pixel 10.png',
    'pixel-9-pro-xl': '/devices/images/Pixel 9 Pro.png',
    'pixel-9': '/devices/images/Pixel 9.png',
    'pixel-9a': '/devices/images/Pixel 9a.png',
    'pixel-8-pro': '/devices/images/Pixel 8 Pro.png',
    'pixel-7a': '/devices/images/Pixel 7a.png',
    'macbook-air-13-m4': '/devices/images/MacBook Air 13" (M4).png',
    'macbook-air-15-m4': '/devices/images/MacBook Air 15" (M4).png',
    'macbook-pro-14-m4': '/devices/images/MacBook Pro 14" (M4).png',
    'macbook-pro-16-m4': '/devices/images/MacBook Pro 16" (M4).png',
    'galaxy-book4-13': '/devices/images/Galaxy Book4 13".png',
    'galaxy-book4-15': '/devices/images/Galaxy Book4 15".png',
    'imac-24-m3': '/devices/images/iMac 24" (M3).png',
    'imac-24-m4': '/devices/images/iMac 24" (M4).png',
    'apple-studio-display': '/devices/images/Apple Studio Display.png',
    'apple-pro-display-xdr': '/devices/images/Apple Pro Display XDR.png',
    'samsung-all-in-one-pro': '/devices/images/Samsung All-in-One Pro PC.png',
    'samsung-m5-flat-fhd': '/devices/images/Samsung M5 Flat FHD Smart Monitor.png',
    'samsung-odyssey-g9': '/devices/images/Samsung Odyssey G9 Curved Gaming Monitor.png',
  };

  return deviceImageMap[deviceId] || '/devices/images/placeholder.png';
}

export default function EmailPreviewPage({ params }: { params: { fileId: string } }) {
  const t = useTranslations('Dashboard.email-preview');
  const router = useRouter();
  const [file, setFile] = useState<EmailFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const [selectedEmails, setSelectedEmails] = useState<string[]>([params.fileId]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [availableEmails, setAvailableEmails] = useState<EmailFile[]>([]);

  const deviceOptions: DeviceOption[] = [
    // iPhones
    { id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', category: 'iPhone' },
    { id: 'iphone-17-pro', name: 'iPhone 17 Pro', category: 'iPhone' },
    { id: 'iphone-17', name: 'iPhone 17', category: 'iPhone' },
    { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', category: 'iPhone' },
    { id: 'iphone-16-pro', name: 'iPhone 16 Pro', category: 'iPhone' },
    { id: 'iphone-16-plus', name: 'iPhone 16 Plus', category: 'iPhone' },
    { id: 'iphone-13-pro', name: 'iPhone 13 Pro', category: 'iPhone' },
    { id: 'iphone-13-pro-max', name: 'iPhone 13 Pro Max', category: 'iPhone' },
    { id: 'iphone-11-pro', name: 'iPhone 11 Pro', category: 'iPhone' },
    { id: 'iphone-11-pro-max', name: 'iPhone 11 Pro Max', category: 'iPhone' },
    { id: 'iphone-11', name: 'iPhone 11', category: 'iPhone' },
    // iPads
    { id: 'ipad-pro-13', name: 'iPad Pro 13-inch (2024)', category: 'iPad' },
    { id: 'ipad-pro-11', name: 'iPad Pro 11-inch (2024)', category: 'iPad' },
    { id: 'ipad-air-2025', name: 'iPad Air (2025)', category: 'iPad' },
    { id: 'ipad-standard-2025', name: 'iPad (2025, Standard)', category: 'iPad' },
    // Samsung Phones
    { id: 'galaxy-s25-ultra', name: 'Galaxy S25 Ultra', category: 'Samsung Phone' },
    { id: 'galaxy-s25-plus', name: 'Galaxy S25+', category: 'Samsung Phone' },
    { id: 'galaxy-s25-edge', name: 'Galaxy S25 Edge', category: 'Samsung Phone' },
    { id: 'galaxy-s25-fe', name: 'Galaxy S25 FE', category: 'Samsung Phone' },
    { id: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', category: 'Samsung Phone' },
    { id: 'galaxy-note-20-ultra', name: 'Galaxy Note 20 Ultra', category: 'Samsung Phone' },
    // Samsung Tablets
    { id: 'galaxy-tab-s10-ultra', name: 'Galaxy Tab S10 Ultra', category: 'Samsung Tablet' },
    { id: 'galaxy-tab-s11-ultra', name: 'Galaxy Tab S11 Ultra', category: 'Samsung Tablet' },
    // Google Pixel Phones
    { id: 'pixel-10-pro-xl', name: 'Pixel 10 Pro XL', category: 'Google Pixel' },
    { id: 'pixel-10-pro', name: 'Pixel 10 Pro', category: 'Google Pixel' },
    { id: 'pixel-10', name: 'Pixel 10', category: 'Google Pixel' },
    { id: 'pixel-9-pro-xl', name: 'Pixel 9 Pro XL', category: 'Google Pixel' },
    { id: 'pixel-9', name: 'Pixel 9', category: 'Google Pixel' },
    { id: 'pixel-9a', name: 'Pixel 9a', category: 'Google Pixel' },
    { id: 'pixel-8-pro', name: 'Pixel 8 Pro', category: 'Google Pixel' },
    { id: 'pixel-7a', name: 'Pixel 7a', category: 'Google Pixel' },
    // Google Pixel Fold
    { id: 'pixel-9-pro-fold', name: 'Pixel 9 Pro Fold', category: 'Google Pixel Fold' },
    // MacBooks
    { id: 'macbook-air-13-m4', name: 'MacBook Air 13" (M4)', category: 'MacBook' },
    { id: 'macbook-air-15-m4', name: 'MacBook Air 15" (M4)', category: 'MacBook' },
    { id: 'macbook-pro-14-m4', name: 'MacBook Pro 14" (M4)', category: 'MacBook' },
    { id: 'macbook-pro-16-m4', name: 'MacBook Pro 16" (M4)', category: 'MacBook' },
    // Samsung Laptops
    { id: 'galaxy-book4-13', name: 'Samsung Galaxy Book4 13"', category: 'Samsung Laptop' },
    { id: 'galaxy-book4-15', name: 'Samsung Galaxy Book4 15"', category: 'Samsung Laptop' },
    // iMacs
    { id: 'imac-24-m3', name: 'iMac 24" (M3)', category: 'iMac' },
    { id: 'imac-24-m4', name: 'iMac 24" (M4)', category: 'iMac' },
    // Apple Displays
    { id: 'apple-studio-display', name: 'Apple Studio Display', category: 'Apple Display' },
    { id: 'apple-pro-display-xdr', name: 'Apple Pro Display XDR', category: 'Apple Display' },
    // Samsung Displays
    { id: 'samsung-all-in-one-pro', name: 'Samsung All-in-One Pro PC', category: 'Samsung Display' },
    { id: 'samsung-m5-flat-fhd', name: 'Samsung M5 Flat FHD Smart Monitor', category: 'Samsung Display' },
    { id: 'samsung-odyssey-g9', name: 'Samsung Odyssey G9 Curved Gaming Monitor', category: 'Samsung Display' },
  ];

  const sortedDeviceOptions = deviceOptions.sort((a, b) => {
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    return a.name.localeCompare(b.name);
  });

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

      setAvailableEmails(result.files);

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

  const handleEmailsChange = (emails: string[]) => setSelectedEmails(emails);
  const handleDevicesChange = (devices: string[]) => setSelectedDevices(devices);

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
        <DashboardHeader
          breadcrumbs={[{ label: t('title'), isCurrentPage: true }]}
        />
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
        <DashboardHeader
          breadcrumbs={[{ label: t('title'), isCurrentPage: true }]}
        />
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
          { label: file.filename, isCurrentPage: true },
        ]}
      />

      <FilterSection 
        availableEmails={availableEmails}
        onEmailsChange={handleEmailsChange}
        onDevicesChange={handleDevicesChange}
        selectedEmails={selectedEmails}
        selectedDevices={selectedDevices}
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
          {fileContent ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {selectedDevices.length > 0 ? (
                  selectedDevices.map((deviceId) => {
                    const device = deviceOptions.find(d => d.id === deviceId);
                    if (!device) return null;
                    const deviceDisplayName = DEVICE_NAME_MAP[deviceId] || device.name;

                    return (
                      <div key={deviceId} className="flex flex-col items-center justify-center">
                        <div className="text-sm font-medium mb-2 text-center px-2 text-muted-foreground">
                          {device.name}
                        </div>
                        <div className="relative w-full max-w-[300px] h-auto min-h-[400px]">
                          <Image
                            src={getDeviceImageSrc(deviceId)}
                            alt={device.name}
                            width={300}
                            height={500}
                            className="w-full h-auto object-contain"
                            unoptimized // Since these are static assets
                          />
                          <div className={`
                            absolute overflow-hidden rounded-sm bg-white
                            ${deviceId.includes('iphone') ? 'top-[14%] left-[8%] right-[8%] bottom-[16%]' : ''}
                            ${deviceId.includes('ipad') ? 'top-[10%] left-[6%] right-[6%] bottom-[10%]' : ''}
                            ${deviceId.includes('galaxy-s') ? 'top-[12%] left-[7%] right-[7%] bottom-[13%]' : ''}
                            ${deviceId.includes('galaxy-tab') ? 'top-[9%] left-[5%] right-[5%] bottom-[9%]' : ''}
                            ${deviceId.includes('pixel') && !deviceId.includes('fold') ? 'top-[13%] left-[7%] right-[7%] bottom-[14%]' : ''}
                            ${deviceId.includes('macbook') ? 'top-[16%] left-[11%] right-[11%] bottom-[20%]' : ''}
                            ${deviceId.includes('imac') ? 'top-[8%] left-[5%] right-[5%] bottom-[12%]' : ''}
                            ${deviceId.includes('display') || deviceId.includes('monitor') ? 'top-[7%] left-[4%] right-[4%] bottom-[10%]' : ''}
                            ${deviceId.includes('book') ? 'top-[15%] left-[9%] right-[9%] bottom-[18%]' : ''}
                          `}>
                            {file.fileType === 'html' ? (
                              <iframe
                                srcDoc={fileContent}
                                title={`${device.name} Preview`}
                                className="w-full h-full"
                                sandbox="allow-same-origin allow-scripts" // Security: limit iframe capabilities
                                style={{ border: 'none' }}
                              />
                            ) : (
                              <pre className="w-full h-full p-2 overflow-auto whitespace-pre-wrap text-xs">
                                {fileContent}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    {t('select-devices-to-preview') || 'Select devices to preview'}
                  </div>
                )}
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
