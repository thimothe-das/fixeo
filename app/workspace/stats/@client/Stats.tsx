import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Charts component - remove if recharts is not available
import {
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  Euro,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { ServiceRequestStatus } from "@/lib/db/schema";

interface ServiceRequest {
  id: number;
  title?: string;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  status: string;
  estimatedPrice?: number;
  createdAt: string;
  photos?: string;
  assignedArtisan?: {
    id: number;
    name: string;
    email: string;
  };
}

interface StatsProps {
  requests: ServiceRequest[];
}

export default function Stats({ requests }: StatsProps) {
  // Calculate statistics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (req) =>
      req.status === ServiceRequestStatus.AWAITING_ASSIGNATION ||
      req.status === "pending" // Legacy support
  ).length;
  const completedRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.COMPLETED
  ).length;
  const cancelledRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.CANCELLED
  ).length;
  const inProgressRequests = requests.filter(
    (req) =>
      req.status === ServiceRequestStatus.IN_PROGRESS ||
      req.status === "accepted" // Legacy support
  );

  const totalSpent = requests
    .filter(
      (req) =>
        req.estimatedPrice && req.status === ServiceRequestStatus.COMPLETED
    )
    .reduce((sum, req) => sum + (req.estimatedPrice || 0), 0);

  const averagePrice =
    completedRequests > 0 ? totalSpent / completedRequests : 0;

  // Get requests from this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const requestsThisMonth = requests.filter(
    (req) => new Date(req.createdAt) >= thisMonth
  ).length;

  // Service type breakdown
  const serviceTypeBreakdown = requests.reduce((acc, req) => {
    acc[req.serviceType] = (acc[req.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedService = Object.entries(serviceTypeBreakdown).sort(
    ([, a], [, b]) => b - a
  )[0];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total demandes
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">demandes soumises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {requestsThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">nouvelles demandes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedRequests}
            </div>
            <p className="text-xs text-muted-foreground">
              interventions réalisées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total dépensé</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(totalSpent / 100).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">
              {completedRequests} interventions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Répartition par statut
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                <span className="text-sm">En attente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${
                        totalRequests > 0
                          ? (pendingRequests / totalRequests) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{pendingRequests}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm">Terminées</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        totalRequests > 0
                          ? (completedRequests / totalRequests) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{completedRequests}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-4 w-4 mr-2 bg-red-600 rounded-full"></div>
                <span className="text-sm">Annulées</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${
                        totalRequests > 0
                          ? (cancelledRequests / totalRequests) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{cancelledRequests}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Types de services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(serviceTypeBreakdown).length > 0 ? (
              Object.entries(serviceTypeBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([service, count]) => (
                  <div
                    key={service}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm capitalize">{service}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              totalRequests > 0
                                ? (count / totalRequests) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">
                Aucune donnée disponible
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {totalRequests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Service le plus demandé:</p>
                <p className="font-medium capitalize">
                  {mostUsedService
                    ? `${mostUsedService[0]} (${mostUsedService[1]} fois)`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Prix moyen par intervention:</p>
                <p className="font-medium">
                  {averagePrice > 0
                    ? `${(averagePrice / 100).toFixed(2)} €`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Taux de réussite:</p>
                <p className="font-medium">
                  {totalRequests > 0
                    ? `${((completedRequests / totalRequests) * 100).toFixed(
                        1
                      )}%`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Demandes ce mois:</p>
                <p className="font-medium">{requestsThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
