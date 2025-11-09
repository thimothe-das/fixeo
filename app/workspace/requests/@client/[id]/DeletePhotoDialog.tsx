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
import { AlertCircle } from "lucide-react";
import * as React from "react";

interface DeletePhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoUrl: string | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeletePhotoDialog({
  open,
  onOpenChange,
  photoUrl,
  onConfirm,
  isDeleting,
}: DeletePhotoDialogProps) {
  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Supprimer cette photo
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette photo ? Cette action est
            irréversible.
          </DialogDescription>
        </DialogHeader>

        {photoUrl && (
          <div className="py-4">
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={photoUrl}
                alt="Photo à supprimer"
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

