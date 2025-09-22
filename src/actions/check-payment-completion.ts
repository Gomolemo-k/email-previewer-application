'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import Stripe from 'stripe';
import { verifyPaymentAction } from './verify-payment';

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

      // If still no payment record found, try to get the session from Stripe and check its status
      if (paymentRecord.length === 0) {
        try {
          const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
          if (stripeSecretKey) {
            const stripeClient = new Stripe(stripeSecretKey);
            const session = await stripeClient.checkout.sessions.retrieve(sessionId);
            
            // If the session is completed, consider the payment as completed
            const isPaid = session.status === 'complete';
            console.log('Check payment completion (from Stripe session):', isPaid);
            
            return {
              success: true,
              isPaid,
            };
          }
        } catch (error) {
          console.error('Error retrieving Stripe session for status check:', error);
        }
      }

      // If we have a payment record, check if it's paid
      if (paymentRecord.length > 0) {
        const paymentData = paymentRecord[0];
        let isPaid = paymentData.paid;
        
        // If the payment is not marked as paid, verify with Stripe directly
        if (!isPaid) {
          try {
            const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
            if (stripeSecretKey && paymentData.sessionId) {
              const stripeClient = new Stripe(stripeSecretKey);
              const session = await stripeClient.checkout.sessions.retrieve(paymentData.sessionId);
              
              // If the session is completed, consider the payment as completed
              const stripePaid = session.status === 'complete';
              console.log('Check payment completion (from Stripe session, payment record found):', stripePaid);
              
              // If Stripe says it's paid but our database says it's not, update the database
              if (stripePaid && !paymentData.paid) {
                console.log('Payment is paid in Stripe but not in database, updating database');
                await db
                  .update(payment)
                  .set({
                    paid: true,
                    status: 'completed',
                    updatedAt: new Date(),
                  })
                  .where(eq(payment.id, paymentData.id));
                isPaid = true;
              }
              
              return {
                success: true,
                isPaid: stripePaid,
              };
            }
          } catch (error) {
            console.error('Error retrieving Stripe session for status check:', error);
          }
        }
        
        console.log('Check payment completion (from database):', isPaid);
        return {
          success: true,
          isPaid,
        };
      }

      console.log('Check payment completion: false (no payment record found)');
      return {
        success: true,
        isPaid: false,
      };
    } catch (error) {
      console.error('Check payment completion error:', error);
      return {
        success: false,
        error: 'Failed to check payment completion',
      };
    }
  });
