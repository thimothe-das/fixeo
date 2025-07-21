import { Suspense } from "react";
import { LoginComponent } from "../loginComponent";

export default function SignInPage() {
  return (
    <Suspense>
      <LoginComponent mode="signin" />
    </Suspense>
  );
}
