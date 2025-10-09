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
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

// Input schema
const schema = z.object({
  userId: z.string().min(1, { error: 'User ID is required' }),
});

/**
 * Get active subscription data with retry logic
 *
 * If the user has multiple subscriptions,
 * it returns the most recent active or trialing one
 */
export const getActiveSubscriptionAction = userActionClient
  .schema(schema)
  .action(async ({ ctx }) => {
    const currentUser = (ctx as { user: User }).user;
    const userId = currentUser.id;

    // Retry configuration
    const maxRetries = 3;
    const baseDelay = 500; // 500ms base delay

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Query the database for subscription payments
        const db = await getDb();
        
        // First, try to get paid subscriptions
        let subscriptionPayments = await db
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

        // Find the most recent active or trialing subscription that hasn't been fully canceled
        let activeSubscription = subscriptionPayments.find(
          (sub) => (sub.status === 'active' || sub.status === 'trialing') && !sub.canceledAt
        );

        // If no paid active subscription found, check for subscriptions that may be active 
        // but haven't been updated by webhook yet (common race condition issue)
        if (!activeSubscription) {
          console.log('No paid active subscription found, checking for potentially active subscriptions');
          
          // Query for subscriptions that should be active but might not have paid=true yet
          const potentiallyActiveSubscriptions = await db
            .select()
            .from(payment)
            .where(
              and(
                eq(payment.userId, userId),
                eq(payment.type, PaymentTypes.SUBSCRIPTION)
              )
            )
            .orderBy(desc(payment.createdAt));
          
          // Look for subscriptions with active/trialing status that haven't been fully canceled
          activeSubscription = potentiallyActiveSubscriptions.find(
            (sub) => (sub.status === 'active' || sub.status === 'trialing') && !sub.canceledAt
          );

          // If we found a potentially active subscription that isn't marked as paid yet,
          // it might be due to a race condition with the webhook. This could indicate 
          // the webhook hasn't processed yet, so we return this one too.
          if (activeSubscription) {
            console.log('Found potentially active subscription with status:', activeSubscription.status, 'but paid status is:', activeSubscription.paid);
          }
        }

        if (activeSubscription) {
          console.log('Found active subscription for userId:', userId);
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
        console.error(`get user subscription data error (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
        
        // If this was the last attempt, return the error
        if (attempt === maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Something went wrong',
          };
        }

        // Otherwise, wait before retrying with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  });