/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { buffer } from 'micro';
import { env } from '~/env.mjs';
import { prisma } from '~/server/db';
import { stripe } from '~/server/stripe/client';
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handlePaymentIntentPaymentFailed,
  manageSubscriptionStatusChange,
  upsertPrice,
  upsertProduct,
} from '~/server/stripe/stripe-webhook-handlers';

import type { NextApiRequest, NextApiResponse } from 'next';
import type Stripe from 'stripe';

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid', // usage query for monthly subscriptions
  'invoice.payment_failed', // used to reset a failed subscription renewal
  'payment_intent.payment_failed', // used to reset invoice items
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (!sig || !webhookSecret) return;
      event = stripe.webhooks.constructEvent(buf, sig as string, webhookSecret);
    } catch (err: any) {
      console.log(`❌ Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (relevantEvents.has(event.type)) {
      try {
        // Handle the event
        switch (event.type) {
          case 'product.created':
          case 'product.updated':
            await upsertProduct({
              event,
              prisma,
            });
            break;
          case 'price.created':
          case 'price.updated':
            await upsertPrice({
              event,
              prisma,
            });
            break;
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            await manageSubscriptionStatusChange({
              event,
              prisma,
              stripe,
            });
            break;
          case 'checkout.session.completed':
            await handleCheckoutSessionCompleted({
              event,
              prisma,
              stripe,
            });
            break;
          case 'invoice.paid':
            await handleInvoicePaid({
              event,
              prisma,
              stripe,
            });
            break;
          case 'invoice.payment_failed':
            await handleInvoicePaymentFailed({
              event,
              prisma,
              stripe,
            });
            break;
          case 'payment_intent.payment_failed':
            await handlePaymentIntentPaymentFailed({
              event,
              prisma,
              stripe,
            });
            break;
          default:
            throw new Error('Unhandled relevant event!');
        }

        // record the event in the database
        await prisma.stripeEvent.create({
          data: {
            id: event.id,
            type: event.type,
            object: event.object,
            api_version: event.api_version,
            account: event.account,
            created: new Date(event.created * 1000), // convert to milliseconds
            data: {
              object: event.data.object,
              previous_attributes: event.data.previous_attributes,
            },
            livemode: event.livemode,
            pending_webhooks: event.pending_webhooks,
            request: {
              id: event.request?.id,
              idempotency_key: event.request?.idempotency_key,
            },
          },
        });
      } catch (error) {
        console.log(error);
        return res.status(400).send('Webhook error: "Webhook handler failed. View logs."');
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
