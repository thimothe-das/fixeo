"use client";

import { signUpArtisan } from "@/app/(login)/actions";
import { PasswordRequirements } from "@/app/(login)/sign-up/password-requirements";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ROLES } from "@/lib/types/roles";
import { cn, EXPERIENCE_OPTIONS, ServiceType } from "@/lib/utils";
import {
  artisanSignUpSchema,
  ArtisanSignUpType,
} from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Briefcase,
  Loader2,
  Lock,
  Mail,
  Phone,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

function SignUpArtisanForm() {
  const specialties = Object.values(ServiceType);
  const searchParams = useSearchParams();
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArtisanSignUpType>({
    resolver: zodResolver(artisanSignUpSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      serviceArea: "",
      serviceArea_housenumber: "",
      serviceArea_street: "",
      serviceArea_postcode: "",
      serviceArea_city: "",
      serviceArea_citycode: "",
      serviceArea_district: "",
      serviceArea_coordinates: "",
      serviceArea_context: "",
      siret: "",
      experience: "",
      specialties: "",
      description: "",
      role: ROLES.PROFESSIONAL,
    },
  });

  console.log(errors);
  const password = watch("password");

  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");

  const validatePasswordMatch = (
    confirmPassword: string,
    originalPassword: string | undefined
  ) => {
    if (confirmPassword && originalPassword) {
      if (confirmPassword !== originalPassword) {
        setPasswordError("Les mots de passe ne correspondent pas");
        return false;
      } else {
        setPasswordError("");
        return true;
      }
    }
    return false;
  };

  const handlePasswordConfirmationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setPasswordConfirmation(value);
    validatePasswordMatch(value, password || "");
  };

  // Validate passwords when the original password changes
  useEffect(() => {
    if (passwordConfirmation) {
      validatePasswordMatch(passwordConfirmation, password || "");
    }
  }, [password, passwordConfirmation]);

  const handleServiceAreaChange = (value: AddressData | null): void => {
    setValue("serviceArea_housenumber", value?.housenumber || "");
    setValue("serviceArea_street", value?.street || "");
    setValue("serviceArea_postcode", value?.postcode || "");
    setValue("serviceArea_city", value?.city || "");
    setValue("serviceArea_citycode", value?.citycode || "");
    setValue("serviceArea_district", value?.district || "");
    setValue("serviceArea_coordinates", value?.coordinates.join(",") || "");
    setValue("serviceArea_context", value?.context || "");
    setValue("serviceArea", value?.label || "");
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties((prev) => {
      const newSpecialties = prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty];
      setValue("specialties", JSON.stringify(newSpecialties));
      return newSpecialties;
    });
  };

  const onSubmit = async (data: ArtisanSignUpType) => {
    const isPasswordValid = validatePasswordMatch(
      passwordConfirmation,
      password
    );
    if (!isPasswordValid) {
      return;
    }

    try {
      // Ensure specialties is properly serialized
      const submitData = {
        ...data,
        specialties: JSON.stringify(selectedSpecialties),
        redirect: redirect || "",
        priceId: priceId || "",
        inviteId: inviteId || "",
      };
      await signUpArtisan(submitData);
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Rejoindre Fixéo</CardTitle>
            <CardDescription>
              Devenez micro-entrepreneur partenaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Controller
                      control={control}
                      name="firstName"
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            {...field}
                            id="firstName"
                            placeholder="Prénom"
                            className={cn("pl-10", error && "border-red-300")}
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
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Controller
                      control={control}
                      name="lastName"
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            {...field}
                            id="lastName"
                            placeholder="Nom"
                            className={cn("pl-10", error && "border-red-300")}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="phone"
                          type="tel"
                          placeholder="06 12 34 56 78"
                          className={cn("pl-10", error && "border-red-300")}
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

              <div className="space-y-2">
                <Controller
                  control={control}
                  name="serviceArea"
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <AddressAutocomplete
                        label="Zone d'intervention *"
                        placeholder="Ville, département..."
                        onChange={handleServiceAreaChange}
                        className="text-sm"
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

              <div className="space-y-2">
                <Label htmlFor="siret">SIRET *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Controller
                    control={control}
                    name="siret"
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="siret"
                          placeholder="Numéro SIRET (14 chiffres)"
                          className={cn("pl-10", error && "border-red-300")}
                          maxLength={14}
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

              <div className="space-y-2">
                <Label htmlFor="experience">Années d'expérience</Label>
                <Controller
                  control={control}
                  name="experience"
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={cn(error && "border-red-300")}
                        >
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
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

              <div className="space-y-3">
                <Label>Spécialités</Label>
                <div className="grid grid-cols-2 gap-2">
                  {specialties.map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={specialty}
                        checked={selectedSpecialties.includes(specialty)}
                        onCheckedChange={() => handleSpecialtyToggle(specialty)}
                      />
                      <Label htmlFor={specialty} className="text-sm">
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.specialties && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.specialties.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Présentation</Label>
                <Controller
                  control={control}
                  name="description"
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Décrivez votre expérience, vos compétences et votre approche du service client..."
                        rows={3}
                        className={cn(error && "border-red-300")}
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

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Controller
                    control={control}
                    name="email"
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          className={cn("pl-10", error && "border-red-300")}
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

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Controller
                    control={control}
                    name="password"
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className={cn("pl-10", error && "border-red-300")}
                          minLength={8}
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

                {password && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <PasswordRequirements password={password} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">
                  Confirmation du mot de passe *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="passwordConfirmation"
                    type="password"
                    placeholder="Confirmez votre mot de passe"
                    className={cn("pl-10", passwordError && "border-red-300")}
                    value={passwordConfirmation}
                    onChange={handlePasswordConfirmationChange}
                    minLength={8}
                  />
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {passwordError}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Avantages Fixéo :</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Accès à un réseau national de clients</li>
                      <li>• Gestion simplifiée des missions</li>
                      <li>• Paiements sécurisés et rapides</li>
                      <li>• Support client dédié</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-fixeo-accent-500 hover:bg-fixeo-accent-400 text-white cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Création du compte...
                  </>
                ) : (
                  "Rejoindre Fixéo"
                )}
              </Button>
            </form>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-gray-600">Déjà partenaire ?</p>
              <Link
                href="/sign-in/artisan"
                className="text-fixeo-accent-500 hover:text-fixeo-accent-400 font-medium"
              >
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignUpArtisanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement...</span>
          </div>
        </div>
      }
    >
      <SignUpArtisanForm />
    </Suspense>
  );
}
