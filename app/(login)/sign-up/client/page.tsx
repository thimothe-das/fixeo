import { Suspense } from "react";
import { SignUp } from "../SignUp";

export default function SignUpClientPage() {
  return (
    <Suspense>
      <SignUp role="client" />
    </Suspense>
  );
}
