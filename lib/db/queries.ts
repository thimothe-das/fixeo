import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import {
  billingEstimates,
  clientProfiles,
  conversations,
  serviceRequests,
  ServiceRequestStatus,
  users,
} from "./schema";

// Billing estimate functions

export async function getBillingEstimatesByRequestId(serviceRequestId: number) {
  return await db
    .select({
      id: billingEstimates.id,
      serviceRequestId: billingEstimates.serviceRequestId,
      adminId: billingEstimates.adminId,
      estimatedPrice: billingEstimates.estimatedPrice,
      description: billingEstimates.description,
      breakdown: billingEstimates.breakdown,
      validUntil: billingEstimates.validUntil,
      status: billingEstimates.status,
      clientResponse: billingEstimates.clientResponse,
      createdAt: billingEstimates.createdAt,
      updatedAt: billingEstimates.updatedAt,
      admin: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(billingEstimates)
    .leftJoin(users, eq(billingEstimates.adminId, users.id))
    .where(eq(billingEstimates.serviceRequestId, serviceRequestId))
    .orderBy(desc(billingEstimates.createdAt));
}

export async function getAllBillingEstimates() {
  return await db
    .select({
      id: billingEstimates.id,
      serviceRequestId: billingEstimates.serviceRequestId,
      adminId: billingEstimates.adminId,
      estimatedPrice: billingEstimates.estimatedPrice,
      description: billingEstimates.description,
      breakdown: billingEstimates.breakdown,
      validUntil: billingEstimates.validUntil,
      status: billingEstimates.status,
      clientResponse: billingEstimates.clientResponse,
      createdAt: billingEstimates.createdAt,
      updatedAt: billingEstimates.updatedAt,
      admin: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(billingEstimates)
    .leftJoin(users, eq(billingEstimates.adminId, users.id))
    .orderBy(desc(billingEstimates.createdAt));
}

export async function getBillingEstimateById(
  estimateId: number,
  userId?: number
) {
  const query = db
    .select({
      id: billingEstimates.id,
      serviceRequestId: billingEstimates.serviceRequestId,
      adminId: billingEstimates.adminId,
      estimatedPrice: billingEstimates.estimatedPrice,
      description: billingEstimates.description,
      breakdown: billingEstimates.breakdown,
      validUntil: billingEstimates.validUntil,
      status: billingEstimates.status,
      clientResponse: billingEstimates.clientResponse,
      createdAt: billingEstimates.createdAt,
      updatedAt: billingEstimates.updatedAt,
      admin: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      serviceRequest: {
        id: serviceRequests.id,
        userId: serviceRequests.userId,
        serviceType: serviceRequests.serviceType,
        description: serviceRequests.description,
        location: serviceRequests.location,
        status: serviceRequests.status,
        title: serviceRequests.title,
        createdAt: serviceRequests.createdAt,
        assignedArtisanId: serviceRequests.assignedArtisanId,
      },
    })
    .from(billingEstimates)
    .leftJoin(users, eq(billingEstimates.adminId, users.id))
    .leftJoin(
      serviceRequests,
      eq(billingEstimates.serviceRequestId, serviceRequests.id)
    )
    .where(eq(billingEstimates.id, estimateId));

  const result = await query.limit(1);

  if (result.length === 0) {
    return null;
  }

  const estimate = result[0];

  // If userId is provided (for client access), verify they own the related service request
  if (userId && estimate.serviceRequest?.userId !== userId) {
    return null;
  }

  return estimate;
}

export async function updateBillingEstimateStatus(
  estimateId: number,
  status: "accepted" | "rejected" | "expired",
  clientResponse?: string
) {
  const [estimate] = await db
    .update(billingEstimates)
    .set({
      status,
      clientResponse,
      updatedAt: new Date(),
    })
    .where(eq(billingEstimates.id, estimateId))
    .returning();

  // If accepted, update the service request status
  if (status === "accepted" && estimate) {
    await db
      .update(serviceRequests)
      .set({
        status: ServiceRequestStatus.AWAITING_ASSIGNATION, // Ready for artisan assignment
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, estimate.serviceRequestId));
  }

  return estimate;
}

export async function updateServiceRequestStatus(
  requestId: number,
  status: ServiceRequestStatus,
  additionalData?: {
    disputeReason?: string;
    disputeDetails?: string;
    completionNotes?: string;
    completionPhotos?: string;
    issueType?: string;
  }
) {
  const [updatedRequest] = await db
    .update(serviceRequests)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(serviceRequests.id, requestId))
    .returning();

  // If it's a dispute, we might want to log this separately
  // For now, we'll just store the dispute details in a separate table if needed

  return updatedRequest;
}

export async function updateServiceRequestDownPaymentSuccess(
  requestId: number,
  guestToken?: string
) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  const request = await getServiceRequestById(requestId);
  const userId = request?.userId;
  if (!userId && !guestToken) {
    throw new Error("User ID or guest token is required");
  }

  const operation = userId
    ? eq(serviceRequests.userId, userId)
    : eq(serviceRequests.guestToken, guestToken!);

  const [updatedRequest] = await db
    .update(serviceRequests)
    .set({
      downPaymentPaid: true,
      updatedAt: new Date(),
    })
    .where(and(eq(serviceRequests.id, requestId), operation))
    .returning();

  return updatedRequest;
}

export async function updateServiceRequestDownPaymentByGuestToken(
  guestToken: string
) {
  if (!guestToken) {
    throw new Error("Guest token is required");
  }

  const [updatedRequest] = await db
    .update(serviceRequests)
    .set({
      downPaymentPaid: true,
      updatedAt: new Date(),
    })
    .where(eq(serviceRequests.guestToken, guestToken))
    .returning();

  return updatedRequest;
}

export async function getServiceRequestById(requestId: number) {
  const result = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, requestId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getServiceRequestWithUser(requestId: number) {
  const result = await db
    .select({
      request: serviceRequests,
      client: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(serviceRequests)
    .leftJoin(users, eq(serviceRequests.userId, users.id))
    .where(eq(serviceRequests.id, requestId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getBillingEstimatesForArtisan(artisanId: number) {
  return await db
    .select({
      id: billingEstimates.id,
      serviceRequestId: billingEstimates.serviceRequestId,
      adminId: billingEstimates.adminId,
      estimatedPrice: billingEstimates.estimatedPrice,
      description: billingEstimates.description,
      breakdown: billingEstimates.breakdown,
      validUntil: billingEstimates.validUntil,
      status: billingEstimates.status,
      clientResponse: billingEstimates.clientResponse,
      createdAt: billingEstimates.createdAt,
      updatedAt: billingEstimates.updatedAt,
      admin: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      serviceRequest: {
        id: serviceRequests.id,
        serviceType: serviceRequests.serviceType,
        description: serviceRequests.description,
        location: serviceRequests.location,
        status: serviceRequests.status,
        title: serviceRequests.title,
        createdAt: serviceRequests.createdAt,
      },
    })
    .from(billingEstimates)
    .leftJoin(users, eq(billingEstimates.adminId, users.id))
    .leftJoin(
      serviceRequests,
      eq(billingEstimates.serviceRequestId, serviceRequests.id)
    )
    .where(eq(serviceRequests.assignedArtisanId, artisanId))
    .orderBy(desc(billingEstimates.createdAt));
}

export async function getServiceRequestByIdForAdmin(requestId: number) {
  const result = await db
    .select({
      id: serviceRequests.id,
      title: serviceRequests.title,
      serviceType: serviceRequests.serviceType,
      urgency: serviceRequests.urgency,
      description: serviceRequests.description,
      location: serviceRequests.location,
      locationHousenumber: serviceRequests.locationHousenumber,
      locationStreet: serviceRequests.locationStreet,
      locationPostcode: serviceRequests.locationPostcode,
      locationCity: serviceRequests.locationCity,
      locationCitycode: serviceRequests.locationCitycode,
      locationDistrict: serviceRequests.locationDistrict,
      locationCoordinates: serviceRequests.locationCoordinates,
      locationContext: serviceRequests.locationContext,
      photos: serviceRequests.photos,
      clientEmail: serviceRequests.clientEmail,
      status: serviceRequests.status,
      estimatedPrice: serviceRequests.estimatedPrice,
      createdAt: serviceRequests.createdAt,
      updatedAt: serviceRequests.updatedAt,
      userId: serviceRequests.userId,
      assignedArtisanId: serviceRequests.assignedArtisanId,
    })
    .from(serviceRequests)
    .where(eq(serviceRequests.id, requestId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const request = result[0];

  // Get client info if userId exists
  let client = null;
  if (request.userId) {
    const clientResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, request.userId))
      .limit(1);
    client = clientResult.length > 0 ? clientResult[0] : null;
  }

  // Get assigned artisan info if assignedArtisanId exists
  let assignedArtisan = null;
  if (request.assignedArtisanId) {
    const artisanResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, request.assignedArtisanId))
      .limit(1);
    assignedArtisan = artisanResult.length > 0 ? artisanResult[0] : null;
  }

  // Get billing estimates
  const estimates = await getBillingEstimatesByRequestId(requestId);

  // Get conversations
  const conversationsData = await getConversationsByRequestId(requestId);

  return {
    ...request,
    client,
    assignedArtisan,
    billingEstimates: estimates,
    conversations: conversationsData,
  };
}

export async function getConversationsByRequestId(serviceRequestId: number) {
  return await db
    .select({
      id: conversations.id,
      serviceRequestId: conversations.serviceRequestId,
      senderId: conversations.senderId,
      senderType: conversations.senderType,
      message: conversations.message,
      createdAt: conversations.createdAt,
      readAt: conversations.readAt,
      sender: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(conversations)
    .leftJoin(users, eq(conversations.senderId, users.id))
    .where(eq(conversations.serviceRequestId, serviceRequestId))
    .orderBy(conversations.createdAt);
}

export async function createConversationMessage(messageData: {
  serviceRequestId: number;
  senderId: number;
  senderType: "client" | "artisan" | "admin";
  message: string;
}) {
  const [message] = await db
    .insert(conversations)
    .values(messageData)
    .returning();

  return message;
}

export async function updateServiceRequest(
  requestId: number,
  updateData: Partial<{}>
) {
  const [updatedRequest] = await db
    .update(serviceRequests)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(serviceRequests.id, requestId))
    .returning();

  return updatedRequest;
}

export async function getClientByUserId(userId: number) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      clientProfile: {
        id: clientProfiles.id,
        firstName: clientProfiles.firstName,
        lastName: clientProfiles.lastName,
        phone: clientProfiles.phone,
        address: clientProfiles.address,
        addressHousenumber: clientProfiles.addressHousenumber,
        addressStreet: clientProfiles.addressStreet,
        addressPostcode: clientProfiles.addressPostcode,
        addressCity: clientProfiles.addressCity,
        addressCitycode: clientProfiles.addressCitycode,
        addressDistrict: clientProfiles.addressDistrict,
        addressCoordinates: clientProfiles.addressCoordinates,
        addressContext: clientProfiles.addressContext,
        preferences: clientProfiles.preferences,
        createdAt: clientProfiles.createdAt,
        updatedAt: clientProfiles.updatedAt,
      },
    })
    .from(users)
    .leftJoin(clientProfiles, eq(users.id, clientProfiles.userId))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const user = result[0];

  // Return null if user exists but doesn't have client role
  if (user.role !== "client") {
    return null;
  }

  return user;
}
