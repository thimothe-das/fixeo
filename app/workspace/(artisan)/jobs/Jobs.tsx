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
  AlertTriangle,
  FileText,
  Camera,
  Plus,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import moment from "moment";
import { ServiceRequestForArtisan } from "../../components/types";

interface JobsProps {
  assignedRequests: ServiceRequestForArtisan[];
}

export default function Jobs({ assignedRequests }: JobsProps) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [missionsSortBy, setMissionsSortBy] = useState("date");
  const [selectedMission, setSelectedMission] =
    useState<ServiceRequestForArtisan | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  // Completion validation states
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [completionType, setCompletionType] = useState<
    "success" | "issue" | "impossible" | "validate" | "dispute"
  >("success");
  const [completionNotes, setCompletionNotes] = useState("");
  const [issueType, setIssueType] = useState("");
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

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
      accepted: {
        label: "Validation mutuelle requise",
        color: "text-purple-600 border-purple-200 bg-purple-50",
      },
      completed: {
        label: "Terminée",
        color: "text-green-600 border-green-200 bg-green-50",
      },
      awaiting_validation: {
        label: "Validation mutuelle requise",
        color: "text-purple-600 border-purple-200 bg-purple-50",
      },
      client_validated: {
        label: "Client validé - À valider",
        color: "text-cyan-600 border-cyan-200 bg-cyan-50",
      },
      artisan_validated: {
        label: "Vous avez validé",
        color: "text-indigo-600 border-indigo-200 bg-indigo-50",
      },
      completed_with_issues: {
        label: "Terminée avec problèmes",
        color: "text-red-600 border-red-200 bg-red-50",
      },
      could_not_complete: {
        label: "Non réalisable",
        color: "text-gray-600 border-gray-200 bg-gray-50",
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

  const handleMissionCompletion = async () => {
    if (!selectedMission) return;

    setIsSubmittingCompletion(true);
    try {
      const response = await fetch(
        `/api/service-requests/${selectedMission.id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: completionType,
            notes: completionNotes,
            issueType:
              completionType === "issue" || completionType === "dispute"
                ? issueType
                : undefined,
            photos: completionPhotos,
          }),
        }
      );

      if (response.ok) {
        // Update mission status locally
        if (completionType === "success") {
          selectedMission.status = "accepted";
        } else if (completionType === "validate") {
          selectedMission.status =
            selectedMission.status === "client_validated"
              ? "completed"
              : "artisan_validated";
        } else if (completionType === "dispute") {
          selectedMission.status = "disputed";
        } else if (completionType === "issue") {
          selectedMission.status = "completed_with_issues";
        } else if (completionType === "impossible") {
          selectedMission.status = "could_not_complete";
        }

        setShowCompletionDialog(false);
        setShowIssueDialog(false);
        resetCompletionForm();
        // In a real app, you would refresh the data
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error completing mission:", error);
      alert("Erreur lors de la finalisation de la mission");
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  const resetCompletionForm = () => {
    setCompletionType("success");
    setCompletionNotes("");
    setIssueType("");
    setCompletionPhotos([]);
  };

  const handleStartMission = async (mission: ServiceRequestForArtisan) => {
    try {
      const response = await fetch(
        `/api/service-requests/${mission.id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        mission.status = "in-progress";
        // In a real app, you would refresh the data
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error starting mission:", error);
      alert("Erreur lors du démarrage de la mission");
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
      <>
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
                    <Button
                      className="w-full flex items-center gap-2"
                      size="lg"
                      onClick={() => handleStartMission(mission)}
                    >
                      <Clock className="h-4 w-4" />
                      Commencer la mission
                    </Button>
                  )}

                  {mission.status === "accepted" && (
                    <div className="space-y-2">
                      <Button
                        className="w-full flex items-center gap-2"
                        size="lg"
                        onClick={() => {
                          setCompletionType("success");
                          setShowCompletionDialog(true);
                        }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mission terminée avec succès
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                        size="lg"
                        onClick={() => {
                          setCompletionType("issue");
                          setShowIssueDialog(true);
                        }}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Signaler un problème
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        size="lg"
                        onClick={() => {
                          setCompletionType("impossible");
                          setShowIssueDialog(true);
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                        Mission impossible à réaliser
                      </Button>
                    </div>
                  )}
                  {/* Artisan Validation Actions */}
                  {(mission.status === "accepted" ||
                    mission.status === "client_validated") && (
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm text-purple-700 font-medium mb-2">
                          {mission.status === "accepted"
                            ? "Mission terminée - Validation mutuelle requise"
                            : "Le client a validé - Votre validation est maintenant requise"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600"
                          size="lg"
                          onClick={() => {
                            setCompletionType("validate");
                            setShowCompletionDialog(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Valider
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                          size="lg"
                          onClick={() => {
                            setCompletionType("dispute");
                            setShowIssueDialog(true);
                          }}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Contester
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Artisan Already Validated */}
                  {mission.status === "artisan_validated" && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-sm text-indigo-700 font-medium">
                        Vous avez validé cette mission. En attente de la
                        validation du client.
                      </p>
                    </div>
                  )}

                  {/* Issues Status */}
                  {mission.status === "completed_with_issues" && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">
                        Mission terminée avec des problèmes signalés
                      </p>
                    </div>
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

        <Dialog
          open={showCompletionDialog}
          onOpenChange={setShowCompletionDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {completionType === "validate"
                  ? "Valider la mission"
                  : "Mission terminée avec succès"}
              </DialogTitle>
              <DialogDescription>
                {completionType === "validate"
                  ? "Confirmez que vous validez cette mission comme correctement réalisée."
                  : "Confirmez que la mission a été réalisée avec succès. Le client sera notifié pour validation."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Notes de fin de mission (optionnel)
                </label>
                <Textarea
                  placeholder="Décrivez brièvement ce qui a été réalisé..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Photos de fin de mission (optionnel)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Ajoutez des photos du travail terminé
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCompletionDialog(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleMissionCompletion}
                disabled={isSubmittingCompletion}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmittingCompletion
                  ? "En cours..."
                  : completionType === "validate"
                  ? "Confirmer la validation"
                  : "Confirmer la fin de mission"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Issue/Problem Dialog */}
        <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {completionType === "impossible" ? (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    Mission impossible à réaliser
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Signaler un problème
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {completionType === "impossible"
                  ? "Indiquez pourquoi la mission ne peut pas être réalisée."
                  : "Décrivez le problème rencontré. Le client sera notifié."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type de problème
                </label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type de problème" />
                  </SelectTrigger>
                  <SelectContent>
                    {completionType === "impossible" ? (
                      <>
                        <SelectItem value="access_denied">
                          Accès refusé sur site
                        </SelectItem>
                        <SelectItem value="missing_materials">
                          Matériaux/outils manquants
                        </SelectItem>
                        <SelectItem value="safety_concern">
                          Problème de sécurité
                        </SelectItem>
                        <SelectItem value="structural_issue">
                          Problème structurel découvert
                        </SelectItem>
                        <SelectItem value="client_unavailable">
                          Client indisponible
                        </SelectItem>
                        <SelectItem value="weather_conditions">
                          Conditions météorologiques
                        </SelectItem>
                        <SelectItem value="other">Autre raison</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="partial_completion">
                          Travail partiellement terminé
                        </SelectItem>
                        <SelectItem value="quality_issue">
                          Problème de qualité
                        </SelectItem>
                        <SelectItem value="additional_work_needed">
                          Travaux supplémentaires nécessaires
                        </SelectItem>
                        <SelectItem value="material_damage">
                          Dommage matériel découvert
                        </SelectItem>
                        <SelectItem value="client_request_change">
                          Demande de modification client
                        </SelectItem>
                        <SelectItem value="other">Autre problème</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description détaillée *
                </label>
                <Textarea
                  placeholder="Décrivez en détail le problème rencontré..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Photos justificatives (recommandé)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Ajoutez des photos du problème
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowIssueDialog(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleMissionCompletion}
                disabled={
                  isSubmittingCompletion ||
                  !issueType ||
                  !completionNotes.trim()
                }
                className={
                  completionType === "impossible"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }
              >
                {isSubmittingCompletion
                  ? "En cours..."
                  : "Signaler le problème"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
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
