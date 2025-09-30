'use client';

import { useCookieConsent } from '@/hooks/use-cookie-consent';
import Script from 'next/script';

/**
 * Clarity Analytics with Cookie Consent
 *
 * https://clarity.microsoft.com
 * https://mksaas.com/docs/analytics#clarity
 */
export default function ClarityAnalytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  const consentStatus = useCookieConsent();
  
  // Only load analytics if consent has been given
  if (consentStatus === 'accepted') {
    return (
      <Script
        id="microsoft-clarity-init"
        strategy="afterInteractive"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: `
                  (function(c,l,a,r,i,t,y){
                      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                  })(window, document, "clarity", "script", "${projectId}");
                  `,
        }}
      />
    );
  }

  // If consent is unknown or rejected, don't load analytics
  return null;
}
