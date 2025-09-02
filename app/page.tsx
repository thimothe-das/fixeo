"use client";

import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  FormState,
  getFormValue,
  ServiceRequestFormFields,
  useFormState,
} from "@/lib/auth/form-utils";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  CreditCard,
  Hammer,
  Home,
  Loader2,
  Paintbrush,
  Phone,
  Search,
  Settings,
  Shield,
  Smartphone,
  Star,
  Upload,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { startTransition, useActionState, useEffect, useState } from "react";
import { createServiceRequest } from "./(dashboard)/actions";
import { TokenStorage } from "./suivi/[token]/token-storage";

type GuestToken = {
  token: string;
  clientEmail: string;
  createdAt: string;
};

export default function FixeoHomePage() {
  const [location, setLocation] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null
  );
  const [serviceType, setServiceType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [guestTokens, setGuestTokens] = useState<GuestToken[]>([]);
  const [state, formAction, pending] = useActionState<
    FormState<ServiceRequestFormFields>,
    FormData
  >(createServiceRequest, { error: "" });

  // Use the form state hook for automatic controlled input updates
  useFormState(
    state,
    { serviceType, urgency, location },
    {
      serviceType: setServiceType,
      urgency: setUrgency,
      location: setLocation,
    }
  );

  // Load guest tokens from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("fixeo_guest_tokens");
      if (stored) {
        try {
          setGuestTokens(JSON.parse(stored));
        } catch {
          // Invalid JSON, clear it
          localStorage.removeItem("fixeo_guest_tokens");
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGuestTokens(
        JSON.parse(localStorage.getItem("fixeo_guest_tokens") || "[]")
      );
    }
  }, [state]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      alert("Maximum 5 photos allowed");
      return;
    }
    setPhotos((prev) => [...prev, ...files].slice(0, 5)); // Max 5 photos
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddressChange = (
    address: AddressData | null,
    rawValue: string
  ) => {
    setSelectedAddress(address);
    setLocation(rawValue);
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return [];

    setIsUploading(true);
    try {
      const formData = new FormData();
      photos.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      return result.photos;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Upload photos first if any are selected
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        photoUrls = await uploadPhotos();
      }

      // Add photo URLs to form data
      formData.set("photos", JSON.stringify(photoUrls));

      // Call the original form action
      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const services = [
    { icon: Wrench, name: "Plomberie", color: "bg-blue-100 text-blue-600" },
    { icon: Zap, name: "Électricité", color: "bg-yellow-100 text-yellow-600" },
    {
      icon: Hammer,
      name: "Menuiserie",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Paintbrush,
      name: "Peinture",
      color: "bg-purple-100 text-purple-600",
    },
    { icon: Home, name: "Rénovation", color: "bg-green-100 text-green-600" },
    { icon: Settings, name: "Dépannage", color: "bg-red-100 text-red-600" },
  ];

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <TokenStorage token={state.guestToken} />

      <section className="relative bg-gradient-to-br from-slate-50 to-blue-50 py-8 lg:py-12 min-h-[calc(100vh-80px)] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Envoyez votre demande,
            <span className="block text-blue-600">un artisan l'accepte</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">
            Fixéo connecte automatiquement votre demande au premier artisan
            disponible près de chez vous.
          </p>
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start mt-8">
            <div className="lg:col-span-7">
              {/* Request Form */}
              <div className="max-w-2xl">
                <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center">
                      <Search className="mr-2 h-4 w-4 text-blue-600" />
                      Détaillez votre demande
                    </CardTitle>
                    <p className="text-xs text-gray-600">
                      Plus d'infos = réponse plus rapide
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      {/* Service Type & Urgency */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Type de travaux *
                          </label>
                          <Select
                            name="serviceType"
                            value={serviceType}
                            onValueChange={setServiceType}
                            required
                          >
                            <SelectTrigger className="h-12 border-2 focus:border-blue-500">
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
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Urgence *
                          </label>
                          <Select
                            name="urgency"
                            value={urgency}
                            onValueChange={setUrgency}
                            required
                          >
                            <SelectTrigger className="h-12 border-2 focus:border-blue-500">
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
                        </div>
                      </div>

                      {/* Job Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                          Description des travaux *
                        </label>
                        <Textarea
                          name="description"
                          placeholder="Ex: Robinet de cuisine qui fuit au niveau du joint, remplacer le joint..."
                          className="min-h-[70px] border-2 focus:border-blue-500 resize-none text-sm"
                          defaultValue={getFormValue(state, "description")}
                          required
                        />
                      </div>

                      {/* Email & Location Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1">
                            📧 Email de contact *
                          </label>
                          <Input
                            name="clientEmail"
                            type="email"
                            placeholder="votre@email.com"
                            className="h-11 focus:border-blue-500 text-sm"
                            defaultValue={getFormValue(state, "clientEmail")}
                            required
                          />
                        </div>
                        <div>
                          <AddressAutocomplete
                            label="📍 Adresse d'intervention"
                            placeholder="Tapez votre adresse complète..."
                            name="location"
                            value={location}
                            onChange={handleAddressChange}
                            required
                            className="h-11 focus:border-blue-500 text-sm"
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

                          {/* Upload Button */}
                          {photos.length < 5 && (
                            <div>
                              <input
                                type="file"
                                id="photo-upload"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                disabled={photos.length >= 5}
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
                          )}
                        </div>
                      </div>

                      {/* Error Display */}
                      {state?.error && (
                        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                          {state.error}
                        </div>
                      )}

                      {/* Success Display */}
                      {state?.success && state?.message && (
                        <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md">
                          {state.message}
                        </div>
                      )}

                      {/* Submit Button */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={pending || isUploading}
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {pending || isUploading ? (
                            <>
                              <Loader2 className="animate-spin mr-2 h-4 w-4" />
                              {isUploading
                                ? "Upload des photos..."
                                : "Envoi en cours..."}
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
                    <div className="text-xl font-bold text-blue-600">5000+</div>
                    <div className="text-sm text-gray-700">Artisans</div>
                  </div>
                  <div className="text-center bg-white/70 backdrop-blur rounded-lg p-3 border border-white/50">
                    <div className="text-xl font-bold text-blue-600">8min</div>
                    <div className="text-sm text-gray-700">Réponse</div>
                  </div>
                  <div className="text-center bg-white/70 backdrop-blur rounded-lg p-3 border border-white/50">
                    <div className="text-xl font-bold text-blue-600">96%</div>
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
                        <Clock className="mr-2 h-4 w-4 text-blue-600" />
                        Vos demandes précédentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {guestTokens.map((token, index) => (
                          <a
                            key={token.token}
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
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tous types de travaux acceptés
            </h2>
            <p className="text-lg text-gray-600">
              Soumettez votre demande, nos artisans spécialisés y répondront
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-105 bg-gradient-to-b from-white to-gray-50"
              >
                <CardContent className="p-5 text-center">
                  <div
                    className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm`}
                  >
                    <service.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {service.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Spécialistes disponibles
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-600">
              Soumettez votre demande et laissez les artisans venir à vous
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Envoyez votre demande
              </h3>
              <p className="text-gray-600">
                Décrivez vos travaux, ajoutez des photos, indiquez l'adresse et
                votre budget. Votre demande est diffusée aux artisans de votre
                secteur.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Un artisan accepte
              </h3>
              <p className="text-gray-600">
                Le premier artisan disponible et qualifié accepte votre demande.
                Vous recevez ses coordonnées instantanément.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Travaux réalisés
              </h3>
              <p className="text-gray-600">
                L'artisan intervient selon les modalités convenues. Payez
                directement via l'app une fois les travaux terminés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Votre sécurité, notre priorité
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Artisans vérifiés
                    </h3>
                    <p className="text-gray-600">
                      Tous nos professionnels sont contrôlés et certifiés. Vos
                      photos les aident à mieux évaluer le travail.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Paiement sécurisé
                    </h3>
                    <p className="text-gray-600">
                      Transactions protégées et garantie satisfait ou remboursé.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Support 7j/7
                    </h3>
                    <p className="text-gray-600">
                      Notre équipe est là pour vous accompagner à tout moment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center">
                    <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Garantie qualité
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Satisfaction garantie sur toutes nos interventions ou nous
                      trouvons une solution.
                    </p>
                    <div className="flex justify-center space-x-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-5 w-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Plus de 15,000 avis clients
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* For Artisans */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Vous êtes artisan ?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Recevez des demandes de travaux automatiquement selon vos
                spécialités
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-lg">
                    Recevez des demandes en temps réel
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-lg">
                    Acceptez seulement les missions qui vous conviennent
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-lg">
                    Paiements automatiques après intervention
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-lg">
                    Zéro prospection, concentrez-vous sur votre métier
                  </span>
                </div>
              </div>

              <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3">
                Devenir partenaire
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      +40%
                    </div>
                    <div className="text-blue-100 text-sm">
                      de revenus en moyenne
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      150+
                    </div>
                    <div className="text-blue-100 text-sm">
                      nouveaux clients/mois
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      4.9★
                    </div>
                    <div className="text-blue-100 text-sm">
                      satisfaction artisans
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      24h
                    </div>
                    <div className="text-blue-100 text-sm">paiement moyen</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Téléchargez l'app Fixéo
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Gérez vos demandes, suivez vos artisans et payez en toute
                sécurité depuis votre smartphone.
              </p>

              <div className="flex items-center space-x-4 mb-8">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">4.8</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">
                  Plus de 25,000 téléchargements
                </span>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" className="h-14 px-6">
                  <Smartphone className="mr-3 h-6 w-6" />
                  <div className="text-left">
                    <div className="text-xs text-gray-600">Télécharger sur</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-14 px-6">
                  <Smartphone className="mr-3 h-6 w-6" />
                  <div className="text-left">
                    <div className="text-xs text-gray-600">Disponible sur</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="mt-10 lg:mt-0 text-center">
              <div className="inline-block bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-3xl shadow-2xl">
                <Smartphone className="h-32 w-32 text-white mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
