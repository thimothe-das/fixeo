import { NextResponse } from 'next/server';
import { getServiceRequestByIdForAdmin, updateServiceRequest } from '@/lib/db/queries';
import { validateUserRole, ROLES } from '@/lib/auth/roles';
import { ServiceRequestStatus } from '@/lib/db/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate user has admin role
    const validation = await validateUserRole([ROLES.ADMIN]);
    
    if (!validation.hasAccess) {
      return NextResponse.json(
        { error: validation.error || 'Access denied' }, 
        { status: validation.user ? 403 : 401 }
      );
    }

    const { id } = await params;
    const requestId = parseInt(id);
    
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const serviceRequest = await getServiceRequestByIdForAdmin(requestId);
    
    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    return NextResponse.json(serviceRequest);
  } catch (error) {
    console.error('Error fetching admin service request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate user has admin role
    const validation = await validateUserRole([ROLES.ADMIN]);
    
    if (!validation.hasAccess) {
      return NextResponse.json(
        { error: validation.error || 'Access denied' }, 
        { status: validation.user ? 403 : 401 }
      );
    }

    const { id } = await params;
    const requestId = parseInt(id);
    
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate the update data
    const allowedFields = [
      'title', 'serviceType', 'urgency', 'description', 'location',
      'locationHousenumber', 'locationStreet', 'locationPostcode', 
      'locationCity', 'locationCitycode', 'locationDistrict', 
      'locationCoordinates', 'locationContext', 'clientEmail', 
      'clientPhone', 'clientName', 'status', 'assignedArtisanId'
    ];
    
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validate status if provided
    if (updateData.status && !Object.values(ServiceRequestStatus).includes(updateData.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updatedRequest = await updateServiceRequest(requestId, updateData);
    
    if (!updatedRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating admin service request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
