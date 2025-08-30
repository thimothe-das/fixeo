import { NextResponse } from 'next/server';
import { getAllServiceRequests } from '@/lib/db/queries';
import { validateUserRole, ROLES } from '@/lib/auth/roles';

export async function GET() {
  try {
    // Validate user has admin role
    const validation = await validateUserRole([ROLES.ADMIN]);
    
    if (!validation.hasAccess) {
      return NextResponse.json(
        { error: validation.error || 'Access denied' }, 
        { status: validation.user ? 403 : 401 }
      );
    }

    const requests = await getAllServiceRequests();
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching admin service requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
