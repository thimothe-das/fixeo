"use client";

import { Badge } from "@/components/ui/badge";
import { Breadcrumb, createBreadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ServiceRequestStatus } from "@/lib/db/schema";
import { getStatusConfig, handleAcceptQuote, rejectQuote } from "@/lib/utils";
import {
  AlertCircle,
  Calculator,
  Camera,
  CheckCircle2,
  Clock as ClockIcon,
  FileText as DocumentIcon,
  Info,
  Phone,
  PlayCircle,
  Send,
  Star,
  User,
} from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import * as React from "react";
import useSWR from "swr";

type ServiceRequest = {
  id: number;
  title?: string;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  status: string;
  estimatedPrice?: number;
  createdAt: string;
  photos?: string;
  assignedArtisan?: {
    id: number;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
    specialty?: string;
    rating?: number;
    profilePicture?: string;
  };
  billingEstimates?: {
    id: number;
    estimatedPrice: number;
    status: "pending" | "accepted" | "rejected" | "expired";
    validUntil?: string;
    createdAt: string;
    description?: string;
    breakdown?: string; // JSON string of breakdown items
  }[];
  priority?: "high" | "normal" | "low";
  category?: string;
  timeline?: {
    created?: { date: string; actor?: string };
    quote?: { date: string; actor?: string };
    accepted?: { date: string; actor?: string };
    completed?: { date: string; actor?: string };
  };
};

type Message = {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderRole: "client" | "artisan" | "admin";
  timestamp: string;
  isRead: boolean;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper functions
const formatPrice: (cents: number) => string = (cents: number): string => {
  return `${(cents / 100).toFixed(2)} €`;
};

const formatDate = (
  dateString: string,
  format: "short" | "full" = "short"
): string => {
  const date = new Date(dateString);
  if (format === "short") {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
};

type StepKey = "created" | "quote" | "accepted" | "completed";

type StepMeta = {
  key: StepKey;
  label: string;
  reachedAt?: string;
  actor?: string;
};

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = parseInt(params.id as string);
  // Action states
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [showValidationDialog, setShowValidationDialog] = React.useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = React.useState(false);
  const [validationType, setValidationType] = React.useState<
    "approve" | "dispute"
  >("approve");
  const [disputeReason, setDisputeReason] = React.useState("");
  const [disputeDetails, setDisputeDetails] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const pathname = usePathname();
  const [isSubmittingValidation, setIsSubmittingValidation] =
    React.useState(false);
  // Fetch request data from API
  const {
    data: request,
    error,
    mutate,
  } = useSWR<ServiceRequest>(`/api/service-requests/${requestId}`, fetcher);

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

  if (!request) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Get configurations
  const getPriorityConfig = (priority: string = "normal") => {
    switch (priority) {
      case "high":
        return {
          color: "bg-rose-100 text-rose-800",
          label: "Urgent",
          dotColor: "bg-rose-500",
          topBarColor: "bg-rose-500",
        };
      case "low":
        return {
          color: "bg-slate-100 text-slate-600",
          label: "Faible",
          dotColor: "bg-slate-400",
          topBarColor: "bg-slate-400",
        };
      default:
        return {
          color: "bg-amber-100 text-amber-800",
          label: "Normal",
          dotColor: "bg-amber-500",
          topBarColor: "bg-amber-500",
        };
    }
  };

  // Prepare stepper data
  const getStepperData = (): { steps: StepMeta[]; current: StepKey } => {
    const steps: StepMeta[] = [
      {
        key: "created",
        label: "Créée",
        reachedAt: request.timeline?.created?.date || request.createdAt,
        actor: request.timeline?.created?.actor || "Client",
      },
      {
        key: "quote",
        label: "Devis",
        reachedAt: request.timeline?.quote?.date,
        actor: request.timeline?.quote?.actor,
      },
      {
        key: "accepted",
        label: "Acceptée",
        reachedAt: request.timeline?.accepted?.date,
        actor: request.timeline?.accepted?.actor,
      },
      {
        key: "completed",
        label: "Terminée",
        reachedAt: request.timeline?.completed?.date,
        actor: request.timeline?.completed?.actor,
      },
    ];

    let current: StepKey = "created";
    if (request.status === ServiceRequestStatus.COMPLETED)
      current = "completed";
    else if (
      request.status === ServiceRequestStatus.IN_PROGRESS ||
      request.status === ServiceRequestStatus.CLIENT_VALIDATED ||
      request.status === ServiceRequestStatus.ARTISAN_VALIDATED
    )
      current = "accepted";
    else if (
      request.status === ServiceRequestStatus.AWAITING_ESTIMATE ||
      request.status === ServiceRequestStatus.AWAITING_ASSIGNATION ||
      request.billingEstimates?.length
    )
      current = "quote";

    return { steps, current };
  };

  const { steps, current } = getStepperData();
  const photos = request.photos ? JSON.parse(request.photos) : [];
  const relevantEstimate = request.billingEstimates?.[0];

  // Parse breakdown data if available
  const parsedBreakdown = relevantEstimate?.breakdown
    ? (() => {
        try {
          return JSON.parse(relevantEstimate.breakdown);
        } catch (e) {
          console.error("Failed to parse breakdown:", e);
          return null;
        }
      })()
    : null;

  const priorityConfig = getPriorityConfig(request.priority);
  const statusConfig = getStatusConfig(request.status, "h-4 w-4");

  const handleValidateCompletion = async () => {
    setIsSubmittingValidation(true);
    try {
      const response = await fetch(
        `/api/service-requests/${request.id}/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        setShowValidationDialog(false);
        setShowDisputeDialog(false);
        // Refresh would happen here in real implementation
        resetValidationForm();
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

  const resetValidationForm = () => {
    setValidationType("approve");
    setDisputeReason("");
    setDisputeDetails("");
  };

  const handleRejectQuote = async () => {
    if (!relevantEstimate) return;
    setIsLoading(true);
    await rejectQuote(relevantEstimate.id, () => {
      setShowRejectDialog(false);
    });
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumb
        items={createBreadcrumbs.serviceRequest(
          request.title || `Demande #${request.id}`,
          request.id
        )}
      />

      <div className="px-4 py-4">
        <div className="">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Demande de Service
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Suivi de votre demande #{request.id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {relevantEstimate && (
                <>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                      <Calculator className="h-5 w-5 text-blue-500" />
                      {formatPrice(relevantEstimate.estimatedPrice)}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="text-white">
                            Prix estimé incluant main d'œuvre, matériaux et
                            déplacement
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                </>
              )}
              <Badge
                className={`items-center gap-2 rounded-full text-sm font-medium ${statusConfig.color} ${statusConfig.colors.bg} ${statusConfig.colors.text}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Request Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {request.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {request.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Catégorie
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">🔧</span>
                    <span className="text-gray-900 font-medium">
                      {request.serviceType}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Date de création
                  </h4>
                  <span className="text-gray-900">
                    {formatDate(request.createdAt)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Localisation
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">📍</span>
                  <span className="text-gray-900">{request.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Process Tracking */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Suivi du processus
            </h2>

            <div className="flex items-center justify-between">
              {/* Step 1 - Demande créée */}
              <div className="flex flex-col items-center relative">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white border-2 border-green-500">
                  <DocumentIcon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-900 mt-2">
                  Demande créée
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {formatDate(request.createdAt)}
                </span>
              </div>

              {/* Connection line */}
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>

              {/* Step 2 - En attente d'estimation */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    current === "quote" || request.billingEstimates?.length
                      ? "bg-orange-500 text-white border-orange-500"
                      : current === "created"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-200 text-gray-400 border-gray-200"
                  }`}
                >
                  <Calculator className="h-4 w-4" />
                </div>
                <span
                  className={`text-sm font-medium mt-2 ${
                    current === "quote" || current === "created"
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  En attente d'estimation
                </span>
                <span
                  className={`text-xs mt-1 ${
                    current === "quote" || current === "created"
                      ? "text-orange-600"
                      : "text-gray-400"
                  }`}
                >
                  {current === "quote" || current === "created"
                    ? "En cours"
                    : "—"}
                </span>
              </div>

              {/* Connection line */}
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>

              {/* Step 3 - En cours */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    current === "accepted"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-gray-200 text-gray-400 border-gray-200"
                  }`}
                >
                  <PlayCircle className="h-4 w-4" />
                </div>
                <span
                  className={`text-sm font-medium mt-2 ${
                    current === "accepted" ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  En cours
                </span>
                <span
                  className={`text-xs mt-1 ${
                    current === "accepted" ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {current === "accepted" && request.timeline?.accepted?.date
                    ? formatDate(request.timeline.accepted.date)
                    : "—"}
                </span>
              </div>

              {/* Connection line */}
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>

              {/* Step 4 - Terminé */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    current === "completed"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-gray-200 text-gray-400 border-gray-200"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span
                  className={`text-sm font-medium mt-2 ${
                    current === "completed" ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Terminé
                </span>
                <span
                  className={`text-xs mt-1 ${
                    current === "completed" ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {current === "completed" && request.timeline?.completed?.date
                    ? formatDate(request.timeline.completed.date)
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Photos du problème
            </h2>
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo: string, index: number) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden"
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune photo disponible
                </h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Aucune photo n'a été fournie pour cette demande de service.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Artisan Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {request.assignedArtisan?.name ? (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Artisan assigné
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  {request.assignedArtisan.profilePicture ? (
                    <img
                      src={request.assignedArtisan.profilePicture}
                      alt={
                        request.assignedArtisan.firstName &&
                        request.assignedArtisan.lastName
                          ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                          : request.assignedArtisan.name
                      }
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {request.assignedArtisan.firstName &&
                      request.assignedArtisan.lastName
                        ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                        : request.assignedArtisan.name}
                    </h3>

                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                      <span className="text-sm text-gray-600 ml-1">
                        {request.assignedArtisan.rating?.toFixed(1) || "4.9"}{" "}
                        (127 avis)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                  <Button variant="outline" className="w-full">
                    <span className="mr-2">✉️</span>
                    Email
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border-2 border-white">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Aucun artisan assigné
                </h3>
                <p className="text-sm text-gray-500">
                  En attente d'assignation
                </p>
              </div>
            )}
          </div>

          {/* Chat */}
          {request.assignedArtisan && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Chat avec{" "}
                  {request.assignedArtisan.firstName ||
                    request.assignedArtisan.name}
                </h2>
                <span className="text-sm text-green-600 font-medium">
                  En ligne
                </span>
              </div>

              <div className="space-y-4 mb-4">
                {/* Artisan message */}
                <div className="flex gap-3">
                  {request.assignedArtisan.profilePicture ? (
                    <img
                      src={request.assignedArtisan.profilePicture}
                      alt={
                        request.assignedArtisan.firstName ||
                        request.assignedArtisan.name
                      }
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-900">
                        Bonjour ! J'ai bien reçu votre demande. Je peux passer
                        demain matin pour faire un diagnostic.
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      Il y a 2h
                    </span>
                  </div>
                </div>

                {/* Client message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">
                      Parfait ! À quelle heure pouvez-vous venir ?
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">Il y a 1h</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Cost Estimation */}

      {relevantEstimate && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Estimation des coûts
          </h2>
          <div className="space-y-4">
            {/* Cost breakdown */}
            <div className="space-y-3">
              {parsedBreakdown ? (
                parsedBreakdown.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-700">
                      {item.description}
                      {item.quantity && item.quantity > 1 && (
                        <span className="text-sm text-gray-500 ml-1">
                          (x{item.quantity})
                        </span>
                      )}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(item.total)}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Main d'œuvre</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(
                        Math.round(relevantEstimate.estimatedPrice * 0.52)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Matériaux</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(
                        Math.round(relevantEstimate.estimatedPrice * 0.37)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Déplacement</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(
                        Math.round(relevantEstimate.estimatedPrice * 0.11)
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total estimé
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(relevantEstimate.estimatedPrice)}
                </span>
              </div>
            </div>

            {/* Action buttons for estimate */}
            {relevantEstimate.status === "pending" && (
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() =>
                    handleAcceptQuote(
                      request.id,
                      pathname,
                      relevantEstimate.estimatedPrice
                    )
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Accepter le devis
                </Button>
                <Button
                  onClick={handleRejectQuote}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  Refuser
                </Button>
              </div>
            )}

            {relevantEstimate.status === "accepted" && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Devis accepté le {formatDate(relevantEstimate.createdAt)}
                </span>
              </div>
            )}

            {relevantEstimate.status === "rejected" && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700 font-medium">
                  Devis refusé
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
