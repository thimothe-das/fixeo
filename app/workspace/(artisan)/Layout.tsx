import { redirect } from "next/navigation";
import { getUser } from "@/lib/db/queries";
import { ROLES, isProfessional } from "@/lib/auth/roles";
import { ArtisanLayout } from "./ArtisanLayout";

export default async function ArtisanProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current user
  const user = await getUser();

  // If no user is found, redirect to sign-in
  if (!user) {
    redirect("/sign-in?redirect=/workspace");
  }

  // Check if user has PROFESSIONAL role (artisan)
  if (!isProfessional(user.role)) {
    // Redirect based on user role
    if (user.role === ROLES.ADMIN) {
      redirect("/workspace"); // Admin has their own workspace
    } else if (user.role === ROLES.CLIENT || user.role === ROLES.MEMBER) {
      redirect("/workspace"); // Clients have their own workspace
    } else {
      redirect("/sign-in?error=access-denied");
    }
  }

  // If user is a professional/artisan, render the artisan layout
  return <ArtisanLayout>{children}</ArtisanLayout>;
}
