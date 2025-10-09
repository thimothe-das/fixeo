import { Card, CardContent } from "@/components/ui/card";
import { ServiceRequest, ServiceRequestStatus } from "@/lib/db/schema";
import { getStatusConfig } from "@/lib/utils";
import { Eye } from "lucide-react";
import RequestGrid from "../RequestGrid";

interface ClientRequestsListComponentProps {
  requests: ServiceRequest[];
  onViewEstimate?: (estimateId: number) => void;
  onRequestUpdate?: () => void;
}

// Function to get priority for sorting
const getStatusPriority = (status: string): number => {
  const priorityMap: Record<string, number> = {
    [ServiceRequestStatus.AWAITING_PAYMENT]: 1,
    [ServiceRequestStatus.DISPUTED_BY_CLIENT]: 2,
    [ServiceRequestStatus.DISPUTED_BY_ARTISAN]: 2,
    [ServiceRequestStatus.DISPUTED_BY_BOTH]: 2,
    [ServiceRequestStatus.IN_PROGRESS]: 3,
    [ServiceRequestStatus.ARTISAN_VALIDATED]: 3,
    [ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION]: 4,
    [ServiceRequestStatus.CLIENT_VALIDATED]: 5,
    [ServiceRequestStatus.AWAITING_ESTIMATE]: 6,
    [ServiceRequestStatus.AWAITING_ASSIGNATION]: 7,
    [ServiceRequestStatus.COMPLETED]: 8,
    [ServiceRequestStatus.CANCELLED]: 9,
  };
  return priorityMap[status] || 999;
};

export default function ClientRequestsListComponent({
  requests,
  onRequestUpdate,
}: ClientRequestsListComponentProps) {
  if (requests.length === 0) {
    return (
      <Card className="rounded-2xl p-5 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune demande pour le moment
            </h3>
            <p className="text-slate-600">
              Créez votre première demande de service pour commencer
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort requests by priority
  const sortedRequests = [...requests].sort((a, b) => {
    return getStatusPriority(a.status) - getStatusPriority(b.status);
  });

  // Filter requests by status for status cards
  const awaitingPaymentRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.AWAITING_PAYMENT
  );
  const awaitingEstimateRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.AWAITING_ESTIMATE
  );
  const pendingRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.AWAITING_ASSIGNATION
  );
  const awaitingValidationRequests = requests.filter((req) =>
    [
      ServiceRequestStatus.CLIENT_VALIDATED,
      ServiceRequestStatus.ARTISAN_VALIDATED,
    ].includes(req.status as any)
  );
  const disputedRequests = requests.filter((req) =>
    [
      ServiceRequestStatus.DISPUTED_BY_CLIENT,
      ServiceRequestStatus.DISPUTED_BY_ARTISAN,
      ServiceRequestStatus.DISPUTED_BY_BOTH,
    ].includes(req.status as any)
  );

  // Status Card Component
  const StatusCard = ({
    statusConfig,
    count,
    label,
  }: {
    statusConfig: any;
    count: number;
    label?: string;
  }) => (
    <div
      className={`bg-white rounded-lg p-4 border border-slate-200  transition-colors shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl font-bold ${statusConfig.colors?.text}`}>
            {count}
          </p>
          <p className="text-sm font-medium text-slate-600">
            {label || statusConfig.label}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${statusConfig.colors?.bg}`}>
          {statusConfig.icon}
        </div>
      </div>
    </div>
  );

  // Status cards configuration
  const statusCards = [
    {
      config: getStatusConfig(ServiceRequestStatus.AWAITING_PAYMENT, ""),
      count: awaitingPaymentRequests.length,
      hoverBorderColor: "red",
    },
    {
      config: getStatusConfig(ServiceRequestStatus.AWAITING_ESTIMATE, ""),
      count: awaitingEstimateRequests.length,
      hoverBorderColor: "amber",
    },
    {
      config: getStatusConfig(ServiceRequestStatus.AWAITING_ASSIGNATION, ""),
      count: pendingRequests.length,
      hoverBorderColor: "blue",
    },
    {
      config: getStatusConfig(ServiceRequestStatus.CLIENT_VALIDATED, ""),
      count: awaitingValidationRequests.length,
      hoverBorderColor: "purple",
    },
    {
      config: getStatusConfig(ServiceRequestStatus.DISPUTED_BY_BOTH, ""),
      count: disputedRequests.length,
      hoverBorderColor: "orange",
      label: "En litige",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* {statusCards.map((statusCard, index) => (
          <StatusCard
            key={index}
            statusConfig={statusCard.config}
            count={statusCard.count}
            label={statusCard.label}
          />
        ))} */}
      </div>

      {/* All Requests Sorted */}
      <RequestGrid
        requests={sortedRequests}
        onRequestUpdate={onRequestUpdate}
      />
    </div>
  );
}
