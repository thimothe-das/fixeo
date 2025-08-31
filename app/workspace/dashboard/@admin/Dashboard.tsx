"use client";

import * as React from "react";
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
  Euro,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdminStats,
  ServiceRequestForAdmin,
} from "../../components/types";
import { useRouter } from "next/navigation";

const chartConfig = {
  requests: {
    label: "Demandes",
    color: "var(--chart-1)",
  },
  earnings: {
    label: "Revenus",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface DashboardProps {
  stats?: AdminStats;
  recentRequests: ServiceRequestForAdmin[];
}

export function Dashboard({ stats, recentRequests }: DashboardProps) {
  const router = useRouter();
  const [timeRange, setTimeRange] = React.useState("30d");

  const filteredData = React.useMemo(() => {
    if (!stats?.requestsTimeSeriesData || !stats?.earningsTimeSeriesData)
      return [];

    // Combine requests and earnings data by date
    const requestsMap = new Map(
      stats.requestsTimeSeriesData.map((item) => [item.date, item.count])
    );
    const earningsMap = new Map(
      stats.earningsTimeSeriesData.map((item) => [item.date, item.earnings])
    );

    // Get all unique dates and combine data
    const allDates = Array.from(
      new Set([
        ...stats.requestsTimeSeriesData.map((item) => item.date),
        ...stats.earningsTimeSeriesData.map((item) => item.date),
      ])
    ).sort();

    const data = allDates.map((date) => ({
      date,
      count: requestsMap.get(date) || 0,
      earnings: (earningsMap.get(date) || 0) / 100, // Convert from cents to euros
    }));

    if (timeRange === "7d") {
      return data.slice(-7);
    } else if (timeRange === "14d") {
      return data.slice(-14);
    }
    return data; // 30d - return all data
  }, [stats?.requestsTimeSeriesData, stats?.earningsTimeSeriesData, timeRange]);

  return (
    <div className="p-3 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
              Demandes nécessitant un devis admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En attente d'acceptation du devis
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En litige</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.disputedRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">Demandes en conflit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des revenus
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats?.totalEarnings
                ? `€${(stats.totalEarnings / 100).toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}`
                : "€0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenus des devis acceptés
            </p>
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

      {/* Requests Timeline Chart */}
      <Card className="w-full">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Demandes et revenus au fil du temps
            </CardTitle>
            <CardDescription>
              Évolution du nombre de demandes et des revenus
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Sélectionner une période"
            >
              <SelectValue placeholder="30 derniers jours" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">
                30 derniers jours
              </SelectItem>
              <SelectItem value="14d" className="rounded-lg">
                14 derniers jours
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 derniers jours
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune donnée disponible pour cette période</p>
              </div>
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-requests)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-requests)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-earnings)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-earnings)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    const day = date.getDate().toString().padStart(2, "0");
                    const month = (date.getMonth() + 1)
                      .toString()
                      .padStart(2, "0");
                    return `${day}/${month}`;
                  }}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `€${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                      }}
                      formatter={(value, name) => {
                        if (name === "earnings") {
                          return [
                            `${Number(value).toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                            })}€`,
                          ];
                        }
                        return [value, " Demandes"];
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="count"
                  type="natural"
                  fill="url(#fillRequests)"
                  stroke="var(--color-requests)"
                  strokeWidth={2}
                  yAxisId="left"
                />
                <Area
                  dataKey="earnings"
                  type="natural"
                  fill="url(#fillEarnings)"
                  stroke="var(--color-earnings)"
                  strokeWidth={2}
                  yAxisId="right"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
