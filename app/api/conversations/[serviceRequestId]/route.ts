import { ROLES, validateUserRole } from "@/lib/auth/roles";
import {
  createConversationMessage,
  getConversationsByRequestId,
} from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ serviceRequestId: string }> }
) {
  try {
    // Validate user has access
    const validation = await validateUserRole([
      ROLES.ADMIN,
      ROLES.CLIENT,
      ROLES.PROFESSIONAL,
    ]);

    if (!validation.hasAccess) {
      return NextResponse.json(
        { error: validation.error || "Access denied" },
        { status: validation.user ? 403 : 401 }
      );
    }

    const { serviceRequestId } = await params;
    const requestId = parseInt(serviceRequestId);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid service request ID" },
        { status: 400 }
      );
    }

    const conversations = await getConversationsByRequestId(requestId);

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ serviceRequestId: string }> }
) {
  try {
    // Validate user has access
    const validation = await validateUserRole([
      ROLES.ADMIN,
      ROLES.CLIENT,
      ROLES.PROFESSIONAL,
    ]);

    if (!validation.hasAccess || !validation.user) {
      return NextResponse.json(
        { error: validation.error || "Access denied" },
        { status: validation.user ? 403 : 401 }
      );
    }

    const { serviceRequestId } = await params;
    const requestId = parseInt(serviceRequestId);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid service request ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Determine sender type based on user role
    let senderType: "client" | "professional" | "admin";
    switch (validation.user.role) {
      case "admin":
        senderType = "admin";
        break;
      case "professional":
        senderType = "professional";
        break;
      case "client":
        senderType = "client";
        break;
      default:
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 400 }
        );
    }

    const newMessage = await createConversationMessage({
      serviceRequestId: requestId,
      senderId: validation.user.id,
      senderType,
      message: message.trim(),
    });

    // Fetch user profile to get full name
    const { db } = await import("@/lib/db/drizzle");
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, validation.user.id),
      with: {
        clientProfile: true,
        professionalProfile: true,
      },
    });

    const senderName =
      user?.clientProfile?.firstName && user?.clientProfile?.lastName
        ? `${user.clientProfile.firstName} ${user.clientProfile.lastName}`
        : user?.professionalProfile?.firstName &&
          user?.professionalProfile?.lastName
        ? `${user.professionalProfile.firstName} ${user.professionalProfile.lastName}`
        : user?.name || "Unknown";

    // Format message for client
    const formattedMessage = {
      id: newMessage.id,
      content: newMessage.message,
      senderId: newMessage.senderId,
      senderName,
      senderRole: newMessage.senderType,
      timestamp: newMessage.createdAt.toISOString(),
      isRead: false,
    };

    // Broadcast message via Socket.IO
    try {
      const io = global.io;
      if (io) {
        const roomName = `request-${requestId}`;
        io.to(roomName).emit("newMessage", formattedMessage);
        console.log(`Message broadcasted to room ${roomName}`);
      }
    } catch (socketError) {
      console.error("Error broadcasting message via Socket.IO:", socketError);
      // Don't fail the request if Socket.IO broadcast fails
    }

    return NextResponse.json(formattedMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
