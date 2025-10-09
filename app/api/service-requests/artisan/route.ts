import { UserRole } from "@/lib/auth/roles";
import { getServiceRequestsForArtisan } from "@/lib/db/queries/artisan";
import { getUser } from "@/lib/db/queries/common";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== UserRole.PROFESSIONAL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requests = await getServiceRequestsForArtisan(user.id);

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching artisan service requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
