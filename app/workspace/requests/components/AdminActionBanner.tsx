"use client";

import { ValidationAction } from "@/app/workspace/components/types";
import { Button } from "@/components/ui/button";
import { ServiceRequestStatus } from "@/lib/db/schema";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface DisputeAction {
  id: number;
  timestamp: Date | string;
  actorId: number;
  actorType: string;
  disputeReason: string;
  disputeDetails: string;
  additionalData: string | null;
  createdAt: Date | string;
  actor: {
    id: number;
    name: string | null;
    email: string;
  } | null;
}

interface AdminActionBannerProps {
  status: string;
  validationActions?: ValidationAction[];
  disputeActions?: DisputeAction[];
  billingEstimates?: any[];
  clientName?: string;
  artisanName?: string;
  onOpenClientValidation: () => void;
  onOpenArtisanValidation: () => void;
  onViewArtisanDispute?: () => void;
  onViewClientDispute?: () => void;
  onCreateRevisedEstimate?: () => void;
}

export function AdminActionBanner({
  status,
  validationActions,
  disputeActions,
  billingEstimates,
  clientName,
  artisanName,
  onOpenClientValidation,
  onOpenArtisanValidation,
  onViewArtisanDispute,
  onViewClientDispute,
  onCreateRevisedEstimate,
}: AdminActionBannerProps) {
  // Check for validation-related statuses
  const isClientValidated = status === ServiceRequestStatus.CLIENT_VALIDATED;
  const isArtisanValidated = status === ServiceRequestStatus.ARTISAN_VALIDATED;
  const isCompleted = status === ServiceRequestStatus.COMPLETED;

  // Check for dispute-related statuses
  const isDisputedByArtisan =
    status === ServiceRequestStatus.DISPUTED_BY_ARTISAN;
  const isDisputedByClient = status === ServiceRequestStatus.DISPUTED_BY_CLIENT;
  const isDisputedByBoth = status === ServiceRequestStatus.DISPUTED_BY_BOTH;

  // Check for dual acceptance status
  const isAwaitingDualAcceptance =
    status === ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE;

  // Check for estimate revision status
  const isAwaitingEstimateRevision =
    status === ServiceRequestStatus.AWAITING_ESTIMATE_REVISION;

  // Check for initial estimate status
  const isAwaitingEstimate = status === ServiceRequestStatus.AWAITING_ESTIMATE;

  // Don't show banner if not in a relevant state
  if (
    !isClientValidated &&
    !isArtisanValidated &&
    !isCompleted &&
    !isDisputedByArtisan &&
    !isDisputedByClient &&
    !isDisputedByBoth &&
    !isAwaitingDualAcceptance &&
    !isAwaitingEstimateRevision &&
    !isAwaitingEstimate
  ) {
    return null;
  }

  // Determine banner variant based on status
  let bannerBg = "";
  let bannerBorder = "";
  let iconColor = "";
  let textColor = "";
  let message = "";
  let showClientButton = false;
  let showArtisanButton = false;
  let showArtisanDisputeButton = false;
  let showClientDisputeButton = false;
  let showAcceptanceIndicators = false;
  let showEstimateButton = false;
  let estimateButtonText = "";
  let estimateButtonClass = "";
  let icon: "check" | "alert" = "check";

  if (isAwaitingEstimate) {
    // Initial estimate needed - blue action banner
    bannerBg = "bg-gradient-to-r from-blue-100 to-sky-100";
    bannerBorder = "border-blue-200";
    iconColor = "text-blue-600";
    textColor = "text-blue-800";
    message = "Cette demande nécessite un devis";
    showEstimateButton = true;
    estimateButtonText = "Créer le devis";
    estimateButtonClass = "bg-blue-600 hover:bg-blue-700";
    icon = "alert";
  } else if (isAwaitingEstimateRevision) {
    // Estimate revision needed - orange/amber action banner
    bannerBg = "bg-gradient-to-r from-orange-100 to-amber-100";
    bannerBorder = "border-orange-200";
    iconColor = "text-orange-600";
    textColor = "text-orange-800";
    message = "L'artisan a contesté le devis. Un devis révisé doit être créé";
    showEstimateButton = true;
    estimateButtonText = "Créer devis révisé";
    estimateButtonClass = "bg-orange-600 hover:bg-orange-700";
    icon = "alert";
  } else if (isAwaitingDualAcceptance) {
    // Dual acceptance - purple banner
    bannerBg = "bg-gradient-to-r from-purple-100 to-violet-100";
    bannerBorder = "border-purple-200";
    iconColor = "text-purple-600";
    textColor = "text-purple-800";
    message = "Devis révisé en attente d'acceptation mutuelle";
    showAcceptanceIndicators = true;
    icon = "alert";
  } else if (isDisputedByArtisan || isDisputedByBoth) {
    // Artisan dispute - red warning banner
    bannerBg = "bg-gradient-to-r from-red-100 to-rose-100";
    bannerBorder = "border-red-200";
    iconColor = "text-red-600";
    textColor = "text-red-800";
    message = "Un litige a été ouvert par l'artisan";
    showArtisanDisputeButton = true;
    icon = "alert";
  } else if (isDisputedByClient) {
    // Client dispute - orange/amber warning banner
    bannerBg = "bg-gradient-to-r from-orange-100 to-amber-100";
    bannerBorder = "border-orange-200";
    iconColor = "text-orange-600";
    textColor = "text-orange-800";
    message = "Un litige a été ouvert par le client";
    showClientDisputeButton = true;
    icon = "alert";
  } else if (isCompleted) {
    // Both parties validated - green success banner
    bannerBg = "bg-gradient-to-r from-green-100 to-emerald-100";
    bannerBorder = "border-green-200";
    iconColor = "text-green-600";
    textColor = "text-green-800";
    message = "Mission terminée avec succès ! Les deux parties ont validé";
    showClientButton = true;
    showArtisanButton = true;
  } else if (isClientValidated) {
    // Only client validated - orange/yellow pending banner
    bannerBg = "bg-gradient-to-r from-orange-100 to-amber-100";
    bannerBorder = "border-orange-200";
    iconColor = "text-orange-600";
    textColor = "text-orange-800";
    message =
      "Le client a validé la mission. En attente de validation de l'artisan";
    showClientButton = true;
    showArtisanButton = false;
  } else if (isArtisanValidated) {
    // Only artisan validated - orange/yellow pending banner
    bannerBg = "bg-gradient-to-r from-orange-100 to-amber-100";
    bannerBorder = "border-orange-200";
    iconColor = "text-orange-600";
    textColor = "text-orange-800";
    message =
      "L'artisan a validé la mission. En attente de validation du client";
    showClientButton = false;
    showArtisanButton = true;
  } else {
    // No valid state to show banner
    return null;
  }

  return (
    <div
      className={`m-0 fixed bottom-0 left-0 right-0 md:left-64 border-t p-4 shadow-lg ${bannerBg} ${bannerBorder} z-2`}
    >
      <div className="flex items-center gap-4 justify-between max-w-7xl mx-auto px-5">
        <div className="flex items-center gap-4">
          {icon === "alert" ? (
            <AlertTriangle className={`h-5 w-5 ${iconColor} shrink-0`} />
          ) : (
            <CheckCircle2 className={`h-5 w-5 ${iconColor} shrink-0`} />
          )}
          <span className={`text-sm font-medium ${textColor}`}>{message}</span>
          {showAcceptanceIndicators &&
            billingEstimates &&
            billingEstimates.length > 0 && (
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      billingEstimates[0].clientAccepted
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className={`text-sm ${textColor}`}>
                    Client:{" "}
                    {billingEstimates[0].clientAccepted
                      ? "✓ Accepté"
                      : "En attente"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      billingEstimates[0].artisanAccepted
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className={`text-sm ${textColor}`}>
                    Artisan:{" "}
                    {billingEstimates[0].artisanAccepted
                      ? "✓ Accepté"
                      : "En attente"}
                  </span>
                </div>
              </div>
            )}
        </div>
        <div className="flex items-center gap-2">
          {showEstimateButton && (
            <Button
              size="sm"
              className={`h-8 text-xs text-white ${estimateButtonClass}`}
              onClick={onCreateRevisedEstimate}
            >
              {estimateButtonText}
            </Button>
          )}
          {showArtisanDisputeButton && (
            <Button
              size="sm"
              className="h-8 text-xs bg-red-600 text-white hover:bg-red-700"
              onClick={onViewArtisanDispute}
            >
              Voir les détails du litige
            </Button>
          )}
          {showClientDisputeButton && (
            <Button
              size="sm"
              className="h-8 text-xs bg-orange-600 text-white hover:bg-orange-700"
              onClick={onViewClientDispute}
            >
              Voir les détails du litige
            </Button>
          )}
          {showClientButton && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300 hover:text-blue-700"
              onClick={onOpenClientValidation}
            >
              Voir le retour du client
            </Button>
          )}
          {showArtisanButton && (
            <Button
              size="sm"
              className="h-8 text-xs bg-orange-600 text-white hover:bg-orange-700"
              onClick={onOpenArtisanValidation}
            >
              Voir le retour de l'artisan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
