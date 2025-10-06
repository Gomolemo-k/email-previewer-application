import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { findPlanByPriceId, getAllPricePlans } from '@/lib/price-plan';
import { PaymentTypes } from '@/payment/types';
import { and, eq, gt, isNull, or } from 'drizzle-orm';

/**
 * Check premium access for a specific user ID
 *
 * This function combines the logic from getLifetimeStatusAction and getActiveSubscriptionAction
 * but optimizes it for a single database query to check premium access.
 */
export async function checkPremiumAccess(userId: string): Promise<boolean> {
  try {
    const db = await getDb();

    // Get lifetime plan IDs for efficient checking
    const plans = getAllPricePlans();
    const lifetimePlanIds = plans
      .filter((plan) => plan.isLifetime)
      .map((plan) => plan.id);

    // Single optimized query to check both lifetime and active subscriptions
    const result = await db
      .select({
        id: payment.id,
        priceId: payment.priceId,
        type: payment.type,
        status: payment.status,
        paid: payment.paid,
        periodEnd: payment.periodEnd,
        cancelAtPeriodEnd: payment.cancelAtPeriodEnd,
        canceledAt: payment.canceledAt, // Include cancellation date
      })
      .from(payment)
      .where(
        and(
          eq(payment.userId, userId),
          or(
            // Check for completed lifetime payments
            and(
              eq(payment.type, PaymentTypes.ONE_TIME),
              eq(payment.status, 'completed')
            ),
            // Check for paid subscriptions that are still valid
            and(
              eq(payment.type, PaymentTypes.SUBSCRIPTION),
              eq(payment.paid, true), // Ensure payment was completed
              or(
                // Status is one of the active-like statuses
                eq(payment.status, 'active'),
                eq(payment.status, 'trialing'),
                eq(payment.status, 'past_due'),
                eq(payment.status, 'unpaid'),
                // Or period hasn't ended yet (handles transitions)
                gt(payment.periodEnd, new Date()),
                // Or period end is null (ongoing subscription)
                isNull(payment.periodEnd)
              ),
              // Exclude subscriptions that have been fully canceled
              or(
                isNull(payment.canceledAt), // Subscription not canceled
                eq(payment.cancelAtPeriodEnd, true) // Cancelled at period end but still valid until end date
              )
            )
          )
        )
      );

    if (!result || result.length === 0) {
      return false;
    }

    // Check if any payment grants premium access
    return result.some((p) => {
      // For one-time payments, check if it's a lifetime plan
      if (p.type === PaymentTypes.ONE_TIME && p.status === 'completed') {
        const plan = findPlanByPriceId(p.priceId);
        return plan && lifetimePlanIds.includes(plan.id);
      }

      // For subscriptions, check if they're active and not expired
      if (p.type === PaymentTypes.SUBSCRIPTION && p.paid === true) {
        // If subscription was fully canceled, it's not valid regardless of other conditions
        if (p.canceledAt) {
          return false;
        }

        // If status is active or trialing, it's valid
        if (p.status === 'active' || p.status === 'trialing') {
          return true;
        }
        
        // For temporary status issues, check if period is still valid
        if (['past_due', 'unpaid'].includes(p.status)) {
          if (!p.periodEnd) {
            return true; // No end date and paid - assume ongoing
          }
          
          const now = new Date();
          const periodEnd = new Date(p.periodEnd);
          return periodEnd > now; // Still in valid period
        }

        // Check if subscription period hasn't ended yet
        if (p.cancelAtPeriodEnd) {
          // If subscription is set to cancel at period end, it's still valid until that date
          if (p.periodEnd) {
            const now = new Date();
            const periodEnd = new Date(p.periodEnd);
            return periodEnd > now;
          }
          return true; // No end date but set to cancel at period end
        }
        
        if (p.periodEnd) {
          const now = new Date();
          const periodEnd = new Date(p.periodEnd);
          return periodEnd > now;
        }
        
        return true; // No end date and paid - ongoing subscription
      }

      return false;
    });
  } catch (error) {
    console.error('Error checking premium access for user:', error);
    return false;
  }
}
