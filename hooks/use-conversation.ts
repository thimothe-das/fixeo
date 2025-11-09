"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import useSWR from "swr";

export interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderRole: "client" | "professional" | "admin";
  timestamp: string;
  isRead: boolean;
}

interface UseConversationOptions {
  requestId: number;
  socket: Socket | null;
  isConnected: boolean;
  currentUserId?: number;
  enabled?: boolean;
  onNewMessage?: (message: Message) => void;
}

interface UseConversationReturn {
  messages: Message[];
  isLoading: boolean;
  error: any;
  sendMessage: (message: string) => Promise<void>;
  isSending: boolean;
  typingUsers: number[];
  onlineUsers: number[];
  mutate: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useConversation({
  requestId,
  socket,
  isConnected,
  currentUserId,
  enabled = true,
  onNewMessage,
}: UseConversationOptions): UseConversationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasJoinedRoom = useRef(false);

  // Fetch initial messages via REST API
  const {
    data: initialMessages,
    error,
    mutate,
    isLoading,
  } = useSWR<Message[]>(
    enabled ? `/api/conversations/${requestId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Update messages when initial data loads
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Join the conversation room when socket connects
  useEffect(() => {
    if (socket && isConnected && enabled && !hasJoinedRoom.current) {
      socket.emit("joinRoom", requestId);
      hasJoinedRoom.current = true;
      console.log(`Joined conversation room for request ${requestId}`);
    }

    return () => {
      if (socket && hasJoinedRoom.current) {
        socket.emit("leaveRoom", requestId);
        hasJoinedRoom.current = false;
      }
    };
  }, [socket, isConnected, requestId, enabled]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: Message) => {
      console.log("Received new message:", message);
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });

      // Call callback if provided
      if (onNewMessage) {
        onNewMessage(message);
      }

      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    const handleUserTyping = ({
      userId,
    }: {
      userId: number;
      userRole: string;
    }) => {
      if (userId !== currentUserId) {
        setTypingUsers((prev) => {
          if (!prev.includes(userId)) {
            return [...prev, userId];
          }
          return prev;
        });
      }
    };

    const handleUserStoppedTyping = ({ userId }: { userId: number }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    };

    const handleUserOnline = ({ userId }: { userId: number }) => {
      setOnlineUsers((prev) => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });
    };

    const handleUserOffline = ({ userId }: { userId: number }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    };

    const handleOnlineUsers = ({ users }: { users: number[] }) => {
      setOnlineUsers(users.filter((id) => id !== currentUserId));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [socket, isConnected, currentUserId, onNewMessage]);

  // Send message function
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isSending) {
        return;
      }

      setIsSending(true);

      try {
        // Send via REST API for persistence
        const response = await fetch(`/api/conversations/${requestId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message.trim(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send message");
        }

        // Message will be received via WebSocket
        // Optionally, we can add optimistic update here
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      } finally {
        setIsSending(false);
      }
    },
    [requestId, isSending]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isSending,
    typingUsers,
    onlineUsers,
    mutate,
  };
}
