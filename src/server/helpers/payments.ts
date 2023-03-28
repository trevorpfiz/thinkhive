import { env } from '@/env.mjs';
import { getProrationAmountMonthly } from '@/utils/payments';
import type Stripe from 'stripe';

import { stripe } from '../stripe/client';

export function getCreditsForProduct(productId: string) {
  switch (productId) {
    case env.STRIPE_HANGOUT_PRODUCT_ID:
      return 5000;
    case env.STRIPE_COMMUNITY_PRODUCT_ID:
      return 25000;
    case env.STRIPE_ENTERPRISE_PRODUCT_ID:
      return 100000;
    default:
      return 0;
  }
}

export async function monthlyToMonthlyUpdate(
  customerId: string,
  subscriptionId: string,
  selectedPriceId: string,
  stripeSubscription: Stripe.Response<Stripe.Subscription>,
  swapImmediately: boolean,
  credits: number,
  currentProductCredits: number,
  currentPriceAmount: number
) {
  // only prorate if swapping immediately
  if (swapImmediately) {
    // Custom amount for the upgrade, * 100 because Stripe expects cents
    const prorationAmount =
      getProrationAmountMonthly(credits, currentProductCredits, currentPriceAmount) * 100;
    // Create the negative invoice item
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      amount: -prorationAmount,
      currency: 'usd',
      description: 'Discount for subscription upgrade',
      subscription: subscriptionId,
    });
    console.log(invoiceItem);

    if (!invoiceItem) {
      throw new Error('Could not update subscription');
    }
  }

  console.log(selectedPriceId);
  // Update to the new subscription
  const subscriptionItemId = stripeSubscription?.items?.data?.[0]?.id;

  const stripeSubscriptionUpdated = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
    proration_behavior: 'none',
    billing_cycle_anchor: swapImmediately ? 'now' : 'unchanged',
    items: [
      {
        id: subscriptionItemId,
        price: selectedPriceId,
      },
    ],
  });

  if (!stripeSubscriptionUpdated) {
    throw new Error('Could not update subscription');
  }

  return stripeSubscriptionUpdated;
}
