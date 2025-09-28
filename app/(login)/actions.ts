"use server";

import { validatedActionWithUser } from "@/lib/auth/middleware";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { getUserWithTeam } from "@/lib/db/queries/common";
import {
  activityLogs,
  ActivityType,
  clientProfiles,
  invitations,
  professionalProfiles,
  teamMembers,
  teams,
  users,
  type NewActivityLog,
  type NewClientProfile,
  type NewProfessionalProfile,
  type NewUser,
} from "@/lib/db/schema";
import { SignInType, SignUpType } from "@/lib/validation/schemas";
import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || "",
  };
  await db.insert(activityLogs).values(newActivity);
}

// SignInSchema and SignInType now imported from @/lib/validation/schemas

export const signIn = async (data: SignInType) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: "Invalid email or password. Please try again.",
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: "Invalid email or password. Please try again.",
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN),
  ]);

  redirect("/workspace/dashboard");
};

// SignUpSchema and SignUpType now imported from @/lib/validation/schemas

export const signUp = async (data: SignUpType) => {
  const {
    email,
    password,
    inviteId,
    role,
    firstName,
    lastName,
    phone,
    address,
    address_housenumber,
    address_street,
    address_postcode,
    address_city,
    address_citycode,
    address_district,
    address_coordinates,
    address_context,
    preferences,
    serviceArea,
    serviceArea_housenumber,
    serviceArea_street,
    serviceArea_postcode,
    serviceArea_city,
    serviceArea_citycode,
    serviceArea_district,
    serviceArea_coordinates,
    serviceArea_context,
    siret,
    experience,
    specialties,
    description,
  } = data;

  // Validation based on role
  if (role === "artisan") {
    if (!firstName || !lastName || !phone || !serviceArea || !siret) {
      return {
        error:
          "Tous les champs obligatoires doivent être remplis pour les artisans.",
      };
    }

    // Validate SIRET format (basic validation)
    if (siret && !/^\d{14}$/.test(siret.replace(/\s/g, ""))) {
      return {
        error: "Le numéro SIRET doit contenir 14 chiffres.",
      };
    }
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: "Un compte avec cette adresse email existe déjà.",
    };
  }

  const passwordHash = await hashPassword(password);

  const userCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  const isFirstUser = Number(userCount[0].count) === 0;

  let newUserRole: string;
  if (isFirstUser && email === "das.thimothe@gmail.com") {
    newUserRole = "admin"; // First user with specific email becomes admin
  } else if (role === "artisan") {
    newUserRole = "professional";
  } else {
    newUserRole = "client";
  }

  const newUser: NewUser = {
    email,
    passwordHash,
    name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
    role: newUserRole,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: "Échec de la création du compte. Veuillez réessayer.",
    };
  }

  // Create role-specific profile
  if (role === "client" && (firstName || lastName || phone || address)) {
    const clientProfile: NewClientProfile = {
      userId: createdUser.id,
      firstName,
      lastName,
      phone,
      address,
      addressHousenumber: address_housenumber || null,
      addressStreet: address_street || null,
      addressPostcode: address_postcode || null,
      addressCity: address_city || null,
      addressCitycode: address_citycode || null,
      addressDistrict: address_district || null,
      addressCoordinates: address_coordinates || null,
      addressContext: address_context || null,
      preferences: preferences || null,
    };
    await db.insert(clientProfiles).values(clientProfile);
  } else if (role === "artisan") {
    const professionalProfile: NewProfessionalProfile = {
      userId: createdUser.id,
      firstName,
      lastName,
      phone,
      serviceArea,
      serviceAreaHousenumber: serviceArea_housenumber || null,
      serviceAreaStreet: serviceArea_street || null,
      serviceAreaPostcode: serviceArea_postcode || null,
      serviceAreaCity: serviceArea_city || null,
      serviceAreaCitycode: serviceArea_citycode || null,
      serviceAreaDistrict: serviceArea_district || null,
      serviceAreaCoordinates: serviceArea_coordinates || null,
      serviceAreaContext: serviceArea_context || null,
      siret: siret?.replace(/\s/g, ""), // Remove spaces from SIRET
      experience,
      specialties: specialties || null,
      description,
      isVerified: false,
    };
    await db.insert(professionalProfiles).values(professionalProfile);
  }

  redirect("/workspace/dashboard");
};

export async function signOut() {
  (await cookies()).delete("session");
  redirect("/");
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: "Current password is incorrect.",
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: "New password must be different from the current password.",
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: "New password and confirmation password do not match.",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD),
    ]);

    return {
      success: "Password updated successfully.",
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        error: "Incorrect password. Account deletion failed.",
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')`, // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

    (await cookies()).delete("session");
    redirect("/sign-in");
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT),
    ]);

    return { name, success: "Account updated successfully." };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.number(),
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: "User is not part of a team" };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: "Team member removed successfully" };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["member", "owner"]),
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: "User is not part of a team" };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: "User is already a member of this team" };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, "pending")
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: "An invitation has already been sent to this email" };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: "pending",
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: "Invitation sent successfully" };
  }
);
