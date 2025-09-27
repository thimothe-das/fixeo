import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceRequest } from "@/lib/db/schema";
import {
  getCategoryConfig,
  getPriorityConfig,
  getStatusConfig,
} from "@/lib/utils";
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  MapPin,
  Paperclip,
  Plus,
  TriangleAlert,
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { NewRequest } from "../../(client)/NewRequest";

interface ClientOverviewComponentProps {
  totalRequests: number;
  pendingRequests: number;
  activeRequests: number;
  completedRequests: number;
  recentRequests: ServiceRequest[];
  disputedRequests: number;
  openNewRequestModal: () => void;
}

export function Dashboard({
  totalRequests,
  pendingRequests,
  activeRequests,
  completedRequests,
  recentRequests,
  disputedRequests,
  openNewRequestModal,
}: ClientOverviewComponentProps) {
  const router = useRouter();

  const getAttachmentCount = (photos?: string) => {
    if (!photos) return 0;
    try {
      const photoUrls = JSON.parse(photos);
      return Array.isArray(photoUrls) ? photoUrls.length : 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white p-6">
        <h2 className="text-2xl font-bold mb-2">
          Bienvenue sur votre tableau de bord
        </h2>
        <p className="text-blue-100 mb-4">
          Gérez facilement vos demandes de service et suivez leur progression
        </p>
        <NewRequest
          className="!w-auto !bg-white !text-blue-600 hover:!bg-blue-200"
          isModal
          onRequestCreated={() => {}}
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">demandes au total</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingRequests}
            </div>
            <p className="text-xs text-muted-foreground">
              en cours de traitement
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeRequests}
            </div>
            <p className="text-xs text-muted-foreground">prises en charge</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En litige</CardTitle>
            <TriangleAlert className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {disputedRequests}
            </div>
            <p className="text-xs text-muted-foreground">demandes en litige</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedRequests}
            </div>
            <p className="text-xs text-muted-foreground">demandes finalisées</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Demandes récentes
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/workspace/requests")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir tout
            </Button>
          </div>
        </div>

        <div className="p-6">
          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune demande pour le moment
              </h3>
              <p className="text-gray-600 mb-4">
                Créez votre première demande de service pour commencer
              </p>
              <Button onClick={openNewRequestModal} className="text-white">
                <Plus className="h-4 w-4 mr-2" />
                Créer une demande
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {recentRequests.map((request) => {
                const attachmentCount = getAttachmentCount(
                  request.photos || ""
                );
                const categoryConfig = getCategoryConfig(
                  request.serviceType,
                  "h-4 w-4 "
                );
                const statusConfig = getStatusConfig(
                  request.status,
                  "h-4 w-4 "
                );
                const urgencyConfig = getPriorityConfig(
                  request.urgency,
                  "h-4 w-4 "
                );
                return (
                  <div
                    onClick={() =>
                      router.push(`/workspace/requests/${request.id}`)
                    }
                    key={request.id}
                    className="group hover:bg-gray-50  p-4 transition-all duration-200 border-l-4 border-l-blue-200 hover:border-l-blue-400 hover:shadow-sm cursor-pointer"
                  >
                    {/* Header with category and badges */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-900 flex items-center gap-2">
                            {categoryConfig.icon}
                            {categoryConfig.type}
                          </h4>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.colors.bg} ${statusConfig.colors.text}`}
                          >
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyConfig.color}`}
                          >
                            {urgencyConfig.icon}
                            <span className="ml-1">{urgencyConfig.label}</span>
                          </span>
                          {attachmentCount > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              <Paperclip className="h-3 w-3" />
                              <span className="ml-1">
                                {attachmentCount} pièce
                                {attachmentCount > 1 ? "s" : ""} jointe
                                {attachmentCount > 1 ? "s" : ""}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      {request.estimatedPrice && (
                        <div className="text-right bg-green-50 px-3 py-2 rounded-lg">
                          <div className="text-lg font-bold text-green-700">
                            {(request.estimatedPrice / 100).toFixed(2)} €
                          </div>
                          <div className="text-xs text-green-600">
                            Prix estimé
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                      {request.description}
                    </p>

                    {/* Footer with date and location */}
                    <div className="flex items-center text-xs text-gray-500 space-x-4 pt-2 border-t border-gray-100">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Créée le{" "}
                        {moment(request.createdAt).format("DD/MM/YYYY")}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.location}
                      </span>
                      {request.assignedArtisanId && (
                        <span className="flex items-center text-blue-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Assignée à {request.assignedArtisanId}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
