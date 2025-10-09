import { SignIn } from "@/app/(login)/sign-in/SignIn";
import { ROLES } from "@/lib/auth/roles";
import { Suspense } from "react";

export default function SignInArtisanPage() {
  return (
    <Suspense>
      <SignIn role={ROLES.PROFESSIONAL} />
    </Suspense>
  );
}
