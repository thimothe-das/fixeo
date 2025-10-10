"use client";

import type { BillingEstimateForClient } from "@/app/workspace/components/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BillingEstimateStatus } from "@/lib/db/schema";
import { getBillingEstimateStatusConfig, getCategoryConfig } from "@/lib/utils";
import {
  AlertTriangle,
  Calculator,
  CheckCircle,
  Euro,
  FileText,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface EstimatedBillsProps {
  onEstimateResponse?: () => void;
}

export function EstimatedBills({ onEstimateResponse }: EstimatedBillsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEstimate, setSelectedEstimate] = useState<number | null>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [dialogEstimateId, setDialogEstimateId] = useState<number | null>(null);
  const router = useRouter();
  const {
    data: estimates,
    error,
    mutate,
  } = useSWR<BillingEstimateForClient[]>(
    "/api/artisan/billing-estimates",
    fetcher
  );

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
        await mutate();
        setSelectedEstimate(null);
        onEstimateResponse?.();
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

  const handleAcceptQuote = async () => {
    if (!dialogEstimateId) return;
    await handleEstimateResponse(dialogEstimateId, "accept");
    setShowAcceptDialog(false);
    setDialogEstimateId(null);
  };

  const handleRejectQuote = async () => {
    if (!dialogEstimateId) return;
    await handleEstimateResponse(dialogEstimateId, "reject");
    setShowRejectDialog(false);
    setDialogEstimateId(null);
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
    if (
      a.status === BillingEstimateStatus.PENDING &&
      b.status !== BillingEstimateStatus.PENDING
    )
      return -1;
    if (
      a.status !== BillingEstimateStatus.PENDING &&
      b.status === BillingEstimateStatus.PENDING
    )
      return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
              Impossible de charger vos devis. Veuillez réessayer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mes devis</h1>
          <p className="text-gray-600 mt-1">
            Gérez et examinez vos devis en attente de validation
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
                <FileText className="h-5 w-5 text-gray-600" />
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

      {/* Estimates List Section */}
      <div className="space-y-4 ">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Mes devis</h2>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-auto">
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
          ) : sortedEstimates.length === 0 ? (
            <div className="p-12 text-center">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun devis trouvé
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Vous n'avez pas de devis en attente de validation"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedEstimates.map((estimate) => {
                const categoryConfig = getCategoryConfig(
                  estimate.serviceRequest?.serviceType,
                  "h-4 w-4"
                );
                const isExpired =
                  estimate.validUntil &&
                  new Date(estimate.validUntil) < new Date();
                const needsResponse =
                  estimate.status === BillingEstimateStatus.PENDING &&
                  !isExpired;
                const estimateStatusConfig = getBillingEstimateStatusConfig(
                  estimate.status,
                  "h-3 w-3"
                );

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
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`font-medium text-gray-900 flex items-center gap-2`}
                          >
                            {categoryConfig.icon}
                            {categoryConfig.type}
                          </h3>
                          <Badge
                            className={`${estimateStatusConfig.colors.bg} ${estimateStatusConfig.colors.text} border-${estimateStatusConfig.colors.color} border text-xs font-medium px-2 py-1 pointer-events-none`}
                          >
                            {estimateStatusConfig.icon}
                            <span className="ml-1">
                              {estimateStatusConfig.label}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {estimate.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Créé le :{" "}
                          {moment(estimate.createdAt).format("DD/MM/YYYY")}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {(estimate.estimatedPrice / 100).toFixed(2)} €
                          </div>
                          {estimate.status ===
                            BillingEstimateStatus.PENDING && (
                            <p className="text-xs text-gray-500 mb-2">
                              Créé le{" "}
                              {moment(estimate.createdAt).format("DD/MM/YYYY")}
                            </p>
                          )}
                          {estimate.status ===
                            BillingEstimateStatus.ACCEPTED && (
                            <p className="text-xs text-gray-500">
                              Accepté le{" "}
                              {moment(estimate.createdAt).format("DD/MM/YYYY")}
                            </p>
                          )}
                          {estimate.status ===
                            BillingEstimateStatus.REJECTED && (
                            <p className="text-xs text-gray-500">
                              Refusé le:{" "}
                              {moment(estimate.createdAt).format("DD/MM/YYYY")}
                            </p>
                          )}
                          {needsResponse && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDialogEstimateId(estimate.id);
                                  setShowRejectDialog(true);
                                }}
                                disabled={isResponding}
                              >
                                <XCircle className="h-4 w-4" />
                                Refuser
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDialogEstimateId(estimate.id);
                                  setShowAcceptDialog(true);
                                }}
                                disabled={isResponding}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Accepter
                              </Button>
                            </div>
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

      {/* Confirmation Dialogs */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accepter le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir accepter ce devis de{" "}
              {dialogEstimateId &&
                estimates?.find((e) => e.id === dialogEstimateId) &&
                `$${(
                  estimates.find((e) => e.id === dialogEstimateId)!
                    .estimatedPrice / 100
                ).toFixed(2)}`}{" "}
              ? Cette action déclenchera le début des travaux.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcceptQuote}
              disabled={isResponding}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isResponding ? "En cours..." : "Accepter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refuser le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir refuser ce devis ? L'artisan sera notifié
              de votre décision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectQuote}
              disabled={isResponding}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isResponding ? "En cours..." : "Refuser"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
