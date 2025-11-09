import { UserRole } from "@/lib/auth/roles";
import { getUser } from "@/lib/db/queries/common";
import { getEstimatesByRequestId } from "@/lib/db/queries/billing-estimates";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { requestId } = await params;
    const estimates = await getEstimatesByRequestId(parseInt(requestId));

    return NextResponse.json(estimates);
  } catch (error) {
    console.error("Error fetching estimates for request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

