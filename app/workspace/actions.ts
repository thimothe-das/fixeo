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
import { randomUUID } from "crypto";
import { z } from "zod";

export type CreateRequestType = z.infer<typeof createServiceRequestSchema>;

const createServiceRequestSchema = z.object({
  title: z
    .string()
    .min(1, "Titre requis")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  serviceType: z.string().min(1, "Type de service requis"),
  urgency: z.string().min(1, "Niveau d'urgence requis"),
  description: z
    .string()
    .min(10, "Description doit contenir au moins 10 caractères"),
  location: z.string().min(5, "Adresse d'intervention requise"),
  location_housenumber: z.string().optional(),
  location_street: z.string().optional(),
  location_postcode: z.string().optional(),
  location_city: z.string().optional(),
  location_citycode: z.string().optional(),
  location_district: z.string().optional(),
  location_coordinates: z.string().optional(),
  location_context: z.string().optional(),
  clientEmail: z.string(),
  photos: z.any().array().optional(),
});

export const createServiceRequest = async (data: CreateRequestType) => {
  // Check if user is logged in
  let currentUser;
  try {
    currentUser = await getUser();
    console.log("Current user:", currentUser?.id, currentUser?.email);
  } catch {
    currentUser = null;
    console.log("No user logged in");
  }

  const {
    title,
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
    // clientPhone,
    photos,
  } = data;

  // Generate guest token if not logged in
  const guestToken = currentUser ? null : randomUUID();

  try {
    const newServiceRequest: NewServiceRequest = {
      title,
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
      clientEmail: clientEmail || currentUser?.email || null,
      userId: currentUser?.id || null,
      guestToken,
      status: ServiceRequestStatus.AWAITING_ESTIMATE,
    };

    console.log("About to insert service request:", newServiceRequest);

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

    console.log("Created request:", createdRequest);

    if (!createdRequest) {
      return {
        error: "Échec de l'envoi de la demande. Veuillez réessayer.",
      };
    }

    return {
      success: true,
      message:
        "Votre demande a été envoyée avec succès ! Les artisans de votre secteur vont être notifiés.",
      requestId: createdRequest.id,
      guestToken: guestToken || undefined,
    };
  } catch (error) {
    console.error("Error creating service request:", error);
    return {
      error:
        "Une erreur s'est produite lors de l'envoi de votre demande. Veuillez réessayer.",
    };
  }
};
