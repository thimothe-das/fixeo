"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useSocket } from "@/hooks/use-socket";
import { useConversation, Message } from "@/hooks/use-conversation";
import { Send, X, Wifi, WifiOff } from "lucide-react";
import * as React from "react";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceRequestId: number;
  currentUserId?: number;
  artisanName?: string;
  artisanAvatar?: string;
}

export function ChatModal({
  open,
  onOpenChange,
  serviceRequestId,
  currentUserId,
  artisanName = "l'artisan",
  artisanAvatar,
}: ChatModalProps) {
  const [newMessage, setNewMessage] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket connection (only when modal is open)
  const { socket, isConnected, startTyping, stopTyping } = useSocket({
    userId: currentUserId,
    userRole: "client",
    enabled: open && !!currentUserId,
  });

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
    requestId: serviceRequestId,
    socket,
    isConnected,
    currentUserId,
    enabled: open,
  });

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messagesEndRef.current && open) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      startTyping(serviceRequestId);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(serviceRequestId);
      }
    }, 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    const messageToSend = newMessage.trim();
    setNewMessage("");

    // Clear typing state
    if (isTyping) {
      setIsTyping(false);
      stopTyping(serviceRequestId);
    }

    try {
      await sendMessage(messageToSend);
      // Focus back on input
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message on error
      setNewMessage(messageToSend);
      alert("Erreur lors de l'envoi du message");
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

  const isOtherUserOnline = onlineUsers.length > 0;
  const isOtherUserTyping = typingUsers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-[#EBEBEB] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={artisanAvatar} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                  {artisanName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
              <DialogTitle className="text-[18px] font-semibold text-[#222222]">
                {artisanName}
              </DialogTitle>
                <div className="flex items-center gap-2">
                  {isOtherUserOnline ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">En ligne</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-xs text-gray-500">Hors ligne</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-400" />
              )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-600 text-sm">
                Erreur lors du chargement de la conversation
              </p>
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-[#222222] font-medium text-lg mb-2">
                Commencez la conversation
              </p>
              <p className="text-[#717171] text-sm">
                Envoyez un message à {artisanName}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                <div key={dateKey}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-[#717171] font-medium">
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
                                <AvatarImage src={artisanAvatar} />
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
                                    ? "bg-[#FF385C] text-white"
                                    : "bg-[#F7F7F7] text-[#222222]"
                                }`}
                              >
                                <p className="text-[15px] leading-relaxed break-words">
                                  {message.content}
                                </p>
                              </div>
                              <p
                                className={`text-xs mt-1 px-1 ${
                                  isCurrentUser
                                    ? "text-right text-[#717171]"
                                    : "text-left text-[#717171]"
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
                  <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
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
                    <span className="text-xs text-gray-600">{artisanName} est en train d'écrire...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="px-6 py-4 border-t border-[#EBEBEB] bg-white flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={handleInputChange}
              disabled={isSending || !isConnected}
              className="flex-1 border-[#DDDDDD] focus:border-[#FF385C] focus:ring-[#FF385C]"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending || !isConnected}
              className="bg-[#FF385C] hover:bg-[#E31C5F] text-white px-6"
            >
              {isSending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
