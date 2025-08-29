import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, serviceRequests, professionalProfiles, clientProfiles, billingEstimates, ServiceRequestStatus } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

export async function getUserWithProfiles() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const userWithProfiles = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      clientProfile: true,
      professionalProfile: true,
    },
  });

  return userWithProfiles;
}

export async function getServiceRequestsForClient(userId: number) {
  // Get service requests
  const requests = await db
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
      assignedArtisan: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(serviceRequests)
    .leftJoin(users, eq(serviceRequests.assignedArtisanId, users.id))
    .where(eq(serviceRequests.userId, userId))
    .orderBy(desc(serviceRequests.createdAt));

  // Get billing estimates for each request
  const requestsWithEstimates = await Promise.all(
    requests.map(async (request) => {
      const estimates = await db
        .select({
          id: billingEstimates.id,
          estimatedPrice: billingEstimates.estimatedPrice,
          status: billingEstimates.status,
          validUntil: billingEstimates.validUntil,
          createdAt: billingEstimates.createdAt,
        })
        .from(billingEstimates)
        .where(eq(billingEstimates.serviceRequestId, request.id))
        .orderBy(desc(billingEstimates.createdAt));

      return {
        ...request,
        billingEstimates: estimates,
      };
    })
  );

  return requestsWithEstimates;
}

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

    // Filter by specialties and location (simplified)
  const filteredAvailable = availableRequests.filter((request) => {
    const matchesSpecialty = userSpecialties.length === 0 || 
      userSpecialties.some(specialty => 
        request.serviceType.toLowerCase().includes(specialty.toLowerCase())
      );
    // TODO: Add location filter
    // const matchesLocation = !serviceArea || 
    //   request.location.toLowerCase().includes(serviceArea.toLowerCase());
    
    return matchesSpecialty
  });

  // Add the isAssigned flag after querying
  const assignedWithFlag = assignedRequests.map(req => ({ ...req, isAssigned: true }));
  const availableWithFlag = filteredAvailable.map(req => ({ ...req, isAssigned: false }));

  return [...assignedWithFlag, ...availableWithFlag];
}

// Admin functions for getting all service requests and users
export async function getAllServiceRequests() {
  return await db
    .select({
      id: serviceRequests.id,
      serviceType: serviceRequests.serviceType,
      urgency: serviceRequests.urgency,
      description: serviceRequests.description,
      location: serviceRequests.location,
      status: serviceRequests.status,
      estimatedPrice: serviceRequests.estimatedPrice,
      photos: serviceRequests.photos,
      clientEmail: serviceRequests.clientEmail,
      clientPhone: serviceRequests.clientPhone,
      clientName: serviceRequests.clientName,
      createdAt: serviceRequests.createdAt,
      updatedAt: serviceRequests.updatedAt,
    })
    .from(serviceRequests)
    .orderBy(desc(serviceRequests.createdAt));
}

export async function getAdminStats() {
  // Count total service requests
  const totalRequestsResult = await db.select().from(serviceRequests);
  const totalRequests = totalRequestsResult.length;

  // Count requests by status
  const pendingRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, ServiceRequestStatus.AWAITING_ASSIGNATION));
  const pendingRequests = pendingRequestsResult.length;

  const awaitingEstimateRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, 'awaiting_estimate'));
  const awaitingEstimateRequests = awaitingEstimateRequestsResult.length;

  const activeRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, ServiceRequestStatus.IN_PROGRESS));
  const activeRequests = activeRequestsResult.length;

  const completedRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, 'completed'));
  const completedRequests = completedRequestsResult.length;

  // Count pending billing estimates
  const pendingEstimatesResult = await db
    .select()
    .from(billingEstimates)
    .where(eq(billingEstimates.status, 'pending'));
  const pendingEstimates = pendingEstimatesResult.length;

  // Count users by role
  const totalUsersResult = await db
    .select()
    .from(users)
    .where(isNull(users.deletedAt));
  const totalUsers = totalUsersResult.length;

  const totalArtisansResult = await db
    .select()
    .from(users)
    .where(and(eq(users.role, 'professional'), isNull(users.deletedAt)));
  const totalArtisans = totalArtisansResult.length;

  const totalClientsResult = await db
    .select()
    .from(users)
    .where(and(eq(users.role, 'client'), isNull(users.deletedAt)));
  const totalClients = totalClientsResult.length;

  return {
    totalRequests,
    pendingRequests,
    activeRequests,
    completedRequests,
    totalUsers,
    totalArtisans,
    totalClients,
    awaitingEstimateRequests,
    pendingEstimates,
  };
}

// Billing estimate functions
export async function createBillingEstimate(estimateData: {
  serviceRequestId: number;
  adminId: number;
  estimatedPrice: number;
  description: string;
  breakdown?: string;
  validUntil?: Date;
}) {
  const [estimate] = await db
    .insert(billingEstimates)
    .values(estimateData)
    .returning();

  // Update service request status to 'pending' (awaiting client response)
  await db
    .update(serviceRequests)
    .set({ 
      status: ServiceRequestStatus.AWAITING_ASSIGNATION,
      estimatedPrice: estimateData.estimatedPrice,
      updatedAt: new Date()
    })
    .where(eq(serviceRequests.id, estimateData.serviceRequestId));

  return estimate;
}

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

export async function updateBillingEstimateStatus(
  estimateId: number, 
  status: 'accepted' | 'rejected' | 'expired',
  clientResponse?: string
) {
  const [estimate] = await db
    .update(billingEstimates)
    .set({ 
      status,
      clientResponse,
      updatedAt: new Date()
    })
    .where(eq(billingEstimates.id, estimateId))
    .returning();

  // If accepted, update the service request status
  if (status === 'accepted' && estimate) {
    await db
      .update(serviceRequests)
      .set({ 
        status: ServiceRequestStatus.AWAITING_ASSIGNATION, // Ready for artisan assignment
        updatedAt: new Date()
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
      updatedAt: new Date()
    })
    .where(eq(serviceRequests.id, requestId))
    .returning();

  // If it's a dispute, we might want to log this separately
  // For now, we'll just store the dispute details in a separate table if needed
  
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
      }
    })
    .from(serviceRequests)
    .leftJoin(users, eq(serviceRequests.userId, users.id))
    .where(eq(serviceRequests.id, requestId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
