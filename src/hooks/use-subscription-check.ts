import { checkSubscriptionAction } from '@/actions/check-subscription';
import { useQuery } from '@tanstack/react-query';

// Query keys for subscription check
export const subscriptionKeys = {
  all: ['subscription'] as const,
  user: (userId: string) => [...subscriptionKeys.all, 'user', userId] as const,
};

// Hook to check if user has an active subscription
export function useSubscriptionCheck(userId: string | null) {
  return useQuery({
    queryKey: subscriptionKeys.user(userId || ''),
    queryFn: async () => {
      if (!userId) {
        return {
          hasActiveSubscription: false,
        };
      }
      
      console.log('>>> Check subscription status');
      const result = await checkSubscriptionAction({ userId });
      
      if (!result?.success) {
        console.log('<<< Check subscription failed');
        throw new Error(result?.error || 'Failed to check subscription status');
      }

      const { hasActiveSubscription } = result;
      console.log('<<< Check subscription success:', hasActiveSubscription);

      return {
        hasActiveSubscription,
      };
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}