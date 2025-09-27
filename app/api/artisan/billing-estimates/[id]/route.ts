import { ROLES, validateUserRole } from "@/lib/auth/roles";
import { getBillingEstimateByIdForArtisan } from "@/lib/db/queries/artisan";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate user has professional role (artisan)
    const validation = await validateUserRole([ROLES.PROFESSIONAL]);

    if (!validation.hasAccess) {
      return NextResponse.json(
        { error: validation.error || "Access denied" },
        { status: validation.user ? 403 : 401 }
      );
    }

    const artisan = validation.user;
    const { id } = await params;
    const estimateId = parseInt(id);

    if (isNaN(estimateId)) {
      return NextResponse.json(
        { error: "Invalid estimate ID" },
        { status: 400 }
      );
    }

    // Get the billing estimate
    const estimate = await getBillingEstimateByIdForArtisan(
      estimateId,
      artisan.id
    );

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found", estimateId, artisanId: artisan.id },
        { status: 404 }
      );
    }

    // Verify this estimate belongs to a service request assigned to this artisan
    if (estimate.serviceRequest?.assignedArtisanId !== artisan.id) {
      return NextResponse.json(
        { error: "Access denied - this estimate is not assigned to you" },
        { status: 403 }
      );
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Error fetching artisan billing estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
