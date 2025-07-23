"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Wrench, Users, DoorOpen } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { signIn, signUp } from "./actions";
import { ActionState } from "@/lib/auth/middleware";
import {
  getFormValue,
  FormState,
  SignUpFormFields,
} from "@/lib/auth/form-utils";

type UserRole = "client" | "artisan" | null;

export function LoginComponent({
  mode = "signin",
  role = null,
}: {
  mode?: "signin" | "signup";
  role?: UserRole;
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(role);
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState<
    FormState<SignUpFormFields>,
    FormData
  >(mode === "signin" ? signIn : signUp, { error: "" });
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");

  return (
    <div className="min-h-[100dvh] flex flex-col justify-start py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <DoorOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Connexion</h2>
          <p className="mt-2 text-sm text-gray-600">
            {selectedRole === "client"
              ? "Accédez à votre espace client"
              : "Rejoignez notre réseau d'artisans"}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ""} />
            <input type="hidden" name="priceId" value={priceId || ""} />
            <input type="hidden" name="inviteId" value={inviteId || ""} />
            <input type="hidden" name="role" value={selectedRole || ""} />

            {/* Show name fields for sign-up */}
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Prénom{selectedRole === "artisan" ? " *" : ""}
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        defaultValue={getFormValue(state, "firstName")}
                        required={selectedRole === "artisan"}
                        maxLength={100}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Prénom"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom{selectedRole === "artisan" ? " *" : ""}
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        defaultValue={state?.lastName || ""}
                        required={selectedRole === "artisan"}
                        maxLength={100}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Nom"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Téléphone{selectedRole === "artisan" ? " *" : ""}
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      defaultValue={state?.phone || ""}
                      required={selectedRole === "artisan"}
                      maxLength={20}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                {selectedRole === "client" && (
                  <div>
                    <Label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Adresse
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        defaultValue={state?.address || ""}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Votre adresse"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={getFormValue(state, "email")}
                  required
                  maxLength={50}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Entrez votre email"
                />
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
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  defaultValue={state?.password || ""}
                  required
                  minLength={8}
                  maxLength={100}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
            </div>

            {state?.error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                {state.error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  selectedRole === "client"
                    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                    : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Chargement...
                  </>
                ) : mode === "signin" ? (
                  "Se connecter"
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </div>

            <div className="text-center">
              <Link href="#" className="text-sm text-green-600 hover:underline">
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
                  {mode === "signin"
                    ? "Nouveau sur Fixéo ?"
                    : "Déjà un compte ?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`${
                  mode === "signin" ? `/sign-up/` : `/sign-in/${selectedRole}`
                }${redirect ? `?redirect=${redirect}` : ""}${
                  priceId ? `&priceId=${priceId}` : ""
                }`}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {mode === "signin" ? "Créer un compte" : "Se connecter"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
