import { UserRole } from "@/lib/auth/roles";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries/common";
import {
  serviceRequests,
  ServiceRequestStatus,
  serviceRequestStatusHistory,
} from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== UserRole.PROFESSIONAL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Check if the request exists and is still available
    const [existingRequest] = await db
      .select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.id, requestId),
          eq(serviceRequests.status, ServiceRequestStatus.AWAITING_ASSIGNATION),
          isNull(serviceRequests.assignedArtisanId)
        )
      )
      .limit(1);

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Request not found or already assigned" },
        { status: 404 }
      );
    }

    // Assign the request to the artisan and move to in-progress
    await db
      .update(serviceRequests)
      .set({
        assignedArtisanId: user.id,
        status: ServiceRequestStatus.IN_PROGRESS,
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, requestId));

    // Record status change in history
    await db.insert(serviceRequestStatusHistory).values({
      serviceRequestId: requestId,
      status: ServiceRequestStatus.IN_PROGRESS,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting service request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
