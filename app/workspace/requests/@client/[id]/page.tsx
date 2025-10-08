"use client";

import { Breadcrumb, createBreadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ServiceRequestStatus } from "@/lib/db/schema";
import {
  getCategoryConfig,
  getPriorityConfig,
  getStatusConfig,
} from "@/lib/utils";
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock as ClockIcon,
  FileText,
  Info,
  MapPin,
  PlayCircle,
  Plus,
  Star,
  User,
  X,
} from "lucide-react";
import moment from "moment";
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
  const [photoModalOpen, setPhotoModalOpen] = React.useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
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

  const categoryConfig = getCategoryConfig(request.serviceType, "h-4 w-4");
  const urgencyConfig = getPriorityConfig(request?.urgency, "h-4 w-4");

  // Helper function to get step icon
  const getStepIcon = (stepKey: StepKey, completed: boolean) => {
    const iconProps = {
      className: `h-2.5 w-2.5 ${completed ? "text-white" : "text-gray-400"}`,
    };

    switch (stepKey) {
      case "created":
        return <Plus {...iconProps} />;
      case "quote":
        return <Calculator {...iconProps} />;
      case "accepted":
        return <PlayCircle {...iconProps} />;
      case "completed":
        return <CheckCircle2 {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  // Helper function to determine if step is completed
  const isStepCompleted = (stepKey: StepKey, currentStep: StepKey) => {
    const stepOrder = { created: 0, quote: 1, accepted: 2, completed: 3 };
    return stepOrder[stepKey] <= stepOrder[currentStep];
  };

  // Helper function to determine if step is current
  const isCurrentStep = (stepKey: StepKey, currentStep: StepKey) => {
    return stepKey === currentStep;
  };

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto">
        <Breadcrumb
          items={createBreadcrumbs.serviceRequest(
            request.title || `Demande #${request.id}`,
            request.id
          )}
        />

        <div>
          <div className="bg-white r p-4 mt-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {request.title}
                </h1>
                <div className="flex items-center gap-3 items-center mt-1">
                  {request.urgency && (
                    <>
                      <span className="text-xs font-medium flex items-center gap-1 text-gray-600">
                        {categoryConfig.icon}
                        {categoryConfig.type}
                      </span>
                      <span className="text-gray-400">•</span>
                    </>
                  )}
                  <p className="text-xs flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span>
                      Créée {moment(request.createdAt).locale("fr").fromNow()}
                    </span>
                  </p>
                  <span className="text-gray-400">•</span>
                  <p className="text-xs flex items-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span>{request.location}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {relevantEstimate && (
                  <>
                    {/* Clickable Price - Opens Devis */}
                    <button
                      className="text-right hover:bg-blue-50 rounded-lg p-2 transition-colors group cursor-pointer"
                      onClick={() =>
                        router.push(`/workspace/devis/${relevantEstimate.id}`)
                      }
                      title="Cliquer pour voir le devis détaillé"
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                            <Calculator className="h-5 w-5 text-blue-500" />
                            {formatPrice(relevantEstimate.estimatedPrice)}
                          </div>
                          <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Voir devis
                          </p>
                        </div>
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
                    </button>
                    <div className="h-8 w-px bg-gray-300"></div>
                  </>
                )}

                {/* Compact Artisan Card */}
                {request.assignedArtisan?.name ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {request.assignedArtisan.profilePicture ? (
                      <img
                        src={request.assignedArtisan.profilePicture}
                        alt={
                          request.assignedArtisan.firstName &&
                          request.assignedArtisan.lastName
                            ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                            : request.assignedArtisan.name
                        }
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-green-800 leading-tight">
                        {request.assignedArtisan.firstName &&
                        request.assignedArtisan.lastName
                          ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                          : request.assignedArtisan.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-green-600">
                          {request.assignedArtisan.rating?.toFixed(1) || "4.9"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-gray-200">
                        <ClockIcon className="h-2.5 w-2.5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 leading-tight">
                        Aucun artisan assigné
                      </span>
                      <span className="text-xs text-gray-500">
                        En attente d'assignation
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-18 mt-3 bg-white rounded-lg border border-gray-200 p-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Request Details */}
            <div className="pt-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 text-gray-900 mr-2" />
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {request.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo: string, index: number) => (
                    <div
                      key={index}
                      className={`w-24 h-24 rounded-lg overflow-hidden border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform ${
                        index > 0 ? "-ml-4" : ""
                      }`}
                      style={{ zIndex: photos.length - index }}
                      onClick={() => {
                        setCurrentPhotoIndex(index);
                        setPhotoModalOpen(true);
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Progression
                </h2>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => {
                  const completed = isStepCompleted(step.key, current);
                  const isCurrent = isCurrentStep(step.key, current);

                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                completed
                                  ? isCurrent
                                    ? "bg-blue-500 border-blue-500 ring-2 ring-blue-200 shadow-sm"
                                    : "bg-green-500 border-green-500"
                                  : "bg-gray-200 border-gray-300"
                              }`}
                            >
                              {getStepIcon(step.key, completed)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-white">
                              {step.label} -{" "}
                              {completed ? "Terminé" : "En attente"}
                              {step.reachedAt && (
                                <span className="block text-xs opacity-75 mt-1">
                                  {formatDate(step.reachedAt)}
                                </span>
                              )}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        {index < steps.length - 1 && (
                          <div
                            className={`w-0.5 h-8 mt-1 transition-colors ${
                              completed ? "bg-green-500" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-medium ${
                              isCurrent
                                ? "text-blue-700"
                                : completed
                                ? "text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {step.label}
                            {isCurrent && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Actuel
                              </span>
                            )}
                          </p>
                        </div>
                        {step.reachedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(step.reachedAt, "full")}
                          </p>
                        )}
                        {step.actor && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Par {step.actor}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Modal */}
        <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>
                Photos de la requête ({currentPhotoIndex + 1}/{photos.length})
              </DialogTitle>
            </DialogHeader>
            <div className="relative">
              {photos.length > 0 && (
                <div className="flex items-center justify-center p-6">
                  <img
                    src={photos[currentPhotoIndex]}
                    alt={`Photo ${currentPhotoIndex + 1}`}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
              )}

              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={() =>
                      setCurrentPhotoIndex((prev) =>
                        prev === 0 ? photos.length - 1 : prev - 1
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={() =>
                      setCurrentPhotoIndex((prev) =>
                        prev === photos.length - 1 ? 0 : prev + 1
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white"
                onClick={() => setPhotoModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Photo thumbnails */}
            {photos.length > 1 && (
              <div className="px-6 pb-6">
                <div className="flex gap-2 justify-center">
                  {photos.map((photo: string, index: number) => (
                    <button
                      key={index}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        index === currentPhotoIndex
                          ? "border-blue-500"
                          : "border-gray-200"
                      }`}
                      onClick={() => setCurrentPhotoIndex(index)}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
