import { ROLES, validateUserRole } from "@/lib/auth/roles";
import {
  createArtisan,
  createClient,
  deleteArtisan,
  deleteClient,
  getUserById,
  getUserByIdWithProfiles,
  updateArtisan,
  updateClient,
  updateUser,
} from "@/lib/db/queries/admin";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate user has admin role
    const validation = await validateUserRole([ROLES.ADMIN]);

    if (!validation.hasAccess) {
      return NextResponse.json(
        { error: validation.error || "Access denied" },
        { status: validation.user ? 403 : 401 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await getUserByIdWithProfiles(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
        { error: validation.error || "Access denied" },
        { status: validation.user ? 403 : 401 }
      );
    }

    const body = await request.json();

    const { id } = await params;
    const userId = parseInt(id);
    const user = await getUserById(userId);
    const oldRole = user?.role;
    const newRole = body.role;
    const hasRoleChanged = newRole !== oldRole;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await updateUser(userId, body);

    if (newRole === "professional" && oldRole === "client") {
      await deleteClient(userId);
      await createArtisan(userId, body);
    }

    if (newRole === "client" && oldRole === "professional") {
      await deleteArtisan(userId);
      await createClient(userId, body);
    }

    if (!hasRoleChanged) {
      if (newRole === "professional") {
        const updatedUser = await updateArtisan(userId, body);
        return NextResponse.json(updatedUser);
      } else if (newRole === "client") {
        const updatedUser = await updateClient(userId, body);
        return NextResponse.json(updatedUser);
      } else {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }
    }
  } catch (error) {
    console.error("Error updating user:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (
        error.message.includes("email") ||
        error.message.includes("spécialités") ||
        error.message.includes("SIRET")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
