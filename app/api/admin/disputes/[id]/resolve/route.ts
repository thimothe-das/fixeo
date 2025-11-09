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
    // Check if user is authenticated and is an admin
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id);

    if (!requestId || isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { resolutionNotes } = body;

    // Get the service request
    const serviceRequestData = await getServiceRequestWithUser(requestId);
    if (!serviceRequestData) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Check if the request is actually disputed
    const disputedStatuses = [
      ServiceRequestStatus.DISPUTED_BY_CLIENT,
      ServiceRequestStatus.DISPUTED_BY_ARTISAN,
      ServiceRequestStatus.DISPUTED_BY_BOTH,
    ];

    if (
      !disputedStatuses.includes(
        serviceRequestData.request.status as ServiceRequestStatus
      )
    ) {
      return NextResponse.json(
        { error: "This request is not in disputed status" },
        { status: 400 }
      );
    }

    // Update the service request status to RESOLVED
    const updatedRequest = await updateServiceRequestStatus(
      requestId,
      ServiceRequestStatus.RESOLVED,
      {
        notes: resolutionNotes || "Dispute resolved by admin",
        actorId: user.id,
        actorType: "admin",
        actionType: "status_change",
      }
    );

    // Send notification emails
    await sendResolutionNotifications(serviceRequestData, resolutionNotes);

    return NextResponse.json({
      success: true,
      message: "Dispute resolved successfully",
      updatedRequest,
    });
  } catch (error) {
    console.error("Error resolving dispute:", error);
    return NextResponse.json(
      { error: "Failed to resolve dispute" },
      { status: 500 }
    );
  }
}

// Email notification function
async function sendResolutionNotifications(
  serviceRequestData: any,
  resolutionNotes?: string
) {
  try {
    // TODO: Implement email notifications
    // Send to client
    if (serviceRequestData.client?.email) {
      console.log(
        `Should send resolution notification to client: ${serviceRequestData.client.email}`
      );
    }

    // Send to artisan if assigned
    if (serviceRequestData.request.assignedArtisanId) {
      console.log(
        `Should send resolution notification to artisan ID: ${serviceRequestData.request.assignedArtisanId}`
      );
    }
  } catch (error) {
    console.error("Failed to send resolution notifications:", error);
    // Don't fail the main operation if email fails
  }
}

