import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { CookieConsent } from '@/components/layout/cookie-consent';
import type { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar scroll={true} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
