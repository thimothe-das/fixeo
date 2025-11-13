"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BillingEstimateStatus } from "@/lib/db/schema";
import { getBillingEstimateStatusConfig, getCategoryConfig } from "@/lib/utils";
import {
  AlertTriangle,
  Building,
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Info,
  ReceiptText,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import type {
  BillingEstimateBreakdownItem,
  BillingEstimateForClient,
} from "../../components/types";

interface EstimatedBillDetailsProps {
  role: "client" | "admin" | "artisan";
  estimate: BillingEstimateForClient;
  isLoading: boolean;
  error: any;
  onAccept?: () => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  isResponding?: boolean;
  showHistory?: boolean;
}

export function EstimatedBillDetails({
  role,
  estimate,
  isLoading,
  error,
  onAccept,
  onReject,
  isResponding = false,
  showHistory = false,
}: EstimatedBillDetailsProps) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-3 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="min-h-screen bg-white pt-3 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Erreur lors du chargement du devis
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getBillingEstimateStatusConfig(estimate.status);

  const isExpired =
    estimate.validUntil && new Date(estimate.validUntil) < new Date();
  const canRespond =
    role === "client" &&
    estimate.status === BillingEstimateStatus.PENDING &&
    !isExpired;

  const breakdown: BillingEstimateBreakdownItem[] = estimate.breakdown
    ? JSON.parse(estimate.breakdown)
    : [];

  const breakdownData = breakdown.length > 0 ? breakdown : [];

  const billNumber = `EST-${
    estimate.createdAt
      ? new Date(estimate.createdAt).getFullYear()
      : new Date().getFullYear()
  }-${String(estimate.id || 0).padStart(4, "0")}`;

  const categoryConfig = getCategoryConfig(
    estimate.serviceRequest?.serviceType || "",
    "h-4 w-4"
  );

  const handleAcceptClick = async () => {
    if (onAccept) {
      await onAccept();
      setShowAcceptDialog(false);
    }
  };

  const handleRejectClick = async () => {
    // Validate rejection reason
    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      setRejectionError(
        "Veuillez fournir une raison détaillée (minimum 10 caractères)"
      );
      return;
    }

    if (onReject) {
      await onReject(rejectionReason.trim());
      setShowRejectDialog(false);
      setRejectionReason("");
      setRejectionError("");
    }
  };

  return (
    <div
      className="min-h-screen bg-white pt-3"
      style={
        {
          "--font-sans":
            'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          "--font-serif":
            'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
          "--font-mono":
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontFamily: "'Inter', sans-serif",
        } as React.CSSProperties
      }
    >
      {/* Top Status Bar - Sticky */}
      {estimate.status === BillingEstimateStatus.PENDING && !isExpired && (
        <div className="bg-orange-100 border-b border-orange-200 py-3 md:py-4 sticky top-0 z-40 w-full -mt-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center px-4 gap-2 md:gap-4 justify-center">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-xs md:text-sm text-orange-800 font-medium">
                {role === "client"
                  ? "Cette facture est en attente de votre réponse"
                  : "Ce devis est en attente de validation par le client"}
              </span>
            </div>
            <Badge className="text-xs bg-orange-500 text-white font-bold uppercase tracking-wide">
              En attente de validation
            </Badge>
          </div>
        </div>
      )}

      {estimate.status === BillingEstimateStatus.ACCEPTED && (
        <div className="bg-green-100 border-b border-green-200 py-3 md:py-4 sticky top-0 z-40 w-full -mt-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center px-4 gap-2 md:gap-4 justify-center">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-xs md:text-sm text-green-800 font-medium">
                Devis accepté par le client
              </span>
            </div>
            <Badge className="text-xs bg-green-600 text-white font-bold uppercase tracking-wide">
              Acceptée le {moment(estimate.createdAt).format("DD/MM/YYYY")}
            </Badge>
          </div>
        </div>
      )}

      {estimate.status === BillingEstimateStatus.REJECTED && (
        <div className="bg-red-100 border-b border-red-200 py-3 md:py-4 sticky top-0 z-40 w-full -mt-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center px-4 gap-2 md:gap-4 justify-center">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-xs md:text-sm text-red-800 font-medium">
                Facture refusée • Un nouveau devis peut être demandé si
                nécessaire
              </span>
            </div>
            <Badge className="text-xs bg-red-600 text-white font-bold uppercase tracking-wide">
              Refusée
            </Badge>
          </div>
        </div>
      )}

      {estimate.status === BillingEstimateStatus.PENDING && isExpired && (
        <div className="bg-gray-100 border-b border-gray-200 py-3 md:py-4 sticky top-0 z-40 w-full -mt-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center px-4 gap-2 md:gap-4 justify-center">
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-xs md:text-sm text-gray-800 font-medium">
                Facture expirée • Contactez l'administration pour obtenir un
                nouveau devis
              </span>
            </div>
            <Badge className="text-xs bg-gray-600 text-white font-bold uppercase tracking-wide">
              Expirée
            </Badge>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-32 md:pb-24 mt-6">
        {/* Header */}
        <div className="rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                {role === "admin" ? (
                  <Calculator className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                ) : (
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">
                  Devis estimé pour{" "}
                  <span className="text-blue-600 font-bold uppercase">
                    {estimate.serviceRequest?.title}
                  </span>
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                    Créé le {moment(estimate.createdAt).format("DD/MM/YYYY")}
                  </span>
                  {estimate.validUntil && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                      Valide jusqu'au:{" "}
                      {moment(estimate.validUntil).format("DD/MM/YYYY")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                    {estimate.serviceRequest?.location || "TechSolutions Inc."}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0">
              <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">
                {(estimate.estimatedPrice / 100).toFixed(2)}€
              </div>
              <div className="text-base md:text-lg text-gray-600">
                Montant estimé
              </div>
              <div className="text-xs md:text-sm text-green-600 mt-1 flex items-center gap-1">
                <Info className="h-3 w-3 md:h-4 md:w-4 text-green-600" /> Inclus
                les taxes et frais
              </div>
            </div>
          </div>
        </div>

        {/* Client Response (for rejected/expired estimates) */}
        {(estimate.status === BillingEstimateStatus.REJECTED ||
          estimate.status === BillingEstimateStatus.EXPIRED) &&
          estimate.clientResponse && (
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">
                    {estimate.status === BillingEstimateStatus.REJECTED
                      ? "Raison du refus"
                      : "Devis expiré"}
                  </h3>
                  <p className="text-sm text-red-800 whitespace-pre-wrap">
                    {estimate.clientResponse}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Admin-only: Artisan and Client Acceptance Status */}
        {role === "admin" && (
          <>
            {/* Artisan Rejection */}
            {estimate.artisanRejectionReason && (
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-2">
                      Refus de l'artisan
                    </h3>
                    <p className="text-sm text-amber-800 whitespace-pre-wrap mb-2">
                      {estimate.artisanRejectionReason}
                    </p>
                    {estimate.rejectedAt && (
                      <div className="flex items-center gap-1 text-xs text-amber-700">
                        <Calendar className="h-3.5 w-3.5" />
                        Refusé le{" "}
                        {moment(estimate.rejectedAt).format(
                          "DD/MM/YYYY à HH:mm"
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dual Acceptance Summary (both parties accepted) */}
            {estimate.artisanAccepted === true &&
              estimate.clientAccepted === true && (
                <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4 mb-6">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">
                        Devis accepté par les deux parties
                      </h3>
                      <p className="text-sm text-green-700">
                        Ce devis révisé a été accepté par le client et
                        l'artisan.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {/* Client acceptance details */}
                    <div className="bg-white rounded-md p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-sm text-gray-900">
                          Client
                        </span>
                      </div>
                      {estimate.clientResponseDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {moment(estimate.clientResponseDate).format(
                            "DD/MM/YYYY à HH:mm"
                          )}
                        </div>
                      )}
                    </div>
                    {/* Artisan acceptance details */}
                    <div className="bg-white rounded-md p-3 border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold text-sm text-gray-900">
                          Artisan
                        </span>
                      </div>
                      {estimate.artisanResponseDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {moment(estimate.artisanResponseDate).format(
                            "DD/MM/YYYY à HH:mm"
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Partial Acceptance Warning (one party accepted, waiting for other) */}
            {((estimate.artisanAccepted === true &&
              estimate.clientAccepted !== true) ||
              (estimate.clientAccepted === true &&
                estimate.artisanAccepted !== true)) && (
              <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      En attente d'acceptation
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      {estimate.artisanAccepted === true &&
                      !estimate.clientAccepted
                        ? "L'artisan a accepté ce devis. En attente de l'acceptation du client."
                        : "Le client a accepté ce devis. En attente de l'acceptation de l'artisan."}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Client status */}
                      <div
                        className={`bg-white rounded-md p-3 border ${
                          estimate.clientAccepted
                            ? "border-green-200"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {estimate.clientAccepted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="font-semibold text-sm text-gray-900">
                            Client
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {estimate.clientAccepted ? (
                            estimate.clientResponseDate ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {moment(estimate.clientResponseDate).format(
                                  "DD/MM/YYYY à HH:mm"
                                )}
                              </div>
                            ) : (
                              "Accepté"
                            )
                          ) : (
                            "En attente"
                          )}
                        </div>
                      </div>
                      {/* Artisan status */}
                      <div
                        className={`bg-white rounded-md p-3 border ${
                          estimate.artisanAccepted
                            ? "border-amber-200"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {estimate.artisanAccepted ? (
                            <CheckCircle className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="font-semibold text-sm text-gray-900">
                            Artisan
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {estimate.artisanAccepted ? (
                            estimate.artisanResponseDate ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {moment(estimate.artisanResponseDate).format(
                                  "DD/MM/YYYY à HH:mm"
                                )}
                              </div>
                            ) : (
                              "Accepté"
                            )
                          ) : (
                            "En attente"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show individual acceptance status for non-dual-acceptance estimates */}
            {!estimate.artisanRejectionReason &&
              estimate.artisanAccepted === true &&
              !estimate.clientAccepted && (
                <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 mb-1">
                        Acceptation de l'artisan
                      </h3>
                      <p className="text-sm text-amber-700">
                        Ce devis a été accepté par l'artisan.
                      </p>
                      {estimate.artisanResponseDate && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-amber-700">
                          <Calendar className="h-3.5 w-3.5" />
                          Accepté le{" "}
                          {moment(estimate.artisanResponseDate).format(
                            "DD/MM/YYYY à HH:mm"
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {estimate.clientAccepted === true && !estimate.artisanAccepted && (
              <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-1">
                      Acceptation du client
                    </h3>
                    <p className="text-sm text-green-700">
                      Ce devis a été accepté par le client.
                    </p>
                    {estimate.clientResponse && (
                      <p className="text-sm text-green-800 whitespace-pre-wrap mt-2">
                        {estimate.clientResponse}
                      </p>
                    )}
                    {estimate.clientResponseDate && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-green-700">
                        <Calendar className="h-3.5 w-3.5" />
                        Accepté le{" "}
                        {moment(estimate.clientResponseDate).format(
                          "DD/MM/YYYY à HH:mm"
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bill From, Bill To, Project Details */}
        <div className="rounded-lg py-4 md:py-8 mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {/* Bill From */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Devis réalisé par
              </h3>
              <div className="space-y-2">
                <div className="font-medium text-gray-900">Fixeo</div>
                <div className="text-gray-500 text-xs">32 rue de la paix</div>
                <div className="text-gray-500 text-xs">Angoulême, 16000</div>
                <div className="text-gray-500 text-xs">contact@fixeo.fr</div>
                <div className="text-gray-500 text-xs">+33 6 51 36 66 84</div>
              </div>
            </div>

            {/* Bill To / Client Info */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                {role === "admin" ? "Informations client" : "Facture à"}
              </h3>
              <div className="space-y-2">
                {estimate.client ? (
                  <>
                    <div className="font-medium text-gray-900">
                      {estimate.client.firstName && estimate.client.lastName
                        ? `${estimate.client.firstName} ${estimate.client.lastName}`
                        : "Nom non disponible"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {estimate.client.address || "Adresse non disponible"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {estimate.client.addressCity || "Ville non disponible"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {estimate.client.phone || "Téléphone non disponible"}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-xs">
                    Informations client non disponibles
                  </div>
                )}
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2 justify-between">
                <h3 className="font-semibold text-gray-900">
                  Détails du projet
                </h3>
                <Badge
                  className={`flex items-center gap-1 text-xs ${categoryConfig.colors.bg} ${categoryConfig.colors.text}`}
                  variant="outline"
                >
                  {categoryConfig.icon}
                  <span className="hidden sm:inline">
                    {categoryConfig.type}
                  </span>
                </Badge>
              </div>

              <div className="space-y-2 text-gray-600">
                <div>
                  <span className="text-sm">
                    {estimate.serviceRequest?.description}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-600" />

                  <span className="text-gray-500 text-xs">Crée le</span>
                  <span className="text-gray-500 text-xs">
                    {moment(estimate.serviceRequest?.createdAt).format(
                      "DD/MM/YYYY"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Description for Admin */}
        {role === "admin" && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="rounded-lg flex align-center gap-2 items-center mb-3">
              <FileText className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Description du projet
              </h3>
            </div>

            <p className="text-gray-700 leading-relaxed text-xs">
              {estimate.description}
            </p>
          </div>
        )}

        {/* Budget Breakdown */}
        <div className="">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">
            En détail
          </h3>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full min-w-[640px] md:min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-2 md:px-4 py-2 md:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-center px-2 md:px-4 py-2 md:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="text-right px-2 md:px-4 py-2 md:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix unitaire
                  </th>
                  <th className="text-right px-2 md:px-4 py-2 md:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="hidden md:inline">Total</span>
                    <span className="md:hidden">Total</span>
                    <span className="hidden md:inline text-xs text-gray-500 block">
                      (Inclus les taxes et frais)
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakdownData.length > 0 ? (
                  breakdownData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-2 md:px-4 py-3 md:py-4">
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ReceiptText className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-xs md:text-sm">
                              {item.description}
                            </div>

                            {(item as any).phase && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                {(item as any).phase} • {item.quantity || 80}{" "}
                                heures estimées
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-3 md:py-4 text-center">
                        <span className="text-gray-900 font-medium text-xs md:text-sm">
                          {item.quantity || 80}
                        </span>
                        <div className="text-xs text-gray-500">
                          {(item as any).unit || ""}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-3 md:py-4 text-right">
                        <span className="text-gray-900 font-medium text-xs md:text-sm">
                          {((item.unitPrice || 12500) / 100).toFixed(2)}€
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-3 md:py-4 text-right">
                        <span className="text-gray-900 font-bold text-xs md:text-sm">
                          {(
                            (item.total ||
                              Math.round(
                                estimate.estimatedPrice / breakdownData.length
                              )) / 100
                          ).toFixed(2)}
                          €
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-2 md:px-4 py-4 md:py-6 text-center border"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ReceiptText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            Aucune ligne budgétaire disponible
                          </div>
                          <div className="text-sm text-gray-500">
                            Aucun détail n'a été ajouté au devis
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Total Row */}
              <tfoot className="bg-gray-50 border-gray-300">
                <tr>
                  <td
                    colSpan={3}
                    className="px-2 md:px-4 py-3 md:py-4 text-right"
                  >
                    <span className="text-sm md:text-lg font-bold text-gray-900">
                      Total estimé:
                    </span>
                  </td>
                  <td className="px-2 md:px-4 py-3 md:py-4 text-right">
                    <span className="text-base md:text-xl font-bold text-blue-600">
                      {(estimate.estimatedPrice / 100).toFixed(2)}€
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Sticky Action Buttons (Client Only) */}
      {canRespond && onAccept && onReject && (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @media (min-width: 768px) {
              .action-buttons-wrapper {
                left: var(--sidebar-width, 0) !important;
              }
            }
          `,
            }}
          />
          <div className="action-buttons-wrapper fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 md:p-4 z-10">
            <div className="max-w-6xl mx-auto px-4 md:px-6 flex gap-2 md:gap-3">
              <AlertDialog
                open={showRejectDialog}
                onOpenChange={setShowRejectDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50 py-3 h-11 md:h-12 text-sm md:text-base font-medium"
                    disabled={isResponding}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Refuser le devis</span>
                    <span className="sm:hidden">Refuser</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Refuser le devis</AlertDialogTitle>
                    <AlertDialogDescription>
                      Veuillez indiquer la raison pour laquelle vous refusez ce
                      devis. Cette information aidera l'administrateur à créer
                      un nouveau devis adapté à vos besoins.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Expliquez pourquoi vous refusez ce devis (minimum 10 caractères)..."
                      value={rejectionReason}
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        setRejectionError("");
                      }}
                      className="min-h-[120px]"
                    />
                    {rejectionError && (
                      <p className="text-sm text-red-600 mt-2">
                        {rejectionError}
                      </p>
                    )}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => {
                        setRejectionReason("");
                        setRejectionError("");
                      }}
                    >
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRejectClick}
                      disabled={
                        isResponding ||
                        !rejectionReason.trim() ||
                        rejectionReason.trim().length < 10
                      }
                      className="bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                    >
                      {isResponding ? "En cours..." : "Refuser le devis"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog
                open={showAcceptDialog}
                onOpenChange={setShowAcceptDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 h-11 md:h-12 text-sm md:text-base font-medium"
                    disabled={isResponding}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Accepter le devis</span>
                    <span className="sm:hidden">Accepter</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Accepter le devis</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir accepter ce devis de{" "}
                      {(estimate.estimatedPrice / 100).toFixed(2)}€ ? Cette
                      action déclenchera le début des travaux.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleAcceptClick}
                      disabled={isResponding}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isResponding ? "En cours..." : "Accepter"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
