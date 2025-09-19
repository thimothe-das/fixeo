'use server';

import { withTeam } from '@/lib/auth/middleware';
import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';

export const checkoutAction = async (formData: FormData) => {
  const priceId = formData.get('priceId') as string;
  const guestToken = formData.get('guestToken') as string; // Get guest token from form data
  await createCheckoutSession({ priceId, guestToken });
};

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
