import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ServiceRequestStatus } from "./db/schema";
import {
  LucideWrench,
  PaintBucket,
  Settings,
  Zap,
  Laptop,
  Hammer,
  Car,
  Wifi,
  Home,
  Wrench,
  AlertCircle,
  Shield,
  Fence,
  Cog,
} from "lucide-react";

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

export const getStatusConfig = (status: string) => {
  switch (status) {
    case ServiceRequestStatus.AWAITING_ESTIMATE:
      return {
        color: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
        label: "En attente de devis",
        borderTop: "border-t-slate-200",
      };
    case ServiceRequestStatus.AWAITING_ASSIGNATION:
      return {
        color: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200",
        label: "En attente d'assignation",
        borderTop: "border-t-yellow-200",
      };
    case ServiceRequestStatus.IN_PROGRESS:
      return {
        color: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
        label: "En cours",
        borderTop: "border-t-blue-600",
      };
    case ServiceRequestStatus.CLIENT_VALIDATED:
      return {
        color: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
        label: "Client validé",
        borderTop: "border-t-orange-500",
      };
    case ServiceRequestStatus.ARTISAN_VALIDATED:
      return {
        color: "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200",
        label: "Artisan validé",
        borderTop: "border-t-cyan-800",
      };
    case ServiceRequestStatus.COMPLETED:
      return {
        color: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
        label: "Terminée",
        borderTop: "border-t-green-500",
      };
    case ServiceRequestStatus.DISPUTED_BY_CLIENT:
      return {
        color: "bg-red-100 text-red-700 ring-1 ring-red-200",
        label: "Litige client",
        borderTop: "border-t-red-500",
      };
    case ServiceRequestStatus.DISPUTED_BY_ARTISAN:
      return {
        color: "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
        label: "Litige artisan",
        borderTop: "border-t-red-500",
      };
    case ServiceRequestStatus.DISPUTED_BY_BOTH:
      return {
        color: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
        label: "Litige des deux parties",
        borderTop: "border-t-red-500",
      };
    case ServiceRequestStatus.RESOLVED:
      return {
        color: "bg-green-100 text-green-700 ring-1 ring-green-200",
        label: "Litige résolu",
        borderTop: "border-t-green-800",
      };
    case ServiceRequestStatus.CANCELLED:
      return {
        color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
        label: "Annulée",
        borderTop: "",
      };

    default:
      return {
        color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
        label: status,
      };
  }
};

export const getServiceTypeIcon = (category: string): string => {
  const icons: Record<string, string> = {
    plumbing: "Wrench",
    electricity: "Zap",
    painting: "Paintbrush",
    carpentry: "Hammer",
  };
  return icons[category] || "Wrench";
};

export const getStatusBadgeColor = (category: string): string => {
  const colors: Record<string, string> = {
    plumbing: "border-t-blue-500",
    electricity: "border-t-yellow-500",
    painting: "border-t-amber-700",
    carpentry: "border-t-indigo-500",
    tiling: "border-t-orange-500",
  };
  return colors[category] || "border-t-gray-400";
};

export const getPriorityConfig = (priority: string = "normal") => {
  switch (priority) {
    case "high":
      return {
        color: "bg-rose-100 text-rose-800",
        label: "Urgent",
        dotColor: "bg-rose-500",
        topBarColor: "bg-rose-500",
      };
    case "low":
      return {
        color: "bg-slate-100 text-slate-600",
        label: "Faible",
        dotColor: "bg-slate-400",
        topBarColor: "bg-slate-400",
      };
    default:
      return {
        color: "bg-amber-100 text-amber-800",
        label: "Normal",
        dotColor: "bg-amber-500",
        topBarColor: "bg-amber-500",
      };
  }
};

export const getCategoryConfig = (
  serviceType: string,
  iconClassName: string
) => {
  if (serviceType === ServiceType.PLOMBERIE) {
    return {
      type: ServiceType.PLOMBERIE,
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
      type: ServiceType.ELECTRICITE,
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
      type: ServiceType.PEINTURE,
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
      type: ServiceType.MENUISERIE,
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
      type: ServiceType.RENOVATION,
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
      type: ServiceType.DEPANNAGE,
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
      type: "default",
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
