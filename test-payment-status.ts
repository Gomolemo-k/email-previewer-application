import { checkUserPaymentStatusAction } from '@/actions/check-user-payment-status';

async function testPaymentStatus() {
  // Replace with an actual user ID that has a subscription
  const userId = 'test-user-id'; // This should be replaced with a real user ID
  
  try {
    const result = await checkUserPaymentStatusAction({ userId });
    console.log('Payment status result:', result);
  } catch (error) {
    console.error('Error checking payment status:', error);
  }
}

testPaymentStatus();