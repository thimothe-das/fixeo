"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signUp } from "../../actions";
import { ActionState } from "@/lib/auth/middleware";

const specialties = [
  "Plomberie",
  "Électricité",
  "Peinture",
  "Menuiserie",
  "Carrelage",
  "Jardinage",
  "Nettoyage",
  "Déménagement",
];

export default function SignUpArtisanPage() {
  const searchParams = useSearchParams();
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>("");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUp,
    { error: "" }
  );
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </Link>
            <div className="flex items-center space-x-2 ml-6">
              <span className="text-2xl font-bold text-gray-900">Fixéo</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Rejoindre Fixéo</CardTitle>
            <CardDescription>
              Devenez micro-entrepreneur partenaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="redirect" value={redirect || ""} />
              <input type="hidden" name="priceId" value={priceId || ""} />
              <input type="hidden" name="inviteId" value={inviteId || ""} />
              <input type="hidden" name="role" value="artisan" />
              <input
                type="hidden"
                name="specialties"
                value={JSON.stringify(selectedSpecialties)}
              />
              <input
                type="hidden"
                name="experience"
                value={selectedExperience}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Prénom"
                      className="pl-10"
                      defaultValue={state.firstName}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Nom"
                      className="pl-10"
                      defaultValue={state.lastName}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="06 12 34 56 78"
                    className="pl-10"
                    defaultValue={state.phone}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceArea">Zone d'intervention *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="serviceArea"
                    name="serviceArea"
                    placeholder="Ville, département"
                    className="pl-10"
                    defaultValue={state.serviceArea}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">SIRET *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="siret"
                    name="siret"
                    placeholder="Numéro SIRET (14 chiffres)"
                    className="pl-10"
                    defaultValue={state.siret}
                    maxLength={14}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Années d'expérience</Label>
                <Select
                  value={selectedExperience}
                  onValueChange={setSelectedExperience}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">Moins d'1 an</SelectItem>
                    <SelectItem value="1-3">1 à 3 ans</SelectItem>
                    <SelectItem value="3-5">3 à 5 ans</SelectItem>
                    <SelectItem value="5-10">5 à 10 ans</SelectItem>
                    <SelectItem value="10+">Plus de 10 ans</SelectItem>
                  </SelectContent>
                </Select>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Présentation</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez votre expérience, vos compétences et votre approche du service client..."
                  rows={3}
                  defaultValue={state.description}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10"
                    defaultValue={state.email}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    defaultValue={state.password}
                    minLength={8}
                    required
                  />
                </div>
              </div>

              {state?.error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  {state.error}
                </div>
              )}

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
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={pending}
              >
                {pending ? (
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
                className="text-green-600 hover:text-green-700 font-medium"
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
