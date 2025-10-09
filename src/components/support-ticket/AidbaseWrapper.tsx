'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';


interface AidbaseWrapperProps {
  ticketFormID: string;
}

const AidbaseWrapper = ({ ticketFormID }: AidbaseWrapperProps) => {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const { data: session } = authClient.useSession();
  const t = useTranslations('Dashboard');

  // User info
  const userId = session?.user?.id || 'anonymous';
  const userEmail = session?.user?.email || 'anonymous@example.com';
  const userName = session?.user?.name || 'Anonymous User';
  const userProfileImage = session?.user?.image || '';

  useEffect(() => {
    // Check if scripts are already loaded to avoid duplicate loading
    const existingScripts = document.querySelectorAll('script[src*="aidbase"]');
    if (existingScripts.length > 0) {
      setScriptsLoaded(true);
      return;
    }

    const loadScripts = async () => {
      const scripts = [
        'https://client.aidbase.ai/create-ticket.ab.js',
        'https://client.aidbase.ai/tickets-table.ab.js'
      ];

      const loadPromises = scripts.map(src => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.async = true;
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      });

      try {
        await Promise.all(loadPromises);
        setScriptsLoaded(true);
      } catch (error) {
        console.error('Failed to load Aidbase scripts:', error);
      }
    };

    loadScripts();

    return () => {
      document.querySelectorAll('script[src*="aidbase"]').forEach(s => s.remove());
      
      // Clean up custom elements
      const createTicketEl = document.querySelector('ab-create-ticket');
      const ticketsTableEl = document.querySelector('ab-tickets-table');
      createTicketEl?.remove();
      ticketsTableEl?.remove();
    };
  }, []);

  if (!scriptsLoaded) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold">{t('support.tickets.title')}</h1>
        <p>{t('support.tickets.loading')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">{t('support.tickets.title')}</h1>

      <div className="mb-10">
        {/* @ts-ignore */}
        <ab-create-ticket
          ticketFormID={ticketFormID}
          userID={userId}
          username={userName}
          email={userEmail}
          profileImageURL={userProfileImage}
        >
          <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            {t('support.tickets.create-ticket-button')}
          </button>
        </ab-create-ticket>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">{t('support.tickets.my-tickets')}</h2>
        {/* @ts-ignore */}
        <ab-tickets-table
          ticketFormID={ticketFormID}
          userID={userId}
          username={userName}
          email={userEmail}
          profileImageURL={userProfileImage}
        ></ab-tickets-table>
      </div>
    </div>
  );
};

export default AidbaseWrapper;
