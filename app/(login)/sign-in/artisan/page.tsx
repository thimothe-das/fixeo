import { SignIn } from "@/app/(login)/sign-in/SignIn";
import { Suspense } from "react";

export default function SignInArtisanPage() {
  return (
    <Suspense>
      <SignIn role="artisan" />
    </Suspense>
  );
}
