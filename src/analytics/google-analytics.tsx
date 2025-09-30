'use client';

import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';

/**
 * Google Analytics with Cookie Consent
 *
 * https://analytics.google.com
 * https://mksaas.com/docs/analytics#google
 * https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics
 */
export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  if (!analyticsId) {
    return null;
  }

  const consentStatus = useCookieConsent();
  
  // Only load analytics if consent has been given
  if (consentStatus === 'accepted') {
    return <NextGoogleAnalytics gaId={analyticsId} />;
  }

  // If consent is unknown or rejected, don't load analytics
  return null;
}