import { isAdmin } from "@/lib/auth/roles";
import { getUser } from "@/lib/db/queries/common";
import { redirect } from "next/navigation";
import { AdminLayout } from "../(admin)/AdminLayout";

export default async function Layout({
  admin, // content from app/users/@admin
  artisan, // parallel route (unused in admin-only section)
  client, // parallel route (unused in admin-only section)
  children,
}: {
  admin: React.ReactNode;
  artisan: React.ReactNode;
  client: React.ReactNode;
  children?: React.ReactNode;
}) {
  const user = await getUser();

  // If no user is found, redirect to sign-in
  if (!user) {
    redirect("/sign-in?redirect=/workspace");
  }

  // Users management is admin-only
  if (!isAdmin(user.role)) {
    redirect("/workspace/dashboard");
  }

  return <AdminLayout>{admin}</AdminLayout>;
}
