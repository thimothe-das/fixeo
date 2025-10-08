"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  getCategoryConfig,
  getPriorityConfig,
  getStatusConfig,
} from "@/lib/utils";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  MapPin,
  User,
  X,
} from "lucide-react";
import moment from "moment";
import { useParams } from "next/navigation";
import * as React from "react";
import useSWR from "swr";
import { ActionDialogs } from "./ActionDialogs";
import { HeroGallery } from "./HeroGallery";
import { PhotoUploadDialog } from "./PhotoUploadDialog";
import { RequestSidebar } from "./RequestSidebar";

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
  }[];
  priority?: "high" | "normal" | "low";
  category?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = parseInt(params.id as string);

  // State management
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [showValidateDialog, setShowValidateDialog] = React.useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = React.useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [photoModalOpen, setPhotoModalOpen] = React.useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const [currentUserId, setCurrentUserId] = React.useState<
    number | undefined
  >();
  const [descriptionExpanded, setDescriptionExpanded] = React.useState(false);

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

  // Handle estimate actions
  const handleAcceptEstimate = async () => {
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
          action: "accept",
        }),
      });

      if (response.ok) {
        await mutate();
        setShowAcceptDialog(false);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error accepting estimate:", error);
      alert("Erreur lors de l'acceptation du devis");
    } finally {
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

  return (
    <div className="bg-white min-h-screen">
      {/* Main Container - Airbnb width */}
      <div className="max-w-7xl mx-auto px-10 lg:px-20 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-[26px] font-semibold text-[#222222] mb-2">
            {request.title || "Demande de service"}
          </h1>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </span>
            <span className="mx-1">·</span>
            <span>{request.location}</span>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="mb-12">
          <HeroGallery
            photos={photos}
            onShowAllPhotos={() => {
              setCurrentPhotoIndex(0);
              setPhotoModalOpen(true);
            }}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-20">
          {/* Left Column - 60% */}
          <div className="lg:col-span-3 space-y-8">
            {/* Section Title */}
            <div>
              <h2 className="text-[22px] font-semibold text-[#222222] mb-2">
                Demande de service : {categoryConfig.type} - {request.location}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  {urgencyConfig.icon}
                  Urgence : {urgencyConfig.label}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Créée {timeAgo}
                </span>
              </div>
            </div>

            <Separator className="border-[#EBEBEB]" />
            {/* Artisan Section */}
            {request.assignedArtisan?.id ? (
              <div>
                <div className="flex items-center gap-4">
                  {request.assignedArtisan.profilePicture ? (
                    <img
                      src={request.assignedArtisan.profilePicture}
                      alt={
                        request.assignedArtisan.firstName &&
                        request.assignedArtisan.lastName
                          ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                          : request.assignedArtisan.name
                      }
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-7 w-7 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-[#222222]">
                      Artisan :{" "}
                      {request.assignedArtisan.firstName &&
                      request.assignedArtisan.lastName
                        ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                        : request.assignedArtisan.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {request.assignedArtisan.specialty || "Artisan"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-7 w-7 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#222222]">
                      En attente d'assignation
                    </h3>
                    <p className="text-sm text-gray-600">
                      Un artisan sera assigné après acceptation du devis
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator className="border-[#EBEBEB]" />

            {/* Info Icons Section */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{categoryConfig.icon}</div>
                <div>
                  <h4 className="font-semibold text-[#222222] mb-1">
                    Type de service
                  </h4>
                  <p className="text-gray-600">{categoryConfig.type}</p>
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
                  <p className="text-gray-600 capitalize">
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
                  <p className="text-gray-600">{request.location}</p>
                </div>
              </div>
            </div>

            <Separator className="border-[#EBEBEB]" />

            {/* Description Section */}
            <div>
              <h3 className="text-[22px] font-semibold text-[#222222] mb-4">
                Description de la demande
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {displayDescription}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  className="mt-2 text-[#222222] font-semibold underline hover:no-underline"
                >
                  {descriptionExpanded ? "Réduire" : "Lire la suite"}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - 40% Sticky Sidebar */}
          <div className="lg:col-span-2">
            <RequestSidebar
              estimate={relevantEstimate}
              requestStatus={request.status}
              createdAt={request.createdAt}
              updatedAt={request.updatedAt}
              onAcceptEstimate={() => setShowAcceptDialog(true)}
              onRejectEstimate={() => setShowRejectDialog(true)}
              onValidateCompletion={() => setShowValidateDialog(true)}
              onDispute={() => setShowDisputeDialog(true)}
              onAddPhotos={() => setShowPhotoUpload(true)}
              isLoading={isLoading}
            />
          </div>
        </div>
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
    </div>
  );
}
