import { useMemo, useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { SubscribeButton } from './SubscribeButton';
import type { Product, Price, Prisma } from '@prisma/client';
import { api } from '@/utils/api';

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
      priceId: string;
    };
    annual: {
      amount: number;
      priceId: string;
    };
  };
  description: string;
  features: string[];
  isSubscribed: boolean;
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

function sortProductsByIndex(products: ProductWithPrice[]): ProductWithPrice[] {
  return products.sort((a, b) => {
    const aIndex = parseInt((a?.metadata as Metadata).index || '0', 10);
    const bIndex = parseInt((b?.metadata as Metadata).index || '0', 10);

    return aIndex - bIndex;
  });
}

function createFeaturesFromProduct(product: ProductWithPrice): string[] {
  const featureValues = [];
  let i = 1;
  const metadata = product?.metadata as Metadata;
  while (metadata?.[`feature_${i}`]) {
    featureValues.push(metadata?.[`feature_${i}`] as string);
    i++;
  }
  return featureValues;
}

function createTiersFromProducts(
  products: ProductWithPrice[],
  subscriptionPriceId: string
): Tier[] {
  return products.map((product) => {
    const monthlyPrice = product.Price?.find((price) => price.interval === 'month');
    const annualPrice = product.Price?.find((price) => price.interval === 'year');

    const tier: Tier = {
      name: product?.name || '',
      id: product.id,
      price: {
        monthly: monthlyPrice
          ? {
              amount: monthlyPrice.unit_amount ?? 0,
              priceId: monthlyPrice.id,
            }
          : {
              amount: 0,
              priceId: '',
            },
        annual: annualPrice
          ? {
              amount: annualPrice.unit_amount ?? 0,
              priceId: annualPrice.id,
            }
          : {
              amount: 0,
              priceId: '',
            },
      },
      description: product.description || '',
      features: createFeaturesFromProduct(product) || [],
      isSubscribed:
        !!subscriptionPriceId &&
        (subscriptionPriceId === monthlyPrice?.id || subscriptionPriceId === annualPrice?.id),
    };

    return tier;
  });
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Plans() {
  // Get products and subscription
  const { data: products, isLoading: isLoadingProducts } =
    api.stripe.getActiveProductsWithPrices.useQuery();
  const { data: stripeSubscription, isLoading: isLoadingSubscription } =
    api.user.getSubscription.useQuery();

  // Set frequency
  const [frequency, setFrequency] = useState(frequencies[0]);

  // Create tiers from products
  const tiers = useMemo(() => {
    if (isLoadingProducts || isLoadingSubscription || !products) {
      return [];
    }

    const subscriptionPriceId = stripeSubscription?.[0]?.price_id;
    return createTiersFromProducts(sortProductsByIndex(products), subscriptionPriceId ?? '');
  }, [isLoadingProducts, isLoadingSubscription, products, stripeSubscription]);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Pricing plans for teams of&nbsp;all&nbsp;sizes
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Choose an affordable plan that&apos;s packed with the best features for engaging your
          audience, creating customer loyalty, and driving sales.
        </p>
        <div className="mt-16 flex justify-center">
          <RadioGroup
            value={frequency}
            onChange={setFrequency}
            className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
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
            <div key={tier.id} className="rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10">
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
                isSubscribed={tier.isSubscribed}
              />
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
