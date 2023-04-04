import { env } from '@/env.mjs';
import { prisma } from '@/server/db';
import { TRPCError } from '@trpc/server';

export async function hasEnoughCredits(userId: string, tokens: number) {
  // Find user by ID
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      credits: true,
    },
  });

  // Check if user exists
  if (!user) {
    throw new TRPCError({ message: `User not found.`, code: 'NOT_FOUND' });
  }

  // Check if user has enough credits
  const updatedCredits = user.credits - tokens / 1000;
  if (updatedCredits < 0) {
    throw new TRPCError({ message: `Not enough credits.`, code: 'FORBIDDEN' });
  }

  return updatedCredits;
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
