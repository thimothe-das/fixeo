import { UserRole } from "@/lib/auth/roles";
import { db } from "@/lib/db/drizzle";
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
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";

export async function getAllServiceRequestsPaginated(
  page: number = 1,
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize;

  // Get the total count
  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceRequests);

  const totalCount = totalCountResult[0]?.count || 0;

  // Get the paginated requests with client data
  const results = await db
    .select({
      id: serviceRequests.id,
      serviceType: serviceRequests.serviceType,
      urgency: serviceRequests.urgency,
      title: serviceRequests.title,
      description: serviceRequests.description,
      location: serviceRequests.location,
      status: serviceRequests.status,
      estimatedPrice: serviceRequests.estimatedPrice,
      photos: serviceRequests.photos,
      clientEmail: serviceRequests.clientEmail,
      createdAt: serviceRequests.createdAt,
      updatedAt: serviceRequests.updatedAt,
      // User fields
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      userRole: users.role,
      userCreatedAt: users.createdAt,
      userUpdatedAt: users.updatedAt,
      // Profile fields
      profileId: clientProfiles.id,
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
      profileCreatedAt: clientProfiles.createdAt,
      profileUpdatedAt: clientProfiles.updatedAt,
    })
    .from(serviceRequests)
    .leftJoin(
      users,
      and(eq(serviceRequests.userId, users.id), isNull(users.deletedAt))
    )
    .leftJoin(clientProfiles, eq(users.id, clientProfiles.userId))
    .orderBy(desc(serviceRequests.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Transform the flat result into the desired structure
  const requests = results.map((result) => {
    const {
      userId,
      userName,
      userEmail,
      userRole,
      userCreatedAt,
      userUpdatedAt,
      profileId,
      firstName,
      lastName,
      phone,
      address,
      addressHousenumber,
      addressStreet,
      addressPostcode,
      addressCity,
      addressCitycode,
      addressDistrict,
      addressCoordinates,
      addressContext,
      preferences,
      profileCreatedAt,
      profileUpdatedAt,
      ...serviceRequest
    } = result;

    return {
      ...serviceRequest,
      client: userId
        ? {
            id: userId,
            name: userName,
            email: userEmail,
            role: userRole,
            createdAt: userCreatedAt,
            updatedAt: userUpdatedAt,
            // Flatten client profile fields into the same level
            profileId,
            firstName,
            lastName,
            phone,
            address,
            addressHousenumber,
            addressStreet,
            addressPostcode,
            addressCity,
            addressCitycode,
            addressDistrict,
            addressCoordinates,
            addressContext,
            preferences,
            profileCreatedAt,
            profileUpdatedAt,
          }
        : null,
    };
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    requests,
    pagination: {
      currentPage: page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getAllUsersPaginated(
  page: number = 1,
  pageSize: number = 10
) {
  const offset = (page - 1) * pageSize;

  // Get the total count (excluding deleted users)
  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(isNull(users.deletedAt));

  const totalCount = totalCountResult[0]?.count || 0;

  // Get the paginated users with their profiles
  const usersData = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      deletedAt: users.deletedAt,
      clientProfile: {
        firstName: clientProfiles.firstName,
        lastName: clientProfiles.lastName,
        phone: clientProfiles.phone,
        address: clientProfiles.address,
      },
      professionalProfile: {
        firstName: professionalProfiles.firstName,
        lastName: professionalProfiles.lastName,
        phone: professionalProfiles.phone,
        siret: professionalProfiles.siret,
        serviceArea: professionalProfiles.serviceArea,
        specialties: professionalProfiles.specialties,
        isVerified: professionalProfiles.isVerified,
        experience: professionalProfiles.experience,
        description: professionalProfiles.description,
      },
    })
    .from(users)
    .leftJoin(clientProfiles, eq(users.id, clientProfiles.userId))
    .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    users: usersData,
    pagination: {
      currentPage: page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function deleteClient(userId: number) {
  await db.delete(clientProfiles).where(eq(clientProfiles.userId, userId));
}

export async function deleteArtisan(userId: number) {
  await db
    .delete(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId));
}

export async function createClient(
  userId: number,
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  }
) {
  await db.insert(clientProfiles).values({ userId, ...data });
}

export async function createArtisan(
  userId: number,
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    siret: string;
    serviceArea: string;
    specialties: string;
    isVerified: boolean;
    experience: string;
    description: string;
  }
) {
  await db.insert(professionalProfiles).values({ userId, ...data });
}

export async function updateClient(
  userId: number,
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  }
) {
  return await db
    .update(clientProfiles)
    .set(data)
    .where(eq(clientProfiles.userId, userId));
}

export async function updateArtisan(
  userId: number,
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    siret: string;
    serviceArea: string;
    specialties: string;
    isVerified: boolean;
    experience: string;
    description: string;
  }
) {
  return await db
    .update(professionalProfiles)
    .set(data)
    .where(eq(professionalProfiles.userId, userId));
}

export async function updateUser(
  userId: number,
  data: {
    name: string;
    email: string;
    role: string;
  }
) {
  return await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getUserById(userId: number) {
  const result = await db.select().from(users).where(eq(users.id, userId));
  return result.length > 0 ? result[0] : null;
}

export async function getUserByIdWithProfiles(userId: number) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      deletedAt: users.deletedAt,
      address: sql<string>`COALESCE(${professionalProfiles.serviceArea}, ${clientProfiles.address})`,
      firstName: sql<string>`COALESCE(${professionalProfiles.firstName}, ${clientProfiles.firstName})`,
      lastName: sql<string>`COALESCE(${professionalProfiles.lastName}, ${clientProfiles.lastName})`,
      phone: sql<string>`COALESCE(${professionalProfiles.phone}, ${clientProfiles.phone})`,
      addressHousenumber: sql<string>`COALESCE(${professionalProfiles.serviceAreaHousenumber}, ${clientProfiles.addressHousenumber})`,
      addressStreet: sql<string>`COALESCE(${professionalProfiles.serviceAreaStreet}, ${clientProfiles.addressStreet})`,
      addressPostcode: sql<string>`COALESCE(${professionalProfiles.serviceAreaPostcode}, ${clientProfiles.addressPostcode})`,
      addressCity: sql<string>`COALESCE(${professionalProfiles.serviceAreaCity}, ${clientProfiles.addressCity})`,
      addressCitycode: sql<string>`COALESCE(${professionalProfiles.serviceAreaCitycode}, ${clientProfiles.addressCitycode})`,
      addressDistrict: sql<string>`COALESCE(${professionalProfiles.serviceAreaDistrict}, ${clientProfiles.addressDistrict})`,
      addressCoordinates: sql<string>`COALESCE(${professionalProfiles.serviceAreaCoordinates}, ${clientProfiles.addressCoordinates})`,
      addressContext: sql<string>`COALESCE(${professionalProfiles.serviceAreaContext}, ${clientProfiles.addressContext})`,
      siret: professionalProfiles.siret,
      specialties: professionalProfiles.specialties,
      isVerified: professionalProfiles.isVerified,
      experience: professionalProfiles.experience,
      description: professionalProfiles.description,
    })
    .from(users)
    .leftJoin(clientProfiles, eq(users.id, clientProfiles.userId))
    .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getRequestsTimeSeriesData(days: number = 30) {
  const result = await db.execute(sql`
      SELECT 
        DATE(sh.changed_at) as date,
        COUNT(DISTINCT sh.service_request_id) as count
      FROM service_request_status_history sh
      WHERE sh.status IN ('completed', 'resolved')
        AND sh.changed_at >= CURRENT_DATE - INTERVAL '${sql.raw(
          days.toString()
        )} days'
      GROUP BY DATE(sh.changed_at)
      ORDER BY DATE(sh.changed_at) ASC
    `);

  // Fill in missing dates with 0 count
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dateMap = new Map();
  result.forEach((row: any) => {
    // Convert the date to string format if it's a Date object
    const dateStr =
      row.date instanceof Date
        ? row.date.toISOString().split("T")[0]
        : row.date;
    dateMap.set(dateStr, parseInt(row.count));
  });

  const timeSeriesData = [];
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split("T")[0];

    timeSeriesData.push({
      date: dateStr,
      count: dateMap.get(dateStr) || 0,
    });
  }

  return timeSeriesData;
}

export async function getEarningsTimeSeriesData(days: number = 30) {
  const result = await db.execute(sql`
      SELECT 
        DATE(sh.changed_at) as date,
        COALESCE(SUM(be.estimated_price), 0) as earnings
      FROM service_request_status_history sh
      INNER JOIN billing_estimates be ON sh.service_request_id = be.service_request_id
      WHERE sh.status IN ('completed', 'resolved')
        AND be.status = 'accepted'
        AND sh.changed_at >= CURRENT_DATE - INTERVAL '${sql.raw(
          days.toString()
        )} days'
      GROUP BY DATE(sh.changed_at)
      ORDER BY DATE(sh.changed_at) ASC
    `);

  // Fill in missing dates with 0 earnings
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dateMap = new Map();
  result.forEach((row: any) => {
    // Convert the date to string format if it's a Date object
    const dateStr =
      row.date instanceof Date
        ? row.date.toISOString().split("T")[0]
        : row.date;
    dateMap.set(dateStr, parseInt(row.earnings) || 0);
  });

  const timeSeriesData = [];
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split("T")[0];

    timeSeriesData.push({
      date: dateStr,
      earnings: dateMap.get(dateStr) || 0,
    });
  }

  return timeSeriesData;
}

export async function getAdminStats() {
  // Count total service requests
  const totalRequestsResult = await db.select().from(serviceRequests);
  const totalRequests = totalRequestsResult.length;

  // Count requests by status
  const pendingRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(
      eq(serviceRequests.status, ServiceRequestStatus.AWAITING_ASSIGNATION)
    );
  const pendingRequests = pendingRequestsResult.length;

  const awaitingEstimateRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, ServiceRequestStatus.AWAITING_ESTIMATE));
  const awaitingEstimateRequests = awaitingEstimateRequestsResult.length;

  const activeRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, ServiceRequestStatus.IN_PROGRESS));
  const activeRequests = activeRequestsResult.length;

  const completedRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(
      or(
        eq(serviceRequests.status, ServiceRequestStatus.COMPLETED),
        eq(serviceRequests.status, ServiceRequestStatus.RESOLVED)
      )
    );
  const completedRequests = completedRequestsResult.length;

  // Count disputed requests (all dispute statuses)
  const disputedRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(
      or(
        eq(serviceRequests.status, ServiceRequestStatus.DISPUTED_BY_CLIENT),
        eq(serviceRequests.status, ServiceRequestStatus.DISPUTED_BY_ARTISAN),
        eq(serviceRequests.status, ServiceRequestStatus.DISPUTED_BY_BOTH)
      )
    );
  const disputedRequests = disputedRequestsResult.length;

  // Count pending billing estimates
  const pendingEstimatesResult = await db
    .select()
    .from(billingEstimates)
    .where(eq(billingEstimates.status, BillingEstimateStatus.PENDING));
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
    .where(and(eq(users.role, UserRole.PROFESSIONAL), isNull(users.deletedAt)));
  const totalArtisans = totalArtisansResult.length;

  const totalClientsResult = await db
    .select()
    .from(users)
    .where(and(eq(users.role, UserRole.CLIENT), isNull(users.deletedAt)));
  const totalClients = totalClientsResult.length;

  // Calculate total earnings from accepted billing estimates with completed/resolved requests
  const totalEarningsResult = await db.execute(sql`
      SELECT COALESCE(SUM(be.estimated_price), 0) as total_earnings
      FROM billing_estimates be
      INNER JOIN service_requests sr ON be.service_request_id = sr.id
      WHERE be.status = 'accepted'
        AND sr.status IN ('completed', 'resolved')
    `);
  const totalEarnings =
    parseInt(String(totalEarningsResult[0]?.total_earnings)) || 0;

  // Get time series data for requests created over the last 30 days
  const requestsTimeSeriesData = await getRequestsTimeSeriesData(30);

  // Get time series data for earnings over the last 30 days
  const earningsTimeSeriesData = await getEarningsTimeSeriesData(30);

  return {
    totalRequests,
    pendingRequests,
    activeRequests,
    completedRequests,
    disputedRequests,
    totalUsers,
    totalArtisans,
    totalClients,
    awaitingEstimateRequests,
    pendingEstimates,
    totalEarnings,
    requestsTimeSeriesData,
    earningsTimeSeriesData,
  };
}

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
      status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
      estimatedPrice: estimateData.estimatedPrice,
      updatedAt: new Date(),
    })
    .where(eq(serviceRequests.id, estimateData.serviceRequestId));

  // Record status change in history
  await db.insert(serviceRequestStatusHistory).values({
    serviceRequestId: estimateData.serviceRequestId,
    status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
  });

  return estimate;
}
