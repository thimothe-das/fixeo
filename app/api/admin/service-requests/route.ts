import { NextResponse } from 'next/server';
import { getUser, getAllServiceRequests } from '@/lib/db/queries';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (assuming admin role exists)
    if (user.role !== 'admin' && user.role !== 'member') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
