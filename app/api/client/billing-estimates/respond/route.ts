import { db } from "@/lib/db/drizzle";
import { updateBillingEstimateStatus } from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries/common";
import {
  BillingEstimateStatus,
  billingEstimates,
  serviceRequests,
  ServiceRequestStatus,
  serviceRequestStatusHistory,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { estimateId, action, response } = body;

    if (!estimateId || !action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Enforce mandatory rejection reason
    if (action === "reject" && (!response || response.trim().length === 0)) {
      return NextResponse.json(
        { error: "Une raison de refus est obligatoire" },
        { status: 400 }
      );
    }

    // Verify the estimate belongs to the user's request
    const estimate = await db
      .select({
        id: billingEstimates.id,
        serviceRequestId: billingEstimates.serviceRequestId,
        status: billingEstimates.status,
        revisionNumber: billingEstimates.revisionNumber,
        estimate: billingEstimates,
        serviceRequest: serviceRequests,
      })
      .from(billingEstimates)
      .leftJoin(
        serviceRequests,
        eq(billingEstimates.serviceRequestId, serviceRequests.id)
      )
      .where(eq(billingEstimates.id, parseInt(estimateId)))
      .limit(1);

    if (estimate.length === 0) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    if (estimate[0].serviceRequest?.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (estimate[0].status !== BillingEstimateStatus.PENDING) {
      return NextResponse.json(
        { error: "Estimate cannot be modified" },
        { status: 400 }
      );
    }

    const isRevisedEstimate =
      estimate[0].revisionNumber && estimate[0].revisionNumber > 1;
    const hasAssignedArtisan = estimate[0].serviceRequest?.assignedArtisanId !== null;
    const requiresDualAcceptance = isRevisedEstimate && hasAssignedArtisan;

    let notificationStatus: "accepted" | "rejected" = action === "accept" ? "accepted" : "rejected";

    // Handle client rejection
    if (action === "reject") {
      // Update estimate status to rejected
      await db
        .update(billingEstimates)
        .set({
          status: BillingEstimateStatus.REJECTED,
          clientResponse: response,
          updatedAt: new Date(),
        })
        .where(eq(billingEstimates.id, parseInt(estimateId)));

      // ANY client rejection cancels the request
      const updateData: any = {
        status: ServiceRequestStatus.CANCELLED,
        updatedAt: new Date(),
      };

      // If there's an assigned artisan, unassign them
      if (hasAssignedArtisan) {
        updateData.assignedArtisanId = null;
      }

      await db
        .update(serviceRequests)
        .set(updateData)
        .where(eq(serviceRequests.id, estimate[0].serviceRequestId));

      // Record status change in history
      await db.insert(serviceRequestStatusHistory).values({
        serviceRequestId: estimate[0].serviceRequestId,
        status: ServiceRequestStatus.CANCELLED,
      });

      // TODO: Send notification to admin and artisan if assigned
    }

    // Handle client acceptance
    if (action === "accept") {
      if (requiresDualAcceptance) {
        // Mark client as accepted with timestamp
        await db
          .update(billingEstimates)
          .set({
            clientAccepted: true,
            clientResponseDate: new Date(),
            clientResponse: response,
            updatedAt: new Date(),
          })
          .where(eq(billingEstimates.id, parseInt(estimateId)));

        // Check if artisan has also accepted
        const artisanAccepted = estimate[0].estimate.artisanAccepted === true;

        if (artisanAccepted) {
          // Both parties accepted: set status to in_progress
          await db
            .update(billingEstimates)
            .set({
              status: BillingEstimateStatus.ACCEPTED,
              updatedAt: new Date(),
            })
            .where(eq(billingEstimates.id, parseInt(estimateId)));

          await db
            .update(serviceRequests)
            .set({
              status: ServiceRequestStatus.IN_PROGRESS,
              updatedAt: new Date(),
            })
            .where(eq(serviceRequests.id, estimate[0].serviceRequestId));

          // Record status change in history
          await db.insert(serviceRequestStatusHistory).values({
            serviceRequestId: estimate[0].serviceRequestId,
            status: ServiceRequestStatus.IN_PROGRESS,
          });
        } else {
          // Client accepted but artisan hasn't: keep status as awaiting_dual_acceptance
          // Status remains awaiting_dual_acceptance
        }
      } else {
        // Non-dual acceptance flow: existing logic
        await updateBillingEstimateStatus(
          parseInt(estimateId),
          BillingEstimateStatus.ACCEPTED,
          response
        );
      }
    }

    // Send email notification
    await sendEstimateResponseNotification(
      estimate[0].serviceRequestId,
      notificationStatus,
      user,
      response
    );

    return NextResponse.json({ success: true, message: "Response recorded successfully" });
  } catch (error) {
    console.error("Error responding to estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Email notification function
async function sendEstimateResponseNotification(
  serviceRequestId: number,
  status: "accepted" | "rejected",
  user: any,
  response?: string
) {
  try {
    // Get service request and estimate details
    const serviceRequest = await db
      .select({
        serviceType: serviceRequests.serviceType,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.id, serviceRequestId))
      .limit(1);

    const estimate = await db
      .select({
        estimatedPrice: billingEstimates.estimatedPrice,
      })
      .from(billingEstimates)
      .where(eq(billingEstimates.serviceRequestId, serviceRequestId))
      .limit(1);

    if (serviceRequest.length > 0 && estimate.length > 0) {
      // For now, we'll send to a default admin email
      // In production, you would get admin emails from a configuration
      const adminEmail = process.env.ADMIN_EMAIL || "admin@fixeo.com";

      const { sendEstimateResponseNotification: sendNotification } =
        await import("@/lib/email/notifications");

      await sendNotification(
        adminEmail,
        "Client name not available",
        serviceRequest[0].serviceType,
        status,
        estimate[0].estimatedPrice,
        response
      );
    }
  } catch (error) {
    console.error("Failed to send estimate response notification:", error);
  }
}
