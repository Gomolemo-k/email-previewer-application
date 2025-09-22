'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import Stripe from 'stripe';

const checkPaymentCompletionSchema = z.object({
  sessionId: z.string(),
});

/**
 * Check if a payment is completed for the given session ID
 */
export const checkPaymentCompletionAction = userActionClient
  .schema(checkPaymentCompletionSchema)
  .action(async ({ parsedInput: { sessionId } }) => {
    try {
      const db = await getDb();
      
      // First try to find by sessionId
      let paymentRecord = await db
        .select()
        .from(payment)
        .where(eq(payment.sessionId, sessionId))
        .limit(1);

      // If no payment record found by sessionId, try to get the session from Stripe to get the invoiceId
      if (paymentRecord.length === 0) {
        try {
          const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
          if (stripeSecretKey) {
            const stripeClient = new Stripe(stripeSecretKey);
            const session = await stripeClient.checkout.sessions.retrieve(sessionId);
            const invoiceId = session.invoice as string | null;
            
            if (invoiceId) {
              paymentRecord = await db
                .select()
                .from(payment)
                .where(eq(payment.invoiceId, invoiceId))
                .limit(1);
            }
          }
        } catch (error) {
          console.error('Error retrieving Stripe session:', error);
        }
      }

      const paymentData = paymentRecord[0] || null;
      const isPaid = paymentData ? paymentData.paid : false;
      console.log('Check payment completion:', isPaid);

      return {
        success: true,
        isPaid,
      };
    } catch (error) {
      console.error('Check payment completion error:', error);
      return {
        success: false,
        error: 'Failed to check payment completion',
      };
    }
  });
