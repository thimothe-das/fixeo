"use client";

import * as React from "react";
import { Suspense, useState } from "react";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  Shield,
  Bell,
  FileText,
  CreditCard,
  BarChart3,
  MoreHorizontal,
  Power,
  Users,
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
import useSWR from "swr";

// Import the admin components
import { AdminOverviewComponent } from "./AdminOverviewComponent";
import { AdminRequestsComponent } from "./AdminRequestsComponent";
import { AdminUsersComponent } from "./AdminUsersComponent";
import { AdminStatsComponent } from "./AdminStatsComponent";
import { AccountComponent } from "../components/AccountComponent";
import { SubscriptionComponent } from "../components/SubscriptionComponent";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

import type { ServiceRequestForAdmin, AdminStats } from "../components/types";

const sidebarItems = [
  { title: "Vue d'ensemble", icon: Home, id: "overview" },
  { title: "Demandes", icon: FileText, id: "requests" },
  { title: "Utilisateurs", icon: Users, id: "users" },
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

export function AdminDashboard() {
  const [activeSection, setActiveSection] = React.useState("overview");
  const [isActive, setIsActive] = React.useState(true);

  // Real API calls
  const {
    data: requests,
    error: requestsError,
    mutate: mutateRequests,
  } = useSWR<ServiceRequestForAdmin[]>("/api/admin/service-requests", fetcher);
  const { data: stats } = useSWR<AdminStats>("/api/admin/stats", fetcher);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <AdminOverviewComponent
            stats={stats}
            recentRequests={requests || []}
            onNavigateToSection={setActiveSection}
          />
        );
      case "requests":
        return (
          <AdminRequestsComponent
            requests={requests || []}
            onRequestsUpdate={mutateRequests}
          />
        );
      case "users":
        return <AdminUsersComponent />;
      case "stats":
        return <AdminStatsComponent stats={stats} />;
      case "account":
        return (
          <AccountComponent isActive={isActive} setIsActive={setIsActive} />
        );
      case "subscription":
        return <SubscriptionComponent />;
      default:
        return (
          <AdminOverviewComponent
            stats={stats}
            recentRequests={requests || []}
            onNavigateToSection={setActiveSection}
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
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-red-600">Fixéo</h2>
                <p className="text-sm text-gray-600">Administration</p>
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
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Administrateur</p>
                <p className="text-sm text-gray-600 truncate">Admin</p>
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
