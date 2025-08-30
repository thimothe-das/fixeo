import { NextResponse } from 'next/server';
import { validateUserRole, ROLES } from '@/lib/auth/roles';
import { db } from '@/lib/db/drizzle';
import { serviceRequests } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';

export async function GET() {
  try {
    // Validate user has professional role
    const validation = await validateUserRole([ROLES.PROFESSIONAL]);
    
    if (!validation.hasAccess) {
      return NextResponse.json(
        { error: validation.error || 'Access denied' }, 
        { status: validation.user ? 403 : 401 }
      );
    }

    const user = validation.user;

    // Get total requests assigned to this artisan
    const [totalResult] = await db
      .select({ count: count() })
      .from(serviceRequests)
      .where(eq(serviceRequests.assignedArtisanId, user.id));

    // Get completed requests
    const [completedResult] = await db
      .select({ count: count() })
      .from(serviceRequests)
      .where(
        eq(serviceRequests.assignedArtisanId, user.id)
      );

    const stats = {
      totalRequests: totalResult?.count || 0,
      completedRequests: completedResult?.count || 0,
      avgRating: 4.8, // Placeholder - you'd calculate this from actual ratings
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching artisan stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 