"use client";

import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";
import {
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
import { CreateRequestType, createServiceRequest } from "../workspace/actions";

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
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestType>({
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
      router.push(`/suivi/${serviceRequestResult.guestToken}`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setValue("photos", [...photos, ...files]);
  };

  const removePhoto = (index: number) => {
    setValue(
      "photos",
      photos.filter((_, i) => i !== index)
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
                {/* Service Type & Urgency */}
                <div className="flex gap-4 items-center">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Type de travaux *
                    </label>
                    <Controller
                      control={control}
                      name="serviceType"
                      render={({ field }) => (
                        <Select
                          {...field}
                          onValueChange={field.onChange}
                          required
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choisir..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plomberie">
                              🔧 Plomberie
                            </SelectItem>
                            <SelectItem value="electricite">
                              ⚡ Électricité
                            </SelectItem>
                            <SelectItem value="menuiserie">
                              🔨 Menuiserie
                            </SelectItem>
                            <SelectItem value="peinture">
                              🎨 Peinture
                            </SelectItem>
                            <SelectItem value="renovation">
                              🏠 Rénovation
                            </SelectItem>
                            <SelectItem value="depannage">
                              ⚙️ Dépannage
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                      render={({ field }) => (
                        <Select
                          {...field}
                          onValueChange={field.onChange}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Quand ?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">
                              🚨 Urgent (24h)
                            </SelectItem>
                            <SelectItem value="week">
                              📅 Cette semaine
                            </SelectItem>
                            <SelectItem value="flexible">
                              ⏰ Flexible
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Ex: Réparer robinet qui fuit"
                        className="h-11 focus:border-blue-500 text-sm"
                        required
                      />
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
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Ex: Robinet de cuisine qui fuit au niveau du joint, remplacer le joint..."
                        className="min-h-[70px] text-sm"
                        required
                      />
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
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          placeholder="votre@email.com"
                          className="h-11 focus:border-blue-500 text-sm"
                          required
                          disabled={disableEmailInput}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      control={control}
                      name="location"
                      render={({ field }) => (
                        <AddressAutocomplete
                          onChange={handleAddressChange}
                          label="📍 Adresse d'intervention"
                          placeholder="Tapez votre adresse complète..."
                          required
                          className="h-11 focus:border-blue-500 text-sm"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Photo Upload Section - Compact */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    📸 Photos (optionnel)
                  </label>
                  <div className="space-y-2">
                    {/* Photo Preview Grid */}
                    {photos.length > 0 && (
                      <div className="grid grid-cols-5 gap-2">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-16 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
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
                        className="flex items-center justify-center w-full h-12 border border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Upload className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">
                            Ajouter photo (max 5)
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

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
