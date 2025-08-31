import { clsx, type ClassValue } from "clsx";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cog,
  Fence,
  Flag,
  LucideWrench,
  PaintBucket,
  PiIcon,
  Settings,
  UserCheck,
  Wrench,
  XCircle,
  Zap,
  Calendar,
  CircleDot,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ServiceRequestStatus } from "./db/schema";

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

export const getStatusConfig = (status: string, iconClassName: string) => {
  switch (status) {
    case ServiceRequestStatus.AWAITING_ESTIMATE:
      return {
        color:
          "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100",
        label: "En attente de devis",
        borderTop: "border-t-slate-200",
        icon: (
          <Clock className={cn("mr-2 h-5 w-5 text-gray-500", iconClassName)} />
        ),
      };
    case ServiceRequestStatus.AWAITING_ASSIGNATION:
      return {
        color:
          "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200 hover:bg-yellow-100",
        label: "En attente d'assignation",
        borderTop: "border-t-yellow-200",
        icon: (
          <Clock
            className={cn("mr-2 h-5 w-5 text-yellow-500", iconClassName)}
          />
        ),
      };
    case ServiceRequestStatus.IN_PROGRESS:
      return {
        color:
          "bg-blue-100 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100",
        label: "En cours",
        borderTop: "border-t-blue-600",
        icon: (
          <Clock className={cn("mr-2 h-5 w-5 text-blue-500", iconClassName)} />
        ),
      };
    case ServiceRequestStatus.CLIENT_VALIDATED:
      return {
        color:
          "bg-orange-100 text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100",
        label: "À valider",
        borderTop: "border-t-orange-500",
        icon: (
          <Flag className={cn("mr-2 h-5 w-5 text-orange-500", iconClassName)} />
        ),
      };
    case ServiceRequestStatus.ARTISAN_VALIDATED:
      return {
        color:
          "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200 hover:bg-cyan-100",
        label: "Validée",
        borderTop: "border-t-cyan-800",
        icon: (
          <UserCheck
            className={cn("mr-2 h-5 w-5 text-cyan-500", iconClassName)}
          />
        ),
      };
    case ServiceRequestStatus.COMPLETED:
      return {
        color:
          "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100",
        label: "Terminée",
        borderTop: "border-t-green-500",
        icon: (
          <CheckCircle
            className={cn("mr-2 h-5 w-5 text-emerald-500", iconClassName)}
          />
        ),
      };
    case ServiceRequestStatus.DISPUTED_BY_CLIENT:
      return {
        color: "bg-red-100 text-red-700 ring-1 ring-red-200 hover:bg-red-100",
        label: "Litige client",
        borderTop: "border-t-red-500",
        icon: (
          <AlertTriangle
            className={cn("mr-2  h-5 w-5 text-red-500", iconClassName)}
          />
        ),
      };
    case ServiceRequestStatus.DISPUTED_BY_ARTISAN:
      return {
        color:
          "bg-orange-100 text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100",
        label: "Litige artisan",
        borderTop: "border-t-red-500",
        icon: (
          <AlertCircle
            className={cn("mr-2 h-5 w-5 text-red-500", iconClassName)}
          />
        ),
      };
    case ServiceRequestStatus.DISPUTED_BY_BOTH:
      return {
        color:
          "bg-purple-100 text-purple-700 ring-1 ring-purple-200 hover:bg-purple-100",
        label: "Litige des deux parties",
        borderTop: "border-t-red-500",
        icon: (
          <AlertCircle
            className={cn("mr-2 h-5 w-5 text-red-500", iconClassName)}
          />
        ),
      };
    case ServiceRequestStatus.RESOLVED:
      return {
        color:
          "bg-green-100 text-green-700 ring-1 ring-green-200 hover:bg-green-100",
        label: "Litige résolu",
        borderTop: "border-t-green-800",
        icon: (
          <CheckCircle
            className={cn("mr-2 h-5 w-5 text-green-500", iconClassName)}
          />
        ),
      };
    case ServiceRequestStatus.CANCELLED:
      return {
        color:
          "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100",
        label: "Annulée",
        borderTop: "",
        icon: (
          <XCircle
            className={cn("mr-2 h-5 w-5 text-gray-500", iconClassName)}
          />
        ),
      };

    default:
      return {
        color:
          "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100",
        label: status,
        borderTop: "border-t-gray-400",
        icon: (
          <PiIcon className={cn("mt-2 h-5 w-5 text-gray-500", iconClassName)} />
        ),
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
  serviceType: string,
  iconClassName: string
) => {
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
