import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from "lucide-react";
import * as React from "react";

interface PhotosStripProps {
  photos: string[];
  maxDisplay?: number;
}

export default function PhotosStrip({
  photos,
  maxDisplay = 3,
}: PhotosStripProps) {
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

  return (
    <>
      <div className="flex gap-2">
        {displayedPhotos.map((photo, index) => (
          <div key={index} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openLightbox(index);
              }}
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
        <AlertDialogContent
          className="max-w-4xl p-0"
          onClick={(e) => e.stopPropagation()}
        >
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
