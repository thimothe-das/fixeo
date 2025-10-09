"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ServiceRequestStatus } from "@/lib/db/schema";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

interface BillingEstimate {
  id: number;
  estimatedPrice: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  validUntil?: string;
  createdAt: string;
  description?: string;
  breakdown?: string;
}

interface RequestSidebarProps {
  estimate?: BillingEstimate;
  requestStatus: string;
  createdAt: string;
  updatedAt?: string;
  onAcceptEstimate?: () => void;
  onRejectEstimate?: () => void;
  onValidateCompletion?: () => void;
  onDispute?: () => void;
  onAddPhotos?: () => void;
  isLoading?: boolean;
}

const formatPrice = (cents: number): string => {
  return `${(cents / 100).toFixed(0)} €`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getEstimateStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-300"
        >
          En attente
        </Badge>
      );
    case "accepted":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-300"
        >
          Accepté
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-300"
        >
          Rejeté
        </Badge>
      );
    case "expired":
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-300"
        >
          Expiré
        </Badge>
      );
    default:
      return null;
  }
};

export function RequestSidebar({
  estimate,
  requestStatus,
  createdAt,
  updatedAt,
  onAcceptEstimate,
  onRejectEstimate,
  onValidateCompletion,
  onDispute,
  onAddPhotos,
  isLoading = false,
}: RequestSidebarProps) {
  const router = useRouter();
  const [showBreakdown, setShowBreakdown] = React.useState(false);

  const parsedBreakdown = estimate?.breakdown
    ? (() => {
        try {
          return JSON.parse(estimate.breakdown);
        } catch (e) {
          return null;
        }
      })()
    : null;

  const canAcceptRejectEstimate =
    requestStatus === ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION &&
    estimate?.status === "pending";

  const canValidateOrDispute =
    requestStatus === ServiceRequestStatus.IN_PROGRESS ||
    requestStatus === ServiceRequestStatus.ARTISAN_VALIDATED;

  return (
    <div className="sticky top-6 self-start">
      {/* Price Card - Airbnb Style */}
      <div className="border border-[#DDDDDD] rounded-xl shadow-sm p-6">
        {estimate ? (
          <>
            {/* Price Header */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-semibold text-[#222222]">
                  {formatPrice(estimate.estimatedPrice)}
                </span>
                <span className="text-gray-600">Devis estimé</span>
              </div>
              {getEstimateStatusBadge(estimate.status)}
            </div>

            <Separator className="my-4" />

            {/* Dates */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Créée le</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatDate(createdAt)}
                </span>
              </div>
              {updatedAt && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Mise à jour</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatDate(updatedAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {canAcceptRejectEstimate && (
              <>
                <Button
                  onClick={onAcceptEstimate}
                  disabled={isLoading}
                  className="w-full bg-fixeo-accent-500 hover:bg-fixeo-accent-600 text-white mb-3"
                  size="lg"
                >
                  Accepter le devis
                </Button>
                <Button
                  variant="outline"
                  onClick={onRejectEstimate}
                  disabled={isLoading}
                  className="w-full"
                >
                  Rejeter
                </Button>
              </>
            )}

            {canValidateOrDispute && (
              <>
                <Button
                  onClick={onValidateCompletion}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white mb-3"
                  size="lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Valider l'intervention
                </Button>
                <Button
                  variant="outline"
                  onClick={onDispute}
                  disabled={isLoading}
                  className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  Signaler un problème
                </Button>
              </>
            )}

            {!canAcceptRejectEstimate && !canValidateOrDispute && (
              <div className="text-center py-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/workspace/devis/${estimate.id}`)}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Voir le devis complet
                </Button>
              </div>
            )}

            <Separator className="my-4" />

            {/* Breakdown toggle */}
            {parsedBreakdown && parsedBreakdown.length > 0 && (
              <div>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  <span>Détails du devis</span>
                  {showBreakdown ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showBreakdown && (
                  <div className="mt-3 space-y-2">
                    {parsedBreakdown.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.description}
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info message */}
            {canAcceptRejectEstimate && (
              <>
                <Separator className="my-4" />
                <p className="text-xs text-gray-500 text-center">
                  Aucun montant ne vous sera débité pour le moment
                </p>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              En attente du devis estimatif
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
