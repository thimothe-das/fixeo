"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BillingEstimateStatus } from "@/lib/db/schema";
import { getBillingEstimateStatusConfig } from "@/lib/utils";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Euro,
  Eye,
  FileText,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Estimate {
  id: number;
  estimatedPrice: number;
  description: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  clientResponse?: string | null;
  artisanRejectionReason?: string | null;
  artisanAccepted?: boolean | null;
  clientAccepted?: boolean | null;
  artisanResponseDate?: string | null;
  clientResponseDate?: string | null;
  rejectedByArtisanId?: number | null;
  rejectedAt?: string | null;
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
  const router = useRouter();
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

                {/* Artisan Rejection */}
                {estimate.artisanRejectionReason && (
                  <div className="border-l-4 border-amber-500 pl-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-900 mb-2">
                          Refus de l'artisan
                        </h4>
                        <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">
                          {estimate.artisanRejectionReason}
                        </p>
                        {estimate.rejectedAt && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-amber-700">
                            <Calendar className="h-3.5 w-3.5" />
                            Refusé le {moment(estimate.rejectedAt).format("DD/MM/YYYY à HH:mm")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Artisan Acceptance (for dual acceptance flow) */}
                {estimate.artisanAccepted === true && (
                  <div className="border-l-4 border-amber-500 pl-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-900 mb-1">
                          Acceptation de l'artisan
                        </h4>
                        <p className="text-sm text-amber-700">
                          Ce devis a été accepté par l'artisan.
                        </p>
                        {estimate.artisanResponseDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-amber-700">
                            <Calendar className="h-3.5 w-3.5" />
                            Accepté le {moment(estimate.artisanResponseDate).format("DD/MM/YYYY à HH:mm")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Client Rejection */}
                {estimate.status === BillingEstimateStatus.REJECTED &&
                  estimate.clientResponse && (
                    <div className="border-l-4 border-red-500 pl-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-red-900 mb-2">
                            Refus du client
                          </h4>
                          <p className="text-sm text-red-800 whitespace-pre-wrap leading-relaxed">
                            {estimate.clientResponse}
                          </p>
                          {estimate.clientResponseDate && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-red-700">
                              <Calendar className="h-3.5 w-3.5" />
                              Refusé le {moment(estimate.clientResponseDate).format("DD/MM/YYYY à HH:mm")}
                            </div>
                          )}
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

                {/* Client Acceptance (for dual acceptance flow) */}
                {estimate.clientAccepted === true && (
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-green-900 mb-1">
                          Acceptation du client
                        </h4>
                        <p className="text-sm text-green-700">
                          Ce devis a été accepté par le client.
                        </p>
                        {estimate.clientResponse && (
                          <p className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed mt-2">
                            {estimate.clientResponse}
                          </p>
                        )}
                        {estimate.clientResponseDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-green-700">
                            <Calendar className="h-3.5 w-3.5" />
                            Accepté le {moment(estimate.clientResponseDate).format("DD/MM/YYYY à HH:mm")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Global Acceptance Status (when status is ACCEPTED) */}
                {estimate.status === BillingEstimateStatus.ACCEPTED && !estimate.clientAccepted && (
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
                        {estimate.clientResponse && (
                          <p className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed mt-2">
                            {estimate.clientResponse}
                          </p>
                        )}
                        {estimate.clientResponseDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-green-700">
                            <Calendar className="h-3.5 w-3.5" />
                            Accepté le {moment(estimate.clientResponseDate).format("DD/MM/YYYY à HH:mm")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dual Acceptance Summary */}
                {estimate.artisanAccepted === true && estimate.clientAccepted === true && (
                  <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-green-900 mb-1">
                          Devis accepté par les deux parties
                        </h4>
                        <p className="text-sm text-green-700">
                          Ce devis révisé a été accepté par le client et l'artisan.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {/* Client acceptance details */}
                      <div className="bg-white rounded-md p-3 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-sm text-gray-900">Client</span>
                        </div>
                        {estimate.clientResponseDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {moment(estimate.clientResponseDate).format("DD/MM/YYYY à HH:mm")}
                          </div>
                        )}
                      </div>
                      {/* Artisan acceptance details */}
                      <div className="bg-white rounded-md p-3 border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-amber-600" />
                          <span className="font-semibold text-sm text-gray-900">Artisan</span>
                        </div>
                        {estimate.artisanResponseDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {moment(estimate.artisanResponseDate).format("DD/MM/YYYY à HH:mm")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Partial Acceptance Warning (one party accepted, waiting for other) */}
                {((estimate.artisanAccepted === true && estimate.clientAccepted !== true) ||
                  (estimate.clientAccepted === true && estimate.artisanAccepted !== true)) && (
                  <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-blue-900 mb-2">
                          En attente d'acceptation
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                          {estimate.artisanAccepted === true && !estimate.clientAccepted
                            ? "L'artisan a accepté ce devis. En attente de l'acceptation du client."
                            : "Le client a accepté ce devis. En attente de l'acceptation de l'artisan."}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Client status */}
                          <div className={`bg-white rounded-md p-3 border ${estimate.clientAccepted ? 'border-green-200' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {estimate.clientAccepted ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="font-semibold text-sm text-gray-900">Client</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {estimate.clientAccepted ? (
                                estimate.clientResponseDate ? (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {moment(estimate.clientResponseDate).format("DD/MM/YYYY à HH:mm")}
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
                          <div className={`bg-white rounded-md p-3 border ${estimate.artisanAccepted ? 'border-amber-200' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {estimate.artisanAccepted ? (
                                <CheckCircle className="h-4 w-4 text-amber-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="font-semibold text-sm text-gray-900">Artisan</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {estimate.artisanAccepted ? (
                                estimate.artisanResponseDate ? (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {moment(estimate.artisanResponseDate).format("DD/MM/YYYY à HH:mm")}
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

                {/* Navigation Button to Full Devis Page */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => router.push(`/workspace/devis/${estimate.id}`)}
                    className="w-full flex items-center justify-center gap-2 h-11"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4" />
                    Voir le devis complet
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
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
