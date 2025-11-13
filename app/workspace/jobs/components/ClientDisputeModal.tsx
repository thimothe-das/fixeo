"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
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

interface ClientDisputeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeActions?: DisputeAction[];
  clientName?: string | null;
}

const getDisputeReasonLabel = (reason: string) => {
  const labels: Record<string, string> = {
    incomplete: "Travail incomplet",
    quality: "Problème de qualité",
    damage: "Dégâts causés",
    different: "Différent de prévu",
    other: "Autre",
  };
  return labels[reason] || reason;
};

export function ClientDisputeModal({
  open,
  onOpenChange,
  disputeActions,
  clientName,
}: ClientDisputeModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const [showPhotos, setShowPhotos] = React.useState(false);

  if (!disputeActions || disputeActions.length === 0) {
    return null;
  }

  // Get the latest dispute action
  const latestDispute = disputeActions[0];

  // Parse photos from additionalData
  const photos = React.useMemo(() => {
    if (!latestDispute?.additionalData) return [];
    try {
      const data = JSON.parse(latestDispute.additionalData);
      return data.photos || [];
    } catch (e) {
      console.error("Error parsing dispute photos:", e);
      return [];
    }
  }, [latestDispute]);

  const formattedDate = moment(latestDispute.createdAt)
    .locale("fr")
    .format("LL [à] HH:mm");

  const actorName = latestDispute.actor?.name || clientName || "Le client";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Contestation par le client
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Dispute Details */}
          <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
            <div className="grid gap-3 text-sm">
              <div>
                <span className="font-semibold text-red-900">Raison:</span>{" "}
                <span className="text-red-800">
                  {getDisputeReasonLabel(latestDispute.disputeReason)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-red-900">Détails:</span>
                <p className="mt-1 text-red-800 leading-relaxed">
                  {latestDispute.disputeDetails}
                </p>
              </div>
              <div className="text-xs text-red-700 pt-2 border-t border-red-100">
                Contesté par {actorName} le {formattedDate}
              </div>
            </div>
          </div>

          {/* Photos Section */}
          {photos.length > 0 && (
            <div>
              <button
                onClick={() => setShowPhotos(!showPhotos)}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-medium transition-colors text-sm"
              >
                <AlertTriangle className="h-4 w-4" />
                {showPhotos ? "Masquer" : "Voir"} les photos de la
                contestation ({photos.length})
              </button>

              {showPhotos && (
                <div className="mt-3 bg-white rounded-lg p-4 border-2 border-red-200">
                  {/* Main Photo Display */}
                  <div className="relative mb-3">
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={photos[currentPhotoIndex]}
                        alt={`Photo de contestation ${
                          currentPhotoIndex + 1
                        }`}
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
                              ? "border-red-600 ring-2 ring-red-200"
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
            </div>
          )}

          {/* Action Notice */}
          <div className="p-3 bg-red-100 rounded-lg">
            <p className="text-sm text-red-900 font-medium">
              ⚠️ Action requise : Veuillez résoudre cette contestation avec le
              client ou contacter un administrateur.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

