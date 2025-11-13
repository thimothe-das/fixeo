import { db } from "@/lib/db/drizzle";
import {
  updateBillingEstimateStatus,
  updateServiceRequestDownPaymentByGuestToken,
  updateServiceRequestDownPaymentSuccess,
} from "@/lib/db/queries";
import {
  getTeamByStripeCustomerId,
  updateTeamSubscription,
} from "@/lib/db/queries/client";
import { getUser } from "@/lib/db/queries/common";
import {
  billingEstimates,
  BillingEstimateStatus,
  serviceRequests,
  ServiceRequestStatus,
  serviceRequestStatusHistory,
  Team,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function createCheckoutSession({
  amount,
  guestToken,
  requestId,
  cancelUrl,
}: {
  amount: number;
  guestToken?: string;
  requestId?: string;
  cancelUrl?: string;
}) {
  const user = await getUser();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Acompte pour service",
            description: "Acompte de 30% pour votre demande de service",
          },
          unit_amount: amount, // Amount in cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${
      process.env.BASE_URL
    }/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}&requestId=${
      requestId || ""
    }`,
    cancel_url: `${process.env.BASE_URL}${cancelUrl}?requestId=${
      requestId || ""
    }`,
    customer: user?.stripeCustomerId || undefined,
    client_reference_id: user ? user.id.toString() : undefined,
    metadata: {
      guestToken: guestToken || "",
      requestId: requestId || "",
    },
    allow_promotion_codes: true,
    // subscription_data: {
    //   trial_period_days: 14
    // }
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect("/pricing");
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "Manage your subscription",
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price", "quantity", "promotion_code"],
          proration_behavior: "create_prorations",
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id),
            },
          ],
        },
        subscription_cancel: {
          enabled: true,
          mode: "at_period_end",
          cancellation_reason: {
            enabled: true,
            options: [
              "too_expensive",
              "missing_features",
              "switched_service",
              "unused",
              "other",
            ],
          },
        },
        payment_method_update: {
          enabled: true,
        },
      },
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/workspace`,
    configuration: configuration.id,
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error("Team not found for Stripe customer:", customerId);
    return;
  }

  if (status === "active" || status === "trialing") {
    const plan = subscription.items.data[0]?.plan;
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: plan?.product as string,
      planName: (plan?.product as Stripe.Product).name,
      subscriptionStatus: status,
    });
  } else if (status === "canceled" || status === "unpaid") {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status,
    });
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ["data.product"],
    active: true,
    type: "recurring",
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
  }));
}

/**
 * Handle successful checkout session completion
 * This is called via webhook when a checkout session is completed
 */
export async function handleSuccessfulPayment(
  session: Stripe.Checkout.Session
) {
  console.log("Payment completed via webhook:", session.id);

  // Extract relevant information
  const userId = session.client_reference_id;
  const guestToken = session.metadata?.guestToken;
  const customerId = session.customer as string;
  const amountTotal = session.amount_total; // Amount in cents
  const currency = session.currency;
  const paymentStatus = session.payment_status;
  const requestIdFromMetadata = session.metadata?.requestId;
  // Only process if payment was successful
  console.log("session", session);
  if (paymentStatus !== "paid") {
    console.log(`Payment not completed. Status: ${paymentStatus}`);
    return;
  }

  if (!requestIdFromMetadata) {
    console.log(`Request ID from metadata not found`);
    return;
  }

  try {
    // Update service request status after successful payment
    const requestId = parseInt(requestIdFromMetadata);

    // Fetch the billing estimate with all required fields
    const [billingEstimate] = await db
      .select()
      .from(billingEstimates)
      .where(eq(billingEstimates.serviceRequestId, requestId))
      .orderBy(desc(billingEstimates.createdAt))
      .limit(1);

    if (!billingEstimate) {
      throw new Error(
        `Billing estimate not found for request ID: ${requestId}`
      );
    }

    // Update the service request down payment status
    await updateServiceRequestDownPaymentSuccess(requestId, guestToken);

    // Check if this is a dual acceptance scenario (revised estimate with assigned artisan)
    const [serviceRequest] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId))
      .limit(1);

    const isRevisedEstimate = (billingEstimate.revisionNumber || 1) > 1;
    const hasAssignedArtisan = serviceRequest?.assignedArtisanId !== null;
    const requiresDualAcceptance = isRevisedEstimate && hasAssignedArtisan;

    if (requiresDualAcceptance) {
      // Dual acceptance flow: mark client as accepted with timestamp
      await db
        .update(billingEstimates)
        .set({
          clientAccepted: true,
          clientResponseDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(billingEstimates.id, billingEstimate.id));

      // Check if artisan has also accepted
      if (billingEstimate.artisanAccepted === true) {
        // Both parties accepted: set status to in_progress
        await db
          .update(billingEstimates)
          .set({
            status: BillingEstimateStatus.ACCEPTED,
            updatedAt: new Date(),
          })
          .where(eq(billingEstimates.id, billingEstimate.id));

        await db
          .update(serviceRequests)
          .set({
            status: ServiceRequestStatus.IN_PROGRESS,
            updatedAt: new Date(),
          })
          .where(eq(serviceRequests.id, requestId));

        // Record status change in history
        await db.insert(serviceRequestStatusHistory).values({
          serviceRequestId: requestId,
          status: ServiceRequestStatus.IN_PROGRESS,
        });

        console.log(
          `Updated service request ${requestId} status to in_progress after both parties accepted`
        );
      } else {
        // Client accepted but artisan hasn't: keep status as awaiting_dual_acceptance
        console.log(
          `Client paid and accepted for request ${requestId}. Waiting for artisan acceptance.`
        );
      }
    } else {
      // Non-dual acceptance flow: use existing logic
      await updateBillingEstimateStatus(
        billingEstimate.id,
        BillingEstimateStatus.ACCEPTED
      );
      console.log(
        `Updated service request ${requestId} status to awaiting_assignation after payment`
      );
    }

    // Update down payment status if guest token exists (this also happens in checkout API, but webhook is more reliable)
    if (guestToken) {
      try {
        await updateServiceRequestDownPaymentByGuestToken(guestToken);
        console.log(
          `Updated down payment status for guest token: ${guestToken}`
        );
      } catch (paymentError) {
        console.error("Error updating down payment status:", paymentError);
      }
    }

    // TODO: Add your additional post-payment logic here
    // 1. Send confirmation email
    // await sendPaymentConfirmationEmail(userId, guestToken, amountTotal);

    // 2. Trigger business logic (like creating an estimate, assigning artisans, etc.)
    // await createEstimateForServiceRequest(guestToken);

    // 3. Log analytics/metrics
    // await logPaymentEvent('payment_completed', { userId, guestToken, amountTotal });

    console.log(
      `Successfully processed payment for ${
        userId ? `user ${userId}` : `guest ${guestToken}`
      }`
    );
  } catch (error) {
    console.error("Error handling successful payment:", error);
    // Consider implementing retry logic or error notifications
  }
}

/**
 * Handle payment intent succeeded event
 * This provides more granular payment information
 */
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("Payment intent succeeded:", paymentIntent.id);

  const amountReceived = paymentIntent.amount_received;
  const currency = paymentIntent.currency;
  const customerId = paymentIntent.customer as string;

  try {
    // TODO: Add any payment intent specific logic here
    // This event provides more detailed payment information
    // but might not have the same metadata as checkout.session.completed

    console.log(`Payment intent processed: ${amountReceived} ${currency}`);
  } catch (error) {
    console.error("Error handling payment intent:", error);
  }
}
