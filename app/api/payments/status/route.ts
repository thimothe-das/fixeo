import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries/common";
import { serviceRequests } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestIdParam = searchParams.get("requestId");

  if (!requestIdParam) {
    return NextResponse.json(
      { error: "Request ID is required" },
      { status: 400 }
    );
  }
  const requestId = parseInt(requestIdParam);
  try {
    const user = await getUser();
    // TODO If logged in, check if the request is associated with the user
    // TODO If guest, check if the request is associated with the guest token
    const request = await db
      .select({
        id: serviceRequests.id,
        downPaymentPaid: serviceRequests.downPaymentPaid,
        status: serviceRequests.status,
      })
      .from(serviceRequests)
      .where(and(eq(serviceRequests.id, requestId)))
      .limit(1);

    if (request.length > 0) {
      return NextResponse.json({
        success: true,
        paymentCompleted: request[0].downPaymentPaid,
        requestId: request[0].id.toString(),
        status: request[0].status,
      });
    }

    return NextResponse.json({
      success: true,
      paymentCompleted: false,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
