"use client";

import { DollarSign, Wrench, Star, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  photos?: string;
  isAssigned: boolean;
};

type ArtisanStats = {
  totalRequests: number;
  completedRequests: number;
  avgRating: number;
  todayRevenue: number;
  todayJobs: number;
  monthlyRevenue: number;
  totalJobs: number;
};

interface OverviewComponentProps {
  stats?: ArtisanStats;
  assignedRequests: ServiceRequestForArtisan[];
  availableRequests: ServiceRequestForArtisan[];
  onNavigateToSection: (section: string) => void;
}

export function OverviewComponent({
  stats,
  assignedRequests,
  availableRequests,
  onNavigateToSection,
}: OverviewComponentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h1>
        <p className="text-gray-600">Bonjour, voici votre activité du jour</p>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenus du jour
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.todayRevenue || 0}€
            </div>
            <p className="text-xs text-gray-600">+12% par rapport à hier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Missions du jour
            </CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayJobs || 0}</div>
            <p className="text-xs text-gray-600">2 terminées, 1 en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgRating || 0}/5</div>
            <p className="text-xs text-gray-600">Basé sur 156 avis</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertes importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableRequests.some((req) => req.urgency === "urgent") && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">
                  {
                    availableRequests.filter((req) => req.urgency === "urgent")
                      .length
                  }{" "}
                  mission(s) urgente(s) disponible(s)
                </span>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
          )}
          {availableRequests.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">
                  {availableRequests.length} nouvelle(s) demande(s)
                  disponible(s)
                </span>
              </div>
              <Badge variant="secondary">Nouveau</Badge>
            </div>
          )}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">2 messages non lus</span>
            </div>
            <Badge variant="secondary">Nouveau</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Mes prochaines missions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedRequests.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune mission assignée
                </h3>
                <p className="text-gray-600">
                  Consultez la section "Demandes" pour accepter de nouvelles
                  missions
                </p>
              </div>
            ) : (
              assignedRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{request.serviceType}</h4>
                      <p className="text-sm text-gray-600">
                        {request.clientName || "Georges"} •{" "}
                        {new Date(request.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {request.estimatedPrice
                        ? (request.estimatedPrice / 100).toFixed(2) + "€"
                        : "Prix à définir"}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => onNavigateToSection("jobs")}
                    >
                      Voir détails
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
