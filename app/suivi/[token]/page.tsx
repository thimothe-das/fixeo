import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db/drizzle";
import { serviceRequests, ServiceRequestStatus } from "@/lib/db/schema";
import {
  getCategoryConfig,
  getPriorityConfig,
  getStatusConfig,
} from "@/lib/utils";
import { eq } from "drizzle-orm";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { PhotoGallery } from "./photo-gallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return {
    title: "Suivi de votre demande - Fixéo",
  };
}

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Fetch the service request by guest token
  const [request] = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.guestToken, token))
    .limit(1);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  Demande introuvable
                </h1>
                <p className="text-gray-600">
                  Aucune demande de service trouvée avec ce lien de suivi.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const urgencyConfig = getPriorityConfig(request.urgency, "h-4 w-4");
  const serviceTypeConfig = getCategoryConfig(request.serviceType, "h-4 w-4");

  console.log("request", request);
  const photos = request.photos ? JSON.parse(request.photos) : [];
  const statusConfig = getStatusConfig(request.status, "h-4 w-4");
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button asChild variant="outline" className="flex items-center">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Suivi de votre demande
            </h1>
            <p className="text-gray-600">
              Suivez l'évolution de votre demande de service en temps réel
            </p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {serviceTypeConfig.type}
              </CardTitle>
              <Badge className={statusConfig.color}>
                {statusConfig.icon}
                <span className="ml-2">{statusConfig.label}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{request.description}</p>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  {request.location}
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                  Créée le {moment(request.createdAt).format("DD/MM/YYYY")}
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Urgence:{" "}
                  </span>
                  <span className="text-sm text-gray-600">
                    {urgencyConfig.label}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {"name not available"}
                </div>

                {request.clientEmail && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {request.clientEmail}
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {"phone not available"}
                </div>

                {request.estimatedPrice && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-green-800">
                      Prix estimé:{" "}
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      {(request.estimatedPrice / 100).toFixed(2)} €
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Photos Section */}
            <PhotoGallery photos={photos} />
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Progression de votre demande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Demande créée</p>
                  <p className="text-sm text-gray-600">
                    {moment(request.createdAt).format("DD/MM/YYYY")}
                  </p>
                </div>
              </div>

              {request.status === ServiceRequestStatus.IN_PROGRESS && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Demande acceptée par un artisan
                    </p>
                    <p className="text-sm text-gray-600">
                      Votre demande a été prise en charge
                    </p>
                  </div>
                </div>
              )}

              {request.status === ServiceRequestStatus.AWAITING_ASSIGNATION && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Recherche d'un artisan
                    </p>
                    <p className="text-sm text-gray-600">
                      Nous recherchons un professionnel dans votre secteur
                    </p>
                  </div>
                </div>
              )}

              {request.status === ServiceRequestStatus.COMPLETED && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Intervention terminée
                    </p>
                    <p className="text-sm text-gray-600">
                      L'artisan a terminé l'intervention
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Une question ? Contactez-nous à{" "}
            <a
              href="mailto:contact@fixeo.fr"
              className="text-blue-600 hover:underline"
            >
              contact@fixeo.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
