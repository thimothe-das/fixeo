"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Clock, Shield, Star, Users, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserRole = "client" | "professional" | null;

export function SignUpRoleSelection({
  mode = "signin",
  role = null,
}: {
  mode?: "signin" | "signup";
  role?: UserRole;
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(role);
  const router = useRouter();
  // If no role is selected, show the role selection interface
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Votre réseau de micro-entrepreneurs
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Bricolage, maintenance et aménagement à portée de main
            </p>
          </div>

          {/* User Type Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Client Card */}
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200"
              onClick={() => router.push("/sign-up/client")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-fixeo-main-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-fixeo-main-600" />
                </div>
                <CardTitle className="text-2xl">Je suis client</CardTitle>
                <CardDescription className="text-base">
                  J'ai besoin d'un service de bricolage ou maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-fixeo-main-600" />
                    <span className="text-sm text-gray-600">
                      Intervention rapide
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-fixeo-main-600" />
                    <span className="text-sm text-gray-600">
                      Professionnels vérifiés
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-fixeo-main-600" />
                    <span className="text-sm text-gray-600">
                      Service de qualité
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-fixeo-main-600 hover:bg-fixeo-main-700 text-white">
                    Continuer en tant que client
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Service Provider Card */}
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-fixeo-accent-200"
              onClick={() => router.push("/sign-up/artisan")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-fixeo-accent-100 rounded-full flex items-center justify-center mb-4">
                  <Wrench className="h-8 w-8 text-fixeo-accent-600" />
                </div>
                <CardTitle className="text-2xl">Je suis artisan</CardTitle>
                <CardDescription className="text-base">
                  Je propose mes services de bricolage et maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-fixeo-accent-600" />
                    <span className="text-sm text-gray-600">
                      Réseau national
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-fixeo-accent-600" />
                    <span className="text-sm text-gray-600">
                      Gestion simplifiée
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-fixeo-accent-600" />
                    <span className="text-sm text-gray-600">
                      Paiements sécurisés
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-fixeo-accent-500 hover:bg-fixeo-accent-400 text-white cursor-pointer">
                    Rejoindre le réseau
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
