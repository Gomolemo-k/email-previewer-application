import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to check user payment status
 * 
 * @param request The incoming request
 * @returns NextResponse with debug information
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    // If no session, return false
    if (!session || !session.user) {
      return NextResponse.json({ 
        hasPaid: false,
        debug: 'No session or user' 
      });
    }
    
    // Get all payment records for this user
    const db = await getDb();
    const paymentRecords = await db
      .select()
      .from(payment)
      .where(payment.userId, '=', session.user.id)
      .orderBy(payment.createdAt);
    
    // Check if any payment record shows the user has paid
    const hasPaid = paymentRecords.some(record => 
      record.paid === true || 
      (record.status === 'active' && record.type === 'subscription') ||
      (record.status === 'completed' && record.type === 'one_time')
    );
    
    return NextResponse.json({ 
      hasPaid,
      userId: session.user.id,
      paymentRecords: paymentRecords.map(record => ({
        id: record.id,
        priceId: record.priceId,
        type: record.type,
        status: record.status,
        paid: record.paid,
        periodStart: record.periodStart,
        periodEnd: record.periodEnd,
        trialStart: record.trialStart,
        trialEnd: record.trialEnd,
        createdAt: record.createdAt,
      })),
      debug: 'Payment records retrieved successfully',
    });
  } catch (error) {
    console.error('Debug payment status error:', error);
    return NextResponse.json({ 
      hasPaid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: 'Error occurred while retrieving payment records'
    });
  }
}