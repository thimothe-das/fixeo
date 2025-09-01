import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  CalendarDays,
  MapPin,
  Eye,
  Calculator,
  ExternalLink,
  ZoomIn,
  X,
  Wrench,
  Zap,
  Droplets,
  Hammer,
  PaintBucket,
  Home,
  Car,
  Laptop,
  Wifi,
  Shield,
  Settings,
  CircleDot,
  Navigation,
  Star,
  User,
  Copy,
  Phone,
  ChevronDown,
  MoreVertical,
  Plus,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  LucideWrench,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  FileText,
} from "lucide-react";
import moment from "moment";
import { ServiceRequestStatus } from "@/lib/db/schema";

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

interface ClientRequestsListComponentProps {
  requests: ServiceRequest[];
  onViewEstimate?: (estimateId: number) => void;
  onRequestUpdate?: () => void;
}

// Helper functions
const formatPrice = (cents: number): string => {
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

interface StepperProps {
  steps: StepMeta[];
  current: StepKey;
}

function Stepper({ steps, current }: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.key === current);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200"></div>

        {/* Progress line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all duration-500"
          style={{
            width:
              currentIndex > 0
                ? `${(currentIndex / (steps.length - 1)) * 100}%`
                : "0%",
          }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <TooltipProvider key={step.key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center relative z-10 bg-white">
                    {/* Step circle */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-blue-600 border-blue-600 text-white"
                          : isCurrent
                          ? "bg-white border-blue-600 text-blue-600 ring-2 ring-blue-200 ring-offset-2"
                          : "bg-white border-slate-300 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      ) : (
                        <CircleDot className="h-4 w-4" />
                      )}
                    </div>

                    {/* Step label */}
                    <span
                      className={`text-xs font-medium mt-2 transition-colors duration-300 ${
                        isCompleted || isCurrent
                          ? "text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>

                    {/* Date if reached */}
                    <span className="text-xs text-slate-500 mt-1">
                      {step.reachedAt ? formatDate(step.reachedAt) : "—"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {step.label} •{" "}
                    {step.reachedAt ? formatDate(step.reachedAt, "full") : "—"}{" "}
                    • {step.actor || ""}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}

interface PhotosStripProps {
  photos: string[];
  maxDisplay?: number;
}

function PhotosStrip({ photos, maxDisplay = 3 }: PhotosStripProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  if (photos.length === 0) {
    return (
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500">
        <ImageIcon className="h-6 w-6 mb-2" />
        <span className="text-xs font-medium">Ajouter des photos</span>
      </div>
    );
  }

  const displayedPhotos = photos.slice(0, maxDisplay);
  const remainingCount = photos.length - maxDisplay;

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentImageIndex((prev) =>
        prev === 0 ? photos.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") navigateLightbox("prev");
    if (event.key === "ArrowRight") navigateLightbox("next");
    if (event.key === "Escape") setLightboxOpen(false);
  };

  return (
    <>
      <div className="flex gap-2">
        {displayedPhotos.map((photo, index) => (
          <div key={index} className="relative">
            <button
              onClick={() => openLightbox(index)}
              className="relative w-12 h-12 rounded-lg overflow-hidden group hover:ring-2 hover:ring-blue-300 transition-all"
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {index === maxDisplay - 1 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      <AlertDialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <AlertDialogContent className="max-w-4xl p-0" onKeyDown={handleKeyDown}>
          <div className="relative">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox("prev")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigateLightbox("next")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="flex items-center justify-center min-h-[60vh] p-4">
              <img
                src={photos[currentImageIndex]}
                alt={`Photo ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white"
                        : "bg-white bg-opacity-50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RequestCard({
  request,
  onRequestUpdate,
  priorityStyle = "dot", // "dot" or "topBar"
}: {
  request: ServiceRequest;
  onRequestUpdate?: () => void;
  priorityStyle?: "dot" | "topBar";
}) {
  const router = useRouter();
  const [descriptionExpanded, setDescriptionExpanded] = React.useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Validation states
  const [showValidationDialog, setShowValidationDialog] = React.useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = React.useState(false);
  const [validationType, setValidationType] = React.useState<
    "approve" | "dispute"
  >("approve");
  const [isSubmittingValidation, setIsSubmittingValidation] =
    React.useState(false);

  // Get priority color and label
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

  // Get status configuration with stepper-aligned colors
  const getStatusConfig = (status: string) => {
    switch (status) {
      case ServiceRequestStatus.AWAITING_ESTIMATE:
        return {
          color: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
          label: "En attente de devis",
        };
      case ServiceRequestStatus.AWAITING_ASSIGNATION:
        return {
          color: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200",
          label: "En attente d'assignation",
        };
      case ServiceRequestStatus.IN_PROGRESS:
        return {
          color: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
          label: "En cours",
        };
      case ServiceRequestStatus.CLIENT_VALIDATED:
        return {
          color: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
          label: "Client validé",
        };
      case ServiceRequestStatus.ARTISAN_VALIDATED:
        return {
          color: "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200",
          label: "Artisan validé",
        };
      case ServiceRequestStatus.COMPLETED:
        return {
          color: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
          label: "Terminée",
        };
      case ServiceRequestStatus.DISPUTED_BY_CLIENT:
        return {
          color: "bg-red-100 text-red-700 ring-1 ring-red-200",
          label: "Litige client",
        };
      case ServiceRequestStatus.DISPUTED_BY_ARTISAN:
        return {
          color: "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
          label: "Litige artisan",
        };
      case ServiceRequestStatus.DISPUTED_BY_BOTH:
        return {
          color: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
          label: "Litige des deux parties",
        };
      case ServiceRequestStatus.RESOLVED:
        return {
          color: "bg-green-100 text-green-700 ring-1 ring-green-200",
          label: "Litige résolu",
        };
      case ServiceRequestStatus.CANCELLED:
        return {
          color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
          label: "Annulée",
        };

      default:
        return {
          color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
          label: status,
        };
    }
  };

  // Category color and icon mapping
  const categoryColorMap = {
    plumbing: {
      color: "blue",
      bg: "bg-blue-50",
      text: "text-blue-700",
      ring: "ring-blue-200",
      accent: "border-blue-500",
    },
    electricity: {
      color: "amber",
      bg: "bg-amber-50",
      text: "text-amber-700",
      ring: "ring-amber-200",
      accent: "border-amber-500",
    },
    painting: {
      color: "violet",
      bg: "bg-violet-50",
      text: "text-violet-700",
      ring: "ring-violet-200",
      accent: "border-violet-500",
    },
    carpentry: {
      color: "stone",
      bg: "bg-stone-50",
      text: "text-stone-700",
      ring: "ring-stone-200",
      accent: "border-stone-500",
    },
    tiling: {
      color: "teal",
      bg: "bg-teal-50",
      text: "text-teal-700",
      ring: "ring-teal-200",
      accent: "border-teal-500",
    },
    emergency: {
      color: "rose",
      bg: "bg-rose-50",
      text: "text-rose-700",
      ring: "ring-rose-200",
      accent: "border-rose-500",
    },
    default: {
      color: "slate",
      bg: "bg-slate-50",
      text: "text-slate-700",
      ring: "ring-slate-200",
      accent: "border-slate-500",
    },
  };

  const iconMap = {
    plumbing: <LucideWrench className="h-6 w-6" />,
    electricity: <Zap className="h-6 w-6" />,
    painting: <PaintBucket className="h-6 w-6" />,
    carpentry: <Hammer className="h-6 w-6" />,
    tiling: <Settings className="h-6 w-6" />,
    emergency: <AlertCircle className="h-6 w-6" />,
    security: <Shield className="h-6 w-6" />,
    automotive: <Car className="h-6 w-6" />,
    computer: <Laptop className="h-6 w-6" />,
    network: <Wifi className="h-6 w-6" />,
    home: <Home className="h-6 w-6" />,
    default: <Wrench className="h-6 w-6" />,
  };

  // Get category type and styling
  const getCategoryConfig = (serviceType: string) => {
    const type = serviceType.toLowerCase();

    if (
      type.includes("plomberie") ||
      type.includes("plombier") ||
      type.includes("fuite") ||
      type.includes("eau")
    ) {
      return {
        type: "plumbing",
        icon: iconMap.plumbing,
        colors: categoryColorMap.plumbing,
      };
    } else if (
      type.includes("électricité") ||
      type.includes("électricien") ||
      type.includes("électrique") ||
      type.includes("electricite")
    ) {
      return {
        type: "electricity",
        icon: iconMap.electricity,
        colors: categoryColorMap.electricity,
      };
    } else if (
      type.includes("peinture") ||
      type.includes("peintre") ||
      type.includes("peindre")
    ) {
      return {
        type: "painting",
        icon: iconMap.painting,
        colors: categoryColorMap.painting,
      };
    } else if (
      type.includes("maçonnerie") ||
      type.includes("maçon") ||
      type.includes("construction") ||
      type.includes("mur")
    ) {
      return {
        type: "carpentry",
        icon: iconMap.carpentry,
        colors: categoryColorMap.carpentry,
      };
    } else if (
      type.includes("carrelage") ||
      type.includes("carreleur") ||
      type.includes("tuile")
    ) {
      return {
        type: "tiling",
        icon: iconMap.tiling,
        colors: categoryColorMap.tiling,
      };
    } else if (
      type.includes("urgence") ||
      type.includes("urgent") ||
      type.includes("emergency")
    ) {
      return {
        type: "emergency",
        icon: iconMap.emergency,
        colors: categoryColorMap.emergency,
      };
    } else if (
      type.includes("sécurité") ||
      type.includes("alarme") ||
      type.includes("serrure")
    ) {
      return {
        type: "security",
        icon: iconMap.security,
        colors: categoryColorMap.default,
      };
    } else if (
      type.includes("automobile") ||
      type.includes("voiture") ||
      type.includes("auto")
    ) {
      return {
        type: "automotive",
        icon: iconMap.automotive,
        colors: categoryColorMap.default,
      };
    } else if (
      type.includes("informatique") ||
      type.includes("ordinateur") ||
      type.includes("pc")
    ) {
      return {
        type: "computer",
        icon: iconMap.computer,
        colors: categoryColorMap.default,
      };
    } else if (
      type.includes("internet") ||
      type.includes("wifi") ||
      type.includes("réseau")
    ) {
      return {
        type: "network",
        icon: iconMap.network,
        colors: categoryColorMap.default,
      };
    } else if (
      type.includes("maison") ||
      type.includes("domicile") ||
      type.includes("habitat")
    ) {
      return {
        type: "home",
        icon: iconMap.home,
        colors: categoryColorMap.default,
      };
    } else {
      return {
        type: "default",
        icon: iconMap.default,
        colors: categoryColorMap.default,
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
  const priorityConfig = getPriorityConfig(request.priority);
  const statusConfig = getStatusConfig(request.status);
  const categoryConfig = getCategoryConfig(request.serviceType);

  const handleCopyAddress = async () => {
    await copyToClipboard(request.location);
  };

  const handleAcceptQuote = async () => {
    if (!relevantEstimate) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/client/billing-estimates/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimateId: relevantEstimate.id,
          action: "accept",
        }),
      });

      if (response.ok) {
        setShowAcceptDialog(false);
        onRequestUpdate?.(); // Refresh the requests list
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error accepting quote:", error);
      alert("Erreur lors de l'acceptation du devis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectQuote = async () => {
    if (!relevantEstimate) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/client/billing-estimates/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimateId: relevantEstimate.id,
          action: "reject",
        }),
      });

      if (response.ok) {
        setShowRejectDialog(false);
        onRequestUpdate?.(); // Refresh the requests list
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error rejecting quote:", error);
      alert("Erreur lors du refus du devis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateCompletion = async () => {
    setIsSubmittingValidation(true);
    try {
      const response = await fetch(
        `/api/service-requests/${request.id}/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: validationType,
          }),
        }
      );

      if (response.ok) {
        setShowValidationDialog(false);
        setShowDisputeDialog(false);
        onRequestUpdate?.(); // Refresh the requests list
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
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('[role="button"]') ||
      target.closest("a") ||
      target.closest(".dialog-trigger")
    ) {
      return;
    }

    router.push(`/workspace/requests/${request.id}`);
  };

  return (
    <Card
      className="block group rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden !p-0 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className={`h-1 ${priorityConfig.topBarColor}`} />

      {(request.status === ServiceRequestStatus.DISPUTED_BY_CLIENT ||
        request.status === ServiceRequestStatus.DISPUTED_BY_ARTISAN ||
        request.status === ServiceRequestStatus.DISPUTED_BY_BOTH) && (
        <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-4 py-3 shadow-2xl shadow-red-500/25 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-full"></div>

          <div className="relative z-10 flex items-center justify-between">
            {/* Left side - Enhanced alert section */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlertTriangle className="h-4 w-4 text-white drop-shadow-sm" />
                <div className="absolute -inset-0.5 bg-white/30 rounded-full animate-ping"></div>
              </div>
              <div>
                <span className="font-bold text-white text-xs tracking-wide uppercase drop-shadow-sm">
                  Litige en cours
                </span>
                <div className="text-white/90 text-[10px] font-medium">
                  Réponse sous 48h
                </div>
              </div>
            </div>

            {/* Right side - Enhanced action section */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="group relative bg-white text-red-600 border-2 border-white hover:bg-red-50 text-xs h-7 px-4 rounded-full font-bold cursor-pointer hover:text-white hover:bg-red-500"
              >
                <FileText className="h-3 w-3 mr-1.5" />
                <span className="font-bold tracking-wide">Voir</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <CardHeader className="p-3">
        <div className="space-y-2">
          {/* Combined Title row */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Modern Category + Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 flex items-center justify-center ${
                      categoryConfig.type === "plumbing"
                        ? "text-blue-600"
                        : categoryConfig.type === "electricity"
                        ? "text-amber-600"
                        : categoryConfig.type === "painting"
                        ? "text-violet-600"
                        : categoryConfig.type === "carpentry"
                        ? "text-stone-600"
                        : categoryConfig.type === "tiling"
                        ? "text-teal-600"
                        : categoryConfig.type === "emergency"
                        ? "text-rose-600"
                        : "text-slate-600"
                    }`}
                  >
                    {categoryConfig.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {request.serviceType}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 leading-tight group-hover:text-slate-700 transition-colors duration-200">
                  <span className="line-clamp-2">
                    {request.title || request.description}
                  </span>
                </h3>
              </div>
            </div>

            {/* Status chip */}
            <Badge
              className={`rounded-full text-xs px-3 py-1 font-medium ${statusConfig.color} ml-3`}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Validation Banner and Actions - Two-way validation system */}
      {(request.status === ServiceRequestStatus.IN_PROGRESS ||
        request.status === ServiceRequestStatus.ARTISAN_VALIDATED) && (
        <div className="px-3 pb-3">
          <div className="space-y-3">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-start">
              <Button
                size="sm"
                onClick={() => {
                  setValidationType("approve");
                  setShowValidationDialog(true);
                }}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider la prestation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setValidationType("dispute");
                  setShowDisputeDialog(true);
                }}
                className="w-full sm:w-auto border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-lg"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Contester
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Client Already Validated Banner */}
      {request.status === ServiceRequestStatus.CLIENT_VALIDATED && (
        <div className="px-3 pb-3">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700">
                Vous avez validé cette mission. En attente de la validation de
                l'artisan.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <CardContent className="p-3 pt-0 pb-0 space-y-2">
        {/* Description callout */}
        <div
          className={`
          relative p-1
          ${categoryConfig.colors.accent}
        `}
        >
          <p
            className={`text-sm text-slate-400 leading-relaxed ${
              !descriptionExpanded ? "line-clamp-2" : ""
            }`}
          >
            {request.description}
          </p>
          {request.description.length > 100 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              className={`h-auto p-0 text-xs mt-2 font-medium hover:underline ${categoryConfig.colors.text}`}
            >
              {descriptionExpanded ? "Voir moins" : "Voir plus"}
            </Button>
          )}
        </div>

        {/* Photos */}
        {photos.length > 0 ? (
          <PhotosStrip photos={photos} />
        ) : (
          <div className="flex items-center justify-center h-12 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400">
              <ImageIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Aucune photo fournie</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 pb-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-center">
            {/* Artisan Panel */}
            <div className="space-y-1 h-full">
              {request.assignedArtisan ? (
                <div className="flex flex-col items-center text-center space-y-1">
                  {/* Photo */}
                  {request.assignedArtisan.profilePicture ? (
                    <img
                      src={request.assignedArtisan.profilePicture}
                      alt={request.assignedArtisan.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                  )}

                  {/* Name and First Name */}
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {request.assignedArtisan.firstName &&
                      request.assignedArtisan.lastName
                        ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                        : request.assignedArtisan.name}
                    </p>
                    {request.assignedArtisan.specialty && (
                      <p className="text-xs text-slate-500">
                        {request.assignedArtisan.specialty}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-slate-700">
                      {request.assignedArtisan.rating?.toFixed(1) || "4.5"}
                    </span>
                  </div>

                  {/* Phone Number Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-7"
                    onClick={() => {
                      // Handle phone call logic
                      if (request.assignedArtisan?.email) {
                        window.open(
                          `tel:${request.assignedArtisan.email}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>

                  {/* Additional Actions */}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center text-slate-500 h-full">
                  <Clock className="h-4 w-4 mb-1" />
                  <span className="text-xs font-medium text-center">
                    En attente d'assignation
                  </span>
                </div>
              )}
            </div>

            {/* Right Panel - Conditional based on status */}
            <div className="space-y-1 h-full">
              {/* Special statuses Panel - for non-dispute issues */}
              {request.status === ServiceRequestStatus.DISPUTED_BY_ARTISAN && (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg border border-amber-200 p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                      {request.status ===
                      ServiceRequestStatus.DISPUTED_BY_ARTISAN
                        ? "Mission impossible"
                        : "Problème signalé"}
                    </span>
                  </div>

                  <p className="text-xs text-amber-700 mb-3">
                    {request.status === ServiceRequestStatus.DISPUTED_BY_ARTISAN
                      ? "L'artisan n'a pas pu réaliser cette mission."
                      : "L'artisan a signalé des problèmes lors de la réalisation."}
                  </p>

                  <Button
                    onClick={() =>
                      router.push(`/workspace/requests/${request.id}`)
                    }
                    variant="outline"
                    size="sm"
                    className="w-full border border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100 text-[10px] h-6 font-medium rounded-md"
                  >
                    <MessageCircle className="h-3 w-3 mr-1.5" />
                    Voir détails
                  </Button>
                </div>
              )}

              {/* Standard Devis Panel - for non-dispute statuses */}
              {relevantEstimate && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200 p-2 relative h-full flex flex-col justify-between">
                  {/* Accepted Check Icon */}
                  {relevantEstimate.status === "accepted" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Devis accepté</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator className="h-4 w-4 text-slate-600" />
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Devis
                    </span>
                  </div>

                  {/* Price - Most prominent */}
                  <div className="mb-1">
                    <p className="text-lg font-bold text-slate-900 tracking-tight">
                      {formatPrice(relevantEstimate.estimatedPrice)}
                    </p>
                    {relevantEstimate.validUntil && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        Expire le{" "}
                        {moment(relevantEstimate.validUntil).format(
                          "DD/MM/YYYY"
                        )}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-1.5">
                    {relevantEstimate.status === "pending" ? (
                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          size="sm"
                          onClick={() => setShowAcceptDialog(true)}
                          className="group relative bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 border-0 text-white shadow-sm hover:shadow-md transition-all duration-200 text-[10px] h-6 px-2 font-medium rounded-md"
                        >
                          <CheckCircle className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRejectDialog(true)}
                          className="group relative border border-slate-300 text-slate-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50 active:bg-rose-100 transition-all duration-200 text-[10px] h-6 px-2 font-medium rounded-md"
                        >
                          <X className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/workspace/devis/${relevantEstimate.id}`)
                        }
                        className="w-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 text-[10px] h-6 font-medium rounded-md"
                      >
                        <Eye className="h-3 w-3 mr-1.5" />
                        Voir détails
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* No estimate panel */}
              {![
                "awaiting_validation",
                "client_validated",
                "artisan_validated",
                "completed_with_issues",
                "could_not_complete",
                "disputed",
              ].includes(request.status) &&
                !relevantEstimate && (
                  <div className="bg-amber-50 rounded-lg p-2 flex flex-col items-center justify-center text-amber-600 h-16">
                    <Clock className="h-4 w-4 mb-1" />
                    <span className="text-xs font-medium text-center">
                      Devis en préparation
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Metadata footer - subtle info */}
          <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
            <p className="text-xs text-slate-400 text-center truncate">
              📍 {request.location}
            </p>
            <p className="text-xs text-slate-400 text-center">
              Créée le {formatDate(request.createdAt, "full")}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accepter le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir accepter ce devis de{" "}
              {relevantEstimate && formatPrice(relevantEstimate.estimatedPrice)}{" "}
              ? Cette action déclenchera le début des travaux.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcceptQuote}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? "En cours..." : "Accepter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refuser le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir refuser ce devis ? L'artisan sera notifié
              de votre décision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectQuote}
              disabled={isLoading}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isLoading ? "En cours..." : "Refuser"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                L'artisan sera notifié de votre validation et le paiement sera
                déclenché.
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
              onClick={handleValidateCompletion}
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
              Confirmez que vous souhaitez contester cette mission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Litige signalé
              </p>
              <p className="text-xs text-red-600 mt-1">
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
              onClick={handleValidateCompletion}
              disabled={isSubmittingValidation}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmittingValidation ? "En cours..." : "Confirmer le litige"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function RequestGrid({
  requests,

  onRequestUpdate,
}: ClientRequestsListComponentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-4 gap-6">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onRequestUpdate={onRequestUpdate}
        />
      ))}
    </div>
  );
}

export function ClientRequestsListComponent({
  requests,
  onRequestUpdate,
}: ClientRequestsListComponentProps) {
  const router = useRouter();

  if (requests.length === 0) {
    return (
      <Card className="rounded-2xl p-5 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune demande pour le moment
            </h3>
            <p className="text-slate-600">
              Créez votre première demande de service pour commencer
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group requests by status for accordion view
  const awaitingEstimateRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.AWAITING_ESTIMATE
  );
  const pendingRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.AWAITING_ASSIGNATION
  );
  const activeRequests = requests.filter((req) =>
    [
      ServiceRequestStatus.IN_PROGRESS,
      ServiceRequestStatus.ARTISAN_VALIDATED,
      ServiceRequestStatus.COMPLETED,
    ].includes(req.status as any)
  );
  const awaitingValidationRequests = requests.filter((req) =>
    [
      ServiceRequestStatus.CLIENT_VALIDATED,
      ServiceRequestStatus.ARTISAN_VALIDATED,
      ,
    ].includes(req.status as any)
  );
  const clientNeedsValidationRequests = requests.filter((req) =>
    [ServiceRequestStatus.ARTISAN_VALIDATED].includes(req.status as any)
  );
  const artisanNeedsValidationRequests = requests.filter((req) =>
    [ServiceRequestStatus.CLIENT_VALIDATED].includes(req.status as any)
  );
  const issueRequests = requests.filter((req) =>
    [
      ServiceRequestStatus.DISPUTED_BY_CLIENT,
      ServiceRequestStatus.DISPUTED_BY_ARTISAN,
      ServiceRequestStatus.DISPUTED_BY_BOTH,
    ].includes(req.status as any)
  );
  const disputedRequests = requests.filter((req) =>
    [
      ServiceRequestStatus.DISPUTED_BY_CLIENT,
      ServiceRequestStatus.DISPUTED_BY_ARTISAN,
      ServiceRequestStatus.DISPUTED_BY_BOTH,
    ].includes(req.status as any)
  );
  const completedRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.COMPLETED
  );
  const cancelledRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.CANCELLED
  );

  return (
    <div className="space-y-6">
      {/* Summary Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* En attente de devis */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-amber-300 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {awaitingEstimateRequests.length}
              </p>
              <p className="text-sm font-medium text-slate-600">
                En attente de devis
              </p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calculator className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        {/* En attente d'assignation */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {pendingRequests.length}
              </p>
              <p className="text-sm font-medium text-slate-600">
                En attente d'assignation
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* À valider */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {awaitingValidationRequests.length}
              </p>
              <p className="text-sm font-medium text-slate-600">À valider</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ThumbsUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* En litige */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-orange-300 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {disputedRequests.length}
              </p>
              <p className="text-sm font-medium text-slate-600">En litige</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Terminé */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-emerald-300 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {completedRequests.length}
              </p>
              <p className="text-sm font-medium text-slate-600">Terminé</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Annulé */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-600">
                {cancelledRequests.length}
              </p>
              <p className="text-sm font-medium text-slate-600">Annulé</p>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Requests Accordion */}
      <Accordion type="multiple" className="space-y-4">
        {/* Awaiting Estimate Requests */}
        {awaitingEstimateRequests.length > 0 && (
          <AccordionItem value="awaiting-estimate">
            <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:no-underline">
              <div className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-amber-600" />
                En attente de devis ({awaitingEstimateRequests.length})
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <RequestGrid
                requests={awaitingEstimateRequests}
                onRequestUpdate={onRequestUpdate}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <AccordionItem value="pending">
            <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:no-underline">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Demandes en attente ({pendingRequests.length})
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <RequestGrid
                requests={pendingRequests}
                onRequestUpdate={onRequestUpdate}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Active Requests */}
        {activeRequests.length > 0 && (
          <AccordionItem value="active">
            <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:no-underline">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
                Demandes en cours ({activeRequests.length})
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <RequestGrid
                requests={activeRequests}
                onRequestUpdate={onRequestUpdate}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Awaiting Validation Requests */}
        {awaitingValidationRequests.length > 0 && (
          <AccordionItem value="awaiting-validation">
            <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:no-underline">
              <div className="flex items-center">
                <ThumbsUp className="h-5 w-5 mr-2 text-purple-600" />À valider (
                {awaitingValidationRequests.length})
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <RequestGrid
                requests={awaitingValidationRequests}
                onRequestUpdate={onRequestUpdate}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Disputed Requests */}
        {disputedRequests.length > 0 && (
          <AccordionItem value="disputed">
            <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:no-underline">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                En litige ({disputedRequests.length})
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <RequestGrid
                requests={disputedRequests}
                onRequestUpdate={onRequestUpdate}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Completed Requests */}
        {/* {completedRequests.length > 0 && (
          <AccordionItem value="completed">
            <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:no-underline">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
                Demandes terminées ({completedRequests.length})
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <RequestGrid
                requests={completedRequests}
               
                onRequestUpdate={onRequestUpdate}
              />
            </AccordionContent>
          </AccordionItem>
        )} */}

        {/* Cancelled Requests */}
        {cancelledRequests.length > 0 && (
          <AccordionItem value="cancelled">
            <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:no-underline">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-slate-600" />
                Demandes annulées ({cancelledRequests.length})
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <RequestGrid
                requests={cancelledRequests}
                onRequestUpdate={onRequestUpdate}
              />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
