"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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
import { useBillingEstimate } from "@/hooks/use-billing-estimate";
import { getCategoryConfig } from "@/lib/utils";
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Info,
  ReceiptText,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useParams } from "next/navigation";
import type {
  BillingEstimateBreakdownItem,
  BillingEstimateForClient,
} from "../../../components/types";

interface EstimatedBillProps {
  estimate: BillingEstimateForClient;
}

type UserWithClientProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  clientProfile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    addressCity?: string;
  };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EstimatedBill() {
  const params = useParams();
  const estimateId = parseInt(params.id as string);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserWithClientProfile | null>(
    null
  );
  const [isResponding, setIsResponding] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  const {
    estimate,
    error: requestsError,
    isLoading,
    mutate,
  } = useBillingEstimate(estimateId);

  const handleEstimateResponse = async (
    estimateId: number,
    action: "accept" | "reject",
    response?: string
  ) => {
    setIsResponding(true);
    try {
      const apiResponse = await fetch("/api/client/billing-estimates/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimateId,
          action,
          response,
        }),
      });

      if (apiResponse.ok) {
        await mutate(); // Refresh estimates
        // onEstimateResponse?.(); // Notify parent component
      } else {
        const error = await apiResponse.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error responding to estimate:", error);
      alert("Erreur lors de la réponse au devis");
    } finally {
      setIsResponding(false);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/user?includeProfiles=true");
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

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

  if (requestsError || !estimate) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
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
        return "En attente de validation";
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
    await handleEstimateResponse(estimate.id, "accept");
    setShowAcceptDialog(false);
  };

  const handleReject = async () => {
    await handleEstimateResponse(estimate.id, "reject");
    setShowRejectDialog(false);
  };

  // Get default breakdown data if none exists

  const breakdownData = breakdown.length > 0 ? breakdown : [];

  const categoryConfig = getCategoryConfig(
    estimate.serviceRequest?.serviceType,
    "h-4 w-4"
  );

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
      {/* Top Status Bar */}
      {estimate.status === "pending" && !isExpired && (
        <div className="bg-orange-100 border-b border-orange-200 py-3 md:py-4 sticky top-0 z-40 w-full -mt-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center px-4 gap-2 md:gap-4 justify-center">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-xs md:text-sm text-orange-800 font-medium">
                Cette facture est en attente de votre réponse
              </span>
            </div>
            <Badge className="text-xs bg-orange-500 text-white font-bold uppercase tracking-wide">
              En attente de validation
            </Badge>
          </div>
        </div>
      )}

      {estimate.status === "accepted" && (
        <div className="bg-green-100 border-b border-green-200 py-3 md:py-4 sticky top-0 z-40 w-full -mt-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center px-4 gap-2 md:gap-4 justify-center">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-xs md:text-sm text-green-800 font-medium">
                Facture acceptée • Le travail peut commencer
              </span>
            </div>
            <Badge className="text-xs bg-green-600 text-white font-bold uppercase tracking-wide">
              Acceptée le {moment(estimate.createdAt).format("DD/MM/YYYY")}
            </Badge>
          </div>
        </div>
      )}

      {estimate.status === "rejected" && (
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

      {estimate.status === "pending" && isExpired && (
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
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
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
                    {estimate.serviceRequest?.location}
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

            {/* Bill To */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Facture à</h3>
              <div className="space-y-2">
                {userLoading ? (
                  <div className="text-gray-500 text-xs">Chargement...</div>
                ) : (
                  <>
                    <div className="font-medium text-gray-900">
                      {currentUser?.clientProfile?.firstName &&
                      currentUser?.clientProfile?.lastName
                        ? `${currentUser.clientProfile.firstName} ${currentUser.clientProfile.lastName}`
                        : currentUser?.name || "Nom non disponible"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {currentUser?.clientProfile?.address ||
                        "Adresse non disponible"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {currentUser?.clientProfile?.addressCity ||
                        "Ville non disponible"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {currentUser?.email || "Email non disponible"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {currentUser?.clientProfile?.phone ||
                        "Téléphone non disponible"}
                    </div>
                  </>
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

      {/* Sticky Action Buttons */}
      {canRespond && (
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
                      Êtes-vous sûr de vouloir refuser ce devis ? L'artisan sera
                      notifié de votre décision.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReject}
                      disabled={isResponding}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      {isResponding ? "En cours..." : "Refuser"}
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
                      onClick={handleAccept}
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
