"use client";

import {
  BarChart3,
  Bell,
  Calculator,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  MoreHorizontal,
  Power,
  Settings,
  User,
} from "lucide-react";
import * as React from "react";
import { Suspense } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";

import { signOut } from "@/app/(login)/actions";
import { User as UserType } from "@/lib/db/schema";
import { NewRequest } from "./NewRequest";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

const sidebarItems = [
  { title: "Vue d'ensemble", icon: Home, id: "dashboard", route: "dashboard" },
  { title: "Mes demandes", icon: FileText, id: "requests", route: "requests" },
  { title: "Mes devis", icon: Calculator, id: "estimates", route: "devis" },
  {
    title: "Messages",
    icon: MessageSquare,
    id: "messages",
    route: "messages",
    disabled: true,
  },
  {
    title: "Statistiques",
    icon: BarChart3,
    id: "stats",
    route: "stats",
    disabled: true,
  },
  {
    title: "Mon compte",
    icon: User,
    id: "account",
    route: "compte",
    disabled: true,
  },
  {
    title: "Abonnement",
    icon: CreditCard,
    id: "subscription",
    route: "abonnement",
    disabled: true,
  },
];

function ServiceRequestsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = React.useState("dashboard");
  const [isActive, setIsActive] = React.useState(true);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] =
    React.useState(false);
  const router = useRouter();
  // Real API calls
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequest[]>("/api/service-requests/client", fetcher);
  const { data: user } = useSWR<UserType>("/api/user", fetcher);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-blue-600">Fixéo</h2>
                <p className="text-sm text-gray-600">Espace client</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <NewRequest
              isModal
              onRequestCreated={() => {
                mutateRequests();
              }}
            />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem
                      key={item.id}
                      onClick={() => router.push(`/workspace/${item.route}`)}
                    >
                      <SidebarMenuButton
                        isActive={pathname === `/workspace/${item.route}`}
                        className="w-full justify-start cursor-pointer"
                        disabled={item.disabled}
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
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
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
                <Button variant="ghost" size="sm" disabled>
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto bg-gray-50 relative">
            <Suspense fallback={<ServiceRequestsListSkeleton />}>
              {children}
            </Suspense>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
