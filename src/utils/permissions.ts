import { env } from '@/env.mjs';
import { prisma } from '@/server/db';

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
      return 2;
    case env.STRIPE_COMMUNITY_PRODUCT_ID:
      return 3;
    case env.STRIPE_ENTERPRISE_PRODUCT_ID:
      return 4;
    default:
      return 1;
  }
}
