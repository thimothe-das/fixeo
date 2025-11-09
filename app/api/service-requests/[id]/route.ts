import { UserRole } from "@/lib/auth/roles";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries/common";
import {
  billingEstimates,
  BillingEstimateStatus,
  clientProfiles,
  professionalProfiles,
  serviceRequests,
  ServiceRequestStatus,
  serviceRequestStatusHistory,
  users,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Get the service request with assigned artisan and client details
    const clientUsers = alias(users, "client_users");
    const artisanUsers = alias(users, "artisan_users");

    const serviceRequestResult = await db
      .select({
        id: serviceRequests.id,
        title: serviceRequests.title,
        serviceType: serviceRequests.serviceType,
        urgency: serviceRequests.urgency,
        description: serviceRequests.description,
        location: serviceRequests.location,
        status: serviceRequests.status,
        estimatedPrice: serviceRequests.estimatedPrice,
        photos: serviceRequests.photos,
        createdAt: serviceRequests.createdAt,
        userId: serviceRequests.userId,
        clientEmail: serviceRequests.clientEmail,
        client: {
          id: clientUsers.id,
          name: clientUsers.name,
          email: clientUsers.email,
          firstName: clientProfiles.firstName,
          lastName: clientProfiles.lastName,
          phone: clientProfiles.phone,
        },
        assignedArtisan: {
          id: artisanUsers.id,
          name: artisanUsers.name,
          email: artisanUsers.email,
          firstName: professionalProfiles.firstName,
          lastName: professionalProfiles.lastName,
          specialty: professionalProfiles.specialties,
        },
      })
      .from(serviceRequests)
      .leftJoin(clientUsers, eq(serviceRequests.userId, clientUsers.id))
      .leftJoin(clientProfiles, eq(clientUsers.id, clientProfiles.userId))
      .leftJoin(
        artisanUsers,
        eq(serviceRequests.assignedArtisanId, artisanUsers.id)
      )
      .leftJoin(
        professionalProfiles,
        eq(artisanUsers.id, professionalProfiles.userId)
      )
      .where(eq(serviceRequests.id, requestId))
      .limit(1);

    if (serviceRequestResult.length === 0) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    const request = serviceRequestResult[0];

    // Check if user has access to this request
    // User can access if they are the owner, assigned artisan, or admin
    const hasAccess =
      request.userId === user.id || // Owner
      request.assignedArtisan?.id === user.id || // Assigned artisan
      user.role === UserRole.ADMIN; // Admin

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get billing estimates for this request
    const estimates = await db
      .select({
        id: billingEstimates.id,
        estimatedPrice: billingEstimates.estimatedPrice,
        status: billingEstimates.status,
        validUntil: billingEstimates.validUntil,
        createdAt: billingEstimates.createdAt,
        description: billingEstimates.description,
        breakdown: billingEstimates.breakdown,
      })
      .from(billingEstimates)
      .where(eq(billingEstimates.serviceRequestId, requestId))
      .orderBy(desc(billingEstimates.createdAt));

    // Get status history for this request
    const statusHistoryResults = await db
      .select({
        status: serviceRequestStatusHistory.status,
        changedAt: serviceRequestStatusHistory.changedAt,
      })
      .from(serviceRequestStatusHistory)
      .where(eq(serviceRequestStatusHistory.serviceRequestId, requestId))
      .orderBy(serviceRequestStatusHistory.changedAt);

    // Convert status history to a map for easy lookup
    const statusHistory: Record<string, string> = {};
    for (const entry of statusHistoryResults) {
      // Keep the first occurrence of each status
      if (!statusHistory[entry.status]) {
        statusHistory[entry.status] = entry.changedAt.toISOString();
      }
    }

    // Construct client name from available information
    const clientName =
      request.client?.firstName && request.client?.lastName
        ? `${request.client.firstName} ${request.client.lastName}`.trim()
        : request.client?.name || null;

    // Construct the response with all necessary data
    const response = {
      ...request,
      clientName,
      clientPhone: request.client?.phone,
      billingEstimates: estimates,
      statusHistory,
      // Add mock timeline data for now - in a real app this would come from activity logs
      timeline: {
        created: {
          date: request.createdAt,
          actor: "Client",
        },
        ...(estimates.length > 0 && {
          quote: {
            date: estimates[0].createdAt,
            actor: "Admin",
          },
        }),
        ...(estimates.some(
          (e) => e.status === BillingEstimateStatus.ACCEPTED
        ) && {
          accepted: {
            date: estimates.find(
              (e) => e.status === BillingEstimateStatus.ACCEPTED
            )?.createdAt,
            actor: "Client",
          },
        }),
        // TODO: Add completed timeline when status is completed
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching service request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Get the service request to check ownership and status
    const [existingRequest] = await db
      .select({
        userId: serviceRequests.userId,
        assignedArtisanId: serviceRequests.assignedArtisanId,
        status: serviceRequests.status,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestId))
      .limit(1);

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to update (owner, assigned artisan, or admin)
    const canUpdate =
      existingRequest.userId === user.id ||
      existingRequest.assignedArtisanId === user.id ||
      user.role === UserRole.ADMIN;

    if (!canUpdate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse the request body
    const body = await request.json();
    const { photos, location, description, title } = body;

    // Check if status allows editing (only for client editing location/description/title)
    // Photos can be updated at any time, but location/description/title only in early stages
    if ((location !== undefined || description !== undefined || title !== undefined) && 
        existingRequest.userId === user.id) {
      const allowedStatuses = [
        ServiceRequestStatus.AWAITING_ESTIMATE,
        ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
      ];
      
      if (!allowedStatuses.includes(existingRequest.status as ServiceRequestStatus)) {
        return NextResponse.json(
          { error: "Cette demande ne peut plus être modifiée" },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updateData: {
      photos?: string;
      location?: string;
      description?: string;
      title?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (photos !== undefined) {
      updateData.photos = photos;
    }
    if (location !== undefined) {
      updateData.location = location;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (title !== undefined) {
      updateData.title = title;
    }

    // Update the service request
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set(updateData)
      .where(eq(serviceRequests.id, requestId))
      .returning();

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating service request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
