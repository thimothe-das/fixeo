"use client";
import useSWR from "swr";
import { ClientEstimatesComponent, EstimatedBills } from "./EstimatedBills";
import { ServiceRequest } from "@/lib/db/schema";

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
