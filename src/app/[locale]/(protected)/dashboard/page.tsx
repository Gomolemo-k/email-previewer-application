'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EmailUpload } from '@/components/dashboard/email-upload';
import { EmailFileTable } from '@/components/dashboard/email-file-table';
import { useTranslations } from 'next-intl';

/**
 * Dashboard page
 *
 * NOTICE: This is a demo page for the dashboard, no real data is used,
 * we will show real data in the future
 */
export default function DashboardPage() {
  const t = useTranslations();

  const breadcrumbs = [
    {
      label: t('Dashboard.dashboard.title'),
      isCurrentPage: true,
    },
  ];

  const handleUploadSuccess = () => {
    // Refresh the file table after upload
    const event = new CustomEvent('fileUploaded');
    window.dispatchEvent(event);
  };

  return (  
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <EmailUpload onUploadSuccess={handleUploadSuccess} />
            </div>
            
            {/* Show email file table */}
            <div className="px-4 lg:px-6">
              <EmailFileTable />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}