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
import { Label } from "@/components/ui/label";
import * as React from "react";
import { toast } from "sonner";

interface EditTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number;
  currentTitle: string;
  onSuccess: () => void;
}

export function EditTitleDialog({
  open,
  onOpenChange,
  requestId,
  currentTitle,
  onSuccess,
}: EditTitleDialogProps) {
  const [title, setTitle] = React.useState(currentTitle);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset title when dialog opens
  React.useEffect(() => {
    if (open) {
      setTitle(currentTitle);
      setError(null);
    }
  }, [open, currentTitle]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Veuillez entrer un titre");
      return;
    }

    if (title.trim().length < 5) {
      setError("Le titre doit contenir au moins 5 caractères");
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
          title: title.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      toast.success("Titre modifié avec succès");
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

  const characterCount = title.length;
  const maxCharacters = 100;
  const isNearLimit = characterCount > maxCharacters * 0.9;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le titre</DialogTitle>
          <DialogDescription>
            Mettez à jour le titre de votre demande de service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder="Ex: Réparation fuite d'eau..."
              className="break-words"
              disabled={isSaving}
              maxLength={maxCharacters}
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Minimum 5 caractères</span>
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
            disabled={isSaving || !title.trim() || isOverLimit}
            className="bg-fixeo-main-500 hover:bg-fixeo-main-600 text-white"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

