"use client";

import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "@/lib/db/schema";
import {
  fetcher,
  getCategoryConfig,
  getPriorityConfig,
  ServiceType,
  Urgency,
} from "@/lib/utils";
import {
  CreateRequestType,
  createServiceRequestSchema,
} from "@/lib/validation/schemas";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getGuestTokens, setGuestToken } from "../suivi/[token]/token-storage";
import { createServiceRequest } from "../workspace/actions";

export default function Form() {
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const guestTokens = getGuestTokens();
  const isLoggedIn = user?.id;
  const userEmail = user?.email;
  const disableEmailInput = Boolean(isLoggedIn && userEmail);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestType>({
    resolver: zodResolver(createServiceRequestSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      serviceType: "",
      urgency: Urgency.FLEXIBLE,
      description: "",
      location: "",
      location_housenumber: "",
      location_street: "",
      location_postcode: "",
      location_city: "",
      location_citycode: "",
      location_district: "",
      location_coordinates: "",
      location_context: "",
      clientEmail: userEmail || "",
      photos: [],
    },
  });
  const photos = useWatch({ control, name: "photos" });

  const onSubmit: SubmitHandler<CreateRequestType> = async (data) => {
    const serviceRequestResult = await createServiceRequest(data);
    if ("success" in serviceRequestResult && serviceRequestResult.success) {
      if (serviceRequestResult.guestToken) {
        setGuestToken(serviceRequestResult.guestToken);
      }
      router.push(`/suivi/${serviceRequestResult.guestToken}`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setValue("photos", [...(photos || []), ...files], { shouldValidate: true });
  };

  const removePhoto = (index: number) => {
    setValue(
      "photos",
      photos?.filter((_, i: number) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleAddressChange = (value: AddressData | null): void => {
    setValue("location_housenumber", value?.housenumber || "");
    setValue("location_street", value?.street || "");
    setValue("location_postcode", value?.postcode || "");
    setValue("location_city", value?.city || "");
    setValue("location_citycode", value?.citycode || "");
    setValue("location_district", value?.district || "");
    setValue("location_coordinates", value?.coordinates.join(",") || "");
    setValue("location_context", value?.context || "");
    setValue("location", value?.label || "");
    trigger("location");
  };
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start mt-8">
      <div className="lg:col-span-7">
        {/* Request Form */}
        <div className="max-w-2xl">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center">
                <Search className="mr-2 h-4 w-4 text-fixeo-main-600" />
                Détaillez votre demande
              </CardTitle>
              <p className="text-xs text-gray-600">
                Plus d'infos = réponse plus rapide
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Type de travaux *
                    </label>
                    <Controller
                      control={control}
                      name="serviceType"
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Select {...field} onValueChange={field.onChange}>
                            <SelectTrigger
                              className={`w-full ${
                                error ? "border-red-300" : ""
                              }`}
                            >
                              <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(ServiceType).map((serviceType) => {
                                const categoryConfig = getCategoryConfig(
                                  serviceType,
                                  "h-4 w-4"
                                );
                                return (
                                  <SelectItem
                                    key={serviceType}
                                    value={serviceType}
                                  >
                                    {categoryConfig.icon}
                                    {categoryConfig.type}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {error && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Urgence *
                    </label>
                    <Controller
                      control={control}
                      name="urgency"
                      render={({ field, fieldState: { error } }) => (
                        <div className="w-full">
                          <Select {...field} onValueChange={field.onChange}>
                            <SelectTrigger
                              className={error ? "border-red-300" : ""}
                            >
                              <SelectValue placeholder="Quand ?" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(Urgency).map((urgency) => {
                                const urgencyConfig = getPriorityConfig(
                                  urgency,
                                  "h-4 w-4"
                                );
                                return (
                                  <SelectItem key={urgency} value={urgency}>
                                    {urgencyConfig.icon}
                                    {urgencyConfig.label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {error && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Titre de la demande *
                  </label>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          placeholder="Ex: Réparer robinet qui fuit"
                          className={`h-11 text-sm ${
                            error
                              ? "border-red-300 focus:border-red-500"
                              : "focus:border-blue-500"
                          }`}
                        />
                        {error && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Description des travaux *
                  </label>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Textarea
                          {...field}
                          placeholder="Ex: Robinet de cuisine qui fuit au niveau du joint, remplacer le joint..."
                          className={`min-h-[70px] text-sm ${
                            error ? "border-red-300 focus:border-red-500" : ""
                          }`}
                        />
                        {error && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Email & Location Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      📧 Email de contact *
                    </label>
                    <Controller
                      control={control}
                      name="clientEmail"
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            {...field}
                            type="email"
                            autoComplete="email"
                            placeholder="votre@email.com"
                            className={`h-11 text-sm ${
                              error
                                ? "border-red-300 focus:border-red-500"
                                : "focus:border-blue-500"
                            }`}
                            disabled={disableEmailInput}
                          />
                          {error && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      control={control}
                      name="location"
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <AddressAutocomplete
                            onChange={handleAddressChange}
                            label="📍 Adresse d'intervention *"
                            placeholder="Tapez votre adresse complète..."
                            className={`text-sm ${
                              error
                                ? "focus:border-red-500"
                                : "focus:border-blue-500"
                            }`}
                          />
                          {error && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Photo Upload Section - Compact */}
                <Controller
                  control={control}
                  name="photos"
                  render={({ fieldState: { error } }) => {
                    // Handle array validation errors properly
                    const getErrorMessage = (error: any) => {
                      if (!error) return null;

                      // Direct error message
                      if (error.message) return error.message;

                      // Array validation errors (individual file errors)
                      if (error.root?.message) return error.root.message;

                      // Handle array item errors
                      if (Array.isArray(error)) {
                        const firstError = error.find((e) => e?.message);
                        if (firstError) return firstError.message;
                      }

                      // Handle nested errors
                      if (typeof error === "object" && error !== null) {
                        const values = Object.values(error);
                        const firstErrorWithMessage = values.find(
                          (e: any) => e?.message
                        );
                        if (firstErrorWithMessage)
                          return (firstErrorWithMessage as any).message;
                      }

                      return "Erreur de validation";
                    };

                    const errorMessage = getErrorMessage(error);
                    const hasError = !!errorMessage;

                    return (
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                          📸 Photos (max 7 photos, 5MB chacune)
                        </label>
                        <div className="space-y-2">
                          {/* Photo Preview Grid */}
                          {photos && photos.length > 0 && (
                            <div className="grid grid-cols-5 gap-2">
                              {photos.map((photo: File, index: number) => {
                                // Check if this specific photo has validation issues
                                const isPhotoTooLarge =
                                  photo.size > 5 * 1024 * 1024;
                                const isInvalidFormat = ![
                                  "image/jpeg",
                                  "image/jpg",
                                  "image/png",
                                  "image/gif",
                                  "image/webp",
                                ].includes(photo.type);
                                const isNameTooLong = photo.name.length > 100;
                                const hasPhotoError =
                                  isPhotoTooLarge ||
                                  isInvalidFormat ||
                                  isNameTooLong;

                                const getPhotoErrorMessage = () => {
                                  if (isPhotoTooLarge)
                                    return "Photo trop lourde";
                                  if (isInvalidFormat)
                                    return "Format non supporté";
                                  if (isNameTooLong)
                                    return "Nom de fichier trop long";
                                  return "";
                                };

                                const photoContent = (
                                  <div className="relative">
                                    <img
                                      src={URL.createObjectURL(photo)}
                                      alt={`Photo ${index + 1}`}
                                      className={`w-full h-16 object-cover rounded-lg border-2 transition-all ${
                                        hasPhotoError
                                          ? "border-red-500 ring-2 ring-red-200"
                                          : "border-gray-200"
                                      }`}
                                    />

                                    {/* Error overlay for problematic photos */}
                                    {hasPhotoError && (
                                      <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="h-4 w-4 text-red-600 bg-white rounded-full p-0.5" />
                                      </div>
                                    )}
                                  </div>
                                );

                                return (
                                  <div key={index} className="relative group">
                                    {hasPhotoError ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          {photoContent}
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="bottom"
                                          className="text-white"
                                        >
                                          {getPhotoErrorMessage()}
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      photoContent
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => removePhoto(index)}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                    >
                                      <X className="h-2 w-2" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div>
                            <input
                              type="file"
                              id="photo-upload"
                              multiple
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                            <label
                              htmlFor="photo-upload"
                              className={`flex items-center justify-center w-full h-12 border border-dashed rounded-lg cursor-pointer transition-colors`}
                            >
                              <div className="flex items-center space-x-2">
                                <Upload className={`h-4 w-4`} />
                                <span className="text-sm text-gray-700">
                                  Ajouter photo (5MB chacune, max 7)
                                </span>
                              </div>
                            </label>
                          </div>
                          {hasError && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-fixeo-accent-400 to-fixeo-accent-500 hover:from-fixeo-accent-500 hover:to-fixeo-accent-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Envoyer ma demande aux artisans
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-1">
                    🔒 Sécurisé • Réponse en moins de 8 minutes
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center bg-white/70 backdrop-blur rounded-lg p-3 border border-white/50">
              <div className="text-xl font-bold text-fixeo-main-400">5000+</div>
              <div className="text-sm text-gray-700">Artisans</div>
            </div>
            <div className="text-center bg-white/70 backdrop-blur rounded-lg p-3 border border-white/50">
              <div className="text-xl font-bold text-fixeo-main-400">8min</div>
              <div className="text-sm text-gray-700">Réponse</div>
            </div>
            <div className="text-center bg-white/70 backdrop-blur rounded-lg p-3 border border-white/50">
              <div className="text-xl font-bold text-fixeo-main-400">96%</div>
              <div className="text-sm text-gray-700">Accepté</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Image & Previous Requests */}
      <div className="mt-12 lg:mt-0 lg:col-span-5 space-y-6">
        {/* Previous Requests for Guest Users */}
        {guestTokens.length > 0 && (
          <div>
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-fixeo-main-600" />
                  Vos demandes précédentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guestTokens.map((token: string, index: number) => (
                    <a
                      key={token}
                      href={`/suivi/${token}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          Demande #{index + 1}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-600">
                        Cliquez pour suivre votre demande
                      </span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Artisan Image - Smaller */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Artisan au travail"
            className="rounded-2xl shadow-xl w-full max-w-md mx-auto lg:max-w-full"
          />
          <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">
                  Demande acceptée
                </div>
                <div className="text-xs text-gray-600">
                  Par Marc P. - Plombier
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
