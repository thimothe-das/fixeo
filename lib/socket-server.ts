import { db } from "@/lib/db/drizzle";
import { conversations, serviceRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Server as HTTPServer } from "http";
import { Socket as NetSocket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

// Track online users per room
const onlineUsers = new Map<string, Set<number>>();
const typingUsers = new Map<string, Set<number>>();

export function initSocketIO(res: NextApiResponseWithSocket): SocketIOServer {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    res.socket.server.io = io;
    global.io = io;

    io.on("connection", async (socket) => {
      console.log("Client connected:", socket.id);

      // Authenticate user from socket handshake
      const userId = socket.handshake.auth.userId;
      const userRole = socket.handshake.auth.userRole;

      if (!userId || !userRole) {
        console.log("Unauthenticated connection attempt");
        socket.disconnect();
        return;
      }

      socket.data.userId = userId;
      socket.data.userRole = userRole;

      // Handle joining a conversation room
      socket.on("joinRoom", async (requestId: number) => {
        try {
          // Verify user has access to this conversation
          const request = await db
            .select({
              id: serviceRequests.id,
              userId: serviceRequests.userId,
              assignedArtisanId: serviceRequests.assignedArtisanId,
            })
            .from(serviceRequests)
            .where(eq(serviceRequests.id, requestId))
            .limit(1);

          if (!request || request.length === 0) {
            socket.emit("error", { message: "Service request not found" });
            return;
          }

          const serviceRequest = request[0];
          const isClient = serviceRequest.userId === userId;
          const isArtisan = serviceRequest.assignedArtisanId === userId;
          const isAdmin = userRole === "admin";

          if (!isClient && !isArtisan && !isAdmin) {
            socket.emit("error", {
              message: "Access denied to this conversation",
            });
            return;
          }

          const roomName = `request-${requestId}`;
          socket.join(roomName);

          // Track online users
          if (!onlineUsers.has(roomName)) {
            onlineUsers.set(roomName, new Set());
          }
          onlineUsers.get(roomName)!.add(userId);

          // Notify others in the room
          socket.to(roomName).emit("userOnline", { userId, userRole });

          // Send current online users to the joining user
          const currentOnlineUsers = Array.from(
            onlineUsers.get(roomName) || []
          );
          socket.emit("onlineUsers", { users: currentOnlineUsers });

          console.log(`User ${userId} joined room ${roomName}`);
        } catch (error) {
          console.error("Error joining room:", error);
          socket.emit("error", { message: "Failed to join room" });
        }
      });

      // Handle leaving a room
      socket.on("leaveRoom", (requestId: number) => {
        const roomName = `request-${requestId}`;
        socket.leave(roomName);

        if (onlineUsers.has(roomName)) {
          onlineUsers.get(roomName)!.delete(userId);
          if (onlineUsers.get(roomName)!.size === 0) {
            onlineUsers.delete(roomName);
          }
        }

        // Remove from typing if present
        if (typingUsers.has(roomName)) {
          typingUsers.get(roomName)!.delete(userId);
        }

        socket.to(roomName).emit("userOffline", { userId });
        console.log(`User ${userId} left room ${roomName}`);
      });

      // Handle sending messages
      socket.on(
        "sendMessage",
        async (data: { requestId: number; message: string }) => {
          try {
            const { requestId, message } = data;

            if (!message || message.trim().length === 0) {
              socket.emit("error", { message: "Message cannot be empty" });
              return;
            }

            // Determine sender type
            let senderType: "client" | "professional" | "admin";
            switch (userRole) {
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
                socket.emit("error", { message: "Invalid user role" });
                return;
            }

            // Save message to database
            const [newMessage] = await db
              .insert(conversations)
              .values({
                serviceRequestId: requestId,
                senderId: userId,
                senderType,
                message: message.trim(),
              })
              .returning();

            // Get sender information
            const user = await db.query.users.findFirst({
              where: (users, { eq }) => eq(users.id, userId),
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

            const messageData = {
              id: newMessage.id,
              content: newMessage.message,
              senderId: newMessage.senderId,
              senderName,
              senderRole: newMessage.senderType,
              timestamp: newMessage.createdAt.toISOString(),
              isRead: false,
            };

            // Emit to all users in the room (including sender for confirmation)
            const roomName = `request-${requestId}`;
            io.to(roomName).emit("newMessage", messageData);

            // Clear typing indicator
            if (typingUsers.has(roomName)) {
              typingUsers.get(roomName)!.delete(userId);
              socket.to(roomName).emit("userStoppedTyping", { userId });
            }

            console.log(`Message sent in room ${roomName} by user ${userId}`);
          } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
          }
        }
      );

      // Handle typing indicators
      socket.on("typing", (requestId: number) => {
        const roomName = `request-${requestId}`;

        if (!typingUsers.has(roomName)) {
          typingUsers.set(roomName, new Set());
        }
        typingUsers.get(roomName)!.add(userId);

        socket.to(roomName).emit("userTyping", { userId, userRole });
      });

      socket.on("stopTyping", (requestId: number) => {
        const roomName = `request-${requestId}`;

        if (typingUsers.has(roomName)) {
          typingUsers.get(roomName)!.delete(userId);
        }

        socket.to(roomName).emit("userStoppedTyping", { userId });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        // Remove from all rooms
        socket.rooms.forEach((room) => {
          if (room.startsWith("request-")) {
            if (onlineUsers.has(room)) {
              onlineUsers.get(room)!.delete(userId);
              if (onlineUsers.get(room)!.size === 0) {
                onlineUsers.delete(room);
              }
            }

            if (typingUsers.has(room)) {
              typingUsers.get(room)!.delete(userId);
            }

            socket.to(room).emit("userOffline", { userId });
          }
        });
      });
    });

    console.log("Socket.IO server initialized");
  } else {
    console.log("Socket.IO server already running");
  }

  return res.socket.server.io;
}

export function getIO(
  res: NextApiResponseWithSocket
): SocketIOServer | undefined {
  return res.socket.server.io;
}
