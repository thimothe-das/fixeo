import { db } from "@/lib/db/drizzle";
import {
  billingEstimates,
  clientProfiles,
  serviceRequests,
  users,
} from "@/lib/db/schema";
import { isWithinServiceRadius } from "@/lib/utils";
import { and, desc, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function getServiceRequestsForArtisan(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      professionalProfile: true,
    },
  });

  if (!user?.professionalProfile) {
    return [];
  }

  const { serviceArea, specialties } = user.professionalProfile;

  // Parse specialties if it's a JSON string
  let userSpecialties: string[] = [];
  if (specialties) {
    try {
      userSpecialties = JSON.parse(specialties);
    } catch {
      userSpecialties = [];
    }
  }

  // Create alias for client users
  const clientUsers = alias(users, "client_users");

  // Get requests assigned to this artisan with client information
  const assignedRequests = await db
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
      assignedArtisanId: serviceRequests.assignedArtisanId,
      client: {
        id: clientUsers.id,
        name: clientUsers.name,
        email: clientUsers.email,
        firstName: clientProfiles.firstName,
        lastName: clientProfiles.lastName,
        phone: clientProfiles.phone,
      },
    })
    .from(serviceRequests)
    .leftJoin(clientUsers, eq(serviceRequests.userId, clientUsers.id))
    .leftJoin(clientProfiles, eq(clientUsers.id, clientProfiles.userId))
    .where(eq(serviceRequests.assignedArtisanId, userId))
    .orderBy(desc(serviceRequests.createdAt));

  // Get available requests in the area and matching specialties with client information
  const availableRequests = await db
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
      assignedArtisanId: serviceRequests.assignedArtisanId,
      locationCoordinates: serviceRequests.locationCoordinates,
      client: {
        id: clientUsers.id,
        name: clientUsers.name,
        email: clientUsers.email,
        firstName: clientProfiles.firstName,
        lastName: clientProfiles.lastName,
        phone: clientProfiles.phone,
      },
    })
    .from(serviceRequests)
    .leftJoin(clientUsers, eq(serviceRequests.userId, clientUsers.id))
    .leftJoin(clientProfiles, eq(clientUsers.id, clientProfiles.userId))
    .where(
      and(
        // eq(serviceRequests.status, ServiceRequestStatus.AWAITING_ASSIGNATION),
        isNull(serviceRequests.assignedArtisanId)
      )
    )
    .orderBy(desc(serviceRequests.createdAt))
    .limit(20);
  // Filter by specialties and location
  const filteredAvailable = availableRequests.filter((request) => {
    const matchesSpecialty =
      userSpecialties.length === 0 ||
      userSpecialties.some((specialty) => {
        console.log(
          "specialty",
          specialty.toLowerCase(),
          request.serviceType.toLowerCase()
        );
        return request.serviceType
          .toLowerCase()
          .includes(specialty.toLowerCase());
      });

    // Location filter: check if request is within artisan's service radius
    const matchesLocation = isWithinServiceRadius(
      user.professionalProfile.serviceAreaCoordinates,
      request.locationCoordinates
    );
    console.log(
      "matchesLocation",
      user.professionalProfile.serviceAreaCoordinates
    );
    console.log("matchesSpecialty", request.locationCoordinates);
    return matchesSpecialty && matchesLocation;
  });

  // Add the isAssigned flag and construct client name after querying
  const assignedWithFlag = assignedRequests.map((req) => {
    const clientName =
      req.client?.firstName && req.client?.lastName
        ? `${req.client.firstName} ${req.client.lastName}`.trim()
        : req.client?.name || null;

    return {
      ...req,
      clientName,
      clientPhone: req.client?.phone,
      isAssigned: true,
    };
  });

  const availableWithFlag = filteredAvailable.map((req) => {
    const clientName =
      req.client?.firstName && req.client?.lastName
        ? `${req.client.firstName} ${req.client.lastName}`.trim()
        : req.client?.name || null;

    return {
      ...req,
      clientName,
      clientPhone: req.client?.phone,
      isAssigned: false,
    };
  });

  return [...assignedWithFlag, ...availableWithFlag];
}

export async function getBillingEstimateByIdForArtisan(
  estimateId: number,
  userId: number
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
    .where(
      and(
        eq(billingEstimates.id, estimateId),
        eq(serviceRequests.assignedArtisanId, userId)
      )
    );

  const result = await query.limit(1);

  if (result.length === 0) {
    return null;
  }

  const estimate = result[0];

  // If userId is provided (for artisan access), verify they are assigned to the related service request
  if (userId && estimate.serviceRequest?.assignedArtisanId !== userId) {
    return null;
  }

  return estimate;
}
