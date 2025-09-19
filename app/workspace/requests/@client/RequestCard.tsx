"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Badge as BadgeIcon,
  Calendar,
  CheckCircle,
  Clock,
  Euro,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { PhotoGallery } from "./PhotoGallery";

type ServiceRequestForArtisan = {
  id: number;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  status: string;
  estimatedPrice?: number;
  createdAt: string;
  clientEmail?: string;
  clientName?: string;
  clientPhone?: string;
  photos?: string;
  isAssigned: boolean;
};

interface RequestCardProps {
  request: ServiceRequestForArtisan;
  onAccept?: (requestId: number) => void;
}

export function RequestCard({ request, onAccept }: RequestCardProps) {
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "week":
        return "bg-orange-100 text-orange-800";
      case "flexible":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const photos = request.photos ? JSON.parse(request.photos) : [];

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        request.isAssigned ? "border-green-200 bg-green-50/50" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold">
                {request.serviceType}
              </CardTitle>
              {request.isAssigned && (
                <Badge
                  variant="outline"
                  className="text-green-700 border-green-300"
                >
                  <BadgeIcon className="h-3 w-3 mr-1" />
                  Assigné
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(request.createdAt)}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(request.status)}>
              {getStatusIcon(request.status)}
              <span className="ml-1 capitalize">{request.status}</span>
            </Badge>
            <Badge className={getUrgencyColor(request.urgency)}>
              {request.urgency === "urgent"
                ? "🚨"
                : request.urgency === "week"
                ? "📅"
                : "⏰"}{" "}
              {request.urgency}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Description:
            </p>
            <p className="text-sm text-gray-600">{request.description}</p>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-blue-600" />
            {request.location}
          </div>

          {/* Photo Gallery */}
          <PhotoGallery photos={photos} />

          {request.isAssigned && (
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Informations client
              </h4>
              <div className="space-y-2">
                {request.clientName && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Nom:</span>{" "}
                    {request.clientName}
                  </p>
                )}
                {request.clientEmail && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-3 w-3 mr-2" />
                    {request.clientEmail}
                  </p>
                )}
                {request.clientPhone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-3 w-3 mr-2" />
                    {request.clientPhone}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              {request.estimatedPrice && (
                <span className="text-sm font-medium text-green-600 flex items-center">
                  <Euro className="h-4 w-4 mr-1" />
                  {(request.estimatedPrice / 100).toFixed(2)} €
                </span>
              )}
            </div>

            {!request.isAssigned &&
              request.status === "in_progress" &&
              onAccept && (
                <Button
                  size="sm"
                  onClick={() => onAccept(request.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accepter
                </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
