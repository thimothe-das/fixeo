"use client";

import { Button } from "@/components/ui/button";
import { Image as ImageIcon, ZoomIn } from "lucide-react";
import { useState } from "react";

interface PhotoGalleryProps {
  photos: string[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
          <ImageIcon className="h-4 w-4 mr-2" />
          Photos ({photos.length})
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, 6).map((photoUrl, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={photoUrl}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto(photoUrl)}
              />
              {photos.length > 6 && index === 5 && (
                <div
                  className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center cursor-pointer"
                  onClick={() => setSelectedPhoto(photoUrl)}
                >
                  <span className="text-white text-sm font-medium">
                    +{photos.length - 6}
                  </span>
                </div>
              )}
              <div className="absolute top-1 right-1 bg-black/50 rounded-md p-1">
                <ZoomIn className="h-3 w-3 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto}
              alt="Photo agrandie"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="secondary"
              className="absolute top-4 right-4"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
