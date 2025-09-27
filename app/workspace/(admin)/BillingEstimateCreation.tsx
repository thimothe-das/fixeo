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
import { Calculator, Calendar, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { BillingEstimateBreakdownItem } from "../components/types";

interface BillingEstimateFormProps {
  serviceRequestId: number;
  onSubmit: (estimateData: {
    serviceRequestId: number;
    estimatedPrice: number;
    description: string;
    breakdown?: BillingEstimateBreakdownItem[];
    validUntil?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BillingEstimateForm({
  serviceRequestId,
  onSubmit,
  onCancel,
  isLoading = false,
}: BillingEstimateFormProps) {
  const [description, setDescription] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [breakdown, setBreakdown] = useState<BillingEstimateBreakdownItem[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  const updateBreakdownItem = (
    index: number,
    field: keyof BillingEstimateBreakdownItem,
    value: string | number
  ) => {
    const newBreakdown = [...breakdown];
    newBreakdown[index] = {
      ...newBreakdown[index],
      [field]: value,
    };

    // Recalculate total for this item
    if (field === "quantity" || field === "unitPrice") {
      newBreakdown[index].total =
        newBreakdown[index].quantity * newBreakdown[index].unitPrice;
    }

    setBreakdown(newBreakdown);
  };

  const addBreakdownItem = () => {
    setBreakdown([
      ...breakdown,
      { description: "", quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const removeBreakdownItem = (index: number) => {
    if (breakdown.length > 1) {
      setBreakdown(breakdown.filter((_, i) => i !== index));
    }
  };

  const getTotalPrice = () => {
    return breakdown.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert("Veuillez entrer une description");
      return;
    }

    const totalPrice = getTotalPrice();
    if (totalPrice <= 0) {
      alert("Le montant total doit être supérieur à 0");
      return;
    }

    try {
      await onSubmit({
        serviceRequestId,
        estimatedPrice: totalPrice,
        description,
        breakdown: breakdown.filter((item) => item.description.trim()),
        validUntil: validUntil || undefined,
      });

      // Show success toast
      toast.success("Devis créé avec succès !", {
        description:
          "Le devis a été envoyé au client et est maintenant disponible pour les artisans.",
      });
    } catch (error) {
      // Handle any errors that might occur
      console.error("Error creating billing estimate:", error);
      toast.error("Erreur lors de la création du devis", {
        description: "Veuillez réessayer ou contacter le support.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Créer un devis
        </CardTitle>
        <CardDescription>
          Créez un devis détaillé pour la demande de service #{serviceRequestId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description du devis *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez les travaux à effectuer..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Breakdown Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Détail des coûts</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBreakdownItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une ligne
              </Button>
            </div>

            <div className="space-y-3">
              {breakdown.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg"
                >
                  <div className="md:col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Input
                      placeholder="Ex: Main d'œuvre, Matériel..."
                      value={item.description}
                      onChange={(e) =>
                        updateBreakdownItem(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Quantité</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateBreakdownItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Prix unitaire (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={(item.unitPrice / 100).toFixed(2)}
                      onChange={(e) =>
                        updateBreakdownItem(
                          index,
                          "unitPrice",
                          Math.round(parseFloat(e.target.value) * 100) || 0
                        )
                      }
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Total (€)</Label>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                        {(item.total / 100).toFixed(2)}
                      </div>
                    </div>
                    {breakdown.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBreakdownItem(index)}
                        className="h-10 w-10 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <div className="text-right p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Total du devis</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(getTotalPrice() / 100).toFixed(2)} €
                </div>
              </div>
            </div>
          </div>

          {/* Valid Until */}
          <div className="space-y-2">
            <Label htmlFor="validUntil" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Valable jusqu'au (optionnel)
            </Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="text-white">
              {isLoading ? "Création..." : "Créer le devis"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
