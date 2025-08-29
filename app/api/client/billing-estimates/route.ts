import { NextResponse } from 'next/server';
import { getUser, getBillingEstimatesByRequestId } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { serviceRequests, billingEstimates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (requestId) {
      // Get estimates for a specific request (verify ownership)
      const serviceRequest = await db
        .select()
        .from(serviceRequests)
        .where(
          and(
            eq(serviceRequests.id, parseInt(requestId)),
            eq(serviceRequests.userId, user.id)
          )
        )
        .limit(1);

      if (serviceRequest.length === 0) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }

      const estimates = await getBillingEstimatesByRequestId(parseInt(requestId));
      return NextResponse.json(estimates);
    } else {
      // Get all estimates for user's requests
      const userRequests = await db
        .select({ id: serviceRequests.id })
        .from(serviceRequests)
        .where(eq(serviceRequests.userId, user.id));

      if (userRequests.length === 0) {
        return NextResponse.json([]);
      }

      const requestIds = userRequests.map(r => r.id);
      
      const estimates = await db
        .select({
          id: billingEstimates.id,
          serviceRequestId: billingEstimates.serviceRequestId,
          estimatedPrice: billingEstimates.estimatedPrice,
          description: billingEstimates.description,
          breakdown: billingEstimates.breakdown,
          validUntil: billingEstimates.validUntil,
          status: billingEstimates.status,
          clientResponse: billingEstimates.clientResponse,
          createdAt: billingEstimates.createdAt,
          updatedAt: billingEstimates.updatedAt,
          serviceRequest: {
            id: serviceRequests.id,
            serviceType: serviceRequests.serviceType,
            description: serviceRequests.description,
            location: serviceRequests.location,
            status: serviceRequests.status,
          },
        })
        .from(billingEstimates)
        .leftJoin(serviceRequests, eq(billingEstimates.serviceRequestId, serviceRequests.id))
        .where(eq(serviceRequests.userId, user.id));

      return NextResponse.json(estimates);
    }
  } catch (error) {
    console.error('Error fetching client billing estimates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
