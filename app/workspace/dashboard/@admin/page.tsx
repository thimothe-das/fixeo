"use client";

import { Dashboard } from "./Dashboard";
import useSWR from "swr";
import {
  AdminStats,
  ArtisanStats,
  ServiceRequestForAdmin,
  ServiceRequestForArtisan,
} from "../../components/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequestForAdmin[]>("/api/admin/service-requests", fetcher);
  const { data: stats } = useSWR<AdminStats>("/api/admin/stats", fetcher);

  return <Dashboard stats={stats} recentRequests={requests || []} />;
}
