"use client";

import { AddressAutocomplete, AddressData } from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as React from "react";
import { toast } from "sonner";

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number;
  currentLocation: string;
  onSuccess: () => void;
}

export function EditLocationDialog({
  open,
  onOpenChange,
  requestId,
  currentLocation,
  onSuccess,
}: EditLocationDialogProps) {
  const [location, setLocation] = React.useState(currentLocation);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset location when dialog opens
  React.useEffect(() => {
    if (open) {
      setLocation(currentLocation);
      setError(null);
    }
  }, [open, currentLocation]);

  const handleAddressChange = (addressData: AddressData | null, rawValue: string) => {
    // Use the label if address is selected, otherwise use raw input value
    setLocation(addressData?.label || rawValue);
    setError(null);
  };

  const handleSave = async () => {
    if (!location.trim()) {
      setError("Veuillez entrer une adresse");
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
          location: location.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      toast.success("Adresse modifiée avec succès");
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'adresse</DialogTitle>
          <DialogDescription>
            Mettez à jour l'adresse de votre demande de service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <AddressAutocomplete
            label="Adresse"
            placeholder="Entrez votre adresse..."
            value={location}
            onChange={handleAddressChange}
            required
            disabled={isSaving}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !location.trim()}
            className="bg-fixeo-main-500 hover:bg-fixeo-main-600 text-white"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

