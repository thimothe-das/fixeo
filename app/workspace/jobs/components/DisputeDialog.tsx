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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  disputeFormSchema,
  type DisputeFormType,
} from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ThumbsDown, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import type { ServiceRequestForArtisan } from "@/app/workspace/components/types";

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: ServiceRequestForArtisan;
  onSubmit: (data: DisputeFormType) => Promise<void>;
  isSubmitting: boolean;
}

export function DisputeDialog({
  open,
  onOpenChange,
  mission,
  onSubmit,
  isSubmitting,
}: DisputeDialogProps) {
  const disputeForm = useForm<DisputeFormType>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      disputeReason: "",
      disputeDetails: "",
      photos: [],
    },
  });

  const handleDisputePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentPhotos = disputeForm.getValues("photos") || [];
    disputeForm.setValue("photos", [...currentPhotos, ...files], {
      shouldValidate: true,
    });
  };

  const removeDisputePhoto = (index: number) => {
    const currentPhotos = disputeForm.getValues("photos") || [];
    disputeForm.setValue(
      "photos",
      currentPhotos.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleSubmit = async () => {
    const isValid = await disputeForm.trigger();
    if (!isValid) return;

    const data = disputeForm.getValues();
    await onSubmit(data);
    disputeForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsDown className="h-5 w-5 text-red-600" />
            Contester la mission
          </DialogTitle>
          <DialogDescription>
            Signalez un problème avec cette mission.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Motif du litige *
            </label>
            <Select
              value={disputeForm.watch("disputeReason")}
              onValueChange={(value) =>
                disputeForm.setValue("disputeReason", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le motif principal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client_no_show">Client absent</SelectItem>
                <SelectItem value="payment_issue">
                  Problème de paiement
                </SelectItem>
                <SelectItem value="scope_disagreement">
                  Désaccord sur les travaux
                </SelectItem>
                <SelectItem value="safety_concern">
                  Problème de sécurité
                </SelectItem>
                <SelectItem value="client_behavior">
                  Comportement inapproprié du client
                </SelectItem>
                <SelectItem value="additional_work_requested">
                  Travaux supplémentaires demandés
                </SelectItem>
                <SelectItem value="access_denied">Accès refusé</SelectItem>
                <SelectItem value="other">Autre problème</SelectItem>
              </SelectContent>
            </Select>
            {disputeForm.formState.errors.disputeReason && (
              <p className="text-sm text-red-600 mt-1">
                {disputeForm.formState.errors.disputeReason.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Description détaillée *
            </label>
            <Textarea
              placeholder="Décrivez précisément le problème rencontré..."
              {...disputeForm.register("disputeDetails")}
              rows={4}
            />
            {disputeForm.formState.errors.disputeDetails && (
              <p className="text-sm text-red-600 mt-1">
                {disputeForm.formState.errors.disputeDetails.message}
              </p>
            )}
          </div>

          {/* Photo upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Photos justificatives (optionnel)
            </label>

            {/* Show photo previews */}
            {disputeForm.watch("photos") &&
              disputeForm.watch("photos")!.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {disputeForm
                    .watch("photos")!
                    .map((photo: File, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeDisputePhoto(index)}
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-red-500 transition-colors">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleDisputePhotoUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    Cliquez pour ajouter des photos
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {disputeForm.watch("photos")?.length || 0}/10 photos • JPEG,
                    PNG, GIF, WebP (max 5MB)
                  </p>
                </div>
              </label>
            </div>
            {disputeForm.formState.errors.photos && (
              <p className="text-sm text-red-600 mt-1">
                {disputeForm.formState.errors.photos.message}
              </p>
            )}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700 font-medium">⚠️ Attention</p>
            <p className="text-xs text-amber-600 mt-1">
              Un litige sera ouvert et notre équipe examinera la situation. Le
              paiement sera suspendu en attendant la résolution.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !disputeForm.watch("disputeReason") ||
              !disputeForm.watch("disputeDetails")?.trim()
            }
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "En cours..." : "Signaler le problème"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

