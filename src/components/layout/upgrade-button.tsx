'use client';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMounted } from '@/hooks/use-mounted';
import { useCurrentPlan } from '@/hooks/use-payment';
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { RocketIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

/**
 * Upgrade Button Component
 *
 * This component displays an upgrade button for users who are on free plans.
 * It uses the useCurrentPlan hook to determine if the user has a paid plan.
 * If the user is on a free plan, the button is displayed.
 * If the user is on a paid plan, the button is hidden.
 */
export function UpgradeButton() {
  const t = useTranslations('Navbar.upgrade');
  const mounted = useMounted();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user
  const { data: session } = useCurrentUser();
  const userId = session?.user?.id;

  // Get current plan data
  const { data: paymentData, isLoading: isLoadingPayment } = useCurrentPlan(userId);

  useEffect(() => {
    // Only set isLoading to false when we have the data
    if (mounted && !isLoadingPayment) {
      setIsLoading(false);
    }
  }, [mounted, isLoadingPayment]);

  // Don't show the button until we have the data
  if (!mounted || isLoading || isLoadingPayment || !paymentData) {
    return null;
  }

  // Check if the current plan is a free plan
  const isFreePlan = paymentData?.currentPlan?.isFree || false;
  
  // For debugging - always show the button with different styling based on plan
  // Remove this in production
  if (process.env.NODE_ENV === 'development') {
    return (
      <Button
        variant={isFreePlan ? "default" : "secondary"}
        size="sm"
        className="h-8 gap-2 px-3 text-sm font-medium cursor-pointer"
        asChild
      >
        <LocaleLink href={`${Routes.SettingsBilling}?callback=${Routes.Dashboard}`}>
          <RocketIcon className="h-4 w-4" />
          <span className="hidden md:inline">
            {isFreePlan ? t('upgrade') : `Plan: ${paymentData?.currentPlan?.id || 'Unknown'}`}
          </span>
          <span className="inline md:hidden">
            {isFreePlan ? t('upgradeShort') : paymentData?.currentPlan?.id?.charAt(0) || 'U'}
          </span>
        </LocaleLink>
      </Button>
    );
  }
  
  // Only show the upgrade button for users on free plans
  if (!isFreePlan) {
    return null;
  }

  return (
    <Button
      variant="default"
      size="sm"
      className="h-8 gap-2 px-3 text-sm font-medium cursor-pointer"
      asChild
    >
      <LocaleLink href={`${Routes.SettingsBilling}?callback=${Routes.Dashboard}`}>
        <RocketIcon className="h-4 w-4" />
        <span className="hidden md:inline">{t('upgrade')}</span>
        <span className="inline md:hidden">{t('upgradeShort')}</span>
      </LocaleLink>
    </Button>
  );
}
