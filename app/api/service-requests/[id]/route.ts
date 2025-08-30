import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { serviceRequests, billingEstimates, users, professionalProfiles } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const requestId = parseInt(id);
    
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    // Get the service request with assigned artisan details
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
        assignedArtisan: {
          id: users.id,
          name: users.name,
          email: users.email,
          firstName: professionalProfiles.firstName,
          lastName: professionalProfiles.lastName,
          specialty: professionalProfiles.specialties,
        },
      })
      .from(serviceRequests)
      .leftJoin(users, eq(serviceRequests.assignedArtisanId, users.id))
      .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
      .where(eq(serviceRequests.id, requestId))
      .limit(1);

    if (serviceRequestResult.length === 0) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    const request = serviceRequestResult[0];

    // Check if user has access to this request
    // User can access if they are the owner, assigned artisan, or admin
    const hasAccess = 
      request.userId === user.id || // Owner
      request.assignedArtisan?.id === user.id || // Assigned artisan
      user.role === 'admin'; // Admin

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    // Construct the response with all necessary data
    const response = {
      ...request,
      billingEstimates: estimates,
      // Add mock timeline data for now - in a real app this would come from activity logs
      timeline: {
        created: {
          date: request.createdAt,
          actor: 'Client',
        },
        ...(estimates.length > 0 && {
          quote: {
            date: estimates[0].createdAt,
            actor: 'Admin',
          },
        }),
        ...(estimates.some(e => e.status === 'accepted') && {
          accepted: {
            date: estimates.find(e => e.status === 'accepted')?.createdAt,
            actor: 'Client',
          },
        }),
        // TODO: Add completed timeline when status is completed
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching service request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
