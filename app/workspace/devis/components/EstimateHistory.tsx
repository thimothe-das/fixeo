"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface EstimateHistoryProps {
  serviceRequestId: number;
  role: "client" | "admin" | "artisan";
  currentEstimateId?: number;
}

export function EstimateHistory({
  serviceRequestId,
  role,
  currentEstimateId,
}: EstimateHistoryProps) {
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historique des devis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historique des devis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (estimates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historique des devis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Aucun devis n'a encore été créé pour cette demande.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Historique des devis ({estimates.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {estimates.map((estimate, index) => {
            const isCurrent = estimate.id === currentEstimateId;
            const statusConfig = getBillingEstimateStatusConfig(
              estimate.status
            );
            const Icon =
              estimate.status === BillingEstimateStatus.ACCEPTED
                ? CheckCircle
                : estimate.status === BillingEstimateStatus.REJECTED
                ? XCircle
                : estimate.status === BillingEstimateStatus.EXPIRED
                ? Clock
                : FileText;

            return (
              <div
                key={estimate.id}
                className={`border rounded-lg p-4 ${
                  isCurrent ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${statusConfig.colors.color}`} />
                    <div>
                      <div className="font-medium text-gray-900">
                        Devis #{estimate.id}
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            Actuel
                          </span>
                        )}
                        {index === 0 && !isCurrent && (
                          <span className="ml-2 text-xs bg-gray-600 text-white px-2 py-1 rounded">
                            Récent
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {moment(estimate.createdAt).format(
                            "DD/MM/YYYY à HH:mm"
                          )}
                        </span>
                        {estimate.validUntil && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Valide jusqu'au:{" "}
                            {moment(estimate.validUntil).format("DD/MM/YYYY")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      {(estimate.estimatedPrice / 100).toFixed(2)}€
                    </div>
                    <Badge
                      className={`mt-1 ${statusConfig.colors.bg} ${statusConfig.colors.color}`}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>

                {estimate.description && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {estimate.description}
                    </p>
                  </div>
                )}

                {estimate.status === BillingEstimateStatus.REJECTED &&
                  estimate.clientResponse && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-red-900 mb-1">
                            Raison du refus:
                          </p>
                          <p className="text-xs text-red-800 whitespace-pre-wrap">
                            {estimate.clientResponse}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {estimate.status === BillingEstimateStatus.EXPIRED && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-600 mt-0.5" />
                      <p className="text-xs text-gray-700">
                        Ce devis a expiré le{" "}
                        {moment(estimate.validUntil).format("DD/MM/YYYY")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
