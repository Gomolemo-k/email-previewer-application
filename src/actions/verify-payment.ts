'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import Stripe from 'stripe';

const verifyPaymentSchema = z.object({
  sessionId: z.string(),
});

/**
 * Verify payment status with Stripe and update database if needed
 */
export const verifyPaymentAction = userActionClient
  .schema(verifyPaymentSchema)
  .action(async ({ parsedInput: { sessionId } }) => {
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        throw new Error('STRIPE_SECRET_KEY environment variable is not set');
      }

      const stripeClient = new Stripe(stripeSecretKey);
      
      // Get the session from Stripe
      const session = await stripeClient.checkout.sessions.retrieve(sessionId);
      
      // If the session is not complete, return false
      if (session.status !== 'complete') {
        return {
          success: true,
          isPaid: false,
        };
      }

      // Session is complete, so payment is successful
      // Now let's update the database record if it exists
      const db = await getDb();
      
      // Find payment record by sessionId
      const paymentRecord = await db
        .select()
        .from(payment)
        .where(eq(payment.sessionId, sessionId))
        .limit(1);

      // If we found a payment record and it's not marked as paid, update it
      if (paymentRecord.length > 0 && !paymentRecord[0].paid) {
        const invoiceId = session.invoice as string | null;
        
        // Update the payment record to mark it as paid
        await db
          .update(payment)
          .set({
            paid: true,
            status: 'completed',
            invoiceId: invoiceId || undefined,
            updatedAt: new Date(),
          })
          .where(eq(payment.id, paymentRecord[0].id));
          
        console.log('Payment record updated to paid for session:', sessionId);
      }

      return {
        success: true,
        isPaid: true,
      };
    } catch (error) {
      console.error('Verify payment error:', error);
      return {
        success: false,
        error: 'Failed to verify payment',
      };
    }
  });