"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { BillingEstimateStatus } from "@/lib/db/schema";
import { getBillingEstimateStatusConfig } from "@/lib/utils";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Euro,
  FileText,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";

interface Estimate {
  id: number;
  estimatedPrice: number;
  description: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  clientResponse?: string | null;
  createdAt: string;
  validUntil?: string | null;
  updatedAt: string;
}

interface EstimateHistoryAccordionProps {
  serviceRequestId: number;
  role: "client" | "admin" | "artisan";
  currentEstimateId?: number;
}

export function EstimateHistoryAccordion({
  serviceRequestId,
  role,
  currentEstimateId,
}: EstimateHistoryAccordionProps) {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        setIsLoading(true);
        const endpoint =
          role === "admin"
            ? `/api/admin/billing-estimates/by-request/${serviceRequestId}`
            : `/api/client/billing-estimates/by-request/${serviceRequestId}`;

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Failed to fetch estimates");
        }

        const data = await response.json();
        setEstimates(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load estimate history"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstimates();
  }, [serviceRequestId, role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-fixeo-main-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <FileText className="h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">
            Aucun devis n'a encore été créé pour cette demande.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue={`estimate-${estimates[0]?.id}`}
    >
      {estimates.map((estimate, index) => {
        const isCurrent = estimate.id === currentEstimateId;
        const statusConfig = getBillingEstimateStatusConfig(estimate.status);
        const Icon =
          estimate.status === BillingEstimateStatus.ACCEPTED
            ? CheckCircle
            : estimate.status === BillingEstimateStatus.REJECTED
            ? XCircle
            : estimate.status === BillingEstimateStatus.EXPIRED
            ? Clock
            : FileText;

        return (
          <AccordionItem
            key={estimate.id}
            value={`estimate-${estimate.id}`}
            className={`border rounded-lg mb-3 overflow-hidden transition-all ${
              isCurrent
                ? "border-fixeo-main-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-full ${
                      isCurrent ? "bg-fixeo-main-100" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isCurrent
                          ? "text-fixeo-main-600"
                          : statusConfig.colors.color
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        Devis #{estimate.id}
                      </span>
                      {isCurrent && (
                        <Badge className="bg-fixeo-main-600 hover:bg-fixeo-main-700 text-white text-xs px-2 py-0.5">
                          Actuel
                        </Badge>
                      )}
                      {index === 0 && !isCurrent && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5"
                        >
                          Récent
                        </Badge>
                      )}
                      <Badge
                        className={`${statusConfig.colors.bg} ${statusConfig.colors.color} text-xs px-2 py-0.5`}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {moment(estimate.createdAt).format(
                          "DD/MM/YYYY à HH:mm"
                        )}
                      </span>
                      {estimate.validUntil && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Expire {moment(estimate.validUntil).fromNow()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="font-bold text-lg text-gray-900 flex items-center gap-1.5">
                  <Euro className="h-5 w-5 text-gray-500" />
                  {(estimate.estimatedPrice / 100).toFixed(2)}€
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 pt-2">
              <div className="space-y-4">
                {estimate.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      Description du devis
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {estimate.description}
                    </p>
                  </div>
                )}

                {estimate.status === BillingEstimateStatus.REJECTED &&
                  estimate.clientResponse && (
                    <div className="border-l-4 border-red-500 pl-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-red-900 mb-2">
                            Raison du refus
                          </h4>
                          <p className="text-sm text-red-800 whitespace-pre-wrap leading-relaxed">
                            {estimate.clientResponse}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {estimate.status === BillingEstimateStatus.EXPIRED && (
                  <div className="border-l-4 border-gray-400 pl-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          Devis expiré
                        </h4>
                        <p className="text-sm text-gray-700">
                          Ce devis a expiré le{" "}
                          <span className="font-medium">
                            {moment(estimate.validUntil).format("DD/MM/YYYY")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {estimate.status === BillingEstimateStatus.ACCEPTED && (
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-green-900 mb-1">
                          Devis accepté
                        </h4>
                        <p className="text-sm text-green-700">
                          Ce devis a été accepté par le client.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Dernière mise à jour:{" "}
                    {moment(estimate.updatedAt).format("DD/MM/YYYY à HH:mm")}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
