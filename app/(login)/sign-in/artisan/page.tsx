import { Suspense } from "react";
import { LoginComponent } from "../../loginComponent";

export default function SignInArtisanPage() {
  return (
    <Suspense>
      <LoginComponent mode="signin" role="artisan" />
    </Suspense>
  );
}
