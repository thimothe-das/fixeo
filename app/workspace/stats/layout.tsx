import { ClientLayout } from "../(client)/ClientLayout";
import { ArtisanLayout } from "../(artisan)/ArtisanLayout";
import { isAdmin, isClient, isProfessional, ROLES } from "@/lib/auth/roles";
import { getUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { AdminLayout } from "../(admin)/AdminLayout";

export default async function Layout({
  client, // content from app/dashboard/@client
  artisan, // content from app/dashboard/@artisan
  admin, // content from app/dashboard/@admin
}: {
  client: React.ReactNode;
  artisan: React.ReactNode;
  admin: React.ReactNode;
}) {
  const user = await getUser();
  // If no user is found, redirect to sign-in
  if (!user) {
    redirect("/sign-in?redirect=/workspace");
  }

  // Check if user has PROFESSIONAL role (artisan)
  if (!user) return redirect("/sign-in?error=access-denied");
  if (
    !isProfessional(user.role) &&
    !isClient(user.role) &&
    !isAdmin(user.role)
  ) {
    redirect("/");
  }

  if (user?.role === ROLES.CLIENT) {
    return <ClientLayout>{client}</ClientLayout>;
  }
  if (user?.role === ROLES.PROFESSIONAL) {
    return <ArtisanLayout>{artisan}</ArtisanLayout>;
  }
  if (user?.role === ROLES.ADMIN) {
    return <AdminLayout>{admin}</AdminLayout>;
  }
  return null;
}
