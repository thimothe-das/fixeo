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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import * as React from "react";
import { toast } from "sonner";

interface EditDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number;
  currentDescription: string;
  onSuccess: () => void;
}

export function EditDescriptionDialog({
  open,
  onOpenChange,
  requestId,
  currentDescription,
  onSuccess,
}: EditDescriptionDialogProps) {
  const [description, setDescription] = React.useState(currentDescription);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset description when dialog opens
  React.useEffect(() => {
    if (open) {
      setDescription(currentDescription);
      setError(null);
    }
  }, [open, currentDescription]);

  const handleSave = async () => {
    if (!description.trim()) {
      setError("Veuillez entrer une description");
      return;
    }

    if (description.trim().length < 10) {
      setError("La description doit contenir au moins 10 caractères");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      toast.success("Description modifiée avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onOpenChange(false);
    }
  };

  const characterCount = description.length;
  const maxCharacters = 2000;
  const isNearLimit = characterCount > maxCharacters * 0.9;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier la description</DialogTitle>
          <DialogDescription>
            Mettez à jour la description de votre demande de service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError(null);
              }}
              placeholder="Décrivez votre demande en détail..."
              className="min-h-[200px] resize-none break-all overflow-auto"
              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
              disabled={isSaving}
              maxLength={maxCharacters}
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Minimum 10 caractères</span>
              <span
                className={`${
                  isOverLimit
                    ? "text-red-600 font-semibold"
                    : isNearLimit
                    ? "text-orange-600"
                    : "text-gray-500"
                }`}
              >
                {characterCount} / {maxCharacters}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !description.trim() || isOverLimit}
            className="bg-fixeo-main-500 hover:bg-fixeo-main-600 text-white"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
