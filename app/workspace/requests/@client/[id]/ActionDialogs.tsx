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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import * as React from "react";

interface ActionDialogsProps {
  // Accept/Reject Estimate
  showAcceptDialog: boolean;
  setShowAcceptDialog: (show: boolean) => void;
  showRejectDialog: boolean;
  setShowRejectDialog: (show: boolean) => void;
  estimatePrice?: number;
  onAcceptEstimate: () => Promise<void>;
  onRejectEstimate: (reason: string) => Promise<void>;

  // Validate/Dispute Completion
  showValidateDialog: boolean;
  setShowValidateDialog: (show: boolean) => void;
  showDisputeDialog: boolean;
  setShowDisputeDialog: (show: boolean) => void;
  onValidateCompletion: () => Promise<void>;
  onDispute: (reason: string, details: string) => Promise<void>;

  isLoading?: boolean;
}

const formatPrice = (cents: number): string => {
  return `${(cents / 100).toFixed(2)} €`;
};

export function ActionDialogs({
  showAcceptDialog,
  setShowAcceptDialog,
  showRejectDialog,
  setShowRejectDialog,
  estimatePrice,
  onAcceptEstimate,
  onRejectEstimate,
  showValidateDialog,
  setShowValidateDialog,
  showDisputeDialog,
  setShowDisputeDialog,
  onValidateCompletion,
  onDispute,
  isLoading = false,
}: ActionDialogsProps) {
  const [rejectReason, setRejectReason] = React.useState("");
  const [disputeReason, setDisputeReason] = React.useState("");
  const [disputeDetails, setDisputeDetails] = React.useState("");

  const handleAccept = async () => {
    await onAcceptEstimate();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Veuillez indiquer une raison pour le rejet");
      return;
    }
    await onRejectEstimate(rejectReason);
    setRejectReason("");
  };

  const handleValidate = async () => {
    await onValidateCompletion();
  };

  const handleDispute = async () => {
    if (!disputeReason || !disputeDetails.trim()) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    await onDispute(disputeReason, disputeDetails);
    setDisputeReason("");
    setDisputeDetails("");
  };

  return (
    <>
      {/* Accept Estimate Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Accepter le devis
            </DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'accepter ce devis. Une fois accepté, un
              artisan pourra être assigné à votre demande.
            </DialogDescription>
          </DialogHeader>

          {estimatePrice && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 mb-1">Montant estimé</p>
              <p className="text-2xl font-bold text-green-900">
                {formatPrice(estimatePrice)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "Acceptation..." : "Accepter le devis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Estimate Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Rejeter le devis
            </DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison pour laquelle vous rejetez ce devis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">
                Raison du rejet <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Ex: Prix trop élevé, délai trop long, etc."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading || !rejectReason.trim()}
              variant="destructive"
            >
              {isLoading ? "Rejet..." : "Rejeter le devis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validate Completion Dialog */}
      <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Valider l'intervention
            </DialogTitle>
            <DialogDescription>
              Confirmez-vous que l'intervention a été réalisée de manière
              satisfaisante ?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              En validant cette intervention, vous confirmez que le travail a
              été effectué correctement et selon vos attentes.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowValidateDialog(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleValidate}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "Validation..." : "Valider l'intervention"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Signaler un problème
            </DialogTitle>
            <DialogDescription>
              Décrivez le problème rencontré avec cette intervention. Notre
              équipe examinera votre réclamation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="dispute-reason">
                Type de problème <span className="text-red-500">*</span>
              </Label>
              <Select value={disputeReason} onValueChange={setDisputeReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incomplete">Travail incomplet</SelectItem>
                  <SelectItem value="quality">Problème de qualité</SelectItem>
                  <SelectItem value="damage">Dégâts causés</SelectItem>
                  <SelectItem value="different">
                    Différent de ce qui était prévu
                  </SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dispute-details">
                Détails <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="dispute-details"
                placeholder="Décrivez en détail le problème rencontré..."
                value={disputeDetails}
                onChange={(e) => setDisputeDetails(e.target.value)}
                rows={5}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDisputeDialog(false);
                setDisputeReason("");
                setDisputeDetails("");
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDispute}
              disabled={isLoading || !disputeReason || !disputeDetails.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isLoading ? "Envoi..." : "Signaler le problème"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
