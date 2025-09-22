'use server';

import { cookies } from 'next/headers';
import { userActionClient } from '@/lib/safe-action';
import { z } from 'zod';

const setPaymentVerifiedCookieSchema = z.object({
  verified: z.boolean(),
});

/**
 * Set a cookie to indicate that the user has verified their payment
 */
export const setPaymentVerifiedCookieAction = userActionClient
  .schema(setPaymentVerifiedCookieSchema)
  .action(async ({ parsedInput: { verified } }) => {
    try {
      const cookieStore = await cookies();
      
      if (verified) {
        cookieStore.set('payment_verified', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        });
      } else {
        cookieStore.delete('payment_verified');
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Set payment verified cookie error:', error);
      return {
        success: false,
        error: 'Failed to set payment verified cookie',
      };
    }
  });