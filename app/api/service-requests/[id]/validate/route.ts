import {
  getServiceRequestWithUser,
  updateServiceRequestStatus,
} from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries/common";
import { ServiceRequestStatus } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      action, 
      disputeReason, 
      disputeDetails,
      disputePhotos,
      validationDescription,
      validationPhotos 
    } = await request.json();
    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id);
    if (!requestId || !action || !["approve", "dispute"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Get the service request and verify ownership first
    const serviceRequestData = await getServiceRequestWithUser(requestId);
    if (!serviceRequestData) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Verify the user is either the client who created the request or the assigned artisan
    const isClient = serviceRequestData.request.userId === user.id;
    const isAssignedArtisan =
      serviceRequestData.request.assignedArtisanId === user.id;

    // Validate required fields for approval (only for artisan)
    if (action === "approve" && isAssignedArtisan) {
      if (!validationDescription || validationDescription.trim().length < 20) {
        return NextResponse.json(
          { error: "Description du travail effectué requise (minimum 20 caractères)" },
          { status: 400 }
        );
      }
      if (!validationPhotos || !Array.isArray(validationPhotos) || validationPhotos.length < 1) {
        return NextResponse.json(
          { error: "Au moins une photo est requise pour valider la mission" },
          { status: 400 }
        );
      }
    }

    // Validate required fields for dispute
    if (action === "dispute") {
      if (!disputeReason || disputeReason.trim().length === 0) {
        return NextResponse.json(
          { error: "Type de problème requis" },
          { status: 400 }
        );
      }
      if (!disputeDetails || disputeDetails.trim().length < 10) {
        return NextResponse.json(
          { error: "Détails du problème requis (minimum 10 caractères)" },
          { status: 400 }
        );
      }
    }

    if (!isClient && !isAssignedArtisan) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if the request is in a state that can be validated
    const validStatesForValidation = [
      ServiceRequestStatus.IN_PROGRESS,
      ServiceRequestStatus.ARTISAN_VALIDATED,
      ServiceRequestStatus.CLIENT_VALIDATED,
      ServiceRequestStatus.RESOLVED,
    ];

    if (
      !validStatesForValidation.includes(
        serviceRequestData.request.status as ServiceRequestStatus
      )
    ) {
      return NextResponse.json(
        { error: "This request cannot be validated in its current state" },
        { status: 400 }
      );
    }

    // Determine the new status based on validation action and user role
    let newStatus: ServiceRequestStatus;
    if (action === "approve") {
      if (isClient) {
        // Client is validating
        if (
          serviceRequestData.request.status ===
          ServiceRequestStatus.ARTISAN_VALIDATED
        ) {
          newStatus = ServiceRequestStatus.COMPLETED; // Both have validated
        } else {
          newStatus = ServiceRequestStatus.CLIENT_VALIDATED; // Client validated, waiting for artisan
        }
      } else if (isAssignedArtisan) {
        // Artisan is validating
        if (
          serviceRequestData.request.status ===
          ServiceRequestStatus.CLIENT_VALIDATED
        ) {
          newStatus = ServiceRequestStatus.COMPLETED; // Both have validated
        } else {
          newStatus = ServiceRequestStatus.ARTISAN_VALIDATED; // Artisan validated, waiting for client
        }
      } else {
        return NextResponse.json(
          { error: "Unauthorized user type" },
          { status: 403 }
        );
      }
    } else if (action === "dispute") {
      if (isClient) {
        newStatus = ServiceRequestStatus.DISPUTED_BY_CLIENT;
      } else if (isAssignedArtisan) {
        newStatus = ServiceRequestStatus.DISPUTED_BY_ARTISAN;
      } else {
        return NextResponse.json(
          { error: "Unauthorized user type" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    console.log("Mission validation request:", {
      requestId,
      action,
      disputeReason,
      disputeDetails,
      disputePhotos: disputePhotos?.length || 0,
      validationDescription,
      validationPhotos: validationPhotos?.length || 0,
      newStatus,
    });

    // Update the service request status
    const updatedRequest = await updateServiceRequestStatus(
      requestId,
      newStatus,
      {
        disputeReason,
        disputeDetails,
        disputePhotos,
        notes: validationDescription,
        photos: validationPhotos,
        actorId: user.id,
        actorType: isClient
          ? "client"
          : isAssignedArtisan
          ? "artisan"
          : "admin",
        actionType: action === "dispute" ? "dispute" : "validation",
      }
    );

    // Send notifications
    await sendValidationNotifications(serviceRequestData, action, {
      disputeReason,
      disputeDetails,
      user,
    });

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Mission validated successfully"
          : "Dispute created successfully",
      newStatus,
      updatedRequest,
    });
  } catch (error) {
    console.error("Error validating mission:", error);
    return NextResponse.json(
      { error: "Failed to validate mission" },
      { status: 500 }
    );
  }
}

// Email notification function
async function sendValidationNotifications(
  serviceRequestData: any,
  action: "approve" | "dispute",
  details: {
    disputeReason?: string;
    disputeDetails?: string;
    user: any;
  }
) {
  try {
    const { sendValidationNotification } = await import(
      "@/lib/email/notifications"
    );

    // Send to admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@fixeo.com";

    await sendValidationNotification(
      adminEmail,
      serviceRequestData.client?.name || details.user.name || "Client",
      serviceRequestData.request.serviceType,
      action,
      details.disputeReason,
      details.disputeDetails
    );

    // If there's an assigned artisan, notify them too
    if (serviceRequestData.request.assignedArtisanId) {
      // TODO: Get artisan email and send notification
      console.log(
        `Should notify artisan ${serviceRequestData.request.assignedArtisanId} about validation: ${action}`
      );
    }
  } catch (error) {
    console.error("Failed to send validation notifications:", error);
    // Don't fail the main operation if email fails
  }
}
