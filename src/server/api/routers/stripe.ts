import { env } from '@/env.mjs';
import { getOrCreateStripeCustomerIdForUser } from '@/server/stripe/stripe-webhook-handlers';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { z } from 'zod';
import {
  annualToAnnual,
  getCreditsForProduct,
  monthlyToMonthlyOrAnnual,
} from '@/server/helpers/payments';
import { TRPCError } from '@trpc/server';

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

      const currentPrice = await stripe.prices.retrieve(
        stripeSubscription.items.data[0]?.price.id as string
      );
      const newPrice = await stripe.prices.retrieve(selectedPriceId);

      if (!currentPrice || !newPrice) {
        throw new TRPCError({ message: 'Could not find price', code: 'NOT_FOUND' });
      }

      const currentPriceAmount = (currentPrice.unit_amount as number) / 100;
      const newPriceAmount = (newPrice.unit_amount as number) / 100;
      const currentPriceType = currentPrice?.recurring?.interval || 'undefined';
      const newPriceType = newPrice?.recurring?.interval || 'undefined';

      const subscriptionChangeType = `${currentPriceType}To${newPriceType
        .charAt(0)
        .toUpperCase()}${newPriceType.slice(1)}`;
      console.log(subscriptionChangeType);
      switch (subscriptionChangeType) {
        case 'monthToMonth':
        case 'monthToYear':
          const monthlySubscriptionUpdated = monthlyToMonthlyOrAnnual(
            customerId,
            subscriptionId,
            selectedPriceId,
            stripeSubscription,
            swapImmediately,
            credits,
            currentProductCredits,
            currentPriceAmount,
            newPriceAmount
          );
          return monthlySubscriptionUpdated;
          break;
        case 'yearToYear':
          const annualSubscriptionUpdated = annualToAnnual(
            customerId,
            subscriptionId,
            selectedPriceId,
            stripeSubscription,
            swapImmediately,
            credits,
            currentProductCredits,
            currentPriceAmount,
            newPriceAmount
          );
          return annualSubscriptionUpdated;
          break;
        case 'yearToMonth':
          throw new Error('Reach out to us and we can help you with this');
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
