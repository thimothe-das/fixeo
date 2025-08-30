"use client";

import { Requests } from "./Requests";
import useSWR from "swr";
import { ServiceRequestForArtisan } from "../../components/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RequestsPage() {
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequestForArtisan[]>(
    "/api/service-requests/artisan",
    fetcher
  );

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await fetch("/api/service-requests/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        // Refresh the data
        mutateRequests();
      } else {
        console.error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const availableRequests = requests?.filter((req) => !req.isAssigned) || [];

  return (
    <Requests
      requests={availableRequests}
      onAcceptRequest={handleAcceptRequest}
    />
  );
}
