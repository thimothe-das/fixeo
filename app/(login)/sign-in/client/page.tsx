import { Suspense } from "react";
import { LoginComponent } from "../../sign-up/SignUp";

export default function SignInClientPage() {
  return (
    <Suspense>
      <LoginComponent mode="signin" role="client" />
    </Suspense>
  );
}
