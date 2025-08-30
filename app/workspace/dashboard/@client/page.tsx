"use client";

import useSWR from "swr";
import { ArtisanStats, ServiceRequestForArtisan } from "../../components/types";
import { Dashboard } from "./Dashboard";
import { ServiceRequest, ServiceRequestStatus } from "@/lib/db/schema";
import { NewRequest } from "../../(client)/NewRequest";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequest[]>("/api/service-requests/client", fetcher);

  const activeRequests =
    requests?.filter((req) =>
      [ServiceRequestStatus.IN_PROGRESS].includes(
        req.status as ServiceRequestStatus
      )
    ) || [];
  const completedRequests =
    requests?.filter((req) => req.status === ServiceRequestStatus.COMPLETED) ||
    [];
  const disputedRequests =
    requests?.filter((req) =>
      [
        ServiceRequestStatus.DISPUTED_BY_CLIENT,
        ServiceRequestStatus.DISPUTED_BY_ARTISAN,
        ServiceRequestStatus.DISPUTED_BY_BOTH,
      ].includes(req.status as ServiceRequestStatus)
    ) || [];
  const pendingRequests =
    requests?.filter(
      (req) =>
        req.status === ServiceRequestStatus.AWAITING_ASSIGNATION ||
        req.status === ServiceRequestStatus.AWAITING_ESTIMATE
    ) || [];

  return (
    <>
      <Dashboard
        totalRequests={requests?.length || 0}
        disputedRequests={disputedRequests.length}
        pendingRequests={pendingRequests.length}
        activeRequests={activeRequests.length}
        completedRequests={completedRequests.length}
        recentRequests={requests?.slice(0, 3) || []}
        openNewRequestModal={() => {
          setIsNewRequestModalOpen(true);
        }}
      />
    </>
  );
}
