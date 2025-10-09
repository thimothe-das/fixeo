"use client";

import { signUpClient } from "@/app/(login)/actions";
import { PasswordRequirements } from "@/app/(login)/sign-up/password-requirements";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignUpFormFields } from "@/lib/auth/form-utils";
import { ROLES } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import {
  ClientSignUpType,
  SignInType,
  clientSignUpSchema,
} from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, DoorOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type UserRole = "client" | "artisan" | null;

export function SignUp({ role = null }: { role?: UserRole }) {
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientSignUpType>({
    resolver: zodResolver(clientSignUpSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      role: ROLES.CLIENT,
    },
  });
  console.log(errors);
  const password = watch("password");

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

  const onSubmit = async (data: SignUpFormFields | SignInType) => {
    const isPasswordValid = validatePasswordMatch(
      passwordConfirmation,
      password
    );
    if (!isPasswordValid) {
      return;
    }

    try {
      await signUpClient(data as ClientSignUpType);
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  const handleAddressChange = (value: AddressData | null): void => {
    setValue("address_housenumber", value?.housenumber || "");
    setValue("address_street", value?.street || "");
    setValue("address_postcode", value?.postcode || "");
    setValue("address_city", value?.city || "");
    setValue("address_citycode", value?.citycode || "");
    setValue("address_district", value?.district || "");
    setValue("address_coordinates", value?.coordinates.join(",") || "");
    setValue("address_context", value?.context || "");
    setValue("address", value?.label || "");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-start py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-fixeo-main-100 rounded-full flex items-center justify-center">
              <DoorOpen className="h-8 w-8 text-fixeo-main-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Inscription</h2>
          <p className="mt-2 text-sm text-gray-600">
            Inscrivez-vous pour accéder à votre espace personnalisé
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Prénom *
                  </Label>
                  <div className="mt-1">
                    <Controller
                      control={control}
                      name="firstName"
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            {...field}
                            id="firstName"
                            type="text"
                            autoComplete="given-name"
                            maxLength={100}
                            className={cn(
                              "rounded-md relative block w-full px-3 py-2 sm:text-sm",
                              error && "border-red-300"
                            )}
                            placeholder="Prénom"
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

                <div>
                  <Label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nom *
                  </Label>
                  <div className="mt-1">
                    <Controller
                      control={control}
                      name="lastName"
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <Input
                            {...field}
                            id="lastName"
                            type="text"
                            autoComplete="family-name"
                            maxLength={100}
                            className={cn(
                              "rounded-md relative block w-full px-3 py-2 sm:text-sm",
                              error && "border-red-300"
                            )}
                            placeholder="Nom"
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

              <div>
                <Label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Téléphone *
                </Label>
                <div className="mt-1">
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Input
                          {...field}
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          maxLength={20}
                          className={cn(
                            "rounded-md relative block w-full px-3 py-2 sm:text-sm",
                            error && "border-red-300"
                          )}
                          placeholder="06 12 34 56 78"
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
              <div>
                <Controller
                  control={control}
                  name="address"
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <AddressAutocomplete
                        onChange={handleAddressChange}
                        label="📍 Adresse *"
                        placeholder="Tapez votre adresse complète..."
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
            </>

            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email *
              </Label>
              <div className="mt-1">
                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        autoComplete="email"
                        maxLength={50}
                        className={cn(
                          "rounded-md relative block w-full px-3 py-2 sm:text-sm",
                          error && "border-red-300"
                        )}
                        placeholder="Entrez votre email"
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
            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe *
              </Label>
              <div className="mt-1">
                <Controller
                  control={control}
                  name="password"
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        maxLength={100}
                        className={cn(
                          "rounded-md relative block w-full px-3 py-2 sm:text-sm",
                          error && "border-red-300"
                        )}
                        placeholder="Entrez votre mot de passe"
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

            <div>
              <Label
                htmlFor="passwordConfirmation"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmation du mot de passe
              </Label>
              <div className="mt-1">
                <Input
                  id="passwordConfirmation"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={100}
                  value={passwordConfirmation}
                  className={cn(
                    "rounded-md relative block w-full px-3 py-2 sm:text-sm",
                    passwordError && "border-red-300"
                  )}
                  placeholder="Confirmez votre mot de passe"
                  onChange={handlePasswordConfirmationChange}
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {passwordError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fixeo-main-500 hover:bg-fixeo-main-600
                   focus:outline-none focus:ring-2 focus:ring-offset-2`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Chargement...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </div>
            <div className="text-center">
              <Link
                href="#"
                className="text-sm text-fixeo-main-500 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Déjà un compte ?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`${`/sign-in/${role}`}${
                  redirect ? `?redirect=${redirect}` : ""
                }${priceId ? `&priceId=${priceId}` : ""}`}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
