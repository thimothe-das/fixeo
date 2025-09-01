"use client";
import { ServiceRequest } from "@/lib/db/schema";
import useSWR from "swr";
import { EstimatedBills } from "./EstimatedBills";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EstimatedBillsPage() {
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequest[]>("/api/service-requests/client", fetcher);
  return (
    <EstimatedBills
      onEstimateResponse={() => {
        mutateRequests(); // Refresh requests when estimate is responded to
      }}
    />
  );
}
