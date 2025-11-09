import { db } from "@/lib/db/drizzle";
import {
  adminSupportConversations,
  users,
  MessageSenderType,
  NewAdminSupportConversation,
} from "@/lib/db/schema";
import { and, desc, eq, or } from "drizzle-orm";

export async function getAdminSupportMessages(userId: number) {
  const messages = await db
    .select({
      id: adminSupportConversations.id,
      content: adminSupportConversations.message,
      senderId: adminSupportConversations.senderId,
      senderType: adminSupportConversations.senderType,
      timestamp: adminSupportConversations.createdAt,
      isRead: adminSupportConversations.readAt,
      senderName: users.name,
      senderRole: users.role,
    })
    .from(adminSupportConversations)
    .leftJoin(users, eq(adminSupportConversations.senderId, users.id))
    .where(eq(adminSupportConversations.userId, userId))
    .orderBy(adminSupportConversations.createdAt);

  return messages;
}

export async function createAdminSupportMessage(
  data: NewAdminSupportConversation
) {
  const [newMessage] = await db
    .insert(adminSupportConversations)
    .values(data)
    .returning();

  return newMessage;
}

export async function getAllAdminSupportConversations() {
  // For admin view - get all conversations with latest message
  const allMessages = await db
    .select({
      userId: adminSupportConversations.userId,
      userName: users.name,
      userEmail: users.email,
      userRole: users.role,
      lastMessage: adminSupportConversations.message,
      lastMessageTime: adminSupportConversations.createdAt,
      senderId: adminSupportConversations.senderId,
      senderType: adminSupportConversations.senderType,
    })
    .from(adminSupportConversations)
    .leftJoin(users, eq(adminSupportConversations.userId, users.id))
    .orderBy(desc(adminSupportConversations.createdAt));

  // Group by userId to get unique conversations
  const conversations = allMessages.reduce((acc: any[], message) => {
    const existing = acc.find((c) => c.userId === message.userId);
    if (!existing) {
      acc.push(message);
    }
    return acc;
  }, []);

  return conversations;
}

