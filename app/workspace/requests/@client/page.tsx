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
      onRequestUpdate={mutateRequests}
    />
  );
}
