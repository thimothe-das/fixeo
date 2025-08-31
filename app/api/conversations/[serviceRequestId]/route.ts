import { NextResponse } from 'next/server';
import { getConversationsByRequestId, createConversationMessage } from '@/lib/db/queries';
import { validateUserRole, ROLES } from '@/lib/auth/roles';
import { MessageSenderType } from '@/lib/db/schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ serviceRequestId: string }> }
) {
  try {
    // Validate user has access
    const validation = await validateUserRole([ROLES.ADMIN, ROLES.CLIENT, ROLES.PROFESSIONAL]);
    
    if (!validation.hasAccess) {
      return NextResponse.json(
        { error: validation.error || 'Access denied' }, 
        { status: validation.user ? 403 : 401 }
      );
    }

    const { serviceRequestId } = await params;
    const requestId = parseInt(serviceRequestId);
    
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid service request ID' }, { status: 400 });
    }

    const conversations = await getConversationsByRequestId(requestId);
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ serviceRequestId: string }> }
) {
  try {
    // Validate user has access
    const validation = await validateUserRole([ROLES.ADMIN, ROLES.CLIENT, ROLES.PROFESSIONAL]);
    
    if (!validation.hasAccess || !validation.user) {
      return NextResponse.json(
        { error: validation.error || 'Access denied' }, 
        { status: validation.user ? 403 : 401 }
      );
    }

    const { serviceRequestId } = await params;
    const requestId = parseInt(serviceRequestId);
    
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid service request ID' }, { status: 400 });
    }

    const body = await request.json();
    const { message } = body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Determine sender type based on user role
    let senderType: 'client' | 'artisan' | 'admin';
    switch (validation.user.role) {
      case 'admin':
        senderType = 'admin';
        break;
      case 'professional':
        senderType = 'artisan';
        break;
      case 'client':
        senderType = 'client';
        break;
      default:
        return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    const newMessage = await createConversationMessage({
      serviceRequestId: requestId,
      senderId: validation.user.id,
      senderType,
      message: message.trim(),
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
