import { ROLES, validateUserRole } from "@/lib/auth/roles";
import { getAllUsersPaginated } from "@/lib/db/queries/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Validate user has admin role
    const validation = await validateUserRole([ROLES.ADMIN]);

    if (!validation.hasAccess) {
      return NextResponse.json(
        { error: validation.error || "Access denied" },
        { status: validation.user ? 403 : 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(process.env.BASE_URL || "");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const result = await getAllUsersPaginated(page, pageSize);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
