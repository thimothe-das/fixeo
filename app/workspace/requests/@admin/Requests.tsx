"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Zap,
  Wrench,
  Calculator,
  Plus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getStatusConfig,
  getCategoryConfig,
  getPriorityConfig,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import moment from "moment";
import { BillingEstimateForm } from "../../(admin)/BillingEstimateCreation";

interface ServiceRequest {
  id: number;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  status: string;
  estimatedPrice: number | null;
  clientEmail: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: number;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    profileId: number | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    address: string | null;
    addressHousenumber: string | null;
    addressStreet: string | null;
    addressPostcode: string | null;
    addressCity: string | null;
    addressCitycode: string | null;
    addressDistrict: string | null;
    addressCoordinates: string | null;
    addressContext: string | null;
    preferences: string | null;
    profileCreatedAt: string | null;
    profileUpdatedAt: string | null;
  } | null;
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ServiceRequestsResponse {
  requests: ServiceRequest[];
  pagination: PaginationInfo;
}

const formatCurrency = (amount: number | null) => {
  if (!amount) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 100);
};

const truncateText = (text: string, maxLength: number = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export function Requests({
  setUserId,
}: {
  setUserId: (userId: string | null) => void;
}) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [isCreatingEstimate, setIsCreatingEstimate] = useState(false);
  const router = useRouter();

  const fetchRequests = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/admin/service-requests?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data: ServiceRequestsResponse = await response.json();
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Erreur lors de la récupération des requêtes:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(pagination.currentPage, pagination.pageSize);
  }, []);

  const handlePageChange = (page: number) => {
    fetchRequests(page, pagination.pageSize);
  };

  const handlePageSizeChange = (pageSize: number) => {
    fetchRequests(1, pageSize); // Reset to first page when changing page size
  };

  const handleCreateEstimate = async (estimateData: {
    serviceRequestId: number;
    estimatedPrice: number;
    description: string;
    breakdown?: any[];
    validUntil?: string;
  }) => {
    try {
      setIsCreatingEstimate(true);

      const response = await fetch("/api/admin/billing-estimates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(estimateData),
      });

      if (!response.ok) {
        throw new Error("Failed to create billing estimate");
      }

      setShowEstimateModal(false);
      setSelectedRequestId(null);
      // Refresh requests to show updated data
      await fetchRequests(pagination.currentPage, pagination.pageSize);
    } catch (err) {
      console.error("Error creating estimate:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create estimate"
      );
    } finally {
      setIsCreatingEstimate(false);
    }
  };

  const openEstimateModal = (requestId: number) => {
    setSelectedRequestId(requestId);
    setShowEstimateModal(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Requêtes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Requêtes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Erreur: {error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="border-none shadow-none ">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Requêtes ({pagination.totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune requête trouvée.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Urgence</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        #{request.id}
                      </TableCell>

                      <TableCell>
                        <div className="max-w-[200px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm truncate cursor-help block">
                                {truncateText(request.description, 40)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-md">
                                <p className="text-sm">{request.description}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {
                            getCategoryConfig(request.serviceType, "h-4 w-4")
                              .icon
                          }
                          <span className="font-medium">
                            {getCategoryConfig(request.serviceType, "").type}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {request.client?.name && (
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-3 w-3 text-gray-400" />
                              <span>{request.client.name}</span>
                            </div>
                          )}
                          {request.clientEmail && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span>{request.clientEmail}</span>
                            </div>
                          )}
                          {request.client?.phone && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{request.client.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 max-w-[200px]">
                          <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm truncate cursor-help">
                                {request.client?.addressPostcode ||
                                  truncateText(request.location, 10)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-xs">
                                <p className="text-sm">
                                  {[
                                    request.client?.addressHousenumber,
                                    request.client?.addressStreet,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                  {[
                                    request.client?.addressHousenumber,
                                    request.client?.addressStreet,
                                  ].filter(Boolean).length > 0 && <br />}
                                  {[
                                    request.client?.addressPostcode,
                                    request.client?.addressCity,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                  {request.client?.addressDistrict && (
                                    <>
                                      <br />
                                      {request.client.addressDistrict}
                                    </>
                                  )}
                                  {!request.client?.addressCity &&
                                    request.location}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`${
                            getStatusConfig(request.status, "").color
                          } text-xs border`}
                        >
                          {getStatusConfig(request.status, "").label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`${
                            getPriorityConfig(request.urgency).color
                          } text-xs border`}
                        >
                          <span className="mr-1">
                            {getPriorityConfig(request.urgency, "h-3 w-3").icon}
                          </span>
                          {getPriorityConfig(request.urgency).label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(request.estimatedPrice)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Voir les détails"
                            onClick={() =>
                              router.push(`/workspace/requests/${request.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!request.estimatedPrice && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Créer un devis"
                                  onClick={() => openEstimateModal(request.id)}
                                >
                                  <Calculator className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Créer un devis</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {requests.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalCount={pagination.totalCount}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Billing Estimate Creation Modal */}
      <Dialog open={showEstimateModal} onOpenChange={setShowEstimateModal}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
          {selectedRequestId && (
            <BillingEstimateForm
              serviceRequestId={selectedRequestId}
              onSubmit={handleCreateEstimate}
              onCancel={() => {
                setShowEstimateModal(false);
                setSelectedRequestId(null);
              }}
              isLoading={isCreatingEstimate}
            />
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
