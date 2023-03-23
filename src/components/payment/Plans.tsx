import { useMemo, useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { SubscribeButton } from './SubscribeButton';
import type { Product, Price, Prisma } from '@prisma/client';
import { api } from '@/utils/api';
import LoadingBars from '../ui/LoadingBars';
import { ManageBilling } from './ManageBilling';

const frequencies: Frequency[] = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'annual', label: 'Annually', priceSuffix: '/year' },
];

interface Frequency {
  value: string;
  label: string;
  priceSuffix: string;
}

interface Interval {
  monthly: string;
  annual: string;
}

interface Tier {
  name: string;
  id: string;
  price: {
    monthly: {
      amount: number;
      priceId: string | undefined;
    };
    annual: {
      amount: number;
      priceId: string | undefined;
    };
  };
  description: string;
  features: string[];
  isSubscribedPrice: {
    monthly: boolean;
    annual: boolean;
  };
  isSubscribedProduct: boolean;
}

interface ProductWithPrice extends Product {
  Price: Price[];
}

interface Metadata extends Prisma.JsonObject {
  index?: string;
  feature_1?: string;
  feature_2?: string;
  feature_3?: string;
  feature_4?: string;
}

function createTiers(products: ProductWithPrice[], subscriptionPriceId: string) {
  // Sort products by index
  return products
    .sort(
      (a, b) =>
        parseInt((a?.metadata as Metadata).index || '0', 10) -
        parseInt((b?.metadata as Metadata).index || '0', 10)
    )
    .map((product) => {
      const monthlyPrice = product.Price.find((price) => price.interval === 'month');
      const annualPrice = product.Price.find((price) => price.interval === 'year');

      // Create features from product metadata
      const features = [];
      let i = 1;
      const metadata = product?.metadata as Metadata;
      while (metadata?.[`feature_${i}`]) {
        features.push(metadata[`feature_${i}`] as string);
        i++;
      }

      // Create tiers from products and prices
      return {
        name: product.name || '',
        id: product.id,
        price: {
          monthly: {
            amount: monthlyPrice?.unit_amount ?? 0,
            priceId: monthlyPrice?.id,
          },
          annual: {
            amount: annualPrice?.unit_amount ?? 0,
            priceId: annualPrice?.id,
          },
        },
        description: product.description || '',
        features,
        isSubscribedPrice: {
          monthly: subscriptionPriceId === monthlyPrice?.id,
          annual: subscriptionPriceId === annualPrice?.id,
        },
        isSubscribedProduct:
          !!subscriptionPriceId && product.Price.some((price) => price.id === subscriptionPriceId),
      };
    });
}

function getSubscribedProductName(tiers: Tier[], subscriptionPriceId: string): string {
  for (const tier of tiers) {
    if (
      tier.price.monthly.priceId === subscriptionPriceId ||
      tier.price.annual.priceId === subscriptionPriceId
    ) {
      return tier.name;
    }
  }
  return '';
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Plans() {
  const { data: products, isLoading: isLoadingProducts } =
    api.stripe.getActiveProductsWithPrices.useQuery();
  const { data: stripeSubscription, isLoading: isLoadingSubscription } =
    api.user.getSubscription.useQuery();
  const subscriptionStatus = stripeSubscription?.[0]?.status;

  const [frequency, setFrequency] = useState<Frequency>(
    frequencies[0] || {
      value: 'monthly',
      label: 'Monthly',
      priceSuffix: '/month',
    }
  );

  const tiers = useMemo(() => {
    if (isLoadingProducts || isLoadingSubscription || !products) {
      return [];
    }

    const subscriptionPriceId = stripeSubscription?.[0]?.price_id;
    return createTiers(products, subscriptionPriceId ?? '');
  }, [isLoadingProducts, isLoadingSubscription, products, stripeSubscription]);

  const subscribedProductName = useMemo(() => {
    return getSubscribedProductName(tiers, stripeSubscription?.[0]?.price_id ?? '');
  }, [tiers, stripeSubscription]);

  return (
    <>
      {isLoadingProducts || isLoadingSubscription ? (
        <LoadingBars />
      ) : (
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {subscriptionStatus ? 'Manage Subscription' : 'Purchase a subscription'}
              </p>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-8 text-gray-600">
              Choose the plan that works for you.
            </p>
            {subscriptionStatus && (
              <div className="mt-8 flex flex-wrap items-center justify-around gap-4 rounded-lg bg-white p-4 shadow">
                <p className="text-xl text-gray-700">
                  Your subscription is {subscriptionStatus} for {subscribedProductName}.
                </p>
                <ManageBilling />
              </div>
            )}
            <div className="mt-16 flex justify-center">
              <RadioGroup
                value={frequency}
                onChange={setFrequency}
                className="grid grid-cols-2 gap-x-1 rounded-full bg-white p-1 text-center text-xs font-semibold leading-5 shadow"
              >
                <RadioGroup.Label className="sr-only">Payment frequency</RadioGroup.Label>
                {frequencies.map((option) => (
                  <RadioGroup.Option
                    key={option.value}
                    value={option}
                    className={({ checked }) =>
                      classNames(
                        checked ? 'bg-indigo-600 text-white' : 'text-gray-500',
                        'cursor-pointer rounded-full py-1 px-2.5'
                      )
                    }
                  >
                    <span>{option.label}</span>
                  </RadioGroup.Option>
                ))}
              </RadioGroup>
            </div>
            <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-3xl bg-white p-8 shadow ring-1 ring-gray-200 xl:p-10"
                >
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 id={tier.id} className="text-lg font-semibold leading-8 text-gray-900">
                      {tier.name}
                    </h3>
                  </div>
                  <p className="mt-4 min-h-[50px] text-sm leading-6 text-gray-600">
                    {tier.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      {tier.price[frequency?.value as keyof Interval]
                        ? `$${tier.price[frequency?.value as keyof Interval].amount / 100}`
                        : '$0'}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      {frequency?.priceSuffix}
                    </span>
                  </p>
                  <SubscribeButton
                    priceId={tier.price[frequency?.value as keyof Interval]?.priceId || ''}
                    isSubscribedPrice={
                      tier.isSubscribedPrice[frequency?.value as keyof Interval] || false
                    }
                    isSubscribedProduct={tier.isSubscribedProduct}
                    frequency={frequency?.value}
                  />
                  <ul
                    role="list"
                    className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10"
                  >
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckIcon
                          className="h-6 w-5 flex-none text-indigo-600"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}