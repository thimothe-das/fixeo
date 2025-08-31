"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Wrench,
  Save,
  Eye,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  FileText,
  Image as ImageIcon,
  Send,
  Euro,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  UserCheck,
  Play,
  Check,
  Zap,
  Droplets,
  Flame,
  Paintbrush,
  Hammer,
  Building,
  Home,
  Sparkles,
  Trees,
  HelpCircle,
  Edit3,
  Edit2,
  Star,
  ExternalLink,
  ArrowRight,
  SquareArrowOutUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AddressAutocomplete,
  AddressData,
} from "@/components/ui/address-autocomplete";
import {
  getStatusConfig,
  getCategoryConfig,
  getPriorityConfig,
} from "@/lib/utils";

interface ServiceRequestDetail {
  id: number;
  title: string;
  serviceType: string;
  urgency: string;
  description: string;
  location: string;
  locationHousenumber?: string;
  locationStreet?: string;
  locationPostcode?: string;
  locationCity?: string;
  locationCitycode?: string;
  locationDistrict?: string;
  locationCoordinates?: string;
  locationContext?: string;
  photos?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientName?: string;
  status: string;
  estimatedPrice?: number;
  createdAt: string;
  updatedAt: string;
  userId?: number;
  assignedArtisanId?: number;
  client?: {
    id: number;
    name: string;
    email: string;
  };
  assignedArtisan?: {
    id: number;
    name: string;
    email: string;
  };
  billingEstimates?: any[];
  conversations?: ConversationMessage[];
}

interface ConversationMessage {
  id: number;
  serviceRequestId: number;
  senderId: number;
  senderType: "client" | "artisan" | "admin";
  message: string;
  createdAt: string;
  readAt?: string;
  sender?: {
    id: number;
    name: string;
    email: string;
  };
}

const STATUS_OPTIONS = [
  {
    value: "awaiting_estimate",
    label: "En attente de devis",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: FileText,
  },
  {
    value: "awaiting_assignation",
    label: "En attente d'assignation",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: UserCheck,
  },
  {
    value: "in_progress",
    label: "En cours",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  {
    value: "client_validated",
    label: "Validé par le client",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Eye,
  },
  {
    value: "artisan_validated",
    label: "Validé par l'artisan",
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    icon: UserCheck,
  },
  {
    value: "completed",
    label: "Terminé",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  {
    value: "disputed_by_client",
    label: "Contesté par le client",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  {
    value: "disputed_by_artisan",
    label: "Contesté par l'artisan",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  {
    value: "disputed_by_both",
    label: "Contesté par les deux parties",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  {
    value: "resolved",
    label: "Résolu",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  {
    value: "cancelled",
    label: "Annulé",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: XCircle,
  },
];

const SERVICE_TYPES = [
  { value: "electricity", label: "Électricité" },
  { value: "plumbing", label: "Plomberie" },
  { value: "heating", label: "Chauffage" },
  { value: "painting", label: "Peinture" },
  { value: "carpentry", label: "Menuiserie" },
  { value: "masonry", label: "Maçonnerie" },
  { value: "roofing", label: "Couverture" },
  { value: "cleaning", label: "Nettoyage" },
  { value: "gardening", label: "Jardinage" },
  { value: "other", label: "Autre" },
];

const URGENCY_LEVELS = [
  {
    value: "low",
    label: "Faible",
    color: "bg-green-100 text-green-700 border-green-200",
    indicatorColor: "bg-green-500",
  },
  {
    value: "medium",
    label: "Moyenne",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    indicatorColor: "bg-yellow-500",
  },
  {
    value: "high",
    label: "Élevée",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    indicatorColor: "bg-orange-500",
  },
  {
    value: "urgent",
    label: "Urgent",
    color: "bg-red-100 text-red-700 border-red-200",
    indicatorColor: "bg-red-500",
  },
];

// Service types with icons and colors
const SERVICE_TYPES_WITH_ICONS = [
  {
    value: "electricity",
    label: "Électricité",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "plumbing",
    label: "Plomberie",
    icon: Droplets,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "heating",
    label: "Chauffage",
    icon: Flame,
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    value: "painting",
    label: "Peinture",
    icon: Paintbrush,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    value: "carpentry",
    label: "Menuiserie",
    icon: Hammer,
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    value: "masonry",
    label: "Maçonnerie",
    icon: Building,
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
  {
    value: "roofing",
    label: "Couverture",
    icon: Home,
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    value: "cleaning",
    label: "Nettoyage",
    icon: Sparkles,
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  {
    value: "gardening",
    label: "Jardinage",
    icon: Trees,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "other",
    label: "Autre",
    icon: Settings,
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
];

// Request progress/timeline data
const getRequestProgress = (
  status: string,
  createdAt: string,
  updatedAt: string
) => {
  const steps = [
    {
      key: "created",
      label: "Demande créée",
      completed: true,
      date: createdAt,
    },
    {
      key: "awaiting_estimate",
      label: "En attente de devis",
      completed: [
        "awaiting_estimate",
        "awaiting_assignation",
        "in_progress",
        "client_validated",
        "artisan_validated",
        "completed",
        "resolved",
      ].includes(status),
    },
    {
      key: "awaiting_assignation",
      label: "En attente d'assignation",
      completed: [
        "awaiting_assignation",
        "in_progress",
        "client_validated",
        "artisan_validated",
        "completed",
        "resolved",
      ].includes(status),
    },
    {
      key: "in_progress",
      label: "En cours",
      completed: [
        "in_progress",
        "client_validated",
        "artisan_validated",
        "completed",
        "resolved",
      ].includes(status),
    },
    {
      key: "validation",
      label: "En validation",
      completed: [
        "client_validated",
        "artisan_validated",
        "completed",
        "resolved",
      ].includes(status),
    },
    {
      key: "completed",
      label: "Terminé",
      completed: ["completed", "resolved"].includes(status),
      date: status === "completed" ? updatedAt : undefined,
    },
  ];

  // Handle disputed states
  if (status.includes("disputed")) {
    steps.push({
      key: "disputed",
      label: "En litige",
      completed: true,
      date: updatedAt,
    });
  }

  return steps;
};

// Get icon for progress step
const getStepIcon = (stepKey: string, completed: boolean) => {
  const iconProps = {
    className: `h-3 w-3 ${completed ? "text-white" : "text-gray-400"}`,
  };

  switch (stepKey) {
    case "created":
      return <Plus {...iconProps} />;
    case "awaiting_estimate":
      return <FileText {...iconProps} />;
    case "awaiting_assignation":
      return <UserCheck {...iconProps} />;
    case "in_progress":
      return <Play {...iconProps} />;
    case "validation":
      return <Eye {...iconProps} />;
    case "completed":
      return <Check {...iconProps} />;
    case "disputed":
      return <AlertTriangle {...iconProps} />;
    default:
      return <Clock {...iconProps} />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatCurrency = (amount: number | null) => {
  if (!amount) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 100);
};

// Calculate time elapsed since creation
const getTimeElapsed = (createdAt: string) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}j ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}min`;
  }
};

// Get urgency config by value
const getUrgencyConfig = (urgency: string) => {
  return (
    URGENCY_LEVELS.find((level) => level.value === urgency) || URGENCY_LEVELS[0]
  );
};

// Get service type config by value
const getServiceTypeConfig = (serviceType: string) => {
  return (
    SERVICE_TYPES_WITH_ICONS.find((type) => type.value === serviceType) ||
    SERVICE_TYPES_WITH_ICONS[SERVICE_TYPES_WITH_ICONS.length - 1]
  );
};

// Get profession name based on service type
const getProfessionName = (serviceType: string) => {
  const professions: { [key: string]: string } = {
    electricity: "Électricien",
    plumbing: "Plombier",
    heating: "Chauffagiste",
    painting: "Peintre",
    carpentry: "Menuisier",
    masonry: "Maçon",
    roofing: "Couvreur",
    cleaning: "Agent d'entretien",
    gardening: "Jardinier",
    other: "Artisan",
  };
  return professions[serviceType] || "Artisan";
};

export default function AdminServiceRequestDetail() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<ServiceRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ServiceRequestDetail>>({});
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [originalData, setOriginalData] = useState<
    Partial<ServiceRequestDetail>
  >({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState("");
  const [showConversationPanel, setShowConversationPanel] = useState(false);

  const requestId = params.id as string;

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/service-requests/${requestId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch request");
      }

      const data: ServiceRequestDetail = await response.json();
      setRequest(data);
      setFormData(data);
      setOriginalData(data);
      setModifiedFields(new Set());
      setTempTitle(data.title || "");
      setIsEditingTitle(false);
      setTempDescription(data.description || "");
      setIsEditingDescription(false);
    } catch (err) {
      console.error("Error fetching request:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const saveRequest = async () => {
    if (!request) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/admin/service-requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save request");
      }

      const updatedRequest = await response.json();
      setRequest((prev) => (prev ? { ...prev, ...updatedRequest } : null));
      setFormData((prev) => ({ ...prev, ...updatedRequest }));
      setOriginalData((prev) => ({ ...prev, ...updatedRequest }));
      setModifiedFields(new Set());
      setTempTitle(updatedRequest.title || "");
      setIsEditingTitle(false);
      setTempDescription(updatedRequest.description || "");
      setIsEditingDescription(false);
    } catch (err) {
      console.error("Error saving request:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !request) return;

    try {
      setSendingMessage(true);

      const response = await fetch(`/api/conversations/${requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setNewMessage("");
      // Refresh conversations
      fetchRequest();
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Track modified fields
    const originalValue = originalData[field as keyof ServiceRequestDetail];
    if (value !== originalValue) {
      setModifiedFields((prev) => new Set([...prev, field]));
    } else {
      setModifiedFields((prev) => {
        const newSet = new Set([...prev]);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  const handleAddressChange = (
    addressData: AddressData | null,
    rawValue: string
  ) => {
    if (addressData) {
      setFormData((prev) => ({
        ...prev,
        location: addressData.label,
        locationHousenumber: addressData.housenumber,
        locationStreet: addressData.street,
        locationPostcode: addressData.postcode,
        locationCity: addressData.city,
        locationCitycode: addressData.citycode,
        locationDistrict: addressData.district,
        locationCoordinates: addressData.coordinates.join(","),
        locationContext: addressData.context,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        location: rawValue,
      }));
    }
  };

  // Inline editing functions for title
  const startEditingTitle = () => {
    setTempTitle(formData.title || "");
    setIsEditingTitle(true);
  };

  const saveTitle = () => {
    handleInputChange("title", tempTitle);
    setIsEditingTitle(false);
  };

  const cancelEditingTitle = () => {
    setTempTitle(formData.title || "");
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      cancelEditingTitle();
    }
  };

  // Inline editing functions for description
  const startEditingDescription = () => {
    setTempDescription(formData.description || "");
    setIsEditingDescription(true);
  };

  const saveDescription = () => {
    handleInputChange("description", tempDescription);
    setIsEditingDescription(false);
  };

  const cancelEditingDescription = () => {
    setTempDescription(formData.description || "");
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      saveDescription();
    } else if (e.key === "Escape") {
      cancelEditingDescription();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Erreur</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">
                {error || "Requête non trouvée"}
              </p>
              <Button onClick={() => router.back()} variant="outline">
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const photos = request.photos ? JSON.parse(request.photos) : [];
  const progressSteps = getRequestProgress(
    request.status,
    request.createdAt,
    request.updatedAt
  );

  return (
    <TooltipProvider>
      <div className="space-y-6 p-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Requête #{request.id}
                </h1>
                <Badge
                  className={`${
                    getStatusConfig(request.status, "").color
                  } text-sm`}
                >
                  {getStatusConfig(request.status, "").label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Créée le {formatDate(request.createdAt)}</span>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{getTimeElapsed(request.createdAt)} écoulé</span>
                </div>
                {request.urgency && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          getUrgencyConfig(request.urgency).indicatorColor
                        }`}
                      />
                      <span className="text-xs font-medium">
                        {getUrgencyConfig(request.urgency).label}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            {/* Clickable Price - Links to Bill */}
            <button
              className="flex flex-col items-center text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg px-3 py-2 transition-all cursor-pointer group"
              onClick={() => {
                // User will handle the click functionality
              }}
              title="Voir le devis détaillé"
            >
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                <span className="text-2xl font-bold">
                  {formatCurrency(request.estimatedPrice || null)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <FileText className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                  Voir devis
                </span>
              </div>
            </button>
            <div className="ml-4">
              <Button
                onClick={saveRequest}
                disabled={saving || modifiedFields.size === 0}
                className={
                  modifiedFields.size > 0 ? "bg-blue-600 hover:bg-blue-700" : ""
                }
              >
                <Save className="h-4 w-4 mr-2" />
                {saving
                  ? "Sauvegarde..."
                  : modifiedFields.size > 0
                  ? `Sauvegarder (${modifiedFields.size} modif.)`
                  : "Sauvegarder"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content with Floating Conversation Button */}
        <div className="relative">
          {/* Floating Conversation Toggle Button */}
          <div className="fixed bottom-6 right-6 z-40">
            <Button
              onClick={() => setShowConversationPanel(!showConversationPanel)}
              className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
              size="icon"
            >
              <MessageSquare className="h-6 w-6" />
              {request.conversations && request.conversations.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {request.conversations.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Request Details - Always Visible */}
          <div className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-25">
              {/* Main Form - 3 columns */}
              <div className="lg:col-span-3 space-y-6">
                {/* Basic Information - No Card */}
                <div className="space-y-6">
                  {/* Title - Subtle Inline Editing */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {modifiedFields.has("title") && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-blue-600 font-medium">
                            Modifié
                          </span>
                        </div>
                      )}
                    </div>

                    {!isEditingTitle ? (
                      // Display Mode - Subtle with visible edit indicator
                      <div
                        className="group cursor-pointer py-1 px-1 -mx-1 rounded-md transition-all hover:bg-gray-50"
                        onClick={startEditingTitle}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-2xl font-semibold leading-tight text-gray-800`}
                          >
                            {formData.title ||
                              "Cliquez pour ajouter un titre..."}
                          </span>
                          <Edit2 className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                    ) : (
                      // Edit Mode
                      <div className="flex items-center gap-2 py-1">
                        <Input
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onKeyDown={handleTitleKeyPress}
                          placeholder="Titre de la requête"
                          className="flex-1 !text-2xl font-semibold border-0 shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                          autoFocus
                        />
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="sm"
                            onClick={saveTitle}
                            className="h-7 w-7 p-0"
                            disabled={!tempTitle.trim()}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditingTitle}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Separator */}
                  <div className="border-t border-gray-100 my-8"></div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium">Urgence</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Définit la priorité de traitement de la demande</p>
                        </TooltipContent>
                      </Tooltip>
                      {modifiedFields.has("urgency") && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Edit3 className="h-3 w-3" />
                          <span>Modifié</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {URGENCY_LEVELS.map((level) => {
                        const isSelected = formData.urgency === level.value;
                        return (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() =>
                              handleInputChange("urgency", level.value)
                            }
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-all hover:shadow-sm ${
                              isSelected
                                ? `${level.color} border-current shadow-sm`
                                : "border-gray-200 hover:border-gray-300 text-gray-600"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${level.indicatorColor}`}
                            />
                            <span>{level.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-gray-100 my-8"></div>

                  {/* Service Type and Urgency - Same Line */}
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm font-medium">
                          Type de service
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Sélectionnez la catégorie qui correspond le mieux
                              au type d'intervention demandée
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        {modifiedFields.has("serviceType") && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Edit3 className="h-3 w-3" />
                            <span>Modifié</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {SERVICE_TYPES_WITH_ICONS.map((type) => {
                          const IconComponent = type.icon;
                          const isSelected =
                            formData.serviceType === type.value;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() =>
                                handleInputChange("serviceType", type.value)
                              }
                              className={`flex items-center gap-2 p-2 rounded-lg border-2 text-xs font-medium transition-all hover:shadow-sm ${
                                isSelected
                                  ? `${type.color} border-current shadow-sm`
                                  : "border-gray-200 hover:border-gray-300 text-gray-600"
                              }`}
                            >
                              <IconComponent className="h-3 w-3" />
                              <span className="truncate">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-gray-100 my-8"></div>

                  {/* Status - Full Width */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium">Statut</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Attention : Changer le statut affecte le workflow et
                            les notifications
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      {modifiedFields.has("status") && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Edit3 className="h-3 w-3" />
                          <span>Modifié</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {STATUS_OPTIONS.map((status) => {
                        const IconComponent = status.icon;
                        const isSelected = formData.status === status.value;
                        return (
                          <button
                            key={status.value}
                            type="button"
                            onClick={() =>
                              handleInputChange("status", status.value)
                            }
                            className={`flex items-center gap-2 p-2 rounded-lg border-2 text-xs font-medium transition-all hover:shadow-sm min-h-[2.5rem] ${
                              isSelected
                                ? `${status.color} border-current shadow-sm`
                                : "border-gray-200 hover:border-gray-300 text-gray-600"
                            }`}
                            title={status.label}
                          >
                            <IconComponent className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate text-left leading-tight">
                              {status.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-gray-100 my-8"></div>

                  {/* Description - Subtle Inline Editing */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-sm font-medium text-gray-600">
                        Description
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Décrivez le problème de manière détaillée pour aider
                            l'artisan à comprendre la situation
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      {modifiedFields.has("description") && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-blue-600 font-medium">
                            Modifié
                          </span>
                        </div>
                      )}
                    </div>

                    {!isEditingDescription ? (
                      // Display Mode - Subtle with Background
                      <div
                        className="group cursor-pointer p-4 rounded-lg bg-gray-50 border border-gray-100 transition-all hover:bg-gray-100 hover:border-gray-200 min-h-[100px]"
                        onClick={startEditingDescription}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div
                              className={`text-base leading-relaxed whitespace-pre-wrap ${
                                formData.description
                                  ? "text-gray-800"
                                  : "text-gray-500"
                              }`}
                            >
                              {formData.description ||
                                "Cliquez pour ajouter une description..."}
                            </div>
                          </div>
                          <Edit2 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                        </div>
                      </div>
                    ) : (
                      // Edit Mode
                      <div className="py-1">
                        <Textarea
                          value={tempDescription}
                          onChange={(e) => setTempDescription(e.target.value)}
                          onKeyDown={handleDescriptionKeyPress}
                          placeholder="Description détaillée du problème"
                          className="w-full text-base border-0 shadow-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent resize-none min-h-[100px]"
                          autoFocus
                          rows={4}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={saveDescription}
                            className="h-7 px-3"
                            disabled={!tempDescription.trim()}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Sauvegarder
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditingDescription}
                            className="h-7 px-3"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Annuler
                          </Button>
                          <span className="text-xs text-gray-500 ml-2">
                            Ctrl+Entrée pour sauvegarder, Échap pour annuler
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    Localisation
                  </h2>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium">
                        Adresse complète
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Utilisez l'autocomplétion pour sélectionner
                            l'adresse exacte et améliorer la précision
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      {modifiedFields.has("location") && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Edit3 className="h-3 w-3" />
                          <span>Modifié</span>
                        </div>
                      )}
                    </div>
                    <AddressAutocomplete
                      placeholder="Tapez l'adresse de l'intervention..."
                      value={formData.location || ""}
                      onChange={handleAddressChange}
                      name="location"
                    />
                  </div>

                  {/* OpenStreetMap */}
                  {(formData.locationCoordinates || formData.location) && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium mb-2 block">
                        Localisation sur la carte
                      </Label>
                      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                        {formData.locationCoordinates ? (
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                              parseFloat(
                                formData.locationCoordinates.split(",")[0]
                              ) - 0.01
                            },${
                              parseFloat(
                                formData.locationCoordinates.split(",")[1]
                              ) - 0.01
                            },${
                              parseFloat(
                                formData.locationCoordinates.split(",")[0]
                              ) + 0.01
                            },${
                              parseFloat(
                                formData.locationCoordinates.split(",")[1]
                              ) + 0.01
                            }&layer=mapnik&marker=${
                              formData.locationCoordinates.split(",")[1]
                            },${formData.locationCoordinates.split(",")[0]}`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">
                                Sélectionnez une adresse pour voir la carte
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formData.location}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Timeline - 1 column */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Progression de la requête
                  </h2>

                  <div className="space-y-4">
                    {progressSteps.map((step, index) => (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              step.completed
                                ? "bg-green-500 border-green-500"
                                : "bg-gray-200 border-gray-300"
                            }`}
                          >
                            {getStepIcon(step.key, step.completed)}
                          </div>
                          {index < progressSteps.length - 1 && (
                            <div
                              className={`w-0.5 h-8 mt-1 ${
                                step.completed ? "bg-green-500" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              step.completed ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(step.date)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Client Information - Minimal & Clickable */}
                {request.client && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Client
                    </h3>
                    <div
                      className="flex items-center gap-2 pl-6 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-blue-50 transition-colors group"
                      onClick={() =>
                        router.push(`/workspace/users/${request.client?.id}`)
                      }
                      title="Voir le profil du client"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.client.email}`}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {request.client.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                          {request.client.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {request.client.email}
                        </p>
                      </div>
                      <div className="opacity-100 group-hover:opacity-0 transition-opacity">
                        <SquareArrowOutUpRight className="h-4 w-4 text-gray-600 ml-2" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowLeft className="h-4 w-4 text-blue-600 rotate-180" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Artisan Information - Minimal & Clickable */}
                {request.assignedArtisan && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-green-600" />
                      Artisan
                    </h3>
                    <div
                      className="flex items-center gap-2 pl-6 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-green-50 transition-colors group"
                      onClick={() =>
                        router.push(
                          `/workspace/users/${request.assignedArtisan?.id}`
                        )
                      }
                      title="Voir le profil de l'artisan"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.assignedArtisan.email}`}
                        />
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          {request.assignedArtisan.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-green-700 transition-colors">
                            {request.assignedArtisan.name}
                          </p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-2.5 h-2.5 ${
                                  i < 4
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {getProfessionName(request.serviceType)}
                        </p>
                      </div>
                      <div className="opacity-100 group-hover:opacity-0 transition-opacity">
                        <SquareArrowOutUpRight className="h-4 w-4 text-gray-600 ml-2" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Photos Section */}
                {photos.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Photos ({photos.length})
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {photos.map((photo: string, index: number) => (
                        <div
                          key={index}
                          className={`w-24 h-24 rounded-lg overflow-hidden border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform ${
                            index > 0 ? "-ml-4" : ""
                          }`}
                          style={{ zIndex: photos.length - index }}
                          onClick={() => {
                            setCurrentPhotoIndex(index);
                            setPhotoModalOpen(true);
                          }}
                        >
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conversation Panel Overlay */}
          {showConversationPanel && (
            <div
              className="fixed inset-0 bg-gray-900/5 z-40 transition-opacity duration-300"
              onClick={() => setShowConversationPanel(false)}
            />
          )}

          {/* Floating Conversation Panel */}
          {showConversationPanel && (
            <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
              {/* Conversation Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Conversation</h3>
                  {request.conversations &&
                    request.conversations.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {request.conversations.length}
                      </Badge>
                    )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConversationPanel(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!request.conversations ||
                request.conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageSquare className="h-12 w-12 mb-4" />
                    <p className="text-center">Aucun message pour le moment</p>
                    <p className="text-sm text-center">
                      Soyez le premier à démarrer la conversation
                    </p>
                  </div>
                ) : (
                  <>
                    {request.conversations.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderType === "admin"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] ${
                            message.senderType === "admin"
                              ? "bg-blue-600 text-white"
                              : message.senderType === "artisan"
                              ? "bg-green-100 text-green-900"
                              : "bg-gray-100 text-gray-900"
                          } rounded-lg p-3`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium opacity-75">
                              {message.senderType === "admin"
                                ? "Admin"
                                : message.senderType === "artisan"
                                ? "Artisan"
                                : "Client"}
                            </span>
                            <span className="text-xs opacity-50">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    size="sm"
                    className="h-10 px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Photo Gallery Modal */}
        <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>
                Photos de la requête ({currentPhotoIndex + 1}/{photos.length})
              </DialogTitle>
            </DialogHeader>
            <div className="relative">
              {photos.length > 0 && (
                <div className="flex items-center justify-center p-6">
                  <img
                    src={photos[currentPhotoIndex]}
                    alt={`Photo ${currentPhotoIndex + 1}`}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
              )}

              {/* Navigation buttons */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={() =>
                      setCurrentPhotoIndex((prev) =>
                        prev === 0 ? photos.length - 1 : prev - 1
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                    onClick={() =>
                      setCurrentPhotoIndex((prev) =>
                        prev === photos.length - 1 ? 0 : prev + 1
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white"
                onClick={() => setPhotoModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Photo thumbnails */}
            {photos.length > 1 && (
              <div className="px-6 pb-6">
                <div className="flex gap-2 justify-center">
                  {photos.map((photo: string, index: number) => (
                    <button
                      key={index}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        index === currentPhotoIndex
                          ? "border-blue-500"
                          : "border-gray-200"
                      }`}
                      onClick={() => setCurrentPhotoIndex(index)}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
