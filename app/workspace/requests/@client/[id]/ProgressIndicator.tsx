"use client";

import { ServiceRequestStatus } from "@/lib/db/schema";
import {
  AlertTriangle,
  Calculator,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Package,
  UserCheck,
  UserRoundSearch,
  Wrench,
  XCircle,
} from "lucide-react";
import moment from "moment";
import * as React from "react";

type ProgressStep = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  date?: string;
  isActive: boolean;
  isCompleted: boolean;
};

type ProgressIndicatorProps = {
  currentStatus: string;
  statusHistory?: Record<string, string>;
  billingEstimateStatus?: string;
};

export function ProgressIndicator({
  currentStatus,
  statusHistory = {},
  billingEstimateStatus,
}: ProgressIndicatorProps) {
  const steps = React.useMemo(() => {
    return buildStepsFromStatus(
      currentStatus,
      statusHistory,
      billingEstimateStatus
    );
  }, [currentStatus, statusHistory, billingEstimateStatus]);

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg: pt-6">
        {/* Desktop: Horizontal Stepper */}
        <div className="hidden md:flex items-center justify-between relative">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1 relative z-10">
                {/* Icon Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                    step.isCompleted
                      ? `${step.bgColor} ${step.borderColor} border-2`
                      : step.isActive
                      ? `bg-white ${step.borderColor} border-4`
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <div
                    className={`${
                      step.isCompleted || step.isActive
                        ? step.color
                        : "text-gray-400"
                    }`}
                  >
                    {React.isValidElement(step.icon)
                      ? React.cloneElement(step.icon, {
                          className: "h-5 w-5",
                        } as any)
                      : step.icon}
                  </div>
                </div>

                {/* Label and Date */}
                <div className="mt-2 text-center max-w-[100px]">
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      step.isCompleted || step.isActive
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.date ? (
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {step.date}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-500 mt-0.5">À venir</p>
                  )}
                </div>
              </div>

              {/* Connecting Line with Arrow */}
              {index < steps.length - 1 && (
                <div className="flex items-center gap-1 px-2">
                  <div
                    className={`h-0.5 flex-1 min-w-[40px] ${
                      steps[index + 1].isCompleted || steps[index + 1].isActive
                        ? "bg-gray-300"
                        : "bg-gray-200"
                    }`}
                  />
                  <ChevronRight
                    className={`h-4 w-4 flex-shrink-0 ${
                      steps[index + 1].isCompleted || steps[index + 1].isActive
                        ? "text-gray-300"
                        : "text-gray-300"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              {/* Icon and Connecting Line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                    step.isCompleted
                      ? `${step.bgColor} ${step.borderColor} border-2`
                      : step.isActive
                      ? `bg-white ${step.borderColor} border-4`
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <div
                    className={`${
                      step.isCompleted || step.isActive
                        ? step.color
                        : "text-gray-400"
                    }`}
                  >
                    {React.isValidElement(step.icon)
                      ? React.cloneElement(step.icon, {
                          className: "h-5 w-5",
                        } as any)
                      : step.icon}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-0.5 flex-1 min-h-[24px] ${
                        steps[index + 1].isCompleted ||
                        steps[index + 1].isActive
                          ? "bg-gray-300"
                          : "bg-gray-200"
                      }`}
                    />
                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 ${
                        steps[index + 1].isCompleted ||
                        steps[index + 1].isActive
                          ? "text-gray-300"
                          : "text-gray-300"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <p
                  className={`text-sm font-semibold ${
                    step.isCompleted || step.isActive
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildStepsFromStatus(
  currentStatus: string,
  statusHistory: Record<string, string>,
  billingEstimateStatus?: string
): ProgressStep[] {
  const steps: ProgressStep[] = [];
  const allStatuses = Object.keys(statusHistory);

  // Helper functions
  const hasBeenInStatus = (status: string) => allStatuses.includes(status);
  const getStatusDate = (status: string) => {
    const date = statusHistory[status];
    return date ? moment(date).format("DD MMM YYYY") : undefined;
  };

  // Determine edge cases
  const isCancelled = currentStatus === ServiceRequestStatus.CANCELLED;
  const isDisputed =
    currentStatus === ServiceRequestStatus.DISPUTED_BY_CLIENT ||
    currentStatus === ServiceRequestStatus.DISPUTED_BY_ARTISAN ||
    currentStatus === ServiceRequestStatus.DISPUTED_BY_BOTH;
  const isResolved = currentStatus === ServiceRequestStatus.RESOLVED;
  const isCompleted = currentStatus === ServiceRequestStatus.COMPLETED;
  const hasRevision = hasBeenInStatus(
    ServiceRequestStatus.AWAITING_ESTIMATE_REVISION
  );
  const hasDualAcceptance =
    hasBeenInStatus(ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE) ||
    currentStatus === ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE;

  // Determine current step position in main flow
  const hasEstimate =
    hasBeenInStatus(ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION) ||
    hasBeenInStatus(ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE) ||
    hasBeenInStatus(ServiceRequestStatus.AWAITING_ASSIGNATION) ||
    hasBeenInStatus(ServiceRequestStatus.IN_PROGRESS) ||
    hasBeenInStatus(ServiceRequestStatus.CLIENT_VALIDATED) ||
    hasBeenInStatus(ServiceRequestStatus.ARTISAN_VALIDATED) ||
    isCompleted;

  const hasAcceptedEstimate =
    hasBeenInStatus(ServiceRequestStatus.AWAITING_ASSIGNATION) ||
    hasBeenInStatus(ServiceRequestStatus.IN_PROGRESS) ||
    hasBeenInStatus(ServiceRequestStatus.CLIENT_VALIDATED) ||
    hasBeenInStatus(ServiceRequestStatus.ARTISAN_VALIDATED) ||
    isCompleted;

  const hasStarted =
    hasBeenInStatus(ServiceRequestStatus.IN_PROGRESS) ||
    hasBeenInStatus(ServiceRequestStatus.CLIENT_VALIDATED) ||
    hasBeenInStatus(ServiceRequestStatus.ARTISAN_VALIDATED) ||
    isCompleted;

  // MAIN FLOW - Always show these steps

  // Step 1: Request Created (always completed)
  const createdDate =
    statusHistory[ServiceRequestStatus.AWAITING_ESTIMATE] ||
    Object.values(statusHistory)[0];
  steps.push({
    id: "created",
    label: "Demande créée",
    icon: <FileText className="h-6 w-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-600",
    date: createdDate ? moment(createdDate).format("DD MMM YYYY") : undefined,
    isCompleted: true,
    isActive: false,
  });

  // Step 2: Devis Added (always show)
  const isWaitingForEstimate =
    currentStatus === ServiceRequestStatus.AWAITING_ESTIMATE;
  steps.push({
    id: "estimate-added",
    label: isWaitingForEstimate ? "Devis en cours de calcul" : "Devis ajouté",
    icon: <Calculator className="h-6 w-6" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-600",
    date: getStatusDate(ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION),
    isCompleted: hasEstimate,
    isActive:
      currentStatus === ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION ||
      isWaitingForEstimate,
    isUpcoming: !hasEstimate && !isWaitingForEstimate,
  } as ProgressStep);

  // Step 3: Devis Accepted (always show, adapt for dual acceptance)
  const isAwaitingRevision =
    currentStatus === ServiceRequestStatus.AWAITING_ESTIMATE_REVISION;

  if (hasDualAcceptance) {
    // If currently in dual acceptance, it's active (not completed yet)
    const isDualAcceptanceActive =
      currentStatus === ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE;
    // Don't mark as completed if we're awaiting revision
    const isDualAcceptanceCompleted =
      hasAcceptedEstimate && !isDualAcceptanceActive && !isAwaitingRevision;

    steps.push({
      id: "dual-acceptance",
      label: "Acceptation mutuelle",
      icon: <UserCheck className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-600",
      date: getStatusDate(ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE),
      isCompleted: isDualAcceptanceCompleted,
      isActive: isDualAcceptanceActive,
      isUpcoming: !isDualAcceptanceCompleted && !isDualAcceptanceActive,
    } as ProgressStep);
  } else {
    // Don't mark as completed if we're awaiting revision
    const isAcceptanceCompleted = hasAcceptedEstimate && !isAwaitingRevision;

    steps.push({
      id: "estimate-accepted",
      label: "Devis accepté",
      icon: <CheckCircle className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-600",
      date: getStatusDate(ServiceRequestStatus.AWAITING_ASSIGNATION),
      isCompleted: isAcceptanceCompleted,
      isActive: currentStatus === ServiceRequestStatus.AWAITING_ASSIGNATION,
      isUpcoming:
        !isAcceptanceCompleted &&
        currentStatus !== ServiceRequestStatus.AWAITING_ASSIGNATION,
    } as ProgressStep);
  }

  // Step 4: En attente d'assignation (always show)
  const isAwaitingAssignation =
    currentStatus === ServiceRequestStatus.AWAITING_ASSIGNATION;
  const isAssignationCompleted =
    hasStarted && !isAwaitingAssignation && !isAwaitingRevision;

  steps.push({
    id: "awaiting-assignation",
    label: "En attente d'assignation",
    icon: <UserRoundSearch className="h-6 w-6" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    borderColor: "border-indigo-600",
    date: getStatusDate(ServiceRequestStatus.AWAITING_ASSIGNATION),
    isCompleted: isAssignationCompleted,
    isActive: isAwaitingAssignation,
    isUpcoming: !isAssignationCompleted && !isAwaitingAssignation,
  } as ProgressStep);

  // Step 5: In Progress (always show)
  // Don't mark as completed if we're currently in dual acceptance or awaiting revision
  const isInProgressActive = currentStatus === ServiceRequestStatus.IN_PROGRESS;
  const isInProgressCompleted =
    hasStarted &&
    !isInProgressActive &&
    currentStatus !== ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE &&
    !isAwaitingRevision;

  steps.push({
    id: "in-progress",
    label: "En cours",
    icon: <Wrench className="h-6 w-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-600",
    date: getStatusDate(ServiceRequestStatus.IN_PROGRESS),
    isCompleted: isInProgressCompleted,
    isActive: isInProgressActive,
    isUpcoming: !isInProgressCompleted && !isInProgressActive,
  } as ProgressStep);

  // Step 6: Completed (always show)
  // Don't mark as completed if awaiting revision
  const isCompletedStep = isCompleted && !isAwaitingRevision;

  steps.push({
    id: "completed",
    label: "Terminé",
    icon: <Package className="h-6 w-6" />,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-600",
    date: getStatusDate(ServiceRequestStatus.COMPLETED),
    isCompleted: isCompletedStep,
    isActive: false,
    isUpcoming: !isCompletedStep,
  } as ProgressStep);

  // EDGE CASES - Only show if they occurred

  // Revision (insert after estimate-added if occurred)
  if (hasRevision) {
    const estimateAddedIndex = steps.findIndex(
      (s) => s.id === "estimate-added"
    );

    // Determine if revision is complete or still waiting
    const isRevisionActive =
      currentStatus === ServiceRequestStatus.AWAITING_ESTIMATE_REVISION;
    const isRevisionCompleted = !isRevisionActive && hasRevision;

    // For completed revisions, try to get the date when dual acceptance started
    // (that's when the revised estimate was added)
    const revisionDate = isRevisionCompleted
      ? getStatusDate(ServiceRequestStatus.AWAITING_DUAL_ACCEPTANCE) ||
        getStatusDate(ServiceRequestStatus.AWAITING_ESTIMATE_REVISION)
      : getStatusDate(ServiceRequestStatus.AWAITING_ESTIMATE_REVISION);

    steps.splice(estimateAddedIndex + 1, 0, {
      id: "revision",
      label: isRevisionActive
        ? "Devis révisé en cours de calcul"
        : "Devis révisé",
      icon: <Calculator className="h-6 w-6" />,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      borderColor: "border-amber-600",
      date: revisionDate,
      isCompleted: isRevisionCompleted,
      isActive: isRevisionActive,
    });
  }

  // Dispute
  if (isDisputed) {
    steps.push({
      id: "disputed",
      label: "En litige",
      icon: <AlertTriangle className="h-6 w-6" />,
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-600",
      date:
        getStatusDate(ServiceRequestStatus.DISPUTED_BY_CLIENT) ||
        getStatusDate(ServiceRequestStatus.DISPUTED_BY_ARTISAN) ||
        getStatusDate(ServiceRequestStatus.DISPUTED_BY_BOTH),
      isCompleted: false,
      isActive: true,
    });
  }

  // Resolved (after dispute)
  if (isResolved) {
    const disputeDate =
      statusHistory[ServiceRequestStatus.DISPUTED_BY_CLIENT] ||
      statusHistory[ServiceRequestStatus.DISPUTED_BY_ARTISAN] ||
      statusHistory[ServiceRequestStatus.DISPUTED_BY_BOTH];

    if (disputeDate) {
      steps.push({
        id: "disputed",
        label: "En litige",
        icon: <AlertTriangle className="h-6 w-6" />,
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-600",
        date: moment(disputeDate).format("DD MMM YYYY"),
        isCompleted: true,
        isActive: false,
      });
    }

    steps.push({
      id: "resolved",
      label: "Résolu",
      icon: <CheckCircle className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-600",
      date: getStatusDate(ServiceRequestStatus.RESOLVED),
      isCompleted: true,
      isActive: false,
    });
  }

  // Cancelled
  if (isCancelled) {
    steps.push({
      id: "cancelled",
      label: "Annulé",
      icon: <XCircle className="h-6 w-6" />,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      borderColor: "border-gray-600",
      date: getStatusDate(ServiceRequestStatus.CANCELLED),
      isCompleted: false,
      isActive: true,
    });
  }

  return steps;
}
