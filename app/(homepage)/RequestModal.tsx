"use client";

import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClientProfile, ProfessionalProfile, User } from "@/lib/db/schema";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import useSWR from "swr";
import { setGuestToken } from "../suivi/[token]/token-storage";
import { createServiceRequest } from "../workspace/actions";

// Type for user with both profiles
type UserWithProfiles = User & {
  clientProfile?: ClientProfile | null;
  professionalProfile?: ProfessionalProfile | null;
};

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onRequestCreated?: () => void;
  redirectPath?: string;
  preSelectedCategory?: string;
}

export default function RequestModal({
  isOpen,
  onClose,
  userEmail,
  onRequestCreated,
  redirectPath,
  preSelectedCategory,
}: RequestModalProps) {
  const [currentStep, setCurrentStep] = useState(preSelectedCategory ? 2 : 1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();

  // Fetch user data for auto-filling (with profiles)
  const { data: user } = useSWR<UserWithProfiles>(
    "/api/user?includeProfiles=true",
    fetcher
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<CreateRequestType>({
    resolver: zodResolver(createServiceRequestSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      serviceType: preSelectedCategory || "",
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

  // Auto-fill user data when available
  useEffect(() => {
    if (user) {
      // Auto-fill email
      if (user.email) {
        setValue("clientEmail", user.email);
      }

      // Auto-fill firstName and lastName from clientProfile or professionalProfile
      if (user.clientProfile?.firstName) {
        setFirstName(user.clientProfile.firstName);
      } else if (user.professionalProfile?.firstName) {
        setFirstName(user.professionalProfile.firstName);
      }

      if (user.clientProfile?.lastName) {
        setLastName(user.clientProfile.lastName);
      } else if (user.professionalProfile?.lastName) {
        setLastName(user.professionalProfile.lastName);
      }
    }
  }, [user, setValue]);

  // Set pre-selected category and start at step 2
  useEffect(() => {
    if (preSelectedCategory) {
      setValue("serviceType", preSelectedCategory);
      setCurrentStep(2);
    }
  }, [preSelectedCategory, setValue]);

  const serviceType = useWatch({ control, name: "serviceType" });
  const urgency = useWatch({ control, name: "urgency" });
  const title = useWatch({ control, name: "title" });
  const description = useWatch({ control, name: "description" });
  const photos = useWatch({ control, name: "photos" });
  const location = useWatch({ control, name: "location" });
  const clientEmail = useWatch({ control, name: "clientEmail" });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const onSubmit: SubmitHandler<CreateRequestType> = async (data) => {
    const serviceRequestResult = await createServiceRequest(data);
    if ("success" in serviceRequestResult && serviceRequestResult.success) {
      if (serviceRequestResult.guestToken) {
        setGuestToken(serviceRequestResult.guestToken);
      }

      // Call the callback if provided
      if (onRequestCreated) {
        onRequestCreated();
      }

      // Handle navigation based on context
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push(`/suivi/${serviceRequestResult.guestToken}`);
      }
    }
  };

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await trigger("serviceType");
        break;
      case 2:
        isValid = await trigger("urgency");
        break;
      case 3:
        isValid = await trigger([
          "location",
          "location_housenumber",
          "location_street",
          "location_postcode",
          "location_city",
        ]);
        break;
      case 4:
        isValid = await trigger("title");
        break;
      case 5:
        isValid = await trigger("description");
        break;
      case 6:
        isValid = await trigger("photos");
        break;
      case 7:
        isValid = await trigger("clientEmail");
        if (isValid && (!firstName || !lastName)) {
          isValid = false;
        }
        break;
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === totalSteps) {
      handleSubmit(onSubmit)();
    }
  };

  const handleBack = () => {
    // Don't go back to step 1 if category was pre-selected
    const minStep = preSelectedCategory ? 2 : 1;
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    const hasData =
      serviceType || urgency !== Urgency.FLEXIBLE || title || description;
    if (hasData) {
      if (
        confirm(
          "Voulez-vous vraiment quitter ? Vos modifications seront perdues."
        )
      ) {
        onClose();
      }
    } else {
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-sm font-medium text-gray-600">
            Étape {currentStep} sur {totalSteps}
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-140px)] overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Step 1: Category Selection */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                  Quel type de service recherchez-vous ?
                </h1>
              </div>
              <Controller
                control={control}
                name="serviceType"
                render={({ field }) => (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.values(ServiceType).map((service) => {
                      const categoryConfig = getCategoryConfig(
                        service,
                        "h-8 w-8"
                      );
                      const isSelected = field.value === service;
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => field.onChange(service)}
                          className={`relative overflow-hidden p-6 border-2 rounded-xl text-left transition-all hover:border-gray-900 group ${
                            isSelected
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-300"
                          }`}
                        >
                          {/* Background Image */}
                          <div className="absolute inset-0 overflow-hidden">
                            <img
                              src={categoryConfig.defaultPhoto}
                              alt={categoryConfig.type}
                              className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                            />
                          </div>

                          {/* Content Overlay */}
                          <div className="relative z-10">
                            <div className="mb-4">{categoryConfig.icon}</div>
                            <div className="text-base font-medium text-gray-900">
                              {categoryConfig.type}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.serviceType && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.serviceType.message}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Urgency Selection */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                  Quelle est l'urgence de votre demande ?
                </h1>
              </div>
              <Controller
                control={control}
                name="urgency"
                render={({ field }) => (
                  <div className="space-y-4">
                    {Object.values(Urgency).map((urgencyLevel) => {
                      const urgencyConfig = getPriorityConfig(
                        urgencyLevel,
                        "h-6 w-6"
                      );
                      const isSelected = field.value === urgencyLevel;
                      const descriptions = {
                        [Urgency.URGENT]: "Dans les prochaines 24h",
                        [Urgency.WEEK]: "Dans les 7 prochains jours",
                        [Urgency.FLEXIBLE]: "Quand vous voulez",
                      };
                      return (
                        <button
                          key={urgencyLevel}
                          type="button"
                          onClick={() => field.onChange(urgencyLevel)}
                          className={`w-full p-6 border-2 rounded-xl text-left transition-all hover:border-gray-900 ${
                            isSelected
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-xl font-semibold text-gray-900 mb-1">
                                {urgencyConfig.label}
                              </div>
                              <div className="text-sm text-gray-600">
                                {descriptions[urgencyLevel as Urgency]}
                              </div>
                            </div>
                            <div className="ml-4">{urgencyConfig.icon}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.urgency && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.urgency.message}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Address */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                  Où se situe l'intervention ?
                </h1>
                <p className="text-gray-600 mt-4">
                  Votre adresse est uniquement communiquée aux artisans une fois
                  leur réservation effectuée.
                </p>
              </div>
              <Controller
                control={control}
                name="location"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <AddressAutocomplete
                      onChange={handleAddressChange}
                      placeholder="Tapez votre adresse complète..."
                      className={`h-14 text-base ${
                        error ? "border-red-500" : ""
                      }`}
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          )}

          {/* Step 4: Title */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                  À présent, donnez un titre à votre demande
                </h1>
                <p className="text-gray-600 mt-4">
                  Les titres courts sont généralement les plus efficaces. Ne
                  vous inquiétez pas, vous pourrez toujours le modifier plus
                  tard.
                </p>
              </div>
              <Controller
                control={control}
                name="title"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Input
                      {...field}
                      placeholder="Ex: Réparer robinet qui fuit"
                      className={`h-14 text-base ${
                        error ? "border-red-500" : ""
                      }`}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        {error && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {error.message}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {field.value?.length || 0}/100
                      </p>
                    </div>
                  </div>
                )}
              />
            </div>
          )}

          {/* Step 5: Description */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                  Décrivez votre demande en détail
                </h1>
                <p className="text-gray-600 mt-4">
                  Partagez ce qui rend votre demande unique et tout ce que les
                  artisans devraient savoir.
                </p>
              </div>
              <Controller
                control={control}
                name="description"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Textarea
                      {...field}
                      placeholder="Décrivez en détail la nature de votre demande, l'état actuel, les éventuels problèmes constatés, et vos attentes concernant les travaux à réaliser..."
                      className={`min-h-[200px] text-base ${
                        error ? "border-red-500" : ""
                      }`}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        {error && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {error.message}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {field.value?.length || 0}/1000
                      </p>
                    </div>
                  </div>
                )}
              />
            </div>
          )}

          {/* Step 6: Photos */}
          {currentStep === 6 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                  Ajoutez quelques photos
                </h1>
                <p className="text-gray-600 mt-4">
                  Pour commencer, vous aurez besoin de 5 photos. Vous pourrez en
                  ajouter d'autres ou faire des modifications plus tard.
                </p>
              </div>
              <Controller
                control={control}
                name="photos"
                render={({ fieldState: { error } }) => {
                  const getErrorMessage = (error: any) => {
                    if (!error) return null;
                    if (error.message) return error.message;
                    if (error.root?.message) return error.root.message;
                    if (Array.isArray(error)) {
                      const firstError = error.find((e) => e?.message);
                      if (firstError) return firstError.message;
                    }
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

                  return (
                    <div className="space-y-4">
                      {/* Photo Preview Grid */}
                      {photos && photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {photos.map((photo: File, index: number) => {
                            const isPhotoTooLarge =
                              photo.size > 5 * 1024 * 1024;
                            const isInvalidFormat = ![
                              "image/jpeg",
                              "image/jpg",
                              "image/png",
                              "image/gif",
                              "image/webp",
                            ].includes(photo.type);
                            const hasPhotoError =
                              isPhotoTooLarge || isInvalidFormat;

                            return (
                              <div key={index} className="relative group">
                                <img
                                  src={URL.createObjectURL(photo)}
                                  alt={`Photo ${index + 1}`}
                                  className={`w-full h-40 object-cover rounded-xl border-2 transition-all ${
                                    hasPhotoError
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                />
                                {hasPhotoError && (
                                  <div className="absolute inset-0 bg-red-500/20 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-red-600 bg-white rounded-full p-1" />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removePhoto(index)}
                                  className="absolute -top-2 -right-2 bg-white border border-gray-300 text-gray-700 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-gray-100"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Upload Area */}
                      <div>
                        <input
                          type="file"
                          id="photo-upload-modal"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="photo-upload-modal"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-900 transition-colors"
                        >
                          <Upload className="h-12 w-12 text-gray-400 mb-4" />
                          <span className="text-base font-medium text-gray-900">
                            Glissez-déposez un fichier
                          </span>
                          <span className="text-sm text-gray-600 mt-1">
                            ou recherchez des photos
                          </span>
                          <span className="text-xs text-gray-500 mt-4">
                            5MB max par photo • Max 7 photos
                          </span>
                        </label>
                      </div>
                      {errorMessage && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errorMessage}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
            </div>
          )}

          {/* Step 7: Contact Information */}
          {currentStep === 7 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                  Confirmez vos informations de contact
                </h1>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">
                    Adresse e-mail
                  </label>
                  <Controller
                    control={control}
                    name="clientEmail"
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          type="email"
                          placeholder="votre@email.com"
                          className={`h-14 text-base ${
                            error ? "border-red-500" : ""
                          }`}
                          disabled={!!userEmail}
                        />
                        {error && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">
                    Prénom
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                    className={`h-14 text-base ${
                      !firstName && currentStep === 7 ? "border-red-500" : ""
                    }`}
                  />
                  {!firstName && currentStep === 7 && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Prénom requis
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">
                    Nom
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Votre nom"
                    className={`h-14 text-base ${
                      !lastName && currentStep === 7 ? "border-red-500" : ""
                    }`}
                  />
                  {!lastName && currentStep === 7 && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Nom requis
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === (preSelectedCategory ? 2 : 1)}
            className={`${
              currentStep === (preSelectedCategory ? 2 : 1) ? "invisible" : ""
            } flex items-center`}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-fixeo-accent-400 to-fixeo-accent-500 hover:from-fixeo-accent-500 hover:to-fixeo-accent-500 text-white px-8 h-12"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Envoi en cours...
              </>
            ) : currentStep === totalSteps ? (
              "Envoyer ma demande"
            ) : (
              "Suivant"
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
