"use client";

import { useBillingEstimate } from "@/hooks/use-billing-estimate";
import { useParams } from "next/navigation";
import { useState } from "react";
import { EstimatedBillDetails } from "../../components/EstimatedBillDetails";

export default function EstimatedBill() {
  const params = useParams();
  const estimateId = parseInt(params.id as string);
  const [isResponding, setIsResponding] = useState(false);

  const {
    estimate,
    error: requestsError,
    isLoading,
    mutate,
  } = useBillingEstimate(estimateId);

  const handleEstimateResponse = async (
    estimateId: number,
    action: "accept" | "reject",
    response?: string
  ) => {
    setIsResponding(true);
    try {
      const apiResponse = await fetch("/api/client/billing-estimates/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estimateId,
          action,
          response,
        }),
      });

      if (apiResponse.ok) {
        await mutate(); // Refresh estimates
      } else {
        const error = await apiResponse.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error responding to estimate:", error);
      alert("Erreur lors de la réponse au devis");
    } finally {
      setIsResponding(false);
    }
  };

  const handleAccept = async () => {
    if (estimate) {
      await handleEstimateResponse(estimate.id, "accept");
    }
  };

  const handleReject = async (reason: string) => {
    if (estimate) {
      await handleEstimateResponse(estimate.id, "reject", reason);
    }
  };

  if (!estimate && !isLoading) {
    return (
      <EstimatedBillDetails
        role="client"
        estimate={null as any}
        isLoading={false}
        error={requestsError || new Error("No estimate found")}
      />
    );
  }

  return (
    <EstimatedBillDetails
      role="client"
      estimate={estimate as any}
      isLoading={isLoading}
      error={requestsError}
      onAccept={handleAccept}
      onReject={handleReject}
      isResponding={isResponding}
      showHistory={true}
    />
  );
}
