"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import * as React from "react";

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number;
  onSuccess: () => void;
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
  requestId,
  onSuccess,
}: PhotoUploadDialogProps) {
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate total photos (existing + new)
    if (photos.length + files.length > 7) {
      setError("Maximum 7 photos au total");
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name}: Fichier trop lourd (max 5MB)`);
        continue;
      }
      if (
        ![
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ].includes(file.type)
      ) {
        setError(`${file.name}: Format non supporté`);
        continue;
      }
      validFiles.push(file);
    }

    setPhotos([...photos, ...validFiles]);
    setError(null);
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (photos.length + files.length > 7) {
      setError("Maximum 7 photos au total");
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name}: Fichier trop lourd (max 5MB)`);
        return false;
      }
      if (
        ![
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ].includes(file.type)
      ) {
        setError(`${file.name}: Format non supporté`);
        return false;
      }
      return true;
    });

    setPhotos([...photos, ...validFiles]);
    if (validFiles.length > 0) setError(null);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setError(null);
  };

  const handleUpload = async () => {
    if (photos.length === 0) {
      setError("Veuillez sélectionner au moins une photo");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Upload photos to S3
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append("files", photo);
      });

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Erreur lors de l'upload");
      }

      const { photos: photoUrls } = await uploadResponse.json();

      // Step 2: Get current request to append to existing photos
      const requestResponse = await fetch(`/api/service-requests/${requestId}`);
      if (!requestResponse.ok) {
        throw new Error("Erreur lors de la récupération de la demande");
      }

      const requestData = await requestResponse.json();
      const existingPhotos = requestData.photos
        ? JSON.parse(requestData.photos)
        : [];
      const updatedPhotos = [...existingPhotos, ...photoUrls];

      // Step 3: Update request with new photos
      const updateResponse = await fetch(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photos: JSON.stringify(updatedPhotos),
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      // Success!
      setPhotos([]);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setPhotos([]);
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter des photos</DialogTitle>
          <DialogDescription>
            Ajoutez des photos supplémentaires à votre demande (max 7 photos au
            total)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Zone */}
          <div
            className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:bg-gray-50 transition-colors"
            onDrop={handlePhotoDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
          >
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold text-[#FF385C]">
                Cliquez pour télécharger
              </span>{" "}
              ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF jusqu'à 5MB par photo
            </p>
            <Input
              id="photos"
              type="file"
              multiple
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handlePhotoChange}
              disabled={isUploading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {photos.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="object-cover w-full h-24 rounded-lg border border-gray-200"
                    onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                    disabled={isUploading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpload}
            disabled={photos.length === 0 || isUploading}
            className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
          >
            {isUploading
              ? "Upload en cours..."
              : `Ajouter ${photos.length} photo${photos.length > 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
