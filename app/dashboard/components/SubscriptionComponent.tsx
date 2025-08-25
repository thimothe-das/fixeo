"use client";

import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SubscriptionComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Abonnement</h1>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Abonnement Pro
              </CardTitle>
              <CardDescription>
                Accès complet à toutes les fonctionnalités
              </CardDescription>
            </div>
            <Badge className="bg-blue-600">Actif</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                250€<span className="text-sm font-normal">/mois</span>
              </p>
              <p className="text-sm text-gray-600">
                Prochaine facturation: 15 février 2024
              </p>
            </div>
            <Button variant="outline">Gérer l'abonnement</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
