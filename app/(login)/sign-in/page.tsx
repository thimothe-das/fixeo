import { SignIn } from "@/app/(login)/sign-in/SignIn";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
