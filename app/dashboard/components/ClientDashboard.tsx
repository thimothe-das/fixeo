"use client";

import { useState, useActionState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createServiceRequest } from "../actions";
import { ActionState } from "@/lib/auth/middleware";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ServiceRequest = {
  id: number;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  status: string;
  estimatedPrice?: number;
  createdAt: string;
  assignedArtisan?: {
    id: number;
    name: string;
    email: string;
  };
};

function RequestCard({ request }: { request: ServiceRequest }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {request.serviceType}
            </CardTitle>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(request.createdAt)}
            </p>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {getStatusIcon(request.status)}
            <span className="ml-1 capitalize">{request.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Description:
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {request.description}
            </p>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1 text-blue-600" />
            {request.location}
          </div>

          {request.assignedArtisan && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                Artisan assigné:
              </p>
              <p className="text-sm text-green-700">
                {request.assignedArtisan.name}
              </p>
            </div>
          )}

          {request.estimatedPrice && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">Prix estimé:</span>
              <span className="font-semibold text-green-600">
                {(request.estimatedPrice / 100).toFixed(2)} €
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceRequestsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-48">
          <CardHeader>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ServiceRequestsList() {
  const { data: requests, error } = useSWR<ServiceRequest[]>(
    "/api/service-requests/client",
    fetcher
  );

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-600">
            Erreur lors du chargement des demandes
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!requests) {
    return <ServiceRequestsListSkeleton />;
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune demande pour le moment
            </h3>
            <p className="text-gray-600">
              Créez votre première demande de service pour commencer
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}

function NewRequestForm() {
  const [showForm, setShowForm] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createServiceRequest,
    { error: "" }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Nouvelle demande
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Créer
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      {showForm && (
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de service *
                </label>
                <Select
                  name="serviceType"
                  value={serviceType}
                  onValueChange={setServiceType}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plomberie">🔧 Plomberie</SelectItem>
                    <SelectItem value="electricite">⚡ Électricité</SelectItem>
                    <SelectItem value="menuiserie">🔨 Menuiserie</SelectItem>
                    <SelectItem value="peinture">🎨 Peinture</SelectItem>
                    <SelectItem value="renovation">🏠 Rénovation</SelectItem>
                    <SelectItem value="depannage">⚙️ Dépannage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgence *
                </label>
                <Select
                  name="urgency"
                  value={urgency}
                  onValueChange={setUrgency}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Quand ?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">🚨 Urgent (24h)</SelectItem>
                    <SelectItem value="week">📅 Cette semaine</SelectItem>
                    <SelectItem value="flexible">⏰ Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                name="description"
                placeholder="Décrivez le problème ou les travaux à effectuer..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de contact *
              </label>
              <Input
                name="clientEmail"
                type="email"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse d'intervention *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  name="location"
                  placeholder="Adresse complète"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {state?.error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md">
                Demande créée avec succès !
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={pending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}

export function ClientDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tableau de bord client
        </h1>
        <p className="text-gray-600">
          Gérez vos demandes de service et suivez leur avancement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Mes demandes
            </h2>
            <Suspense fallback={<ServiceRequestsListSkeleton />}>
              <ServiceRequestsList />
            </Suspense>
          </div>
        </div>

        <div className="lg:col-span-1">
          <NewRequestForm />
        </div>
      </div>
    </div>
  );
}
