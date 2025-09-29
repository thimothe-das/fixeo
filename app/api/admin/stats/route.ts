import { getAdminStats } from "@/lib/db/queries/admin";
import { getUser } from "@/lib/db/queries/common";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getUser();
    return NextResponse.redirect(new URL("/", request.url));
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== "admin" && user.role !== "member") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stats = await getAdminStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
