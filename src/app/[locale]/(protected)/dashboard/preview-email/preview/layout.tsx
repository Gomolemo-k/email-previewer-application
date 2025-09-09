'use client';

import { SessionProvider } from 'next-auth/react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="space-y-6">{children}</div>
    </SessionProvider>
  );
}
