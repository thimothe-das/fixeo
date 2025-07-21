import { Suspense } from "react";
import { LoginComponent } from "../../loginComponent";

export default function SignUpClientPage() {
  return (
    <Suspense>
      <LoginComponent mode="signup" role="client" />
    </Suspense>
  );
}
