'use client'

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Routes } from '@/routes';

export default function PaymentRequiredPage() {
  const t = useTranslations('Dashboard.paymentRequired');

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
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle>{t('title')}</CardTitle>
                      <CardDescription>{t('description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                      <p className="text-center text-muted-foreground">{t('message')}</p>
                      <div className="flex gap-4">
                        <Button asChild>
                          <Link href={Routes.Payment}>{t('upgradeNow')}</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={Routes.Dashboard}>{t('backToDashboard')}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}