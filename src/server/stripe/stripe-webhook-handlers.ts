import { toDateTime } from '@/utils/helpers';
import type { PrismaClient } from '@prisma/client';
import type Stripe from 'stripe';

// retrieves a Stripe customer id for a given user if it exists or creates a new one
export const getOrCreateStripeCustomerIdForUser = async ({
  stripe,
  prisma,
  userId,
}: {
  stripe: Stripe;
  prisma: PrismaClient;
  userId: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      stripeSubscription: {
        where: {
          status: 'active',
        },
      },
    },
  });

  if (!user) throw new Error('User not found');

  if (user.stripeCustomerId) {
    return {
      customerId: user.stripeCustomerId,
      activeSubscription: user.stripeSubscription[0],
    };
  }

  // create a new customer
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    // use metadata to link this Stripe customer to internal user id
    metadata: {
      userId,
    },
  });

  // update with new customer id
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeCustomerId: customer.id,
    },
    select: {
      stripeCustomerId: true,
      stripeSubscription: {
        where: {
          status: 'active',
        },
      },
    },
  });

  if (updatedUser.stripeCustomerId) {
    return {
      customerId: updatedUser.stripeCustomerId,
      subscription: updatedUser.stripeSubscription,
    };
  }
};

export const upsertProduct = async ({
  event,
  prisma,
}: {
  event: Stripe.Event;
  prisma: PrismaClient;
}) => {
  const product = event.data.object as Stripe.Product;
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? undefined,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };

  await prisma.product.upsert({
    where: {
      id: product.id,
    },
    update: productData,
    create: productData,
  });
};

export const upsertPrice = async ({
  event,
  prisma,
}: {
  event: Stripe.Event;
  prisma: PrismaClient;
}) => {
  const price = event.data.object as Stripe.Price;
  const priceData = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? undefined,
    type: price.type,
    unit_amount: price.unit_amount ?? undefined,
    interval: price.recurring?.interval,
    interval_count: price.recurring?.interval_count,
    trial_period_days: price.recurring?.trial_period_days,
    metadata: price.metadata,
  };

  await prisma.price.upsert({
    where: {
      id: price.id,
    },
    update: priceData,
    create: priceData,
  });
};

export const manageSubscriptionStatusChange = async ({
  event,
  prisma,
  stripe,
}: {
  event: Stripe.Event;
  prisma: PrismaClient;
  stripe: Stripe;
}) => {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;
  const createAction = event.type === 'customer.subscription.created';

  // Get customer's UUID from mapping table.
  const customerData = await prisma.user.findUnique({
    where: {
      stripeCustomerId: customerId,
    },
  });

  if (!customerData) throw new Error('Customer not found');

  const { id: userId } = customerData;

  const latestSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });
  // Upsert the latest status of the latestSubscription object.
  const subscriptionData = {
    id: latestSubscription.id,
    user_id: userId,
    metadata: latestSubscription.metadata,
    status: latestSubscription.status,
    price_id: latestSubscription?.items?.data[0]?.price.id,
    quantity: latestSubscription?.items?.data[0]?.quantity,
    cancel_at_period_end: latestSubscription.cancel_at_period_end,
    cancel_at: latestSubscription.cancel_at
      ? toDateTime(latestSubscription.cancel_at).toISOString()
      : null,
    canceled_at: latestSubscription.canceled_at
      ? toDateTime(latestSubscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(latestSubscription.current_period_start).toISOString(),
    current_period_end: toDateTime(subscription.current_period_end).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at ? toDateTime(subscription.ended_at).toISOString() : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end ? toDateTime(subscription.trial_end).toISOString() : null,
  };

  try {
    await prisma.subscription.upsert({
      where: {
        id: subscriptionId,
      },
      update: subscriptionData,
      create: subscriptionData,
    });
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
    throw new Error(`Failed to upsert subscription with ID ${subscriptionId}: ${error.message}`);
  }
};
