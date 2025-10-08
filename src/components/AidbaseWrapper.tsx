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
    const loadScripts = async () => {
      // Create ticket script
      const createTicketScript = document.createElement('script');
      createTicketScript.async = true;
      createTicketScript.src = 'https://client.aidbase.ai/create-ticket.ab.js';
      document.body.appendChild(createTicketScript);

      // Tickets table script
      const ticketsTableScript = document.createElement('script');
      ticketsTableScript.async = true;
      ticketsTableScript.src = 'https://client.aidbase.ai/tickets-table.ab.js';
      document.body.appendChild(ticketsTableScript);

      // Wait a bit for scripts to load
      createTicketScript.onload = ticketsTableScript.onload = () => {
        setScriptsLoaded(true);
      };
    };

    loadScripts();

    return () => {
      // Cleanup scripts
      document.querySelectorAll('script[src*="aidbase"]').forEach(s => s.remove());
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
