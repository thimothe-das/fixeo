"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SignInType, signInSchema } from "@/lib/validation/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { DoorOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { signIn } from "../actions";

type UserRole = "client" | "artisan" | null;

export function SignIn({ role = null }: { role?: UserRole }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const [serverError, setServerError] = useState<string>("");

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignInType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInType) => {
    setServerError(""); // Clear any previous errors
    try {
      const result = await signIn(data);
      if (result?.error) {
        setServerError(result.error);
      }
    } catch (error) {
      setServerError(
        "Une erreur inattendue s'est produite. Veuillez réessayer."
      );
    }
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
          <h2 className="text-3xl font-extrabold text-gray-900">Connexion</h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous à votre compte et accédez à votre espace personnalisé
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="flex justify-center">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 text-center">
                    Erreur de connexion
                  </h3>
                  <div className="mt-2 text-sm text-red-700">{serverError}</div>
                </div>
              </div>
            )}

            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email
              </Label>
              <div className="mt-1">
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={cn(
                        `appearance-none rounded-md relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-fixeo-main-500 focus:border-fixeo-main-500 focus:z-10 sm:text-sm`,
                        errors.email && "border-red-300 bg-red-50"
                      )}
                      placeholder="Entrez votre email"
                    />
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </Label>
              <div className="mt-1">
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      className={`appearance-none rounded-md relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-fixeo-main-500 focus:border-fixeo-main-500 focus:z-10 sm:text-sm ${
                        errors.password
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Entrez votre mot de passe"
                    />
                  )}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
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
                  "Se connecter"
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
                href={`${`/sign-up/${role}`}${
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
