import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, serviceRequests, professionalProfiles, clientProfiles } from './schema';
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
        eq(serviceRequests.status, 'pending'),
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
