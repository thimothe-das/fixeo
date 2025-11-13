import { UserRole } from "@/lib/auth/roles";
import { db } from "@/lib/db/drizzle";
import { getAllBillingEstimates } from "@/lib/db/queries";
import { createBillingEstimate } from "@/lib/db/queries/admin";
import { expirePendingEstimates } from "@/lib/db/queries/billing-estimates";
import { getUser } from "@/lib/db/queries/common";

import { billingEstimates, BillingEstimateStatus, serviceRequests } from "@/lib/db/schema";
import { sendEstimateCreatedNotification } from "@/lib/email/notifications";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // First, expire any pending estimates that have passed their deadline
    await expirePendingEstimates();

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

    // Get service request to check status
    const [serviceRequest] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, parseInt(serviceRequestId)))
      .limit(1);

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Demande de service non trouvée" },
        { status: 404 }
      );
    }

    const isRevision =
      serviceRequest.status === "awaiting_estimate_revision";

    // Check if there's already a pending estimate for this request (only if not a revision)
    if (!isRevision) {
      const existingPendingEstimate = await db
        .select()
        .from(billingEstimates)
        .where(
          and(
            eq(billingEstimates.serviceRequestId, parseInt(serviceRequestId)),
            eq(billingEstimates.status, BillingEstimateStatus.PENDING)
          )
        )
        .limit(1);

      if (existingPendingEstimate.length > 0) {
        return NextResponse.json(
          {
            error:
              "Il existe déjà un devis en attente pour cette demande. Veuillez attendre que le client réponde avant d'en créer un nouveau.",
          },
          { status: 400 }
        );
      }
    }

    // Get the latest estimate to determine revision number
    let revisionNumber = 1;
    if (isRevision) {
      const latestEstimate = await db
        .select()
        .from(billingEstimates)
        .where(eq(billingEstimates.serviceRequestId, parseInt(serviceRequestId)))
        .orderBy(billingEstimates.createdAt)
        .limit(1);

      if (latestEstimate.length > 0) {
        revisionNumber = (latestEstimate[0].revisionNumber || 1) + 1;
      }
    }

    // Auto-set validUntil to 48 hours from now if not provided
    const defaultValidUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const estimateData = {
      serviceRequestId: parseInt(serviceRequestId),
      adminId: user.id,
      estimatedPrice: parseInt(estimatedPrice),
      description,
      breakdown: breakdown ? JSON.stringify(breakdown) : undefined,
      validUntil: validUntil ? new Date(validUntil) : defaultValidUntil,
      revisionNumber,
    };

    const estimate = await createBillingEstimate(estimateData);

    // Send email notification to client
    if (serviceRequest.clientEmail) {
      try {
        await sendEstimateCreatedNotification(
          serviceRequest.clientEmail,
          "Client name not available",
          serviceRequest.serviceType,
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
