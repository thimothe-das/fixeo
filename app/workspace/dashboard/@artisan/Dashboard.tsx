"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceRequestStatus } from "@/lib/db/schema";
import { Urgency } from "@/lib/utils";
import { AlertTriangle, Euro, MapPin, Star, Wrench } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

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
  title?: string;
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

interface DashboardProps {
  stats?: ArtisanStats;
  assignedRequests: ServiceRequestForArtisan[];
}

export function Dashboard({ stats, assignedRequests }: DashboardProps) {
  const router = useRouter();
  const monthlyRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return assignedRequests
      .filter((request) => {
        const requestDate = new Date(request.createdAt);
        return (
          requestDate.getMonth() === currentMonth &&
          requestDate.getFullYear() === currentYear &&
          request.status === ServiceRequestStatus.COMPLETED &&
          request.estimatedPrice
        );
      })
      .reduce((total, request) => total + (request.estimatedPrice || 0), 0);
  }, [assignedRequests]);

  const currentMissions = useMemo(() => {
    const activeMissionStatuses = [
      ServiceRequestStatus.IN_PROGRESS,
      ServiceRequestStatus.CLIENT_VALIDATED,
      ServiceRequestStatus.ARTISAN_VALIDATED,
    ];
    return assignedRequests.filter((request) =>
      activeMissionStatuses.includes(request.status as ServiceRequestStatus)
    ).length;
  }, [assignedRequests]);

  // Calculate previous month's revenue for comparison
  const previousMonthRevenue = useMemo(() => {
    const currentDate = new Date();
    const previousMonth =
      currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
    const previousMonthYear =
      currentDate.getMonth() === 0
        ? currentDate.getFullYear() - 1
        : currentDate.getFullYear();

    return assignedRequests
      .filter((request) => {
        const requestDate = new Date(request.createdAt);
        return (
          requestDate.getMonth() === previousMonth &&
          requestDate.getFullYear() === previousMonthYear &&
          request.status === ServiceRequestStatus.COMPLETED &&
          request.estimatedPrice
        );
      })
      .reduce((total, request) => total + (request.estimatedPrice || 0), 0);
  }, [assignedRequests]);

  const revenueChangePercentage = useMemo(() => {
    if (previousMonthRevenue === 0) {
      return monthlyRevenue > 0 ? "+100%" : "0%";
    }
    const change =
      ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  }, [monthlyRevenue, previousMonthRevenue]);

  const { completedMissions, inProgressMissions, urgentInProgressMissions } =
    useMemo(() => {
      const completed = assignedRequests.filter(
        (request) => request.status === ServiceRequestStatus.COMPLETED
      ).length;

      const inProgressRequests = assignedRequests.filter((request) =>
        [
          ServiceRequestStatus.IN_PROGRESS,
          ServiceRequestStatus.CLIENT_VALIDATED,
          ServiceRequestStatus.ARTISAN_VALIDATED,
        ].includes(request.status as ServiceRequestStatus)
      );

      const inProgress = inProgressRequests.length;
      const urgentInProgress = inProgressRequests.filter(
        (request) => request.urgency === Urgency.URGENT
      ).length;

      return {
        completedMissions: completed,
        inProgressMissions: inProgress,
        urgentInProgressMissions: urgentInProgress,
      };
    }, [assignedRequests]);

  const alertsData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Urgent in-progress assigned requests
    const urgentInProgressRequests = assignedRequests.filter(
      (request) =>
        request.urgency === Urgency.URGENT &&
        [
          ServiceRequestStatus.IN_PROGRESS,
          ServiceRequestStatus.CLIENT_VALIDATED,
          ServiceRequestStatus.ARTISAN_VALIDATED,
        ].includes(request.status as ServiceRequestStatus)
    );

    const disputedRequests = assignedRequests.filter((request) =>
      [
        ServiceRequestStatus.DISPUTED_BY_BOTH,
        ServiceRequestStatus.DISPUTED_BY_CLIENT,
        ServiceRequestStatus.DISPUTED_BY_ARTISAN,
      ].includes(request.status as ServiceRequestStatus)
    );

    const clientValidatedTodayRequests = assignedRequests.filter((request) => {
      const requestDate = new Date(request.createdAt);
      return (
        request.status === ServiceRequestStatus.CLIENT_VALIDATED &&
        requestDate >= today &&
        requestDate < tomorrow
      );
    });

    return {
      urgentInProgressRequests,
      disputedRequests,
      clientValidatedTodayRequests,
    };
  }, [assignedRequests]);

  const upcomingMissions = useMemo(() => {
    return assignedRequests
      .filter((request) => request.status === ServiceRequestStatus.IN_PROGRESS)
      .sort((a, b) => {
        if (a.urgency === Urgency.URGENT && b.urgency !== Urgency.URGENT)
          return -1;
        if (b.urgency === Urgency.URGENT && a.urgency !== Urgency.URGENT)
          return 1;

        return moment(b.createdAt).unix() - moment(a.createdAt).unix();
      });
  }, [assignedRequests]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Vue d'ensemble sur Fixeo
        </h1>
        <p className="text-gray-600">Bonjour, voici votre activité du jour</p>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenus du mois
            </CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(monthlyRevenue / 100).toFixed(2)}€
            </div>
            <p className="text-xs text-gray-600">
              {revenueChangePercentage} par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Missions en cours
            </CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMissions}</div>
            <p className="text-xs text-gray-600">
              Dont{" "}
              <span className="text-red-600 font-medium">
                {urgentInProgressMissions} urgente
                {urgentInProgressMissions > 1 && "s"}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Litiges en cours
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertsData.disputedRequests.length}
            </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertes importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alertsData.urgentInProgressRequests.map((request) => (
            <div
              key={`urgent-${request.id}`}
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <span className="text-sm font-medium">
                    Mission urgente en cours
                  </span>
                  <p className="text-xs text-gray-600">
                    {request.serviceType} • {request.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Urgent</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/workspace/jobs/${request.id}`)}
                >
                  Voir
                </Button>
              </div>
            </div>
          ))}

          {alertsData.disputedRequests.map((request) => (
            <div
              key={`disputed-${request.id}`}
              className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <span className="text-sm font-medium">Mission en litige</span>
                  <p className="text-xs text-gray-600">
                    {request.serviceType} • {request.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  Litige
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/workspace/jobs/${request.id}`)}
                >
                  Résoudre
                </Button>
              </div>
            </div>
          ))}

          {alertsData.clientValidatedTodayRequests.map((request) => (
            <div
              key={`validated-${request.id}`}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <span className="text-sm font-medium">
                    Mission validée par le client
                  </span>
                  <p className="text-xs text-gray-600">
                    {request.serviceType} • {request.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Validée
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/workspace/jobs/${request.id}`)}
                >
                  Voir
                </Button>
              </div>
            </div>
          ))}

          {alertsData.urgentInProgressRequests.length === 0 &&
            alertsData.disputedRequests.length === 0 &&
            alertsData.clientValidatedTodayRequests.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune alerte
                </h3>
                <p className="text-gray-600">Toutes vos missions sont à jour</p>
              </div>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes prochaines missions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMissions.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune mission en cours
                </h3>
                <p className="text-gray-600">
                  Aucune mission en cours. Consultez la section "Demandes" pour
                  accepter de nouvelles missions.
                </p>
              </div>
            ) : (
              upcomingMissions.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border-l-4 border-blue-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{request.title}</h4>
                        {request.urgency === Urgency.URGENT && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Créé le {moment(request.createdAt).format("DD/MM/YYYY")}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
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
                      className="mt-2 text-white"
                      onClick={() =>
                        router.push(`/workspace/jobs/${request.id}`)
                      }
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
