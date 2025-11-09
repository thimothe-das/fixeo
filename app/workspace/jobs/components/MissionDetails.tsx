"use client";

import { AlertCircle, Camera, Eye, MapPin } from "lucide-react";

interface MissionDetailsProps {
  location: string;
  description?: string;
  notes?: string;
  photos: string[];
  onPhotoClick: (index: number) => void;
}

export function MissionDetails({
  location,
  description,
  notes,
  photos,
  onPhotoClick,
}: MissionDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Location with Google Maps */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-600" />
          Localisation
        </h3>

        {/* Address */}
        <p className="text-gray-700 mb-3 text-sm">{location}</p>

        {/* Google Maps Embed */}
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              location || ""
            )}&output=embed`}
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
        {description ? (
          <p className="text-gray-500 leading-relaxed">{description}</p>
        ) : (
          <p className="text-gray-400 italic leading-relaxed">
            Aucune description fournie
          </p>
        )}
        {notes && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 text-sm">
                  Notes importantes
                </p>
                <p className="text-sm text-amber-700 mt-1">{notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photos */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Camera className="h-4 w-4 text-gray-600" />
          Photos ({photos?.length || 0})
        </h3>
        {photos && photos.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo: string, index: number) => (
              <div key={index} className="group relative aspect-square">
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-200 cursor-pointer transition-all group-hover:scale-105"
                  onClick={() => onPhotoClick(index)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Aucune photo disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}

