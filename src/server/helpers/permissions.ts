import { env } from '@/env.mjs';
import { prisma } from '@/server/db';
import { TRPCError } from '@trpc/server';

export async function hasEnoughCredits(userId: string, tokens: number) {
  // check if user has enough credits and perform the transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Decrement credits from user.
    const user = await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        credits: {
          decrement: tokens / 1000,
        },
      },
    });

    // 2. Verify that the user's credits didn't go below zero.
    if (user.credits < 0) {
      throw new TRPCError({ message: `Not enough credits.`, code: 'FORBIDDEN' });
    }

    return user;
  });
}

export async function getSubscriptionProductId(userId: string) {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      user_id: userId,
      status: {
        in: ['trialing', 'active'],
      },
    },
    include: {
      price: {
        include: {
          product: true,
        },
      },
    },
  });

  if (activeSubscriptions.length === 0) {
    return null;
  }

  const subscription = activeSubscriptions[0];
  return subscription?.price?.product.id;
}

export function getMaxExpertsForTier(tier: string | null | undefined) {
  switch (tier) {
    case env.STRIPE_HANGOUT_PRODUCT_ID:
      return 20;
    case env.STRIPE_COMMUNITY_PRODUCT_ID:
      return 20;
    case env.STRIPE_ENTERPRISE_PRODUCT_ID:
      return 20;
    default:
      return 20; // 3
  }
}
