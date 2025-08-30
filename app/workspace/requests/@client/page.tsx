"use client";

import useSWR from "swr";
import { ArtisanStats, ServiceRequestForArtisan } from "../../components/types";
import { ServiceRequest, ServiceRequestStatus } from "@/lib/db/schema";
import { ClientRequestsListComponent } from "./Requests";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequest[]>("/api/service-requests/client", fetcher);

  return (
    <ClientRequestsListComponent
      requests={requests || []}
      onViewEstimate={(estimateId) => {
        // Navigate to estimates section and show specific estimate
        // You could add a way to highlight/open specific estimate here
      }}
      onRequestUpdate={mutateRequests}
    />
  );
}
