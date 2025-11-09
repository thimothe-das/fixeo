import { getDisputedRequests } from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries/common";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all disputed requests
    const disputedRequests = await getDisputedRequests();

    return NextResponse.json({
      success: true,
      disputes: disputedRequests,
      count: disputedRequests.length,
    });
  } catch (error) {
    console.error("Error fetching disputed requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch disputed requests" },
      { status: 500 }
    );
  }
}

