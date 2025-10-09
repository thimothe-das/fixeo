// User role enum - can be imported in both client and server components
export enum UserRole {
  ADMIN = "admin",
  PROFESSIONAL = "professional",
  CLIENT = "client",
}

// Legacy constant for backward compatibility (will be deprecated)
export const ROLES = {
  ADMIN: UserRole.ADMIN,
  PROFESSIONAL: UserRole.PROFESSIONAL,
  CLIENT: UserRole.CLIENT,
} as const;
