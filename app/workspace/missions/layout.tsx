import { isProfessional } from "@/lib/auth/roles";
import { getUser } from "@/lib/db/queries/common";
import { redirect } from "next/navigation";
import { ArtisanLayout } from "../(artisan)/ArtisanLayout";

export default async function Layout({
  artisan, // content from app/missions/@artisan
}: {
  artisan: React.ReactNode;
}) {
  const user = await getUser();

  // If no user is found, redirect to sign-in
  if (!user) {
    redirect("/sign-in?redirect=/workspace");
  }

  // Missions are only accessible to artisans (professionals)
  if (!isProfessional(user.role)) {
    redirect("/workspace/dashboard");
  }

  return <ArtisanLayout>{artisan}</ArtisanLayout>;
}
