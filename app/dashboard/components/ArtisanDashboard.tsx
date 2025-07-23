"use client";

import * as React from "react";
import { Suspense, useState } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Home,
  MapPin,
  MessageSquare,
  Settings,
  Star,
  User,
  Wrench,
  Bell,
  CheckCircle,
  XCircle,
  Upload,
  CreditCard,
  BarChart3,
  Timer,
  AlertTriangle,
  Eye,
  Send,
  MoreHorizontal,
  Edit,
  Power,
  Zap,
  Euro,
  Badge as BadgeIcon,
  Image as ImageIcon,
  ZoomIn,
  Phone,
  Mail,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Real types from the original implementation
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

type ArtisanStats = {
  totalRequests: number;
  completedRequests: number;
  avgRating: number;
  todayRevenue: number;
  todayJobs: number;
  monthlyRevenue: number;
  totalJobs: number;
};

// PhotoGallery component from original implementation
function PhotoGallery({ photos }: { photos: string[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
          <ImageIcon className="h-4 w-4 mr-2" />
          Photos ({photos.length})
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, 6).map((photoUrl, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={photoUrl}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto(photoUrl)}
              />
              {photos.length > 6 && index === 5 && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center cursor-pointer"
                  onClick={() => setSelectedPhoto(photoUrl)}
                >
                  <span className="text-white text-sm font-medium">
                    +{photos.length - 6}
                  </span>
                </div>
              )}
              <div className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-md p-1">
                <ZoomIn className="h-3 w-3 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedPhoto}
              alt="Photo agrandie"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="secondary"
              className="absolute top-4 right-4"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// RequestCard component from original implementation
function RequestCard({
  request,
  onAccept,
}: {
  request: ServiceRequestForArtisan;
  onAccept?: (requestId: number) => void;
}) {
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
      case "pending":
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
              request.status === "pending" &&
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

// Mock data for UI elements that don't have real backend yet
const mockMessages = [
  {
    id: 1,
    client: "Marie Dubois",
    lastMessage: "Merci pour votre intervention rapide !",
    time: "10:30",
    unread: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    client: "Jean Martin",
    lastMessage: "À quelle heure arrivez-vous ?",
    time: "09:15",
    unread: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

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

const sidebarItems = [
  { title: "Vue d'ensemble", icon: Home, id: "overview" },
  { title: "Missions", icon: Wrench, id: "jobs" },
  { title: "Demandes", icon: Bell, id: "requests" },
  { title: "Devis", icon: FileText, id: "quotes" },
  { title: "Messages", icon: MessageSquare, id: "messages" },
  { title: "Statistiques", icon: BarChart3, id: "stats" },
  { title: "Mon compte", icon: User, id: "account" },
  { title: "Abonnement", icon: CreditCard, id: "subscription" },
];

function ServiceRequestsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-64">
          <CardHeader>
            <div className="animate-pulse space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ArtisanDashboard() {
  const [activeSection, setActiveSection] = React.useState("overview");
  const [selectedJob, setSelectedJob] = React.useState(null);
  const [isActive, setIsActive] = React.useState(true);

  // Real API calls
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequestForArtisan[]>(
    "/api/service-requests/artisan",
    fetcher
  );

  const { data: stats } = useSWR<ArtisanStats>("/api/artisan/stats", fetcher);

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await fetch("/api/service-requests/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        // Refresh the data
        mutateRequests();
      } else {
        console.error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const assignedRequests = requests?.filter((req) => req.isAssigned) || [];
  const availableRequests = requests?.filter((req) => !req.isAssigned) || [];

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h1>
        <p className="text-gray-600">Bonjour, voici votre activité du jour</p>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenus du jour
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.todayRevenue || 0}€
            </div>
            <p className="text-xs text-gray-600">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Missions du jour
            </CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayJobs || 0}</div>
            <p className="text-xs text-gray-600">Interventions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgRating || 0}/5</div>
            <p className="text-xs text-gray-600">Basé sur les avis clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertes importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableRequests.some((req) => req.urgency === "urgent") && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">
                  {
                    availableRequests.filter((req) => req.urgency === "urgent")
                      .length
                  }{" "}
                  mission(s) urgente(s) disponible(s)
                </span>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
          )}
          {availableRequests.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">
                  {availableRequests.length} nouvelle(s) demande(s)
                  disponible(s)
                </span>
              </div>
              <Badge variant="secondary">Nouveau</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Mes prochaines missions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedRequests.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune mission assignée
                </h3>
                <p className="text-gray-600">
                  Consultez la section "Demandes" pour accepter de nouvelles
                  missions
                </p>
              </div>
            ) : (
              assignedRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{request.serviceType}</h4>
                      <p className="text-sm text-gray-600">
                        {request.clientName} •{" "}
                        {new Date(request.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {request.estimatedPrice
                        ? (request.estimatedPrice / 100).toFixed(2) + "€"
                        : "Prix à définir"}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => setActiveSection("jobs")}
                    >
                      Voir détails
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mes missions</h1>
        <div className="flex items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les missions</SelectItem>
              <SelectItem value="accepted">Acceptées</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {assignedRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune mission assignée
              </h3>
              <p className="text-gray-600">
                Consultez la section "Demandes" pour accepter de nouvelles
                missions
              </p>
              <Button
                className="mt-4"
                onClick={() => setActiveSection("requests")}
              >
                Voir les demandes
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignedRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Demandes de mission
        </h1>
        <p className="text-gray-600">Nouvelles opportunités de travail</p>
      </div>

      {requestsError && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Erreur lors du chargement des demandes
            </p>
          </CardContent>
        </Card>
      )}

      {!requests ? (
        <ServiceRequestsListSkeleton />
      ) : availableRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune demande disponible
              </h3>
              <p className="text-gray-600">
                Aucune nouvelle demande ne correspond à vos spécialités pour le
                moment
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {availableRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={handleAcceptRequest}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderQuotes = () => (
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

  const renderMessages = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Messages</h1>

      <div className="grid md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <Avatar>
                    <AvatarImage src={message.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {message.client
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{message.client}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {message.lastMessage}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{message.time}</p>
                    {message.unread && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 ml-auto"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Marie Dubois</CardTitle>
                <p className="text-sm text-gray-500">En ligne</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="space-y-4 h-96 overflow-y-auto">
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm">
                    Bonjour, à quelle heure arrivez-vous pour la réparation ?
                  </p>
                  <p className="text-xs text-gray-500 mt-1">10:15</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">
                    Bonjour ! J'arrive vers 14h comme convenu.
                  </p>
                  <p className="text-xs text-blue-200 mt-1">10:16</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Input placeholder="Tapez votre message..." className="flex-1" />
              <Button size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Revenus totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.monthlyRevenue || 0}€
            </div>
            <p className="text-xs text-green-600">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Missions totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
            <p className="text-xs text-green-600">Toutes missions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Demandes reçues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRequests || 0}
            </div>
            <p className="text-xs text-gray-600">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgRating || 0}/5</div>
            <p className="text-xs text-gray-600">
              {stats?.completedRequests || 0} avis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Graphique des revenus mensuels</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume de missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Graphique du nombre de missions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mon compte</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" defaultValue="Pierre" />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" defaultValue="Dupont" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="pierre.dupont@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" defaultValue="06 12 34 56 78" />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                defaultValue="123 rue de la République, 75011 Paris"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations professionnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company">Entreprise</Label>
              <Input id="company" defaultValue="Dupont Plomberie SARL" />
            </div>
            <div>
              <Label htmlFor="siret">SIRET</Label>
              <Input id="siret" defaultValue="12345678901234" />
            </div>
            <div>
              <Label htmlFor="specialties">Spécialités</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner vos spécialités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plumbing">Plomberie</SelectItem>
                  <SelectItem value="electrical">Électricité</SelectItem>
                  <SelectItem value="heating">Chauffage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Statut</Label>
                <p className="text-sm text-gray-600">
                  Activer/désactiver votre profil
                </p>
              </div>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSubscription = () => (
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

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "jobs":
        return renderJobs();
      case "requests":
        return renderRequests();
      case "quotes":
        return renderQuotes();
      case "messages":
        return renderMessages();
      case "stats":
        return renderStats();
      case "account":
        return renderAccount();
      case "subscription":
        return renderSubscription();
      default:
        return renderOverview();
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-blue-600">Fixéo</h2>
                <p className="text-sm text-gray-600">Tableau de bord</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        className="w-full justify-start"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>PD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Pierre Dupont</p>
                <p className="text-sm text-gray-600 truncate">Plombier Pro</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Power className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-6 bg-white">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1">
                <h1 className="font-semibold">
                  {
                    sidebarItems.find((item) => item.id === activeSection)
                      ?.title
                  }
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <Suspense fallback={<ServiceRequestsListSkeleton />}>
              {renderContent()}
            </Suspense>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
