import { NextResponse } from 'next/server';
import { getUserByIdWithProfiles, updateUserWithProfiles } from '@/lib/db/queries';
import { validateUserRole, ROLES } from '@/lib/auth/roles';

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
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await getUserByIdWithProfiles(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
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
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Basic validation
    if (!updateData.email?.trim()) {
      return NextResponse.json(
        { error: 'Email est requis' },
        { status: 400 }
      );
    }

    if (!updateData.role) {
      return NextResponse.json(
        { error: 'Rôle est requis' },
        { status: 400 }
      );
    }

    // Role-specific validation
    if (updateData.role === 'professional') {
      if (!updateData.professionalProfile?.firstName?.trim() || !updateData.professionalProfile?.lastName?.trim()) {
        return NextResponse.json(
          { error: 'Prénom et nom sont requis pour les professionnels' },
          { status: 400 }
        );
      }
      
      if (!updateData.professionalProfile?.siret?.trim()) {
        return NextResponse.json(
          { error: 'SIRET est requis pour les professionnels' },
          { status: 400 }
        );
      }
    }

    if (updateData.role === 'client') {
      if (!updateData.clientProfile?.firstName?.trim() || !updateData.clientProfile?.lastName?.trim()) {
        return NextResponse.json(
          { error: 'Prénom et nom sont requis pour les clients' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await updateUserWithProfiles(userId, updateData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('email') || error.message.includes('spécialités') || error.message.includes('SIRET')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
