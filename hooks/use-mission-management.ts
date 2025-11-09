import { useState } from "react";
import { ServiceRequestStatus } from "@/lib/db/schema";
import type {
  DisputeFormType,
  ValidationFormType,
} from "@/lib/validation/schemas";
import type { ServiceRequestForArtisan } from "@/app/workspace/components/types";

export interface CompletionData {
  type: "success" | "issue" | "impossible" | "validate" | "dispute";
  notes: string;
  issueType?: string;
  photos?: string[];
}

export function useMissionManagement() {
  const [isLoading, setIsLoading] = useState(false);

  const startMission = async (mission: ServiceRequestForArtisan) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/service-requests/${mission.id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        mission.status = ServiceRequestStatus.IN_PROGRESS;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du démarrage de la mission");
      }
    } catch (error) {
      console.error("Error starting mission:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletion = async (
    mission: ServiceRequestForArtisan,
    data: CompletionData
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/service-requests/${mission.id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: data.type,
            notes: data.notes,
            issueType:
              data.type === "issue" || data.type === "dispute"
                ? data.issueType
                : undefined,
            photos: data.photos,
          }),
        }
      );

      if (response.ok) {
        // Update mission status locally
        if (data.type === "success") {
          mission.status = ServiceRequestStatus.IN_PROGRESS;
        } else if (data.type === "validate") {
          mission.status =
            mission.status === ServiceRequestStatus.CLIENT_VALIDATED
              ? ServiceRequestStatus.COMPLETED
              : ServiceRequestStatus.ARTISAN_VALIDATED;
        } else if (data.type === "dispute") {
          mission.status = ServiceRequestStatus.DISPUTED_BY_ARTISAN;
        } else if (data.type === "issue") {
          mission.status = ServiceRequestStatus.RESOLVED;
        } else if (data.type === "impossible") {
          mission.status = ServiceRequestStatus.CANCELLED;
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la finalisation");
      }
    } catch (error) {
      console.error("Error completing mission:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidation = async (
    mission: ServiceRequestForArtisan,
    data: ValidationFormType
  ) => {
    setIsLoading(true);
    try {
      let validationPhotosUrls: string[] = [];

      // Upload photos if provided
      if (data.photos && data.photos.length > 0) {
        const formData = new FormData();
        data.photos.forEach((photo) => {
          formData.append("files", photo);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(
            errorData.error || "Erreur lors de l'upload des photos"
          );
        }

        const { photos: photoUrls } = await uploadResponse.json();
        validationPhotosUrls = photoUrls;
      }

      const response = await fetch(
        `/api/service-requests/${mission.id}/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "approve",
            validationDescription: data.notes,
            validationPhotos: validationPhotosUrls,
          }),
        }
      );

      if (response.ok) {
        mission.status =
          mission.status === ServiceRequestStatus.CLIENT_VALIDATED
            ? ServiceRequestStatus.COMPLETED
            : ServiceRequestStatus.ARTISAN_VALIDATED;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la validation");
      }
    } catch (error) {
      console.error("Error validating completion:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispute = async (
    mission: ServiceRequestForArtisan,
    data: DisputeFormType
  ) => {
    setIsLoading(true);
    try {
      let disputePhotosUrls: string[] = [];

      // Upload photos if provided
      if (data.photos && data.photos.length > 0) {
        const formData = new FormData();
        data.photos.forEach((photo) => {
          formData.append("files", photo);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(
            errorData.error || "Erreur lors de l'upload des photos"
          );
        }

        const { photos: photoUrls } = await uploadResponse.json();
        disputePhotosUrls = photoUrls;
      }

      const response = await fetch(
        `/api/service-requests/${mission.id}/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "dispute",
            disputeReason: data.disputeReason,
            disputeDetails: data.disputeDetails,
            disputePhotos: disputePhotosUrls,
          }),
        }
      );

      if (response.ok) {
        mission.status = ServiceRequestStatus.DISPUTED_BY_ARTISAN;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la contestation");
      }
    } catch (error) {
      console.error("Error disputing completion:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startMission,
    handleValidation,
    handleDispute,
    handleCompletion,
    isLoading,
  };
}

