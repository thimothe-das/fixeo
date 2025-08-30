"use client";

import * as React from "react";
import { Suspense, useState } from "react";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  Plus,
  Bell,
  FileText,
  CreditCard,
  BarChart3,
  MoreHorizontal,
  Power,
  Search,
  Calculator,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useSWR from "swr";

// Import the separate components
import { ClientOverviewComponent } from "./ClientOverviewComponent";
import { ClientRequestsListComponent } from "./ClientRequestsListComponent";
import { ClientNewRequestComponent } from "./ClientNewRequestComponent";
import { ClientMessagesComponent } from "./ClientMessagesComponent";
import ClientStatsComponent from "./ClientStatsComponent";
import { ClientEstimatesComponent } from "./ClientEstimatesComponent";
import { AccountComponent } from "../components/AccountComponent";
import { SubscriptionComponent } from "../components/SubscriptionComponent";
import { ServiceRequestStatus } from "@/lib/db/schema";

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
  { title: "Vue d'ensemble", icon: Home, id: "dashboard" },
  { title: "Mes demandes", icon: FileText, id: "requests" },
  { title: "Mes devis", icon: Calculator, id: "estimates" },
  { title: "Messages", icon: MessageSquare, id: "messages" },
  { title: "Statistiques", icon: BarChart3, id: "stats" },
  { title: "Mon compte", icon: User, id: "account" },
  { title: "Abonnement", icon: CreditCard, id: "subscription" },
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

export function ClientDashboard() {
  const [activeSection, setActiveSection] = React.useState("dashboard");
  const [isActive, setIsActive] = React.useState(true);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] =
    React.useState(false);

  // Real API calls
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequest[]>("/api/service-requests/client", fetcher);

  const pendingRequests =
    requests?.filter(
      (req) =>
        req.status === ServiceRequestStatus.AWAITING_ASSIGNATION ||
        req.status === ServiceRequestStatus.AWAITING_ESTIMATE
    ) || [];
  const activeRequests =
    requests?.filter((req) =>
      [ServiceRequestStatus.IN_PROGRESS].includes(
        req.status as ServiceRequestStatus
      )
    ) || [];
  const completedRequests =
    requests?.filter((req) => req.status === ServiceRequestStatus.COMPLETED) ||
    [];
  const disputedRequests =
    requests?.filter((req) =>
      [
        ServiceRequestStatus.DISPUTED_BY_CLIENT,
        ServiceRequestStatus.DISPUTED_BY_ARTISAN,
        ServiceRequestStatus.DISPUTED_BY_BOTH,
      ].includes(req.status as ServiceRequestStatus)
    ) || [];
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <ClientOverviewComponent
            totalRequests={requests?.length || 0}
            disputedRequests={disputedRequests.length}
            pendingRequests={pendingRequests.length}
            activeRequests={activeRequests.length}
            completedRequests={completedRequests.length}
            recentRequests={requests?.slice(0, 3) || []}
            onNavigateToSection={setActiveSection}
            openNewRequestModal={() => setIsNewRequestModalOpen(true)}
            onViewRequestDetails={(requestId) => {
              // Navigate to requests section and potentially highlight the specific request
              setActiveSection("requests");
              // You could add logic here to scroll to or highlight the specific request
              console.log(`Viewing details for request ${requestId}`);
            }}
          />
        );
      case "requests":
        return (
          <ClientRequestsListComponent
            requests={requests || []}
            onViewEstimate={(estimateId) => {
              // Navigate to estimates section and show specific estimate
              setActiveSection("estimates");
              // You could add a way to highlight/open specific estimate here
            }}
            onRequestUpdate={mutateRequests}
          />
        );
      case "estimates":
        return (
          <ClientEstimatesComponent
            onEstimateResponse={() => {
              mutateRequests(); // Refresh requests when estimate is responded to
            }}
          />
        );
      case "messages":
        return <ClientMessagesComponent />;
      case "stats":
        return <ClientStatsComponent requests={requests || []} />;
      case "account":
        return (
          <AccountComponent isActive={isActive} setIsActive={setIsActive} />
        );
      case "subscription":
        return <SubscriptionComponent />;
      default:
        return (
          <ClientOverviewComponent
            totalRequests={requests?.length || 0}
            disputedRequests={disputedRequests.length}
            pendingRequests={pendingRequests.length}
            activeRequests={activeRequests.length}
            completedRequests={completedRequests.length}
            recentRequests={requests?.slice(0, 3) || []}
            onNavigateToSection={setActiveSection}
            openNewRequestModal={() => setIsNewRequestModalOpen(true)}
            onViewRequestDetails={(requestId) => {
              // Navigate to requests section and potentially highlight the specific request
              setActiveSection("requests");
              // You could add logic here to scroll to or highlight the specific request
              console.log(`Viewing details for request ${requestId}`);
            }}
          />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-blue-600">Fixéo</h2>
                <p className="text-sm text-gray-600">Espace client</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            {/* New Request Button */}
            <div className="mb-6">
              <Dialog
                open={isNewRequestModalOpen}
                onOpenChange={setIsNewRequestModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle demande
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Créer une nouvelle demande
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Décrivez votre besoin et recevez des devis personnalisés
                      de nos artisans qualifiés.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-6">
                    <ClientNewRequestComponent
                      onRequestCreated={() => {
                        mutateRequests();
                        setIsNewRequestModalOpen(false);
                        setActiveSection("requests");
                      }}
                      isModal={true}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

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
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Marie Dubois</p>
                <p className="text-sm text-gray-600 truncate">Client</p>
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

          <main className="flex-1 p-6 overflow-auto bg-gray-50 relative">
            <Suspense fallback={<ServiceRequestsListSkeleton />}>
              {renderContent()}
            </Suspense>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
