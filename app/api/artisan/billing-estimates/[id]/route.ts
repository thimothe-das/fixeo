import { NextResponse } from 'next/server';
import { validateUserRole, ROLES } from '@/lib/auth/roles';
import { getBillingEstimateById } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const estimateId = parseInt(params.id);

    if (isNaN(estimateId)) {
      return NextResponse.json(
        { error: 'Invalid estimate ID' },
        { status: 400 }
      );
    }

    // Get the billing estimate
    const estimate = await getBillingEstimateById(estimateId);
    
    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Verify this estimate belongs to a service request assigned to this artisan
    if (estimate.serviceRequest?.assignedArtisanId !== artisan.id) {
      return NextResponse.json(
        { error: 'Access denied - this estimate is not assigned to you' },
        { status: 403 }
      );
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Error fetching artisan billing estimate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
