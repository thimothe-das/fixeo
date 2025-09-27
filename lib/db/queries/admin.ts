import { db } from "@/lib/db/drizzle";
import {
  billingEstimates,
  clientProfiles,
  professionalProfiles,
  serviceRequests,
  ServiceRequestStatus,
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
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserWithProfiles(
  userId: number,
  updateData: {
    name?: string;
    email?: string;
    role?: string;
    oldRole?: string;
    clientProfile?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
    };
    professionalProfile?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      siret?: string;
      serviceArea?: string;
      specialties?: string;
      experience?: string;
      description?: string;
      isVerified?: boolean;
    };
  }
) {
  // Start transaction to update user and profiles
  const result = await db.transaction(async (tx) => {
    // Check if email already exists for another user
    if (updateData.email) {
      const existingUser = await tx
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, updateData.email), sql`id != ${userId}`))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("Cet email est déjà utilisé par un autre utilisateur");
      }
    }

    // Update main user table
    const userUpdateData: any = {};
    if (updateData.name !== undefined) userUpdateData.name = updateData.name;
    if (updateData.email !== undefined) userUpdateData.email = updateData.email;
    if (updateData.role !== undefined) userUpdateData.role = updateData.role;

    if (Object.keys(userUpdateData).length > 0) {
      userUpdateData.updatedAt = new Date();
      await tx.update(users).set(userUpdateData).where(eq(users.id, userId));
    }

    // Handle role changes - clean up old profiles if role changed
    if (
      updateData.role &&
      updateData.oldRole &&
      updateData.role !== updateData.oldRole
    ) {
      // Delete old profile based on previous role
      if (updateData.oldRole === "client") {
        await tx
          .delete(clientProfiles)
          .where(eq(clientProfiles.userId, userId));
      } else if (updateData.oldRole === "professional") {
        await tx
          .delete(professionalProfiles)
          .where(eq(professionalProfiles.userId, userId));
      }
    }

    // Update client profile if provided
    if (updateData.clientProfile) {
      const clientUpdateData = {
        ...updateData.clientProfile,
        updatedAt: new Date(),
      };

      // Remove null/undefined values
      Object.keys(clientUpdateData).forEach((key) => {
        if (
          clientUpdateData[key as keyof typeof clientUpdateData] === null ||
          clientUpdateData[key as keyof typeof clientUpdateData] ===
            undefined ||
          clientUpdateData[key as keyof typeof clientUpdateData] === ""
        ) {
          delete clientUpdateData[key as keyof typeof clientUpdateData];
        }
      });

      // Check if client profile exists
      const existingClientProfile = await tx
        .select({ id: clientProfiles.id })
        .from(clientProfiles)
        .where(eq(clientProfiles.userId, userId))
        .limit(1);

      if (existingClientProfile.length > 0) {
        await tx
          .update(clientProfiles)
          .set(clientUpdateData)
          .where(eq(clientProfiles.userId, userId));
      } else {
        await tx.insert(clientProfiles).values({
          userId,
          ...clientUpdateData,
          createdAt: new Date(),
        });
      }
    }

    // Update professional profile if provided
    if (updateData.professionalProfile) {
      const professionalUpdateData = {
        ...updateData.professionalProfile,
        updatedAt: new Date(),
      };

      // Remove null/undefined values
      Object.keys(professionalUpdateData).forEach((key) => {
        if (
          professionalUpdateData[key as keyof typeof professionalUpdateData] ===
            null ||
          professionalUpdateData[key as keyof typeof professionalUpdateData] ===
            undefined ||
          professionalUpdateData[key as keyof typeof professionalUpdateData] ===
            ""
        ) {
          delete professionalUpdateData[
            key as keyof typeof professionalUpdateData
          ];
        }
      });

      // Validate specialties JSON
      if (professionalUpdateData.specialties) {
        try {
          const parsed = JSON.parse(professionalUpdateData.specialties);
          if (!Array.isArray(parsed)) {
            throw new Error("Specialties must be an array");
          }
        } catch (error) {
          throw new Error("Format des spécialités invalide");
        }
      }

      // Check if professional profile exists
      const existingProfessionalProfile = await tx
        .select({ id: professionalProfiles.id })
        .from(professionalProfiles)
        .where(eq(professionalProfiles.userId, userId))
        .limit(1);

      if (existingProfessionalProfile.length > 0) {
        await tx
          .update(professionalProfiles)
          .set(professionalUpdateData)
          .where(eq(professionalProfiles.userId, userId));
      } else {
        await tx.insert(professionalProfiles).values({
          userId,
          ...professionalUpdateData,
          createdAt: new Date(),
        });
      }
    }

    // Return updated user with profiles
    return await getUserByIdWithProfiles(userId);
  });

  return result;
}

export async function getRequestsTimeSeriesData(days: number = 30) {
  const result = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM service_requests
      WHERE created_at >= CURRENT_DATE - INTERVAL '${sql.raw(
        days.toString()
      )} days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
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
        DATE(be.created_at) as date,
        COALESCE(SUM(be.estimated_price), 0) as earnings
      FROM billing_estimates be
      WHERE be.status = 'accepted' 
        AND be.created_at >= CURRENT_DATE - INTERVAL '${sql.raw(
          days.toString()
        )} days'
      GROUP BY DATE(be.created_at)
      ORDER BY DATE(be.created_at) ASC
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
    .where(eq(serviceRequests.status, "awaiting_estimate"));
  const awaitingEstimateRequests = awaitingEstimateRequestsResult.length;

  const activeRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, ServiceRequestStatus.IN_PROGRESS));
  const activeRequests = activeRequestsResult.length;

  const completedRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.status, "completed"));
  const completedRequests = completedRequestsResult.length;

  // Count disputed requests (all dispute statuses)
  const disputedRequestsResult = await db
    .select()
    .from(serviceRequests)
    .where(
      or(
        eq(serviceRequests.status, "disputed_by_client"),
        eq(serviceRequests.status, "disputed_by_artisan"),
        eq(serviceRequests.status, "disputed_by_both")
      )
    );
  const disputedRequests = disputedRequestsResult.length;

  // Count pending billing estimates
  const pendingEstimatesResult = await db
    .select()
    .from(billingEstimates)
    .where(eq(billingEstimates.status, "pending"));
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
    .where(and(eq(users.role, "professional"), isNull(users.deletedAt)));
  const totalArtisans = totalArtisansResult.length;

  const totalClientsResult = await db
    .select()
    .from(users)
    .where(and(eq(users.role, "client"), isNull(users.deletedAt)));
  const totalClients = totalClientsResult.length;

  // Calculate total earnings from accepted billing estimates
  const totalEarningsResult = await db.execute(sql`
      SELECT COALESCE(SUM(estimated_price), 0) as total_earnings
      FROM billing_estimates
      WHERE status = 'accepted'
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

  return estimate;
}
