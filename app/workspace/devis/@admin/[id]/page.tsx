"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calculator,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  Wrench,
  Zap,
  Settings,
  Hammer,
  PaintBucket,
  Monitor,
  Database,
  CreditCard,
  Building,
  Info,
  Tag,
  ShoppingCart,
  Phone,
  ReceiptText,
} from "lucide-react";
import type {
  BillingEstimateForClient,
  BillingEstimateBreakdownItem,
} from "../../../components/types";
import moment from "moment";
import useSWR, { mutate } from "swr";
import { useParams } from "next/navigation";
import { useAdminBillingEstimate } from "@/hooks/use-billing-estimate";

interface EstimatedBillProps {
  estimate: BillingEstimateForClient;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EstimatedBill() {
  const params = useParams();
  const estimateId = parseInt(params.id as string);

  const {
    estimate,
    error: requestsError,
    isLoading,
    mutate,
  } = useAdminBillingEstimate(estimateId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-3 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (requestsError || !estimate) {
    return (
      <div className="min-h-screen bg-white pt-3 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Erreur lors du chargement du devis
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
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
        return "En attente de validation";
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

  const isExpired =
    estimate.validUntil && new Date(estimate.validUntil) < new Date();

  const breakdown: BillingEstimateBreakdownItem[] = estimate.breakdown
    ? JSON.parse(estimate.breakdown)
    : [];

  // Get default breakdown data if none exists

  const breakdownData = breakdown.length > 0 ? breakdown : [];
  const billNumber = `EST-${
    estimate.createdAt
      ? new Date(estimate.createdAt).getFullYear()
      : new Date().getFullYear()
  }-${String(estimate.id || 0).padStart(4, "0")}`;

  return (
    <div
      className="min-h-screen bg-white pt-3 relative"
      style={
        {
          "--font-sans":
            'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          "--font-serif":
            'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
          "--font-mono":
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontFamily: "'Inter', sans-serif",
        } as React.CSSProperties
      }
    >
      {/* Top Status Bar */}
      {estimate.status === "pending" && (
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border-b border-orange-200 py-3 absolute top-0 left-0 right-0">
          <div className="max-w-7xl mx-auto flex items-center px-4 gap-4 justify-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-800 font-medium">
                Ce devis est en attente de validation par le client
              </span>
            </div>
            <Badge className="text-xs bg-orange-500 text-white font-bold uppercase tracking-wide">
              En attente de validation
            </Badge>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Devis de mission #{billNumber}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    Créé le {moment(estimate.createdAt).format("DD/MM/YYYY")}
                  </span>
                  {estimate.validUntil && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-600" />
                      Valide jusqu'au:{" "}
                      {moment(estimate.validUntil).format("DD/MM/YYYY")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building className="h-4 w-4 text-gray-600" />
                    TechSolutions Inc.
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <Badge
                  className={`${getStatusColor(
                    estimate.status
                  )} text-xs font-medium px-3 py-1`}
                >
                  <Clock className="h-4 w-4 text-orange-600 mr-1" />
                  {getStatusLabel(estimate.status)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {((estimate.estimatedPrice || 0) / 100).toFixed(2)}€
              </div>
              <div className="text-lg text-gray-600">Montant estimé</div>
              <div className="text-sm text-green-600 mt-& flex items-center gap-1">
                <Info className="h-4 w-4 text-green-600" /> Inclus les taxes et
                frais
              </div>
            </div>
          </div>
        </div>

        {/* Bill From, Bill To, Project Details */}
        <div className="rounded-lg py-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bill From */}
            <div className="bg-gray-50 rounded-lg p-4 ">
              <h3 className="font-semibold text-gray-900 mb-2">
                Devis réalisé par
              </h3>
              <div className="space-y-2">
                <div className="font-medium text-gray-900">Fixeo</div>
                <div className="text-gray-500 text-xs">Dijon, France</div>
                <div className="text-gray-500 text-xs">New York, NY 10001</div>
                <div className="text-gray-500 text-xs">contact@fixeo.fr</div>
                <div className="text-gray-500 text-xs">+33 6 51 36 66 84</div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Informations client
              </h3>
              <div className="space-y-2">
                <div className="text-gray-500 text-xs">
                  Les informations client seront disponibles via l'API des devis
                  admin.
                </div>
                <div className="text-gray-500 text-xs">
                  Service demandé:{" "}
                  {estimate.serviceRequest?.serviceType || "N/A"}
                </div>
                <div className="text-gray-500 text-xs">
                  Lieu: {estimate.serviceRequest?.location || "N/A"}
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 justify-between align-center ">
                <h3 className="font-semibold text-gray-900 ">
                  Détails du projet
                </h3>
                <Badge
                  className="ml- 2 bg-blue-100 text-blue-800"
                  variant="outline"
                >
                  {estimate.serviceRequest?.serviceType}
                </Badge>
              </div>

              <div className="space-y-2 text-gray-600">
                <div>
                  <span className="text-sm">
                    {estimate.serviceRequest?.description}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-600" />

                  <span className="text-gray-500 text-xs">Crée le</span>
                  <span className="text-gray-500 text-xs">
                    {moment(estimate.serviceRequest?.createdAt).format(
                      "DD/MM/YYYY"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="rounded-lg flex align-center gap-2 items-center mb-3">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900  ">
              Description du projet
            </h3>
          </div>

          <p className="text-gray-700 leading-relaxed text-xs">
            {estimate.description}
          </p>

          {/* <div className="flex items-center text-sm text-gray-600 gap-2 mt-3">
            <span className="inline-flex items-center  rounded-full text-xs font-medium">
              <Tag className="h-3 w-3  mr-2 text-blue-800" /> Développement web
            </span>
            <span className="inline-flex items-center rounded-full text-xs font-medium  ">
              <Tag className="h-3 w-3  mr-2 text-blue-800" /> Plateforme
              e-commerce
            </span>
            <span className="inline-flex items-center rounded-full text-xs font-medium ">
              <Tag className="h-3 w-3  mr-2 text-blue-800" /> Full-Stack
            </span>
          </div> */}
        </div>

        {/* Budget Breakdown */}
        <div className="">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            En détail
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix unitaire
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                    <span className="text-xs text-gray-500">
                      (Inclus les taxes et frais)
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakdownData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ReceiptText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.description}
                          </div>

                          {(item as any).phase && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              {(item as any).phase} • {item.quantity || 80}{" "}
                              heures estimées
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-gray-900 font-medium">
                        {item.quantity || 80}
                      </span>
                      <div className="text-xs text-gray-500">
                        {(item as any).unit || ""}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-gray-900 font-medium">
                        {((item.unitPrice || 12500) / 100).toFixed(2)}€
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-gray-900 font-bold">
                        {(
                          (item.total ||
                            Math.round(
                              (estimate.estimatedPrice || 0) /
                                Math.max(breakdownData.length, 1)
                            )) / 100
                        ).toFixed(2)}
                        €
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Total Row */}
              <tfoot className="bg-gray-50 border-gray-300">
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-right">
                    <span className="text-lg font-bold text-gray-900">
                      Total estimé:
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-xl font-bold text-blue-600">
                      {((estimate.estimatedPrice || 0) / 100).toFixed(2)}€
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Status Information for Admin */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">
                  Information administrateur
                </h3>
              </div>
              <p className="text-sm text-blue-700">
                {estimate.status === "pending" &&
                  "Ce devis est en attente de validation par le client."}
                {estimate.status === "accepted" &&
                  "Ce devis a été accepté par le client. Les travaux peuvent commencer."}
                {estimate.status === "rejected" &&
                  "Ce devis a été refusé par le client."}
                {(estimate.status as string) === "expired" &&
                  "Ce devis a expiré."}
              </p>
            </div>
          </div>

          {estimate.status === "accepted" && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 px-6 py-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-800">
                    Facture acceptée
                  </div>
                  <div className="text-sm text-green-700">
                    Acceptée le{" "}
                    {moment(estimate.createdAt).format("DD/MM/YYYY")} • Le
                    travail peut commencer
                  </div>
                </div>
              </div>
            </div>
          )}

          {estimate.status === "rejected" && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-red-800">
                    Facture refusée
                  </div>
                  <div className="text-sm text-red-700">
                    Un nouveau devis peut être demandé si nécessaire
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {estimate.status === "pending" && isExpired && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Devis expiré</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Ce devis a expiré. L'administration peut créer un nouveau devis
                si nécessaire.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
