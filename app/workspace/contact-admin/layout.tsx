import { isClient, isProfessional, ROLES } from "@/lib/auth/roles";
import { getUser } from "@/lib/db/queries/common";
import { redirect } from "next/navigation";
import { ArtisanLayout } from "../(artisan)/ArtisanLayout";
import { ClientLayout } from "../(client)/ClientLayout";

export default async function Layout({
  client, // content from app/contact-admin/@client
  artisan, // content from app/contact-admin/@artisan
}: {
  client: React.ReactNode;
  artisan: React.ReactNode;
}) {
  const user = await getUser();
  // If no user is found, redirect to sign-in
  if (!user) {
    redirect("/sign-in?redirect=/workspace");
  }

  // Check if user has CLIENT or PROFESSIONAL role
  if (!isProfessional(user.role) && !isClient(user.role)) {
    redirect("/workspace/dashboard");
  }

  if (user?.role === ROLES.CLIENT) {
    return <ClientLayout>{client}</ClientLayout>;
  }
  if (user?.role === ROLES.PROFESSIONAL) {
    return <ArtisanLayout>{artisan}</ArtisanLayout>;
  }
  return null;
}

