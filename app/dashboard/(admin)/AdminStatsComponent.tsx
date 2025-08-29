"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, FileText } from "lucide-react";
import type { AdminStats } from "../components/types";

interface AdminStatsComponentProps {
  stats?: AdminStats;
}

export function AdminStatsComponent({ stats }: AdminStatsComponentProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques administrateur
          </CardTitle>
          <CardDescription>
            Vue d'ensemble des métriques de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">
                {stats?.totalRequests || 0}
              </div>
              <div className="text-sm text-gray-600">Total demandes</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="text-sm text-gray-600">Total utilisateurs</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">
                {stats?.totalArtisans || 0}
              </div>
              <div className="text-sm text-gray-600">Artisans actifs</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">
                {stats?.totalClients || 0}
              </div>
              <div className="text-sm text-gray-600">Clients enregistrés</div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Répartition des demandes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">
                  {stats?.pendingRequests || 0}
                </div>
                <div className="text-sm text-gray-600">En attente</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {stats?.activeRequests || 0}
                </div>
                <div className="text-sm text-gray-600">En cours</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {stats?.completedRequests || 0}
                </div>
                <div className="text-sm text-gray-600">Terminées</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">
                  {(stats?.totalRequests || 0) -
                    (stats?.pendingRequests || 0) -
                    (stats?.activeRequests || 0) -
                    (stats?.completedRequests || 0)}
                </div>
                <div className="text-sm text-gray-600">Autres</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
