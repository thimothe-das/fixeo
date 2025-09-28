import { z } from "zod";

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Minimum 8 caractères")
  .max(100, "Maximum 100 caractères")
  .regex(/^(?=.*[a-z])/, "Manque une minuscule")
  .regex(/^(?=.*[A-Z])/, "Manque une majuscule")
  .regex(/^(?=.*\d)/, "Manque un chiffre")
  .regex(/^(?=.*[@$!%*?&])/, "Manque un caractère spécial (@$!%*?&)");

// Individual field validation schemas
export const firstNameSchema = z
  .string()
  .min(1, "Prénom requis")
  .max(100, "Prénom trop long")
  .trim();

export const lastNameSchema = z
  .string()
  .min(1, "Nom requis")
  .max(100, "Nom trop long")
  .trim();

export const phoneSchema = z
  .string()
  .min(1, "Téléphone requis")
  .min(10, "Téléphone trop court")
  .max(20, "Téléphone trop long")
  .regex(/^[\d\s\-\+\(\)\.]+$/, "Caractères téléphone invalides");

export const emailSchema = z
  .string()
  .min(1, "Email requis")
  .email("Email invalide");

export const addressSchema = z
  .string()
  .min(1, "Adresse requise")
  .max(255, "Adresse trop longue")
  .trim();

// Complete SignUp schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["client", "artisan"]).optional(),
  inviteId: z.string().optional(),
  // Common fields - Required
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  phone: phoneSchema,
  // Address fields - Required
  address: addressSchema,
  address_housenumber: z.string().optional(),
  address_street: z.string().optional(),
  address_postcode: z.string().optional(),
  address_city: z.string().optional(),
  address_citycode: z.string().optional(),
  address_district: z.string().optional(),
  address_coordinates: z.string().optional(),
  address_context: z.string().optional(),
  preferences: z.string().optional(),
  // Professional-specific fields
  serviceArea: z.string().optional(),
  serviceArea_housenumber: z.string().optional(),
  serviceArea_street: z.string().optional(),
  serviceArea_postcode: z.string().optional(),
  serviceArea_city: z.string().optional(),
  serviceArea_citycode: z.string().optional(),
  serviceArea_district: z.string().optional(),
  serviceArea_coordinates: z.string().optional(),
  serviceArea_context: z.string().optional(),
  siret: z.string().max(14).optional(),
  experience: z.string().max(20).optional(),
  specialties: z.string().optional(), // JSON string of array
  description: z.string().optional(),
});

export type SignUpType = z.infer<typeof signUpSchema>;

// Sign-in schema
export const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100), // Keep simple validation for sign-in
});

export type SignInType = z.infer<typeof signInSchema>;

// Service Request schema with detailed custom error messages
export const createServiceRequestSchema = z.object({
  title: z
    .string()
    .min(1, "Titre requis")
    .max(100, "Titre trop long")
    .trim()
    .refine((val) => val.length >= 5, "Titre trop court (min 5 caractères)"),
  serviceType: z
    .string()
    .min(1, "Type de service requis")
    .refine(
      (val) =>
        [
          "plomberie",
          "electricite",
          "menuiserie",
          "peinture",
          "renovation",
          "depannage",
        ].includes(val),
      "Type de service invalide"
    ),
  urgency: z
    .string()
    .min(1, "Urgence requise")
    .refine(
      (val) => ["urgent", "week", "flexible"].includes(val),
      "Urgence invalide"
    ),
  description: z
    .string()
    .min(10, "Description trop courte (min 10 caractères)")
    .max(1000, "Description trop longue")
    .trim()
    .refine(
      (val) => val.split(" ").length >= 3,
      "Description trop courte (min 3 mots)"
    ),
  location: z
    .string()
    .min(5, "Adresse complète requise")
    .max(500, "Adresse trop longue")
    .trim()
    .refine(
      (val) => val.includes(",") || val.length > 10,
      "Adresse incomplète"
    ),
  location_housenumber: z.string().optional(),
  location_street: z.string().optional(),
  location_postcode: z.string().optional(),
  location_city: z.string().optional(),
  location_citycode: z.string().optional(),
  location_district: z.string().optional(),
  location_coordinates: z.string().optional(),
  location_context: z.string().optional(),
  clientEmail: emailSchema,
  photos: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "Photo trop lourde (max 5MB)"
        )
        .refine((file) => file.size > 0, "Fichier vide")
        .refine(
          (file) =>
            [
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/gif",
              "image/webp",
            ].includes(file.type),
          "Format non supporté (JPEG, PNG, GIF, WebP)"
        )
        .refine((file) => file.name.length <= 100, "Nom de fichier trop long")
    )
    .max(7, "Maximum 7 photos")
    .optional(),
});

export type CreateRequestType = z.infer<typeof createServiceRequestSchema>;
