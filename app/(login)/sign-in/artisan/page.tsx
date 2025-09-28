import { Suspense } from "react";
import { LoginComponent } from "../../sign-up/SignUp";

export default function SignInArtisanPage() {
  return (
    <Suspense>
      <LoginComponent mode="signin" role="artisan" />
    </Suspense>
  );
}
