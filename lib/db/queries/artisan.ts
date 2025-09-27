import { db } from "@/lib/db/drizzle";
import {
  billingEstimates,
  serviceRequests,
  ServiceRequestStatus,
  users,
} from "@/lib/db/schema";
import { isWithinServiceRadius } from "@/lib/utils";
import { and, desc, eq, isNull } from "drizzle-orm";

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

  // Get requests assigned to this artisan
  const assignedRequests = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.assignedArtisanId, userId))
    .orderBy(desc(serviceRequests.createdAt));

  // Get available requests in the area and matching specialties
  const availableRequests = await db
    .select()
    .from(serviceRequests)
    .where(
      and(
        eq(serviceRequests.status, ServiceRequestStatus.AWAITING_ASSIGNATION),
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
    return matchesSpecialty && matchesLocation;
  });

  // Add the isAssigned flag after querying
  const assignedWithFlag = assignedRequests.map((req) => ({
    ...req,
    isAssigned: true,
  }));
  const availableWithFlag = filteredAvailable.map((req) => ({
    ...req,
    isAssigned: false,
  }));

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
