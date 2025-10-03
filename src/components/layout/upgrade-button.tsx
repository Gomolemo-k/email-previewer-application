'use client';

import { Button } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { useCurrentPlan } from '@/hooks/use-payment';
import { useMounted } from '@/hooks/use-mounted';
import { LocaleLink } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { Routes } from '@/routes';
import { RocketIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

/**
 * Upgrade Button Component
 *
 * This component displays an upgrade button only for users who don't have 
 * a paid subscription or lifetime membership, behaving like the upgrade card.
 */
export function UpgradeButton() {
  // Don't show if the upgrade card feature is disabled
  if (!websiteConfig.features.enableUpgradeCard) {
    return null;
  }

  const t = useTranslations('Navbar.upgrade');
  const mounted = useMounted();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current session
  const { data: session } = authClient.useSession();
  const { data: paymentData, isLoading: isPaymentLoading } = useCurrentPlan(session?.user?.id);

  useEffect(() => {
    // Only set isLoading to false when we have the data loaded
    if (mounted && !isPaymentLoading) {
      setIsLoading(false);
    }
  }, [mounted, isPaymentLoading]);

  // Don't show the button until we have mounted and payment data is loaded
  if (!mounted || isLoading || isPaymentLoading || !paymentData) {
    return null;
  }

  // Check using the same logic as the upgrade card
  // Don't show the upgrade button if the user has a lifetime membership or a subscription
  const isMember =
    paymentData?.currentPlan?.isLifetime || !!paymentData?.subscription;

  // If the user is a member, don't show the upgrade button
  if (isMember) {
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
        <span>{t('upgrade')}</span>
      </LocaleLink>
    </Button>
  );
}
