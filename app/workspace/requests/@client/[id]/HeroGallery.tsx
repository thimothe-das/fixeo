"use client";

import { Button } from "@/components/ui/button";
import { Images, Plus, X } from "lucide-react";

interface HeroGalleryProps {
  photos: string[];
  onShowAllPhotos: () => void;
  canEdit?: boolean;
  onAddPhotos?: () => void;
  onDeletePhoto?: (photoUrl: string, index: number) => void;
}

export function HeroGallery({ 
  photos, 
  onShowAllPhotos,
  canEdit = false,
  onAddPhotos,
  onDeletePhoto,
}: HeroGalleryProps) {
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
      <div className="grid grid-cols-2 gap-2 h-[200px] md:h-[300px]">
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
          {canEdit && onDeletePhoto && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePhoto(mainPhoto, 0);
              }}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Supprimer cette photo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
              {canEdit && onDeletePhoto && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePhoto(photo, index + 1);
                  }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Supprimer cette photo"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
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

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {canEdit && onAddPhotos && (
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-gray-50 shadow-md border-gray-800 text-sm font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onAddPhotos();
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter des photos
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="bg-white hover:bg-gray-50 shadow-md border-gray-800 text-sm font-semibold"
          onClick={onShowAllPhotos}
        >
          <Images className="h-4 w-4 mr-2" />
          Afficher toutes les photos
        </Button>
      </div>
    </div>
  );
}
