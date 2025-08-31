import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Service Request Status Enum - following the workflow
export const serviceRequestStatusEnum = pgEnum('service_request_status', [
  'awaiting_estimate',     // Initial state when request is created
  'awaiting_assignation',  // After estimate is added (replaces "pending")
  'in_progress',          // When work begins
  'client_validated',     // Client has validated the work
  'artisan_validated',    // Artisan has validated the work
  'completed',           // Both parties validated or resolved dispute
  'disputed_by_client',  // Client disputes the work
  'disputed_by_artisan', // Artisan disputes the work  
  'disputed_by_both',    // Both parties dispute
  'resolved',           // Dispute has been resolved
  'cancelled'           // Request was cancelled
]);

// Billing Estimate Status Enum
export const billingEstimateStatusEnum = pgEnum('billing_estimate_status', [
  'pending',    // Waiting for client response
  'accepted',   // Client accepted the estimate
  'rejected',   // Client rejected the estimate
  'expired'     // Estimate validity period has expired
]);

// Message Sender Type Enum
export const messageSenderTypeEnum = pgEnum('message_sender_type', [
  'client',
  'artisan',
  'admin'
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// Profile tables for role-specific data
export const clientProfiles = pgTable('client_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  // Structured address fields
  addressHousenumber: varchar('address_housenumber', { length: 10 }),
  addressStreet: varchar('address_street', { length: 255 }),
  addressPostcode: varchar('address_postcode', { length: 10 }),
  addressCity: varchar('address_city', { length: 100 }),
  addressCitycode: varchar('address_citycode', { length: 10 }),
  addressDistrict: varchar('address_district', { length: 100 }),
  addressCoordinates: varchar('address_coordinates', { length: 50 }), // "lat,lng"
  addressContext: text('address_context'),
  preferences: text('preferences'), // JSON string for client preferences
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const professionalProfiles = pgTable('professional_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  serviceArea: text('service_area'), // Zone d'intervention
  // Structured service area fields
  serviceAreaHousenumber: varchar('service_area_housenumber', { length: 10 }),
  serviceAreaStreet: varchar('service_area_street', { length: 255 }),
  serviceAreaPostcode: varchar('service_area_postcode', { length: 10 }),
  serviceAreaCity: varchar('service_area_city', { length: 100 }),
  serviceAreaCitycode: varchar('service_area_citycode', { length: 10 }),
  serviceAreaDistrict: varchar('service_area_district', { length: 100 }),
  serviceAreaCoordinates: varchar('service_area_coordinates', { length: 50 }), // "lat,lng"
  serviceAreaContext: text('service_area_context'),
  siret: varchar('siret', { length: 14 }),
  experience: varchar('experience', { length: 20 }), // e.g., "3-5", "10+"
  specialties: text('specialties'), // JSON array of specialties
  description: text('description'),
  isVerified: boolean('is_verified').default(false),
  verificationDocuments: text('verification_documents'), // JSON array of document URLs
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Service requests table for handling client service requests
export const serviceRequests = pgTable('service_requests', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }),
  serviceType: varchar('service_type', { length: 50 }).notNull(),
  urgency: varchar('urgency', { length: 20 }).notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  // Structured address fields for intervention location
  locationHousenumber: varchar('location_housenumber', { length: 10 }),
  locationStreet: varchar('location_street', { length: 255 }),
  locationPostcode: varchar('location_postcode', { length: 10 }),
  locationCity: varchar('location_city', { length: 100 }),
  locationCitycode: varchar('location_citycode', { length: 10 }),
  locationDistrict: varchar('location_district', { length: 100 }),
  locationCoordinates: varchar('location_coordinates', { length: 50 }), // "lat,lng"
  locationContext: text('location_context'),
  photos: text('photos'), // JSON array of photo URLs
  clientEmail: varchar('client_email', { length: 255 }),
  userId: integer('user_id').references(() => users.id), // If user is logged in
  guestToken: varchar('guest_token', { length: 36 }).unique(), // UUID v4 for guest tracking
  status: serviceRequestStatusEnum('status').notNull().default('awaiting_estimate'),
  assignedArtisanId: integer('assigned_artisan_id').references(() => users.id),
  estimatedPrice: integer('estimated_price'), // In cents
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Billing estimates table for admin-created estimates
export const billingEstimates = pgTable('billing_estimates', {
  id: serial('id').primaryKey(),
  serviceRequestId: integer('service_request_id')
    .notNull()
    .references(() => serviceRequests.id),
  adminId: integer('admin_id')
    .notNull()
    .references(() => users.id),
  estimatedPrice: integer('estimated_price').notNull(), // In cents
  description: text('description').notNull(),
  breakdown: text('breakdown'), // JSON array of cost breakdown items
  validUntil: timestamp('valid_until'),
  status: billingEstimateStatusEnum('status').notNull().default('pending'),
  clientResponse: text('client_response'), // Client's message when accepting/rejecting
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Conversations table for messages between clients and artisans
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  serviceRequestId: integer('service_request_id')
    .notNull()
    .references(() => serviceRequests.id),
  senderId: integer('sender_id')
    .notNull()
    .references(() => users.id),
  senderType: messageSenderTypeEnum('sender_type').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  readAt: timestamp('read_at'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  serviceRequests: many(serviceRequests),
  assignedServiceRequests: many(serviceRequests, {
    relationName: 'assignedArtisan',
  }),
  sentMessages: many(conversations),
  clientProfile: one(clientProfiles, {
    fields: [users.id],
    references: [clientProfiles.userId],
  }),
  professionalProfile: one(professionalProfiles, {
    fields: [users.id],
    references: [professionalProfiles.userId],
  }),
}));

export const clientProfilesRelations = relations(clientProfiles, ({ one }) => ({
  user: one(users, {
    fields: [clientProfiles.userId],
    references: [users.id],
  }),
}));

export const professionalProfilesRelations = relations(professionalProfiles, ({ one }) => ({
  user: one(users, {
    fields: [professionalProfiles.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [serviceRequests.userId],
    references: [users.id],
  }),
  assignedArtisan: one(users, {
    fields: [serviceRequests.assignedArtisanId],
    references: [users.id],
  }),
  billingEstimates: many(billingEstimates),
  conversations: many(conversations),
}));

export const billingEstimatesRelations = relations(billingEstimates, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [billingEstimates.serviceRequestId],
    references: [serviceRequests.id],
  }),
  admin: one(users, {
    fields: [billingEstimates.adminId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [conversations.serviceRequestId],
    references: [serviceRequests.id],
  }),
  sender: one(users, {
    fields: [conversations.senderId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type NewClientProfile = typeof clientProfiles.$inferInsert;
export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type NewProfessionalProfile = typeof professionalProfiles.$inferInsert;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;
export type BillingEstimate = typeof billingEstimates.$inferSelect;
export type NewBillingEstimate = typeof billingEstimates.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// Extended user types with profiles
export type UserWithClientProfile = User & {
  clientProfile?: ClientProfile;
};

export type UserWithProfessionalProfile = User & {
  professionalProfile?: ProfessionalProfile;
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

// TypeScript enums that match the database enums
export enum ServiceRequestStatus {
  AWAITING_ESTIMATE = 'awaiting_estimate',
  AWAITING_ASSIGNATION = 'awaiting_assignation',
  IN_PROGRESS = 'in_progress',
  CLIENT_VALIDATED = 'client_validated',
  ARTISAN_VALIDATED = 'artisan_validated',
  COMPLETED = 'completed',
  DISPUTED_BY_CLIENT = 'disputed_by_client',
  DISPUTED_BY_ARTISAN = 'disputed_by_artisan',
  DISPUTED_BY_BOTH = 'disputed_by_both',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled'
}

export enum BillingEstimateStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum MessageSenderType {
  CLIENT = 'client',
  ARTISAN = 'artisan',
  ADMIN = 'admin'
}
