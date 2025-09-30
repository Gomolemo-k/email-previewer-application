'use client';

import { websiteConfig } from '@/config/website';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { AhrefsAnalytics } from './ahrefs-analytics';
import ClarityAnalytics from './clarity-analytics';
import DataFastAnalytics from './data-fast-analytics';
import GoogleAnalytics from './google-analytics';
import OpenPanelAnalytics from './open-panel-analytics';
import { PlausibleAnalytics } from './plausible-analytics';
import { SelineAnalytics } from './seline-analytics';
import { UmamiAnalytics } from './umami-analytics';

/**
 * Analytics Components all in one with Cookie Consent
 *
 * 1. all the analytics components only work in production
 * 2. only work if the environment variable for the analytics is set
 * 3. only work if user has given consent for cookies
 *
 * docs:
 * https://mksaas.com/docs/analytics
 */
export function Analytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const consentStatus = useCookieConsent();

  // Only load analytics if consent has been given
  if (consentStatus !== 'accepted') {
    return null;
  }

  return (
    <>
      {/* google analytics */}
      <GoogleAnalytics />

      {/* umami analytics */}
      <UmamiAnalytics />

      {/* plausible analytics */}
      <PlausibleAnalytics />

      {/* ahrefs analytics */}
      <AhrefsAnalytics />

      {/* datafast analytics */}
      <DataFastAnalytics />

      {/* openpanel analytics */}
      <OpenPanelAnalytics />

      {/* seline analytics */}
      <SelineAnalytics />

      {/* clarity analytics */}
      <ClarityAnalytics />

      {/* vercel analytics */}
      {/* https://vercel.com/docs/analytics/quickstart */}
      {websiteConfig.analytics.enableVercelAnalytics && <VercelAnalytics />}

      {/* speed insights */}
      {/* https://vercel.com/docs/speed-insights/quickstart */}
      {websiteConfig.analytics.enableSpeedInsights && <SpeedInsights />}
    </>
  );
}
