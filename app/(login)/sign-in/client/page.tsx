import { Suspense } from "react";
import { LoginComponent } from "../../loginComponent";

export default function SignInClientPage() {
  return (
    <Suspense>
      <LoginComponent mode="signin" role="client" />
    </Suspense>
  );
}
