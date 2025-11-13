import { UserRole } from "@/lib/auth/roles";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries/common";
import {
  artisanRefusedRequests,
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
    const { action } = body;

    if (!action || !["accept", "refuse"].includes(action)) {
      return NextResponse.json(
        { error: "Action invalide. Utilisez 'accept' ou 'refuse'" },
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
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Verify the artisan is assigned to this request
    if (estimate.request.assignedArtisanId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas assigné à cette demande" },
        { status: 403 }
      );
    }

    // Verify this is a revised estimate
    if (
      !estimate.estimate.revisionNumber ||
      estimate.estimate.revisionNumber <= 1
    ) {
      return NextResponse.json(
        { error: "Ce devis n'a pas été révisé" },
        { status: 400 }
      );
    }

    // Check if this requires dual acceptance (request status is awaiting_dual_acceptance)
    const requiresDualAcceptance = estimate.request.status === ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE;

    if (action === "accept") {
      if (requiresDualAcceptance) {
        // Dual acceptance flow: mark artisan as accepted
        await db
          .update(billingEstimates)
          .set({
            artisanAccepted: true,
            artisanResponseDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(billingEstimates.id, estimateId));

        // Check if client has also accepted
        const clientAccepted = estimate.estimate.clientAccepted === true;

        if (clientAccepted) {
          // Both parties accepted: set status to in_progress
          await db
            .update(billingEstimates)
            .set({
              status: BillingEstimateStatus.ACCEPTED,
              updatedAt: new Date(),
            })
            .where(eq(billingEstimates.id, estimateId));

          await db
            .update(serviceRequests)
            .set({
              status: ServiceRequestStatus.IN_PROGRESS,
              updatedAt: new Date(),
            })
            .where(eq(serviceRequests.id, estimate.request.id));

          // Record status change in history
          await db.insert(serviceRequestStatusHistory).values({
            serviceRequestId: estimate.request.id,
            status: ServiceRequestStatus.IN_PROGRESS,
          });

          // Create action record
          await db.insert(serviceRequestActions).values({
            serviceRequestId: estimate.request.id,
            actorId: user.id,
            actorType: "artisan",
            actionType: "estimate_acceptance",
            status: ServiceRequestStatus.IN_PROGRESS,
            completionNotes: "Artisan a accepté le devis révisé. Les deux parties ont accepté.",
          });

          return NextResponse.json({
            success: true,
            message: "Devis révisé accepté. Vous pouvez continuer votre mission.",
          });
        } else {
          // Artisan accepted but client hasn't: keep status as awaiting_dual_acceptance
          return NextResponse.json({
            success: true,
            message: "Votre acceptation a été enregistrée. En attente de l'acceptation du client.",
          });
        }
      } else {
        // Old flow for non-dual acceptance (estimate already accepted by client)
        await db
          .update(serviceRequests)
          .set({
            status: ServiceRequestStatus.IN_PROGRESS,
            updatedAt: new Date(),
          })
          .where(eq(serviceRequests.id, estimate.request.id));

        // Record status change in history
        await db.insert(serviceRequestStatusHistory).values({
          serviceRequestId: estimate.request.id,
          status: ServiceRequestStatus.IN_PROGRESS,
        });

        // Create action record
        await db.insert(serviceRequestActions).values({
          serviceRequestId: estimate.request.id,
          actorId: user.id,
          actorType: "artisan",
          actionType: "estimate_acceptance",
          status: ServiceRequestStatus.IN_PROGRESS,
          completionNotes: "Artisan a accepté le devis révisé",
        });

        return NextResponse.json({
          success: true,
          message: "Devis révisé accepté. Vous pouvez continuer votre mission.",
        });
      }
    } else {
      // Artisan refuses the revised estimate
      if (requiresDualAcceptance) {
        // Check if client has already accepted
        const clientAccepted = estimate.estimate.clientAccepted === true;

        if (clientAccepted) {
          // Client accepted but artisan refused: unassign artisan, set to awaiting_assignation
          await db.insert(artisanRefusedRequests).values({
            artisanId: user.id,
            serviceRequestId: estimate.request.id,
          });

          await db
            .update(serviceRequests)
            .set({
              assignedArtisanId: null,
              status: ServiceRequestStatus.AWAITING_ASSIGNATION,
              updatedAt: new Date(),
            })
            .where(eq(serviceRequests.id, estimate.request.id));

          // Record status change in history
          await db.insert(serviceRequestStatusHistory).values({
            serviceRequestId: estimate.request.id,
            status: ServiceRequestStatus.AWAITING_ASSIGNATION,
          });

          return NextResponse.json({
            success: true,
            message: "Devis refusé. La demande sera assignée à un autre artisan.",
          });
        } else {
          // Both refused or artisan refused first: cancel and unassign
          await db.insert(artisanRefusedRequests).values({
            artisanId: user.id,
            serviceRequestId: estimate.request.id,
          });

          await db
            .update(serviceRequests)
            .set({
              assignedArtisanId: null,
              status: ServiceRequestStatus.CANCELLED,
              updatedAt: new Date(),
            })
            .where(eq(serviceRequests.id, estimate.request.id));

          // Record status change in history
          await db.insert(serviceRequestStatusHistory).values({
            serviceRequestId: estimate.request.id,
            status: ServiceRequestStatus.CANCELLED,
          });

          return NextResponse.json({
            success: true,
            message: "Devis refusé. La demande a été annulée.",
          });
        }
      } else {
        // Old flow
        await db.insert(artisanRefusedRequests).values({
          artisanId: user.id,
          serviceRequestId: estimate.request.id,
        });

        await db
          .update(serviceRequests)
          .set({
            assignedArtisanId: null,
            status: ServiceRequestStatus.AWAITING_ASSIGNATION,
            updatedAt: new Date(),
          })
          .where(eq(serviceRequests.id, estimate.request.id));

        // Record status change in history
        await db.insert(serviceRequestStatusHistory).values({
          serviceRequestId: estimate.request.id,
          status: ServiceRequestStatus.AWAITING_ASSIGNATION,
        });

        // Create action record
        await db.insert(serviceRequestActions).values({
          serviceRequestId: estimate.request.id,
          actorId: user.id,
          actorType: "artisan",
          actionType: "estimate_refusal",
          status: ServiceRequestStatus.AWAITING_ASSIGNATION,
          disputeDetails:
            "Artisan a refusé le devis révisé. La demande est à nouveau disponible.",
        });

        return NextResponse.json({
          success: true,
          message:
            "Devis révisé refusé. La demande sera assignée à un autre artisan.",
        });
      }
    }
  } catch (error) {
    console.error("Error responding to revised estimate:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réponse au devis révisé" },
      { status: 500 }
    );
  }
}

