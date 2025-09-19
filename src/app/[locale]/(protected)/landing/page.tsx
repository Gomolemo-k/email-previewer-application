'use client';

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { UpgradeCard } from '@/components/dashboard/upgrade-card';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { useTranslations } from 'next-intl';

export default function LandingPage() {
  const t = useTranslations('Dashboard.landing');

  const breadcrumbs = [
    {
      label: t('title'),
      isCurrentPage: true,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <DashboardHeader breadcrumbs={breadcrumbs} />
        
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="max-w-2xl mx-auto">
                  <UpgradeCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
