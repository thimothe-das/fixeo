import { NextResponse } from 'next/server';
import { getUser, getUserWithProfiles } from '@/lib/db/queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProfiles = searchParams.get('includeProfiles') === 'true';
    
    let user;
    if (includeProfiles) {
      user = await getUserWithProfiles();
    } else {
      user = await getUser();
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
