import { setGuestToken } from "@/app/suivi/[token]/token-storage";
import { createServiceRequest } from "@/app/workspace/actions";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { cn, fetcher, getCategoryConfig, ServiceType } from "@/lib/utils";
import {
  CreateRequestType,
  createServiceRequestSchema,
} from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Plus, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import useSWR from "swr";

interface NewRequestProps {
  onRequestCreated: () => void;
  isModal?: boolean;
  className?: string;
}

export function NewRequest({
  onRequestCreated,
  isModal = false,
  className,
}: NewRequestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const userEmail = user?.email;
  const [isPending, startTransition] = useTransition();
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
      urgency: "",
      description: "",
      clientEmail: userEmail || "",
      photos: [],
      location: "",
      location_housenumber: "",
      location_street: "",
      location_postcode: "",
      location_city: "",
      location_citycode: "",
      location_district: "",
      location_coordinates: "",
      location_context: "",
    },
  });

  const photos = useWatch({ control, name: "photos" });

  const onSubmit: SubmitHandler<CreateRequestType> = async (data) => {
    const serviceRequestResult = await createServiceRequest(data);
    if ("success" in serviceRequestResult && serviceRequestResult.success) {
      if (serviceRequestResult.guestToken) {
        setGuestToken(serviceRequestResult.guestToken);
      }
      setIsOpen(false);
      router.push(`/workspace/requests/${serviceRequestResult.requestId}`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setValue("photos", [...(photos || []), ...files], { shouldValidate: true });
  };

  const removePhoto = (index: number) => {
    setValue(
      "photos",
      photos?.filter((_, i) => i !== index),
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

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre de la demande *
        </label>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                {...field}
                placeholder="Donnez un titre court à votre demande..."
                className={`w-full ${
                  error
                    ? "border-red-300 focus:border-red-500"
                    : "focus:border-blue-500"
                }`}
                maxLength={100}
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
        {!errors.title && (
          <p className="text-xs text-gray-500 mt-1">Maximum 100 caractères</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de service *
          </label>
          <Controller
            control={control}
            name="serviceType"
            render={({ field, fieldState: { error } }) => (
              <div>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={`w-full ${error ? "border-red-300" : ""}`}
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
                        <SelectItem key={serviceType} value={serviceType}>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgence *
          </label>
          <Controller
            control={control}
            name="urgency"
            render={({ field, fieldState: { error } }) => (
              <div className="w-full">
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className={error ? "border-red-300" : ""}>
                    <SelectValue placeholder="Quand ?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">🚨 Urgent (24h)</SelectItem>
                    <SelectItem value="week">📅 Cette semaine</SelectItem>
                    <SelectItem value="flexible">⏰ Flexible</SelectItem>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState: { error } }) => (
            <div>
              <Textarea
                {...field}
                placeholder="Décrivez votre problème ou vos besoins en détail..."
                className={`min-h-[100px] resize-none ${
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
                  error ? "focus:border-red-500" : "focus:border-blue-500"
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
              const firstErrorWithMessage = values.find((e: any) => e?.message);
              if (firstErrorWithMessage)
                return (firstErrorWithMessage as any).message;
            }

            return "Erreur de validation";
          };

          const errorMessage = getErrorMessage(error);
          const hasError = !!errorMessage;

          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📸 Photos (max 7 photos, 5MB chacune)
              </label>
              <div className="space-y-2">
                {/* Photo Preview Grid */}
                {photos && photos.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {photos.map((photo: File, index: number) => {
                      // Check if this specific photo has validation issues
                      const isPhotoTooLarge = photo.size > 5 * 1024 * 1024;
                      const isInvalidFormat = ![
                        "image/jpeg",
                        "image/jpg",
                        "image/png",
                        "image/gif",
                        "image/webp",
                      ].includes(photo.type);
                      const isNameTooLong = photo.name.length > 100;
                      const hasPhotoError =
                        isPhotoTooLarge || isInvalidFormat || isNameTooLong;

                      const getPhotoErrorMessage = () => {
                        if (isPhotoTooLarge) return "Photo trop lourde";
                        if (isInvalidFormat) return "Format non supporté";
                        if (isNameTooLong) return "Nom de fichier trop long";
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

      <div className={`flex gap-3 ${isModal ? "pt-4 border-t" : ""}`}>
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-fixeo-accent-500 hover:bg-fixeo-accent-600 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création et paiement...
            </>
          ) : (
            "Créer la demande et payer"
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <>
      {isModal ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className={cn(
                className,
                "w-full bg-fixeo-accent-500 hover:bg-fixeo-accent-500 text-white font-medium py-3 px-4 rounded-lg shadow-sm transition-colors cursor-pointer hover:cursor-pointer"
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Créer une nouvelle demande
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Décrivez votre besoin et recevez des devis personnalisés de nos
                artisans qualifiés.
              </DialogDescription>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Créer une nouvelle demande
              </CardTitle>
              <p className="text-sm text-gray-600">
                Remplissez ce formulaire pour soumettre votre demande de service
              </p>
            </CardHeader>
            <CardContent>{formContent}</CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
