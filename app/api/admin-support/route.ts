import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupportMessage,
  getAdminSupportMessages,
} from "@/lib/db/queries/admin-support";
import { ROLES, validateUserRole } from "@/lib/auth/roles";

export async function GET(request: NextRequest) {
  try {
    // Validate user has access (client, professional, or admin)
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

    const messages = await getAdminSupportMessages(validation.user.id);

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin support messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { message, subject } = body;

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

    // Subject is optional for backward compatibility
    if (subject && typeof subject !== "string") {
      return NextResponse.json(
        { error: "Subject must be a string" },
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

    const newMessage = await createAdminSupportMessage({
      userId: validation.user.id,
      senderId: validation.user.id,
      senderType,
      message: message.trim(),
      createdAt: new Date(),
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating admin support message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

