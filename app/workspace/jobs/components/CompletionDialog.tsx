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
import { Camera, CheckCircle } from "lucide-react";
import { useState } from "react";

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completionType: "success" | "validate";
  onSubmit: (notes: string, photos: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export function CompletionDialog({
  open,
  onOpenChange,
  completionType,
  onSubmit,
  isSubmitting,
}: CompletionDialogProps) {
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);

  const handleSubmit = async () => {
    await onSubmit(completionNotes, completionPhotos);
    setCompletionNotes("");
    setCompletionPhotos([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {completionType === "validate"
              ? "Valider la mission"
              : "Mission terminée avec succès"}
          </DialogTitle>
          <DialogDescription>
            {completionType === "validate"
              ? "Confirmez que vous validez cette mission comme correctement réalisée."
              : "Confirmez que la mission a été réalisée avec succès. Le client sera notifié pour validation."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Notes de fin de mission (optionnel)
            </label>
            <Textarea
              placeholder="Décrivez brièvement ce qui a été réalisé..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Photos de fin de mission (optionnel)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Ajoutez des photos du travail terminé
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting
              ? "En cours..."
              : completionType === "validate"
              ? "Confirmer la validation"
              : "Confirmer la fin de mission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

