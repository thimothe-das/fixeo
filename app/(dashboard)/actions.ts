"use server";

import { db } from "@/lib/db/drizzle";
import { updateServiceRequest } from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries/common";
import { uploadPhotosToS3 } from "@/lib/db/queries/upload";
import {
  serviceRequests,
  ServiceRequestStatus,
  type NewServiceRequest,
} from "@/lib/db/schema";
import { CreateRequestType } from "@/lib/validation/schemas";
import { randomUUID } from "crypto";

export const createServiceRequest = async (data: CreateRequestType) => {
  const {
    serviceType,
    urgency,
    description,
    location,
    location_housenumber,
    location_street,
    location_postcode,
    location_city,
    location_citycode,
    location_district,
    location_coordinates,
    location_context,
    // clientName,
    clientEmail,
    photos,
  } = data;

  // Check if user is logged in
  let currentUser;
  try {
    currentUser = await getUser();
  } catch {
    currentUser = null;
  }

  // Generate secure server-side token for guest users
  const guestToken = currentUser ? null : randomUUID();

  try {
    const newServiceRequest: NewServiceRequest = {
      serviceType,
      urgency,
      description,
      location,
      locationHousenumber: location_housenumber || null,
      locationStreet: location_street || null,
      locationPostcode: location_postcode || null,
      locationCity: location_city || null,
      locationCitycode: location_citycode || null,
      locationDistrict: location_district || null,
      locationCoordinates: location_coordinates || null,
      locationContext: location_context || null,
      clientEmail,
      userId: currentUser?.id || null,
      guestToken,
      status: ServiceRequestStatus.AWAITING_PAYMENT,
    };

    const [createdRequest] = await db
      .insert(serviceRequests)
      .values(newServiceRequest)
      .returning();

    if (photos && photos.length > 0 && createdRequest) {
      console.log("Uploading photos...", photos);
      const response = await uploadPhotosToS3(photos);
      const jsonResponse = await response.json();
      const photosUrls = jsonResponse.photos;
      updateServiceRequest(createdRequest.id, {
        photos: JSON.stringify(photosUrls),
      });
    }

    if (!createdRequest) {
      return {
        error: "Échec de l'envoi de la demande. Veuillez réessayer.",
      };
    }

    // TODO: Send email with tracking link for guest users
    if (guestToken) {
      // await sendTrackingEmail(clientEmail, guestToken);
      console.log(`Tracking link: /suivi/${guestToken}`);
    }

    // TODO: Send notifications to nearby artisans
    // TODO: Log the activity
  } catch (error) {
    console.error("Error creating service request:", error);
    return {
      error:
        "Une erreur s'est produite lors de l'envoi de votre demande. Veuillez réessayer.",
    };
  }

  return {
    success: true,
    message:
      "Votre demande a été envoyée avec succès ! Les artisans de votre secteur vont être notifiés.",
    guestToken,
    shouldRedirect: !!guestToken,
  };
};
