'use client';

import React, { Suspense, useState } from "react";

// Fallback component
const TicketFallback = () => (
  <div className="p-4">
    <h2 className="text-lg font-semibold mb-2">Need Help?</h2>
    <button 
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      onClick={() => window.open('mailto:support@yourapp.com', '_blank')}
    >
      Contact Support
    </button>
  </div>
);

// Lazy load the component
const LazyCreateTicket = React.lazy(() => 
  import('@aidbase/create-ticket').then(module => ({
    default: module.CreateTicket
  })).catch(() => ({
    default: () => <TicketFallback />
  }))
);

export default function TicketCreator() {
  const [error, setError] = useState(false);

  if (error) {
    return <TicketFallback />;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Need Help?</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyCreateTicket
          ticketFormID="ASsL203PXKDCDwDwt1iUX"
          userID="USER-ID"
          username="John Doe"
          email="john@doe.com"
          profileImageURL="https://example.com/profile-image.png"
        >
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create Ticket
          </button>
        </LazyCreateTicket>
      </Suspense>
    </div>
  );
}