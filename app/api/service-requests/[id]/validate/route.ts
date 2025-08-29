import { NextRequest, NextResponse } from "next/server";
import { getUser, updateServiceRequestStatus, getServiceRequestWithUser } from "@/lib/db/queries";
import { ServiceRequestStatus } from "@/lib/db/schema";

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

    const { action, disputeReason, disputeDetails } = await request.json();
    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id);
    if (!requestId || !action || !['approve', 'dispute'].includes(action)) {

      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Get the service request and verify ownership
    const serviceRequestData = await getServiceRequestWithUser(requestId);
    if (!serviceRequestData) {
      return NextResponse.json({ error: "Service request not found" }, { status: 404 });
    }

    // Verify the user owns this request
    if (serviceRequestData.request.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if the request is in a state that can be validated
    const validStatesForValidation = [
      ServiceRequestStatus.IN_PROGRESS,
      ServiceRequestStatus.ARTISAN_VALIDATED,
      ServiceRequestStatus.RESOLVED
    ];
    
    if (!validStatesForValidation.includes(serviceRequestData.request.status as ServiceRequestStatus)) {
      return NextResponse.json(
        { error: "This request cannot be validated in its current state" },
        { status: 400 }
      );
    }

    // Determine the new status based on validation action
    let newStatus: ServiceRequestStatus;
    if (action === "approve") {
      // Check if artisan already validated
      if (serviceRequestData.request.status === ServiceRequestStatus.ARTISAN_VALIDATED) {
        newStatus = ServiceRequestStatus.COMPLETED; // Both have validated
      } else {
        newStatus = ServiceRequestStatus.CLIENT_VALIDATED; // Client validated, waiting for artisan
      }
    } else if (action === "dispute") {
      newStatus = ServiceRequestStatus.DISPUTED_BY_CLIENT;
      
      // Validate dispute fields
      if (!disputeReason || !disputeDetails?.trim()) {
        return NextResponse.json(
          { error: "Dispute reason and details are required" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    console.log("Mission validation request:", {
      requestId,
      action,
      disputeReason,
      disputeDetails,
      newStatus
    });

    // Update the service request status
    const updatedRequest = await updateServiceRequestStatus(requestId, newStatus, {
      disputeReason,
      disputeDetails
    });

    // Send notifications
    await sendValidationNotifications(serviceRequestData, action, {
      disputeReason,
      disputeDetails,
      user
    });

    return NextResponse.json({
      success: true,
      message: action === "approve" 
        ? "Mission validated successfully" 
        : "Dispute created successfully",
      newStatus,
      updatedRequest
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
  action: 'approve' | 'dispute',
  details: {
    disputeReason?: string;
    disputeDetails?: string;
    user: any;
  }
) {
  try {
    const { sendValidationNotification } = await import('@/lib/email/notifications');
    
    // Send to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fixeo.com';
    
    await sendValidationNotification(
      adminEmail,
      serviceRequestData.client?.name || details.user.name || 'Client',
      serviceRequestData.request.serviceType,
      action,
      details.disputeReason,
      details.disputeDetails
    );

    // If there's an assigned artisan, notify them too
    if (serviceRequestData.request.assignedArtisanId) {
      // TODO: Get artisan email and send notification
      console.log(`Should notify artisan ${serviceRequestData.request.assignedArtisanId} about validation: ${action}`);
    }
  } catch (error) {
    console.error('Failed to send validation notifications:', error);
    // Don't fail the main operation if email fails
  }
}
