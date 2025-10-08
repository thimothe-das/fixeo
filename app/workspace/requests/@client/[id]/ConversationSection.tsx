"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import * as React from "react";
import useSWR from "swr";

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderRole: "client" | "artisan" | "admin";
  timestamp: string;
  isRead: boolean;
}

interface ConversationSectionProps {
  serviceRequestId: number;
  currentUserId?: number;
  artisanName?: string;
  artisanAvatar?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ConversationSection({
  serviceRequestId,
  currentUserId,
  artisanName,
  artisanAvatar,
}: ConversationSectionProps) {
  const [newMessage, setNewMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const {
    data: messages,
    error,
    mutate,
  } = useSWR<Message[]>(`/api/conversations/${serviceRequestId}`, fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds for near real-time
  });

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
        // Optimistically update the UI
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">
          Erreur lors du chargement de la conversation
        </p>
      </div>
    );
  }

  return (
    <div id="conversation" className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" />
        Conversation
      </h2>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Chat Messages Area */}
        <div
          ref={chatContainerRef}
          className="h-[400px] overflow-y-auto p-4 bg-gray-50"
        >
          {!messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                Aucun message pour le moment
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Commencez la conversation avec {artisanName || "l'artisan"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                <div key={dateKey}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm border border-gray-200">
                      {formatDate(msgs[0].timestamp)}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  <div className="space-y-3">
                    {msgs.map((message) => {
                      const isCurrentUser = message.senderId === currentUserId;
                      const isArtisan = message.senderRole === "artisan";

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
                            {/* Avatar */}
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
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isCurrentUser
                                  ? "bg-[#FF385C] text-white"
                                  : "bg-white border border-gray-200 text-gray-900"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.content}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  isCurrentUser
                                    ? "text-pink-100"
                                    : "text-gray-400"
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
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
