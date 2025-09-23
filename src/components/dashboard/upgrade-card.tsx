'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { websiteConfig } from '@/config/website';
import { useCurrentPlan } from '@/hooks/use-payment';
import { LocaleLink } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { Routes } from '@/routes';
import { SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export function UpgradeCard() {
  if (!websiteConfig.features.enableUpgradeCard) {
    return null;
  }

  const t = useTranslations('Dashboard.upgrade');
  const [mounted, setMounted] = useState(false);
  const { data: session } = authClient.useSession();
  const { data: paymentData, isLoading } = useCurrentPlan(session?.user?.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if the user has a paid plan (Pro or Lifetime)
  // A user is considered to have a paid plan if:
  // 1. They have a lifetime plan (isLifetime = true), or
  // 2. They have a subscription to a non-free plan (isFree = false)
  const hasPaidPlan = paymentData?.currentPlan && (
    paymentData.currentPlan.isLifetime || 
    (!paymentData.currentPlan.isFree && paymentData.subscription)
  );

  // Ensure the upgrade card is only shown when the data is loaded
  if (!mounted || isLoading || !paymentData) {
    return null;
  }

  // If the user has a paid plan, don't show the upgrade card
  if (hasPaidPlan) {
    return null;
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="size-4" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="cursor-pointer w-full shadow-none" size="sm" asChild>
          <LocaleLink href={`${Routes.SettingsBilling}?callback=${Routes.Dashboard}`}>
            {t('button')}
          </LocaleLink>
        </Button>
      </CardContent>
    </Card>
  );
}
