"use client";

import { ServiceRequestStatus } from "@/lib/db/schema";
import {
  CheckCircle,
  Clock,
  CreditCard,
  FileCheck,
  Hourglass,
  ThumbsUp,
  Trophy,
  UserCheck,
  Wrench,
} from "lucide-react";
import moment from "moment";

interface MissionTimelineProps {
  status: string;
  statusHistory?: Record<string, string>;
  createdAt: string;
}

export function MissionTimeline({
  status,
  statusHistory,
  createdAt,
}: MissionTimelineProps) {
  // Helper to format date from statusHistory or return undefined
  const getDateForStatus = (statusKey: string) => {
    if (statusHistory && statusHistory[statusKey]) {
      return moment(statusHistory[statusKey]).format("DD/MM/YYYY à HH:mm");
    }
    return undefined;
  };

  const steps = [
    {
      step: "Mission disponible",
      completed: true, // Always true when viewing
      date:
        getDateForStatus("awaiting_assignation") ||
        moment(createdAt).format("DD/MM/YYYY à HH:mm"),
      icon: <FileCheck className="h-4 w-4" />,
    },
    {
      step: "Mission acceptée",
      completed: status !== ServiceRequestStatus.AWAITING_ASSIGNATION,
      date: getDateForStatus("in_progress"),
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      step: "Intervention en cours",
      completed: [
        ServiceRequestStatus.IN_PROGRESS,
        ServiceRequestStatus.CLIENT_VALIDATED,
        ServiceRequestStatus.ARTISAN_VALIDATED,
        ServiceRequestStatus.AWAITING_PAYMENT,
        ServiceRequestStatus.COMPLETED,
      ].includes(status as ServiceRequestStatus),
      date: getDateForStatus("in_progress"),
      icon: <Wrench className="h-4 w-4" />,
    },
    {
      step: "Validation des travaux",
      completed: [
        ServiceRequestStatus.CLIENT_VALIDATED,
        ServiceRequestStatus.ARTISAN_VALIDATED,
        ServiceRequestStatus.AWAITING_PAYMENT,
        ServiceRequestStatus.COMPLETED,
      ].includes(status as ServiceRequestStatus),
      date:
        getDateForStatus("client_validated") ||
        getDateForStatus("artisan_validated"),
      icon: <ThumbsUp className="h-4 w-4" />,
    },
    {
      step: "Paiement",
      completed: [
        ServiceRequestStatus.AWAITING_PAYMENT,
        ServiceRequestStatus.COMPLETED,
      ].includes(status as ServiceRequestStatus),
      date: getDateForStatus("awaiting_payment"),
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      step: "Mission terminée",
      completed: status === ServiceRequestStatus.COMPLETED,
      date: getDateForStatus("completed"),
      icon: <Trophy className="h-4 w-4" />,
    },
  ];

  return (
    <div className="sticky top-4 bg-white p-5">
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-2 ${
                    step.completed ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-4">
              <p
                className={`text-sm font-medium ${
                  step.completed ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {step.step}
              </p>
              {step.date && (
                <p className="text-xs text-gray-500 mt-1">{step.date}</p>
              )}
              {/* Show waiting indicators */}
              {index === 1 &&
                status === ServiceRequestStatus.AWAITING_ASSIGNATION && (
                  <div className="mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-2">
                    <Hourglass className="h-4 w-4" />
                    <span>En attente de votre acceptation</span>
                  </div>
                )}
              {index === 3 && status === ServiceRequestStatus.IN_PROGRESS && (
                <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-2">
                  <Hourglass className="h-4 w-4" />
                  <span>En attente de votre validation</span>
                </div>
              )}
              {index === 3 &&
                status === ServiceRequestStatus.CLIENT_VALIDATED && (
                  <div className="mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-2">
                    <Hourglass className="h-4 w-4" />
                    <span>En attente de votre confirmation</span>
                  </div>
                )}
              {index === 3 &&
                status === ServiceRequestStatus.ARTISAN_VALIDATED && (
                  <div className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full flex items-center gap-2">
                    <Hourglass className="h-4 w-4" />
                    <span>En attente de validation client</span>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

