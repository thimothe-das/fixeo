"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  Search,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { ClientEstimateReviewComponent } from "./ClientEstimateReviewComponent";
import type { BillingEstimateForClient } from "../components/types";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ClientEstimatesComponentProps {
  onEstimateResponse?: () => void;
}

export function ClientEstimatesComponent({
  onEstimateResponse,
}: ClientEstimatesComponentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEstimate, setSelectedEstimate] = useState<number | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  const {
    data: estimates,
    error,
    mutate,
  } = useSWR<BillingEstimateForClient[]>(
    "/api/client/billing-estimates",
    fetcher
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "accepted":
        return "Accepté";
      case "rejected":
        return "Refusé";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleEstimateResponse = async (
    estimateId: number,
    action: "accept" | "reject",
    response?: string
  ) => {
    setIsResponding(true);
    try {
      const apiResponse = await fetch("/api/client/billing-estimates/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimateId,
          action,
          response,
        }),
      });

      if (apiResponse.ok) {
        await mutate(); // Refresh estimates
        setSelectedEstimate(null); // Close detail view
        onEstimateResponse?.(); // Notify parent component
      } else {
        const error = await apiResponse.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error responding to estimate:", error);
      alert("Erreur lors de la réponse au devis");
    } finally {
      setIsResponding(false);
    }
  };

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
  const sortedEstimates = filteredEstimates.sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pendingCount = (estimates || []).filter(
    (e) => e.status === "pending"
  ).length;
  const expiredCount = (estimates || []).filter((e) => {
    const isExpired = e.validUntil && new Date(e.validUntil) < new Date();
    return e.status === "pending" && isExpired;
  }).length;

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
              Impossible de charger vos devis. Veuillez réessayer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedEstimate) {
    const estimate = estimates?.find((e) => e.id === selectedEstimate);
    if (estimate) {
      return (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setSelectedEstimate(null)}
            className="mb-4"
          >
            ← Retour à la liste
          </Button>
          <ClientEstimateReviewComponent
            estimate={estimate}
            onResponse={handleEstimateResponse}
            isLoading={isResponding}
          />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estimates?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expirés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {expiredCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par type de service, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="accepted">Accepté</SelectItem>
            <SelectItem value="rejected">Refusé</SelectItem>
            <SelectItem value="expired">Expiré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {sortedEstimates.length} devis trouvé
        {sortedEstimates.length !== 1 ? "s" : ""}
        {searchTerm && ` pour "${searchTerm}"`}
      </div>

      {/* Estimates list */}
      <div className="space-y-4">
        {!estimates ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : sortedEstimates.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Aucun devis trouvé
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Essayez de modifier vos critères de recherche"
                    : "Vous n'avez pas encore de devis"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedEstimates.map((estimate) => {
            const isExpired =
              estimate.validUntil && new Date(estimate.validUntil) < new Date();
            const needsResponse = estimate.status === "pending" && !isExpired;

            return (
              <Card
                key={estimate.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  needsResponse ? "border-yellow-200 bg-yellow-50" : ""
                }`}
                onClick={() => setSelectedEstimate(estimate.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Devis #{estimate.id}
                      </CardTitle>
                      <CardDescription>
                        {estimate.serviceRequest?.serviceType} -{" "}
                        {estimate.serviceRequest?.location}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(estimate.status)}>
                        {getStatusIcon(estimate.status)}
                        <span className="ml-1">
                          {getStatusLabel(estimate.status)}
                        </span>
                      </Badge>
                      {needsResponse && (
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-200"
                        >
                          Action requise
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {estimate.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-green-600">
                        {(estimate.estimatedPrice / 100).toFixed(2)} €
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(estimate.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                        {estimate.validUntil && (
                          <div
                            className={`flex items-center gap-1 ${
                              isExpired ? "text-red-500" : ""
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            Expire le{" "}
                            {new Date(estimate.validUntil).toLocaleDateString(
                              "fr-FR"
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {needsResponse && (
                      <div className="bg-yellow-100 border border-yellow-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            Ce devis nécessite votre réponse
                          </span>
                        </div>
                      </div>
                    )}

                    {isExpired && estimate.status === "pending" && (
                      <div className="bg-red-100 border border-red-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            Ce devis a expiré
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
