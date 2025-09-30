'use client';

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'cookie-consent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consentStatus = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consentStatus) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
    // Dispatch an event to notify analytics components
    window.dispatchEvent(new CustomEvent('cookieConsent', { detail: { accepted: true } }));
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setIsVisible(false);
    // Dispatch an event to notify analytics components
    window.dispatchEvent(new CustomEvent('cookieConsent', { detail: { accepted: false } }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto shadow-lg rounded-lg border bg-background p-4 md:p-6 backdrop-blur-sm bg-background/90">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg mb-1">We use cookies</h3>
          <p className="text-sm text-muted-foreground">
            We use cookies to enhance your experience, analyze traffic, and personalize content. 
            Your data is stored locally and never shared with third-parties without your consent.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReject}
            className="border border-input hover:bg-accent hover:text-accent-foreground"
          >
            Reject
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleAccept}
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}