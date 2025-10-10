"use client";

import { useAdminBillingEstimate } from "@/hooks/use-billing-estimate";
import { useParams } from "next/navigation";
import { EstimatedBillDetails } from "../../components/EstimatedBillDetails";

export default function EstimatedBill() {
  const params = useParams();
  const estimateId = parseInt(params.id as string);

  const {
    estimate,
    error: requestsError,
    isLoading,
    mutate,
  } = useAdminBillingEstimate(estimateId);

  if (!estimate && !isLoading) {
    return (
      <EstimatedBillDetails
        role="admin"
        estimate={null as any}
        isLoading={false}
        error={requestsError || new Error("No estimate found")}
      />
    );
  }

  return (
    <EstimatedBillDetails
      role="admin"
      estimate={estimate as any}
      isLoading={isLoading}
      error={requestsError}
    />
  );
}
