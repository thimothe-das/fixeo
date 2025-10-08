"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ServiceRequestStatus } from "@/lib/db/schema";
import { getCategoryConfig, getStatusConfig } from "@/lib/utils";
import { Check, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function RequestCardContainer({
  request,
  onRequestUpdate,
}: {
  request: any;
  onRequestUpdate?: () => void;
}) {
  const router = useRouter();

  const photos = request.photos ? JSON.parse(request.photos) : [];
  const categoryConfig = getCategoryConfig(request.serviceType, "h-5 w-5");
  const displayPhoto =
    photos.length > 0 ? photos[0] : categoryConfig.defaultPhoto;
  const relevantEstimate = request.billingEstimates?.[0];
  const statusConfig = getStatusConfig(request.status, "h-4 w-4 flex-shrink-0");

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/workspace/requests/${request.id}`);
  };

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)} €`;
  };

  // Get estimate status indicator
  const getEstimateStatusIndicator = () => {
    if (!relevantEstimate) return null;

    const { status } = relevantEstimate;

    if (status === "accepted") {
      return (
        <div className="inline-flex items-center gap-1 text-emerald-600">
          <Check className="h-3 w-3" />
          <span className="text-xs">Accepté</span>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <div className="inline-flex items-center gap-1 text-red-600">
          <X className="h-3 w-3" />
          <span className="text-xs">Refusé</span>
        </div>
      );
    }

    if (status === "pending") {
      return (
        <div className="inline-flex items-center gap-1 text-amber-600">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs">En attente</span>
        </div>
      );
    }

    return null;
  };

  return (
    <Card
      className="block group rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden !p-0 cursor-pointer border-slate-200 hover:border-slate-300"
      onClick={handleCardClick}
    >
      {/* Full-width Photo */}
      <div className="relative w-full h-48 overflow-hidden bg-slate-100">
        <img
          src={displayPhoto}
          alt={request.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          <Badge
            className={`rounded-full text-xs px-3 py-1 font-medium ${statusConfig.colors.bg} ${statusConfig.colors.text} shadow-lg border-2 border-white`}
          >
            <span className="flex items-center gap-1.5">
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 min-h-[3.5rem] leading-tight">
          {request.title}
        </h3>

        {/* Price with Status Indicator */}
        {relevantEstimate && (
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-600 font-medium mb-0.5">Devis</p>
              <p className="text-xl font-bold text-slate-900">
                {formatPrice(relevantEstimate.estimatedPrice)}
              </p>
            </div>
            {getEstimateStatusIndicator()}
          </div>
        )}

        {/* No Estimate */}
        {!relevantEstimate &&
          request.status !== ServiceRequestStatus.AWAITING_PAYMENT && (
            <div className="py-2 px-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 text-center">
                Devis en préparation
              </p>
            </div>
          )}

        {/* Awaiting Payment */}
        {request.status === ServiceRequestStatus.AWAITING_PAYMENT && (
          <div className="py-2 px-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium text-center">
              En attente de paiement
            </p>
          </div>
        )}

        {/* Assigned Artisan */}
        {request.assignedArtisan ? (
          <div className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">
            {/* Photo */}
            {request.assignedArtisan.profilePicture ? (
              <img
                src={request.assignedArtisan.profilePicture}
                alt={request.assignedArtisan.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm">
                <User className="h-5 w-5 text-slate-500" />
              </div>
            )}

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 font-medium mb-0.5">
                Artisan
              </p>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {request.assignedArtisan.firstName &&
                request.assignedArtisan.lastName
                  ? `${request.assignedArtisan.firstName} ${request.assignedArtisan.lastName}`
                  : request.assignedArtisan.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-2 px-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 text-center">
              En attente d&apos;assignation
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
