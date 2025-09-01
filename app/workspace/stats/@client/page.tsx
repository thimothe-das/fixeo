"use client";

import { ServiceRequest } from "@/lib/db/schema";
import useSWR from "swr";
import Stats from "./Stats";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StatsPage() {
  const {
    data: requests = [] as ServiceRequest[],
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequest[]>("/api/service-requests/client", fetcher);

  return <Stats requests={requests} />;
}
