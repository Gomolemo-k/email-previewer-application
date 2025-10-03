'use server';

import { checkSubscriptionAction } from '@/actions/check-subscription';
import { getActiveSubscriptionAction } from '@/actions/get-active-subscription';
import { getLifetimeStatusAction } from '@/actions/get-lifetime-status';

/**
 * Check if a user has an active subscription, including:
 * - Active recurring subscriptions
 * - Paid one-time/lifetime purchases
 * - Valid subscription periods that haven't expired
 * 
 * @param userId The user ID to check
 * @returns boolean indicating if the user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    // Check for lifetime status first
    const lifetimeResult = await getLifetimeStatusAction({ userId });
    if (lifetimeResult?.data?.success && lifetimeResult.data.isLifetimeMember) {
      return true;
    }
    
    // Then check for active subscriptions
    const subscriptionResult = await getActiveSubscriptionAction({ userId });
    if (subscriptionResult?.data?.success && subscriptionResult.data.data) {
      return true;
    }
    
    // Finally check using the general checkSubscriptionAction
    const generalCheckResult = await checkSubscriptionAction({ userId });
    if (generalCheckResult.success && generalCheckResult.hasActiveSubscription) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking active subscription:', error);
    return false;
  }
}