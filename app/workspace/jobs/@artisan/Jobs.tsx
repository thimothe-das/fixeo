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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { ServiceRequestStatus } from "@/lib/db/schema";
import {
  cn,
  getCategoryConfig,
  getStatusConfig,
  getPriorityConfig,
} from "@/lib/utils";
import {
  AlertTriangle,
  Camera,
  Euro,
  Eye,
  FileText,
  MapPin,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
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

  // Validation and dispute states
  const [selectedMission, setSelectedMission] =
    useState<ServiceRequestForArtisan | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [validationType, setValidationType] = useState<"approve" | "dispute">(
    "approve"
  );
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);

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

  // Validation and dispute handlers
  const handleValidateCompletion = async () => {
    if (!selectedMission) return;

    setIsSubmittingValidation(true);
    try {
      const response = await fetch(
        `/api/service-requests/${selectedMission.id}/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: validationType,
          }),
        }
      );

      if (response.ok) {
        setShowValidationDialog(false);
        setShowDisputeDialog(false);
        resetValidationForm();
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error validating completion:", error);
      alert("Erreur lors de la validation");
    } finally {
      setIsSubmittingValidation(false);
    }
  };

  const resetValidationForm = () => {
    setValidationType("approve");
    setSelectedMission(null);
  };

  const MissionCard = useMemo(
    () =>
      ({ mission }: { mission: ServiceRequestForArtisan }) => {
        const photos = mission.photos ? JSON.parse(mission.photos) : [];
        const categoryConfig = getCategoryConfig(
          mission.serviceType,
          "h-5 w-5 "
        );
        const statusConfig = getStatusConfig(mission.status, "h-4 w-4");

        // Mock data for unread messages and timeline progress
        const unreadMessages = Math.floor(Math.random() * 4); // 0-3 unread messages
        const timelineProgress = Math.floor(Math.random() * 4) + 1; // 1-4 completed steps out of 4
        const totalSteps = 4;

        return (
          <Card
            className={cn(
              `!h-fit rounded-none bord shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-t-4`,
              mission.status !== ServiceRequestStatus.DISPUTED_BY_CLIENT &&
                mission.status !== ServiceRequestStatus.DISPUTED_BY_ARTISAN &&
                mission.status !== ServiceRequestStatus.DISPUTED_BY_BOTH
                ? statusConfig.borderTop
                : "border-t-0"
            )}
            onClick={() => router.push(`/workspace/jobs/${mission.id}`)}
          >
            {/* Dispute Banner */}
            {(mission.status === ServiceRequestStatus.DISPUTED_BY_CLIENT ||
              mission.status === ServiceRequestStatus.DISPUTED_BY_ARTISAN ||
              mission.status === ServiceRequestStatus.DISPUTED_BY_BOTH) && (
              <div className="-mt-6 relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-4 py-3 shadow-2xl shadow-red-500/25 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent animate-pulse"></div>
                <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-full"></div>

                <div className="relative z-10 flex items-center justify-between">
                  {/* Left side - Enhanced alert section */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <AlertTriangle className="h-4 w-4 text-white drop-shadow-sm" />
                      <div className="absolute -inset-0.5 bg-white/30 rounded-full animate-ping"></div>
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs tracking-wide uppercase drop-shadow-sm">
                        Litige en cours
                      </span>
                      <div className="text-white/90 text-[10px] font-medium">
                        Réponse sous 48h
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <CardContent>
              <div className="flex flex-col space-y-3">
                {/* Compact Header with Price and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge
                      className={`${statusConfig.color} shrink-0 text-xs font-medium`}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </Badge>
                    {unreadMessages > 0 && (
                      <div className="relative flex items-center shrink-0">
                        <MessageCircle className="h-5 w-5 text-gray-600" />
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white">
                          {unreadMessages}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-lg font-bold text-gray-900">
                      {mission.estimatedPrice
                        ? (mission.estimatedPrice / 100).toFixed(2)
                        : "N/A"}
                      €
                    </span>
                  </div>
                </div>

                {/* Title and Category */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 leading-5 mb-1">
                    {mission.title}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    {categoryConfig.icon} {categoryConfig.type}
                  </p>
                </div>

                {/* Timeline Progress */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Progression:</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          index < timelineProgress
                            ? "bg-emerald-500"
                            : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {timelineProgress}/{totalSteps}
                  </span>
                </div>

                {/* Location and Client Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center flex-1 min-w-0">
                      <MapPin className="h-4 w-4 text-gray-500 mr-3 shrink-0" />
                      <span className="truncate">{mission.location}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0 ml-2 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        const encodedLocation = encodeURIComponent(
                          mission.location
                        );
                        // For mobile devices, use the universal maps URL that works with most map apps
                        const mapsUrl = `https://maps.google.com/maps?q=${encodedLocation}`;
                        window.open(mapsUrl, "_blank");
                      }}
                      title="Navigate to location"
                    >
                      <Navigation className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 text-gray-500 mr-3" />
                    <span className="truncate">
                      {mission.clientName || "Nom du client non disponible"}
                    </span>
                  </div>
                </div>

                {/* Compact Description and Photos */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 line-clamp-1 leading-relaxed">
                    {mission.description || "Aucune description"}
                  </p>

                  {/* Compact Photos */}
                  <div className="flex items-center gap-2">
                    {photos && photos.length > 0 ? (
                      <>
                        <div className="flex -space-x-1">
                          {photos
                            .slice(0, 2)
                            .map((photo: string, index: number) => (
                              <img
                                key={index}
                                src={photo || "/placeholder.svg"}
                                alt={`Photo ${index + 1}`}
                                className="w-8 h-8 rounded border-2 border-white object-cover"
                              />
                            ))}
                        </div>
                        {photos.length > 2 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            +{photos.length - 2} photos
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Aucune photo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex space-x-2 w-full justify-between items-center">
                    {/* Validation buttons for specific statuses */}
                    {mission.status === ServiceRequestStatus.IN_PROGRESS ||
                    mission.status === ServiceRequestStatus.CLIENT_VALIDATED ? (
                      <div className="flex gap-3 w-full">
                        <Button
                          className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMission(mission);
                            setValidationType("approve");
                            setShowValidationDialog(true);
                          }}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Valider
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-11 border-red-300 text-red-600 hover:bg-red-50 font-medium text-sm touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMission(mission);
                            setValidationType("dispute");
                            setShowDisputeDialog(true);
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Contester
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-11 bg-transparent hover:bg-gray-50 border-gray-200 font-medium text-sm touch-manipulation"
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
            <Badge variant="secondary" className={`ml-1 ${status.color}`}>
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

      {/* Validation Success Dialog */}
      <Dialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              Valider la mission
            </DialogTitle>
            <DialogDescription>
              Confirmez que les travaux ont été réalisés de manière
              satisfaisante.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                ✓ Mission validée avec succès
              </p>
              <p className="text-xs text-green-600 mt-1">
                Le client sera notifié de votre validation et le paiement sera
                déclenché.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowValidationDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleValidateCompletion}
              disabled={isSubmittingValidation}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmittingValidation
                ? "En cours..."
                : "Confirmer la validation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              Contester la mission
            </DialogTitle>
            <DialogDescription>
              Confirmez que vous souhaitez contester cette mission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Litige signalé
              </p>
              <p className="text-xs text-red-600 mt-1">
                Un litige sera ouvert et notre équipe examinera la situation. Le
                paiement sera suspendu en attendant la résolution.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisputeDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleValidateCompletion}
              disabled={isSubmittingValidation}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmittingValidation ? "En cours..." : "Confirmer le litige"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
