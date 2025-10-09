"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  ClipboardList,
  FileText,
  Hammer,
  Search,
  ThumbsUp,
  Trophy,
  Wallet,
  XCircle,
} from "lucide-react";
import moment from "moment";
import "moment/locale/fr";
import * as React from "react";

interface ProgressDrawerProps {
  currentStatus: string;
  statusHistory?: Record<string, string>;
}

interface ProgressStage {
  status: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const getProgressStages = (): ProgressStage[] => {
  return [
    {
      status: "awaiting_estimate",
      label: "En attente du devis",
      description: "Votre demande a été reçue et est en cours d'évaluation",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      status: "awaiting_estimate_acceptation",
      label: "Devis envoyé",
      description: "Un devis estimatif vous a été envoyé pour validation",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      status: "awaiting_assignation",
      label: "Recherche d'un artisan",
      description: "Nous recherchons le meilleur artisan pour votre demande",
      icon: <Search className="h-5 w-5" />,
    },
    {
      status: "in_progress",
      label: "Intervention en cours",
      description: "L'artisan travaille sur votre demande",
      icon: <Hammer className="h-5 w-5" />,
    },
    {
      status: "validation",
      label: "Validation",
      description: "En attente de validation du travail effectué",
      icon: <ThumbsUp className="h-5 w-5" />,
    },
    {
      status: "awaiting_payment",
      label: "En attente de paiement",
      description: "Le travail est validé, en attente du paiement",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      status: "completed",
      label: "Terminé",
      description: "Votre demande a été complétée avec succès",
      icon: <Trophy className="h-5 w-5" />,
    },
  ];
};

const getStatusType = (
  status: string
): "completed" | "current" | "upcoming" | "disputed" | "cancelled" => {
  if (status.includes("disputed")) return "disputed";
  if (status === "cancelled") return "cancelled";

  const stages = getProgressStages();
  const currentStageIndex = stages.findIndex((s) => {
    if (status === "client_validated" || status === "artisan_validated") {
      return s.status === "validation";
    }
    return s.status === status;
  });

  return currentStageIndex === -1 ? "upcoming" : "current";
};

const getStageStatus = (
  stage: string,
  currentStatus: string
): "completed" | "current" | "upcoming" => {
  const stages = getProgressStages();
  const stageIndex = stages.findIndex((s) => s.status === stage);

  // Normalize current status for validation states
  let normalizedStatus = currentStatus;
  if (
    currentStatus === "client_validated" ||
    currentStatus === "artisan_validated"
  ) {
    normalizedStatus = "validation";
  }

  const currentStageIndex = stages.findIndex(
    (s) => s.status === normalizedStatus
  );

  if (currentStageIndex === -1) return "upcoming";
  if (stageIndex < currentStageIndex) return "completed";
  if (stageIndex === currentStageIndex) return "current";
  return "upcoming";
};

export function ProgressDrawer({
  currentStatus,
  statusHistory,
}: ProgressDrawerProps) {
  const stages = getProgressStages();
  const isDisputed = currentStatus.includes("disputed");
  const isCancelled = currentStatus === "cancelled";

  // Configure moment to use French
  React.useEffect(() => {
    moment.locale("fr");
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-[#DDDDDD] text-[#222222] hover:bg-gray-50"
        >
          <ClipboardList className="h-4 w-4" />
          Suivre ma demande
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-8">
        <SheetHeader>
          <SheetTitle className="text-[24px] font-semibold text-[#222222]">
            Suivi de votre demande
          </SheetTitle>
        </SheetHeader>

        <div className="mt-10 space-y-8">
          {/* Special states */}
          {isDisputed && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">
                    Litige en cours
                  </h4>
                  <p className="text-sm text-orange-700">
                    Un problème a été signalé et est en cours de résolution par
                    notre équipe.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Demande annulée
                  </h4>
                  <p className="text-sm text-gray-700">
                    Cette demande a été annulée.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Timeline */}
          {!isCancelled && (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-[30px] bottom-[30px] w-0.5 bg-gray-200" />

              {/* Stages */}
              <div className="space-y-10">
                {stages.map((stage, index) => {
                  const status = getStageStatus(stage.status, currentStatus);
                  const isCompleted = status === "completed";
                  const isCurrent = status === "current";
                  const isUpcoming = status === "upcoming";

                  return (
                    <div key={stage.status} className="relative flex gap-4">
                      {/* Icon Circle */}
                      <div
                        className={`flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center border-2 z-10 ${
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : isCurrent
                            ? "bg-fixeo-blue-600 border-fixeo-blue-600 text-white"
                            : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isCurrent ? (
                          stage.icon
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <h4
                          className={`font-semibold mb-1 ${
                            isCompleted || isCurrent
                              ? "text-[#222222]"
                              : "text-gray-400"
                          }`}
                        >
                          {stage.label}
                        </h4>
                        <p
                          className={`text-sm ${
                            isCompleted || isCurrent
                              ? "text-[#717171]"
                              : "text-gray-400"
                          }`}
                        >
                          {stage.description}
                        </p>
                        {statusHistory?.[stage.status] && (
                          <p className="text-xs text-fixeo-gray-500 mt-1.5">
                            {moment(statusHistory[stage.status]).format(
                              "DD/MM/YYYY"
                            )}{" "}
                            · {moment(statusHistory[stage.status]).fromNow()}
                          </p>
                        )}
                        {isCurrent && (
                          <div className="mt-2 inline-block px-3 py-1 bg-fixeo-blue-100 text-fixeo-blue-700 text-xs font-medium rounded-full">
                            Étape actuelle
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
