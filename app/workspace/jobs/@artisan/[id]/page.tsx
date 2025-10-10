"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageSenderType, ServiceRequestStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  disputeFormSchema,
  type DisputeFormType,
} from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  FileCheck,
  FileText,
  Hourglass,
  MapPin,
  Megaphone,
  MessageSquare,
  Phone,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  UserCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { ServiceRequestForArtisan } from "../../../components/types";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Job() {
  const [filterStatus, setFilterStatus] = useState("all");
  const params = useParams();
  const requestId = parseInt(params.id as string);
  const [missionsSortBy, setMissionsSortBy] = useState("date");
  const [selectedMission, setSelectedMission] =
    useState<ServiceRequestForArtisan | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const [showQuickActions, setShowQuickActions] = useState(true);

  const isMobile = useIsMobile();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [activeTab, setActiveTab] = useState<"mission" | "chat">("mission");

  const [unreadMessageCount, setUnreadMessageCount] = useState(3); // Fake data for now
  const [hasViewedChat, setHasViewedChat] = useState(false);

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
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);
  const router = useRouter();

  // Dispute form with react-hook-form
  const disputeForm = useForm<DisputeFormType>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      disputeReason: "",
      disputeDetails: "",
      photos: [],
    },
  });

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

  const photos = mission?.photos ? JSON.parse(mission.photos) : [];

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
          selectedMission.status = ServiceRequestStatus.IN_PROGRESS;
        } else if (completionType === "validate") {
          selectedMission.status =
            selectedMission.status === ServiceRequestStatus.CLIENT_VALIDATED
              ? ServiceRequestStatus.COMPLETED
              : ServiceRequestStatus.ARTISAN_VALIDATED;
        } else if (completionType === "dispute") {
          selectedMission.status = ServiceRequestStatus.DISPUTED_BY_ARTISAN;
        } else if (completionType === "issue") {
          selectedMission.status = ServiceRequestStatus.RESOLVED;
        } else if (completionType === "impossible") {
          selectedMission.status = ServiceRequestStatus.CANCELLED;
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
        mission.status = ServiceRequestStatus.IN_PROGRESS;
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
        sender: MessageSenderType.PROFESSIONAL,
        message: chatMessage,
        createdAt: new Date().toISOString(),
      };

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
    disputeForm.reset();
  };

  const handleValidateCompletion = async (
    mission: ServiceRequestForArtisan
  ) => {
    // Validate form if disputing
    if (validationType === "dispute") {
      const isValid = await disputeForm.trigger();
      if (!isValid) {
        return;
      }
    }

    setIsSubmittingValidation(true);
    try {
      const formData = disputeForm.getValues();
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
              validationType === "dispute" ? formData.disputeReason : undefined,
            disputeDetails:
              validationType === "dispute"
                ? formData.disputeDetails
                : undefined,
          }),
        }
      );

      if (response.ok) {
        if (validationType === "approve") {
          mission.status =
            mission.status === ServiceRequestStatus.CLIENT_VALIDATED
              ? ServiceRequestStatus.COMPLETED
              : ServiceRequestStatus.ARTISAN_VALIDATED;
        } else if (validationType === "dispute") {
          mission.status = ServiceRequestStatus.DISPUTED_BY_ARTISAN;
        }

        setShowValidationDialog(false);
        setShowDisputeDialog(false);
        resetValidationForm();
        mutate(); // Refresh SWR data
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

  const handleCallClient = () => {
    if (mission.clientPhone) {
      window.location.href = `tel:${mission.clientPhone}`;
    } else {
      alert("Numéro de téléphone non disponible");
    }
  };

  const getPrimaryAction = () => {
    switch (mission.status) {
      case ServiceRequestStatus.AWAITING_ASSIGNATION:
        return {
          label: "Commencer la mission",
          icon: <Clock className="h-5 w-5" />,
          onClick: () => handleStartMission(mission),
          className: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case ServiceRequestStatus.IN_PROGRESS:
        return {
          label: "Valider la mission",
          icon: <ThumbsUp className="h-5 w-5" />,
          onClick: () => {
            setSelectedMission(mission);
            setValidationType("approve");
            setShowValidationDialog(true);
          },
          className: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      case ServiceRequestStatus.CLIENT_VALIDATED:
        return {
          label: "Confirmer validation",
          icon: <CheckCircle className="h-5 w-5" />,
          onClick: () => {
            setSelectedMission(mission);
            setValidationType("approve");
            setShowValidationDialog(true);
          },
          className: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      default:
        return null;
    }
  };

  const getTimelineSteps = () => {
    const statusHistory = mission.statusHistory;

    // Helper to format date from statusHistory or return undefined
    const getDateForStatus = (status: string) => {
      if (statusHistory && statusHistory[status]) {
        return moment(statusHistory[status]).format("DD/MM/YYYY à HH:mm");
      }
      return undefined;
    };

    const steps = [
      {
        step: "Mission disponible",
        completed: true, // Always true when viewing
        date:
          getDateForStatus("awaiting_assignation") ||
          moment(mission.createdAt).format("DD/MM/YYYY à HH:mm"),
        icon: <FileCheck className="h-4 w-4" />,
      },
      {
        step: "Mission acceptée",
        completed: mission.status !== ServiceRequestStatus.AWAITING_ASSIGNATION,
        date: getDateForStatus("in_progress"),
        icon: <UserCheck className="h-4 w-4" />,
      },
      {
        step: "Intervention en cours",
        completed: [
          ServiceRequestStatus.IN_PROGRESS,
          ServiceRequestStatus.CLIENT_VALIDATED,
          ServiceRequestStatus.ARTISAN_VALIDATED,
          ServiceRequestStatus.AWAITING_PAYMENT,
          ServiceRequestStatus.COMPLETED,
        ].includes(mission.status as ServiceRequestStatus),
        date: getDateForStatus("in_progress"),
        icon: <Wrench className="h-4 w-4" />,
      },
      {
        step: "Validation des travaux",
        completed: [
          ServiceRequestStatus.CLIENT_VALIDATED,
          ServiceRequestStatus.ARTISAN_VALIDATED,
          ServiceRequestStatus.AWAITING_PAYMENT,
          ServiceRequestStatus.COMPLETED,
        ].includes(mission.status as ServiceRequestStatus),
        date:
          getDateForStatus("client_validated") ||
          getDateForStatus("artisan_validated"),
        icon: <ThumbsUp className="h-4 w-4" />,
      },
      {
        step: "Paiement",
        completed: [
          ServiceRequestStatus.AWAITING_PAYMENT,
          ServiceRequestStatus.COMPLETED,
        ].includes(mission.status as ServiceRequestStatus),
        date: getDateForStatus("awaiting_payment"),
        icon: <CreditCard className="h-4 w-4" />,
      },
      {
        step: "Mission terminée",
        completed: mission.status === ServiceRequestStatus.COMPLETED,
        date: getDateForStatus("completed"),
        icon: <Trophy className="h-4 w-4" />,
      },
    ];

    return steps;
  };

  const openPhotoLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    if (selectedPhotoIndex === null || !photos) return;

    if (direction === "prev") {
      setSelectedPhotoIndex(
        selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1
      );
    } else {
      setSelectedPhotoIndex(
        selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0
      );
    }
  };

  const handleTabSwitch = (tab: "mission" | "chat") => {
    setActiveTab(tab);
    if (tab === "chat") {
      setHasViewedChat(true);
      setUnreadMessageCount(0);
    }
  };

  const simulateNewMessage = () => {
    if (activeTab !== "chat") {
      setUnreadMessageCount((prev) => prev + 1);
    }
  };

  const getActionBanner = () => {
    switch (mission.status) {
      case ServiceRequestStatus.IN_PROGRESS:
        return {
          type: "warning",
          title: "Une action est requise",
          message:
            "Mission terminée ? Validation requise pour finaliser le paiement",
          buttons: (
            <>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs bg-red-600 text-white hover:bg-red-700 border-red-600"
                onClick={() => {
                  setSelectedMission(mission);
                  setValidationType("dispute");
                  setShowDisputeDialog(true);
                }}
              >
                Contester
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => {
                  setSelectedMission(mission);
                  setValidationType("approve");
                  setShowValidationDialog(true);
                }}
              >
                Valider la mission
              </Button>
            </>
          ),
        };
      case ServiceRequestStatus.CLIENT_VALIDATED:
        return {
          type: "info",
          title: "Une action est requise",
          message:
            "Le client a confirmé la mission. Votre validation est maintenant requise",
          buttons: (
            <>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs bg-red-600 text-white hover:bg-red-700 border-red-600"
                onClick={() => {
                  setSelectedMission(mission);
                  setValidationType("dispute");
                  setShowDisputeDialog(true);
                }}
              >
                Contester
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => {
                  setSelectedMission(mission);
                  setValidationType("approve");
                  setShowValidationDialog(true);
                }}
              >
                Confirmer validation
              </Button>
            </>
          ),
        };
      case ServiceRequestStatus.AWAITING_ASSIGNATION:
        return {
          type: "info",
          title: "Une action est requise",
          message:
            "Mission planifiée - prêt à commencer quand vous le souhaitez",
          buttons: (
            <Button
              size="sm"
              className="h-8 text-xs bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => handleStartMission(mission)}
            >
              Commencer la mission
            </Button>
          ),
        };
      default:
        return null;
    }
  };

  const actionBanner = getActionBanner();

  return (
    <>
      {actionBanner && (
        <div className="border-t py-3 fixed bottom-0 left-64 right-0 z-50 shadow-lg mx-6 bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-200">
          <div className="flex items-center px-6 gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                {actionBanner.title} - {actionBanner.message}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {actionBanner.buttons}
            </div>
          </div>
        </div>
      )}

      <div
        className={`space-y-6 ${isMobile ? "p-4" : ""} bg-gray-50 min-h-screen`}
      >
        {/* Modern SaaS Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                  {(mission.clientName || "")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {mission.title || `Mission ${mission.serviceType}`}
                </h1>
                <p className="text-sm text-gray-500">
                  {mission.clientName || "Nom du client non disponible"} •{" "}
                  {moment(mission.createdAt).format("DD/MM/YYYY")}
                </p>
              </div>
              <div className="flex gap-2 mb-2 ml-4">
                <Button
                  size="lg"
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 p-0 min-h-[48px] min-w-[48px] touch-manipulation"
                  onClick={handleCallClient}
                  disabled={!mission.clientPhone}
                >
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center  gap-3">
              {/* Quick Actions */}

              {/* Primary Action */}
              {getPrimaryAction() && (
                <Button
                  size="sm"
                  className={`flex items-center gap-2 ${
                    getPrimaryAction()?.className
                  }`}
                  onClick={getPrimaryAction()?.onClick}
                >
                  {getPrimaryAction()?.icon}
                  {getPrimaryAction()?.label}
                </Button>
              )}

              {/* Validation Actions for In-Progress */}
              {(mission.status === ServiceRequestStatus.IN_PROGRESS ||
                mission.status === ServiceRequestStatus.CLIENT_VALIDATED) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setSelectedMission(mission);
                    setValidationType("dispute");
                    setShowDisputeDialog(true);
                  }}
                >
                  <AlertTriangle className="h-3 w-3" />
                  Contester
                </Button>
              )}

              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              {/* Clickable Price - Opens Devis */}
              <button
                className="text-right hover:bg-blue-50 rounded-lg p-2 transition-colors group cursor-pointer"
                onClick={() =>
                  router.push(
                    `/workspace/devis/${
                      (mission as any).billingEstimates[0].id
                    }`
                  )
                }
                title="Cliquer pour voir le devis détaillé"
              >
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {mission.estimatedPrice
                        ? (mission.estimatedPrice / 100).toFixed(2)
                        : "60"}
                      €
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Voir devis
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm ">
          <div className="relative">
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => handleTabSwitch("mission")}
                className={`px-6 py-4 font-medium text-sm transition-all duration-200 relative ${
                  activeTab === "mission"
                    ? "bg-white text-blue-600 border-t-4 border-t-blue-500 border-r border-l border-gray-200 -mb-px z-10"
                    : "bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200  mr-1 border-t border-l border-r border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  <span>Détails de la mission</span>
                </div>
              </button>

              <button
                onClick={() => handleTabSwitch("chat")}
                className={`px-6 py-4 font-medium text-sm transition-all duration-200 relative ${
                  activeTab === "chat"
                    ? "bg-white text-blue-600 border-t-4 border-t-blue-500 border-r border-l border-gray-200 -mb-px z-10"
                    : "bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 border-t border-l border-r border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    Chat avec{" "}
                    {mission.clientName || "Nom du client non disponible"}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {/* Unread Message Notification Badge */}
                  {unreadMessageCount > 0 && activeTab !== "chat" && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white">
                      {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-white">
            {activeTab === "mission" ? (
              /* Mission Details Tab */
              <div className="space-y-8">
                {/* Main Content with Key Info on Left and Progression on Right */}
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Left Side - Key Info + Mission Details */}
                  <div className="lg:col-span-3 space-y-8">
                    {/* Simplified Key Information */}

                    {/* Location with Google Maps */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        Localisation
                      </h3>

                      {/* Address */}
                      <p className="text-gray-700 mb-3 text-sm">
                        {mission.location}
                      </p>

                      {/* Google Maps Embed */}
                      <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <iframe
                          src={`https://www.google.com/maps?q=${encodeURIComponent(
                            mission.location || ""
                          )}&output=embed`}
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Description
                      </h3>
                      {mission.description ? (
                        <p className="text-gray-500 leading-relaxed">
                          {mission.description}
                        </p>
                      ) : (
                        <p className="text-gray-400 italic leading-relaxed">
                          Aucune description fournie
                        </p>
                      )}
                      {mission.notes && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-amber-800 text-sm">
                                Notes importantes
                              </p>
                              <p className="text-sm text-amber-700 mt-1">
                                {mission.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Photos */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Camera className="h-4 w-4 text-gray-600" />
                        Photos ({photos?.length || 0})
                      </h3>
                      {photos && photos.length > 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                          {photos.map((photo: string, index: number) => (
                            <div
                              key={index}
                              className="group relative aspect-square"
                            >
                              <img
                                src={photo || "/placeholder.svg"}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg border border-gray-200 cursor-pointer transition-all group-hover:scale-105"
                                onClick={() => openPhotoLightbox(index)}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                                <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Aucune photo disponible</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Progression Timeline (Sticky) */}
                  <div className="lg:col-span-1 flex justify-end">
                    <div className="sticky top-4 bg-white  p-5 ">
                      <div className="space-y-4">
                        {getTimelineSteps().map((step, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  step.completed
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "bg-gray-100 border-gray-300 text-gray-400"
                                }`}
                              >
                                {step.icon}
                              </div>
                              {index < getTimelineSteps().length - 1 && (
                                <div
                                  className={`w-0.5 h-8 mt-2 ${
                                    step.completed
                                      ? "bg-emerald-500"
                                      : "bg-gray-200"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pb-4">
                              <p
                                className={`text-sm font-medium ${
                                  step.completed
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                {step.step}
                              </p>
                              {step.date && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {step.date}
                                </p>
                              )}
                              {/* Show waiting indicators */}
                              {index === 1 &&
                                mission.status ===
                                  ServiceRequestStatus.AWAITING_ASSIGNATION && (
                                  <div className="mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-2">
                                    <Hourglass className="h-4 w-4" />
                                    <span>En attente de votre acceptation</span>
                                  </div>
                                )}
                              {index === 3 &&
                                mission.status ===
                                  ServiceRequestStatus.IN_PROGRESS && (
                                  <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-2">
                                    <Hourglass className="h-4 w-4" />
                                    <span>En attente de votre validation</span>
                                  </div>
                                )}
                              {index === 3 &&
                                mission.status ===
                                  ServiceRequestStatus.CLIENT_VALIDATED && (
                                  <div className="mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-2">
                                    <Hourglass className="h-4 w-4" />
                                    <span>
                                      En attente de votre confirmation
                                    </span>
                                  </div>
                                )}
                              {index === 3 &&
                                mission.status ===
                                  ServiceRequestStatus.ARTISAN_VALIDATED && (
                                  <div className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full flex items-center gap-2">
                                    <Hourglass className="h-4 w-4" />
                                    <span>En attente de validation client</span>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Tab */
              <div className="h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-gray-100 text-gray-700">
                        {(mission.clientName || "")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {mission.clientName || "Nom du client non disponible"}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">En ligne</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    {mission.messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === MessageSenderType.PROFESSIONAL
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                            message.sender === MessageSenderType.PROFESSIONAL
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-900 border shadow-sm"
                          }`}
                        >
                          <p>{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === MessageSenderType.PROFESSIONAL
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
                      <div className="text-center text-gray-500 py-12">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>Aucun message pour le moment</p>
                        <p className="text-sm mt-1">
                          Commencez la conversation avec{" "}
                          {mission.clientName || "Nom du client non disponible"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Input */}
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
            )}
          </div>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhotoIndex !== null && photos && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={photos[selectedPhotoIndex] || "/placeholder.svg"}
              alt={`Photo ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            <Button
              onClick={closePhotoLightbox}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              size="sm"
            >
              <XCircle className="h-6 w-6" />
            </Button>

            {photos.length > 1 && (
              <>
                <Button
                  onClick={() => navigatePhoto("prev")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                  size="sm"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button
                  onClick={() => navigatePhoto("next")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                  size="sm"
                >
                  <ArrowLeft className="h-6 w-6 rotate-180" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}

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
              className="bg-green-600 hover:bg-green-700 text-white"
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
              className={cn(
                "bg-orange-600 hover:bg-orange-700 text-white",
                completionType === "impossible" && "bg-red-600 hover:bg-red-700"
              )}
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
                {selectedMission?.status ===
                ServiceRequestStatus.CLIENT_VALIDATED
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
              className="bg-green-600 hover:bg-green-700 text-white"
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

          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Motif du litige *
              </label>
              <Select
                value={disputeForm.watch("disputeReason")}
                onValueChange={(value) =>
                  disputeForm.setValue("disputeReason", value)
                }
              >
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
              {disputeForm.formState.errors.disputeReason && (
                <p className="text-sm text-red-600 mt-1">
                  {disputeForm.formState.errors.disputeReason.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Description détaillée *
              </label>
              <Textarea
                placeholder="Décrivez précisément le problème rencontré..."
                {...disputeForm.register("disputeDetails")}
                rows={4}
              />
              {disputeForm.formState.errors.disputeDetails && (
                <p className="text-sm text-red-600 mt-1">
                  {disputeForm.formState.errors.disputeDetails.message}
                </p>
              )}
            </div>

            {/* Photo upload placeholder - ready for future implementation */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Photos justificatives (optionnel)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Ajoutez des photos du problème (bientôt disponible)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700 font-medium">⚠️ Attention</p>
              <p className="text-xs text-amber-600 mt-1">
                Un litige sera ouvert et notre équipe examinera la situation. Le
                paiement sera suspendu en attendant la résolution.
              </p>
            </div>
          </form>

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
                !disputeForm.watch("disputeReason") ||
                !disputeForm.watch("disputeDetails")?.trim()
              }
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmittingValidation ? "En cours..." : "Signaler le problème"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
