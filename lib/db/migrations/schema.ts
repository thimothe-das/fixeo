import { pgTable, unique, serial, varchar, timestamp, text, foreignKey, integer, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const billingEstimateStatus = pgEnum("billing_estimate_status", ['pending', 'accepted', 'rejected', 'expired'])
export const messageSenderType = pgEnum("message_sender_type", ['client', 'artisan', 'admin'])
export const serviceRequestStatus = pgEnum("service_request_status", ['awaiting_payment', 'awaiting_estimate', 'awaiting_assignation', 'in_progress', 'client_validated', 'artisan_validated', 'completed', 'disputed_by_client', 'disputed_by_artisan', 'disputed_by_both', 'resolved', 'cancelled'])


export const teams = pgTable("teams", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	stripeProductId: text("stripe_product_id"),
	planName: varchar("plan_name", { length: 50 }),
	subscriptionStatus: varchar("subscription_status", { length: 20 }),
}, (table) => [
	unique("teams_stripe_customer_id_unique").on(table.stripeCustomerId),
	unique("teams_stripe_subscription_id_unique").on(table.stripeSubscriptionId),
]);

export const activityLogs = pgTable("activity_logs", {
	id: serial().primaryKey().notNull(),
	teamId: integer("team_id").notNull(),
	userId: integer("user_id"),
	action: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "activity_logs_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "activity_logs_user_id_users_id_fk"
		}),
]);

export const invitations = pgTable("invitations", {
	id: serial().primaryKey().notNull(),
	teamId: integer("team_id").notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).notNull(),
	invitedBy: integer("invited_by").notNull(),
	invitedAt: timestamp("invited_at", { mode: 'string' }).defaultNow().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "invitations_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [users.id],
			name: "invitations_invited_by_users_id_fk"
		}),
]);

export const teamMembers = pgTable("team_members", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	teamId: integer("team_id").notNull(),
	role: varchar({ length: 50 }).notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "team_members_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_members_team_id_teams_id_fk"
		}),
]);

export const clientProfiles = pgTable("client_profiles", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	phone: varchar({ length: 20 }),
	address: text(),
	preferences: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	addressHousenumber: varchar("address_housenumber", { length: 10 }),
	addressStreet: varchar("address_street", { length: 255 }),
	addressPostcode: varchar("address_postcode", { length: 10 }),
	addressCity: varchar("address_city", { length: 100 }),
	addressCitycode: varchar("address_citycode", { length: 10 }),
	addressDistrict: varchar("address_district", { length: 100 }),
	addressCoordinates: varchar("address_coordinates", { length: 50 }),
	addressContext: text("address_context"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "client_profiles_user_id_users_id_fk"
		}),
	unique("client_profiles_user_id_unique").on(table.userId),
]);

export const professionalProfiles = pgTable("professional_profiles", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	phone: varchar({ length: 20 }),
	serviceArea: text("service_area"),
	siret: varchar({ length: 14 }),
	experience: varchar({ length: 20 }),
	specialties: text(),
	description: text(),
	isVerified: boolean("is_verified").default(false),
	verificationDocuments: text("verification_documents"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	serviceAreaHousenumber: varchar("service_area_housenumber", { length: 10 }),
	serviceAreaStreet: varchar("service_area_street", { length: 255 }),
	serviceAreaPostcode: varchar("service_area_postcode", { length: 10 }),
	serviceAreaCity: varchar("service_area_city", { length: 100 }),
	serviceAreaCitycode: varchar("service_area_citycode", { length: 10 }),
	serviceAreaDistrict: varchar("service_area_district", { length: 100 }),
	serviceAreaCoordinates: varchar("service_area_coordinates", { length: 50 }),
	serviceAreaContext: text("service_area_context"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "professional_profiles_user_id_users_id_fk"
		}),
	unique("professional_profiles_user_id_unique").on(table.userId),
]);

export const billingEstimates = pgTable("billing_estimates", {
	id: serial().primaryKey().notNull(),
	serviceRequestId: integer("service_request_id").notNull(),
	adminId: integer("admin_id").notNull(),
	estimatedPrice: integer("estimated_price").notNull(),
	description: text().notNull(),
	breakdown: text(),
	validUntil: timestamp("valid_until", { mode: 'string' }),
	status: billingEstimateStatus().default('pending').notNull(),
	clientResponse: text("client_response"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.serviceRequestId],
			foreignColumns: [serviceRequests.id],
			name: "billing_estimates_service_request_id_service_requests_id_fk"
		}),
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [users.id],
			name: "billing_estimates_admin_id_users_id_fk"
		}),
]);

export const conversations = pgTable("conversations", {
	id: serial().primaryKey().notNull(),
	serviceRequestId: integer("service_request_id").notNull(),
	senderId: integer("sender_id").notNull(),
	senderType: messageSenderType("sender_type").notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.serviceRequestId],
			foreignColumns: [serviceRequests.id],
			name: "conversations_service_request_id_service_requests_id_fk"
		}),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "conversations_sender_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	role: varchar({ length: 20 }).default('member').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	stripeCustomerId: text("stripe_customer_id"),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_stripe_customer_id_unique").on(table.stripeCustomerId),
]);

export const serviceRequests = pgTable("service_requests", {
	id: serial().primaryKey().notNull(),
	serviceType: varchar("service_type", { length: 50 }).notNull(),
	urgency: varchar({ length: 20 }).notNull(),
	description: text().notNull(),
	location: text().notNull(),
	photos: text(),
	clientEmail: varchar("client_email", { length: 255 }),
	userId: integer("user_id"),
	status: serviceRequestStatus().default('awaiting_payment').notNull(),
	assignedArtisanId: integer("assigned_artisan_id"),
	estimatedPrice: integer("estimated_price"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	guestToken: varchar("guest_token", { length: 36 }),
	locationHousenumber: varchar("location_housenumber", { length: 10 }),
	locationStreet: varchar("location_street", { length: 255 }),
	locationPostcode: varchar("location_postcode", { length: 10 }),
	locationCity: varchar("location_city", { length: 100 }),
	locationCitycode: varchar("location_citycode", { length: 10 }),
	locationDistrict: varchar("location_district", { length: 100 }),
	locationCoordinates: varchar("location_coordinates", { length: 50 }),
	locationContext: text("location_context"),
	title: varchar({ length: 100 }),
	downPaymentPaid: boolean("down_payment_paid").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "service_requests_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.assignedArtisanId],
			foreignColumns: [users.id],
			name: "service_requests_assigned_artisan_id_users_id_fk"
		}),
	unique("service_requests_guest_token_unique").on(table.guestToken),
]);
