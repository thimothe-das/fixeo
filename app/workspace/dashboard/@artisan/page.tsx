"use client";

import useSWR from "swr";
import { ArtisanStats, ServiceRequestForArtisan } from "../../components/types";
import { Dashboard } from "./Dashboard";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequestForArtisan[]>(
    "/api/service-requests/artisan",
    fetcher
  );
  const { data: stats } = useSWR<ArtisanStats>("/api/artisan/stats", fetcher);
  const assignedRequests = requests
    ? requests?.filter((req) => req.isAssigned)
    : [];

  return <Dashboard stats={stats} assignedRequests={assignedRequests} />;
}
