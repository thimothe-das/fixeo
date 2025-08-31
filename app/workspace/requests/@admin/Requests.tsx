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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  getStatusConfig,
  getCategoryConfig,
  getPriorityConfig,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import moment from "moment";

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
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Urgence</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{request.id}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryConfig(request.serviceType, "h-4 w-4").icon}
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
                        <span
                          className="text-sm truncate"
                          title={request.location}
                        >
                          {truncateText(request.location, 30)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-[250px]">
                        <span
                          className="text-sm text-gray-700"
                          title={request.description}
                        >
                          {truncateText(request.description, 60)}
                        </span>
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
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>
                          {moment(request.createdAt).format("DD/MM/YYYY")}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
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
  );
}
