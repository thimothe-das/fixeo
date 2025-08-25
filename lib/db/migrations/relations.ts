import { relations } from "drizzle-orm/relations";
import { teams, activityLogs, users, invitations, teamMembers, professionalProfiles, clientProfiles, serviceRequests } from "./schema";

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	team: one(teams, {
		fields: [activityLogs.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id]
	}),
}));

export const teamsRelations = relations(teams, ({many}) => ({
	activityLogs: many(activityLogs),
	invitations: many(invitations),
	teamMembers: many(teamMembers),
}));

export const usersRelations = relations(users, ({many}) => ({
	activityLogs: many(activityLogs),
	invitations: many(invitations),
	teamMembers: many(teamMembers),
	professionalProfiles: many(professionalProfiles),
	clientProfiles: many(clientProfiles),
	serviceRequests_userId: many(serviceRequests, {
		relationName: "serviceRequests_userId_users_id"
	}),
	serviceRequests_assignedArtisanId: many(serviceRequests, {
		relationName: "serviceRequests_assignedArtisanId_users_id"
	}),
}));

export const invitationsRelations = relations(invitations, ({one}) => ({
	team: one(teams, {
		fields: [invitations.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [invitations.invitedBy],
		references: [users.id]
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
	user: one(users, {
		fields: [teamMembers.userId],
		references: [users.id]
	}),
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
}));

export const professionalProfilesRelations = relations(professionalProfiles, ({one}) => ({
	user: one(users, {
		fields: [professionalProfiles.userId],
		references: [users.id]
	}),
}));

export const clientProfilesRelations = relations(clientProfiles, ({one}) => ({
	user: one(users, {
		fields: [clientProfiles.userId],
		references: [users.id]
	}),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({one}) => ({
	user_userId: one(users, {
		fields: [serviceRequests.userId],
		references: [users.id],
		relationName: "serviceRequests_userId_users_id"
	}),
	user_assignedArtisanId: one(users, {
		fields: [serviceRequests.assignedArtisanId],
		references: [users.id],
		relationName: "serviceRequests_assignedArtisanId_users_id"
	}),
}));