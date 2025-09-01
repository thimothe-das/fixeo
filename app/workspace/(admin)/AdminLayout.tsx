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
  Euro,
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
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

import type { ServiceRequestForAdmin, AdminStats } from "../components/types";
import { Dashboard } from "../dashboard/@admin/Dashboard";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(login)/actions";

const sidebarItems = [
  {
    title: "Vue d'ensemble",
    icon: Home,
    id: "dashboard",
    route: "dashboard",
    disabled: false,
  },
  {
    title: "Demandes",
    icon: FileText,
    id: "requests",
    route: "requests",
    disabled: false,
  },
  { title: "Utilisateurs", icon: Users, id: "users", route: "users" },
  {
    title: "Devis",
    icon: Calculator,
    id: "estimatedBills",
    route: "devis",
    disabled: false,
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

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState("dashboard");
  const pathname = usePathname();

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
                        disabled={item.disabled}
                        onClick={() => router.push(`/workspace/${item.route}`)}
                        isActive={pathname === `/workspace/${item.route}`}
                        className="w-full justify-start cursor-pointer"
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
                  <DropdownMenuItem
                    onClick={() => router.push("/workspace/dashboard")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>Paramètres</DropdownMenuItem>
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

          <main className="flex-1 overflow-auto">
            <Suspense fallback={<ServiceRequestsListSkeleton />}>
              {children}
            </Suspense>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
