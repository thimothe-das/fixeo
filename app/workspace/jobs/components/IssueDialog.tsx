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
import { cn } from "@/lib/utils";
import { AlertTriangle, Camera, XCircle } from "lucide-react";
import { useState } from "react";

interface IssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completionType: "issue" | "impossible";
  onSubmit: (issueType: string, notes: string, photos: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export function IssueDialog({
  open,
  onOpenChange,
  completionType,
  onSubmit,
  isSubmitting,
}: IssueDialogProps) {
  const [issueType, setIssueType] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);

  const handleSubmit = async () => {
    await onSubmit(issueType, completionNotes, completionPhotos);
    setIssueType("");
    setCompletionNotes("");
    setCompletionPhotos([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {completionType === "impossible" ? (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Mission impossible à réaliser
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Signaler un problème
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {completionType === "impossible"
              ? "Indiquez pourquoi la mission ne peut pas être réalisée."
              : "Décrivez le problème rencontré. Le client sera notifié."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Type de problème
            </label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type de problème" />
              </SelectTrigger>
              <SelectContent>
                {completionType === "impossible" ? (
                  <>
                    <SelectItem value="access_denied">
                      Accès refusé sur site
                    </SelectItem>
                    <SelectItem value="missing_materials">
                      Matériaux/outils manquants
                    </SelectItem>
                    <SelectItem value="safety_concern">
                      Problème de sécurité
                    </SelectItem>
                    <SelectItem value="structural_issue">
                      Problème structurel découvert
                    </SelectItem>
                    <SelectItem value="client_unavailable">
                      Client indisponible
                    </SelectItem>
                    <SelectItem value="weather_conditions">
                      Conditions météorologiques
                    </SelectItem>
                    <SelectItem value="other">Autre raison</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="partial_completion">
                      Travail partiellement terminé
                    </SelectItem>
                    <SelectItem value="quality_issue">
                      Problème de qualité
                    </SelectItem>
                    <SelectItem value="additional_work_needed">
                      Travaux supplémentaires nécessaires
                    </SelectItem>
                    <SelectItem value="material_damage">
                      Dommage matériel découvert
                    </SelectItem>
                    <SelectItem value="client_request_change">
                      Demande de modification client
                    </SelectItem>
                    <SelectItem value="other">Autre problème</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Description détaillée *
            </label>
            <Textarea
              placeholder="Décrivez en détail le problème rencontré..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Photos justificatives (recommandé)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Ajoutez des photos du problème
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
            disabled={isSubmitting || !issueType || !completionNotes.trim()}
            className={cn(
              "bg-orange-600 hover:bg-orange-700 text-white",
              completionType === "impossible" && "bg-red-600 hover:bg-red-700"
            )}
          >
            {isSubmitting ? "En cours..." : "Signaler le problème"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

