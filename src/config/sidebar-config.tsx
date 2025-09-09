'use client';

import { isDemoWebsite } from '@/lib/demo';
import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import {
  BellIcon,
  CircleUserRoundIcon,
  CoinsIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  Settings2Icon,
  SettingsIcon,
  UsersRoundIcon,
  FileTextIcon,
  LayersIcon,
  BoxIcon,
  ServerIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';

/**
 * Get sidebar config with translations
 *
 * NOTICE: used in client components only
 */
export function getSidebarLinks(): NestedMenuItem[] {
  const t = useTranslations('Dashboard');
  const isDemo = isDemoWebsite();

  return [
    {
      title: t('dashboard.title'),
      icon: <LayoutDashboardIcon className="size-4 shrink-0" />,
      href: Routes.Dashboard,
      external: false,
      items: [
        {
          title: t('dashboard.emailPreview.dashboard.title'),
          icon: <LayoutDashboardIcon className="size-4 shrink-0" />,
          href: Routes.DashboardEmailPreviewDashboard,
          external: false,
        },
        {
          title: ('dashboard.emailPreview.components.title'),
          icon: <LayersIcon className="size-4 shrink-0" />,
          href: Routes.DashboardEmailPreviewComponents,
          external: false,
        },
        {
          title: ('dashboard.emailPreview.preview.title'),
          icon: <BoxIcon className="size-4 shrink-0" />,
          href: Routes.DashboardEmailPreviewPreview,
          external: false,
        },
        {
          title: ('dashboard.emailPreview.services.title'),
          icon: <ServerIcon className="size-4 shrink-0" />,
          href: Routes.DashboardEmailPreviewServices,
          external: false,
        },
      ],
    },
    {
      title: t('admin.title'),
      icon: <SettingsIcon className="size-4 shrink-0" />,
      authorizeOnly: isDemo ? ['admin', 'user'] : ['admin'],
      items: [
        {
          title: t('admin.users.title'),
          icon: <UsersRoundIcon className="size-4 shrink-0" />,
          href: Routes.AdminUsers,
          external: false,
        },
      ],
    },
    {
      title: t('settings.title'),
      icon: <Settings2Icon className="size-4 shrink-0" />,
      items: [
        {
          title: t('settings.profile.title'),
          icon: <CircleUserRoundIcon className="size-4 shrink-0" />,
          href: Routes.SettingsProfile,
          external: false,
        },
        {
          title: t('settings.billing.title'),
          icon: <CreditCardIcon className="size-4 shrink-0" />,
          href: Routes.SettingsBilling,
          external: false,
        },
        ...(websiteConfig.credits.enableCredits
          ? [
              {
                title: t('settings.credits.title'),
                icon: <CoinsIcon className="size-4 shrink-0" />,
                href: Routes.SettingsCredits,
                external: false,
              },
            ]
          : []),
        {
          title: t('settings.security.title'),
          icon: <LockKeyholeIcon className="size-4 shrink-0" />,
          href: Routes.SettingsSecurity,
          external: false,
        },
        {
          title: t('settings.notification.title'),
          icon: <BellIcon className="size-4 shrink-0" />,
          href: Routes.SettingsNotifications,
          external: false,
        },
      ],
    },
  ];
}
