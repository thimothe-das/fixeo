"use client";

import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Eye,
  Phone,
  Mail,
  Euro,
  Wrench,
  User,
  Badge as BadgeIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ServiceRequestForArtisan = {
  id: number;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  status: string;
  estimatedPrice?: number;
  createdAt: string;
  clientEmail?: string;
  clientName?: string;
  clientPhone?: string;
  isAssigned: boolean;
};

function RequestCard({
  request,
  onAccept,
}: {
  request: ServiceRequestForArtisan;
  onAccept?: (requestId: number) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "week":
        return "bg-orange-100 text-orange-800";
      case "flexible":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        request.isAssigned ? "border-green-200 bg-green-50/50" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold">
                {request.serviceType}
              </CardTitle>
              {request.isAssigned && (
                <Badge
                  variant="outline"
                  className="text-green-700 border-green-300"
                >
                  <BadgeIcon className="h-3 w-3 mr-1" />
                  Assigné
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(request.createdAt)}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(request.status)}>
              {getStatusIcon(request.status)}
              <span className="ml-1 capitalize">{request.status}</span>
            </Badge>
            <Badge className={getUrgencyColor(request.urgency)}>
              {request.urgency === "urgent"
                ? "🚨"
                : request.urgency === "week"
                ? "📅"
                : "⏰"}{" "}
              {request.urgency}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Description:
            </p>
            <p className="text-sm text-gray-600">{request.description}</p>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-blue-600" />
            {request.location}
          </div>

          {request.isAssigned && (
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Informations client
              </h4>
              <div className="space-y-2">
                {request.clientName && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Nom:</span>{" "}
                    {request.clientName}
                  </p>
                )}
                {request.clientEmail && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-3 w-3 mr-2" />
                    {request.clientEmail}
                  </p>
                )}
                {request.clientPhone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-3 w-3 mr-2" />
                    {request.clientPhone}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              {request.estimatedPrice && (
                <span className="text-sm font-medium text-green-600 flex items-center">
                  <Euro className="h-4 w-4 mr-1" />
                  {(request.estimatedPrice / 100).toFixed(2)} €
                </span>
              )}
            </div>

            {!request.isAssigned &&
              request.status === "pending" &&
              onAccept && (
                <Button
                  size="sm"
                  onClick={() => onAccept(request.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accepter
                </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceRequestsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-64">
          <CardHeader>
            <div className="animate-pulse space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ArtisanRequestsList() {
  const {
    data: requests,
    error,
    mutate,
  } = useSWR<ServiceRequestForArtisan[]>(
    "/api/service-requests/artisan",
    fetcher
  );
  console.log(requests);
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await fetch("/api/service-requests/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        // Refresh the data
        mutate();
      } else {
        console.error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-600">
            Erreur lors du chargement des demandes
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!requests) {
    return <ServiceRequestsListSkeleton />;
  }

  const assignedRequests = requests.filter((req) => req.isAssigned);
  const availableRequests = requests.filter((req) => !req.isAssigned);

  return (
    <div className="space-y-8">
      {/* Assigned Requests */}
      {assignedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Mes interventions ({assignedRequests.length})
          </h3>
          <div className="space-y-4">
            {assignedRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {/* Available Requests */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Wrench className="h-5 w-5 mr-2 text-blue-600" />
          Demandes disponibles ({availableRequests.length})
        </h3>
        {availableRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune demande disponible
                </h3>
                <p className="text-gray-600">
                  Aucune nouvelle demande ne correspond à vos spécialités pour
                  le moment
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {availableRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onAccept={handleAcceptRequest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArtisanStats() {
  const { data: stats } = useSWR("/api/artisan/stats", fetcher);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalRequests || 0}
            </div>
            <p className="text-sm text-gray-600">Demandes reçues</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats?.completedRequests || 0}
            </div>
            <p className="text-sm text-gray-600">Interventions terminées</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats?.avgRating || 0}/5
            </div>
            <p className="text-sm text-gray-600">Note moyenne</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ArtisanDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tableau de bord artisan
        </h1>
        <p className="text-gray-600">
          Gérez vos interventions et découvrez de nouvelles opportunités
        </p>
      </div>

      <ArtisanStats />

      <Suspense fallback={<ServiceRequestsListSkeleton />}>
        <ArtisanRequestsList />
      </Suspense>
    </div>
  );
}
