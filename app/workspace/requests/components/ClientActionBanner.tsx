"use client";

import { Button } from "@/components/ui/button";
import { ServiceRequestStatus } from "@/lib/db/schema";
import { CheckCircle, Megaphone } from "lucide-react";

interface ClientActionBannerProps {
  status: string;
  onOpenAcceptDialog: () => void;
  onOpenRejectDialog: () => void;
  onOpenValidation?: () => void;
  onOpenDispute?: () => void;
  onViewDispute?: () => void;
  clientAccepted?: boolean;
  artisanAccepted?: boolean;
}

export function ClientActionBanner({
  status,
  onOpenAcceptDialog,
  onOpenRejectDialog,
  onOpenValidation,
  onOpenDispute,
  onViewDispute,
  clientAccepted,
  artisanAccepted,
}: ClientActionBannerProps) {
  const getActionBanner = () => {
    switch (status) {
      case ServiceRequestStatus.AWAITING_ESTIMATE:
        return {
          type: "info",
          message: "Votre demande a été reçue. Notre équipe prépare un devis estimatif",
          buttons: null,
          backgroundColor: "bg-gradient-to-r from-blue-100 to-sky-100",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          textColor: "text-blue-800",
        };
      case ServiceRequestStatus.AWAITING_ASSIGNATION:
        return {
          type: "info",
          message: "✓ Acompte reçu. Nous recherchons un artisan qualifié pour votre intervention",
          buttons: null,
          backgroundColor: "bg-gradient-to-r from-blue-100 to-sky-100",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          textColor: "text-blue-800",
        };
      case ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION:
        return {
          type: "info",
          message: "Aceptation et paiement de l'acompte requis pour continuer",
          buttons: (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
                onClick={onOpenRejectDialog}
              >
                Rejeter
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-green-600 text-white hover:bg-green-700"
                onClick={onOpenAcceptDialog}
              >
                Accepter le devis
              </Button>
            </>
          ),
        };
      case ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE:
        // Show banner if client hasn't accepted yet
        if (clientAccepted === false) {
          return {
            type: "info",
            message: "Devis révisé : Votre acceptation est requise pour continuer",
            buttons: (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
                  onClick={onOpenRejectDialog}
                >
                  Rejeter
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-purple-600 text-white hover:bg-purple-700"
                  onClick={onOpenAcceptDialog}
                >
                  Accepter le devis révisé
                </Button>
              </>
            ),
            backgroundColor: "bg-gradient-to-r from-purple-100 to-violet-100",
            borderColor: "border-purple-200",
            iconColor: "text-purple-600",
            textColor: "text-purple-800",
          };
        }
        // Show banner if client has accepted but waiting for artisan
        if (clientAccepted === true && artisanAccepted === false) {
          return {
            type: "info",
            message: "✓ Votre acceptation a été enregistrée. En attente de la réponse de l'artisan",
            buttons: null,
            backgroundColor: "bg-gradient-to-r from-blue-100 to-sky-100",
            borderColor: "border-blue-200",
            iconColor: "text-blue-600",
            textColor: "text-blue-800",
          };
        }
        return null;
      case ServiceRequestStatus.IN_PROGRESS:
        return {
          type: "warning",
          message: "Intervention terminée ? Validez ou signalez un problème",
          buttons: (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300"
                onClick={onOpenDispute}
              >
                Signaler un problème
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={onOpenValidation}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Valider l'intervention
              </Button>
            </>
          ),
        };
      case ServiceRequestStatus.ARTISAN_VALIDATED:
        return {
          type: "warning",
          message: "L'artisan a validé l'intervention. Merci de confirmer ou signaler un problème",
          buttons: (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300"
                onClick={onOpenDispute}
              >
                Signaler un problème
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={onOpenValidation}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Valider l'intervention
              </Button>
            </>
          ),
        };
      case ServiceRequestStatus.CLIENT_VALIDATED:
        return {
          type: "info",
          message: "✓ Vous avez validé l'intervention. En attente de la validation de l'artisan",
          buttons: null,
          backgroundColor: "bg-gradient-to-r from-blue-100 to-sky-100",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          textColor: "text-blue-800",
        };
      case ServiceRequestStatus.DISPUTED_BY_ARTISAN:
        return {
          type: "alert",
          message: "L'artisan a ouvert un litige - Notre équipe examine la situation",
          buttons: (
            <Button
              size="sm"
              className="h-8 text-xs bg-red-600 text-white hover:bg-red-700"
              onClick={onViewDispute}
            >
              Voir les détails du litige
            </Button>
          ),
          backgroundColor: "bg-gradient-to-r from-red-100 to-rose-100",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          textColor: "text-red-800",
        };
      case ServiceRequestStatus.DISPUTED_BY_BOTH:
        return {
          type: "alert",
          message: "Les deux parties ont ouvert un litige - Notre équipe examine la situation",
          buttons: (
            <Button
              size="sm"
              className="h-8 text-xs bg-red-600 text-white hover:bg-red-700"
              onClick={onViewDispute}
            >
              Voir les détails du litige
            </Button>
          ),
          backgroundColor: "bg-gradient-to-r from-red-100 to-rose-100",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          textColor: "text-red-800",
        };
      case ServiceRequestStatus.DISPUTED_BY_CLIENT:
        return {
          type: "info",
          message:
            "Vous avez signalé un problème - Notre équipe examine votre demande et va vous contacter pour résoudre",
          buttons: (
            <Button
              size="sm"
              className="h-8 text-xs bg-blue-600 text-white hover:bg-blue-700"
              onClick={onViewDispute}
            >
              Voir ma contestation
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
      case ServiceRequestStatus.CANCELLED:
        return {
          type: "info",
          message: "La demande a été annulée.",
          buttons: null,
        };
      case ServiceRequestStatus.COMPLETED:
        return {
          type: "success",
          message: "✓ Mission terminée avec succès ! Les deux parties ont validé l'intervention",
          buttons: null,
          backgroundColor: "bg-gradient-to-r from-green-100 to-emerald-100",
          borderColor: "border-green-200",
          iconColor: "text-green-600",
          textColor: "text-green-800",
        };
      default:
        return null;
    }
  };

  const actionBanner = getActionBanner();

  if (!actionBanner) return null;

  const bgClass = actionBanner.backgroundColor || "bg-gradient-to-r from-orange-100 to-yellow-100";
  const borderClass = actionBanner.borderColor || "border-orange-200";
  const iconColorClass = actionBanner.iconColor || "text-orange-600";
  const textColorClass = actionBanner.textColor || "text-orange-800";

  return (
    <div className={`w-full border-t p-4 fixed bottom-0 right-0 z-50 shadow-lg ${bgClass} ${borderClass}`}>
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
