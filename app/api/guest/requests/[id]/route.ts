import { db } from "@/lib/db/drizzle";
import {
  BillingEstimateStatus,
  billingEstimates,
  clientProfiles,
  professionalProfiles,
  serviceRequests,
  users,
} from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Get the guest token from query params or headers
    const { searchParams } = new URL(request.url);
    const guestToken =
      searchParams.get("token") || request.headers.get("x-guest-token");

    if (!guestToken) {
      return NextResponse.json(
        { error: "Guest token is required" },
        { status: 401 }
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
        guestToken: serviceRequests.guestToken,
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
      .where(
        and(
          eq(serviceRequests.id, requestId),
          eq(serviceRequests.guestToken, guestToken)
        )
      )
      .limit(1);

    if (serviceRequestResult.length === 0) {
      return NextResponse.json(
        { error: "Service request not found or invalid token" },
        { status: 404 }
      );
    }

    const serviceRequest = serviceRequestResult[0];

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

    // Construct client name from available information
    const clientName =
      serviceRequest.client?.firstName && serviceRequest.client?.lastName
        ? `${serviceRequest.client.firstName} ${serviceRequest.client.lastName}`.trim()
        : serviceRequest.client?.name || null;

    // Construct the response with all necessary data
    const response = {
      id: serviceRequest.id,
      title: serviceRequest.title,
      serviceType: serviceRequest.serviceType,
      urgency: serviceRequest.urgency,
      description: serviceRequest.description,
      location: serviceRequest.location,
      status: serviceRequest.status,
      estimatedPrice: serviceRequest.estimatedPrice,
      photos: serviceRequest.photos,
      createdAt: serviceRequest.createdAt,
      clientEmail: serviceRequest.clientEmail,
      clientName,
      clientPhone: serviceRequest.client?.phone,
      assignedArtisan: serviceRequest.assignedArtisan?.id
        ? {
            id: serviceRequest.assignedArtisan.id,
            name: serviceRequest.assignedArtisan.name,
            firstName: serviceRequest.assignedArtisan.firstName,
            lastName: serviceRequest.assignedArtisan.lastName,
            specialty: serviceRequest.assignedArtisan.specialty,
          }
        : null,
      billingEstimates: estimates,
      timeline: {
        created: {
          date: serviceRequest.createdAt,
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
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching guest service request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
