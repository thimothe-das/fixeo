"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, XCircle } from "lucide-react";

interface PhotoLightboxProps {
  photos: string[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
}

export function PhotoLightbox({
  photos,
  selectedIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  if (selectedIndex === null || !photos) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-full">
        <img
          src={photos[selectedIndex] || "/placeholder.svg"}
          alt={`Photo ${selectedIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />

        <Button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
          size="sm"
        >
          <XCircle className="h-6 w-6" />
        </Button>

        {photos.length > 1 && (
          <>
            <Button
              onClick={() => onNavigate("prev")}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              size="sm"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button
              onClick={() => onNavigate("next")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              size="sm"
            >
              <ArrowLeft className="h-6 w-6 rotate-180" />
            </Button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {selectedIndex + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
}

