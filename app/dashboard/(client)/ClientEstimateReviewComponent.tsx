"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calculator,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
} from "lucide-react";
import type {
  BillingEstimateForClient,
  BillingEstimateBreakdownItem,
} from "../components/types";

interface ClientEstimateReviewComponentProps {
  estimate: BillingEstimateForClient;
  onResponse: (
    estimateId: number,
    action: "accept" | "reject",
    response?: string
  ) => Promise<void>;
  isLoading?: boolean;
}

export function ClientEstimateReviewComponent({
  estimate,
  onResponse,
  isLoading = false,
}: ClientEstimateReviewComponentProps) {
  const [response, setResponse] = useState("");
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente de réponse";
      case "accepted":
        return "Accepté";
      case "rejected":
        return "Refusé";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };

  const isExpired =
    estimate.validUntil && new Date(estimate.validUntil) < new Date();
  const canRespond = estimate.status === "pending" && !isExpired;

  const breakdown: BillingEstimateBreakdownItem[] = estimate.breakdown
    ? JSON.parse(estimate.breakdown)
    : [];

  const handleAccept = async () => {
    await onResponse(estimate.id, "accept", response.trim() || undefined);
    setShowAcceptDialog(false);
    setResponse("");
  };

  const handleReject = async () => {
    await onResponse(estimate.id, "reject", response.trim() || undefined);
    setShowRejectDialog(false);
    setResponse("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Devis #{estimate.id}
            </CardTitle>
            <CardDescription>
              Pour la demande: {estimate.serviceRequest?.serviceType}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(estimate.status)}>
            {getStatusLabel(estimate.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Service Request Details */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Détails de la demande
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{estimate.serviceRequest?.location}</span>
            </div>
            <p className="text-sm text-gray-700">
              {estimate.serviceRequest?.description}
            </p>
          </div>
        </div>

        {/* Estimate Details */}
        <div className="space-y-3">
          <h4 className="font-medium">Description du devis</h4>
          <p className="text-gray-700">{estimate.description}</p>
        </div>

        {/* Cost Breakdown */}
        {breakdown.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Détail des coûts</h4>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                <span>Description</span>
                <span className="text-center">Quantité</span>
                <span className="text-center">Prix unitaire</span>
                <span className="text-center">Total</span>
              </div>
              {breakdown.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-3 grid grid-cols-4 gap-4 text-sm border-t"
                >
                  <span>{item.description}</span>
                  <span className="text-center">{item.quantity}</span>
                  <span className="text-center">
                    {(item.unitPrice / 100).toFixed(2)} €
                  </span>
                  <span className="text-center font-medium">
                    {(item.total / 100).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Price */}
        <div className="flex justify-end">
          <div className="bg-blue-50 p-4 rounded-lg text-right">
            <div className="text-sm text-gray-600">Prix total</div>
            <div className="text-2xl font-bold text-blue-600">
              {(estimate.estimatedPrice / 100).toFixed(2)} €
            </div>
          </div>
        </div>

        {/* Validity Date */}
        {estimate.validUntil && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>
              Valable jusqu'au{" "}
              {new Date(estimate.validUntil).toLocaleDateString("fr-FR")}
            </span>
            {isExpired && (
              <Badge variant="destructive" className="ml-2">
                Expiré
              </Badge>
            )}
          </div>
        )}

        {/* Expiration Warning */}
        {canRespond && estimate.validUntil && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Attention</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Ce devis expire le{" "}
              {new Date(estimate.validUntil).toLocaleDateString("fr-FR")}.
              Veuillez répondre avant cette date.
            </p>
          </div>
        )}

        {/* Client Response (if already responded) */}
        {estimate.clientResponse && (
          <div className="space-y-2">
            <h4 className="font-medium">Votre réponse</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">{estimate.clientResponse}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {canRespond && (
          <div className="flex gap-3 pt-4 border-t">
            <AlertDialog
              open={showAcceptDialog}
              onOpenChange={setShowAcceptDialog}
            >
              <AlertDialogTrigger asChild>
                <Button className="flex-1" disabled={isLoading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accepter le devis
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Accepter le devis</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vous êtes sur le point d'accepter ce devis de{" "}
                    {(estimate.estimatedPrice / 100).toFixed(2)} €. Cette action
                    permettra d'assigner un artisan à votre demande.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="accept-response">Message optionnel</Label>
                  <Textarea
                    id="accept-response"
                    placeholder="Ajoutez un commentaire (optionnel)..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={3}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAccept}
                    disabled={isLoading}
                  >
                    Confirmer l'acceptation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={showRejectDialog}
              onOpenChange={setShowRejectDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Refuser le devis
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Refuser le devis</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vous êtes sur le point de refuser ce devis. Cette action
                    annulera la demande et aucun travail ne sera effectué.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="reject-response">
                    Raison du refus (optionnel)
                  </Label>
                  <Textarea
                    id="reject-response"
                    placeholder="Expliquez pourquoi vous refusez ce devis..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={3}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReject}
                    disabled={isLoading}
                  >
                    Confirmer le refus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Status Messages */}
        {!canRespond && estimate.status === "pending" && isExpired && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Devis expiré</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Ce devis a expiré. Contactez l'administration pour obtenir un
              nouveau devis.
            </p>
          </div>
        )}

        {estimate.status === "accepted" && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Devis accepté</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Votre devis a été accepté. Un artisan sera bientôt assigné à votre
              demande.
            </p>
          </div>
        )}

        {estimate.status === "rejected" && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Devis refusé</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Vous avez refusé ce devis. La demande a été annulée.
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-gray-500 pt-4 border-t space-y-1">
          <div>
            Devis créé le{" "}
            {new Date(estimate.createdAt).toLocaleDateString("fr-FR")} à{" "}
            {new Date(estimate.createdAt).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {estimate.updatedAt !== estimate.createdAt && (
            <div>
              Dernière mise à jour le{" "}
              {new Date(estimate.updatedAt).toLocaleDateString("fr-FR")} à{" "}
              {new Date(estimate.updatedAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
