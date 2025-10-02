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
                  // Status is active or trialing
                  eq(payment.status, 'active'),
                  eq(payment.status, 'trialing'),
                  // Include subscriptions with temporary status issues but still in period
                  eq(payment.status, 'past_due'),
                  eq(payment.status, 'unpaid')
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
        
        // For subscriptions, check if still in valid period
        if (record.periodEnd) {
          const periodEnd = new Date(record.periodEnd);
          const now = new Date();
          return periodEnd > now;
        } else {
          // If no period end set but paid, assume ongoing
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