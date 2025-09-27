import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  const awaitingPaymentRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.AWAITING_PAYMENT
  );

  // Group requests by status for accordion view
  const awaitingEstimateRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.AWAITING_ESTIMATE
  );
  const pendingRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.AWAITING_ASSIGNATION
  );
  const activeRequests = requests.filter((req) =>
    [
      ServiceRequestStatus.IN_PROGRESS,
      ServiceRequestStatus.ARTISAN_VALIDATED,
      ServiceRequestStatus.COMPLETED,
    ].includes(req.status as any)
  );
  const awaitingValidationRequests = requests.filter((req) =>
    [
      ServiceRequestStatus.CLIENT_VALIDATED,
      ServiceRequestStatus.ARTISAN_VALIDATED,
      ,
    ].includes(req.status as any)
  );
  const clientNeedsValidationRequests = requests.filter((req) =>
    [ServiceRequestStatus.ARTISAN_VALIDATED].includes(req.status as any)
  );
  const artisanNeedsValidationRequests = requests.filter((req) =>
    [ServiceRequestStatus.CLIENT_VALIDATED].includes(req.status as any)
  );
  const awaitingEstimateAcceptationRequests = requests.filter((req) =>
    [ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION].includes(
      req.status as any
    )
  );
  const disputedRequests = requests.filter((req) =>
    [
      ServiceRequestStatus.DISPUTED_BY_CLIENT,
      ServiceRequestStatus.DISPUTED_BY_ARTISAN,
      ServiceRequestStatus.DISPUTED_BY_BOTH,
    ].includes(req.status as any)
  );
  const completedRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.COMPLETED
  );
  const cancelledRequests = requests.filter(
    (req) => req.status === ServiceRequestStatus.CANCELLED
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

  // Individual status configs for accordion sections
  const awaitingPaymentStatusConfig = statusCards[0].config;
  const awaitingEstimateStatusConfig = statusCards[1].config;
  const awaitingAssignmentStatusConfig = statusCards[2].config;
  const awaitingValidationStatusConfig = statusCards[3].config;
  const disputedStatusConfig = statusCards[4].config;

  // Additional status configs for later use
  const activeStatusConfig = getStatusConfig(
    ServiceRequestStatus.IN_PROGRESS,
    ""
  );
  const completedStatusConfig = getStatusConfig(
    ServiceRequestStatus.COMPLETED,
    ""
  );
  const cancelledStatusConfig = getStatusConfig(
    ServiceRequestStatus.CANCELLED,
    ""
  );
  const awaitingEstimateAcceptationStatusConfig = getStatusConfig(
    ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
    ""
  );

  // Accordion Section Component
  const AccordionSection = ({
    section,
    textColor = "text-slate-900",
    onRequestUpdate,
  }: {
    section: any;
    textColor?: string;
    onRequestUpdate?: () => void;
  }) => (
    <AccordionItem value={section.value}>
      <AccordionTrigger
        className={`text-lg font-semibold ${textColor} hover:no-underline`}
      >
        <div className="flex items-center gap-2">
          {section.statusConfig.icon}
          {section.label || section.statusConfig.label} (
          {section.requests.length})
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4">
        <RequestGrid
          requests={section.requests}
          onRequestUpdate={onRequestUpdate}
        />
      </AccordionContent>
    </AccordionItem>
  );

  // Accordion sections configuration
  const accordionSections = [
    {
      value: "awaiting-payment",
      statusConfig: awaitingPaymentStatusConfig,
      requests: awaitingPaymentRequests,
      textColor: "text-red-600",
    },
    {
      value: "awaiting-estimate",
      statusConfig: awaitingEstimateStatusConfig,
      requests: awaitingEstimateRequests,
      textColor: "text-slate-900",
    },
    {
      value: "awaiting-estimate-acceptation",
      statusConfig: awaitingEstimateAcceptationStatusConfig,
      requests: awaitingEstimateAcceptationRequests,
      textColor: "text-slate-900",
    },
    {
      value: "pending",
      statusConfig: awaitingAssignmentStatusConfig,
      requests: pendingRequests,
      textColor: "text-slate-900",
    },
    {
      value: "active",
      statusConfig: activeStatusConfig,
      requests: activeRequests,
      textColor: "text-slate-900",
    },
    {
      value: "awaiting-validation",
      statusConfig: awaitingValidationStatusConfig,
      requests: awaitingValidationRequests,
      textColor: "text-slate-900",
    },
    {
      value: "disputed",
      statusConfig: disputedStatusConfig,
      requests: disputedRequests,
      textColor: "text-slate-900",
      label: "En litige",
    },
    {
      value: "completed",
      statusConfig: completedStatusConfig,
      requests: completedRequests,
      textColor: "text-slate-900",
    },
    {
      value: "cancelled",
      statusConfig: cancelledStatusConfig,
      requests: cancelledRequests,
      textColor: "text-slate-900",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {statusCards.map((statusCard, index) => (
          <StatusCard
            key={index}
            statusConfig={statusCard.config}
            count={statusCard.count}
            label={statusCard.label}
          />
        ))}
      </div>

      {/* Requests Accordion */}
      <Accordion type="multiple" className="space-y-4">
        {accordionSections.map(
          (section) =>
            section.requests.length > 0 && (
              <AccordionSection
                key={section.value}
                section={section}
                onRequestUpdate={onRequestUpdate}
              />
            )
        )}
      </Accordion>
    </div>
  );
}
