import { auth } from '@/lib/auth';
import { getLocaleFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Check if user has premium access
 * 
 * @param request The incoming request
 * @returns NextResponse with the result
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  const locale = getLocaleFromRequest(request);
  
  try {
    // Simple check - if user exists, they're authenticated
    // In a real implementation, you would check the user's subscription status
    const hasPremiumAccess = true; // For demo purposes, all authenticated users have access
    
    return NextResponse.json({ hasPremiumAccess });
  } catch (error) {
    console.error('Error checking premium access:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}