import { env } from '@/env.mjs';
import { getOrCreateStripeCustomerIdForUser } from '@/server/stripe/stripe-webhook-handlers';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { z } from 'zod';

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(z.object({ priceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { stripe, session, prisma, req } = ctx;
      const { priceId } = input;

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

      const lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ];

      try {
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
            },
          },
        });

        if (!checkoutSession) {
          throw new Error('Could not create checkout session');
        }

        return { checkoutUrl: checkoutSession.url };
      } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error('Error creating checkout session:', error.message);
        throw new Error('Could not create checkout session');
      }
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

  getActiveProductsWithPrices: protectedProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const products = await prisma.product.findMany({
      where: {
        active: true,
        Price: {
          some: {
            active: true,
          },
        },
      },
      orderBy: {
        metadata: 'asc',
      },
      include: {
        Price: {
          where: {
            active: true,
          },
          orderBy: {
            unit_amount: 'asc',
          },
        },
      },
    });

    return products;
  }),
});
