'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { and, eq, gt, isNull, or } from 'drizzle-orm';
import { z } from 'zod';

const checkSubscriptionSchema = z.object({
  userId: z.string(),
});

/**
 * Check if a user has an active subscription
 */
export const checkSubscriptionAction = userActionClient
  .schema(checkSubscriptionSchema)
  .action(async ({ parsedInput: { userId } }) => {
    try {
      const db = await getDb();
      
      // Check for active subscriptions or lifetime purchases
      const subscriptionRecords = await db
        .select()
        .from(payment)
        .where(
          and(
            eq(payment.userId, userId),
            or(
              // Check for completed lifetime payments
              and(
                eq(payment.type, 'one_time'),
                eq(payment.status, 'completed')
              ),
              // Check for active subscriptions that haven't expired (improved logic)
              and(
                eq(payment.type, 'subscription'),
                eq(payment.paid, true), // Ensure payment was completed
                or(
                  // Status is active, trialing, or incomplete (in process of becoming active)
                  eq(payment.status, 'active'),
                  eq(payment.status, 'trialing'),
                  eq(payment.status, 'incomplete'),
                  eq(payment.status, 'incomplete_expired'),
                  // Include subscriptions with temporary status issues but still in period
                  eq(payment.status, 'past_due'),
                  eq(payment.status, 'unpaid')
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

      // Check if any subscription records are still valid
      const validSubscriptions = subscriptionRecords.some(record => {
        if (record.type === 'one_time') {
          return true; // One-time purchases are always valid once completed
        }
        
        // For subscriptions, check if still in valid period and not fully canceled
        if (record.canceledAt) {
          // Subscription was fully canceled, so it's not valid regardless of period end
          return false;
        }

        if (record.status === 'active' || record.status === 'trialing' || record.status === 'incomplete' || record.status === 'incomplete_expired') {
          return true; // These subscription statuses are considered valid if paid
        }

        if (record.periodEnd) {
          const periodEnd = new Date(record.periodEnd);
          const now = new Date();
          
          // If subscription is set to cancel at period end, it's still valid until that date
          if (record.cancelAtPeriodEnd) {
            return periodEnd > now;
          }
          
          // Otherwise, check if period hasn't ended yet
          return periodEnd > now;
        } else {
          // If no period end set but paid, assume ongoing (unless fully canceled)
          return true;
        }
      });
      
      const hasActiveSubscription = validSubscriptions;
      
      console.log('Check subscription for user:', userId, 'result:', hasActiveSubscription);

      return {
        success: true,
        hasActiveSubscription,
      };
    } catch (error) {
      console.error('Check subscription error:', error);
      return {
        success: false,
        error: 'Failed to check subscription status',
      };
    }
  });