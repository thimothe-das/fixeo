import { Toaster } from "@/components/ui/toaster";
import { getTeamForUser, getUser } from "@/lib/db/queries/common";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { SWRConfig } from "swr";
import Header from "./components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fixéo",
  description: "Fixéo est une plateforme de réservation d'artisans.",
};

export const viewport: Viewport = {
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${GeistSans.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              "/api/user": getUser(),
              "/api/team": getTeamForUser(),
            },
          }}
        >
          <Header />
          {children}
        </SWRConfig>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
