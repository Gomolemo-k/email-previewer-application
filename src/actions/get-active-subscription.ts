'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import type { User } from '@/lib/auth-types';
import { userActionClient } from '@/lib/safe-action';
import {
  type PaymentStatus,
  PaymentTypes,
  type PlanInterval,
} from '@/payment/types';
import { and, desc, eq, gt, isNull, or } from 'drizzle-orm';
import { z } from 'zod';

// Input schema
const schema = z.object({
  userId: z.string().min(1, { error: 'User ID is required' }),
});

/**
 * Get active subscription data
 *
 * If the user has multiple subscriptions,
 * it returns the most recent active one based on proper criteria
 */
export const getActiveSubscriptionAction = userActionClient
  .schema(schema)
  .action(async ({ ctx }) => {
    const currentUser = (ctx as { user: User }).user;
    const userId = currentUser.id;

    try {
      // Query the database for subscription payments
      const db = await getDb();
      const subscriptionPayments = await db
        .select()
        .from(payment)
        .where(
          and(
            eq(payment.userId, userId),
            eq(payment.type, PaymentTypes.SUBSCRIPTION),
            eq(payment.paid, true)
          )
        )
        .orderBy(desc(payment.createdAt));

      // Find the most recent active subscription based on multiple criteria:
      // 1. Status is 'active' or 'trialing'
      // 2. Status is 'past_due' but period hasn't ended yet
      // 3. Status is 'unpaid' but period hasn't ended yet (temporary issue)
      const activeSubscription = subscriptionPayments.find((sub) => {
        // Check if status is active or trialing
        if (sub.status === 'active' || sub.status === 'trialing') {
          return true;
        }
        
        // Check if subscription should still be active based on period
        if (sub.periodEnd) {
          const periodEnd = new Date(sub.periodEnd);
          const now = new Date();
          return periodEnd > now && sub.paid === true;
        } else {
          // If no period end is set but it's paid, assume it's ongoing
          return sub.paid === true;
        }
      });

      if (activeSubscription) {
        console.log('find active subscription for userId:', userId);
        // Map to Subscription interface format
        const subscriptionData = {
          id: activeSubscription.id!,
          priceId: activeSubscription.priceId,
          customerId: activeSubscription.customerId,
          status: activeSubscription.status as PaymentStatus,
          type: activeSubscription.type as PaymentTypes,
          interval: activeSubscription.interval as PlanInterval,
          currentPeriodStart: activeSubscription.periodStart || undefined,
          currentPeriodEnd: activeSubscription.periodEnd || undefined,
          cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd || false,
          trialStartDate: activeSubscription.trialStart || undefined,
          trialEndDate: activeSubscription.trialEnd || undefined,
          createdAt: activeSubscription.createdAt,
        };

        return {
          success: true,
          data: subscriptionData,
        };
      }
      console.log('no active subscription found for userId:', userId);
      return {
        success: true,
        data: null,
      };
    } catch (error) {
      console.error('get user subscription data error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  });
