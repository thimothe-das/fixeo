"use client";

import { Image as ImageIcon } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const handlePhotoClick = (photoUrl: string) => {
    window.open(photoUrl, "_blank");
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
        <ImageIcon className="h-4 w-4 mr-2" />
        Photos ({photos.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {photos.map((photoUrl: string, index: number) => (
          <img
            key={index}
            src={photoUrl}
            alt={`Photo ${index + 1}`}
            className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
            onClick={() => handlePhotoClick(photoUrl)}
          />
        ))}
      </div>
    </div>
  );
}
