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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  RejectEstimateType,
  rejectEstimateSchema,
} from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

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
  const [disputeReason, setDisputeReason] = React.useState("");
  const [disputeDetails, setDisputeDetails] = React.useState("");

  // React Hook Form for rejection
  const {
    control: rejectControl,
    handleSubmit: handleRejectSubmit,
    reset: resetRejectForm,
    formState: { errors: rejectErrors },
  } = useForm<RejectEstimateType>({
    resolver: zodResolver(rejectEstimateSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleAccept = async () => {
    await onAcceptEstimate();
  };

  const handleReject = async (data: RejectEstimateType) => {
    await onRejectEstimate(data.reason);
    resetRejectForm();
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
              Accepter le devis et payer l'acompte
            </DialogTitle>
            <DialogDescription>Paiement par Stripe</DialogDescription>
          </DialogHeader>

          {estimatePrice && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Montant total estimé
                    </span>
                    <span className="text-lg font-semibold">
                      {formatPrice(estimatePrice)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Acompte requis (30%)
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(Math.round(estimatePrice * 0.3))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Solde restant (70%)
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(Math.round(estimatePrice * 0.7))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 flex items-center gap-2">
                  <Info className="h-4 w-4 mr-1 shrink-0" />
                  <span>
                    Le solde sera débité automatiquement lors de la validation
                    de l'intervention par les deux parties.
                  </span>
                </p>
              </div>
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
              {isLoading ? "Traitement..." : "Payer l'acompte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Estimate Dialog */}
      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open);
          if (!open) {
            resetRejectForm();
          }
        }}
      >
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

          <form onSubmit={handleRejectSubmit(handleReject)}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reject-reason">
                  Raison du rejet <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={rejectControl}
                  name="reason"
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Textarea
                        {...field}
                        id="reject-reason"
                        placeholder="Ex: Prix trop élevé, délai trop long, etc."
                        rows={4}
                        className="mt-1"
                      />
                      {error && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  resetRejectForm();
                }}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? "Rejet..." : "Rejeter le devis"}
              </Button>
            </DialogFooter>
          </form>
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
