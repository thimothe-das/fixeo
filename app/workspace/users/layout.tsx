import { isAdmin } from "@/lib/auth/roles";
import { getUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { AdminLayout } from "../(admin)/AdminLayout";

export default async function Layout({
  admin, // content from app/users/@admin
}: {
  admin: React.ReactNode;
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
