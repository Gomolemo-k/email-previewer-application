'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Monitor, Smartphone, Tablet, Laptop, SmartphoneIcon } from 'lucide-react';

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

interface FilterSectionProps {
  availableEmails: EmailFile[];
  onEmailsChange: (emails: string[]) => void;
  onDevicesChange: (devices: string[]) => void;
  selectedEmails: string[];
  selectedDevices: string[];
}

/* --- Collapsible wrapper --- */
function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (isOpen && ref.current) {
      setMaxHeight(`${ref.current.scrollHeight}px`);
    } else {
      setMaxHeight('0px');
    }
  }, [isOpen, children]);

  return (
    <div className="border rounded-md w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-medium"
        >
          {title}
          <span className={`transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}>▾</span>
        </button>
        {isOpen && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Close"
            className="text-sm px-2 hover:bg-muted rounded"
          >
            ×
          </button>
        )}
      </div>

      <div
        ref={ref}
        style={{ maxHeight, overflow: 'hidden', transition: 'max-height 250ms ease' }}
        aria-hidden={!isOpen}
      >
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}

export default function FilterSection({
  availableEmails,
  onEmailsChange,
  onDevicesChange,
  selectedEmails,
  selectedDevices,
}: FilterSectionProps) {
  const t = useTranslations('Dashboard.email-preview');

  const [emailsOpen, setEmailsOpen] = useState(true);
  const [devicesOpen, setDevicesOpen] = useState(true);

  /* --- Full device list --- */
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

  const sortedDeviceOptions = [...deviceOptions].sort((a, b) =>
    a.category === b.category ? a.name.localeCompare(b.name) : a.category.localeCompare(b.category),
  );
  const devicesByCategory = sortedDeviceOptions.reduce<Record<string, DeviceOption[]>>((acc, d) => {
    if (!acc[d.category]) acc[d.category] = [];
    acc[d.category].push(d);
    return acc;
  }, {});

  const toggleSelection = (current: string[], id: string) =>
    current.includes(id) ? current.filter((v) => v !== id) : [...current, id];

  const onEmailCheckboxChange = (id: string) => onEmailsChange(toggleSelection(selectedEmails, id));
  const onDeviceCheckboxChange = (id: string) => onDevicesChange(toggleSelection(selectedDevices, id));
  const removeEmail = (id: string) => onEmailsChange(selectedEmails.filter((s) => s !== id));
  const removeDevice = (id: string) => onDevicesChange(selectedDevices.filter((s) => s !== id));

  // Function to get the appropriate icon for a device category
  const getDeviceIcon = (category: string) => {
    if (category.includes('Phone') || category === 'iPhone') {
      return <Smartphone className="size-4" />;
    } else if (category.includes('iPad') || category.includes('Tablet')) {
      return <Tablet className="size-4" />;
    } else if (category.includes('MacBook') || category.includes('Laptop')) {
      return <Laptop className="size-4" />;
    } else {
      return <Monitor className="size-4" />;
    }
  };

  return (
    <Card className="w-full mb-6">
      {/* Flex row instead of stacked */}
      <CardContent className="p-4 flex flex-col md:flex-row gap-6">
        {/* Emails Section */}
        <div className="flex-1">
          <CollapsibleSection
            title={t('select-emails')}
            isOpen={emailsOpen}
            onToggle={() => setEmailsOpen((o) => !o)}
          >
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedEmails.length === 0 ? (
                <div className="text-sm text-muted-foreground">{t('no-emails-selected')}</div>
              ) : (
                selectedEmails.map((id) => {
                  const email = availableEmails.find((e) => e.id === id);
                  return (
                    <div
                      key={id}
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-full border bg-muted text-sm"
                    >
                      <span>{email ? email.filename : id}</span>
                      <button
                        onClick={() => removeEmail(id)}
                        className="ml-1 text-xs font-bold leading-none"
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
              {availableEmails.length === 0 ? (
                <div className="text-sm text-muted-foreground">{t('no-available-emails')}</div>
              ) : (
                availableEmails.map((email) => (
                  <label key={email.id} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email.id)}
                      onChange={() => onEmailCheckboxChange(email.id)}
                      className="form-checkbox h-4 w-4"
                    />
                    <span className="text-sm">{email.filename}</span>
                  </label>
                ))
              )}
            </div>
          </CollapsibleSection>
        </div>

        {/* Devices Section */}
        <div className="flex-1">
          <CollapsibleSection
            title={t('select-devices')}
            isOpen={devicesOpen}
            onToggle={() => setDevicesOpen((o) => !o)}
          >
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedDevices.length === 0 ? (
                <div className="text-sm text-muted-foreground">{t('no-devices-selected')}</div>
              ) : (
                selectedDevices.map((id) => {
                  const device = deviceOptions.find((d) => d.id === id);
                  return (
                    <div
                      key={id}
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-full border bg-muted text-sm"
                    >
                      {device ? getDeviceIcon(device.category) : <Monitor className="size-4" />}
                      <span>{device ? device.name : id}</span>
                      <button
                        onClick={() => removeDevice(id)}
                        className="ml-1 text-xs font-bold leading-none"
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border rounded-md p-2 max-h-48 overflow-y-auto space-y-3">
              {Object.entries(devicesByCategory).map(([category, devices]) => (
                <div key={category}>
                  <div className="text-xs font-semibold mb-1">{category}</div>
                  <div className="grid grid-cols-1 gap-1">
                    {devices.map((device) => (
                      <label key={device.id} className="flex items-center gap-2 py-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDevices.includes(device.id)}
                          onChange={() => onDeviceCheckboxChange(device.id)}
                          className="form-checkbox h-4 w-4"
                        />
                        <span className="text-sm">{device.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      </CardContent>
    </Card>
  );
}
