import { getBillingEstimateById } from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries/common";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const estimateId = parseInt(id);

    if (isNaN(estimateId)) {
      return NextResponse.json(
        { error: "Invalid estimate ID" },
        { status: 400 }
      );
    }

    // Get the estimate with proper access control for clients
    const estimate = await getBillingEstimateById(estimateId, user.id);

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Error fetching billing estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
