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
import { getCategoryConfig, getStatusConfig } from "@/lib/utils";
import {
  AlertTriangle,
  Camera,
  Euro,
  Eye,
  MapPin,
  ThumbsUp,
  User,
  Wrench,
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ServiceRequestForArtisan } from "../../components/types";

interface JobsProps {
  assignedRequests: ServiceRequestForArtisan[];
}

export default function Jobs({ assignedRequests }: JobsProps) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [missionsSortBy, setMissionsSortBy] = useState("date");
  useState<ServiceRequestForArtisan | null>(null);

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
    },
    {
      value: "completed",
      label: "Terminées",
      count: assignedRequests.filter(
        (m) => m.status === ServiceRequestStatus.COMPLETED
      ).length,
    },
    {
      value: "validation-needed",
      label: "À valider",
      count: assignedRequests.filter(
        (m) => m.status === ServiceRequestStatus.CLIENT_VALIDATED
      ).length,
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      [ServiceRequestStatus.IN_PROGRESS]: {
        label: "En cours",
        color: "text-orange-600 border-orange-200 bg-orange-50",
      },
      accepted: {
        label: "Validation mutuelle requise",
        color: "text-purple-600 border-purple-200 bg-purple-50",
      },
      completed: {
        label: "Terminée",
        color: "text-green-600 border-green-200 bg-green-50",
      },
      awaiting_validation: {
        label: "A valider",
        color: "text-purple-600 border-purple-200 bg-purple-50",
      },
      client_validated: {
        label: "À valider",
        color: "text-cyan-600 border-cyan-200 bg-cyan-50",
      },
      artisan_validated: {
        label: "Validée",
        color: "text-indigo-600 border-indigo-200 bg-indigo-50",
      },
      disputed_by_client: {
        label: "Litige client",
        color: "text-red-600 border-red-200 bg-red-50",
      },
      disputed_by_artisan: {
        label: "Litige artisan",
        color: "text-orange-600 border-orange-200 bg-orange-50",
      },
      disputed_by_both: {
        label: "Litige des deux parties",
        color: "text-purple-600 border-purple-200 bg-purple-50",
      },
      completed_with_issues: {
        label: "Terminée avec problèmes",
        color: "text-red-600 border-red-200 bg-red-50",
      },
      could_not_complete: {
        label: "Non réalisable",
        color: "text-gray-600 border-gray-200 bg-gray-50",
      },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const MissionCard = useMemo(
    () =>
      ({ mission }: { mission: ServiceRequestForArtisan }) => {
        const photos = mission.photos ? JSON.parse(mission.photos) : [];
        const categoryConfig = getCategoryConfig(
          mission.serviceType,
          "h-5 w-5"
        );
        const statusConfig = getStatusConfig(mission.status);
        return (
          <Card
            className={`${statusConfig.borderTop} rounded-none bord shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-t-4`}
            onClick={() => router.push(`/workspace/jobs/${mission.id}`)}
          >
            <CardContent>
              <div className="flex flex-col space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 ">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {mission.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-500">
                      Créé le{" "}
                      {moment(mission.createdAt).format("DD/MM/YYYY à HH:mm")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 text-nowrap">
                    {getStatusBadge(mission.status)}
                  </div>
                </div>

                {/* Date and Location */}
                <div className="space-y-3 py-3">
                  <div className={`flex items-center text-sm  w-fit`}>
                    {categoryConfig.icon}
                    <span className={`ml-4 font-small p-1`}>
                      {mission.serviceType.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-5 w-5 text-gray-500 mr-4" />
                    <span>{mission.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-5 w-5 text-gray-500 mr-4 font-bold" />
                    <span>
                      {mission.clientName || "Nom du client non disponible"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Euro className="h-5 w-5 text-gray-500 mr-4" />
                    <span className="font-bold">
                      {mission.estimatedPrice
                        ? (mission.estimatedPrice / 100).toFixed(2)
                        : "Prix non disponible"}
                      €
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                  {mission.description || "Aucune description"}
                </p>

                {/* Photos */}
                <div className="flex items-center space-x-2 mb-4">
                  {photos && photos.length > 0 ? (
                    <>
                      {photos
                        .slice(0, 3)
                        .map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo || "/placeholder.svg"}
                            alt={`Photo ${index + 1}`}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ))}
                      {photos.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{photos.length - 3}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Camera className="h-6 w-6 text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-500">
                        Aucune photo
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2 w-full">
                    {/* Validation buttons for specific statuses */}
                    {(mission.status === "in-progress" ||
                      mission.status === "client_validated") && (
                      <div className="flex space-x-2 w-full">
                        <Button
                          size="sm"
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Valider
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/workspace/jobs/${mission.id}`);
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Contester
                        </Button>
                      </div>
                    )}

                    {/* View details button for other statuses */}
                    {!["in-progress", "client_validated"].includes(
                      mission.status
                    ) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent hover:bg-gray-50 border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/workspace/jobs/${mission.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      },
    [getCategoryConfig]
  );

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
            className="flex items-center gap-2"
          >
            {status.label}
            <Badge variant="secondary" className="ml-1">
              {status.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Missions List */}
      {filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
