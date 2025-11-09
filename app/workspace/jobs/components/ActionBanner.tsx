"use client";

import { Button } from "@/components/ui/button";
import { ServiceRequestStatus } from "@/lib/db/schema";
import { Megaphone } from "lucide-react";

interface ActionBannerProps {
  status: string;
  onStartMission: () => void;
  onOpenValidation: () => void;
  onOpenDispute: () => void;
}

export function ActionBanner({
  status,
  onStartMission,
  onOpenValidation,
  onOpenDispute,
}: ActionBannerProps) {
  const getActionBanner = () => {
    switch (status) {
      case ServiceRequestStatus.IN_PROGRESS:
        return {
          type: "warning",
          title: "Une action est requise",
          message:
            "Mission terminée ? Validation requise pour finaliser le paiement",
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
                Valider la mission
              </Button>
            </>
          ),
        };
      case ServiceRequestStatus.CLIENT_VALIDATED:
        return {
          type: "info",
          title: "Une action est requise",
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
          title: "Une action est requise",
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
      default:
        return null;
    }
  };

  const actionBanner = getActionBanner();

  if (!actionBanner) return null;

  return (
    <div className="w-full border-t p-4 fixed bottom-0 right-0 z-50 shadow-lg bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-200">
      <div className="flex items-center px-6 gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">
            {actionBanner.title} - {actionBanner.message}
          </span>
        </div>
        <div className="flex items-center gap-2">{actionBanner.buttons}</div>
      </div>
    </div>
  );
}

