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
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  UserCheck,
  BarChart3,
} from "lucide-react";
import type { AdminStats, ServiceRequestForAdmin } from "../components/types";

interface AdminOverviewComponentProps {
  stats?: AdminStats;
  recentRequests: ServiceRequestForAdmin[];
  onNavigateToSection: (section: string) => void;
}

export function AdminOverviewComponent({
  stats,
  recentRequests,
  onNavigateToSection,
}: AdminOverviewComponentProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
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
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des demandes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes les demandes de service
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En attente de devis
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.awaitingEstimateRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Demandes nécessitant un devis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Devis en attente
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.pendingEstimates || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Devis en attente de réponse client
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completedRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">Demandes terminées</p>
          </CardContent>
        </Card>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tous les utilisateurs actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artisans</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalArtisans || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Professionnels enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.totalClients || 0}
            </div>
            <p className="text-xs text-muted-foreground">Clients enregistrés</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => onNavigateToSection("requests")}
          className="h-16 flex flex-col gap-1"
        >
          <FileText className="h-5 w-5" />
          <span>Gérer les demandes</span>
        </Button>
        <Button
          onClick={() => onNavigateToSection("users")}
          variant="outline"
          className="h-16 flex flex-col gap-1"
        >
          <Users className="h-5 w-5" />
          <span>Gérer les utilisateurs</span>
        </Button>
        <Button
          onClick={() => onNavigateToSection("stats")}
          variant="outline"
          className="h-16 flex flex-col gap-1"
        >
          <BarChart3 className="h-5 w-5" />
          <span>Voir les statistiques</span>
        </Button>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes récentes</CardTitle>
          <CardDescription>
            Les dernières demandes de service reçues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune demande récente
            </p>
          ) : (
            <div className="space-y-4">
              {recentRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                    request.status === "awaiting_estimate"
                      ? "border-purple-200 bg-purple-50"
                      : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{request.serviceType}</h4>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {request.description.length > 100
                        ? `${request.description.substring(0, 100)}...`
                        : request.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📍 {request.location}</span>
                      <span>
                        👤 {request.clientName || request.clientEmail}
                      </span>
                      <span>
                        📅{" "}
                        {new Date(request.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                      {request.assignedArtisan && (
                        <span>🔧 {request.assignedArtisan.name}</span>
                      )}
                    </div>
                  </div>
                  {request.estimatedPrice && (
                    <div className="text-lg font-semibold text-green-600">
                      {(request.estimatedPrice / 100).toFixed(2)} €
                    </div>
                  )}
                </div>
              ))}
              {recentRequests.length > 5 && (
                <Button
                  onClick={() => onNavigateToSection("requests")}
                  variant="outline"
                  className="w-full"
                >
                  Voir toutes les demandes ({recentRequests.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
