import { verifyToken } from "@/lib/auth/session";
import { uploadFileToS3, validateImageFile } from "@/lib/aws/s3";
import { db } from "@/lib/db/drizzle";
import { activityLogs, teamMembers, users } from "@/lib/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.team || null;
}

export async function getUserWithProfiles() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const userWithProfiles = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      clientProfile: true,
      professionalProfile: true,
    },
  });

  return userWithProfiles;
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function uploadPhotosToS3(photos: File[]) {
  try {
    const files = photos;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Limit to 5 photos max
    if (files.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 photos allowed" },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      // Convert File to Express.Multer.File-like object for validation
      const multerFile = {
        size: file.size,
        mimetype: file.type,
        originalname: file.name,
      } as Express.Multer.File;

      // Validate file
      const validation = validateImageFile(multerFile);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to S3
      return uploadFileToS3(buffer, file.name, file.type);
    });

    const uploadResults = await Promise.all(uploadPromises);
    const photoUrls = uploadResults.map((result) => result.url);

    return NextResponse.json({
      success: true,
      photos: photoUrls,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
