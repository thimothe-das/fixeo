"use client";

import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const mockMessages = [
  {
    id: 1,
    client: "Marie Dubois",
    lastMessage: "Merci pour votre intervention rapide !",
    time: "10:30",
    unread: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    client: "Jean Martin",
    lastMessage: "À quelle heure arrivez-vous ?",
    time: "09:15",
    unread: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

export function Messages() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Messages</h1>

      <div className="grid md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <Avatar>
                    <AvatarImage src={message.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {message.client
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{message.client}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {message.lastMessage}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{message.time}</p>
                    {message.unread && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 ml-auto"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Marie Dubois</CardTitle>
                <p className="text-sm text-gray-500">En ligne</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="space-y-4 h-96 overflow-y-auto">
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm">
                    Bonjour, à quelle heure arrivez-vous pour la réparation ?
                  </p>
                  <p className="text-xs text-gray-500 mt-1">10:15</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">
                    Bonjour ! J'arrive vers 14h comme convenu.
                  </p>
                  <p className="text-xs text-blue-200 mt-1">10:16</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Input placeholder="Tapez votre message..." className="flex-1" />
              <Button size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
