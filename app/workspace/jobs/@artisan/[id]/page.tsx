"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Cog,
  Euro,
  Eye,
  Fence,
  Hammer,
  Home,
  MapPin,
  MessageSquare,
  Paintbrush,
  Send,
  Star,
  ThumbsDown,
  ThumbsUp,
  User,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { ServiceRequestForArtisan } from "../../../components/types";
import useSWR from "swr";
import { useParams } from "next/navigation";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Job() {
  // Mission Detail View - Integrated from RenderMissionDetail.tsx

  const [filterStatus, setFilterStatus] = useState("all");
  const params = useParams();
  const requestId = parseInt(params.id as string);
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

  // Validation states
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [validationType, setValidationType] = useState<"approve" | "dispute">(
    "approve"
  );
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);

  const {
    data: mission,
    error,
    mutate,
  } = useSWR<ServiceRequestForArtisan>(
    `/api/service-requests/${requestId}`,
    fetcher
  );

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600">
            Impossible de charger les détails de la demande
          </p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  console.debug("mission", mission);

  const photos = mission?.photos ? JSON.parse(mission.photos) : [];

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
        label: "A valider",
        color: "text-purple-600 border-purple-200 bg-purple-50",
      },
      client_validated: {
        label: "À valider",
        color: "text-cyan-600 border-cyan-200 bg-cyan-50",
      },
      artisan_validated: {
        label: "Validée",
        color: "text-indigo-600 border-indigo-200 bg-indigo-50",
      },
      disputed_by_client: {
        label: "Litige client",
        color: "text-red-600 border-red-200 bg-red-50",
      },
      disputed_by_artisan: {
        label: "Litige artisan",
        color: "text-orange-600 border-orange-200 bg-orange-50",
      },
      disputed_by_both: {
        label: "Litige des deux parties",
        color: "text-purple-600 border-purple-200 bg-purple-50",
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

  const resetCompletionForm = () => {
    setCompletionType("success");
    setCompletionNotes("");
    setIssueType("");
    setCompletionPhotos([]);
  };

  const resetValidationForm = () => {
    setValidationType("approve");
    setDisputeReason("");
    setDisputeDetails("");
  };

  const handleValidateCompletion = async (
    mission: ServiceRequestForArtisan
  ) => {
    setIsSubmittingValidation(true);
    try {
      const response = await fetch(
        `/api/service-requests/${mission.id}/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: validationType,
            disputeReason:
              validationType === "dispute" ? disputeReason : undefined,
            disputeDetails:
              validationType === "dispute" ? disputeDetails : undefined,
          }),
        }
      );

      if (response.ok) {
        // Update mission status locally
        if (validationType === "approve") {
          mission.status =
            mission.status === "client_validated"
              ? "completed"
              : "artisan_validated";
        } else if (validationType === "dispute") {
          mission.status = "disputed_by_artisan";
        }

        setShowValidationDialog(false);
        setShowDisputeDialog(false);
        resetValidationForm();
        // In a real app, you would refresh the data
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error validating completion:", error);
      alert("Erreur lors de la validation");
    } finally {
      setIsSubmittingValidation(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-250px)]">
          {/* Mission Details - Left Side */}
          <Card className="overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>
                    {(mission.clientName || "")
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
                  <p className="font-medium">
                    {moment(mission.createdAt).format("DD/MM/YYYY")}
                  </p>
                  <p className="font-medium">
                    {moment(mission.createdAt).format("HH:mm")}
                  </p>
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
                  <MapPin className="h-4 w-4 mr-2" />
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
              <div>
                <h3 className="font-semibold mb-2">Photos</h3>
                {photos && photos.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Aucune photo disponible
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold mb-3">Suivi de la mission</h3>
                <div className="space-y-3">
                  {/* {mission?.timeline?.map((step, index: number) => (
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
                  )} */}
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

                {/* Validation Actions for Artisan */}
                {(mission.status === "in-progress" ||
                  mission.status === "client_validated") && (
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-700 font-medium mb-2">
                        {mission.status === "in-progress"
                          ? "Mission terminée ? Validation requise"
                          : "Le client a validé - Votre validation est maintenant requise"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600"
                        size="lg"
                        onClick={() => {
                          setValidationType("approve");
                          setShowValidationDialog(true);
                        }}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Valider
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        size="lg"
                        onClick={() => {
                          setValidationType("dispute");
                          setShowDisputeDialog(true);
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

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
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
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleMissionCompletion}
              disabled={
                isSubmittingCompletion || !issueType || !completionNotes.trim()
              }
              className={
                completionType === "impossible"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }
            >
              {isSubmittingCompletion ? "En cours..." : "Signaler le problème"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Success Dialog */}
      <Dialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              Valider la mission
            </DialogTitle>
            <DialogDescription>
              Confirmez que les travaux ont été réalisés de manière
              satisfaisante.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                ✓ Mission validée avec succès
              </p>
              <p className="text-xs text-green-600 mt-1">
                {selectedMission?.status === "client_validated"
                  ? "Les deux parties ont validé. La mission sera marquée comme terminée."
                  : "Le client sera notifié de votre validation."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowValidationDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={() =>
                selectedMission && handleValidateCompletion(selectedMission)
              }
              disabled={isSubmittingValidation}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmittingValidation
                ? "En cours..."
                : "Confirmer la validation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              Contester la mission
            </DialogTitle>
            <DialogDescription>
              Signalez un problème avec cette mission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Motif du litige *
              </label>
              <Select value={disputeReason} onValueChange={setDisputeReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le motif principal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client_no_show">Client absent</SelectItem>
                  <SelectItem value="payment_issue">
                    Problème de paiement
                  </SelectItem>
                  <SelectItem value="scope_disagreement">
                    Désaccord sur les travaux
                  </SelectItem>
                  <SelectItem value="safety_concern">
                    Problème de sécurité
                  </SelectItem>
                  <SelectItem value="client_behavior">
                    Comportement inapproprié du client
                  </SelectItem>
                  <SelectItem value="additional_work_requested">
                    Travaux supplémentaires demandés
                  </SelectItem>
                  <SelectItem value="access_denied">Accès refusé</SelectItem>
                  <SelectItem value="other">Autre problème</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Description détaillée *
              </label>
              <Textarea
                placeholder="Décrivez précisément le problème rencontré..."
                value={disputeDetails}
                onChange={(e) => setDisputeDetails(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700 font-medium">⚠️ Attention</p>
              <p className="text-xs text-amber-600 mt-1">
                Un litige sera ouvert et notre équipe examinera la situation. Le
                paiement sera suspendu en attendant la résolution.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisputeDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={() =>
                selectedMission && handleValidateCompletion(selectedMission)
              }
              disabled={
                isSubmittingValidation ||
                !disputeReason ||
                !disputeDetails.trim()
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmittingValidation ? "En cours..." : "Signaler le problème"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
