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

    const { type, notes, issueType, photos } = await request.json();
    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id);
console.log(requestId, type)
    if (!requestId || !type || !['success', 'issue', 'impossible', 'validate', 'dispute'].includes(type)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Get the service request and verify artisan assignment
    const serviceRequestData = await getServiceRequestWithUser(requestId);
    if (!serviceRequestData) {
      return NextResponse.json({ error: "Service request not found" }, { status: 404 });
    }

    // Verify the user is the assigned artisan or is an admin
    const isAssignedArtisan = serviceRequestData.request.assignedArtisanId === user.id;
    const isAdmin = user.role === 'admin';
    
    if (!isAssignedArtisan && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Check if the request is in a state that can be completed or validated
    const validStatesForCompletion = [
      ServiceRequestStatus.IN_PROGRESS,
      ServiceRequestStatus.CLIENT_VALIDATED,
      ServiceRequestStatus.RESOLVED
    ];
    
    if (!validStatesForCompletion.includes(serviceRequestData.request.status as ServiceRequestStatus)) {
        return NextResponse.json(
        { error: "This request cannot be completed in its current state" },
        { status: 400 }
      );
    }
    
    console.log("Mission completion request:", {
      requestId,
      type,
      notes,
      issueType,
      photos
    });

    // Determine the new status based on completion type
    let newStatus: ServiceRequestStatus;
    if (type === "success") {
      newStatus = ServiceRequestStatus.IN_PROGRESS; // Ready for validation phase
    } else if (type === "validate") {
      // For artisan validation - check if client already validated
      if (serviceRequestData.request.status === ServiceRequestStatus.CLIENT_VALIDATED) {
        newStatus = ServiceRequestStatus.COMPLETED; // Both have validated - mission complete
      } else {
        newStatus = ServiceRequestStatus.ARTISAN_VALIDATED; // Artisan validated first, waiting for client
      }
    } else if (type === "dispute") {
      newStatus = ServiceRequestStatus.DISPUTED_BY_ARTISAN;
    } else {
      return NextResponse.json(
        { error: "Invalid completion type" },
        { status: 400 }
      );
    }
console.log(newStatus)
    // Update the service request status
    const updatedRequest = await updateServiceRequestStatus(requestId, newStatus, {
      completionNotes: notes,
      completionPhotos: photos,
      issueType
    });

    // Send notifications to the client
    await sendCompletionNotifications(serviceRequestData, type, {
      notes,
      issueType,
      photos,
      artisan: user
    });

    return NextResponse.json({
      success: true,
      message: "Mission completion recorded successfully",
      newStatus,
      updatedRequest
    });

  } catch (error) {
    console.error("Error completing mission:", error);
    return NextResponse.json(
      { error: "Failed to complete mission" },
      { status: 500 }
    );
  }
}

// Email notification function
async function sendCompletionNotifications(
  serviceRequestData: any,
  completionType: 'success' | 'issue' | 'impossible' | 'validate' | 'dispute',
  details: {
    notes?: string;
    issueType?: string;
    photos?: string;
    artisan: any;
  }
) {
  try {
    // Send notification to client
    if (serviceRequestData.client?.email) {
      console.log(`Should notify client ${serviceRequestData.client.email} about completion: ${completionType}`);
      // TODO: Implement client notification email
    }
    
    // Send to admin for disputes
    if (completionType === 'dispute') {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@fixeo.com';
      console.log(`Should notify admin ${adminEmail} about completion dispute: ${completionType}`);
      // TODO: Implement admin notification for disputes
    }
  } catch (error) {
    console.error('Failed to send completion notifications:', error);
    // Don't fail the main operation if email fails
  }
}
