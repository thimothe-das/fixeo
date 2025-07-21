"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wrench,
  Users,
  ArrowRight,
  Shield,
  Clock,
  Star,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { signIn, signUp } from "./actions";
import { ActionState } from "@/lib/auth/middleware";

type UserRole = "client" | "artisan" | null;

export function Login({
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
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Je suis client</CardTitle>
                <CardDescription className="text-base">
                  J'ai besoin d'un service de bricolage ou maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Intervention rapide
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Professionnels vérifiés
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Service de qualité
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Continuer en tant que client
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Service Provider Card */}
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200"
              onClick={() => router.push("/sign-up/artisan")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Wrench className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Je suis artisan</CardTitle>
                <CardDescription className="text-base">
                  Je propose mes services de bricolage et maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Réseau national
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Gestion simplifiée
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Paiements sécurisés
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
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
