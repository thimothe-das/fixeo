"use client";

import { ServiceRequest } from "@/lib/db/schema";
import RequestCardContainer from "./@client/RequestCardContainer";

interface RequestGridProps {
  requests: ServiceRequest[];
  onRequestUpdate: (() => void) | undefined;
}

export default function RequestGrid({
  requests,
  onRequestUpdate,
}: RequestGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-4 gap-6">
      {requests.map((request) => (
        <RequestCardContainer
          key={request.id}
          request={request}
          onRequestUpdate={onRequestUpdate}
        />
      ))}
    </div>
  );
}
