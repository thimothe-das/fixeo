"use client";

import { ConversationChat } from "@/app/workspace/components/ConversationChat";
import type { ServiceRequestForArtisan } from "@/app/workspace/components/types";
import { ActionBanner } from "@/app/workspace/jobs/components/ActionBanner";
import { DisputeDialog } from "@/app/workspace/jobs/components/DisputeDialog";
import { MissionDetails } from "@/app/workspace/jobs/components/MissionDetails";
import { MissionHeader } from "@/app/workspace/jobs/components/MissionHeader";
import { MissionTimeline } from "@/app/workspace/jobs/components/MissionTimeline";
import { PhotoLightbox } from "@/app/workspace/jobs/components/PhotoLightbox";
import { ValidationDialog } from "@/app/workspace/jobs/components/ValidationDialog";
import { useMissionManagement } from "@/hooks/use-mission-management";
import type {
  DisputeFormType,
  ValidationFormType,
} from "@/lib/validation/schemas";
import { AlertCircle, MessageSquare, Wrench } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Job() {
  const params = useParams();
  const requestId = params?.id ? parseInt(params.id as string) : 0;
  const [activeTab, setActiveTab] = useState<"mission" | "chat">("mission");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(3); // Fake data

  const { startMission, handleValidation, handleDispute, isLoading } =
    useMissionManagement();

  const {
    data: mission,
    error,
    mutate,
  } = useSWR<ServiceRequestForArtisan>(
    `/api/service-requests/${requestId}`,
    fetcher
  );

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600">
            Impossible de charger les détails de la demande
          </p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  const photos = mission?.photos ? JSON.parse(mission.photos) : [];

  const handleStartMission = async () => {
    try {
      await startMission(mission);
      mutate();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors du démarrage de la mission"
      );
    }
  };

  const handleCallClient = () => {
    if (mission.clientPhone) {
      window.location.href = `tel:${mission.clientPhone}`;
    } else {
      alert("Numéro de téléphone non disponible");
    }
  };

  const handleValidationSubmit = async (data: ValidationFormType) => {
    try {
      await handleValidation(mission, data);
      setShowValidationDialog(false);
      mutate();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erreur lors de la validation"
      );
    }
  };

  const handleDisputeSubmit = async (data: DisputeFormType) => {
    try {
      await handleDispute(mission, data);
      setShowDisputeDialog(false);
      mutate();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la contestation"
      );
    }
  };

  const openPhotoLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    if (selectedPhotoIndex === null || !photos) return;

    if (direction === "prev") {
      setSelectedPhotoIndex(
        selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1
      );
    } else {
      setSelectedPhotoIndex(
        selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0
      );
    }
  };

  const handleTabSwitch = (tab: "mission" | "chat") => {
    setActiveTab(tab);
    if (tab === "chat") {
      setUnreadMessageCount(0);
    }
  };

  return (
    <>
      <ActionBanner
        status={mission.status}
        onStartMission={handleStartMission}
        onOpenValidation={() => setShowValidationDialog(true)}
        onOpenDispute={() => setShowDisputeDialog(true)}
      />

      <div className="space-y-6 bg-gray-50 min-h-screen">
        <MissionHeader
          mission={mission}
          onStartMission={handleStartMission}
          onOpenValidation={() => setShowValidationDialog(true)}
          onOpenDispute={() => setShowDisputeDialog(true)}
          onCallClient={handleCallClient}
        />

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="relative">
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => handleTabSwitch("mission")}
                className={`px-2 py-2 font-medium text-sm transition-all duration-200 relative ${
                  activeTab === "mission"
                    ? "bg-white text-blue-600 border-t-4 border-t-blue-500 border-r border-l border-gray-200 -mb-px z-10"
                    : "bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 mr-1 border-t border-l border-r border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  <span>Détails de la mission</span>
                </div>
              </button>

              <button
                onClick={() => handleTabSwitch("chat")}
                className={`px-2 py-2 font-medium text-sm transition-all duration-200 relative ${
                  activeTab === "chat"
                    ? "bg-white text-blue-600 border-t-4 border-t-blue-500 border-r border-l border-gray-200 -mb-px z-10"
                    : "bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200 border-t border-l border-r border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    Chat avec{" "}
                    {mission.clientName || "Nom du client non disponible"}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {unreadMessageCount > 0 && activeTab !== "chat" && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white">
                      {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-white">
            {activeTab === "mission" ? (
              <div className="space-y-8">
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Left Side - Mission Details */}
                  <div className="lg:col-span-3 space-y-8">
                    <MissionDetails
                      location={mission.location}
                      description={mission.description}
                      notes={mission.notes}
                      photos={photos}
                      onPhotoClick={openPhotoLightbox}
                    />
                  </div>

                  {/* Right Side - Timeline */}
                  <div className="lg:col-span-1 flex justify-end">
                    <MissionTimeline
                      status={mission.status}
                      statusHistory={mission.statusHistory}
                      createdAt={mission.createdAt}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Tab */
              <div className="h-[600px]">
                <ConversationChat
                  requestId={requestId}
                  currentUserId={currentUserId}
                  currentUserRole="professional"
                  otherUserName={mission.clientName || "Client"}
                  otherUserRole="client"
                  className="h-full"
                  showHeader={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={photos}
        selectedIndex={selectedPhotoIndex}
        onClose={closePhotoLightbox}
        onNavigate={navigatePhoto}
      />

      {/* Validation Dialog */}
      <ValidationDialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        mission={mission}
        onSubmit={handleValidationSubmit}
        isSubmitting={isLoading}
      />

      {/* Dispute Dialog */}
      <DisputeDialog
        open={showDisputeDialog}
        onOpenChange={setShowDisputeDialog}
        mission={mission}
        onSubmit={handleDisputeSubmit}
        isSubmitting={isLoading}
      />
    </>
  );
}
