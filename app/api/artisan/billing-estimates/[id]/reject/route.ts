import { UserRole } from "@/lib/auth/roles";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries/common";
import {
  billingEstimates,
  BillingEstimateStatus,
  serviceRequestActions,
  serviceRequests,
  ServiceRequestStatus,
  serviceRequestStatusHistory,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== UserRole.PROFESSIONAL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const estimateId = parseInt(resolvedParams.id);

    if (isNaN(estimateId)) {
      return NextResponse.json(
        { error: "Invalid estimate ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length < 50) {
      return NextResponse.json(
        {
          error: "Une raison détaillée est obligatoire (minimum 50 caractères)",
        },
        { status: 400 }
      );
    }

    // Get the estimate with service request details
    const [estimate] = await db
      .select({
        estimate: billingEstimates,
        request: serviceRequests,
      })
      .from(billingEstimates)
      .innerJoin(
        serviceRequests,
        eq(billingEstimates.serviceRequestId, serviceRequests.id)
      )
      .where(eq(billingEstimates.id, estimateId))
      .limit(1);

    if (!estimate) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
    }

    // Verify the artisan is assigned to this request
    if (estimate.request.assignedArtisanId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas assigné à cette demande" },
        { status: 403 }
      );
    }

    // Verify the request is in progress
    if (estimate.request.status !== ServiceRequestStatus.IN_PROGRESS) {
      return NextResponse.json(
        {
          error:
            "Le devis ne peut être rejeté que lorsque la demande est en cours",
        },
        { status: 400 }
      );
    }

    // Verify the estimate is accepted
    if (estimate.estimate.status !== BillingEstimateStatus.ACCEPTED) {
      return NextResponse.json(
        { error: "Seul un devis accepté peut être rejeté" },
        { status: 400 }
      );
    }

    // Check if estimate already rejected
    if (estimate.estimate.rejectedByArtisanId) {
      return NextResponse.json(
        { error: "Ce devis a déjà été rejeté" },
        { status: 400 }
      );
    }

    // Update estimate with rejection details
    await db
      .update(billingEstimates)
      .set({
        artisanRejectionReason: reason,
        rejectedByArtisanId: user.id,
        rejectedAt: new Date(),
        updatedAt: new Date(),
        status: BillingEstimateStatus.REJECTED,
      })
      .where(eq(billingEstimates.id, estimateId));

    // Update service request status to awaiting_estimate_revision
    await db
      .update(serviceRequests)
      .set({
        status: ServiceRequestStatus.AWAITING_ESTIMATE_REVISION,
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, estimate.request.id));

    // Record status change in history
    await db.insert(serviceRequestStatusHistory).values({
      serviceRequestId: estimate.request.id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE_REVISION,
    });

    // Create action record
    await db.insert(serviceRequestActions).values({
      serviceRequestId: estimate.request.id,
      actorId: user.id,
      actorType: "artisan",
      actionType: "estimate_rejection",
      disputeReason: "workload_exceeded",
      disputeDetails: reason,
      status: ServiceRequestStatus.AWAITING_ESTIMATE_REVISION,
    });

    // TODO: Send notification to admin
    // await sendArtisanQuoteRejectionNotification(...)

    return NextResponse.json({
      success: true,
      message: "Devis rejeté avec succès. L'administrateur va le réviser.",
    });
  } catch (error) {
    console.error("Error rejecting estimate:", error);
    return NextResponse.json(
      { error: "Erreur lors du rejet du devis" },
      { status: 500 }
    );
  }
}
