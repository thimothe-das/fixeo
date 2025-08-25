"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Wrench,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Star,
  Home,
  Zap,
  Send,
  ArrowLeft,
  Clock,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import moment from "moment";
import { ServiceRequestForArtisan } from "./types";

interface JobsComponentProps {
  assignedRequests: ServiceRequestForArtisan[];
}

export function JobsComponent({ assignedRequests }: JobsComponentProps) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [missionsSortBy, setMissionsSortBy] = useState("date");
  const [selectedMission, setSelectedMission] =
    useState<ServiceRequestForArtisan | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const statusOptions = [
    {
      value: "all",
      label: "Tous les statuts",
      count: assignedRequests.length,
    },
    {
      value: "scheduled",
      label: "Planifiées",
      count: assignedRequests.filter((m) => m.status === "scheduled").length,
    },
    {
      value: "in-progress",
      label: "En cours",
      count: assignedRequests.filter((m) => m.status === "in-progress").length,
    },
    {
      value: "completed",
      label: "Terminées",
      count: assignedRequests.filter((m) => m.status === "completed").length,
    },
  ];

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "status", label: "Statut" },
    { value: "client", label: "Client" },
    { value: "price", label: "Prix" },
  ];

  // Filter and sort logic
  const filteredMissions = assignedRequests
    .filter(
      (mission) => filterStatus === "all" || mission.status === filterStatus
    )
    .sort((a, b) => {
      switch (missionsSortBy) {
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "status":
          const statusOrder: Record<string, number> = {
            "in-progress": 0,
            scheduled: 1,
            completed: 2,
          };
          return (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
        case "client":
          return (a.clientName || "").localeCompare(b.clientName || "");
        case "price":
          return (b.estimatedPrice || 0) - (a.estimatedPrice || 0);
        default:
          return 0;
      }
    });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      scheduled: {
        label: "Planifiée",
        color: "text-blue-600 border-blue-200 bg-blue-50",
      },
      "in-progress": {
        label: "En cours",
        color: "text-orange-600 border-orange-200 bg-orange-50",
      },
      completed: {
        label: "Terminée",
        color: "text-green-600 border-green-200 bg-green-50",
      },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getCategoryIcon = (category: string): React.ReactElement => {
    const icons: Record<string, React.ReactElement> = {
      plumbing: <Wrench className="h-4 w-4 text-blue-600" />,
      electrical: <Zap className="h-4 w-4 text-yellow-600" />,
      furniture: <Home className="h-4 w-4 text-green-600" />,
    };
    return icons[category] || <Wrench className="h-4 w-4 text-gray-600" />;
  };

  const formatDate = (date: string, time?: string) => {
    const dateObj = new Date(`${date} ${time || "00:00"}`);
    return {
      date: dateObj.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      time: dateObj.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullDate: dateObj.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  };

  const sendMessage = () => {
    if (chatMessage.trim() && selectedMission) {
      const newMessage = {
        id: (selectedMission.messages?.length || 0) + 1,
        sender: "artisan",
        message: chatMessage,
        createdAt: new Date().toISOString(),
      };

      // In a real app, this would update the backend
      if (selectedMission.messages) {
        selectedMission.messages.push(newMessage);
      } else {
        selectedMission.messages = [newMessage];
      }
      setChatMessage("");
    }
  };

  const MissionCard = ({ mission }: { mission: ServiceRequestForArtisan }) => {
    const formatted = formatDate(
      mission.date || mission.createdAt,
      mission.time || "00:00"
    );
    const photos = mission.photos ? JSON.parse(mission.photos) : [];

    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={"/placeholder.svg"} />
                  <AvatarFallback>
                    {(mission.clientName || "Georges")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {mission.serviceType}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {mission.clientName || "Georges"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {getStatusBadge(mission.status)}
                <div className="flex items-center space-x-1">
                  {getCategoryIcon(mission.category || "plumbing")}
                </div>
              </div>
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  {formatted.date} à {formatted.time}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="truncate">{mission.location}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 line-clamp-2">
              {mission.description || "Aucune description"}
            </p>

            {/* Photos */}
            {photos && photos.length > 0 && (
              <div className="flex space-x-2">
                {photos.slice(0, 3).map((photo: string, index: number) => (
                  <img
                    key={index}
                    src={photo || "/placeholder.svg"}
                    alt={`Photo ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ))}
                {photos.length > 3 && (
                  <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                    +{photos.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedMission(mission)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Détails
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedMission(mission);
                  setShowChat(true);
                }}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
              {mission.status === "in-progress" && (
                <Button size="sm" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Terminer
                </Button>
              )}
              <div className="sm:ml-auto flex items-center">
                <span className="font-bold text-lg text-green-600">
                  {mission.estimatedPrice
                    ? (mission.estimatedPrice / 100).toFixed(2)
                    : "60"}
                  €
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Mission Detail View - Integrated from RenderMissionDetail.tsx
  const renderMissionDetail = (mission: ServiceRequestForArtisan) => {
    const formatted = formatDate(
      mission.date || mission.createdAt,
      mission.time
    );
    const photos = mission.photos ? JSON.parse(mission.photos) : [];

    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedMission(null);
              setShowChat(false);
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux missions
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {mission.serviceType}
            </h1>
            <p className="text-gray-600">
              Mission avec {mission.clientName || "Georges"}
            </p>
          </div>
          {getStatusBadge(mission.status)}
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-250px)]">
          {/* Mission Details - Left Side */}
          <Card className="overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>
                    {(mission.clientName || "Georges")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {mission.clientName || "Georges"}
                  </h2>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">5/5</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Date & Heure</p>
                  <p className="font-medium">{formatted.fullDate}</p>
                  <p className="font-medium">{formatted.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durée estimée</p>
                  <p className="font-medium">2h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">
                    {mission.clientPhone || "Non spécifié"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rémunération</p>
                  <p className="font-bold text-xl text-green-600">
                    {mission.estimatedPrice
                      ? (mission.estimatedPrice / 100).toFixed(2)
                      : "60"}
                    €
                  </p>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </h3>
                <p className="text-gray-700">{mission.location}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 flex items-center gap-2 bg-transparent"
                >
                  <MapPin className="h-4 w-4" />
                  Ouvrir dans Maps
                </Button>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{mission.description}</p>
                {mission.notes && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <p className="text-sm">
                      <strong>Notes importantes:</strong> {mission.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Photos */}
              {photos && photos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Photos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {photos.map((photo: string, index: number) => (
                      <img
                        key={index}
                        src={photo || "/placeholder.svg"}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="font-semibold mb-3">Suivi de la mission</h3>
                <div className="space-y-3">
                  {mission.timeline?.map((step, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          step.completed ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            step.completed ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.step}
                        </p>
                        {step.date && (
                          <p className="text-xs text-gray-500">{step.date}</p>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          Mission créée
                        </p>
                        <p className="text-xs text-gray-500">
                          {moment(mission.createdAt).format(
                            "DD/MM/YYYY à HH:mm"
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                {mission.status === "scheduled" && (
                  <Button className="w-full flex items-center gap-2" size="lg">
                    <Clock className="h-4 w-4" />
                    Commencer la mission
                  </Button>
                )}

                {mission.status === "in-progress" && (
                  <Button className="w-full flex items-center gap-2" size="lg">
                    <CheckCircle className="h-4 w-4" />
                    Marquer comme terminée
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <User className="h-4 w-4" />
                    Appeler
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <MapPin className="h-4 w-4" />
                    Navigation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface - Right Side */}
          <Card className="flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3   ">
                <MessageSquare className="h-5 w-5" />
                Chat avec {mission.clientName || "Georges"}
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">En ligne</span>
                </div>
              </CardTitle>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {mission.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "artisan"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.sender === "artisan"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 border shadow-sm"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "artisan"
                            ? "text-blue-200"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun message pour le moment</p>
                    <p className="text-sm">
                      Commencez la conversation avec le client
                    </p>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  placeholder="Tapez votre message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!chatMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Main render - conditional based on selectedMission
  if (selectedMission) {
    return renderMissionDetail(selectedMission);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Missions</h1>
          <p className="text-gray-600">
            {filteredMissions.length} mission
            {filteredMissions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={missionsSortBy} onValueChange={setMissionsSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((status) => (
          <Button
            key={status.value}
            variant={filterStatus === status.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status.value)}
            className="flex items-center gap-2"
          >
            {status.label}
            <Badge variant="secondary" className="ml-1">
              {status.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Missions List */}
      {filteredMissions.length > 0 ? (
        <div className="grid gap-4">
          {filteredMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune mission trouvée
            </h3>
            <p className="text-gray-600">
              Aucune mission ne correspond aux filtres sélectionnés.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
