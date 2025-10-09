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
import { Send, X } from "lucide-react";
import * as React from "react";
import useSWR from "swr";

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderRole: "client" | "professional" | "admin";
  timestamp: string;
  isRead: boolean;
}

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceRequestId: number;
  currentUserId?: number;
  artisanName?: string;
  artisanAvatar?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ChatModal({
  open,
  onOpenChange,
  serviceRequestId,
  currentUserId,
  artisanName = "l'artisan",
  artisanAvatar,
}: ChatModalProps) {
  const [newMessage, setNewMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  //
  const {
    data: messages,
    error,
    mutate,
  } = useSWR<Message[]>(
    open ? `/api/conversations/${serviceRequestId}` : null,
    fetcher,
    {
      refreshInterval: open ? 3000 : 0, // Refresh every 3 seconds when modal is open
    }
  );

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messagesEndRef.current && open) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch(`/api/conversations/${serviceRequestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage("");
        mutate();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Erreur lors de l'envoi du message");
    } finally {
      setIsSending(false);
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
              <DialogTitle className="text-[18px] font-semibold text-[#222222]">
                {artisanName}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {error ? (
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
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="px-6 py-4 border-t border-[#EBEBEB] bg-white flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              type="text"
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
              className="flex-1 border-[#DDDDDD] focus:border-[#FF385C] focus:ring-[#FF385C]"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-[#FF385C] hover:bg-[#E31C5F] text-white px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
