import { db } from "@/lib/db/drizzle";
import { billingEstimates, serviceRequests, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { teams } from "../schema";

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getUserByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserStripeCustomerId(
  userId: number,
  stripeCustomerId: string
) {
  await db
    .update(users)
    .set({
      stripeCustomerId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getServiceRequestsForClient(userId: number) {
  // Get service requests
  const requests = await db
    .select({
      id: serviceRequests.id,
      title: serviceRequests.title,
      serviceType: serviceRequests.serviceType,
      urgency: serviceRequests.urgency,
      description: serviceRequests.description,
      location: serviceRequests.location,
      status: serviceRequests.status,
      estimatedPrice: serviceRequests.estimatedPrice,
      photos: serviceRequests.photos,
      createdAt: serviceRequests.createdAt,
      assignedArtisan: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(serviceRequests)
    .leftJoin(users, eq(serviceRequests.assignedArtisanId, users.id))
    .where(eq(serviceRequests.userId, userId))
    .orderBy(desc(serviceRequests.createdAt));

  // Get billing estimates for each request
  const requestsWithEstimates = await Promise.all(
    requests.map(async (request) => {
      const estimates = await db
        .select({
          id: billingEstimates.id,
          estimatedPrice: billingEstimates.estimatedPrice,
          status: billingEstimates.status,
          validUntil: billingEstimates.validUntil,
          clientAccepted: billingEstimates.clientAccepted,
          artisanAccepted: billingEstimates.artisanAccepted,
          artisanRejectionReason: billingEstimates.artisanRejectionReason,
          rejectedByArtisanId: billingEstimates.rejectedByArtisanId,
          rejectedAt: billingEstimates.rejectedAt,
          artisanResponseDate: billingEstimates.artisanResponseDate,
          clientResponseDate: billingEstimates.clientResponseDate,
          createdAt: billingEstimates.createdAt,
        })
        .from(billingEstimates)
        .where(eq(billingEstimates.serviceRequestId, request.id))
        .orderBy(desc(billingEstimates.createdAt));

      return {
        ...request,
        billingEstimates: estimates,
      };
    })
  );

  return requestsWithEstimates;
}
