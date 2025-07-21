import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Mail,
  CheckCircle,
  AlertCircle,
  User,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db/drizzle";
import { serviceRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TokenStorage } from "./token-storage";

export default async function TrackingPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  // Fetch the service request by guest token
  const [request] = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.guestToken, token))
    .limit(1);

  if (!request) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
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

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "🚨 Urgent (24h)";
      case "week":
        return "📅 Cette semaine";
      case "flexible":
        return "⏰ Flexible";
      default:
        return urgency;
    }
  };

  const getServiceTypeText = (serviceType: string) => {
    switch (serviceType) {
      case "plomberie":
        return "🔧 Plomberie";
      case "electricite":
        return "⚡ Électricité";
      case "menuiserie":
        return "🔨 Menuiserie";
      case "peinture":
        return "🎨 Peinture";
      case "renovation":
        return "🏠 Rénovation";
      case "depannage":
        return "⚙️ Dépannage";
      default:
        return serviceType;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Client component to handle localStorage */}
      <TokenStorage token={token} />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour à l'accueil</span>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">Fixéo</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Suivi de votre demande
          </h1>
          <p className="text-gray-600">
            Demande #{request.id} • Créée le{" "}
            {new Date(request.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Statut de la demande</span>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {request.status === "pending" ? (
                      <Clock className="h-6 w-6 text-blue-600" />
                    ) : request.status === "completed" ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {request.status === "pending"
                        ? "Recherche d'un artisan en cours..."
                        : request.status === "accepted"
                        ? "Demande acceptée par un artisan"
                        : request.status === "completed"
                        ? "Travaux terminés"
                        : "Mise à jour du statut"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {request.status === "pending"
                        ? "Nous recherchons un artisan qualifié dans votre secteur. Vous serez notifié dès qu'un professionnel acceptera votre demande."
                        : request.status === "accepted"
                        ? "Un artisan a accepté votre demande. Il vous contactera prochainement pour convenir d'un rendez-vous."
                        : request.status === "completed"
                        ? "Les travaux ont été terminés avec succès. Merci d'avoir fait confiance à Fixéo !"
                        : "Votre demande est en cours de traitement."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle>Détails de la demande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Type de travaux
                  </label>
                  <p className="text-gray-900">
                    {getServiceTypeText(request.serviceType)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Urgence
                  </label>
                  <p className="text-gray-900">
                    {getUrgencyText(request.urgency)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <p className="text-gray-900">{request.description}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Adresse d'intervention
                  </label>
                  <p className="text-gray-900">{request.location}</p>
                </div>

                {request.photos && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Photos
                    </label>
                    <p className="text-gray-600 text-sm">
                      Photos disponibles pour l'artisan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vos informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {request.clientName && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {request.clientName}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {request.clientEmail}
                  </span>
                </div>
                {request.clientPhone && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">
                      {request.clientPhone}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Demande créée
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(request.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  {request.status !== "pending" && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Mise à jour
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(request.updatedAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Besoin d'aide ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Une question sur votre demande ? Contactez notre support.
                </p>
                <Button variant="outline" className="w-full">
                  Contacter le support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
