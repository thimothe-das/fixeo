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

    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id);

    if (!requestId) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Get the service request and verify artisan assignment
    const serviceRequestData = await getServiceRequestWithUser(requestId);
    if (!serviceRequestData) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Verify the user is the assigned artisan or is an admin
    const isAssignedArtisan =
      serviceRequestData.request.assignedArtisanId === user.id;
    const isAdmin = user.role === "admin";

    if (!isAssignedArtisan && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if the request is in a state that can be started
    if (
      serviceRequestData.request.status !==
      ServiceRequestStatus.AWAITING_ASSIGNATION
    ) {
      return NextResponse.json(
        { error: "This request cannot be started in its current state" },
        { status: 400 }
      );
    }

    console.log("Mission start request:", { requestId });

    // Update the service request status to in_progress
    const updatedRequest = await updateServiceRequestStatus(
      requestId,
      ServiceRequestStatus.IN_PROGRESS
    );

    return NextResponse.json({
      success: true,
      message: "Mission started successfully",
      newStatus: ServiceRequestStatus.IN_PROGRESS,
      updatedRequest,
    });
  } catch (error) {
    console.error("Error starting mission:", error);
    return NextResponse.json(
      { error: "Failed to start mission" },
      { status: 500 }
    );
  }
}
