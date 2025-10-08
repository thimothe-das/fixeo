"use client";

import { Button } from "@/components/ui/button";
import { Images } from "lucide-react";

interface HeroGalleryProps {
  photos: string[];
  onShowAllPhotos: () => void;
}

export function HeroGallery({ photos, onShowAllPhotos }: HeroGalleryProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="relative w-full h-[400px] bg-gray-100 flex items-center justify-center rounded-xl">
        <div className="text-center">
          <Images className="h-16 w-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune photo disponible</p>
        </div>
      </div>
    );
  }

  // Airbnb-style grid: 1 large photo + 4 small photos
  const mainPhoto = photos[0];
  const sidePhotos = photos.slice(1, 5);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="grid grid-cols-2 gap-2 h-[400px] md:h-[480px]">
        {/* Main Photo - Left side (50%) */}
        <div
          className="relative overflow-hidden rounded-l-xl cursor-pointer group"
          onClick={onShowAllPhotos}
        >
          <img
            src={mainPhoto}
            alt="Photo principale"
            className="w-full h-full object-cover group-hover:brightness-90 transition-all"
          />
        </div>

        {/* Side Photos Grid - Right side (50%), 2x2 grid */}
        <div className="grid grid-cols-2 gap-2">
          {sidePhotos.map((photo, index) => (
            <div
              key={index}
              className={`relative overflow-hidden cursor-pointer group ${
                index === 1 ? "rounded-tr-xl" : ""
              } ${index === 3 ? "rounded-br-xl" : ""}`}
              onClick={onShowAllPhotos}
            >
              <img
                src={photo}
                alt={`Photo ${index + 2}`}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              />
            </div>
          ))}
          {/* Fill empty spots if less than 4 side photos */}
          {sidePhotos.length < 4 &&
            Array.from({ length: 4 - sidePhotos.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className={`bg-gray-100 ${
                  sidePhotos.length + index === 1 ? "rounded-tr-xl" : ""
                } ${sidePhotos.length + index === 3 ? "rounded-br-xl" : ""}`}
              />
            ))}
        </div>
      </div>

      {/* Show All Photos Button */}
      <Button
        variant="outline"
        size="sm"
        className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 shadow-md border-gray-800 text-sm font-semibold"
        onClick={onShowAllPhotos}
      >
        <Images className="h-4 w-4 mr-2" />
        Afficher toutes les photos
      </Button>
    </div>
  );
}
