"use server";

import { withTeam } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { createCheckoutSession, createCustomerPortalSession } from "./stripe";

export const checkoutAction = async (formData: FormData) => {
  const amount = formData.get("amount") as string;
  const guestToken = formData.get("guestToken") as string;
  const requestId = formData.get("requestId") as string;
  const cancelUrl = formData.get("cancelUrl") as string;

  if (!amount) {
    throw new Error("Amount is required");
  }

  await createCheckoutSession({
    amount: parseInt(amount),
    guestToken,
    requestId,
    cancelUrl,
  });
};

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
