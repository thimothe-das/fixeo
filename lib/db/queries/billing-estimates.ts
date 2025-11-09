import { db } from "@/lib/db/drizzle";
import {
  billingEstimates,
  BillingEstimateStatus,
  serviceRequests,
  ServiceRequestStatus,
  serviceRequestStatusHistory,
} from "@/lib/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";

/**
 * Automatically expire pending estimates that have passed their validUntil date
 * Also updates the related service request status back to "awaiting_estimate"
 */
export async function expirePendingEstimates() {
  try {
    const now = new Date();

    // Find all pending estimates that have expired
    const expiredEstimates = await db
      .select({
        id: billingEstimates.id,
        serviceRequestId: billingEstimates.serviceRequestId,
      })
      .from(billingEstimates)
      .where(
        and(
          eq(billingEstimates.status, BillingEstimateStatus.PENDING),
          lt(billingEstimates.validUntil, now)
        )
      );

    if (expiredEstimates.length === 0) {
      return { expiredCount: 0 };
    }

    // Update each expired estimate
    for (const estimate of expiredEstimates) {
      // Update estimate status to expired
      await db
        .update(billingEstimates)
        .set({
          status: BillingEstimateStatus.EXPIRED,
          updatedAt: now,
        })
        .where(eq(billingEstimates.id, estimate.id));

      // Update service request status back to awaiting_estimate
      await db
        .update(serviceRequests)
        .set({
          status: ServiceRequestStatus.AWAITING_ESTIMATE,
          updatedAt: now,
        })
        .where(eq(serviceRequests.id, estimate.serviceRequestId));

      // Add status history entry
      await db.insert(serviceRequestStatusHistory).values({
        serviceRequestId: estimate.serviceRequestId,
        status: ServiceRequestStatus.AWAITING_ESTIMATE,
      });
    }

    return { expiredCount: expiredEstimates.length };
  } catch (error) {
    console.error("Error expiring pending estimates:", error);
    throw error;
  }
}

/**
 * Get all estimates for a specific service request
 * Ordered by creation date (newest first)
 */
export async function getEstimatesByRequestId(requestId: number) {
  try {
    const estimates = await db
      .select()
      .from(billingEstimates)
      .where(eq(billingEstimates.serviceRequestId, requestId))
      .orderBy(desc(billingEstimates.createdAt));

    return estimates;
  } catch (error) {
    console.error("Error fetching estimates for request:", error);
    throw error;
  }
}

