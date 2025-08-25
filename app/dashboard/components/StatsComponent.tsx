"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ArtisanStats = {
  totalRequests: number;
  completedRequests: number;
  avgRating: number;
  todayRevenue: number;
  todayJobs: number;
  monthlyRevenue: number;
  totalJobs: number;
};

interface StatsComponentProps {
  stats?: ArtisanStats;
}

export function StatsComponent({ stats }: StatsComponentProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Revenus totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.monthlyRevenue || 0}€
            </div>
            <p className="text-xs text-green-600">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Missions totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
            <p className="text-xs text-green-600">Toutes missions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Demandes reçues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRequests || 0}
            </div>
            <p className="text-xs text-gray-600">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgRating || 0}/5</div>
            <p className="text-xs text-gray-600">
              {stats?.completedRequests || 0} avis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Graphique des revenus mensuels</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume de missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Graphique du nombre de missions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
