import { setSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { updateServiceRequestDownPaymentByGuestToken } from "@/lib/db/queries";
import { updateUserStripeCustomerId } from "@/lib/db/queries/client";
import { users } from "@/lib/db/schema";
import { stripe } from "@/lib/payments/stripe";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");
  const requestId = searchParams.get("requestId");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/", process.env.BASE_URL));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer"],
    });

    const userId = session.client_reference_id;
    const guestToken = session.metadata?.guestToken;

    // Get customer ID if customer exists, otherwise it will be null for anonymous payments
    const customerId =
      session.customer && typeof session.customer !== "string"
        ? session.customer.id
        : null;

    // Mark down payment as paid if guest token exists
    if (guestToken) {
      try {
        await updateServiceRequestDownPaymentByGuestToken(guestToken);
        console.log(
          `Down payment marked as paid for guest token: ${guestToken}`
        );

        // TODO: Add additional post-payment actions for guest payments
        // Examples:
        // - Send confirmation email to guest
        // - Notify artisans that payment has been made
        // - Update request status
        // await sendGuestPaymentConfirmation(guestToken, session.amount_total);
        // await notifyArtisansOfPayment(guestToken);
      } catch (error) {
        console.error("Error updating down payment status:", error);
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

        // TODO: Add additional post-payment actions for logged-in users
        // Examples:
        // - Send confirmation email
        // - Update user account status
        // - Trigger business logic
        // await sendUserPaymentConfirmation(user[0].email, session.amount_total);
        // await updateUserAccountAfterPayment(user[0].id, session);

        await setSession(user[0]);
        const redirectUrl = requestId
          ? `/workspace/requests/${requestId}?check_payment=1`
          : "/workspace/dashboard";

        return NextResponse.redirect(
          new URL(redirectUrl, process.env.BASE_URL)
        );
      }
    }

    // Anonymous user or user not found - redirect to home page with requestId if available
    const redirectUrl = requestId ? `/?requestId=${requestId}` : "/";
    return NextResponse.redirect(new URL(redirectUrl, process.env.BASE_URL));
  } catch (error) {
    console.error("Error handling successful checkout:", error);
    return NextResponse.redirect(new URL("/", process.env.BASE_URL));
  }
}
