'use server';

import { checkPremiumAccess } from '@/lib/premium-access';
import { userActionClient } from '@/lib/safe-action';
import { z } from 'zod';

// Input schema
const schema = z.object({
  userId: z.string().min(1, { message: 'User ID is required' }),
});

/**
 * Check if user has premium access
 */
export const checkPremiumAccessAction = userActionClient
  .schema(schema)
  .action(async ({ parsedInput: { userId } }) => {
    try {
      const hasAccess = await checkPremiumAccess(userId);
      
      return {
        success: true,
        data: {
          hasPremiumAccess: hasAccess,
        },
      };
    } catch (error) {
      console.error('Error checking premium access:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  });