import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getCreditsForProduct } from '@/server/helpers/payments';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key) return new Response('No key provided', { status: 400 });

  if (key !== '3f6b4065-bf9f-4bd4-8423-1a4ea4386cb3') {
    return new Response('Page not found', { status: 404 });
  }

  const now = new Date();
  const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));

  const users = await prisma.user.findMany({
    where: {
      last_reset: {
        lte: oneMonthAgo,
      },
      stripeSubscription: {
        some: {
          status: 'active',
        },
      },
    },
    select: {
      id: true,
      stripeSubscription: {
        where: {
          status: 'active',
        },
        select: {
          price: {
            select: {
              product: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!users || users.length === 0) {
    return new NextResponse('No users to reset', {
      status: 200,
    });
  }

  // Reset credits and usage for each user with an active subscription and last_reset older than one month ago
  const updatedUsers = await prisma.$transaction(
    users.map((user) =>
      prisma.user.update({
        where: { id: user.id },
        data: {
          credits: {
            set: getCreditsForProduct(user.stripeSubscription[0]?.price?.product.id as string),
          },
          uploadUsage: { set: 0 },
          questionUsage: { set: 0 },
          responseUsage: { set: 0 },
          last_reset: { set: now },
        },
      })
    )
  );

  const updatedUserCount = updatedUsers.filter((result) => result !== null).length;

  return new NextResponse(`${updatedUserCount} users updated`, {
    status: 200,
  });
}
