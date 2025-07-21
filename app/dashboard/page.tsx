"use client";

import { Suspense } from "react";
import { ClientDashboard } from "./components/ClientDashboard";
import { ArtisanDashboard } from "./components/ArtisanDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/lib/db/schema";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="h-[300px]">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardContent() {
  const { data: user, error } = useSWR<User>("/api/user", fetcher);
  const router = useRouter();

  useEffect(() => {
    if (error || (!user && error !== undefined)) {
      // User not authenticated, redirect to sign-in
      router.push("/sign-in?redirect=dashboard");
    }
  }, [user, error, router]);

  if (error || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Redirecting to sign-in...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show role-based dashboard for authenticated users
  if (user.role === "professional") {
    return <ArtisanDashboard />;
  } else {
    return <ClientDashboard />;
  }
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
