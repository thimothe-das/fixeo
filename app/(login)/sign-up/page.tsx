import { Suspense } from "react";
import { SignUpRoleSelection } from "./SignUpRoleSelection";

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpRoleSelection mode="signup" />
    </Suspense>
  );
}
