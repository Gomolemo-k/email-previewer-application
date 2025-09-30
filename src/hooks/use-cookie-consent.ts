'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to check if user has given consent for analytics cookies
 */
export function useCookieConsent() {
  const [consentStatus, setConsentStatus] = useState<'unknown' | 'accepted' | 'rejected'>('unknown');

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie-consent') as 'accepted' | 'rejected' | null;
    
    if (storedConsent) {
      setConsentStatus(storedConsent);
    } else {
      setConsentStatus('unknown');
    }

    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ accepted: boolean }>;
      setConsentStatus(customEvent.detail.accepted ? 'accepted' : 'rejected');
    };

    window.addEventListener('cookieConsent', handleConsentChange as EventListener);

    return () => {
      window.removeEventListener('cookieConsent', handleConsentChange as EventListener);
    };
  }, []);

  return consentStatus;
}