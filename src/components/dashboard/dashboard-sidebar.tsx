'use client';

import { SidebarMain } from '@/components/dashboard/sidebar-main';
import { SidebarUser } from '@/components/dashboard/sidebar-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useSidebarLinks } from '@/config/sidebar-config';
import { LocaleLink } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { Routes } from '@/routes';
import { useTranslations } from 'next-intl';
import type * as React from 'react';
import { useEffect, useState } from 'react';
import { Logo } from '../layout/logo';
import { UpgradeCard } from './upgrade-card';
import { useCurrentPlan } from '@/hooks/use-payment';
import { websiteConfig } from '@/config/website';

/**
 * Dashboard sidebar
 */
export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;
  const { state } = useSidebar();
  const { data: paymentData, isLoading: isPaymentLoading } = useCurrentPlan(currentUser?.id);
  
  // console.log('sidebar currentUser:', currentUser);

  const sidebarLinks = useSidebarLinks();
  const filteredSidebarLinks = sidebarLinks.filter((link) => {
    if (link.authorizeOnly) {
      return link.authorizeOnly.includes(currentUser?.role || '');
    }
    // Filter out dashboard and email-preview links if user doesn't have a paid plan
    if (link.href === Routes.Dashboard || 
        link.href === `${Routes.Dashboard}#email-preview`) {
      // Check if the user has a paid plan
      const hasPaidPlan = paymentData?.currentPlan && (
        paymentData.currentPlan.isLifetime || 
        (!paymentData.currentPlan.isFree && paymentData.subscription)
      );
      return hasPaidPlan || false; // Return false if they don't have a paid plan
    }
    return true;
  });

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

  // Determine if we should show the upgrade card
  const shouldShowUpgradeCard = websiteConfig.features.enableUpgradeCard && 
    currentUser && 
    state !== 'collapsed' && 
    !isPaymentLoading && 
    paymentData && 
    !hasPaidPlan;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <LocaleLink href={Routes.Root}>
                <Logo className="size-5" />
                <span className="truncate font-semibold text-base">
                  {t('Metadata.name')}
                </span>
              </LocaleLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {!isPending && mounted && <SidebarMain items={filteredSidebarLinks} />}
      </SidebarContent>

      <SidebarFooter className="flex flex-col gap-4">
        {/* Only show UI components when not in loading state */}
        {!isPending && mounted && (
          <>
            {/* show upgrade card if user doesn't have a paid plan, and sidebar is not collapsed */}
            {shouldShowUpgradeCard && <UpgradeCard />}

            {/* show user profile if user is logged in */}
            {currentUser && <SidebarUser user={currentUser} />}
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}