"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
  userId?: number;
  userRole?: string;
  enabled?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (requestId: number) => void;
  leaveRoom: (requestId: number) => void;
  sendMessage: (requestId: number, message: string) => void;
  startTyping: (requestId: number) => void;
  stopTyping: (requestId: number) => void;
}

export function useSocket({
  userId,
  userRole,
  enabled = true,
}: UseSocketOptions): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !userId || !userRole) {
      return;
    }

    // Initialize Socket.IO connection
    const socketInstance = io({
      path: "/api/socketio",
      auth: {
        userId,
        userRole,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Connection event handlers
    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);

      // Clear any reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);

      // Auto-reconnect if not a manual disconnect
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        socketInstance.connect();
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);

      // Retry connection after a delay
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Retrying socket connection...");
        socketInstance.connect();
      }, 3000);
    });

    socketInstance.on("error", (error: { message: string }) => {
      console.error("Socket error:", error.message);
    });

    // Clean up on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [userId, userRole, enabled]);

  const joinRoom = useCallback(
    (requestId: number) => {
      if (socketRef.current && isConnected) {
        console.log(`Joining room: request-${requestId}`);
        socketRef.current.emit("joinRoom", requestId);
      }
    },
    [isConnected]
  );

  const leaveRoom = useCallback(
    (requestId: number) => {
      if (socketRef.current) {
        console.log(`Leaving room: request-${requestId}`);
        socketRef.current.emit("leaveRoom", requestId);
      }
    },
    []
  );

  const sendMessage = useCallback(
    (requestId: number, message: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("sendMessage", { requestId, message });
      }
    },
    [isConnected]
  );

  const startTyping = useCallback(
    (requestId: number) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("typing", requestId);

        // Auto-stop typing after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          stopTyping(requestId);
        }, 3000);
      }
    },
    [isConnected]
  );

  const stopTyping = useCallback(
    (requestId: number) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("stopTyping", requestId);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    },
    [isConnected]
  );

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
  };
}

