import { NextResponse } from 'next/server';
import { getUser, getServiceRequestsForClient } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await getServiceRequestsForClient(user.id);
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching client service requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 