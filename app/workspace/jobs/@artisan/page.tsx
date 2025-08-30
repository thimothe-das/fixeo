"use client";

import Jobs from "./Jobs";
import { ServiceRequestForArtisan } from "../../components/types";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JobsPage() {
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequestForArtisan[]>(
    "/api/service-requests/artisan",
    fetcher
  );
  const assignedRequests = requests?.filter((req) => req.isAssigned) || [];

  return <Jobs assignedRequests={assignedRequests} />;
}
