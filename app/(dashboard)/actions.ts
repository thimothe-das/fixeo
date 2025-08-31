'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { serviceRequests, type NewServiceRequest, ServiceRequestStatus } from '@/lib/db/schema';
import { validatedAction } from '@/lib/auth/middleware';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import { getUser } from '@/lib/db/queries';

const createServiceRequestSchema = z.object({
  serviceType: z.string().min(1, 'Type de service requis'),
  urgency: z.string().min(1, 'Niveau d\'urgence requis'),
  description: z.string().min(10, 'Description doit contenir au moins 10 caractères'),
  location: z.string().min(5, 'Adresse d\'intervention requise'),
  // Structured address fields
  location_housenumber: z.string().optional(),
  location_street: z.string().optional(),
  location_postcode: z.string().optional(),
  location_city: z.string().optional(),
  location_citycode: z.string().optional(),
  location_district: z.string().optional(),
  location_coordinates: z.string().optional(),
  location_context: z.string().optional(),
  clientEmail: z.string().email('Email invalide'),
  photos: z.string().optional(), // JSON string array of photo URLs
});

export const createServiceRequest = validatedAction(
  createServiceRequestSchema,
  async (data, formData) => {
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
      clientName,
      clientEmail,
      clientPhone,
      photos,
    } = data;

    // Check if user is logged in
    let currentUser;
    try {
      currentUser = await getUser();
    } catch {
      currentUser = null;
    }

    // Generate guest token if not logged in
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
        clientName,
        clientEmail,
        clientPhone,
        photos,
        userId: currentUser?.id || null,
        guestToken,
        status: ServiceRequestStatus.AWAITING_ESTIMATE,
      };

      const [createdRequest] = await db
        .insert(serviceRequests)
        .values(newServiceRequest)
        .returning();

      if (!createdRequest) {
        return {
          error: 'Échec de l\'envoi de la demande. Veuillez réessayer.',
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
      console.error('Error creating service request:', error);
      return {
        error: 'Une erreur s\'est produite lors de l\'envoi de votre demande. Veuillez réessayer.',
      };
    }

    // For guest users, redirect to tracking page (outside try-catch to avoid catching redirect error)
    if (guestToken) {
      redirect(`/suivi/${guestToken}`);
    }

    return {
      success: true,
      message: 'Votre demande a été envoyée avec succès ! Les artisans de votre secteur vont être notifiés.',
    };
  }
); 