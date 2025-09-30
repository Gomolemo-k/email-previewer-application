'use client';

import { useCookieConsent } from '@/hooks/use-cookie-consent';
import Script from 'next/script';

/**
 * Plausible Analytics with Cookie Consent
 *
 * NOTICE:
 * If you do not check `404 error pages` when you set up Plausible Analytics,
 * you do not need to add new script to this component.
 *
 * https://plausible.io
 * https://mksaas.com/docs/analytics#plausible
 */
export function PlausibleAnalytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN as string;
  if (!domain) {
    return null;
  }

  const script = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT as string;
  if (!script) {
    return null;
  }

  const consentStatus = useCookieConsent();
  
  // Only load analytics if consent has been given
  if (consentStatus === 'accepted') {
    return (
      <Script defer type="text/javascript" data-domain={domain} src={script} />
    );
  }

  // If consent is unknown or rejected, don't load analytics
  return null;
}
