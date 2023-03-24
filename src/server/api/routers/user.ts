import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

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
        stripeSubscription: {
          where: {
            status: 'active',
          },
        },
      },
    });

    if (!data) {
      throw new Error('Could not find user');
    }

    return data.stripeSubscription;
  }),
});
