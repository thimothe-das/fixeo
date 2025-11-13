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
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface QuoteRejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: number;
  estimatedPrice: number;
  onSuccess: () => void;
}

export function QuoteRejectionDialog({
  open,
  onOpenChange,
  estimateId,
  estimatedPrice,
  onSuccess,
}: QuoteRejectionDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (reason.trim().length < 50) {
      setError("La raison doit contenir au moins 50 caractères");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/artisan/billing-estimates/${estimateId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: reason.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du rejet du devis");
      }

      // Success
      setReason("");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Rejeter le devis
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de rejeter le devis de{" "}
            <span className="font-semibold">
              {(estimatedPrice / 100).toFixed(2)} €
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Consequences warning */}
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
            <h4 className="font-semibold text-orange-900 mb-2">
              ⚠️ Conséquences du rejet
            </h4>
            <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
              <li>
                L'administrateur sera notifié et devra créer un devis révisé
              </li>
              <li>Le client devra accepter le nouveau devis</li>
              <li>
                Si le client refuse le devis révisé, la demande sera annulée
              </li>
              <li>
                Si vous refusez le devis révisé après acceptation du client, la
                demande sera réassignée à un autre artisan
              </li>
            </ul>
          </div>

          {/* Reason input */}
          <div className="space-y-2">
            <label
              htmlFor="rejection-reason"
              className="text-sm font-medium text-gray-700"
            >
              Raison du rejet <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500">
              Expliquez en détail pourquoi le travail nécessite plus de
              ressources que prévu (minimum 50 caractères)
            </p>
            <Textarea
              id="rejection-reason"
              placeholder="Exemple: Après inspection, j'ai découvert que le problème d'électricité implique également un remplacement complet du tableau électrique qui n'était pas visible initialement. Cela nécessite..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              rows={6}
              className="resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 text-right">
              {reason.length} / 50 caractères minimum
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || reason.trim().length < 50}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? "Envoi en cours..." : "Rejeter le devis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
