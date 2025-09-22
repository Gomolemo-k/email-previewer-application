import { checkUserPaymentStatusAction } from '@/actions/check-user-payment-status';
import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Check if the current user has paid for a subscription
 * 
 * @param request The incoming request
 * @returns NextResponse with the payment status
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    // If no session, return false
    if (!session || !session.user) {
      return NextResponse.json({ hasPaid: false });
    }
    
    // Check if user has paid using the server action
    const result = await checkUserPaymentStatusAction({ userId: session.user.id });
    
    if (result.success) {
      return NextResponse.json({ hasPaid: result.hasPaid });
    } else {
      return NextResponse.json({ hasPaid: false });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json({ hasPaid: false });
  }
}