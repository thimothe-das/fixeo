"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import "moment/locale/fr";
import * as React from "react";

interface DisputeAction {
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
}

interface DisputeDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeAction?: DisputeAction | null;
  actorType?: "client" | "artisan";
  actorName?: string | null;
}

const getDisputeReasonLabel = (reason: string) => {
  const labels: Record<string, string> = {
    // Client dispute reasons
    incomplete: "Travail incomplet",
    quality: "Problème de qualité",
    damage: "Dégâts causés",
    different: "Différent de prévu",
    other: "Autre",
    // Artisan dispute reasons
    price_disagreement: "Désaccord sur le prix",
    scope_change: "Changement de périmètre",
    client_unavailable: "Client indisponible",
    unsafe_conditions: "Conditions dangereuses",
  };
  return labels[reason] || reason;
};

export function DisputeDetailsModal({
  open,
  onOpenChange,
  disputeAction,
  actorType = "client",
  actorName,
}: DisputeDetailsModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);

  if (!disputeAction) {
    return null;
  }

  // Parse photos from additionalData
  const photos = React.useMemo(() => {
    if (!disputeAction?.additionalData) return [];
    try {
      const data = JSON.parse(disputeAction.additionalData);
      return data.photos || data.disputePhotos || [];
    } catch (e) {
      console.error("Error parsing dispute photos:", e);
      return [];
    }
  }, [disputeAction]);

  const formattedDate = moment(disputeAction.createdAt)
    .locale("fr")
    .format("LL [à] HH:mm");

  const actorDisplayName = disputeAction.actor?.name || actorName || (actorType === "artisan" ? "L'artisan" : "Le client");

  // Color scheme based on actor type
  const isArtisan = actorType === "artisan";
  const colorScheme = {
    bg: isArtisan ? "bg-red-50" : "bg-blue-50",
    border: isArtisan ? "border-red-200" : "border-blue-200",
    titleText: isArtisan ? "text-red-900" : "text-blue-900",
    iconColor: isArtisan ? "text-red-600" : "text-blue-600",
    labelText: isArtisan ? "text-red-900" : "text-blue-900",
    detailText: isArtisan ? "text-red-800" : "text-blue-800",
    metaText: isArtisan ? "text-red-700" : "text-blue-700",
    metaBorder: isArtisan ? "border-red-100" : "border-blue-100",
    noticeBg: isArtisan ? "bg-red-100" : "bg-blue-100",
    noticeText: isArtisan ? "text-red-900" : "text-blue-900",
  };

  const Icon = isArtisan ? AlertTriangle : AlertCircle;
  const title = isArtisan ? "Détails du litige de l'artisan" : "Détails de votre contestation";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${colorScheme.titleText}`}>
            <Icon className={`h-5 w-5 ${colorScheme.iconColor}`} />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Dispute Details */}
          <div className={`${colorScheme.bg} rounded-lg p-4 border-2 ${colorScheme.border}`}>
            <div className="grid gap-3 text-sm">
              <div>
                <span className={`font-semibold ${colorScheme.labelText}`}>Raison:</span>{" "}
                <span className={colorScheme.detailText}>
                  {getDisputeReasonLabel(disputeAction.disputeReason)}
                </span>
              </div>
              <div>
                <span className={`font-semibold ${colorScheme.labelText}`}>Détails:</span>
                <p className={`mt-1 ${colorScheme.detailText} leading-relaxed`}>
                  {disputeAction.disputeDetails}
                </p>
              </div>
              <div className={`text-xs ${colorScheme.metaText} pt-2 border-t ${colorScheme.metaBorder}`}>
                Contesté par {actorDisplayName} le {formattedDate}
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div className={`${colorScheme.bg} rounded-lg p-4 border-2 ${colorScheme.border}`}>
              <h4 className={`text-sm font-semibold ${colorScheme.labelText} mb-3`}>
                Photos jointes ({photos.length})
              </h4>
              
              {/* Main Photo Display */}
              <div className="relative mb-3">
                <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photos[currentPhotoIndex]}
                    alt={`Photo de contestation ${currentPhotoIndex + 1}`}
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </div>

                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentPhotoIndex((prev) =>
                          prev === 0 ? photos.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPhotoIndex((prev) =>
                          prev === photos.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Photo Counter */}
                {photos.length > 1 && (
                  <div className="text-center text-sm text-gray-600 mt-2">
                    Photo {currentPhotoIndex + 1} sur {photos.length}
                  </div>
                )}
              </div>

              {/* Photo Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 justify-center flex-wrap">
                  {photos.map((photo: string, index: number) => (
                    <button
                      key={index}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                        index === currentPhotoIndex
                          ? isArtisan 
                            ? "border-red-600 ring-2 ring-red-200"
                            : "border-blue-600 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-400"
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
              )}
            </div>
          )}

          {/* Info Notice */}
          <div className={`p-3 ${colorScheme.noticeBg} rounded-lg`}>
            <p className={`text-sm ${colorScheme.noticeText} font-medium`}>
              {isArtisan ? (
                <>⚠️ Action requise : Veuillez résoudre cette contestation avec l'artisan ou prendre les mesures appropriées.</>
              ) : (
                <>ℹ️ Notre équipe examine votre demande et vous contactera dans les plus brefs délais pour résoudre le problème.</>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

