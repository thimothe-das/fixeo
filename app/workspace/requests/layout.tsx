import { isAdmin, isClient, isProfessional, ROLES } from "@/lib/auth/roles";
import { getUser } from "@/lib/db/queries/common";
import { redirect } from "next/navigation";
import { AdminLayout } from "../(admin)/AdminLayout";
import { ClientLayout } from "../(client)/ClientLayout";

export default async function Layout({
  children,
  client, // content from app/workspace/requests/@client
  admin, // content from app/workspace/requests/@admin
}: {
  children?: React.ReactNode;
  client: React.ReactNode;
  admin: React.ReactNode;
}) {
  const user = await getUser();
  // If no user is found, redirect to sign-in
  if (!user) {
    redirect("/sign-in?redirect=/workspace");
  }

  // Check if user has required role
  if (!user) return redirect("/sign-in?error=access-denied");
  if (
    !isProfessional(user.role) &&
    !isClient(user.role) &&
    !isAdmin(user.role)
  ) {
    redirect("/");
  }

  // Artisans don't have a parallel route view for requests, redirect to jobs
  if (user?.role === ROLES.PROFESSIONAL) {
    redirect("/workspace/jobs");
  }

  if (user?.role === ROLES.CLIENT) {
    return <ClientLayout>{client}</ClientLayout>;
  }

  if (user?.role === ROLES.ADMIN) {
    return <AdminLayout>{admin}</AdminLayout>;
  }

  return null;
}
