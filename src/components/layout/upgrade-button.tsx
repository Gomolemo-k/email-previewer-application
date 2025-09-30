'use client';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMounted } from '@/hooks/use-mounted';
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { RocketIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

/**
 * Upgrade Button Component
 *
 * This component displays an upgrade button for all users.
 * It will always be visible in the dashboard header.
 */
export function UpgradeButton() {
  const t = useTranslations('Navbar.upgrade');
  const mounted = useMounted();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user
  const session = useCurrentUser();
  const userId =
  useEffect(() => {
    // Only set isLoading to false when we have the data
    if (mounted) {
      setIsLoading(false);
    }
  }, [mounted]);

  // Don't show the button until we have mounted
  if (!mounted || isLoading) {
    return null;
  }

  // Always show the upgrade button for all users
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
