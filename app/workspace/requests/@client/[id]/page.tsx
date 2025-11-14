"use client";

import { ArtisanValidationModal } from "@/app/workspace/components/ArtisanValidationModal";
import { EstimateHistoryAccordion } from "@/app/workspace/devis/components/EstimateHistoryAccordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentSuccessModal } from "@/components/ui/payment-success-modal";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { BillingEstimateStatus, ServiceRequestStatus } from "@/lib/db/schema";
import {
  getCategoryConfig,
  getPriorityConfig,
  getStatusConfig,
  handleAcceptQuote,
} from "@/lib/utils";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MessageSquare,
  Pencil,
  Phone,
  Star,
  User,
} from "lucide-react";
import moment from "moment";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import useSWR from "swr";
import { ClientActionBanner } from "../../components/ClientActionBanner";
import { DisputeDetailsModal } from "../../components/DisputeDetailsModal";
import { ActionDialogs } from "./ActionDialogs";
import { ChatModal } from "./ChatModal";
import { DeletePhotoDialog } from "./DeletePhotoDialog";
import { EditDescriptionDialog } from "./EditDescriptionDialog";
import { EditLocationDialog } from "./EditLocationDialog";
import { EditTitleDialog } from "./EditTitleDialog";
import { HeroGallery } from "./HeroGallery";
import { PhotoUploadDialog } from "./PhotoUploadDialog";
import { ProgressDrawer } from "./ProgressDrawer";
import { ProgressIndicator } from "./ProgressIndicator";

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
  updatedAt?: string;
  photos?: string;
  statusHistory?: Record<string, string>;
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
    breakdown?: string;
    artisanAccepted?: boolean | null;
    clientAccepted?: boolean | null;
    artisanResponseDate?: string | null;
    clientResponseDate?: string | null;
    rejectedByArtisanId?: number | null;
    artisanRejectionReason?: string | null;
  }[];
  validationActions?: {
    id: number;
    timestamp: Date;
    validationNotes: string | null;
    additionalData: string | null;
    actorType: string;
    actionType: string;
    actor: {
      id: number;
      name: string | null;
      email: string;
    } | null;
  }[];
  disputeActions?: {
    id: number;
    timestamp: Date | string;
    actorId: number;
    actorType: string;
    disputeReason: string;
    disputeDetails: string;
    additionalData: string | null;
    createdAt: Date | string;
    actor: {
      id: number;
      name: string | null;
      email: string;
    } | null;
  }[];
  priority?: "high" | "normal" | "low";
  category?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = parseInt((params?.id as string) || "");

  // State management
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [showValidateDialog, setShowValidateDialog] = React.useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = React.useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = React.useState(false);
  const [showChatModal, setShowChatModal] = React.useState(false);
  const [showCallDialog, setShowCallDialog] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [photoModalOpen, setPhotoModalOpen] = React.useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const [currentUserId, setCurrentUserId] = React.useState<
    number | undefined
  >();
  const [descriptionExpanded, setDescriptionExpanded] = React.useState(false);
  const [showBreakdown, setShowBreakdown] = React.useState(false);
  const [paymentVerificationState, setPaymentVerificationState] =
    React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [showEditLocation, setShowEditLocation] = React.useState(false);
  const [showEditDescription, setShowEditDescription] = React.useState(false);
  const [showEditTitle, setShowEditTitle] = React.useState(false);
  const [showDeletePhoto, setShowDeletePhoto] = React.useState(false);
  const [photoToDelete, setPhotoToDelete] = React.useState<{
    url: string;
    index: number;
  } | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = React.useState(false);
  const [showEstimateHistoryModal, setShowEstimateHistoryModal] =
    React.useState(false);
  const [showValidationModal, setShowValidationModal] = React.useState(false);
  const [showDisputeDetailsModal, setShowDisputeDetailsModal] =
    React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch request data
  const {
    data: request,
    error,
    mutate,
  } = useSWR<ServiceRequest>(`/api/service-requests/${requestId}`, fetcher);

  // Fetch current user
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  // Payment verification after redirect from Stripe
  React.useEffect(() => {
    const checkPayment = searchParams?.get("check_payment");

    if (checkPayment === "1") {
      // Clean URL parameter immediately
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("check_payment");
      router.replace(newUrl.pathname + newUrl.search);

      // Verify payment from backend
      const verifyPayment = async () => {
        setPaymentVerificationState("loading");
        try {
          const response = await fetch(
            `/api/payments/status?requestId=${requestId}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.paymentCompleted === true) {
              setPaymentVerificationState("success");
              // Refresh request data to show updated status
              await mutate();
            } else {
              setPaymentVerificationState("error");
            }
          } else {
            setPaymentVerificationState("error");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          setPaymentVerificationState("error");
        }
      };

      verifyPayment();
    }
  }, [searchParams, requestId, router, mutate]);

  // Handle estimate actions
  const handleAcceptEstimate = async () => {
    if (!request?.billingEstimates?.[0]) return;

    setIsLoading(true);
    try {
      // Use the payment-enabled acceptance flow with 30% deposit
      // cancelUrl should be a path (not full URL), BASE_URL is prepended in stripe.ts
      const cancelUrl = `/workspace/requests/${requestId}`;
      await handleAcceptQuote(
        requestId,
        cancelUrl,
        request.billingEstimates[0].estimatedPrice
      );
      // Note: User will be redirected to Stripe checkout
      // After payment, they'll return and the estimate will be accepted
    } catch (error) {
      console.error("Error accepting estimate:", error);
      alert("Erreur lors de l'acceptation du devis");
      setIsLoading(false);
    }
  };

  const handleRejectEstimate = async (reason: string) => {
    if (!request?.billingEstimates?.[0]) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/client/billing-estimates/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimateId: request.billingEstimates[0].id,
          action: "reject",
          response: reason,
        }),
      });

      if (response.ok) {
        await mutate();
        setShowRejectDialog(false);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error rejecting estimate:", error);
      alert("Erreur lors du rejet du devis");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle validation/dispute actions
  const handleValidateCompletion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/service-requests/${requestId}/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "approve",
          }),
        }
      );

      if (response.ok) {
        await mutate();
        setShowValidateDialog(false);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error validating completion:", error);
      alert("Erreur lors de la validation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispute = async (reason: string, details: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/service-requests/${requestId}/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "dispute",
            disputeReason: reason,
            disputeDetails: details,
          }),
        }
      );

      if (response.ok) {
        await mutate();
        setShowDisputeDialog(false);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error disputing:", error);
      alert("Erreur lors du signalement");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const canEditRequest = (): boolean => {
    if (!request) return false;
    return request.status === ServiceRequestStatus.AWAITING_ESTIMATE;
  };

  const handleDeletePhoto = (photoUrl: string, photoIndex: number) => {
    setPhotoToDelete({ url: photoUrl, index: photoIndex });
    setShowDeletePhoto(true);
  };

  const handleConfirmDeletePhoto = async () => {
    if (!photoToDelete || !request) return;

    setIsDeletingPhoto(true);
    try {
      const photos = request.photos ? JSON.parse(request.photos) : [];
      const updatedPhotos = photos.filter(
        (_: string, index: number) => index !== photoToDelete.index
      );

      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photos: JSON.stringify(updatedPhotos),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la photo");
      }

      await mutate();
      setShowDeletePhoto(false);
      setPhotoToDelete(null);
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Erreur lors de la suppression de la photo");
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(0)} €`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getEstimateStatusBadge = (estimate: any) => {
    if (
      estimate.status === BillingEstimateStatus.REJECTED &&
      estimate?.rejectedByArtisanId
    ) {
      return (
        <Badge
          variant="outline"
          className={`bg-red-100 text-red-700 border-red-300`}
        >
          Rejeté par l'artisan
        </Badge>
      );
    }

    if (
      estimate.status === BillingEstimateStatus.REJECTED &&
      !estimate?.rejectedByArtisanId
    ) {
      return (
        <Badge
          variant="outline"
          className={`bg-yellow-100 text-yellow-700 border-yellow-300`}
        >
          En attente de validation
        </Badge>
      );
    }
  };

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

  // Prepare data
  const photos = request.photos ? JSON.parse(request.photos) : [];
  const relevantEstimate = request.billingEstimates?.[0];
  const categoryConfig = getCategoryConfig(request.serviceType, "h-5 w-5");
  const urgencyConfig = getPriorityConfig(request?.urgency, "h-5 w-5");
  const statusConfig = getStatusConfig(request.status, "h-5 w-5");

  const timeAgo = moment(request.createdAt).locale("fr").fromNow();

  // Truncate description
  const shouldTruncate = request.description.length > 300;
  const displayDescription =
    shouldTruncate && !descriptionExpanded
      ? request.description.substring(0, 300) + "..."
      : request.description;

  // Parse breakdown
  const parsedBreakdown = relevantEstimate?.breakdown
    ? (() => {
        try {
          return JSON.parse(relevantEstimate.breakdown);
        } catch (e) {
          return null;
        }
      })()
    : null;

  // Check action availability
  const canAcceptRejectEstimate =
    (request.status === ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION &&
      relevantEstimate?.status === BillingEstimateStatus.PENDING) ||
    (request.status === ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE &&
      !relevantEstimate?.clientAccepted);

  const canValidateOrDispute =
    request.status === ServiceRequestStatus.IN_PROGRESS ||
    request.status === ServiceRequestStatus.ARTISAN_VALIDATED;

  return (
    <div className="min-h-screen">
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStatus={request.status}
        statusHistory={request.statusHistory}
        billingEstimateStatus={relevantEstimate?.status}
      />

      {/* Main Container - Airbnb width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 bg-white rounded-lg shadow-sm mt-6">
        {/* Page Title */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 mb-2 items-center">
              <h1 className="text-xl sm:text-2xl md:text-[26px] font-semibold text-[#222222] break-words">
                {request.title || "Demande de service"}
              </h1>
              {canEditRequest() && (
                <button
                  onClick={() => setShowEditTitle(true)}
                  className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Modifier le titre"
                >
                  <Pencil className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-[#717171]">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Créée {timeAgo}
              </span>
              <span className="hidden sm:inline mx-1">·</span>
              <span className="flex items-center gap-2 truncate">
                <span className="truncate">{request.location}</span>
                {canEditRequest() && (
                  <button
                    onClick={() => setShowEditLocation(true)}
                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Modifier l'adresse"
                  >
                    <Pencil className="h-3.5 w-3.5 text-gray-600" />
                  </button>
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 sm:gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={() => setShowEstimateHistoryModal(true)}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Historique des devis
                {request.billingEstimates &&
                  request.billingEstimates.length > 1 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-fixeo-main-100 text-fixeo-main-700"
                    >
                      {request.billingEstimates.length}
                    </Badge>
                  )}
              </Button>
              {request.validationActions &&
                request.validationActions.length > 0 && (
                  <Button
                    onClick={() => setShowValidationModal(true)}
                    variant="outline"
                    className="border-green-300 hover:bg-green-50"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validation artisan
                  </Button>
                )}
              <ProgressDrawer
                currentStatus={request.status}
                statusHistory={request.statusHistory}
              />
            </div>
          </div>
        </div>

        <Separator className="border-[#EBEBEB] mb-8" />

        {/* Dual Acceptance Status Banner */}
        {request.status === ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE &&
          relevantEstimate && (
            <div className="mb-8">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">
                  Acceptation mutuelle requise
                </h3>
                <p className="text-sm text-purple-700 mb-4">
                  Ce devis révisé nécessite l'acceptation à la fois de vous et
                  de l'artisan pour continuer.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        relevantEstimate.clientAccepted
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm font-medium text-purple-700">
                      Vous (Client):{" "}
                      {relevantEstimate.clientAccepted
                        ? "✓ Accepté"
                        : "En attente"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        relevantEstimate.artisanAccepted
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm font-medium text-purple-700">
                      Artisan:{" "}
                      {relevantEstimate.artisanAccepted
                        ? "✓ Accepté"
                        : "En attente"}
                    </span>
                  </div>
                </div>
                {relevantEstimate.clientAccepted &&
                  !relevantEstimate.artisanAccepted && (
                    <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                      <p className="text-sm text-purple-800">
                        ✓ Votre acceptation a été enregistrée. En attente de la
                        réponse de l'artisan.
                      </p>
                    </div>
                  )}
                {!relevantEstimate.clientAccepted &&
                  relevantEstimate.artisanAccepted && (
                    <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                      <p className="text-sm text-purple-800">
                        L'artisan a accepté le devis. Veuillez accepter pour
                        continuer.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}

        {/* Two Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#DDDDDD] rounded-xl shadow-sm p-6">
            <h3 className="text-[18px] font-semibold text-[#222222] mb-4">
              Devis estimatif
            </h3>
            {relevantEstimate ? (
              <div className="space-y-4">
                {/* Price Header with Badge */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-semibold text-[#222222]">
                      {formatPrice(relevantEstimate.estimatedPrice)}
                    </span>
                    {getEstimateStatusBadge(relevantEstimate)}
                  </div>
                  {/* Dates as subtitles */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-[#717171]">
                      <Calendar className="h-4 w-4" />
                      <span>Créée le {formatDate(request.createdAt)}</span>
                    </div>
                    {request.updatedAt && (
                      <div className="flex items-center gap-2 text-sm text-[#717171]">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Mise à jour le {formatDate(request.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Message */}
                {request.status ===
                  ServiceRequestStatus.AWAITING_ESTIMATE_REVISION &&
                  relevantEstimate && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">
                          {relevantEstimate.rejectedByArtisanId
                            ? "Le devis a été contesté par l'artisan. Notre équipe prépare une révision."
                            : "Le devis a été contesté. Notre équipe prépare une révision."}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                {canAcceptRejectEstimate && (
                  <>
                    <Separator className="border-[#EBEBEB]" />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowAcceptDialog(true)}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        Accepter le devis
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={isLoading}
                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Rejeter
                      </Button>
                    </div>
                  </>
                )}

                {canValidateOrDispute && (
                  <>
                    <Separator className="border-[#EBEBEB]" />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowValidateDialog(true)}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Valider l'intervention
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDisputeDialog(true)}
                        disabled={isLoading}
                        className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        Signaler un problème
                      </Button>
                    </div>
                  </>
                )}

                <>
                  <Separator className="border-[#EBEBEB]" />
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/workspace/devis/${relevantEstimate.id}`)
                    }
                    className="w-full border-[#DDDDDD]"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Voir le devis complet
                  </Button>
                </>

                {/* Info message */}
                {canAcceptRejectEstimate && (
                  <>
                    <Separator className="border-[#EBEBEB]" />
                    <p className="text-xs text-[#717171] text-center">
                      Aucun montant ne vous sera débité pour le moment
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-[#717171] text-sm">
                  En attente du devis estimatif
                </p>
              </div>
            )}
          </div>
          <div className="border border-[#DDDDDD] rounded-xl shadow-sm p-6 flex flex-col min-h-[300px]">
            <h3 className="text-[18px] font-semibold text-[#222222] mb-4">
              Votre artisan
            </h3>
            {request.assignedArtisan?.id ? (
              <div className="flex flex-col flex-1">
                <div className="flex items-start gap-4 mb-4">
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
                  <div className="flex-1">
                    <h4 className="text-[16px] font-semibold text-[#222222] mb-1">
                      {request.assignedArtisan.firstName &&
                      request.assignedArtisan.lastName
                        ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                        : request.assignedArtisan.name}
                    </h4>
                    <p className="text-sm text-[#717171] mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {"06 78 90 12 34"}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold text-[#222222]">
                        {request.assignedArtisan.rating || "5.0"}
                      </span>
                      {!request.assignedArtisan.rating && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Nouveau
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="border-[#EBEBEB] mb-4" />

                <div className="flex flex-col gap-3 flex-1">
                  <Button
                    onClick={() => setShowChatModal(true)}
                    className="w-full flex-1 bg-fixeo-main-500 hover:bg-fixeo-main-700 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                  <Button
                    onClick={() => setShowCallDialog(true)}
                    variant="outline"
                    className="w-full flex-1 border-[#DDDDDD] text-[#222222] hover:bg-gray-50"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="font-semibold text-[#222222] mb-1">
                  En attente d'assignation
                </h4>
                <p className="text-sm text-[#717171]">
                  Un artisan sera assigné après acceptation du devis
                </p>
              </div>
            )}
          </div>
        </div>

        {/* <div className="my-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">{categoryConfig.icon}</div>
              <div>
                <h4 className="font-semibold text-[#222222] mb-1">
                  Type de service
                </h4>
                <p className="text-[#717171]">{categoryConfig.type}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Flame className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-[#222222] mb-1">
                  Niveau d'urgence
                </h4>
                <p className="text-[#717171] capitalize flex items-center gap-2">
                  {urgencyConfig.icon}
                  {urgencyConfig.label}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-[#222222] mb-1">
                  Localisation
                </h4>
                <p className="text-[#717171]">{request.location}</p>
              </div>
            </div>
          </div>
        </div> */}

        <Separator className="border-[#EBEBEB] mb-12" />

        {/* Description Section */}
        <div className="mb-12">
          <div className="flex items-center justify-start mb-4">
            <h3 className="text-[22px] font-semibold text-[#222222]">
              Description de la demande
            </h3>
            {canEditRequest() && (
              <button
                onClick={() => setShowEditDescription(true)}
                className="p-2 ml-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Modifier la description"
              >
                <Pencil className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
          <p className="text-[#222222] leading-relaxed whitespace-pre-wrap break-words">
            {displayDescription}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              className="mt-3 text-[#222222] font-semibold underline hover:no-underline"
            >
              {descriptionExpanded ? "Réduire" : "Afficher plus"}
            </button>
          )}
        </div>

        <Separator className="border-[#EBEBEB] mb-12" />

        {/* Photo Grid */}
        <div className="mb-12">
          <h3 className="text-[22px] font-semibold text-[#222222] mb-4">
            Photos
          </h3>
          <HeroGallery
            photos={photos}
            onShowAllPhotos={() => {
              setCurrentPhotoIndex(0);
              setPhotoModalOpen(true);
            }}
            canEdit={canEditRequest()}
            onAddPhotos={() => setShowPhotoUpload(true)}
            onDeletePhoto={handleDeletePhoto}
          />
        </div>

        {/* Embedded Chat - Only shown when artisan is assigned */}
        {/* {request.assignedArtisan && (
          <>
            <Separator className="border-[#EBEBEB] mb-12" />
            <div className="mb-12">
              <h3 className="text-[22px] font-semibold text-[#222222] mb-6">
                Conversation avec l'artisan
              </h3>
              <ConversationChat
                requestId={requestId}
                currentUserId={currentUserId}
                currentUserRole="client"
                otherUserName={
                  request.assignedArtisan.firstName &&
                  request.assignedArtisan.lastName
                    ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                    : request.assignedArtisan.name || "Artisan"
                }
                otherUserRole="professional"
                className="w-full"
                showHeader={true}
              />
            </div>
          </>
        )} */}
      </div>

      {/* Action Dialogs */}
      <ActionDialogs
        showAcceptDialog={showAcceptDialog}
        setShowAcceptDialog={setShowAcceptDialog}
        showRejectDialog={showRejectDialog}
        setShowRejectDialog={setShowRejectDialog}
        estimatePrice={relevantEstimate?.estimatedPrice}
        onAcceptEstimate={handleAcceptEstimate}
        onRejectEstimate={handleRejectEstimate}
        showValidateDialog={showValidateDialog}
        setShowValidateDialog={setShowValidateDialog}
        showDisputeDialog={showDisputeDialog}
        setShowDisputeDialog={setShowDisputeDialog}
        onValidateCompletion={handleValidateCompletion}
        onDispute={handleDispute}
        isLoading={isLoading}
      />

      {/* Photo Upload Dialog */}
      <PhotoUploadDialog
        open={showPhotoUpload}
        onOpenChange={setShowPhotoUpload}
        requestId={requestId}
        onSuccess={() => mutate()}
      />

      {/* Chat Modal */}
      <ChatModal
        open={showChatModal}
        onOpenChange={setShowChatModal}
        serviceRequestId={requestId}
        currentUserId={currentUserId}
        artisanName={
          request.assignedArtisan?.firstName &&
          request.assignedArtisan?.lastName
            ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
            : request.assignedArtisan?.name || "Nom de l'artisan non disponible"
        }
        artisanAvatar={request.assignedArtisan?.profilePicture}
      />

      {/* Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appeler l'artisan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {request.assignedArtisan?.email ? (
              <>
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-[#FF385C]/10 flex items-center justify-center mx-auto mb-3">
                    <Phone className="h-8 w-8 text-[#FF385C]" />
                  </div>
                  <h4 className="font-semibold text-[#222222] mb-2">
                    {request.assignedArtisan.firstName &&
                    request.assignedArtisan.lastName
                      ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                      : request.assignedArtisan.name}
                  </h4>
                  <p className="text-sm text-[#717171]">
                    Pour des raisons de confidentialité, veuillez utiliser le
                    chat pour communiquer avec l'artisan.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowCallDialog(false);
                    setShowChatModal(true);
                  }}
                  className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Envoyer un message
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[#717171]">
                  Aucune information de contact disponible
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
          </div>

          {/* Photo thumbnails */}
          {photos.length > 1 && (
            <div className="px-6 pb-6">
              <div className="flex gap-2 justify-center flex-wrap">
                {photos.map((photo: string, index: number) => (
                  <button
                    key={index}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                      index === currentPhotoIndex
                        ? "border-[#FF385C]"
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

      {/* Payment Verification Loading Overlay */}
      {paymentVerificationState === "loading" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
            <Spinner className="h-12 w-12" />
            <p className="text-lg font-semibold text-gray-900">
              Vérification du paiement...
            </p>
            <p className="text-sm text-gray-600">
              Veuillez patienter quelques instants
            </p>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={paymentVerificationState === "success"}
        onClose={() => setPaymentVerificationState("idle")}
        title="Acompte payé avec succès !"
        description="Votre acompte de 30% a été reçu. Un artisan sera assigné à votre demande dans les plus brefs délais."
        confirmText="D'accord"
      />

      {/* Payment Error Dialog */}
      <Dialog
        open={paymentVerificationState === "error"}
        onOpenChange={() => setPaymentVerificationState("idle")}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Erreur de vérification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Impossible de vérifier le paiement. Veuillez rafraîchir la page ou
              contacter le support si le problème persiste.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setPaymentVerificationState("idle")}
              >
                Fermer
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-fixeo-main-500 hover:bg-fixeo-main-600 text-white"
              >
                Rafraîchir la page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <EditLocationDialog
        open={showEditLocation}
        onOpenChange={setShowEditLocation}
        requestId={requestId}
        currentLocation={request.location}
        onSuccess={() => mutate()}
      />

      {/* Edit Title Dialog */}
      <EditTitleDialog
        open={showEditTitle}
        onOpenChange={setShowEditTitle}
        requestId={requestId}
        currentTitle={request.title || ""}
        onSuccess={() => mutate()}
      />

      {/* Edit Description Dialog */}
      <EditDescriptionDialog
        open={showEditDescription}
        onOpenChange={setShowEditDescription}
        requestId={requestId}
        currentDescription={request.description}
        onSuccess={() => mutate()}
      />

      {/* Delete Photo Dialog */}
      <DeletePhotoDialog
        open={showDeletePhoto}
        onOpenChange={setShowDeletePhoto}
        photoUrl={photoToDelete?.url || null}
        onConfirm={handleConfirmDeletePhoto}
        isDeleting={isDeletingPhoto}
      />

      {/* Estimate History Modal */}
      <Dialog
        open={showEstimateHistoryModal}
        onOpenChange={setShowEstimateHistoryModal}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-fixeo-main-100 rounded-lg">
                <FileText className="h-6 w-6 text-fixeo-main-600" />
              </div>
              Historique des devis
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            <EstimateHistoryAccordion
              serviceRequestId={requestId}
              role="client"
              currentEstimateId={relevantEstimate?.id}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Artisan Validation Modal */}
      <ArtisanValidationModal
        open={showValidationModal}
        onOpenChange={setShowValidationModal}
        validationAction={request.validationActions?.[0] || null}
        artisanName={
          request.assignedArtisan?.firstName &&
          request.assignedArtisan?.lastName
            ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
            : request.assignedArtisan?.name || "Artisan"
        }
      />

      {/* Dispute Details Modal */}
      <DisputeDetailsModal
        open={showDisputeDetailsModal}
        onOpenChange={setShowDisputeDetailsModal}
        disputeAction={request.disputeActions?.[0] || null}
      />

      {/* Client Action Banner */}
      <ClientActionBanner
        status={request.status}
        onOpenAcceptDialog={() => setShowAcceptDialog(true)}
        onOpenRejectDialog={() => setShowRejectDialog(true)}
        onOpenValidation={() => setShowValidateDialog(true)}
        onOpenDispute={() => setShowDisputeDialog(true)}
        onViewDispute={() => setShowDisputeDetailsModal(true)}
        clientAccepted={relevantEstimate?.clientAccepted ?? undefined}
        artisanAccepted={relevantEstimate?.artisanAccepted ?? undefined}
      />
    </div>
  );
}
