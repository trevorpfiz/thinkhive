import { env } from '~/env.mjs';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { getCreditsForProduct } from '~/server/helpers/payments';

export const userRouter = createTRPCRouter({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;

    if (!session.user?.id) {
      throw new Error('Not authenticated');
    }

    const data = await prisma.user.findUnique({
      where: {
        id: session.user?.id,
      },
      select: {
        stripeSubscription: true,
      },
    });

    if (!data) {
      throw new Error('Could not find user');
    }

    return data.stripeSubscription;
  }),
  getActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;

    if (!session.user?.id) {
      throw new Error('Not authenticated');
    }

    const data = await prisma.user.findUnique({
      where: {
        id: session.user?.id,
      },
      select: {
        credits: true,
        stripeSubscription: {
          where: {
            status: 'active',
          },
          include: {
            price: {
              select: {
                type: true,
                unit_amount: true,
                interval: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    metadata: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!data) {
      throw new Error('Could not find user');
    }

    return { activeSubscription: data.stripeSubscription, credits: data.credits };
  }),
  getUsageStats: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;

    if (!session.user?.id) {
      throw new Error('Not authenticated');
    }

    const data = await prisma.user.findUnique({
      where: {
        id: session.user?.id,
      },
      select: {
        credits: true,
        uploadUsage: true,
        embeddingUsage: true,
        llmUsage: true,
        stripeSubscription: {
          where: {
            status: 'active',
          },
          include: {
            price: {
              select: {
                product: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!data) {
      throw new Error('Could not find user');
    }

    const uploadUsage = parseFloat((data.uploadUsage / 5 / 1000).toFixed(2));
    const messageUsage = parseFloat(((data.embeddingUsage / 5 + data.llmUsage) / 1000).toFixed(2));
    const totalCreditsUsed = parseFloat((uploadUsage + messageUsage).toFixed(2));

    return [
      {
        name: 'Plan Credits',
        stat: parseFloat(data.credits.toFixed(2)),
        limit: getCreditsForProduct(data.stripeSubscription[0]?.price?.product.id as string),
      },
      {
        name: 'Upload Usage',
        stat: uploadUsage,
        totalUsed: totalCreditsUsed,
      },
      {
        name: 'Message Usage',
        stat: messageUsage,
        totalUsed: totalCreditsUsed,
      },
    ];
  }),
  getUserCredits: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;

    if (!session.user?.id) {
      throw new Error('Not authenticated');
    }

    const data = await prisma.user.findUnique({
      where: {
        id: session.user?.id,
      },
      select: {
        credits: true,
      },
    });

    if (!data) {
      throw new Error('Could not find user');
    }

    return parseFloat(data.credits.toFixed(2));
  }),
  getAdditionalCredits: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;

    if (!session.user?.id) {
      throw new Error('Not authenticated');
    }

    const data = await prisma.user.findUnique({
      where: {
        id: session.user?.id,
      },
      select: {
        additionalCredits: true,
      },
    });

    const additionalProduct = await prisma.product.findUnique({
      where: {
        id: env.STRIPE_ADDITIONAL_PRODUCT_ID,
      },
      select: {
        Price: {
          where: {
            active: true,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!data) {
      throw new Error('Could not find user');
    }

    return {
      additionalCredits: parseFloat(data.additionalCredits.toFixed(2)),
      additionalPriceId: additionalProduct?.Price[0]?.id,
    };
  }),
});
