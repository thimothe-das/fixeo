import { getUser } from "@/lib/db/queries/common";
import { ROLES, UserRole } from "@/lib/types/roles";
import { redirect } from "next/navigation";

// Re-export for convenience
export { ROLES, UserRole };

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: UserRole[] = [
  UserRole.CLIENT,
  UserRole.PROFESSIONAL,
  UserRole.ADMIN,
];

/**
 * Check if user has at least the required role level
 */
export function hasMinimumRole(
  userRole: string,
  minimumRole: UserRole
): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole as UserRole);
  const minimumIndex = ROLE_HIERARCHY.indexOf(minimumRole);

  return userIndex >= minimumIndex;
}

/**
 * Higher-order function for protecting pages with role validation
 * Returns the authenticated user if authorized
 */
export function withRoleProtection(allowedRoles: UserRole[]) {
  return async function protectPage() {
    const user = await getUser();

    if (!user) {
      redirect("/sign-in");
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      // For same-URL approach, we could redirect to an access denied page
      // or just redirect to sign-in. Adjust based on your UX preferences.
      redirect("/sign-in?error=access-denied");
    }

    return user;
  };
}

/**
 * Protect dashboard access with any valid role
 */
export async function protectDashboard() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in?redirect=workspace");
  }

  return user;
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === UserRole.ADMIN;
}

/**
 * Check if user is professional/artisan
 */
export function isProfessional(userRole: string): boolean {
  return userRole === UserRole.PROFESSIONAL;
}

/**
 * Check if user is client
 */
export function isClient(userRole: string): boolean {
  return userRole === UserRole.CLIENT;
}

/**
 * Validate user role for API routes
 */
export async function validateUserRole(allowedRoles: UserRole[]): Promise<{
  user: any;
  hasAccess: boolean;
  error?: string;
}> {
  try {
    const user = await getUser();

    if (!user) {
      return {
        user: null,
        hasAccess: false,
        error: "User not authenticated",
      };
    }

    const hasAccess = allowedRoles.includes(user.role as UserRole);

    return {
      user,
      hasAccess,
      error: hasAccess ? undefined : "Insufficient permissions",
    };
  } catch (error) {
    return {
      user: null,
      hasAccess: false,
      error: "Authentication error",
    };
  }
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: string): string {
  switch (role) {
    case UserRole.ADMIN:
      return "Administrateur";
    case UserRole.PROFESSIONAL:
      return "Artisan";
    case UserRole.CLIENT:
      return "Client";
    default:
      return "Utilisateur";
  }
}

/**
 * Check if user can access resource owned by another user
 */
export function canAccessResource(
  userRole: string,
  resourceOwnerId: number,
  userId: number
): boolean {
  // Admin can access everything
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  // Users can access their own resources
  if (resourceOwnerId === userId) {
    return true;
  }

  // Professionals can access resources related to their assigned requests
  // This would need more specific logic based on your business rules

  return false;
}

/**
 * Protect API routes with role validation
 */
export function withApiRoleProtection(allowedRoles: UserRole[]) {
  return async function protectApiRoute() {
    const validation = await validateUserRole(allowedRoles);

    if (!validation.hasAccess) {
      throw new Error(validation.error || "Access denied");
    }

    return validation.user;
  };
}
