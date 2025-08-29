import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { serviceRequests, type ServiceRequest } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    
    // Get total count of service requests
    const allRequests = await db.select().from(serviceRequests);
    
    // Get requests for this user if logged in
    let userRequests: ServiceRequest[] = [];
    if (user) {
      userRequests = await db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.userId, user.id));
    }
    
    return NextResponse.json({
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      totalRequestsInDb: allRequests.length,
      userRequestsCount: userRequests.length,
      allRequests: allRequests.map(r => ({
        id: r.id,
        userId: r.userId,
        serviceType: r.serviceType,
        status: r.status,
        createdAt: r.createdAt
      })),
      userRequests: userRequests.map(r => ({
        id: r.id,
        serviceType: r.serviceType,
        status: r.status,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      user: null,
      totalRequestsInDb: 0,
      userRequestsCount: 0
    });
  }
}
