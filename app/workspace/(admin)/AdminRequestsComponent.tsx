"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  MapPin,
  User,
  Wrench,
  Calculator,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BillingEstimateForm } from "./BillingEstimateForm";
import type {
  ServiceRequestForAdmin,
  BillingEstimateBreakdownItem,
} from "../components/types";

interface AdminRequestsComponentProps {
  requests: ServiceRequestForAdmin[];
  onRequestsUpdate: () => void;
}

export function AdminRequestsComponent({
  requests,
  onRequestsUpdate,
}: AdminRequestsComponentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [showEstimateForm, setShowEstimateForm] = useState<number | null>(null);
  const [isCreatingEstimate, setIsCreatingEstimate] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "awaiting_estimate":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "awaiting_estimate":
        return "En attente de devis";
      case "pending":
        return "En attente";
      case "accepted":
        return "Acceptée";
      case "in_progress":
        return "En cours";
      case "completed":
        return "Terminée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "Urgent";
      case "high":
        return "Élevée";
      case "medium":
        return "Moyenne";
      case "low":
        return "Faible";
      default:
        return urgency;
    }
  };

  const handleCreateEstimate = async (estimateData: {
    serviceRequestId: number;
    estimatedPrice: number;
    description: string;
    breakdown?: BillingEstimateBreakdownItem[];
    validUntil?: string;
  }) => {
    setIsCreatingEstimate(true);
    try {
      const response = await fetch("/api/admin/billing-estimates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(estimateData),
      });

      if (response.ok) {
        setShowEstimateForm(null);
        onRequestsUpdate();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating estimate:", error);
      alert("Erreur lors de la création du devis");
    } finally {
      setIsCreatingEstimate(false);
    }
  };

  // Filter requests based on search term and filters
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.clientName &&
        request.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.clientEmail &&
        request.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesUrgency =
      urgencyFilter === "all" || request.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par type de service, description, lieu, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="awaiting_estimate">
                En attente de devis
              </SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="accepted">Acceptée</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="completed">Terminée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>

          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes urgences</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">Élevée</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {filteredRequests.length} demande
        {filteredRequests.length !== 1 ? "s" : ""} trouvée
        {filteredRequests.length !== 1 ? "s" : ""}
        {searchTerm && ` pour "${searchTerm}"`}
      </div>

      {/* Requests list */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Aucune demande trouvée
                </h3>
                <p className="text-gray-500">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  urgencyFilter !== "all"
                    ? "Essayez de modifier vos critères de recherche"
                    : "Aucune demande de service pour le moment"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {request.serviceType}
                      </CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {getUrgencyLabel(request.urgency)}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {request.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </DropdownMenuItem>
                      {request.status === "awaiting_estimate" && (
                        <DropdownMenuItem
                          onClick={() => setShowEstimateForm(request.id)}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Créer un devis
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{request.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>
                        {request.clientName || "Client anonyme"}
                        {request.clientEmail && ` (${request.clientEmail})`}
                      </span>
                    </div>
                    {request.clientPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📞</span>
                        <span>{request.clientPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Créée le{" "}
                        {new Date(request.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                        à{" "}
                        {new Date(request.createdAt).toLocaleTimeString(
                          "fr-FR",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    </div>
                    {request.assignedArtisan && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Wrench className="h-4 w-4" />
                        <span>
                          Assignée à {request.assignedArtisan.name}(
                          {request.assignedArtisan.email})
                        </span>
                      </div>
                    )}
                    {request.estimatedPrice && (
                      <div className="text-lg font-semibold text-green-600">
                        {(request.estimatedPrice / 100).toFixed(2)} €
                      </div>
                    )}
                  </div>
                </div>

                {request.photos && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Photos jointes :
                    </p>
                    <div className="flex gap-2">
                      {JSON.parse(request.photos)
                        .slice(0, 3)
                        .map((photo: string, index: number) => (
                          <div
                            key={index}
                            className="w-16 h-16 bg-gray-200 rounded border"
                          ></div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Billing Estimate Form Modal */}
      {showEstimateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[90vh] overflow-y-auto">
            <BillingEstimateForm
              serviceRequestId={showEstimateForm}
              onSubmit={handleCreateEstimate}
              onCancel={() => setShowEstimateForm(null)}
              isLoading={isCreatingEstimate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
