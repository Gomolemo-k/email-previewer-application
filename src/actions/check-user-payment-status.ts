'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';

const checkUserPaymentStatusSchema = z.object({
  userId: z.string(),
});

/**
 * Check if a user has paid for a subscription
 */
export const checkUserPaymentStatusAction = userActionClient
  .schema(checkUserPaymentStatusSchema)
  .action(async ({ parsedInput: { userId } }) => {
    try {
      const db = await getDb();
      
      // Check if user has any paid subscriptions or one-time payments
      const paymentRecords = await db
        .select()
        .from(payment)
        .where(eq(payment.userId, userId))
        .limit(10); // Get up to 10 payment records
      
      // Check if any payment record shows the user has paid
      const hasPaid = paymentRecords.some(record => 
        record.paid === true || 
        (record.status === 'active' && record.type === 'subscription') ||
        (record.status === 'completed' && record.type === 'one_time')
      );
      
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