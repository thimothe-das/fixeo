import { NextResponse } from 'next/server';
import { validateUserRole, ROLES } from '@/lib/auth/roles';
import { getBillingEstimatesForArtisan } from '@/lib/db/queries';

export async function GET() {
  try {
    // Validate user has professional role (artisan)
    const validation = await validateUserRole([ROLES.PROFESSIONAL]);
    
    if (!validation.hasAccess) {
      return NextResponse.json(
        { error: validation.error || 'Access denied' }, 
        { status: validation.user ? 403 : 401 }
      );
    }

    const artisan = validation.user;

    // Get all billing estimates for service requests assigned to this artisan
    const estimates = await getBillingEstimatesForArtisan(artisan.id);

    return NextResponse.json(estimates);
  } catch (error) {
    console.error('Error fetching artisan billing estimates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
