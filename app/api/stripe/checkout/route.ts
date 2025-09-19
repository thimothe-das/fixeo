import { setSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { updateServiceRequestDownPaymentByGuestToken, updateUserStripeCustomerId } from '@/lib/db/queries';
import { users } from '@/lib/db/schema';
import { stripe } from '@/lib/payments/stripe';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer'],
    });

    const userId = session.client_reference_id;
    const guestToken = session.metadata?.guestToken;
    
    // Get customer ID if customer exists, otherwise it will be null for anonymous payments
    const customerId = session.customer && typeof session.customer !== 'string' 
      ? session.customer.id 
      : null;

    // Mark down payment as paid if guest token exists
    if (guestToken) {
      try {
        await updateServiceRequestDownPaymentByGuestToken(guestToken);
        console.log(`Down payment marked as paid for guest token: ${guestToken}`);
      } catch (error) {
        console.error('Error updating down payment status:', error);
      }
    }

    // For one-time payments (down payments)
    if (userId) {
      // Logged-in user - save stripeCustomerId to their account
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(userId)))
        .limit(1);

      if (user.length > 0) {
        // Only save customer ID if one was created by Stripe
        if (customerId) {
          await updateUserStripeCustomerId(user[0].id, customerId);
        }
        await setSession(user[0]);
        return NextResponse.redirect(new URL('/workspace/dashboard?payment=success', request.url));
      }
    }
  
    // Anonymous user or user not found - redirect to success page
    return NextResponse.redirect(new URL('/?payment=success', request.url));
  
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    return NextResponse.redirect(new URL('/?payment=error', request.url));
  }
}
