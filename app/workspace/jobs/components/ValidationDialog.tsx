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
import { Textarea } from "@/components/ui/textarea";
import { ServiceRequestStatus } from "@/lib/db/schema";
import {
  validationFormSchema,
  type ValidationFormType,
} from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ThumbsUp, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import type { ServiceRequestForArtisan } from "@/app/workspace/components/types";

interface ValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: ServiceRequestForArtisan;
  onSubmit: (data: ValidationFormType) => Promise<void>;
  isSubmitting: boolean;
}

export function ValidationDialog({
  open,
  onOpenChange,
  mission,
  onSubmit,
  isSubmitting,
}: ValidationDialogProps) {
  const validationForm = useForm<ValidationFormType>({
    resolver: zodResolver(validationFormSchema),
    defaultValues: {
      notes: "",
      photos: [],
    },
  });

  const handleValidationPhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    const currentPhotos = validationForm.getValues("photos") || [];
    validationForm.setValue("photos", [...currentPhotos, ...files], {
      shouldValidate: true,
    });
  };

  const removeValidationPhoto = (index: number) => {
    const currentPhotos = validationForm.getValues("photos") || [];
    validationForm.setValue(
      "photos",
      currentPhotos.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleSubmit = async () => {
    const isValid = await validationForm.trigger();
    if (!isValid) return;

    const data = validationForm.getValues();
    await onSubmit(data);
    validationForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-600" />
            Valider la mission
          </DialogTitle>
          <DialogDescription>
            Décrivez le travail effectué et ajoutez des photos de la mission
            terminée.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Description du travail effectué *
            </label>
            <Textarea
              placeholder="Décrivez le travail réalisé, les matériaux utilisés, etc..."
              {...validationForm.register("notes")}
              rows={4}
              className={
                validationForm.formState.errors.notes ? "border-red-500" : ""
              }
            />
            {validationForm.formState.errors.notes && (
              <p className="text-sm text-red-600 mt-1">
                {validationForm.formState.errors.notes.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Photos du travail terminé * (minimum 1 photo)
            </label>

            {/* Photo previews */}
            {validationForm.watch("photos") &&
              validationForm.watch("photos").length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {validationForm
                    .watch("photos")
                    .map((photo: File, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeValidationPhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {photo.name}
                        </p>
                      </div>
                    ))}
                </div>
              )}

            {/* Photo upload button */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleValidationPhotoUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    Cliquez pour ajouter des photos
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {validationForm.watch("photos")?.length || 0}/10 photos •
                    JPEG, PNG, GIF, WebP (max 5MB)
                  </p>
                </div>
              </label>
            </div>
            {validationForm.formState.errors.photos && (
              <p className="text-sm text-red-600 mt-1">
                {validationForm.formState.errors.photos.message}
              </p>
            )}
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ℹ️ Information
            </p>
            <p className="text-xs text-green-600 mt-1">
              {mission?.status === ServiceRequestStatus.CLIENT_VALIDATED
                ? "Les deux parties auront validé. La mission sera marquée comme terminée."
                : "Le client sera notifié de votre validation et devra également valider pour finaliser la mission."}
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? "En cours..." : "Confirmer la validation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

