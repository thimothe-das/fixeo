"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface AccountComponentProps {
  isActive: boolean;
  setIsActive: (value: boolean) => void;
}

export function AccountComponent({
  isActive,
  setIsActive,
}: AccountComponentProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mon compte</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" defaultValue="Pierre" />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" defaultValue="Dupont" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="pierre.dupont@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" defaultValue="06 12 34 56 78" />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                defaultValue="123 rue de la République, 75011 Paris"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations professionnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company">Entreprise</Label>
              <Input id="company" defaultValue="Dupont Plomberie SARL" />
            </div>
            <div>
              <Label htmlFor="siret">SIRET</Label>
              <Input id="siret" defaultValue="12345678901234" />
            </div>
            <div>
              <Label htmlFor="specialties">Spécialités</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner vos spécialités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plumbing">Plomberie</SelectItem>
                  <SelectItem value="electrical">Électricité</SelectItem>
                  <SelectItem value="heating">Chauffage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Statut</Label>
                <p className="text-sm text-gray-600">
                  Activer/désactiver votre profil
                </p>
              </div>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
