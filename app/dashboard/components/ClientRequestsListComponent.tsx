import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Eye,
} from "lucide-react";

type ServiceRequest = {
  id: number;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  status: string;
  estimatedPrice?: number;
  createdAt: string;
  photos?: string;
  assignedArtisan?: {
    id: number;
    name: string;
    email: string;
  };
};

interface ClientRequestsListComponentProps {
  requests: ServiceRequest[];
}

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

  const photos = request.photos ? JSON.parse(request.photos) : [];

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

          {photos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Photos:</p>
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 3).map((photoUrl: string, index: number) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={photoUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-md border"
                    />
                    {photos.length > 3 && index === 2 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          +{photos.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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

export function ClientRequestsListComponent({
  requests,
}: ClientRequestsListComponentProps) {
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

  // Group requests by status
  const pendingRequests = requests.filter((req) => req.status === "pending");
  const activeRequests = requests.filter((req) =>
    ["accepted", "in_progress"].includes(req.status)
  );
  const completedRequests = requests.filter(
    (req) => req.status === "completed"
  );
  const cancelledRequests = requests.filter(
    (req) => req.status === "cancelled"
  );

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-600" />
            Demandes en attente ({pendingRequests.length})
          </h3>
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {/* Active Requests */}
      {activeRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Demandes en cours ({activeRequests.length})
          </h3>
          <div className="grid gap-4">
            {activeRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Requests */}
      {completedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
            Demandes terminées ({completedRequests.length})
          </h3>
          <div className="grid gap-4">
            {completedRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Requests */}
      {cancelledRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            Demandes annulées ({cancelledRequests.length})
          </h3>
          <div className="grid gap-4">
            {cancelledRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
