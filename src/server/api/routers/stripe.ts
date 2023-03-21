import { env } from '@/env.mjs';
import { getOrCreateStripeCustomerIdForUser } from '@/server/stripe/stripe-webhook-handlers';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { z } from 'zod';

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(z.object({ plan: z.string(), subscriptionInterval: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { stripe, session, prisma, req } = ctx;
      const { plan, subscriptionInterval } = input;

      const customerId = await getOrCreateStripeCustomerIdForUser({
        prisma,
        stripe,
        userId: session.user?.id,
      });

      if (!customerId) {
        throw new Error('Could not create customer');
      }

      const baseUrl =
        env.NODE_ENV === 'development'
          ? `http://${req.headers.host ?? 'localhost:3000'}`
          : `https://${req.headers.host ?? env.NEXTAUTH_URL}`;

      const lineItems = [];

      if (plan === 'hangout') {
        if (subscriptionInterval === 'monthly') {
          lineItems.push({
            price: env.STRIPE_HANGOUT_MONTHLY_PRICE_ID,
            quantity: 1,
          });
        } else if (subscriptionInterval === 'annual') {
          lineItems.push({
            price: env.STRIPE_HANGOUT_ANNUAL_PRICE_ID,
            quantity: 1,
          });
        } else {
          throw new Error('Invalid subscription interval');
        }
      } else if (plan === 'community') {
        if (subscriptionInterval === 'monthly') {
          lineItems.push({
            price: env.STRIPE_COMMUNITY_MONTHLY_PRICE_ID,
            quantity: 1,
          });
        } else if (subscriptionInterval === 'annual') {
          lineItems.push({
            price: env.STRIPE_COMMUNITY_ANNUAL_PRICE_ID,
            quantity: 1,
          });
        } else {
          throw new Error('Invalid subscription interval');
        }
      } else if (plan === 'enterprise') {
        if (subscriptionInterval === 'monthly') {
          lineItems.push({
            price: env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
            quantity: 1,
          });
        } else if (subscriptionInterval === 'annual') {
          lineItems.push({
            price: env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
            quantity: 1,
          });
        } else {
          throw new Error('Invalid subscription interval');
        }
      } else {
        throw new Error('Invalid plan');
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        client_reference_id: session.user?.id,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: lineItems,
        success_url: `${baseUrl}/dashboard/billing/?checkoutSuccess=true`,
        cancel_url: `${baseUrl}/dashboard/billing/?checkoutCanceled=true`,
        subscription_data: {
          metadata: {
            userId: session.user?.id,
            plan: plan,
            subscriptionInterval: subscriptionInterval,
          },
        },
      });

      if (!checkoutSession) {
        throw new Error('Could not create checkout session');
      }

      return { checkoutUrl: checkoutSession.url };
    }),
  createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, session, prisma, req } = ctx;

    const customerId = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });

    if (!customerId) {
      throw new Error('Could not create customer');
    }

    const baseUrl =
      env.NODE_ENV === 'development'
        ? `http://${req.headers.host ?? 'localhost:3000'}`
        : `https://${req.headers.host ?? env.NEXTAUTH_URL}`;

    const stripeBillingPortalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/billing`,
    });

    if (!stripeBillingPortalSession) {
      throw new Error('Could not create billing portal session');
    }

    return { billingPortalUrl: stripeBillingPortalSession.url };
  }),
});
