"use client";

import { ChevronRight, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const router = useRouter();

  const handleNavigation = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <nav className={`flex mb-2 ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mr-1 md:mr-3" />
            )}

            {item.current ? (
              <span className="inline-flex items-center text-sm font-medium text-gray-500">
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => handleNavigation(item.href)}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Utility function to create common breadcrumb patterns
export const createBreadcrumbs = {
  dashboard: (additionalItems: BreadcrumbItem[] = []): BreadcrumbItem[] => [
    {
      label: "Tableau de bord",
      href: "/workspace/dashboard",
      icon: <Home className="w-4 h-4" />,
    },
    ...additionalItems,
  ],

  serviceRequest: (
    requestTitle: string,
    requestId: number
  ): BreadcrumbItem[] => [
    {
      label: "Tableau de bord",
      href: "/workspace/dashboard",
      icon: <Home className="w-4 h-4" />,
    },
    {
      label: "Mes demandes",
      href: "/workspace/requests",
    },
    {
      label: requestTitle,
      current: true,
    },
  ],
};
