"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ValidationAction } from "@/app/workspace/components/types";
import { CheckCircle, ChevronLeft, ChevronRight, User } from "lucide-react";
import moment from "moment";
import "moment/locale/fr";
import * as React from "react";

interface ClientValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationAction?: ValidationAction | null;
  clientName?: string;
}

export function ClientValidationModal({
  open,
  onOpenChange,
  validationAction,
  clientName,
}: ClientValidationModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);

  // Parse photos from additionalData
  const photos = React.useMemo(() => {
    if (!validationAction?.additionalData) return [];
    try {
      const data = JSON.parse(validationAction.additionalData);
      return data.photos || [];
    } catch (e) {
      console.error("Error parsing validation photos:", e);
      return [];
    }
  }, [validationAction]);

  // Reset photo index when modal opens
  React.useEffect(() => {
    if (open) {
      setCurrentPhotoIndex(0);
    }
  }, [open]);

  if (!validationAction) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              Validation du client
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-[#717171] text-lg">
              Aucune validation disponible pour le moment
            </p>
            <p className="text-sm text-[#717171] mt-2">
              Le client n'a pas encore validé l'intervention
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formattedDate = moment(validationAction.timestamp)
    .locale("fr")
    .format("LL [à] HH:mm");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            Validation du client
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Client Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#EBEBEB]">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-[#222222]">
                {clientName || validationAction.actor?.name || "Client"}
              </p>
              <p className="text-sm text-[#717171]">{formattedDate}</p>
            </div>
          </div>

          {/* Description */}
          {validationAction.validationNotes && (
            <div>
              <h3 className="text-lg font-semibold text-[#222222] mb-3">
                Commentaires de validation
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-[#222222] leading-relaxed whitespace-pre-wrap">
                  {validationAction.validationNotes}
                </p>
              </div>
            </div>
          )}

          {/* Photos Section */}
          {photos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#222222]">
                  Photos de validation
                </h3>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {photos.length} photo{photos.length > 1 ? "s" : ""}
                </Badge>
              </div>

              {/* Main Photo Display */}
              <div className="relative">
                <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={photos[currentPhotoIndex]}
                    alt={`Photo de validation ${currentPhotoIndex + 1}`}
                    className="max-w-full max-h-[500px] object-contain"
                  />
                </div>

                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-10 w-10"
                      onClick={() =>
                        setCurrentPhotoIndex((prev) =>
                          prev === 0 ? photos.length - 1 : prev - 1
                        )
                      }
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-10 w-10"
                      onClick={() =>
                        setCurrentPhotoIndex((prev) =>
                          prev === photos.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Photo Counter */}
                {photos.length > 1 && (
                  <div className="text-center text-sm text-[#717171] mb-4">
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
                      className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                        index === currentPhotoIndex
                          ? "border-blue-600 ring-2 ring-blue-200"
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

          {/* No Photos Message */}
          {photos.length === 0 && (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-[#EBEBEB]">
              <p className="text-[#717171]">Aucune photo disponible</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

