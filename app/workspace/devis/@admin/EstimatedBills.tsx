"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BillingEstimateStatus } from "@/lib/db/schema";
import { getBillingEstimateStatusConfig } from "@/lib/utils";
import {
  AlertTriangle,
  Building2,
  Calculator,
  CheckCircle,
  Euro,
  Search,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import type { BillingEstimateForClient } from "../../components/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface EstimatedBillsProps {
  onEstimateResponse?: () => void;
}

export function EstimatedBills({ onEstimateResponse }: EstimatedBillsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  const {
    data: estimates,
    error,
    mutate,
  } = useSWR<BillingEstimateForClient[]>(
    "/api/admin/billing-estimates",
    fetcher
  );

  // Filter estimates
  const filteredEstimates = (estimates || []).filter((estimate) => {
    const matchesSearch =
      estimate.serviceRequest?.serviceType
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      estimate.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimate.serviceRequest?.location
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || estimate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort estimates: pending first, then by creation date

  const pendingCount = (estimates || []).filter(
    (e) => e.status === BillingEstimateStatus.PENDING
  ).length;

  const totalAmount = (estimates || []).reduce(
    (sum, estimate) => sum + estimate.estimatedPrice,
    0
  );

  const acceptedCount = (estimates || []).filter(
    (e) => e.status === BillingEstimateStatus.ACCEPTED
  ).length;

  const rejectedCount = (estimates || []).filter(
    (e) => e.status === BillingEstimateStatus.REJECTED
  ).length;

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Erreur de chargement
            </h3>
            <p className="text-gray-500">
              Impossible de charger les devis. Veuillez réessayer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Tous les devis
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez et examinez tous les devis de la plateforme
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Nombre de devis total
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {estimates?.length || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Acceptés</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {acceptedCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  En attente de validation
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {pendingCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Devis refusés</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {rejectedCount}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(totalAmount / 100).toFixed(2)} €
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par type de service, description ou lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-auto min-w-[200px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente de validation</SelectItem>
            <SelectItem value="accepted">Accepté</SelectItem>
            <SelectItem value="rejected">Refusé</SelectItem>
            <SelectItem value="expired">Expiré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estimates List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Liste des devis ({estimates?.length})
          </h2>
        </div>

        {/* Bills List */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {!estimates ? (
            // Loading skeleton
            <div className="divide-y divide-gray-200">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="h-3 bg-gray-200 rounded w-64"></div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : estimates?.length === 0 ? (
            <div className="p-12 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun devis trouvé
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Aucun devis n'a été créé sur la plateforme"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {estimates?.map((estimate) => {
                const isExpired =
                  estimate.validUntil &&
                  new Date(estimate.validUntil) < new Date();
                const estimateStatusConfig = getBillingEstimateStatusConfig(
                  estimate.status,
                  "h-3 w-3"
                );
                console.log(estimate);
                return (
                  <div
                    key={estimate.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/workspace/devis/${estimate.id}`)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-medium text-gray-900">
                            {estimate.serviceRequest?.title}
                          </h3>
                          <Badge
                            className={`${estimateStatusConfig.colors.bg} ${estimateStatusConfig.colors.text} border-${estimateStatusConfig.colors.color} border text-xs font-medium px-2 py-1`}
                          >
                            {estimateStatusConfig.icon}
                            <span className="ml-1">
                              {estimateStatusConfig.label}
                            </span>
                          </Badge>
                          {isExpired &&
                            estimate.status ===
                              BillingEstimateStatus.PENDING && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                Expiré
                              </Badge>
                            )}

                          {/* Artisan Rejection Badge */}
                          {estimate.artisanRejectionReason && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 border text-xs font-medium px-2 py-1">
                              <XCircle className="h-3 w-3 mr-1" />
                              Refusé par artisan
                            </Badge>
                          )}

                          {/* Dual Acceptance Badges */}
                          {estimate.artisanAccepted === true &&
                            estimate.clientAccepted === true && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 border text-xs font-medium px-2 py-1">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accepté par les 2 parties
                              </Badge>
                            )}

                          {/* Partial Acceptance Badges */}
                          {estimate.artisanAccepted === true &&
                            estimate.clientAccepted !== true && (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200 border text-xs font-medium px-2 py-1">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Artisan a accepté
                              </Badge>
                            )}

                          {estimate.clientAccepted === true &&
                            estimate.artisanAccepted !== true && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 border text-xs font-medium px-2 py-1">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Client a accepté
                              </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {estimate.description}
                        </p>

                        {/* Artisan Rejection Reason Detail */}
                        {estimate.artisanRejectionReason && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="font-semibold text-amber-900">
                                  Raison du refus artisan:
                                </span>
                                <p className="text-amber-800 mt-1">
                                  {estimate.artisanRejectionReason}
                                </p>
                                {estimate.rejectedAt && (
                                  <p className="text-amber-700 mt-1">
                                    Refusé le{" "}
                                    {moment(estimate.rejectedAt).format(
                                      "DD/MM/YYYY à HH:mm"
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {estimate.serviceRequest?.location || "N/A"}
                          </span>
                          <span>
                            Créé le:{" "}
                            {moment(estimate.createdAt).format("DD/MM/YYYY")}
                          </span>

                          {/* Show acceptance dates */}
                          {estimate.clientResponseDate && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Client:{" "}
                              {moment(estimate.clientResponseDate).format(
                                "DD/MM/YYYY"
                              )}
                            </span>
                          )}
                          {estimate.artisanResponseDate && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <CheckCircle className="h-3 w-3" />
                              Artisan:{" "}
                              {moment(estimate.artisanResponseDate).format(
                                "DD/MM/YYYY"
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {(estimate.estimatedPrice / 100).toFixed(2)} €
                          </div>
                          {estimate.validUntil && (
                            <p className="text-xs text-gray-500">
                              Valide jusqu'au:{" "}
                              {moment(estimate.validUntil).format("DD/MM/YYYY")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
