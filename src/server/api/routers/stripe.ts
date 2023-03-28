import { env } from '@/env.mjs';
import { getOrCreateStripeCustomerIdForUser } from '@/server/stripe/stripe-webhook-handlers';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { z } from 'zod';
import { getCreditsForProduct, monthlyToMonthlyUpdate } from '@/server/helpers/payments';

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(z.object({ selectedPriceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { stripe, session, prisma, req } = ctx;
      const { selectedPriceId } = input;

      const customer = await getOrCreateStripeCustomerIdForUser({
        prisma,
        stripe,
        userId: session.user?.id,
      });
      const customerId = customer?.customerId;

      if (!customerId) {
        throw new Error('Could not create customer');
      }

      const baseUrl =
        env.NODE_ENV === 'development'
          ? `http://${req.headers.host ?? 'localhost:3000'}`
          : `https://${req.headers.host ?? env.NEXTAUTH_URL}`;

      const lineItems = [
        {
          price: selectedPriceId,
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

    const customer = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });
    const customerId = customer?.customerId;

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
  upgradeOrDowngradeSubscription: protectedProcedure
    .input(z.object({ selectedPriceId: z.string(), swapImmediately: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { stripe, session, prisma } = ctx;
      const { selectedPriceId, swapImmediately } = input;

      const customer = await getOrCreateStripeCustomerIdForUser({
        prisma,
        stripe,
        userId: session.user?.id,
      });
      const customerId = customer?.customerId;
      const subscriptionId = customer?.activeSubscription?.id;
      const credits = customer?.credits;
      const currentProduct = customer?.activeSubscription?.price?.product;

      if (!customerId || !subscriptionId || !credits || !currentProduct) {
        throw new Error('Could not find subscription');
      }

      // get the product credits
      const currentProductCredits = getCreditsForProduct(currentProduct.id);

      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (!stripeSubscription) {
        throw new Error('Could not find subscription');
      }

      const currentPrice = await stripe.prices.retrieve(stripeSubscription.items.data[0].price.id);
      const newPrice = await stripe.prices.retrieve(selectedPriceId);

      if (!currentPrice || !newPrice) {
        throw new Error('Could not find price details');
      }

      const currentPriceAmount = currentPrice.unit_amount / 100;
      const currentPriceType = currentPrice.recurring.interval;
      const newPriceType = newPrice.recurring.interval;

      const subscriptionChangeType = `${currentPriceType}To${newPriceType
        .charAt(0)
        .toUpperCase()}${newPriceType.slice(1)}`;

      switch (subscriptionChangeType) {
        case 'monthlyToMonthly':
          const stripeSubscriptionUpdated = monthlyToMonthlyUpdate(
            customerId,
            subscriptionId,
            priceId,
            stripeSubscription,
            swapImmediately,
            credits,
            currentProductCredits,
            currentPriceAmount
          );
          return stripeSubscriptionUpdated;
          break;
        case 'monthlyToAnnual':
          // Add your custom logic for monthly to annual update
          break;
        case 'annualToMonthly':
          // Add your custom logic for annual to monthly update
          break;
        case 'annualToAnnual':
          // Add your custom logic for annual to annual update
          break;
        default:
          throw new Error('Invalid subscription change type');
      }
    }),
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, session, prisma } = ctx;

    const customer = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });
    const customerId = customer?.customerId;
    const subscriptionId = customer?.activeSubscription?.id;

    if (!customerId || !subscriptionId) {
      throw new Error('Could not find subscription');
    }

    const stripeSubscriptionCanceled = await stripe.subscriptions.del(subscriptionId);

    if (!stripeSubscriptionCanceled) {
      throw new Error('Could not cancel subscription');
    }

    return stripeSubscriptionCanceled;
  }),
  getCreditsForProduct: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(({ input }) => {
      const { productId } = input;

      const credits = getCreditsForProduct(productId);

      return credits;
    }),
});
