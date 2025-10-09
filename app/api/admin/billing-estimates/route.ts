import { UserRole } from "@/lib/auth/roles";
import { db } from "@/lib/db/drizzle";
import { getAllBillingEstimates } from "@/lib/db/queries";
import { createBillingEstimate } from "@/lib/db/queries/admin";
import { getUser } from "@/lib/db/queries/common";

import { serviceRequests } from "@/lib/db/schema";
import { sendEstimateCreatedNotification } from "@/lib/email/notifications";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const estimates = await getAllBillingEstimates();

    return NextResponse.json(estimates);
  } catch (error) {
    console.error("Error fetching billing estimates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      serviceRequestId,
      estimatedPrice,
      description,
      breakdown,
      validUntil,
    } = body;

    if (!serviceRequestId || !estimatedPrice || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const estimateData = {
      serviceRequestId: parseInt(serviceRequestId),
      adminId: user.id,
      estimatedPrice: parseInt(estimatedPrice),
      description,
      breakdown: breakdown ? JSON.stringify(breakdown) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
    };

    const estimate = await createBillingEstimate(estimateData);

    // Get service request details for email notification
    const serviceRequest = await db
      .select({
        serviceType: serviceRequests.serviceType,
        clientEmail: serviceRequests.clientEmail,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.id, estimateData.serviceRequestId))
      .limit(1);

    // Send email notification to client
    if (serviceRequest.length > 0 && serviceRequest[0].clientEmail) {
      try {
        await sendEstimateCreatedNotification(
          serviceRequest[0].clientEmail,
          "Client name not available",
          serviceRequest[0].serviceType,
          estimateData.estimatedPrice,
          estimate.id
        );
      } catch (emailError) {
        console.error(
          "Failed to send estimate notification email:",
          emailError
        );
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Error creating billing estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
