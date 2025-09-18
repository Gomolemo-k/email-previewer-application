'use client';

import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DataTable } from '@/components/dashboard/data-table';
import { SectionCards } from '@/components/dashboard/section-cards';
import { EmailUpload } from '@/components/dashboard/email-upload';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import data from './data.json';

/**
 * Dashboard page
 *
 * NOTICE: This is a demo page for the dashboard, no real data is used,
 * we will show real data in the future
 */
export default function DashboardPage() {
  const t = useTranslations();
  const [uploadedFiles, setUploadedFiles] = useState<{id: string, filename: string}[]>([]);

  const breadcrumbs = [
    {
      label: t('Dashboard.dashboard.title'),
      isCurrentPage: true,
    },
  ];

  const handleUploadSuccess = (fileId: string, filename: string) => {
    setUploadedFiles(prev => [...prev, { id: fileId, filename }]);
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
            {uploadedFiles.length > 0 && (
              <div className="px-4 lg:px-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-800">Recently Uploaded Files</h3>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    {uploadedFiles.map((file) => (
                      <li key={file.id} className="text-green-700">
                        {file.filename}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
}