"use client";

import type { ServiceRequestForArtisan } from "@/app/workspace/components/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceRequestStatus } from "@/lib/db/schema";
import { CheckCircle, Clock, FileText, ThumbsUp } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";

interface MissionHeaderProps {
  mission: ServiceRequestForArtisan;
  onStartMission: () => void;
  onOpenValidation: () => void;
  onOpenDispute: () => void;
  onCallClient: () => void;
}

export function MissionHeader({
  mission,
  onStartMission,
  onOpenValidation,
  onOpenDispute,
  onCallClient,
}: MissionHeaderProps) {
  const router = useRouter();

  const getPrimaryAction = () => {
    switch (mission.status) {
      case ServiceRequestStatus.AWAITING_ASSIGNATION:
        return {
          label: "Commencer la mission",
          icon: <Clock className="h-5 w-5" />,
          onClick: onStartMission,
          className: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case ServiceRequestStatus.IN_PROGRESS:
        return {
          label: "Valider la mission",
          icon: <ThumbsUp className="h-5 w-5" />,
          onClick: onOpenValidation,
          className: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      case ServiceRequestStatus.CLIENT_VALIDATED:
        return {
          label: "Confirmer validation",
          icon: <CheckCircle className="h-5 w-5" />,
          onClick: onOpenValidation,
          className: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      default:
        return null;
    }
  };

  const primaryAction = getPrimaryAction();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
              {(mission.clientName || "")
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {mission.title || `Mission ${mission.serviceType}`}
            </h1>
            <p className="text-sm text-gray-500">
              {mission.clientName || "Nom du client non disponible"} •{" "}
              {moment(mission.createdAt).format("DD/MM/YYYY")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Primary Action */}

          <div className="h-6 w-px bg-gray-300 mx-2"></div>

          {/* Clickable Price - Opens Devis */}
          <button
            className="text-right hover:bg-blue-50 rounded-lg p-2 transition-colors group cursor-pointer"
            onClick={() =>
              router.push(
                `/workspace/devis/${(mission as any).billingEstimates[0].id}`
              )
            }
            title="Cliquer pour voir le devis détaillé"
          >
            <div className="flex items-center gap-2">
              <div>
                <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {mission.estimatedPrice
                    ? (mission.estimatedPrice / 100).toFixed(2)
                    : "60"}
                  €
                </p>
                <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Voir devis
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
