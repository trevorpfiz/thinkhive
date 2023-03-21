import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const userRouter = createTRPCRouter({
  subscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma, stripe } = ctx;

    if (!session.user?.id) {
      throw new Error('Not authenticated');
    }

    const data = await prisma.user.findUnique({
      where: {
        id: session.user?.id,
      },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionStatus: true,
      },
    });

    if (!data) {
      throw new Error('Could not find user');
    }

    const { data: prices } = await stripe.prices.list();

    const customer = await stripe.customers.retrieve(data.stripeCustomerId, {
      expand: ['subscriptions'],
    });

    return {
      subscriptionStatus: data.stripeSubscriptionStatus,
      prices,
      customer,
    };
  }),
});
