'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { PaymentTypes, type PaymentStatus } from '@/payment/types';
import { userActionClient } from '@/lib/safe-action';
import { and, eq, gte, gt, isNull, or } from 'drizzle-orm';
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
      
      // Check for active subscriptions (recurring) - including temporary status issues
      const activeSubscriptions = await db
        .select()
        .from(payment)
        .where(
          and(
            eq(payment.userId, userId),
            eq(payment.type, PaymentTypes.SUBSCRIPTION),
            eq(payment.paid, true), // Ensure the payment was completed
            or(
              eq(payment.status, 'active'),
              eq(payment.status, 'trialing'),
              eq(payment.status, 'incomplete'),
              eq(payment.status, 'incomplete_expired'),
              // Include subscriptions that may have temporary status issues but are still in period
              eq(payment.status, 'past_due'),
              eq(payment.status, 'unpaid')
            )
          )
        );
      
      // Check if any of these active subscriptions are still valid based on period
      const validActiveSubscriptions = activeSubscriptions.some(sub => {
        if (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'incomplete' || sub.status === 'incomplete_expired') {
          return true;
        }
        
        // For temporary status issues, check if period is still valid
        if (sub.periodEnd) {
          const periodEnd = new Date(sub.periodEnd);
          const now = new Date();
          return periodEnd > now;
        } else {
          // If no period end set but paid, assume ongoing
          return true;
        }
      });
      
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
        );
      
      // Determine if user has paid access
      const hasPaid = validActiveSubscriptions || completedOneTimePayments.length > 0;
      
      console.log(`checkUserPaymentStatusAction for userId: ${userId}`, {
        validActiveSubscriptions: validActiveSubscriptions,
        completedOneTimePayments: completedOneTimePayments.length,
        totalActiveSubscriptions: activeSubscriptions.length,
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
