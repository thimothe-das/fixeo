"use client";

import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserRole } from "@/lib/types/roles";
import {
  cn,
  EXPERIENCE_OPTIONS,
  getCategoryConfig,
  ServiceType,
} from "@/lib/utils";
import {
  artisanSchema,
  clientSchema,
  userSchema,
} from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Building,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface UserEditModalProps {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  user: any;
  mutate: () => void;
}

const specialties = Object.values(ServiceType);

export function UserEditModal({
  userId,
  setUserId,
  user,
  mutate,
}: UserEditModalProps) {
  const [saving, setSaving] = useState(false);
  const getSchema = (role: UserRole) => {
    return role === UserRole.PROFESSIONAL
      ? artisanSchema
      : role === UserRole.CLIENT
      ? clientSchema
      : userSchema;
  };
  const {
    control,
    setValue,
    trigger,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<any>({
    mode: "onChange", // Revalidate on change
    defaultValues: {
      name: user?.name,
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      role: user?.role,
      phone: user?.phone || "",
      serviceArea: user?.address || "",
      address: user?.address || "",
      addressHousenumber: user?.addressHousenumber || "",
      addressStreet: user?.addressStreet || "",
      addressPostcode: user?.addressPostcode || "",
      addressCity: user?.addressCity || "",
      addressCitycode: user?.addressCitycode || "",
      addressDistrict: user?.addressDistrict || "",
      addressCoordinates: user?.addressCoordinates || "",
      addressContext: user?.addressContext || "",
      serviceAreaHousenumber: user?.addressHousenumber || "",
      serviceAreaStreet: user?.addressStreet || "",
      serviceAreaPostcode: user?.addressPostcode || "",
      serviceAreaCity: user?.addressCity || "",
      serviceAreaCitycode: user?.addressCitycode || "",
      serviceAreaDistrict: user?.addressDistrict || "",
      serviceAreaCoordinates: user?.addressCoordinates || "",
      serviceAreaContext: user?.addressContext || "",
      specialties: user?.specialties || "",
      experience: user?.experience || "",
      description: user?.description || "",
      siret: user?.siret || "",
    },
    resolver: zodResolver(getSchema(user?.role)),
  });

  const selectedRole = useWatch({ control, name: "role" });
  const selectedSpecialtiesJson = useWatch({ control, name: "specialties" });
  const selectedSpecialties = selectedSpecialtiesJson
    ? JSON.parse(selectedSpecialtiesJson)
    : [];

  const onSubmit = async (data: any) => {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update user. Please try again."
        );
      }
      console.log("response", response);
      setUserId(null);
      mutate();
      toast.success("Utilisateur mis à jour avec succès");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
      console.error("Error updating user:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddressChange = (value: AddressData | null): void => {
    setValue("addressHousenumber", value?.housenumber || "");
    setValue("addressStreet", value?.street || "");
    setValue("addressPostcode", value?.postcode || "");
    setValue("addressCity", value?.city || "");
    setValue("addressCitycode", value?.citycode || "");
    setValue("addressDistrict", value?.district || "");
    setValue("addressCoordinates", value?.coordinates.join(",") || "");
    setValue("addressContext", value?.context || "");
    setValue("address", value?.label || "");
    trigger("address");
  };

  const handleServiceAreaChange = (value: AddressData | null): void => {
    setValue("serviceAreaHousenumber", value?.housenumber || "");
    setValue("serviceAreaStreet", value?.street || "");
    setValue("serviceAreaPostcode", value?.postcode || "");
    setValue("serviceAreaCity", value?.city || "");
    setValue("serviceAreaCitycode", value?.citycode || "");
    setValue("serviceAreaDistrict", value?.district || "");
    setValue("serviceAreaCoordinates", value?.coordinates.join(",") || "");
    setValue("serviceAreaContext", value?.context || "");
    setValue("serviceArea", value?.label || "");
    trigger("serviceArea");
  };

  const handleClickSpecialty = (specialty: string) => {
    if (selectedSpecialties?.includes(specialty)) {
      setValue(
        "specialties",
        JSON.stringify(
          selectedSpecialties?.filter((s: string) => s !== specialty)
        )
      );
    } else {
      setValue(
        "specialties",
        JSON.stringify([...selectedSpecialties, specialty])
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={user?.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {user?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">
              Modifier l'utilisateur "{user?.name}"
            </h2>
            <p className="text-sm text-gray-500">
              ID #{(user as any)?.id} • Créé le{" "}
              {moment((user as any)?.createdAt).format("DD/MM/YYYY")}
            </p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <form
        id="user-edit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Basic Information - Firstname and Lastname first */}
        <div className="space-y-4">
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  value: "client",
                  label: "Client",
                  icon: User,
                  color: "green",
                },
                {
                  value: "professional",
                  label: "Professionnel",
                  icon: Briefcase,
                  color: "blue",
                },
                {
                  value: "admin",
                  label: "Administrateur",
                  icon: Shield,
                  color: "red",
                },
              ].map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                return (
                  <div
                    key={role.value}
                    className={`
                        relative p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${
                          isSelected
                            ? `border-${role.color}-500 bg-${role.color}-50`
                            : "border-gray-200 hover:border-gray-300"
                        }
                      `}
                    onClick={() => setValue("role", role.value as UserRole)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`h-5 w-5 ${
                          isSelected
                            ? `text-${role.color}-600`
                            : "text-gray-400"
                        }`}
                      />
                      <div>
                        <p
                          className={`font-medium ${
                            isSelected
                              ? `text-${role.color}-900`
                              : "text-gray-900"
                          }`}
                        >
                          {role.label}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle
                        className={`absolute top-2 right-2 h-4 w-4 text-${role.color}-600`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="firstName"
                    placeholder="Prénom"
                    className={
                      errors.firstName
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }
                  />
                )}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.firstName.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="lastName"
                    placeholder="Nom"
                    className={
                      errors.lastName
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }
                  />
                )}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.lastName.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Email and Phone on same line - Email wider */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Email"
                      className={`pl-10 ${
                        errors.email
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="phone"
                      placeholder="Téléphone"
                      className={`pl-10 ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                  )}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.phone.message as string}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Client-specific fields */}
        {selectedRole === "client" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informations client</h3>

            <div className="space-y-2">
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <AddressAutocomplete
                    {...field}
                    label="Adresse"
                    placeholder="Adresse complète"
                    value={field?.value}
                    onChange={handleAddressChange}
                    className={errors.address ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.address.message as string}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Professional-specific fields */}
        {selectedRole === "professional" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Informations professionnelles
            </h3>
            <div className="space-y-3">
              <Label>Spécialités *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {specialties.map((specialty) => {
                  const isSelected = selectedSpecialties?.includes(specialty);
                  const config = getCategoryConfig(specialty, "h-5 w-5");
                  return (
                    <div
                      key={specialty}
                      className={`
                          relative p-3 border-2 rounded-lg cursor-pointer transition-all
                          ${
                            isSelected
                              ? `${config.colors.accent} ${config.colors.bg}`
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      onClick={() => handleClickSpecialty(specialty)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {config.icon}
                          <span
                            className={`font-medium text-sm ${
                              isSelected ? config.colors.text : "text-gray-900"
                            }`}
                          >
                            {config.type}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle
                            className={`h-4 w-4 ${config.colors.text}`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.specialties && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.specialties.message as string}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="experience">Années d'expérience</Label>
                <Controller
                  control={control}
                  name="experience"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field?.value}
                    >
                      <SelectTrigger className="w-full">
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
                  )}
                />
                {errors.experience && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.experience.message as string}
                  </p>
                )}
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Controller
                    control={control}
                    name="siret"
                    render={({ field }) => (
                      <div>
                        <Input
                          {...field}
                          id="siret"
                          placeholder="Numéro SIRET"
                          className={cn(
                            "pl-10",
                            errors.siret && "border-red-300"
                          )}
                        />
                        {errors.siret && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.siret.message as string}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Controller
                control={control}
                name="serviceArea"
                render={({ field }) => (
                  <AddressAutocomplete
                    value={field?.value}
                    label="Zone d'intervention"
                    placeholder="Ville, département..."
                    name="serviceArea"
                    onChange={handleServiceAreaChange}
                    className={cn(errors.serviceArea && "border-red-300")}
                  />
                )}
              />
              {errors.serviceArea && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.serviceArea.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description/Présentation</Label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Décrivez votre expérience, vos compétences..."
                    rows={3}
                    className={cn(errors.description && "border-red-300")}
                  />
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.description.message as string}
                </p>
              )}
            </div>
          </div>
        )}
      </form>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => setUserId(null)}
          disabled={saving}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          form="user-edit-form"
          disabled={saving}
          className="text-white"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
