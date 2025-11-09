import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries/common";
import { getEstimatesByRequestId } from "@/lib/db/queries/billing-estimates";
import { serviceRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

    const { requestId } = await params;
    const requestIdNum = parseInt(requestId);

    // Verify the request belongs to the client
    const serviceRequest = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, requestIdNum))
      .limit(1);

    if (serviceRequest.length === 0) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    if (serviceRequest[0].userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const estimates = await getEstimatesByRequestId(requestIdNum);

    return NextResponse.json(estimates);
  } catch (error) {
    console.error("Error fetching estimates for request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

