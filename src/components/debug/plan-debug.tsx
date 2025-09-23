'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useCurrentPlan } from '@/hooks/use-payment';
import { useEffect } from 'react';

export function PlanDebug() {
  const { data: session } = useCurrentUser();
  const userId = session?.user?.id;
  const { data: paymentData, isLoading, error } = useCurrentPlan(userId);

  useEffect(() => {
    if (paymentData) {
      console.log('Current plan data:', paymentData);
    }
    if (error) {
      console.error('Error fetching plan data:', error);
    }
  }, [paymentData, error]);

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Loading plan info...</div>;
  }

  if (error) {
    return <div className="text-xs text-red-500">Error: {error.message}</div>;
  }

  if (!paymentData) {
    return <div className="text-xs text-muted-foreground">No plan data available</div>;
  }

  const isFreePlan = paymentData?.currentPlan?.isFree || false;
  const planId = paymentData?.currentPlan?.id || 'unknown';

  return (
    <div className="text-xs text-muted-foreground">
      Plan: {planId} ({isFreePlan ? 'Free' : 'Paid'})
    </div>
  );
}