"use client";

import useSWR from "swr";
import Stats from "./Stats";
import { ServiceRequest } from "@/lib/db/schema";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StatsPage() {
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequest[]>("/api/service-requests/client", fetcher);

  return <Stats requests={requests || []} />;
}
