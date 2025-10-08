import { getActiveSubscriptionAction } from '@/actions/get-active-subscription';
import { getAllPricePlans } from '@/lib/price-plan';
import type { PricePlan, Subscription } from '@/payment/types';
import { useQuery } from '@tanstack/react-query';

// Query keys
export const paymentKeys = {
  all: ['payment'] as const,
  subscription: (userId: string) =>
    [...paymentKeys.all, 'subscription', userId] as const,
  currentPlan: (userId: string) =>
    [...paymentKeys.all, 'currentPlan', userId] as const,
};

// Hook to fetch active subscription
export function useActiveSubscription(userId: string | undefined) {
  return useQuery({
    queryKey: paymentKeys.subscription(userId || ''),
    queryFn: async (): Promise<Subscription | null> => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      console.log('useActiveSubscription start');
      const result = await getActiveSubscriptionAction({ userId });
      if (!result?.data?.success) {
        throw new Error(result?.data?.error || 'Failed to fetch subscription');
      }
      console.log('useActiveSubscription success');
      return result.data.data || null;
    },
    enabled: !!userId,
  });
}

// Hook to get current plan based on subscription
export function useCurrentPlan(userId: string | undefined) {
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useActiveSubscription(userId);

  return useQuery({
    queryKey: paymentKeys.currentPlan(userId || ''),
    queryFn: async (): Promise<{
      currentPlan: PricePlan | null;
      subscription: Subscription | null;
    }> => {
      const plans: PricePlan[] = getAllPricePlans();

      // Filter only Pro plans (monthly or yearly)
      const proPlans = plans.filter((plan) => !plan.isFree && !plan.isLifetime);

      // If has active subscription, find the corresponding plan
      if (subscription) {
        console.log('useCurrentPlan, subscription');
        const plan =
          proPlans.find((p) =>
            p.prices.find((price) => price.priceId === subscription.priceId)
          ) || null;
        return {
          currentPlan: plan,
          subscription,
        };
      }

      // No subscription → return null
      console.log('useCurrentPlan, no subscription');
      return {
        currentPlan: null,
        subscription: null,
      };
    },
    enabled: !!userId && !isLoadingSubscription,
  });
}
