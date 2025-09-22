'use client'

import { useEffect, useState } from 'react';

type PaymentRecord = {
  id: string;
  priceId: string;
  type: string;
  status: string;
  paid: boolean;
  periodStart: Date | null;
  periodEnd: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  createdAt: Date;
};

type DebugResponse = {
  hasPaid: boolean;
  userId?: string;
  paymentRecords?: PaymentRecord[];
  debug?: string;
  error?: string;
};

export default function DebugPaymentPage() {
  const [debugInfo, setDebugInfo] = useState<DebugResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/debug-payment-status');
        const data: DebugResponse = await response.json();
        setDebugInfo(data);
      } catch (error) {
        console.error('Error fetching debug info:', error);
        setDebugInfo({ hasPaid: false, error: 'Failed to fetch debug info' });
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!debugInfo) {
    return <div className="p-8">No data available</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment Status Debug Info</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p><strong>Has Paid:</strong> {debugInfo.hasPaid ? 'Yes' : 'No'}</p>
        {debugInfo.userId && <p><strong>User ID:</strong> {debugInfo.userId}</p>}
        {debugInfo.debug && <p><strong>Debug:</strong> {debugInfo.debug}</p>}
        {debugInfo.error && <p className="text-red-500"><strong>Error:</strong> {debugInfo.error}</p>}
      </div>

      {debugInfo.paymentRecords && debugInfo.paymentRecords.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Paid</th>
                  <th className="py-2 px-4 text-left">Created At</th>
                  <th className="py-2 px-4 text-left">Period End</th>
                </tr>
              </thead>
              <tbody>
                {debugInfo.paymentRecords.map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="py-2 px-4 text-sm">{record.id.substring(0, 8)}...</td>
                    <td className="py-2 px-4 text-sm">{record.type}</td>
                    <td className="py-2 px-4 text-sm">{record.status}</td>
                    <td className="py-2 px-4 text-sm">{record.paid ? 'Yes' : 'No'}</td>
                    <td className="py-2 px-4 text-sm">{new Date(record.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4 text-sm">
                      {record.periodEnd ? new Date(record.periodEnd).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}