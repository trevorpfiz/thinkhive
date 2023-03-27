import type Stripe from 'stripe';

import { stripe } from '../stripe/client';

export async function monthlyToMonthlyUpdate(
  customerId: string,
  subscriptionId: string,
  priceId: string,
  stripeSubscription: Stripe.Response<Stripe.Subscription>,
  swapImmediately: boolean
) {
  // only prorate if swapping immediately
  if (swapImmediately) {
    // Custom amount for the upgrade
    const customAmount = 2000; //proration algo

    // Create the negative invoice item
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      amount: -customAmount,
      currency: 'usd',
      description: 'Discount for subscription upgrade',
      subscription: subscriptionId,
    });
    console.log(invoiceItem);

    if (!invoiceItem) {
      throw new Error('Could not update subscription');
    }
  }
  // Update to the new subscription
  const subscriptionItemId = stripeSubscription?.items?.data?.[0]?.id;

  const stripeSubscriptionUpdated = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
    proration_behavior: 'none',
    billing_cycle_anchor: swapImmediately ? 'now' : 'unchanged',
    items: [
      {
        id: subscriptionItemId,
        price: priceId,
      },
    ],
  });

  if (!stripeSubscriptionUpdated) {
    throw new Error('Could not update subscription');
  }

  return stripeSubscriptionUpdated;
}
