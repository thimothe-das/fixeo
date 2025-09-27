import { clsx, type ClassValue } from "clsx";
import {
  AlertCircle,
  AlertTriangle,
  Calculator,
  Calendar,
  CheckCircle,
  CircleDot,
  Clock,
  Cog,
  CreditCard,
  Fence,
  FileQuestion,
  Flag,
  LucideWrench,
  PaintBucket,
  PiIcon,
  Settings,
  UserCheck,
  UserRoundSearch,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ServiceRequestStatus } from "./db/schema";
import { checkoutAction } from "./payments/actions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export enum ServiceType {
  PLOMBERIE = "plomberie",
  ELECTRICITE = "electricite",
  PEINTURE = "peinture",
  MENUISERIE = "menuiserie",
  DEPANNAGE = "depannage",
  RENOVATION = "renovation",
}

export const DOWN_PAYMENT_PERCENTAGE = 0.3;

export const getStatusConfig = (status: string, iconClassName: string) => {
  switch (status) {
    case ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION:
      return {
        icon: (
          <Calculator className={cn("text-amber-500 h-5 w-5", iconClassName)} />
        ),
        label: "En attente de l'acceptation du devis",
        colors: {
          color: "amber-500",
          bg: "bg-amber-100 hover:bg-amber-100",
          text: "text-amber-700",
          ring: "ring 1 ring-amber-200",
          accent: "border-amber-500",
          borderTop: "border-t-amber-200",
        },
      };
    case ServiceRequestStatus.AWAITING_PAYMENT:
      return {
        icon: (
          <CreditCard className={cn("text-red-500 h-5 w-5", iconClassName)} />
        ),
        label: "En attente de paiement",
        colors: {
          color: "red-500",
          bg: "bg-red-100 hover:bg-red-100",
          text: "text-red-700",
          ring: "ring 1 ring-red-200",
          accent: "border-red-500",
          borderTop: "border-t-red-200",
        },
      };

    case ServiceRequestStatus.AWAITING_ESTIMATE:
      return {
        color:
          "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100",
        label: "En attente de devis",
        borderTop: "border-t-slate-200",
        icon: <Clock className={cn("text-gray-500 h-5 w-5", iconClassName)} />,
        colors: {
          color: "slate-500",
          bg: "bg-slate-100 hover:bg-slate-100",
          text: "text-slate-500",
          ring: "ring 1 ring-slate-200",
          accent: "border-slate-500",
          borderTop: "border-t-slate-200",
        },
      };
    case ServiceRequestStatus.AWAITING_ASSIGNATION:
      return {
        label: "Assignation en cours",
        borderTop: "border-t-yellow-200",
        icon: (
          <UserRoundSearch
            className={cn("text-yellow-500 h-5 w-5", iconClassName)}
          />
        ),
        colors: {
          color: "yellow-500",
          bg: "bg-yellow-100 hover:bg-yellow-100",
          text: "text-yellow-500",
          ring: "ring 1 ring-yellow-200",
          accent: "border-yellow-500",
          borderTop: "border-t-yellow-200",
        },
      };
    case ServiceRequestStatus.IN_PROGRESS:
      return {
        label: "En cours",
        borderTop: "border-t-blue-600",
        icon: (
          <Cog
            className={cn(
              "text-blue-500 h-5 w-5 animate-spin-slow ",
              iconClassName
            )}
          />
        ),
        colors: {
          color: "blue-500",
          bg: "bg-blue-100 hover:bg-blue-100",
          text: "text-blue-500",
          ring: "ring 1 ring-blue-200",
          accent: "border-blue-500",
          borderTop: "border-t-blue-200",
        },
      };
    case ServiceRequestStatus.CLIENT_VALIDATED:
      return {
        label: "À valider",
        borderTop: "border-t-orange-500",
        icon: <Flag className={cn("text-orange-500 h-5 w-5", iconClassName)} />,
        colors: {
          color: "orange-500",
          bg: "bg-orange-100 hover:bg-orange-100",
          text: "text-orange-500",
          ring: "ring 1 ring-orange-200",
          accent: "border-orange-500",
          borderTop: "border-t-orange-500",
        },
      };
    case ServiceRequestStatus.ARTISAN_VALIDATED:
      return {
        label: "Validée",
        borderTop: "border-t-cyan-800",
        icon: (
          <UserCheck className={cn("text-cyan-500 h-5 w-5", iconClassName)} />
        ),
        colors: {
          color: "cyan-500",
          bg: "bg-cyan-100 hover:bg-cyan-100",
          text: "text-cyan-500",
          ring: "ring 1 ring-cyan-200",
          accent: "border-cyan-500",
          borderTop: "border-t-cyan-800",
        },
      };
    case ServiceRequestStatus.COMPLETED:
      return {
        label: "Terminée",
        borderTop: "border-t-green-500",
        icon: (
          <CheckCircle
            className={cn("text-emerald-500 h-5 w-5", iconClassName)}
          />
        ),
        colors: {
          color: "emerald-500",
          bg: "bg-emerald-100 hover:bg-emerald-100",
          text: "text-emerald-500",
          ring: "ring 1 ring-emerald-200",
          accent: "border-emerald-500",
          borderTop: "border-t-green-500",
        },
      };
    case ServiceRequestStatus.DISPUTED_BY_CLIENT:
      return {
        label: "Litige client",
        borderTop: "border-t-red-500",
        icon: (
          <AlertTriangle
            className={cn("text-red-500 h-5 w-5", iconClassName)}
          />
        ),
        colors: {
          color: "red-500",
          bg: "bg-red-100 hover:bg-red-100",
          text: "text-red-500",
          ring: "ring 1 ring-red-200",
          accent: "border-red-500",
          borderTop: "border-t-red-500",
        },
      };
    case ServiceRequestStatus.DISPUTED_BY_ARTISAN:
      return {
        label: "Litige artisan",
        borderTop: "border-t-red-500",
        icon: (
          <AlertCircle className={cn("text-red-500 h-5 w-5", iconClassName)} />
        ),
        colors: {
          color: "red-500",
          bg: "bg-red-100 hover:bg-red-100",
          text: "text-red-500",
          ring: "ring 1 ring-red-200",
          accent: "border-red-500",
          borderTop: "border-t-red-500",
        },
      };
    case ServiceRequestStatus.DISPUTED_BY_BOTH:
      return {
        label: "Litige des deux parties",
        borderTop: "border-t-red-500",
        icon: (
          <AlertCircle className={cn("text-red-500 h-5 w-5", iconClassName)} />
        ),

        colors: {
          color: "red-500",
          bg: "bg-red-100 hover:bg-red-100",
          text: "text-red-500",
          ring: "ring 1 ring-red-200",
          accent: "border-red-500",
          borderTop: "border-t-red-500",
        },
      };

    case ServiceRequestStatus.RESOLVED:
      return {
        label: "Litige résolu",
        borderTop: "border-t-green-800",
        icon: (
          <CheckCircle
            className={cn("text-green-500 h-5 w-5", iconClassName)}
          />
        ),
        colors: {
          color: "green-500",
          bg: "bg-green-100 hover:bg-green-100",
          text: "text-green-700",
          ring: "ring 1 ring-green-200",
          accent: "border-green-500",
          borderTop: "border-t-green-800",
        },
      };

    case ServiceRequestStatus.CANCELLED:
      return {
        label: "Annulée",
        borderTop: "",
        icon: (
          <XCircle className={cn("text-gray-500 h-5 w-5", iconClassName)} />
        ),
        colors: {
          color: "gray-500",
          bg: "bg-gray-100 hover:bg-gray-100",
          text: "text-gray-700",
          ring: "ring 1 ring-gray-200",
          accent: "border-gray-500",
          borderTop: "border-t-gray-500",
        },
      };

    default:
      return {
        label: status,
        borderTop: "border-t-gray-400",
        icon: <PiIcon className={cn("text-gray-500 h-5 w-5", iconClassName)} />,
        colors: {
          color: "gray-500",
          bg: "bg-gray-100 hover:bg-gray-100",
          text: "text-gray-700",
          ring: "ring 1 ring-gray-200",
          accent: "border-gray-500",
          borderTop: "border-t-gray-500",
        },
      };
  }
};

export const getPriorityConfig = (
  priority: string = "normal",
  iconClassName: string = ""
) => {
  switch (priority) {
    case "urgent":
      return {
        color: "bg-rose-100 text-rose-800 hover:bg-rose-100",
        label: "Urgent",
        dotColor: "bg-rose-500",
        topBarColor: "bg-rose-500",
        icon: <Zap className={cn("text-rose-600", iconClassName)} />,
      };
    case "high":
      return {
        color: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        label: "Élevée",
        dotColor: "bg-orange-500",
        topBarColor: "bg-orange-500",
        icon: (
          <AlertTriangle className={cn("text-orange-600", iconClassName)} />
        ),
      };
    case "medium":
      return {
        color: "bg-amber-100 text-amber-800 hover:bg-amber-100",
        label: "Moyenne",
        dotColor: "bg-amber-500",
        topBarColor: "bg-amber-500",
        icon: <CircleDot className={cn("text-amber-600", iconClassName)} />,
      };
    case "low":
      return {
        color: "bg-green-100 text-green-800 hover:bg-green-100",
        label: "Faible",
        dotColor: "bg-green-500",
        topBarColor: "bg-green-500",
        icon: <Clock className={cn("text-green-600", iconClassName)} />,
      };
    case "normal":
      return {
        color: "bg-slate-100 text-slate-600 hover:bg-slate-100",
        label: "Normal",
        dotColor: "bg-slate-400",
        topBarColor: "bg-slate-400",
        icon: <CircleDot className={cn("text-slate-600", iconClassName)} />,
      };
    case "week":
      return {
        color: "bg-amber-100 text-amber-800 hover:bg-amber-100",
        label: "Cette semaine",
        dotColor: "bg-amber-500",
        topBarColor: "bg-amber-400",
        icon: <Calendar className={cn("text-amber-600", iconClassName)} />,
      };

    default:
      return {
        color: "bg-slate-100 text-slate-600 hover:bg-slate-100",
        label: "Non défini",
        dotColor: "bg-slate-400",
        topBarColor: "bg-slate-400",
        icon: <CircleDot className={cn("text-slate-600", iconClassName)} />,
      };
  }
};

export const getCategoryConfig = (
  serviceType: string | null | undefined,
  iconClassName: string
) => {
  if (!serviceType) {
    return {
      type: "Inconnu",
      icon: <FileQuestion className={cn("text-slate-700", iconClassName)} />,
      colors: {
        color: "slate-500",
        bg: "bg-slate-50",
        text: "text-slate-700",
        ring: "ring-slate-200",
        accent: "border-slate-500",
        borderTop: "border-t-slate-500",
      },
    };
  }
  if (serviceType === ServiceType.PLOMBERIE) {
    return {
      type: "Plomberie",
      icon: <LucideWrench className={cn("text-blue-700", iconClassName)} />,
      colors: {
        color: "blue-500",
        bg: "bg-blue-50",
        text: "text-blue-700",
        ring: "ring-blue-200",
        accent: "border-blue-500",
        borderTop: "border-t-blue-500",
      },
    };
  } else if (serviceType === ServiceType.ELECTRICITE) {
    return {
      type: "Electricité",
      icon: <Zap className={cn("text-amber-700", iconClassName)} />,
      colors: {
        color: "yellow-700",
        bg: "bg-amber-50",
        text: "text-amber-700",
        ring: "ring-amber-200",
        accent: "border-amber-500",
        borderTop: "border-t-amber-500",
      },
    };
  } else if (serviceType === ServiceType.PEINTURE) {
    return {
      type: "Peinture",
      icon: <PaintBucket className={cn("text-violet-700", iconClassName)} />,
      colors: {
        color: "violet-500",
        bg: "bg-violet-50",
        text: "text-violet-700",
        ring: "ring-violet-200",
        accent: "border-violet-500",
        borderTop: "border-t-violet-500",
      },
    };
  } else if (serviceType === ServiceType.MENUISERIE) {
    return {
      type: "Menuiserie",
      icon: <Fence className={cn("text-yellow-950", iconClassName)} />,
      colors: {
        color: "yellow-950",
        bg: "bg-red-800/10",
        text: "text-red-950",
        ring: "ring-red-950",
        accent: "border-red-500",
        borderTop: "border-t-yellow-950",
      },
    };
  } else if (serviceType === ServiceType.RENOVATION) {
    return {
      type: "Rénovation",
      icon: <Settings className={cn("text-orange-700", iconClassName)} />,
      colors: {
        color: "orange-500",
        bg: "bg-orange-50",
        text: "text-orange-700",
        ring: "ring-orange-200",
        accent: "border-orange-500",
        borderTop: "border-t-orange-500",
      },
    };
  } else if (serviceType === ServiceType.DEPANNAGE) {
    return {
      type: "Dépannage",
      icon: <Cog className={cn("text-gray-700", iconClassName)} />,
      colors: {
        color: "gray-500",
        bg: "bg-slate-50",
        text: "text-gray-700",
        ring: "ring-rose-200",
        accent: "border-gray-500",
        borderTop: "border-t-gray-500",
      },
    };
  } else {
    return {
      type: "Autre",
      icon: <Wrench className={cn("text-slate-700", iconClassName)} />,
      colors: {
        color: "slate-500",
        bg: "bg-slate-50",
        text: "text-slate-700",
        ring: "ring-slate-200",
        accent: "border-slate-500",
        borderTop: "border-t-slate-500",
      },
    };
  }
};

// Service configuration constants
export const SERVICE_RADIUS_KM = 1000; // Default service radius in kilometers

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Parse coordinate string in "lat,lng" format
 * @param coordinateString String in format "lat,lng"
 * @returns Object with lat and lng numbers, or null if invalid
 */
export function parseCoordinates(
  coordinateString: string | null
): { lat: number; lng: number } | null {
  if (!coordinateString || typeof coordinateString !== "string") {
    return null;
  }

  const parts = coordinateString.split(",");
  if (parts.length !== 2) {
    return null;
  }

  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());

  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  // Basic validation for valid coordinate ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
}

/**
 * Check if a service request is within the artisan's service radius
 * @param artisanCoordinates Artisan's service area coordinates as "lat,lng"
 * @param requestCoordinates Request location coordinates as "lat,lng"
 * @param radiusKm Service radius in kilometers (defaults to SERVICE_RADIUS_KM)
 * @returns true if request is within radius, false otherwise
 */
export function isWithinServiceRadius(
  artisanCoordinates: string | null,
  requestCoordinates: string | null,
  radiusKm: number = SERVICE_RADIUS_KM
): boolean {
  const artisanCoords = parseCoordinates(artisanCoordinates);
  const requestCoords = parseCoordinates(requestCoordinates);

  // If either coordinate is invalid, return false (conservative approach)
  if (!artisanCoords || !requestCoords) {
    return false;
  }

  const distance = calculateDistance(
    artisanCoords.lat,
    artisanCoords.lng,
    requestCoords.lat,
    requestCoords.lng
  );

  return distance <= radiusKm;
}

export const handleAcceptQuote = async (
  requestId: number,
  cancelUrl: string,
  estimatedPrice: number
) => {
  if (!requestId) return;
  try {
    // Calculate 30% of the estimated price (keeping in cents)
    const downPaymentAmount = Math.round(
      estimatedPrice * DOWN_PAYMENT_PERCENTAGE
    );

    const formData = new FormData();
    formData.set("amount", downPaymentAmount.toString());
    formData.set("requestId", requestId.toString());
    formData.set("cancelUrl", cancelUrl);
    await checkoutAction(formData);
  } catch (error) {
    console.error("Error accepting quote:", error);
    alert("Erreur lors de l'acceptation du devis");
  }
};

export const rejectQuote = async (
  estimateId: number,
  onSuccess?: () => void
) => {
  if (!estimateId) return;

  try {
    const response = await fetch("/api/client/billing-estimates/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estimateId: estimateId,
        action: "reject",
      }),
    });

    if (response.ok) {
      onSuccess?.();
      return response;
    } else {
      const error = await response.json();
      alert(`Erreur: ${error.error}`);
      return error;
    }
  } catch (error) {
    console.error("Error rejecting quote:", error);
    alert("Erreur lors du refus du devis");
  }
};

export const fetcher = (url: string) => fetch(url).then((res) => res.json());
