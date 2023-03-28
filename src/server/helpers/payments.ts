import { env } from '@/env.mjs';
import { getProrationAmountsAnnual, getProrationAmountsMonthly } from '@/utils/payments';
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

export async function monthlyToMonthlyOrAnnual(
  customerId: string,
  subscriptionId: string,
  selectedPriceId: string,
  stripeSubscription: Stripe.Response<Stripe.Subscription>,
  swapImmediately: boolean,
  credits: number,
  currentProductCredits: number,
  currentPriceAmount: number,
  newPriceAmount: number
) {
  // only prorate if swapping immediately
  if (swapImmediately) {
    // Custom amount for the upgrade
    const amounts = getProrationAmountsMonthly(
      credits,
      currentProductCredits,
      currentPriceAmount,
      newPriceAmount
    );
    // Create the negative invoice item, * 100 because Stripe expects cents
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      amount: -amounts.proration * 100,
      currency: 'usd',
      description: 'Discount for subscription upgrade',
      subscription: subscriptionId,
    });

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
        price: selectedPriceId,
      },
    ],
  });

  if (!stripeSubscriptionUpdated) {
    throw new Error('Could not update subscription');
  }

  return stripeSubscriptionUpdated;
}

export async function annualToAnnual(
  customerId: string,
  subscriptionId: string,
  selectedPriceId: string,
  stripeSubscription: Stripe.Response<Stripe.Subscription>,
  swapImmediately: boolean,
  credits: number,
  currentProductCredits: number,
  currentPriceAmount: number,
  newPriceAmount: number
) {
  // only prorate if swapping immediately
  if (swapImmediately) {
    // Custom amount for the upgrade
    const amounts = getProrationAmountsAnnual(
      credits,
      currentProductCredits,
      currentPriceAmount,
      stripeSubscription.current_period_end,
      newPriceAmount
    );
    // Create the negative invoice item, * 100 because Stripe expects cents
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      amount: -amounts.proration * 100,
      currency: 'usd',
      description: 'Discount for subscription upgrade',
      subscription: subscriptionId,
    });

    if (!invoiceItem) {
      throw new Error('Could not update subscription');
    }
  }

  // Update to the new subscription
  const subscriptionItemId = stripeSubscription?.items?.data?.[0]?.id;

  const stripeSubscriptionUpdated = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
    proration_behavior: 'none',
    billing_cycle_anchor: swapImmediately ? 'unchanged' : 'unchanged',
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

export async function annualToMonthly(
  subscriptionId: string,
  selectedPriceId: string,
  stripeSubscription: Stripe.Response<Stripe.Subscription>
) {
  // Update to the new subscription
  const subscriptionItemId = stripeSubscription?.items?.data?.[0]?.id;

  const stripeSubscriptionUpdated = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
    proration_behavior: 'none',
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
