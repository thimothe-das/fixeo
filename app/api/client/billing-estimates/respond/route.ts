import { db } from "@/lib/db/drizzle";
import { updateBillingEstimateStatus } from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries/common";
import {
  BillingEstimateStatus,
  billingEstimates,
  serviceRequests,
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

    // Verify the estimate belongs to the user's request
    const estimate = await db
      .select({
        id: billingEstimates.id,
        serviceRequestId: billingEstimates.serviceRequestId,
        status: billingEstimates.status,
        serviceRequest: {
          userId: serviceRequests.userId,
        },
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

    // Update estimate status
    const status =
      action === "accept"
        ? BillingEstimateStatus.ACCEPTED
        : BillingEstimateStatus.REJECTED;
    const updatedEstimate = await updateBillingEstimateStatus(
      parseInt(estimateId),
      status,
      response
    );

    // Send email notification (we'll implement this next)
    await sendEstimateResponseNotification(
      estimate[0].serviceRequestId,
      status,
      user,
      response
    );

    return NextResponse.json(updatedEstimate);
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
