"use client";

import { FileText, Eye, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const mockQuotes = [
  {
    id: 1,
    client: "Marc Petit",
    service: "Rénovation salle de bain",
    amount: 2500,
    status: "pending",
    date: "2024-01-10",
    validUntil: "2024-01-25",
  },
  {
    id: 2,
    client: "Claire Rousseau",
    service: "Installation cuisine",
    amount: 1800,
    status: "accepted",
    date: "2024-01-08",
    paidAmount: 900,
  },
];

export function EstimatedBills() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Devis</h1>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Nouveau devis
        </Button>
      </div>

      <div className="grid gap-4">
        {mockQuotes.map((quote) => (
          <Card key={quote.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{quote.service}</h3>
                  <p className="text-gray-600">{quote.client}</p>
                  <p className="text-sm text-gray-500">
                    Envoyé le {quote.date}
                  </p>
                  {quote.validUntil && (
                    <p className="text-sm text-gray-500">
                      Valide jusqu'au {quote.validUntil}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <Badge
                    variant={
                      quote.status === "accepted"
                        ? "default"
                        : quote.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {quote.status === "accepted"
                      ? "Accepté"
                      : quote.status === "pending"
                      ? "En attente"
                      : "Refusé"}
                  </Badge>
                  <p className="font-bold text-xl">{quote.amount}€</p>
                  {quote.status === "accepted" && quote.paidAmount && (
                    <p className="text-sm text-green-600">
                      Acompte reçu: {quote.paidAmount}€
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    {quote.status === "pending" && (
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
