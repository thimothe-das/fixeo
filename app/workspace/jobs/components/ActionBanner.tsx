"use client";

import { Button } from "@/components/ui/button";
import { ServiceRequestStatus } from "@/lib/db/schema";
import { Megaphone } from "lucide-react";

interface ActionBannerProps {
  status: string;
  onStartMission: () => void;
  onOpenValidation: () => void;
  onOpenDispute: () => void;
  onOpenQuoteRejection?: () => void;
  onAcceptRevisedEstimate?: () => void;
  onRejectRevisedEstimate?: () => void;
  onOpenClientDispute?: () => void;
  onViewValidation?: () => void;
  artisanAccepted?: boolean;
  clientAccepted?: boolean;
  hasAlreadyRejectedEstimate?: boolean;
  hasValidationActions?: boolean;
}

export function ActionBanner({
  status,
  onStartMission,
  onOpenValidation,
  onOpenDispute,
  onOpenQuoteRejection,
  onAcceptRevisedEstimate,
  onRejectRevisedEstimate,
  onOpenClientDispute,
  onViewValidation,
  artisanAccepted,
  clientAccepted,
  hasAlreadyRejectedEstimate,
  hasValidationActions,
}: ActionBannerProps) {
  const getActionBanner = () => {
    switch (status) {
      case ServiceRequestStatus.IN_PROGRESS:
        return {
          type: "warning",
          message:
            "Mission terminée ? Validation requise pour finaliser le paiement",
          buttons: (
            <>
              {onOpenQuoteRejection && !hasAlreadyRejectedEstimate && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300 hover:text-orange-700 mr-5"
                  onClick={onOpenQuoteRejection}
                >
                  Contester le devis
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs bg-red-600 text-white hover:bg-red-700 border-red-600"
                onClick={onOpenDispute}
              >
                Annuler la mission
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={onOpenValidation}
              >
                Valider la mission
              </Button>
            </>
          ),
        };
      case ServiceRequestStatus.CLIENT_VALIDATED:
        return {
          type: "info",
          message:
            "Le client a confirmé la mission. Votre validation est maintenant requise",
          buttons: (
            <>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs bg-red-600 text-white hover:bg-red-700 border-red-600"
                onClick={onOpenDispute}
              >
                Contester
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={onOpenValidation}
              >
                Confirmer validation
              </Button>
            </>
          ),
        };
      case ServiceRequestStatus.AWAITING_ASSIGNATION:
        return {
          type: "info",
          message:
            "Mission planifiée - prêt à commencer quand vous le souhaitez",
          buttons: (
            <Button
              size="sm"
              className="h-8 text-xs bg-blue-600 text-white hover:bg-blue-700"
              onClick={onStartMission}
            >
              Commencer la mission
            </Button>
          ),
        };
      case ServiceRequestStatus.AWAITING_ESTIMATE_REVISION:
        return {
          type: "info",
          message:
            "Le devis a été rejeté. L'administrateur prépare une révision.",
          buttons: null,
        };
      case ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE:
        // If artisan has already accepted, show waiting message
        if (artisanAccepted) {
          return {
            type: "info",
            message:
              "Vous avez accepté le devis. En attente de l'acceptation du client",
            buttons: null,
          };
        }
        // If artisan hasn't accepted yet
        return {
          type: "info",
          message: clientAccepted
            ? "Le client a accepté le devis. Votre acceptation est requise"
            : "Devis révisé : vous et le client devez accepter pour continuer",
          buttons: (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
                onClick={onRejectRevisedEstimate}
              >
                Refuser
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-green-600 text-white hover:bg-green-700"
                onClick={onAcceptRevisedEstimate}
              >
                Accepter le devis
              </Button>
            </>
          ),
        };
      case ServiceRequestStatus.DISPUTED_BY_CLIENT:
        return {
          type: "warning",
          message:
            "Le client a signalé un problème - Cliquez pour voir les détails",
          buttons: (
            <Button
              size="sm"
              className="h-8 text-xs bg-red-600 text-white hover:bg-red-700"
              onClick={onOpenClientDispute}
            >
              Voir la contestation
            </Button>
          ),
        };
      case ServiceRequestStatus.ARTISAN_VALIDATED:
        if (hasValidationActions && onViewValidation) {
          return {
            type: "success",
            message:
              "Validation envoyée - Cliquez pour voir vos détails de validation",
            buttons: (
              <Button
                size="sm"
                className="h-8 text-xs bg-green-600 text-white hover:bg-green-700"
                onClick={onViewValidation}
              >
                Voir ma validation
              </Button>
            ),
          };
        }
        return null;
      default:
        return null;
    }
  };

  const actionBanner = getActionBanner();

  if (!actionBanner) return null;

  // Determine banner colors based on type
  const bgClass =
    actionBanner.type === "success"
      ? "bg-gradient-to-r from-green-100 to-emerald-100"
      : actionBanner.type === "warning"
      ? "bg-gradient-to-r from-red-100 to-rose-100"
      : "bg-gradient-to-r from-orange-100 to-yellow-100";

  const borderClass =
    actionBanner.type === "success"
      ? "border-green-200"
      : actionBanner.type === "warning"
      ? "border-red-200"
      : "border-orange-200";

  const iconColorClass =
    actionBanner.type === "success"
      ? "text-green-600"
      : actionBanner.type === "warning"
      ? "text-red-600"
      : "text-orange-600";

  const textColorClass =
    actionBanner.type === "success"
      ? "text-green-800"
      : actionBanner.type === "warning"
      ? "text-red-800"
      : "text-orange-800";

  return (
    <div
      className={`w-full border-t border-b p-4 sticky bottom-0 z-10 shadow-lg ${bgClass} ${borderClass}`}
    >
      <div className="flex items-center px-6 gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className={`h-4 w-4 ${iconColorClass} shrink-0`} />
          <span className={`text-sm font-medium ${textColorClass}`}>
            {actionBanner.message}
          </span>
        </div>
        <div className="flex items-center gap-2">{actionBanner.buttons}</div>
      </div>
    </div>
  );
}
