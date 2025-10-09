import { ROLES, validateUserRole } from "@/lib/auth/roles";
import { getBillingEstimateById } from "@/lib/db/queries";
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
    const estimateId = parseInt(id);

    if (isNaN(estimateId)) {
      return NextResponse.json(
        { error: "Invalid estimate ID" },
        { status: 400 }
      );
    }

    // Get the billing estimate (no userId check since admin can access all)
    const estimate = await getBillingEstimateById(estimateId);

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Error fetching admin billing estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
