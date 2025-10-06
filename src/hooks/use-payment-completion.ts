import { checkPaymentCompletionAction } from '@/actions/check-payment-completion';
import { verifyPaymentAction } from '@/actions/verify-payment';
import { PAYMENT_POLL_INTERVAL } from '@/lib/constants';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// Query keys for payment completion
export const paymentCompletionKeys = {
  all: ['paymentCompletion'] as const,
  session: (sessionId: string) =>
    [...paymentCompletionKeys.all, 'session', sessionId] as const,
};

// Hook to check if payment is completed by session ID
export function usePaymentCompletion(
  sessionId: string | null,
  enablePolling = false
) {
  const retryCount = useRef(0);
  
  const query = useQuery({
    queryKey: paymentCompletionKeys.session(sessionId || ''),
    queryFn: async () => {
      if (!sessionId) {
        return {
          isPaid: false,
        };
      }
      console.log('>>> Check payment completion');
      const result = await checkPaymentCompletionAction({ sessionId });
      
      // Instead of throwing an error when the action fails, we treat it as "not paid yet"
      // This prevents the query from going into an error state and allows polling to continue
      if (!result?.data?.success) {
        console.log('<<< Check payment failed, treating as not paid yet:', result?.data?.error);
        // Don't throw an error, just return isPaid: false to continue polling
        return {
          isPaid: false,
        };
      }

      const { isPaid } = result.data;
      console.log('<<< Check payment completion success:', isPaid);

      // If payment is not paid and we haven't retried too many times, try to verify with Stripe directly
      if (!isPaid && retryCount.current < 3) {
        retryCount.current++;
        console.log('Payment not paid, trying to verify with Stripe directly, attempt:', retryCount.current);
        const verifyResult = await verifyPaymentAction({ sessionId });
        if (verifyResult?.data?.success && verifyResult.data.isPaid) {
          console.log('Payment verified with Stripe directly');
          return {
            isPaid: true,
          };
        }
      }

      return {
        isPaid,
      };
    },
    enabled: !!sessionId,
    refetchInterval: enablePolling ? PAYMENT_POLL_INTERVAL : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Retry configuration to prevent infinite retries on permanent errors
    retry: 3,
    retryDelay: 1000, // 1 second delay between retries
  });
  
  // Reset retry count when sessionId changes
  useEffect(() => {
    retryCount.current = 0;
  }, [sessionId]);

  return query;
}

// Function to invalidate all payment-related queries
export function invalidatePaymentQueries(queryClient: ReturnType<typeof useQueryClient>, userId?: string) {
  // Invalidate all payment queries
  queryClient.invalidateQueries({
    predicate: (query) => 
      query.queryKey[0] === 'payment'
  });
  
  // Also invalidate payment completion queries
  queryClient.invalidateQueries({
    predicate: (query) => 
      query.queryKey[0] === 'paymentCompletion'
  });
  
  console.log('Invalidated payment queries');
}
