"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ServiceRequestStatus } from "@/lib/db/schema";
import { cn, getCategoryConfig, getStatusConfig } from "@/lib/utils";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ServiceRequestForArtisan } from "../../components/types";

interface JobsProps {
  assignedRequests: ServiceRequestForArtisan[];
}

export default function Jobs({ assignedRequests }: JobsProps) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [missionsSortBy, setMissionsSortBy] = useState("date");

  const statusOptions = [
    {
      value: "all",
      label: "Tous les statuts",
      count: assignedRequests.length,
    },
    {
      value: "in-progress",
      label: "En cours",
      count: assignedRequests.filter(
        (m) => m.status === ServiceRequestStatus.IN_PROGRESS
      ).length,
      color: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    },
    {
      value: "completed",
      label: "Terminées",
      count: assignedRequests.filter(
        (m) => m.status === ServiceRequestStatus.COMPLETED
      ).length,
      color: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    },
    {
      value: "validation-needed",
      label: "À valider",
      count: assignedRequests.filter(
        (m) => m.status === ServiceRequestStatus.CLIENT_VALIDATED
      ).length,
      color: "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
    },
    {
      value: "disputed",
      label: "En litige",
      count: assignedRequests.filter(
        (m) =>
          m.status === ServiceRequestStatus.DISPUTED_BY_CLIENT ||
          m.status === ServiceRequestStatus.DISPUTED_BY_ARTISAN ||
          m.status === ServiceRequestStatus.DISPUTED_BY_BOTH
      ).length,
      color: "bg-red-100 text-red-700 ring-1 ring-red-200",
    },
  ];

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "status", label: "Statut" },
    { value: "client", label: "Client" },
    { value: "price", label: "Prix" },
  ];

  // Filter and sort logic
  const filteredMissions = assignedRequests
    .filter((mission) => {
      if (filterStatus === "all") return true;

      if (filterStatus === "disputed") {
        return (
          mission.status === ServiceRequestStatus.DISPUTED_BY_CLIENT ||
          mission.status === ServiceRequestStatus.DISPUTED_BY_ARTISAN ||
          mission.status === ServiceRequestStatus.DISPUTED_BY_BOTH
        );
      }
      if (filterStatus === "completed") {
        return mission.status === ServiceRequestStatus.COMPLETED;
      }
      if (filterStatus === "in-progress") {
        return mission.status === ServiceRequestStatus.IN_PROGRESS;
      }
      if (filterStatus === "validation-needed") {
        return mission.status === ServiceRequestStatus.CLIENT_VALIDATED;
      }
      return mission.status === filterStatus;
    })
    .sort((a, b) => {
      switch (missionsSortBy) {
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "status":
          const statusOrder: Record<string, number> = {
            [ServiceRequestStatus.IN_PROGRESS]: 0,
            [ServiceRequestStatus.COMPLETED]: 2,
          };
          return (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
        case "client":
          return (a.clientName || "").localeCompare(b.clientName || "");
        case "price":
          return (b.estimatedPrice || 0) - (a.estimatedPrice || 0);
        default:
          return 0;
      }
    });

  // Extracted MissionCard as a separate component to support internal state
  const MissionCard = ({ mission }: { mission: ServiceRequestForArtisan }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = mission.photos ? JSON.parse(mission.photos) : [];
    const categoryConfig = getCategoryConfig(mission.serviceType, "h-5 w-5");
    const statusConfig = getStatusConfig(mission.status, "h-4 w-4");

    // Use photos if available, otherwise use category default photo
    const images =
      photos && photos.length > 0 ? photos : [categoryConfig.defaultPhoto];

    const isDisputed =
      mission.status === ServiceRequestStatus.DISPUTED_BY_CLIENT ||
      mission.status === ServiceRequestStatus.DISPUTED_BY_ARTISAN ||
      mission.status === ServiceRequestStatus.DISPUTED_BY_BOTH;

    const handlePrevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    };

    const handleNextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    };

    const handleDotClick = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      setCurrentImageIndex(index);
    };

    return (
      <Card
        className="!h-fit rounded-lg shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 relative overflow-hidden p-0 gap-2"
        onClick={() => router.push(`/workspace/jobs/${mission.id}`)}
      >
        {/* Image Carousel Section */}
        <div className="relative w-full h-48 bg-gray-200 group">
          {/* Current Image */}
          <img
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={`${mission.title} - Photo ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Dispute Overlay Banner */}
          {isDisputed && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-3 py-2 shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent animate-pulse"></div>
              <div className="relative z-10 flex items-center gap-2">
                <div className="relative">
                  <AlertTriangle className="h-3 w-3 text-white drop-shadow-sm" />
                  <div className="absolute -inset-0.5 bg-white/30 rounded-full animate-ping"></div>
                </div>
                <div>
                  <span className="font-bold text-white text-[10px] tracking-wide uppercase drop-shadow-sm">
                    Litige en cours
                  </span>
                  <div className="text-white/90 text-[8px] font-medium">
                    Réponse sous 48h
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Badge Overlay - Top Right */}
          <div className="absolute top-3 right-3 z-10">
            <Badge
              className={`${statusConfig.color} ${statusConfig.colors.bg} ${statusConfig.colors.text} flex items-center gap-1 text-xs font-medium shadow-lg`}
            >
              {statusConfig.icon}
              <span className="truncate max-w-[100px]">
                {statusConfig.label}
              </span>
            </Badge>
          </div>

          {/* Navigation Arrows - Show on hover if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dot Indicators - Show if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_: string, index: number) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(e, index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentImageIndex
                      ? "bg-white w-4"
                      : "bg-white/60 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
              {mission.title}
            </h3>

            {/* Client Name */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-500 shrink-0" />
              <span className="truncate">
                {mission.clientName || "Client inconnu"}
              </span>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{mission.location}</span>
            </div>

            {/* Price - Bottom Right */}
            <div className="flex justify-end pt-2">
              <div className="text-right">
                <span className="text-xl font-bold text-gray-900">
                  {mission.estimatedPrice
                    ? (mission.estimatedPrice / 100).toFixed(2)
                    : "N/A"}
                  €
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Missions</h1>
          <p className="text-gray-600">
            {filteredMissions.length} mission
            {filteredMissions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={missionsSortBy} onValueChange={setMissionsSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((status) => (
          <Button
            key={status.value}
            variant={filterStatus === status.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status.value)}
            className={cn(
              "flex items-center gap-2",
              filterStatus === status.value
                ? "bg-black text-white hover:bg-black"
                : "text-gray-700"
            )}
          >
            {status.label}
            <Badge
              variant="secondary"
              className={cn("ml-1", status.color, "pointer-events-none")}
            >
              {status.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Missions List */}
      {filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {filteredMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune mission trouvée
            </h3>
            <p className="text-gray-600">
              Aucune mission ne correspond aux filtres sélectionnés.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
