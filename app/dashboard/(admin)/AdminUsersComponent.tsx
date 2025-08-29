"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Wrench, Shield } from "lucide-react";

export function AdminUsersComponent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des utilisateurs
          </CardTitle>
          <CardDescription>
            Gérer les comptes utilisateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <UserCheck className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2">Clients</h3>
              <p className="text-gray-600 mb-4">Gérer les comptes clients</p>
              <Button variant="outline" className="w-full">
                Voir les clients
              </Button>
            </div>

            <div className="text-center p-6 border rounded-lg">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Artisans</h3>
              <p className="text-gray-600 mb-4">
                Gérer les comptes professionnels
              </p>
              <Button variant="outline" className="w-full">
                Voir les artisans
              </Button>
            </div>

            <div className="text-center p-6 border rounded-lg">
              <Shield className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold mb-2">Administrateurs</h3>
              <p className="text-gray-600 mb-4">Gérer les comptes admin</p>
              <Button variant="outline" className="w-full">
                Voir les admins
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Créer un utilisateur</Button>
              <Button variant="outline">Exporter la liste</Button>
              <Button variant="outline">Importer des utilisateurs</Button>
              <Button variant="destructive">Purger les comptes inactifs</Button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">
              🚧 Fonctionnalité en développement
            </h4>
            <p className="text-yellow-700 text-sm">
              La gestion détaillée des utilisateurs sera disponible dans une
              prochaine mise à jour.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
