'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

// Dynamically import the AidbaseWrapper with SSR disabled
const AidbaseWrapper = dynamic(() => import('@/components/AidbaseWrapper'), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Loading...</h1>
    </div>
  )
});

export default function TicketsPage() {
  const t = useTranslations('Dashboard');

  const breadcrumbs = [
    {
      label: t('support.tickets.title'),
      isCurrentPage: true,
    },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Suspense fallback={
              <div className="container mx-auto py-10">
                <h1 className="mb-8 text-3xl font-bold">{t('support.tickets.title')}</h1>
                <p>Loading support tickets...</p>
              </div>
            }>
              <AidbaseWrapper ticketFormID="ASsL203PXKDCDwDwt1iUX" />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}