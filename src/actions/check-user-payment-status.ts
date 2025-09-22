'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { PaymentTypes, type PaymentStatus } from '@/payment/types';
import { userActionClient } from '@/lib/safe-action';
import { and, eq, gte, or } from 'drizzle-orm';
import { z } from 'zod';

const checkUserPaymentStatusSchema = z.object({
  userId: z.string(),
});

/**
 * Check if a user has paid for an active subscription
 */
export const checkUserPaymentStatusAction = userActionClient
  .schema(checkUserPaymentStatusSchema)
  .action(async ({ parsedInput: { userId } }) => {
    try {
      const db = await getDb();
      
      // Check for active subscriptions (recurring)
      const activeSubscriptions = await db
        .select()
        .from(payment)
        .where(
          and(
            eq(payment.userId, userId),
            eq(payment.type, PaymentTypes.SUBSCRIPTION),
            or(
              eq(payment.status, 'active'),
              and(
                eq(payment.status, 'trialing'),
                // Trial is still valid if end date is in the future
                payment.trialEnd ? gte(payment.trialEnd, new Date()) : undefined
              )
            )
          )
        )
        .limit(1);
      
      // Check for completed one-time payments (lifetime purchases)
      const completedOneTimePayments = await db
        .select()
        .from(payment)
        .where(
          and(
            eq(payment.userId, userId),
            eq(payment.type, PaymentTypes.ONE_TIME),
            eq(payment.status, 'completed')
          )
        )
        .limit(1);
      
      // Check for paid subscriptions (in case status is not 'active' but paid is true)
      const paidSubscriptions = await db
        .select()
        .from(payment)
        .where(
          and(
            eq(payment.userId, userId),
            eq(payment.paid, true),
            eq(payment.type, PaymentTypes.SUBSCRIPTION)
          )
        )
        .limit(1);
      
      // User has paid if they have:
      // 1. An active subscription, OR
      // 2. A trialing subscription that's still valid, OR
      // 3. A completed one-time payment (lifetime), OR
      // 4. Any paid subscription record
      const hasPaid = 
        activeSubscriptions.length > 0 || 
        completedOneTimePayments.length > 0 ||
        paidSubscriptions.length > 0;
      
      console.log(`checkUserPaymentStatusAction for userId: ${userId}`, {
        activeSubscriptions: activeSubscriptions.length,
        completedOneTimePayments: completedOneTimePayments.length,
        paidSubscriptions: paidSubscriptions.length,
        hasPaid
      });
      
      return {
        success: true,
        hasPaid,
      };
    } catch (error) {
      console.error('Check user payment status error:', error);
      return {
        success: false,
        error: 'Failed to check user payment status',
      };
    }
  });