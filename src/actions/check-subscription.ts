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
  .action(async ({ parsedInput: { userId } }) {
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
              // Check for active subscriptions that haven't expired
              and(
                eq(payment.type, 'subscription'),
                eq(payment.status, 'active'),
                or(
                  // Either period hasn't ended yet
                  gt(payment.periodEnd, new Date()),
                  // Or period end is null (ongoing subscription)
                  isNull(payment.periodEnd)
                )
              )
            )
          )
        );

      // If we found any active subscriptions or lifetime purchases, user has premium access
      const hasActiveSubscription = subscriptionRecords.length > 0;
      
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