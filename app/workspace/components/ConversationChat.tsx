"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Message, useConversation } from "@/hooks/use-conversation";
import { useSocket } from "@/hooks/use-socket";
import {
  handleNewMessageNotification,
  requestNotificationPermission,
} from "@/lib/utils/notifications";
import { AlertCircle, Send } from "lucide-react";
import * as React from "react";

interface ConversationChatProps {
  requestId: number;
  currentUserId?: number;
  currentUserRole?: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  otherUserRole?: "client" | "professional";
  className?: string;
  showHeader?: boolean;
  onNewMessage?: (message: Message) => void;
}

export function ConversationChat({
  requestId,
  currentUserId,
  currentUserRole,
  otherUserName = "User",
  otherUserAvatar,
  otherUserRole,
  className = "",
  showHeader = true,
  onNewMessage,
}: ConversationChatProps) {
  const [messageInput, setMessageInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket connection
  const { socket, isConnected, startTyping, stopTyping } = useSocket({
    userId: currentUserId,
    userRole: currentUserRole,
    enabled: !!currentUserId && !!currentUserRole,
  });

  console.log("socket", socket);

  // Request notification permission on mount
  React.useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Handle new message callback with notifications
  const handleNewMessage = React.useCallback(
    (message: Message) => {
      if (currentUserId && message.senderId !== currentUserId) {
        handleNewMessageNotification(
          message.senderName,
          message.content,
          currentUserId,
          message.senderId,
          () => {
            window.focus();
          }
        );
      }
      if (onNewMessage) {
        onNewMessage(message);
      }
    },
    [currentUserId, onNewMessage]
  );

  // Manage conversation state
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    isSending,
    typingUsers,
    onlineUsers,
  } = useConversation({
    requestId,
    socket,
    isConnected,
    currentUserId,
    enabled: true,
    onNewMessage: handleNewMessage,
  });

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      startTyping(requestId);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(requestId);
      }
    }, 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || isSending) return;

    const messageToSend = messageInput.trim();
    setMessageInput("");

    // Clear typing state
    if (isTyping) {
      setIsTyping(false);
      stopTyping(requestId);
    }

    try {
      await sendMessage(messageToSend);
      // Focus back on input
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message on error
      setMessageInput(messageToSend);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
      });
    }
  };

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    if (!messages || messages.length === 0) return {};

    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  }, [messages]);

  const isOtherUserOnline = React.useMemo(() => {
    return onlineUsers.length > 0;
  }, [onlineUsers]);

  const isOtherUserTyping = typingUsers.length > 0;

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 text-sm">
            Erreur lors du chargement de la conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-white rounded-lg border border-gray-200 ${className}`}
    >
      {/* Header */}
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUserAvatar} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                  {otherUserName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {otherUserName}
                </h3>
                <div className="flex items-center gap-2">
                  {isOtherUserOnline ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">En ligne</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-500">Hors ligne</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Wifi className="h-4 w-4" />
                  <span>Connecté</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <WifiOff className="h-4 w-4" />
                  <span>Déconnecté</span>
                </div>
              )}
            </div> */}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-[400px] max-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner className="h-8 w-8" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Send className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium text-lg mb-2">
              Commencez la conversation
            </p>
            <p className="text-gray-600 text-sm">
              Envoyez un message à {otherUserName}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
              <div key={dateKey}>
                {/* Date Separator */}
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600 font-medium">
                    {formatDate(msgs[0].timestamp)}
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-4">
                  {msgs.map((message) => {
                    const isCurrentUser = message.senderId === currentUserId;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-2 max-w-[70%] ${
                            isCurrentUser ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {/* Avatar - only for other user */}
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={otherUserAvatar} />
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                {message.senderName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          {/* Message Bubble */}
                          <div>
                            <div
                              className={`rounded-2xl px-4 py-2.5 ${
                                isCurrentUser
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words">
                                {message.content}
                              </p>
                            </div>
                            <p
                              className={`text-xs mt-1 px-1 ${
                                isCurrentUser
                                  ? "text-right text-gray-500"
                                  : "text-left text-gray-500"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isOtherUserTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {otherUserName} est en train d'écrire...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Écrivez votre message..."
            value={messageInput}
            onChange={handleInputChange}
            disabled={isSending || !isConnected}
            className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={!messageInput.trim() || isSending || !isConnected}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 min-h-[44px] min-w-[44px] touch-manipulation"
          >
            {isSending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
