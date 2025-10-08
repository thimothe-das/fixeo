import { z } from "zod";
import { ServiceType, Urgency } from "../utils";

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

export const commonSignUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["client", "artisan"]),
  inviteId: z.string().optional(),
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  phone: phoneSchema,
});

// Complete SignUp schema
export const clientSignUpSchema = commonSignUpSchema.extend({
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
});

export const artisanSignUpSchema = commonSignUpSchema.extend({
  serviceArea: addressSchema,
  serviceArea_housenumber: z.string().optional(),
  serviceArea_street: z.string().optional(),
  serviceArea_postcode: z.string().optional(),
  serviceArea_city: z.string().optional(),
  serviceArea_citycode: z.string().optional(),
  serviceArea_district: z.string().optional(),
  serviceArea_coordinates: z.string().optional(),
  serviceArea_context: z.string().optional(),
  siret: z
    .string()
    .min(14, "SIRET doit contenir 14 chiffres")
    .max(14, "SIRET doit contenir 14 chiffres")
    .trim(),
  experience: z.string().min(1, "Années d'expérience requises").max(20).trim(),
  specialties: z.string().min(5, "Spécialités requises").trim(), // JSON string of array
  description: z
    .string()
    .trim()
    .min(30, "Description trop courte (min 30 caractères)"),
});

export type ClientSignUpType = z.infer<typeof clientSignUpSchema>;
export type ArtisanSignUpType = z.infer<typeof artisanSignUpSchema>;

// Sign-in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Mot de passe requis")
    .min(8, "Minimum 8 caractères")
    .max(100, "Maximum 100 caractères"),
});

export type SignInType = z.infer<typeof signInSchema>;

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
      (val) => Object.values(ServiceType).includes(val as ServiceType),
      "Type de service invalide"
    ),
  urgency: z
    .nativeEnum(Urgency)
    .refine(
      (val) => Object.values(Urgency).includes(val as Urgency),
      "Urgence invalide"
    ),
  description: z
    .string()
    .min(150, "Description trop courte (min 150 caractères)")
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

export enum UserRole {
  USER = "user",
  PROFESSIONAL = "professional",
  CLIENT = "client",
}

export const userSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  role: z.nativeEnum(UserRole),
});

export type UserType = z.infer<typeof userSchema>;

export const artisanSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: emailSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  role: z.nativeEnum(UserRole),
  serviceAreaHousenumber: z.string().trim(),
  serviceAreaStreet: z.string().trim(),
  serviceAreaPostcode: z.string().trim(),
  serviceAreaCity: z.string().trim(),
  serviceAreaCitycode: z.string().trim(),
  serviceAreaDistrict: z.string().trim(),
  serviceAreaCoordinates: z.string().trim(),
  serviceAreaContext: z.string().trim(),
  phone: phoneSchema,
  serviceArea: addressSchema,
  specialties: z.string().trim().min(4, "Spécialités requises"),
  experience: z.string().trim().min(1, "Années d'expérience requises"),
  description: z
    .string()
    .trim()
    .min(10, "Description requise (min 10 caractères)"),
  siret: z.string().min(14, "SIRET requis").max(14, "SIRET trop long"),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
  deletedAt: z.date().optional().nullable(),
});

export type ArtisanType = z.infer<typeof artisanSchema>;

export const clientSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: emailSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  role: z.nativeEnum(UserRole),
  addressHousenumber: z.string(),
  addressStreet: z.string(),
  addressPostcode: z.string(),
  addressCity: z.string(),
  addressCitycode: z.string(),
  addressDistrict: z.string(),
  addressCoordinates: z.string(),
  addressContext: z.string(),
  phone: phoneSchema,
  address: addressSchema,
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
  deletedAt: z.date().optional().nullable(),
});

export type ClientType = z.infer<typeof clientSchema>;

export type AnyUserType = UserType | ArtisanType | ClientType;
